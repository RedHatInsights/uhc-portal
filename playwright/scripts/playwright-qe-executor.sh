#!/usr/bin/env bash
# Option-1 Playwright QE executor (GHA smoke parity).
#
# Flow:
#   1) Resolve base playwright.env.json (local file or Vault mount) — credentials only
#   2) Create ephemeral AWS VPC/subnets via qe-helper-scripts/create-vpc-infrastructure.sh
#   3) Optionally configure ROSA OCM/account roles
#   4) Run Playwright
#   5) Always cleanup VPC on exit
#
# Local:
#   SETUP_CLOUD=true ./playwright/scripts/playwright-qe-executor.sh
#   ENV_FILE=/path/to/playwright.env.json SETUP_CLOUD=true ./playwright/scripts/playwright-qe-executor.sh
#
# OpenShift CI (Vault mounts JSON blob or per-key files under CREDENTIALS_DIR):
#   CREDENTIALS_DIR=/var/run/secrets/uhc-portal-playwright \
#   ARTIFACT_DIR="${ARTIFACT_DIR}" \
#   ./playwright/scripts/playwright-qe-executor.sh
#
# Env knobs:
#   SETUP_CLOUD=true|false       Create/cleanup ephemeral VPC (default: true)
#   SETUP_ROSA_ROLES=true|false  rosa create ocm-role / account-roles (default: follows SETUP_CLOUD)
#   STRIP_STATIC_INFRA=true      Remove QE_INFRA_REGIONS before create (default: follows SETUP_CLOUD)
#   SKIP_SQS_QUEUE / SKIP_S3_BUCKET
#   EUT=staging|production|local
#   GREP_TAGS / TEST_ARGS / WORKERS / BROWSER / PLAYWRIGHT_TRACE
#   VPC_NAME / REGION / BUILD_IDENTIFIER
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

SETUP_CLOUD="${SETUP_CLOUD:-true}"
SETUP_ROSA_ROLES="${SETUP_ROSA_ROLES:-${SETUP_CLOUD}}"
STRIP_STATIC_INFRA="${STRIP_STATIC_INFRA:-${SETUP_CLOUD}}"
SKIP_SQS_QUEUE="${SKIP_SQS_QUEUE:-false}"
SKIP_S3_BUCKET="${SKIP_S3_BUCKET:-false}"
EUT="${EUT:-staging}"
BROWSER="${BROWSER:-chromium}"
WORKERS="${WORKERS:-2}"
PLAYWRIGHT_TRACE="${PLAYWRIGHT_TRACE:-off}"
GREP_TAGS="${GREP_TAGS:-@smoke|@wizard-validation}"
TEST_ARGS="${TEST_ARGS:-playwright/e2e/rosa playwright/e2e/rosa-hosted --grep ${GREP_TAGS}}"
CREDENTIALS_DIR="${CREDENTIALS_DIR:-/var/run/secrets/uhc-portal-playwright}"
BUILD_IDENTIFIER="${BUILD_IDENTIFIER:-${PROW_JOB_ID:-${BUILD_ID:-local-$(date +%s)}}}"
ENV_DEST="${ROOT_DIR}/playwright.env.json"
ENV_BACKUP=""
VPC_CREATED=false
EXIT_CODE=0

log() { printf '==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }

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
  if [[ -f "${ENV_DEST}" ]]; then
    echo "${ENV_DEST}"
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

  log "Assembling playwright.env.json from credential files in ${dir}"
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

backup_env_if_needed() {
  local src="$1"
  # If we will overwrite an existing repo playwright.env.json that is the user's
  # durable file (not a Vault mount), keep a backup and restore on exit.
  if [[ -f "${ENV_DEST}" ]]; then
    local dest_real src_real
    dest_real="$(cd "$(dirname "${ENV_DEST}")" && pwd)/$(basename "${ENV_DEST}")"
    src_real="$(cd "$(dirname "${src}")" && pwd)/$(basename "${src}")"
    if [[ "${src_real}" == "${dest_real}" ]] || [[ ! -f "${src}" ]]; then
      ENV_BACKUP="${ENV_DEST}.backup-ci-${BUILD_IDENTIFIER}"
      cp "${ENV_DEST}" "${ENV_BACKUP}"
      log "Backed up existing playwright.env.json → ${ENV_BACKUP}"
    elif [[ -f "${ENV_DEST}" && "${src_real}" != "${dest_real}" ]]; then
      ENV_BACKUP="${ENV_DEST}.backup-ci-${BUILD_IDENTIFIER}"
      cp "${ENV_DEST}" "${ENV_BACKUP}"
      log "Backed up existing playwright.env.json → ${ENV_BACKUP}"
    fi
  fi
}

restore_env_backup() {
  if [[ -n "${ENV_BACKUP}" && -f "${ENV_BACKUP}" ]]; then
    mv -f "${ENV_BACKUP}" "${ENV_DEST}"
    log "Restored playwright.env.json from backup"
  fi
}

prepare_env_file() {
  local src=""

  if src="$(resolve_env_source)"; then
    log "Using env source: ${src}"
    backup_env_if_needed "${src}"
    if [[ "$(cd "$(dirname "${src}")" && pwd)/$(basename "${src}")" != \
          "$(cd "$(dirname "${ENV_DEST}")" && pwd)/$(basename "${ENV_DEST}")" ]]; then
      cp "${src}" "${ENV_DEST}"
    fi
  elif assemble_env_from_vault_keys "${CREDENTIALS_DIR}" "${ENV_DEST}.assembled"; then
    backup_env_if_needed "${ENV_DEST}"
    mv "${ENV_DEST}.assembled" "${ENV_DEST}"
    log "Assembled env from Vault key files at ${CREDENTIALS_DIR}"
  else
    echo "ERROR: no playwright.env.json found." >&2
    echo "Set ENV_FILE / PLAYWRIGHT_ENV_SOURCE, place playwright.env.json in repo root," >&2
    echo "or mount Vault credentials at CREDENTIALS_DIR (${CREDENTIALS_DIR})." >&2
    exit 1
  fi

  chmod 600 "${ENV_DEST}" || true
  export PLAYWRIGHT_ENV_FILE="${ENV_DEST}"

  if ! jq empty "${ENV_DEST}" >/dev/null 2>&1; then
    echo "ERROR: playwright.env.json is not valid JSON" >&2
    exit 1
  fi

  jq --arg bid "${BUILD_IDENTIFIER}" '. + {BUILD_IDENTIFIER: $bid}' "${ENV_DEST}" > "${ENV_DEST}.tmp" \
    && mv "${ENV_DEST}.tmp" "${ENV_DEST}"
  chmod 600 "${ENV_DEST}" || true

  if [[ "${STRIP_STATIC_INFRA}" == "true" ]]; then
    log "Stripping static QE_INFRA_REGIONS (ephemeral VPC will be created)"
    jq 'del(.QE_INFRA_REGIONS)
        | del(.QE_SPOT_INTERRUPTION_QUEUE_URL)
        | del(.QE_LOG_FORWARDING_S3_BUCKET_NAME)
        | del(.QE_LOG_FORWARDING_S3_BUCKET_PREFIX)' "${ENV_DEST}" > "${ENV_DEST}.tmp" \
      && mv "${ENV_DEST}.tmp" "${ENV_DEST}"
    chmod 600 "${ENV_DEST}" || true
  fi

  case "${EUT}" in
    production)
      jq '.BASE_URL = "https://console.redhat.com/openshift/"' "${ENV_DEST}" > "${ENV_DEST}.tmp" && mv "${ENV_DEST}.tmp" "${ENV_DEST}"
      ;;
    local)
      jq '.BASE_URL = "https://prod.foo.redhat.com:1337/openshift/"' "${ENV_DEST}" > "${ENV_DEST}.tmp" && mv "${ENV_DEST}.tmp" "${ENV_DEST}"
      ;;
    staging|*)
      jq '.BASE_URL = (.BASE_URL // "https://console.dev.redhat.com/openshift/")' "${ENV_DEST}" > "${ENV_DEST}.tmp" && mv "${ENV_DEST}.tmp" "${ENV_DEST}"
      ;;
  esac
  chmod 600 "${ENV_DEST}" || true
}

configure_aws_cli() {
  local access_key secret_key region
  # Disable tracing while exporting secrets.
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
    echo "ERROR: QE_AWS_ACCESS_KEY_ID / QE_AWS_ACCESS_KEY_SECRET missing in playwright.env.json" >&2
    exit 1
  fi
  if ! command -v aws >/dev/null 2>&1; then
    echo "ERROR: aws CLI not found (required for SETUP_CLOUD)" >&2
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
  export PLAYWRIGHT_ENV_FILE="${ENV_DEST}"

  chmod +x "${ROOT_DIR}/qe-helper-scripts/create-vpc-infrastructure.sh"
  local args=(--region "${REGION}" --vpc-name "${VPC_NAME}")
  [[ "${SKIP_SQS_QUEUE}" == "true" ]] && args+=(--skip-sqs-queue)
  [[ "${SKIP_S3_BUCKET}" == "true" ]] && args+=(--skip-s3-bucket)

  log "Creating ephemeral VPC '${VPC_NAME}' in ${REGION}"
  if "${ROOT_DIR}/qe-helper-scripts/create-vpc-infrastructure.sh" "${args[@]}"; then
    VPC_CREATED=true
    log "VPC infrastructure ready; QE_INFRA_REGIONS written to playwright.env.json"
  else
    echo "ERROR: VPC infrastructure setup failed" >&2
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
  log "ROSA pre-config done"
}

run_playwright() {
  mkdir -p "${ROOT_DIR}/playwright-artifacts/results" "${ROOT_DIR}/playwright-artifacts/reports"
  export CI=true
  export BROWSER
  export PLAYWRIGHT_TRACE
  export NODE_TLS_REJECT_UNAUTHORIZED="${NODE_TLS_REJECT_UNAUTHORIZED:-0}"

  log "Running Playwright: ${TEST_ARGS} --project=${BROWSER} --workers=${WORKERS}"
  # shellcheck disable=SC2086
  npx playwright test ${TEST_ARGS} --project="${BROWSER}" --workers="${WORKERS}"
}

copy_artifacts() {
  if [[ -n "${ARTIFACT_DIR:-}" && -d "${ROOT_DIR}/playwright-artifacts" ]]; then
    # When ARTIFACT_DIR is the same tree (container mount at /app/playwright-artifacts), skip.
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
  export PLAYWRIGHT_ENV_FILE="${ENV_DEST}"
  local args=(--cleanup)
  [[ -n "${REGION:-}" ]] && args+=(--region "${REGION}")
  [[ -n "${VPC_NAME:-}" ]] && args+=(--vpc-name "${VPC_NAME}")
  [[ "${SKIP_SQS_QUEUE}" == "true" ]] && args+=(--skip-sqs-queue)
  [[ "${SKIP_S3_BUCKET}" == "true" ]] && args+=(--skip-s3-bucket)
  "${ROOT_DIR}/qe-helper-scripts/create-vpc-infrastructure.sh" "${args[@]}" \
    || warn "VPC cleanup reported errors (continuing)"
}

on_exit() {
  local rc=$?
  set +e
  copy_artifacts
  cleanup_cloud_resources
  restore_env_backup
  exit "${EXIT_CODE:-${rc}}"
}
trap on_exit EXIT

log "Playwright QE executor starting (SETUP_CLOUD=${SETUP_CLOUD}, EUT=${EUT}, BUILD_IDENTIFIER=${BUILD_IDENTIFIER})"
prepare_env_file

if [[ "${SETUP_CLOUD}" == "true" ]]; then
  configure_aws_cli
  setup_cloud_resources
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
