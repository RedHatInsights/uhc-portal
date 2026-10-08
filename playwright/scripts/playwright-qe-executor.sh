#!/usr/bin/env bash
# Playwright QE executor — runs ROSA, OSD-GCP, and general OCM UI E2E tests.
#
# Execution models:
#
#   3-step Prow model (recommended for CI — set EXECUTOR_MODE per step):
#     Step 1  EXECUTOR_MODE=setup   — resolve credentials, create AWS/GCP infra + ROSA roles,
#                                     write resource state to SHARED_DIR.
#     Step 2  EXECUTOR_MODE=run     — run Playwright tests using env from SHARED_DIR.
#     Step 3  EXECUTOR_MODE=cleanup — tear down all cloud resources using state from SHARED_DIR.
#                                     Runs even if the run step is killed or evicted.
#
#   Single-step model (local dev / backward compat):
#     EXECUTOR_MODE=all (default) — full sequence with exit-trap cleanup.
#
# Local:
#   ENV_FILE=playwright.env.json SETUP_CLOUD=true ./playwright/scripts/playwright-qe-executor.sh
#
# OpenShift CI (Vault mounts JSON blob or per-key files under CREDENTIALS_DIR):
#   CREDENTIALS_DIR=/var/run/secrets/uhc-portal-playwright \
#   ./playwright/scripts/playwright-qe-executor.sh
#
# Env knobs:
#   EXECUTOR_MODE=all|setup|run|cleanup  Execution mode (default: all)
#   SETUP_CLOUD=true|false        Create/cleanup ephemeral AWS VPC (default: true)
#   SETUP_GCP_CLOUD=true|false    Create/cleanup ephemeral GCP VPC + KMS (default: false)
#   SETUP_ROSA_ROLES=true|false   rosa create ocm-role / account-roles (default: follows SETUP_CLOUD)
#   STRIP_STATIC_INFRA=true       Remove QE_INFRA_REGIONS before create (default: follows SETUP_CLOUD)
#   SKIP_SQS_QUEUE / SKIP_S3_BUCKET
#   EUT=staging|production|local
#   VERSION=4.x                  OCP version for rosa create account-roles (default: ROSA current default)
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
# Execution mode:
#   all     — legacy single-step (local dev + backward compat): create infra, run tests, cleanup via exit trap.
#   setup   — Prow step 1: create infra + roles, write state to SHARED_DIR.
#   run     — Prow step 2: run Playwright using env from SHARED_DIR.
#   cleanup — Prow step 3: tear down cloud resources using state from SHARED_DIR.
EXECUTOR_MODE="${EXECUTOR_MODE:-all}"
SKIP_SQS_QUEUE="${SKIP_SQS_QUEUE:-false}"
SKIP_S3_BUCKET="${SKIP_S3_BUCKET:-false}"
EUT="${EUT:-staging}"
BROWSER="${BROWSER:-chromium}"
WORKERS="${WORKERS:-2}"
PLAYWRIGHT_TRACE="${PLAYWRIGHT_TRACE:-off}"
GREP_TAGS="${GREP_TAGS:-@ci|@smoke|@wizard-validation}"
TEST_ARGS="${TEST_ARGS:-playwright/e2e --grep ${GREP_TAGS}}"
# OCP version to target for account-role creation. When set, passed as
# --version to `rosa create account-roles` so tests run against a specific
# OpenShift version rather than the current default.
VERSION="${VERSION:-}"
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
    err "AWS STS check failed — credentials invalid or STS unreachable. Aborting before any resources are created."
    exit 1
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
  if ! rosa create ocm-role --prefix "${ocm_prefix}" --mode auto --admin -y >/dev/null 2>&1; then
    err "OCM role creation failed — OCM roles are mandatory due to tightened org policies. Aborting."
    exit 1
  fi

  if [[ -n "${account_prefix}" ]]; then
    local account_role_args=(--prefix "${account_prefix}" --mode auto -y)
    # Pass --version when VERSION is set so tests target a specific OCP version.
    [[ -n "${VERSION:-}" ]] && account_role_args+=(--version "${VERSION}")
    log "Creating account roles prefix=${account_prefix}${VERSION:+ version=${VERSION}}"
    rosa create account-roles "${account_role_args[@]}" >/dev/null 2>&1 \
      || warn "Account roles creation completed with warnings"
  fi

  # --- User role --------------------------------------------------------------- #
  # Uses the org-admin service account (QE_ORGADMIN_CLIENT_ID/SECRET) which is  #
  # already authenticated above. Skipped when QE_USER_ROLE_PREFIX is unset.     #
  # ---------------------------------------------------------------------------- #
  local user_prefix
  user_prefix="$(jq -r '.QE_USER_ROLE_PREFIX // empty' "${ENV_DEST}")"

  if [[ -n "${user_prefix}" ]]; then
    local linked_userrole
    linked_userrole="$(rosa list user-roles 2>/dev/null | awk '$3 == "Yes" { print $2 }' || true)"
    if [[ -z "${linked_userrole}" ]]; then
      log "Creating and linking user role prefix=${user_prefix}"
      rosa create user-role --prefix "${user_prefix}" --mode auto -y >/dev/null 2>&1 \
        || warn "User role creation completed with warnings"
    else
      log "User role already linked: ${linked_userrole}"
    fi
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
# copy_artifacts — copy test artifacts to ARTIFACT_DIR and write a scrubbed
# env copy to SHARED_DIR (credentials stripped to prevent secret leakage in
# the Prow artifact store). Called from run, cleanup, and all modes.
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
    # Write a scrubbed copy — strip all credential and account-identifier keys
    # so secrets are never uploaded to the Prow artifact store (Deck / GCS).
    #
    # Safe to keep: infra resource names/IDs (VPC, subnet, SQS URL, S3 bucket,
    #               role prefixes, region, BASE_URL, BUILD_IDENTIFIER).
    jq 'del(
      # Test-user credentials
      .TEST_WITHQUOTA_USER,
      .TEST_WITHQUOTA_PASSWORD,
      # AWS credentials
      .QE_AWS_ACCESS_KEY_ID,
      .QE_AWS_ACCESS_KEY_SECRET,
      # AWS account identifiers (expose account/billing IDs)
      .QE_AWS_ID,
      .QE_AWS_BILLING_ID,
      .QE_AWS_SECONDARY_BILLING_ID,
      .QE_AWS_KMS_KEY,
      .QE_AWS_IAM_USER,
      .QE_AWS_INFRA_ACCESS_IAM_ARN,
      # IAM role ARNs (contain AWS account ID)
      .QE_LOG_FORWARDING_CLOUDWATCH_ROLE_ARN,
      .QE_AUTONODE_ROLE_ARN,
      .QE_AUTONODE_ROLE_ARN_SECONDARY,
      # Org-admin credentials
      .QE_ORGADMIN_USER,
      .QE_ORGADMIN_PASSWORD,
      .QE_ORGADMIN_OFFLINE_TOKEN,
      .QE_ORGADMIN_REFRESH_TOKEN,
      .QE_ORGADMIN_CLIENT_ID,
      .QE_ORGADMIN_CLIENT_SECRET,
      # Test-user service account credentials
      .QE_TESTUSER_CLIENT_ID,
      .QE_TESTUSER_CLIENT_SECRET,
      # GCP credentials
      .QE_GCP_OSDCCSADMIN_JSON,
      .QE_GCP_KMS_SERVICE_ACCOUNT
    )' "${ENV_DEST}" > "${SHARED_DIR}/playwright.env.json" || true
    chmod 600 "${SHARED_DIR}/playwright.env.json" || true
    log "Scrubbed env file written to SHARED_DIR (credentials and account identifiers removed)"
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

# ---------------------------------------------------------------------------
# Infra state — written by `setup` mode, read by `cleanup` mode.
# Stores only resource identifiers (no credentials) so cleanup always knows
# what to delete even if it runs in a separate Prow container.
# ---------------------------------------------------------------------------
write_infra_state() {
  [[ -z "${SHARED_DIR:-}" ]] && return 0
  jq -n \
    --arg vpc_name       "${VPC_NAME:-}" \
    --arg region         "${REGION:-}" \
    --arg gcp_vpc_name   "${GCP_VPC_NAME:-}" \
    --arg gcp_region     "${GCP_REGION:-}" \
    --arg gcp_project_id "${GCP_PROJECT_ID:-}" \
    --arg setup_cloud     "${SETUP_CLOUD}" \
    --arg setup_gcp_cloud "${SETUP_GCP_CLOUD}" \
    --arg skip_sqs_queue  "${SKIP_SQS_QUEUE}" \
    --arg skip_s3_bucket  "${SKIP_S3_BUCKET}" \
    --arg build_id        "${BUILD_IDENTIFIER}" \
    '{
      VPC_NAME:         $vpc_name,
      REGION:           $region,
      GCP_VPC_NAME:     $gcp_vpc_name,
      GCP_REGION:       $gcp_region,
      GCP_PROJECT_ID:   $gcp_project_id,
      SETUP_CLOUD:      $setup_cloud,
      SETUP_GCP_CLOUD:  $setup_gcp_cloud,
      SKIP_SQS_QUEUE:   $skip_sqs_queue,
      SKIP_S3_BUCKET:   $skip_s3_bucket,
      BUILD_IDENTIFIER: $build_id
    }' > "${SHARED_DIR}/qe-infra-state.json"
  log "Infra state written to ${SHARED_DIR}/qe-infra-state.json"
}

read_infra_state() {
  local state_file="${SHARED_DIR:-}/qe-infra-state.json"
  if [[ ! -f "${state_file}" ]]; then
    warn "No infra state file at ${state_file}; cleanup may be a no-op"
    return 0
  fi
  VPC_NAME="${VPC_NAME:-$(jq -r '.VPC_NAME // empty' "${state_file}")}"
  REGION="${REGION:-$(jq -r '.REGION // empty' "${state_file}")}"
  GCP_VPC_NAME="${GCP_VPC_NAME:-$(jq -r '.GCP_VPC_NAME // empty' "${state_file}")}"
  GCP_REGION="${GCP_REGION:-$(jq -r '.GCP_REGION // empty' "${state_file}")}"
  GCP_PROJECT_ID="${GCP_PROJECT_ID:-$(jq -r '.GCP_PROJECT_ID // empty' "${state_file}")}"
  SETUP_CLOUD="${SETUP_CLOUD:-$(jq -r '.SETUP_CLOUD // "false"' "${state_file}")}"
  SETUP_GCP_CLOUD="${SETUP_GCP_CLOUD:-$(jq -r '.SETUP_GCP_CLOUD // "false"' "${state_file}")}"
  SKIP_SQS_QUEUE="${SKIP_SQS_QUEUE:-$(jq -r '.SKIP_SQS_QUEUE // "false"' "${state_file}")}"
  SKIP_S3_BUCKET="${SKIP_S3_BUCKET:-$(jq -r '.SKIP_S3_BUCKET // "false"' "${state_file}")}"
  log "Infra state loaded: VPC=${VPC_NAME:-none} REGION=${REGION:-none} GCP_VPC=${GCP_VPC_NAME:-none}"
}

on_exit() {
  local rc=$?
  set +e
  copy_artifacts
  cleanup_cloud_resources
  cleanup_gcp_resources
  exit "${EXIT_CODE:-${rc}}"
}
# Trap is only registered in `all` mode — see main below.

# ---------------------------------------------------------------------------
# Main — branches on EXECUTOR_MODE.
#
# Prow 3-step model (recommended for CI):
#   Step 1  EXECUTOR_MODE=setup   — create infra, write state to SHARED_DIR
#   Step 2  EXECUTOR_MODE=run     — run tests, read env from SHARED_DIR
#   Step 3  EXECUTOR_MODE=cleanup — tear down infra, read state from SHARED_DIR
#
# All three steps share a Prow job volume (SHARED_DIR). Because cleanup is a
# dedicated step, it runs even when the run step is killed or the pod is
# evicted — eliminating the orphaned-resource risk of the single-step model.
#
# Single-step model (local dev / backward compat):
#   EXECUTOR_MODE=all  — full sequence with exit-trap cleanup (default).
# ---------------------------------------------------------------------------
log "Playwright QE executor starting (MODE=${EXECUTOR_MODE}, SETUP_CLOUD=${SETUP_CLOUD}, SETUP_GCP_CLOUD=${SETUP_GCP_CLOUD}, EUT=${EUT}, BUILD_IDENTIFIER=${BUILD_IDENTIFIER})"

case "${EXECUTOR_MODE}" in

  # -------------------------------------------------------------------------
  # setup — Prow step 1: resolve credentials, create infra, write state.
  # No exit trap — cleanup is owned by the dedicated cleanup step.
  # -------------------------------------------------------------------------
  setup)
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

    # Write resource identifiers so the cleanup step knows what to delete.
    write_infra_state

    # Copy the full env (with credentials) to SHARED_DIR for the run step.
    # SHARED_DIR is a job-local volume — it is NOT uploaded to artifact stores.
    if [[ -n "${SHARED_DIR:-}" ]]; then
      cp "${ENV_DEST}" "${SHARED_DIR}/playwright.env.json"
      chmod 600 "${SHARED_DIR}/playwright.env.json" || true
      log "Full env written to SHARED_DIR for run step"
    fi
    ;;

  # -------------------------------------------------------------------------
  # run — Prow step 2: execute Playwright using the env from the setup step.
  # No exit trap — cleanup is owned by the dedicated cleanup step.
  # -------------------------------------------------------------------------
  run)
    # The env file from SHARED_DIR already contains QE_INFRA_REGIONS written by
    # the setup step — never strip it here or tests will have no VPC to run against.
    STRIP_STATIC_INFRA=false

    # Prefer the env written by the setup step over a direct Vault mount.
    if [[ -n "${SHARED_DIR:-}" && -f "${SHARED_DIR}/playwright.env.json" ]]; then
      PLAYWRIGHT_ENV_SOURCE="${SHARED_DIR}/playwright.env.json"
      export PLAYWRIGHT_ENV_SOURCE
      log "Using env from SHARED_DIR (written by setup step)"
    fi
    prepare_env_file

    set +e
    run_playwright
    EXIT_CODE=$?
    set -e

    copy_artifacts

    if [[ "${EXIT_CODE}" -eq 0 ]]; then
      log "Playwright finished successfully"
    else
      warn "Playwright finished with exit code ${EXIT_CODE}"
    fi
    exit "${EXIT_CODE}"
    ;;

  # -------------------------------------------------------------------------
  # cleanup — Prow step 3: tear down all cloud resources created by setup.
  # Runs unconditionally after setup+run, even if run was killed or evicted.
  # -------------------------------------------------------------------------
  cleanup)
    # Infra state was created by setup — never strip it when resolving the env file.
    STRIP_STATIC_INFRA=false

    # Load VPC_NAME / REGION / GCP_VPC_NAME from the state file written by setup.
    read_infra_state

    # Resolve credentials from the Vault mount (CREDENTIALS_DIR) in this step.
    # Required before any AWS/GCP CLI calls regardless of which cloud is active.
    prepare_env_file

    if [[ "${SETUP_CLOUD}" == "true" && -n "${VPC_NAME:-}" ]]; then
      configure_aws_cli
      VPC_CREATED=true  # signal cleanup_cloud_resources to proceed
      cleanup_cloud_resources
    else
      log "No AWS infra to clean up (SETUP_CLOUD=${SETUP_CLOUD}, VPC_NAME=${VPC_NAME:-empty})"
    fi

    if [[ "${SETUP_GCP_CLOUD}" == "true" && -n "${GCP_VPC_NAME:-}" ]]; then
      # configure_gcloud must always be called — GCP_PROJECT_ID from state is not
      # sufficient; the service account still needs to be activated for gcloud CLI.
      configure_gcloud
      GCP_VPC_CREATED=true  # signal cleanup_gcp_resources to proceed
      cleanup_gcp_resources
    else
      log "No GCP infra to clean up (SETUP_GCP_CLOUD=${SETUP_GCP_CLOUD}, GCP_VPC_NAME=${GCP_VPC_NAME:-empty})"
    fi

    copy_artifacts
    ;;

  # -------------------------------------------------------------------------
  # all — legacy single-step mode (local dev + backward compat).
  # Cleanup runs via an exit trap — best-effort only; will not run on eviction.
  # -------------------------------------------------------------------------
  all)
    trap on_exit EXIT
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
    ;;

  *)
    err "Unknown EXECUTOR_MODE '${EXECUTOR_MODE}'. Valid values: all | setup | run | cleanup"
    exit 1
    ;;
esac
