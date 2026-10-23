#!/usr/bin/env bash
# Playwright QE executor — runs ROSA, OSD-GCP, and general OCM UI E2E tests.
#
# Flow:
#   1) Resolve playwright.env.json from an explicit source (env var or Vault mount)
#   2) Optionally create ephemeral AWS VPC/subnets via qe-helper-scripts/create-aws-infrastructure.sh
#   3) Optionally configure ROSA OCM/account roles
#   4) Run Playwright (ROSA + OSD-GCP + any additional test dirs)
#   5) Always cleanup cloud resources on exit
#
# Local:
#   ENV_FILE=playwright.env.json SETUP_CLOUD=true ./playwright/scripts/playwright-qe-executor.sh
#
# OpenShift CI (Vault mounts JSON blob or per-key files under CREDENTIALS_DIR):
#   CREDENTIALS_DIR=/var/run/secrets/uhc-portal-playwright \
#   ./playwright/scripts/playwright-qe-executor.sh
#
# Env knobs:
#   SETUP_CLOUD=true|false        Create/cleanup ephemeral AWS VPC (default: true)
#   SETUP_GCP_CLOUD=true|false    Create/cleanup ephemeral GCP VPC + KMS (default: false)
#   SETUP_ROSA_ROLES=true|false   rosa create ocm-role / account-roles (default: follows SETUP_CLOUD)
#   STRIP_STATIC_INFRA=true       Remove QE_INFRA_REGIONS before create (default: follows SETUP_CLOUD)
#   SKIP_SQS_QUEUE / SKIP_S3_BUCKET
#   EUT=staging|production|local
#   GREP_TAGS / TEST_ARGS / WORKERS / BROWSER / PLAYWRIGHT_TRACE
#   VPC_NAME / REGION / BUILD_IDENTIFIER
#   GCP_VPC_NAME / GCP_REGION / GCP_KEY_RING_NAME / GCP_KEY_NAME / GCP_KMS_SA_ID
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

# ---------------------------------------------------------------------------
# Configuration — all overridable via environment variables.
# ---------------------------------------------------------------------------
SETUP_CLOUD="${SETUP_CLOUD:-true}"
SETUP_GCP_CLOUD="${SETUP_GCP_CLOUD:-false}"
SETUP_ROSA_ROLES="${SETUP_ROSA_ROLES:-${SETUP_CLOUD}}"
STRIP_STATIC_INFRA="${STRIP_STATIC_INFRA:-${SETUP_CLOUD}}"
SKIP_SQS_QUEUE="${SKIP_SQS_QUEUE:-false}"
SKIP_S3_BUCKET="${SKIP_S3_BUCKET:-false}"
EUT="${EUT:-staging}"
BROWSER="${BROWSER:-chromium}"
WORKERS="${WORKERS:-2}"
PLAYWRIGHT_TRACE="${PLAYWRIGHT_TRACE:-off}"
GREP_TAGS="${GREP_TAGS:-@ci|@smoke|@wizard-validation}"
TEST_ARGS="${TEST_ARGS:-playwright/e2e --grep ${GREP_TAGS}}"
CREDENTIALS_DIR="${CREDENTIALS_DIR:-/var/run/secrets/uhc-portal-playwright}"
BUILD_IDENTIFIER="${BUILD_IDENTIFIER:-${PROW_JOB_ID:-${BUILD_ID:-local-$(date +%s)}}}"

ENV_DEST="${ROOT_DIR}/playwright.env.json"
VPC_CREATED=false
GCP_VPC_CREATED=false
EXIT_CODE=""

# Export once — every function and child process sees these.
export CI=true
export BROWSER
export PLAYWRIGHT_TRACE
if [[ "${EUT}" == "local" ]]; then
  export NODE_TLS_REJECT_UNAUTHORIZED="${NODE_TLS_REJECT_UNAUTHORIZED:-0}"
fi
export PLAYWRIGHT_ENV_FILE="${ENV_DEST}"

log() { printf '==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
err() { printf 'ERROR: %s\n' "$*" >&2; }

# ---------------------------------------------------------------------------
# resolve_env_source — find the credentials file from explicit sources only.
#
# Precedence:
#   1. PLAYWRIGHT_ENV_SOURCE  (explicit path, e.g. Vault mount)
#   2. ENV_FILE               (explicit path, e.g. local dev)
#   3. CREDENTIALS_DIR/playwright.env.json  (Vault directory mount)
#
# We intentionally do NOT fall back to scanning ROOT_DIR. Credentials must
# come from an explicit, auditable source — never from the source tree.
# ---------------------------------------------------------------------------
resolve_env_source() {
  if [[ -n "${PLAYWRIGHT_ENV_SOURCE:-}" && -f "${PLAYWRIGHT_ENV_SOURCE}" ]]; then
    echo "${PLAYWRIGHT_ENV_SOURCE}"
    return
  fi
  if [[ -n "${ENV_FILE:-}" && -f "${ENV_FILE}" ]]; then
    echo "${ENV_FILE}"
    return
  fi
  if [[ -f "${CREDENTIALS_DIR}/playwright.env.json" ]]; then
    echo "${CREDENTIALS_DIR}/playwright.env.json"
    return
  fi
  return 1
}

assemble_env_from_vault_keys() {
  local dir="$1"
  local out="$2"
  if [[ ! -d "${dir}" ]]; then
    return 1
  fi
  if [[ -f "${dir}/playwright.env.json" ]]; then
    cp "${dir}/playwright.env.json" "${out}"
    return 0
  fi
  local found=false
  local f
  for f in "${dir}"/*; do
    [[ -f "${f}" ]] || continue
    found=true
    break
  done
  [[ "${found}" == true ]] || return 1

  log "Assembling env from credential files in ${dir}"
  python3 - "${dir}" "${out}" <<'PY'
import json, os, sys
src, dest = sys.argv[1], sys.argv[2]
data = {}
for name in sorted(os.listdir(src)):
    path = os.path.join(src, name)
    if not os.path.isfile(path):
        continue
    raw = open(path, "r", encoding="utf-8").read().strip()
    try:
        data[name] = json.loads(raw)
    except json.JSONDecodeError:
        data[name] = raw
with open(dest, "w", encoding="utf-8") as fh:
    json.dump(data, fh, indent=2)
    fh.write("\n")
PY
}

# ---------------------------------------------------------------------------
# prepare_env_file — copy source → run file, then apply mutations in one pass.
# ---------------------------------------------------------------------------
prepare_env_file() {
  local src=""

  if src="$(resolve_env_source)"; then
    log "Using env source: ${src}"
    local src_real dest_real
    src_real="$(cd "$(dirname "${src}")" && pwd)/$(basename "${src}")"
    dest_real="$(cd "$(dirname "${ENV_DEST}")" && pwd)/$(basename "${ENV_DEST}")"
    if [[ "${src_real}" != "${dest_real}" ]]; then
      cp "${src}" "${ENV_DEST}"
    fi
  elif assemble_env_from_vault_keys "${CREDENTIALS_DIR}" "${ENV_DEST}"; then
    log "Assembled env from Vault key files at ${CREDENTIALS_DIR}"
  else
    err "No playwright.env.json found."
    err "Set ENV_FILE or PLAYWRIGHT_ENV_SOURCE, or mount Vault credentials at CREDENTIALS_DIR (${CREDENTIALS_DIR})."
    exit 1
  fi

  if ! jq empty "${ENV_DEST}" >/dev/null 2>&1; then
    err "playwright.env.json is not valid JSON"
    exit 1
  fi

  # Determine BASE_URL from EUT.
  local base_url
  case "${EUT}" in
    production) base_url="https://console.redhat.com/openshift/" ;;
    local)      base_url="https://prod.foo.redhat.com:1337/openshift/" ;;
    staging|*)  base_url="https://console.dev.redhat.com/openshift/" ;;
  esac

  # Single jq pass: inject BUILD_IDENTIFIER, set BASE_URL, optionally strip infra keys.
  local jq_filter=". + {BUILD_IDENTIFIER: \$bid} | .BASE_URL = \$url"
  if [[ "${STRIP_STATIC_INFRA}" == "true" ]]; then
    log "Stripping static QE_INFRA_REGIONS (ephemeral VPC will be created)"
    jq_filter="${jq_filter} | del(.QE_INFRA_REGIONS, .QE_SPOT_INTERRUPTION_QUEUE_URL, .QE_LOG_FORWARDING_S3_BUCKET_NAME, .QE_LOG_FORWARDING_S3_BUCKET_PREFIX)"
  fi

  jq --arg bid "${BUILD_IDENTIFIER}" --arg url "${base_url}" \
    "${jq_filter}" "${ENV_DEST}" > "${ENV_DEST}.tmp" \
    && mv "${ENV_DEST}.tmp" "${ENV_DEST}"

  chmod 600 "${ENV_DEST}" || true
}

# ---------------------------------------------------------------------------
# Cloud / ROSA setup.
# ---------------------------------------------------------------------------
configure_aws_cli() {
  local access_key secret_key region

  local was_tracing=false
  [[ $- == *x* ]] && was_tracing=true
  set +x
  access_key="$(jq -r '.QE_AWS_ACCESS_KEY_ID // empty' "${ENV_DEST}")"
  secret_key="$(jq -r '.QE_AWS_ACCESS_KEY_SECRET // empty' "${ENV_DEST}")"
  region="$(jq -r '.QE_AWS_REGION // "us-west-2"' "${ENV_DEST}")"
  REGION="${REGION:-${region}}"
  export AWS_ACCESS_KEY_ID="${access_key}"
  export AWS_SECRET_ACCESS_KEY="${secret_key}"
  export AWS_DEFAULT_REGION="${REGION}"
  export AWS_REGION="${REGION}"
  [[ "${was_tracing}" == true ]] && set -x

  if [[ -z "${access_key}" || -z "${secret_key}" ]]; then
    err "QE_AWS_ACCESS_KEY_ID / QE_AWS_ACCESS_KEY_SECRET missing in env file"
    exit 1
  fi
  if ! command -v aws >/dev/null 2>&1; then
    err "aws CLI not found (required for SETUP_CLOUD)"
    exit 1
  fi

  log "Configuring AWS CLI for region ${REGION}"
  if aws sts get-caller-identity >/dev/null 2>&1; then
    log "AWS authentication successful"
  else
    warn "AWS STS check failed; continuing"
  fi
}

setup_cloud_resources() {
  local region vpc_name
  region="${REGION:-$(jq -r '.QE_AWS_REGION // "us-west-2"' "${ENV_DEST}")}"
  vpc_name="${VPC_NAME:-playwright-ocmui-${BUILD_IDENTIFIER}}"
  vpc_name="$(echo "${vpc_name}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g; s/--*/-/g; s/^-//; s/-$//' | cut -c1-60)"
  VPC_NAME="${vpc_name}"
  REGION="${region}"

  local args=(--region "${REGION}" --vpc-name "${VPC_NAME}")
  [[ "${SKIP_SQS_QUEUE}" == "true" ]] && args+=(--skip-sqs-queue)
  [[ "${SKIP_S3_BUCKET}" == "true" ]] && args+=(--skip-s3-bucket)

  log "Creating ephemeral VPC '${VPC_NAME}' in ${REGION}"
  if "${ROOT_DIR}/qe-helper-scripts/create-aws-infrastructure.sh" "${args[@]}"; then
    VPC_CREATED=true
    log "VPC infrastructure ready; QE_INFRA_REGIONS written to ${ENV_DEST}"
  else
    err "VPC infrastructure setup failed"
    exit 1
  fi
}

setup_rosa_roles() {
  if ! command -v rosa >/dev/null 2>&1; then
    warn "rosa CLI not found; skipping ROSA role setup"
    return 0
  fi

  local rosa_env client_id client_secret ocm_prefix account_prefix
  if [[ "${EUT}" == "production" ]]; then
    rosa_env="production"
  else
    rosa_env="staging"
  fi

  local was_tracing=false
  [[ $- == *x* ]] && was_tracing=true
  set +x
  client_id="$(jq -r '.QE_ORGADMIN_CLIENT_ID // empty' "${ENV_DEST}")"
  client_secret="$(jq -r '.QE_ORGADMIN_CLIENT_SECRET // empty' "${ENV_DEST}")"
  ocm_prefix="$(jq -r '.QE_OCM_ROLE_PREFIX // "ocm-role"' "${ENV_DEST}")"
  account_prefix="$(jq -r '.QE_ACCOUNT_ROLE_PREFIX // empty' "${ENV_DEST}")"
  [[ "${was_tracing}" == true ]] && set -x

  if [[ -z "${client_id}" || -z "${client_secret}" ]]; then
    warn "QE_ORGADMIN_CLIENT_ID/SECRET missing; skipping ROSA role setup"
    return 0
  fi

  log "ROSA login (env=${rosa_env})"
  set +x
  if ! rosa login --client-id "${client_id}" --client-secret "${client_secret}" --env "${rosa_env}" >/dev/null 2>&1; then
    [[ "${was_tracing}" == true ]] && set -x
    warn "ROSA login failed; continuing"
  else
    [[ "${was_tracing}" == true ]] && set -x
    log "ROSA login successful"
  fi

  local linked_ocmrole
  linked_ocmrole="$(rosa list ocm-roles 2>/dev/null | awk '$3 == "Yes" { print $2 }' || true)"
  if [[ -n "${linked_ocmrole}" ]]; then
    log "Unlinking existing OCM role"
    rosa unlink ocm-role --role-arn "${linked_ocmrole}" -y >/dev/null 2>&1 || warn "Failed to unlink OCM role"
  fi

  log "Creating OCM roles prefix=${ocm_prefix}"
  rosa create ocm-role --prefix "${ocm_prefix}" --mode auto --admin -y >/dev/null 2>&1 \
    || warn "OCM role creation completed with warnings"

  if [[ -n "${account_prefix}" ]]; then
    log "Creating account roles prefix=${account_prefix}"
    rosa create account-roles --prefix "${account_prefix}" --mode auto -y >/dev/null 2>&1 \
      || warn "Account roles creation completed with warnings"
  fi

  # --- User role: must be linked to the *test user*, not the service account. #
  # The service-account session (--client-id) created OCM + account roles above.
  # The user role must belong to the Red Hat user who runs the Playwright tests
  # (e.g. qe-test-user), so we re-login with the offline token first.
  # -------------------------------------------------------------------------- #
  local user_prefix offline_token
  user_prefix="$(jq -r '.QE_USER_ROLE_PREFIX // empty' "${ENV_DEST}")"
  set +x
  offline_token="$(jq -r '.QE_ORGADMIN_REFRESH_TOKEN // empty' "${ENV_DEST}")"
  [[ "${was_tracing}" == true ]] && set -x

  if [[ -n "${user_prefix}" && -n "${offline_token}" ]]; then
    log "Re-login as test user (offline token) for user-role setup"
    set +x
    if rosa login --token "${offline_token}" --env "${rosa_env}" >/dev/null 2>&1; then
      [[ "${was_tracing}" == true ]] && set -x
      log "Test-user ROSA login successful"

      local linked_userrole
      linked_userrole="$(rosa list user-roles 2>/dev/null | awk '$3 == "Yes" { print $2 }' || true)"
      if [[ -z "${linked_userrole}" ]]; then
        log "Creating and linking user role prefix=${user_prefix}"
        rosa create user-role --prefix "${user_prefix}" --mode auto -y >/dev/null 2>&1 \
          || warn "User role creation completed with warnings"
      else
        log "User role already linked: ${linked_userrole}"
      fi
    else
      [[ "${was_tracing}" == true ]] && set -x
      warn "Test-user ROSA login failed (offline token); user role NOT created"
    fi
  elif [[ -n "${user_prefix}" ]]; then
    warn "QE_ORGADMIN_REFRESH_TOKEN missing; cannot create user role for test user"
  fi
  log "ROSA pre-config done"
}

# ---------------------------------------------------------------------------
# GCP cloud setup / teardown.
# ---------------------------------------------------------------------------
configure_gcloud() {
  if ! command -v gcloud >/dev/null 2>&1; then
    err "gcloud CLI not found (required for SETUP_GCP_CLOUD)"
    exit 1
  fi

  local sa_key_json project_id client_email
  sa_key_json="$(jq -r '.QE_GCP_OSDCCSADMIN_JSON // empty' "${ENV_DEST}")"

  if [[ -z "${sa_key_json}" ]]; then
    err "QE_GCP_OSDCCSADMIN_JSON missing in env file"
    exit 1
  fi

  local sa_key_file
  sa_key_file="$(mktemp)"
  chmod 600 "${sa_key_file}"

  # QE_GCP_OSDCCSADMIN_JSON may be a JSON string (double-encoded) or an object.
  echo "${sa_key_json}" | jq -r 'if type == "string" then fromjson else . end' > "${sa_key_file}"

  project_id="$(jq -r '.project_id // empty' "${sa_key_file}")"
  client_email="$(jq -r '.client_email // empty' "${sa_key_file}")"

  if [[ -z "${project_id}" || -z "${client_email}" ]]; then
    err "QE_GCP_OSDCCSADMIN_JSON is missing project_id or client_email"
    rm -f "${sa_key_file}"
    exit 1
  fi

  GCP_PROJECT_ID="${project_id}"
  export GCP_PROJECT_ID
  export CLOUDSDK_CORE_DISABLE_PROMPTS=1

  log "Authenticating gcloud as ${client_email} (project=${project_id})"
  gcloud auth activate-service-account "${client_email}" \
    --key-file="${sa_key_file}" \
    --project="${project_id}"
  gcloud config set project "${project_id}"

  rm -f "${sa_key_file}"

  if gcloud projects describe "${project_id}" >/dev/null 2>&1; then
    log "GCP authentication successful"
  else
    warn "GCP project describe failed; continuing"
  fi
}

setup_gcp_resources() {
  local gcp_region gcp_vpc_name
  gcp_region="${GCP_REGION:-${REGION:-us-central1}}"
  gcp_vpc_name="${GCP_VPC_NAME:-ocmui-gcp-${BUILD_IDENTIFIER}}"
  gcp_vpc_name="$(echo "${gcp_vpc_name}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g; s/--*/-/g; s/^-//; s/-$//' | cut -c1-50 | sed 's/-$//')"

  GCP_VPC_NAME="${gcp_vpc_name}"
  GCP_REGION="${gcp_region}"

  local args=(
    --project "${GCP_PROJECT_ID}"
    --vpc-name "${GCP_VPC_NAME}"
    --region "${GCP_REGION}"
  )
  [[ -n "${GCP_KEY_RING_NAME:-}" ]] && args+=(--key-ring-name "${GCP_KEY_RING_NAME}")
  [[ -n "${GCP_KEY_NAME:-}" ]]      && args+=(--key-name "${GCP_KEY_NAME}")
  [[ -n "${GCP_KMS_SA_ID:-}" ]]     && args+=(--kms-sa-id "${GCP_KMS_SA_ID}")

  log "Creating ephemeral GCP VPC '${GCP_VPC_NAME}' in ${GCP_REGION}"
  if "${ROOT_DIR}/qe-helper-scripts/create-gcp-infrastructure.sh" "${args[@]}"; then
    GCP_VPC_CREATED=true
    log "GCP infrastructure ready; QE_INFRA_GCP written to ${ENV_DEST}"
  else
    err "GCP infrastructure setup failed"
    exit 1
  fi
}

cleanup_gcp_resources() {
  if [[ "${SETUP_GCP_CLOUD}" != "true" ]]; then
    return 0
  fi
  if [[ "${GCP_VPC_CREATED}" != "true" && -z "${GCP_VPC_NAME:-}" ]]; then
    return 0
  fi

  log "Cleaning up GCP cloud resources (GCP_VPC_NAME=${GCP_VPC_NAME:-unknown})"
  local args=(
    --project "${GCP_PROJECT_ID:-unknown}"
    --vpc-name "${GCP_VPC_NAME}"
    --cleanup
  )
  [[ -n "${GCP_REGION:-}" ]] && args+=(--region "${GCP_REGION}")
  "${ROOT_DIR}/qe-helper-scripts/create-gcp-infrastructure.sh" "${args[@]}" \
    || warn "GCP cleanup reported errors (continuing)"
}

# ---------------------------------------------------------------------------
# Test execution.
# ---------------------------------------------------------------------------
run_playwright() {
  mkdir -p "${ROOT_DIR}/playwright-artifacts/results" "${ROOT_DIR}/playwright-artifacts/reports"

  log "Running Playwright: ${TEST_ARGS} --project=${BROWSER} --workers=${WORKERS}"
  # shellcheck disable=SC2086
  npx playwright test ${TEST_ARGS} --project="${BROWSER}" --workers="${WORKERS}"
}

# ---------------------------------------------------------------------------
# Cleanup — runs on every exit (success or failure).
# ---------------------------------------------------------------------------
copy_artifacts() {
  if [[ -n "${ARTIFACT_DIR:-}" && -d "${ROOT_DIR}/playwright-artifacts" ]]; then
    local art_real root_art_real
    art_real="$(cd "${ARTIFACT_DIR}" 2>/dev/null && pwd || true)"
    root_art_real="$(cd "${ROOT_DIR}/playwright-artifacts" && pwd)"
    if [[ -n "${art_real}" && "${art_real}" != "${root_art_real}" ]]; then
      log "Copying playwright-artifacts → ${ARTIFACT_DIR}"
      mkdir -p "${ARTIFACT_DIR}"
      cp -a "${ROOT_DIR}/playwright-artifacts/." "${ARTIFACT_DIR}/" || warn "Artifact copy failed"
    fi
  fi
  if [[ -n "${SHARED_DIR:-}" && -f "${ENV_DEST}" ]]; then
    cp "${ENV_DEST}" "${SHARED_DIR}/playwright.env.json" || true
    chmod 600 "${SHARED_DIR}/playwright.env.json" || true
  fi
}

cleanup_cloud_resources() {
  if [[ "${SETUP_CLOUD}" != "true" ]]; then
    return 0
  fi
  if [[ "${VPC_CREATED}" != "true" && -z "${VPC_NAME:-}" ]]; then
    return 0
  fi
  log "Cleaning up AWS cloud resources (VPC_NAME=${VPC_NAME:-unknown})"
  local args=(--cleanup)
  [[ -n "${REGION:-}" ]] && args+=(--region "${REGION}")
  [[ -n "${VPC_NAME:-}" ]] && args+=(--vpc-name "${VPC_NAME}")
  [[ "${SKIP_SQS_QUEUE}" == "true" ]] && args+=(--skip-sqs-queue)
  [[ "${SKIP_S3_BUCKET}" == "true" ]] && args+=(--skip-s3-bucket)
  "${ROOT_DIR}/qe-helper-scripts/create-aws-infrastructure.sh" "${args[@]}" \
    || warn "VPC cleanup reported errors (continuing)"
}

on_exit() {
  local rc=$?
  set +e
  copy_artifacts
  cleanup_cloud_resources
  cleanup_gcp_resources
  exit "${EXIT_CODE:-${rc}}"
}
trap on_exit EXIT

# ---------------------------------------------------------------------------
# Main.
# ---------------------------------------------------------------------------
log "Playwright QE executor starting (SETUP_CLOUD=${SETUP_CLOUD}, SETUP_GCP_CLOUD=${SETUP_GCP_CLOUD}, EUT=${EUT}, BUILD_IDENTIFIER=${BUILD_IDENTIFIER})"
prepare_env_file

if [[ "${SETUP_CLOUD}" == "true" ]]; then
  configure_aws_cli
  setup_cloud_resources
fi

if [[ "${SETUP_GCP_CLOUD}" == "true" ]]; then
  configure_gcloud
  setup_gcp_resources
fi

if [[ "${SETUP_ROSA_ROLES}" == "true" ]]; then
  setup_rosa_roles
fi

set +e
run_playwright
EXIT_CODE=$?
set -e

if [[ "${EXIT_CODE}" -eq 0 ]]; then
  log "Playwright finished successfully"
else
  warn "Playwright finished with exit code ${EXIT_CODE}"
fi
exit "${EXIT_CODE}"
