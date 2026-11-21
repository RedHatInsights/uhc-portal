#!/usr/bin/env bash
# Playwright QE executor — create cloud infra, run E2E, tear down.
#
# Modes (EXECUTOR_MODE):
#   setup|run|cleanup  — Prow 3-step (SHARED_DIR handoff; cleanup survives test-pod eviction)
#   all                — local single process (default; exit-trap cleanup)
#
# setup writes qe-infra-state.json via EXIT trap so cleanup still has names after
# partial failure or SIGTERM. VPC names are set in the parent before background jobs.
# AWS/GCP/ROSA setup runs in parallel. Full knobs: docs/playwright-qe-executor.md
#
# Local:  ENV_FILE=playwright.env.json SETUP_CLOUD=true ./playwright/scripts/playwright-qe-executor.sh
# CI:     CREDENTIALS_DIR=/var/run/secrets/uhc-portal-playwright ./playwright/scripts/playwright-qe-executor.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

# Track explicit SETUP_* / SKIP_* so cleanup can restore unset toggles from state
# instead of keeping script defaults and skipping teardown.
_SETUP_CLOUD_EXPLICIT=false
_SETUP_GCP_CLOUD_EXPLICIT=false
_SKIP_SQS_QUEUE_EXPLICIT=false
_SKIP_S3_BUCKET_EXPLICIT=false
[[ -n "${SETUP_CLOUD+x}" ]] && _SETUP_CLOUD_EXPLICIT=true
[[ -n "${SETUP_GCP_CLOUD+x}" ]] && _SETUP_GCP_CLOUD_EXPLICIT=true
[[ -n "${SKIP_SQS_QUEUE+x}" ]] && _SKIP_SQS_QUEUE_EXPLICIT=true
[[ -n "${SKIP_S3_BUCKET+x}" ]] && _SKIP_S3_BUCKET_EXPLICIT=true

SETUP_CLOUD="${SETUP_CLOUD:-true}"
SETUP_GCP_CLOUD="${SETUP_GCP_CLOUD:-false}"
SETUP_ROSA_ROLES="${SETUP_ROSA_ROLES:-${SETUP_CLOUD}}"
STRIP_STATIC_INFRA="${STRIP_STATIC_INFRA:-${SETUP_CLOUD}}"
EXECUTOR_MODE="${EXECUTOR_MODE:-all}"
SKIP_SQS_QUEUE="${SKIP_SQS_QUEUE:-false}"
SKIP_S3_BUCKET="${SKIP_S3_BUCKET:-false}"
EUT="${EUT:-staging}"
BROWSER="${BROWSER:-chromium}"
WORKERS="${WORKERS:-50%}"
PLAYWRIGHT_TRACE="${PLAYWRIGHT_TRACE:-off}"
GREP_TAGS="${GREP_TAGS:-@ci|@smoke|@wizard-validation}"
TEST_ARGS="${TEST_ARGS:-playwright/e2e --grep ${GREP_TAGS}}"
VERSION="${VERSION:-}"  # optional: rosa create account-roles --version
CREDENTIALS_DIR="${CREDENTIALS_DIR:-/var/run/secrets/uhc-portal-playwright}"
BUILD_IDENTIFIER="${BUILD_IDENTIFIER:-${PROW_JOB_ID:-${BUILD_ID:-local-$(date +%s)}}}"
CLI_TIMEOUT_SECS="${CLI_TIMEOUT_SECS:-120}"      # aws/rosa/gcloud
INFRA_TIMEOUT_SECS="${INFRA_TIMEOUT_SECS:-1200}"  # VPC helpers (NAT waiters)

ENV_DEST="${ROOT_DIR}/playwright.env.json"
VPC_CREATED=false
GCP_VPC_CREATED=false
EXIT_CODE=""

# Prow usually pre-creates SHARED_DIR; mkdir for local sims (e.g. /tmp/qe-shared).
if [[ -n "${SHARED_DIR:-}" ]]; then
  mkdir -p "${SHARED_DIR}"
fi

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

# with_timeout <secs> <cmd...> — prefer GNU timeout; else run unbounded (warn once).
_timeout_unavailable_warned=false
with_timeout() {
  local secs="$1"
  shift
  if command -v timeout >/dev/null 2>&1; then
    timeout "${secs}" "$@"
  else
    if [[ "${_timeout_unavailable_warned}" != true ]]; then
      warn "'timeout' command not found — CLI calls will run without a timeout bound"
      _timeout_unavailable_warned=true
    fi
    "$@"
  fi
}

# register_exit_cleanup <cmd> — prepend to EXIT trap (composes with existing).
register_exit_cleanup() {
  local new_cmd="$1"
  local existing
  existing="$(trap -p EXIT | sed -E "s/^trap -- '(.*)' EXIT\$/\\1/")"
  # Expand now (registration time), not at signal time.
  if [[ -n "${existing}" ]]; then
    # shellcheck disable=SC2064
    trap "${new_cmd}; ${existing}" EXIT
  else
    # shellcheck disable=SC2064
    trap "${new_cmd}" EXIT
  fi
}

# _dump_kv_state <file> <vars...> — hand shell vars from a job subshell to parent.
_dump_kv_state() {
  local out_file="$1"
  shift
  local var
  : > "${out_file}"
  for var in "$@"; do
    printf '%s=%q\n' "${var}" "${!var:-}" >> "${out_file}"
  done
}

# Credentials from explicit sources only (never scan the repo).
# Precedence: PLAYWRIGHT_ENV_SOURCE → ENV_FILE → CREDENTIALS_DIR/playwright.env.json
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

  local base_url
  case "${EUT}" in
    production) base_url="https://console.redhat.com/openshift/" ;;
    local)      base_url="https://prod.foo.redhat.com:1337/openshift/" ;;
    staging|*)  base_url="https://console.dev.redhat.com/openshift/" ;;
  esac

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
  if with_timeout "${CLI_TIMEOUT_SECS}" aws sts get-caller-identity >/dev/null 2>&1; then
    log "AWS authentication successful"
  else
    err "AWS STS check failed — credentials invalid or STS unreachable. Aborting before any resources are created."
    exit 1
  fi
}

# Match create-aws-infrastructure naming: lowercase, [a-z0-9-], ≤60.
normalize_aws_vpc_name() {
  local name="${VPC_NAME:-playwright-ocmui-${BUILD_IDENTIFIER}}"
  echo "${name}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g; s/--*/-/g; s/^-//; s/-$//' | cut -c1-60
}

# Match create-gcp-infrastructure naming: lowercase, [a-z0-9-], ≤50, no trailing '-'.
normalize_gcp_vpc_name() {
  local name="${GCP_VPC_NAME:-ocmui-gcp-${BUILD_IDENTIFIER}}"
  echo "${name}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g; s/--*/-/g; s/^-//; s/-$//' | cut -c1-50 | sed 's/-$//'
}

setup_cloud_resources() {
  local region
  region="${REGION:-$(jq -r '.QE_AWS_REGION // "us-west-2"' "${ENV_DEST}")}"
  VPC_NAME="$(normalize_aws_vpc_name)"
  REGION="${region}"

  local args=(--region "${REGION}" --vpc-name "${VPC_NAME}")
  [[ "${SKIP_SQS_QUEUE}" == "true" ]] && args+=(--skip-sqs-queue)
  [[ "${SKIP_S3_BUCKET}" == "true" ]] && args+=(--skip-s3-bucket)

  log "Creating ephemeral VPC '${VPC_NAME}' in ${REGION}"
  if with_timeout "${INFRA_TIMEOUT_SECS}" "${ROOT_DIR}/qe-helper-scripts/create-aws-infrastructure.sh" "${args[@]}"; then
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
  if ! with_timeout "${CLI_TIMEOUT_SECS}" rosa login --client-id "${client_id}" --client-secret "${client_secret}" --env "${rosa_env}" >/dev/null 2>&1; then
    [[ "${was_tracing}" == true ]] && set -x
    warn "ROSA login failed; continuing"
  else
    [[ "${was_tracing}" == true ]] && set -x
    log "ROSA login successful"
  fi

  local linked_ocmrole
  linked_ocmrole="$(with_timeout "${CLI_TIMEOUT_SECS}" rosa list ocm-roles 2>/dev/null | awk '$3 == "Yes" { print $2 }' || true)"
  if [[ -n "${linked_ocmrole}" ]]; then
    log "Unlinking existing OCM role"
    with_timeout "${CLI_TIMEOUT_SECS}" rosa unlink ocm-role --role-arn "${linked_ocmrole}" -y >/dev/null 2>&1 || warn "Failed to unlink OCM role"
  fi

  log "Creating OCM roles prefix=${ocm_prefix}"
  local ocm_role_output
  if ! ocm_role_output="$(with_timeout "${CLI_TIMEOUT_SECS}" rosa create ocm-role --prefix "${ocm_prefix}" --mode auto --admin -y 2>&1)"; then
    err "OCM role creation failed — OCM roles are mandatory due to tightened org policies. Aborting."
    err "rosa create ocm-role output:"
    printf '%s\n' "${ocm_role_output}" >&2
    exit 1
  fi

  if [[ -n "${account_prefix}" ]]; then
    local account_role_args=(--prefix "${account_prefix}" --mode auto -y)
    [[ -n "${VERSION:-}" ]] && account_role_args+=(--version "${VERSION}")
    log "Creating account roles prefix=${account_prefix}${VERSION:+ version=${VERSION}}"
    with_timeout "${CLI_TIMEOUT_SECS}" rosa create account-roles "${account_role_args[@]}" >/dev/null 2>&1 \
      || warn "Account roles creation completed with warnings"
  fi

  # User role (optional; skipped when QE_USER_ROLE_PREFIX unset).
  local user_prefix
  user_prefix="$(jq -r '.QE_USER_ROLE_PREFIX // empty' "${ENV_DEST}")"

  if [[ -n "${user_prefix}" ]]; then
    local linked_userrole
    linked_userrole="$(with_timeout "${CLI_TIMEOUT_SECS}" rosa list user-roles 2>/dev/null | awk '$3 == "Yes" { print $2 }' || true)"
    if [[ -z "${linked_userrole}" ]]; then
      log "Creating and linking user role prefix=${user_prefix}"
      with_timeout "${CLI_TIMEOUT_SECS}" rosa create user-role --prefix "${user_prefix}" --mode auto -y >/dev/null 2>&1 \
        || warn "User role creation completed with warnings"
    else
      log "User role already linked: ${linked_userrole}"
    fi
  fi
  log "ROSA pre-config done"
}

configure_gcloud() {
  if ! command -v gcloud >/dev/null 2>&1; then
    err "gcloud CLI not found (required for SETUP_GCP_CLOUD)"
    exit 1
  fi

  # Disable xtrace while handling the SA private key.
  local was_tracing=false
  [[ $- == *x* ]] && was_tracing=true
  set +x

  local sa_key_json project_id client_email
  sa_key_json="$(jq -r '.QE_GCP_OSDCCSADMIN_JSON // empty' "${ENV_DEST}")"

  if [[ -z "${sa_key_json}" ]]; then
    [[ "${was_tracing}" == true ]] && set -x
    err "QE_GCP_OSDCCSADMIN_JSON missing in env file"
    exit 1
  fi

  local sa_key_file
  sa_key_file="$(mktemp)"
  chmod 600 "${sa_key_file}"
  # Remove key file on any exit; compose with existing EXIT trap.
  register_exit_cleanup "rm -f $(printf '%q' "${sa_key_file}")"

  # May be a JSON string (double-encoded) or an object.
  echo "${sa_key_json}" | jq -r 'if type == "string" then fromjson else . end' > "${sa_key_file}"

  project_id="$(jq -r '.project_id // empty' "${sa_key_file}")"
  client_email="$(jq -r '.client_email // empty' "${sa_key_file}")"
  [[ "${was_tracing}" == true ]] && set -x

  if [[ -z "${project_id}" || -z "${client_email}" ]]; then
    err "QE_GCP_OSDCCSADMIN_JSON is missing project_id or client_email"
    rm -f "${sa_key_file}"
    exit 1
  fi

  GCP_PROJECT_ID="${project_id}"
  export GCP_PROJECT_ID
  export CLOUDSDK_CORE_DISABLE_PROMPTS=1

  log "Authenticating gcloud as ${client_email} (project=${project_id})"
  with_timeout "${CLI_TIMEOUT_SECS}" gcloud auth activate-service-account "${client_email}" \
    --key-file="${sa_key_file}" \
    --project="${project_id}"
  with_timeout "${CLI_TIMEOUT_SECS}" gcloud config set project "${project_id}"

  rm -f "${sa_key_file}"

  if with_timeout "${CLI_TIMEOUT_SECS}" gcloud projects describe "${project_id}" >/dev/null 2>&1; then
    log "GCP authentication successful"
  else
    warn "GCP project describe failed; continuing"
  fi
}

setup_gcp_resources() {
  local gcp_region
  gcp_region="${GCP_REGION:-${REGION:-us-central1}}"
  GCP_VPC_NAME="$(normalize_gcp_vpc_name)"
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
  if with_timeout "${INFRA_TIMEOUT_SECS}" "${ROOT_DIR}/qe-helper-scripts/create-gcp-infrastructure.sh" "${args[@]}"; then
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
  with_timeout "${INFRA_TIMEOUT_SECS}" "${ROOT_DIR}/qe-helper-scripts/create-gcp-infrastructure.sh" "${args[@]}" \
    || warn "GCP cleanup reported errors (continuing)"
}

run_playwright() {
  mkdir -p "${ROOT_DIR}/playwright-artifacts/results" "${ROOT_DIR}/playwright-artifacts/reports"

  log "Running Playwright: ${TEST_ARGS} --project=${BROWSER} --workers=${WORKERS}"
  # shellcheck disable=SC2086
  npx playwright test ${TEST_ARGS} --project="${BROWSER}" --workers="${WORKERS}"
}

# Copy artifacts to ARTIFACT_DIR; write scrubbed env (no secrets) to SHARED_DIR.
copy_artifacts() {
  if [[ -n "${ARTIFACT_DIR:-}" && -d "${ROOT_DIR}/playwright-artifacts" ]]; then
    local art_real root_art_real
    art_real="$(cd "${ARTIFACT_DIR}" 2>/dev/null && pwd)" || art_real=""
    root_art_real="$(cd "${ROOT_DIR}/playwright-artifacts" && pwd)"
    if [[ -n "${art_real}" && "${art_real}" != "${root_art_real}" ]]; then
      log "Copying playwright-artifacts → ${ARTIFACT_DIR}"
      mkdir -p "${ARTIFACT_DIR}"
      cp -a "${ROOT_DIR}/playwright-artifacts/." "${ARTIFACT_DIR}/" || warn "Artifact copy failed"
    fi
  fi
  if [[ -n "${SHARED_DIR:-}" && -f "${ENV_DEST}" ]]; then
    # Strip secrets / account IDs; keep infra names.
    jq 'del(
      .TEST_WITHQUOTA_USER, .TEST_WITHQUOTA_PASSWORD,
      .QE_AWS_ACCESS_KEY_ID, .QE_AWS_ACCESS_KEY_SECRET,
      .QE_AWS_ID, .QE_AWS_BILLING_ID, .QE_AWS_SECONDARY_BILLING_ID,
      .QE_AWS_KMS_KEY, .QE_AWS_IAM_USER, .QE_AWS_INFRA_ACCESS_IAM_ARN,
      .QE_LOG_FORWARDING_CLOUDWATCH_ROLE_ARN,
      .QE_AUTONODE_ROLE_ARN, .QE_AUTONODE_ROLE_ARN_SECONDARY,
      .QE_ORGADMIN_USER, .QE_ORGADMIN_PASSWORD,
      .QE_ORGADMIN_OFFLINE_TOKEN, .QE_ORGADMIN_REFRESH_TOKEN,
      .QE_ORGADMIN_CLIENT_ID, .QE_ORGADMIN_CLIENT_SECRET,
      .QE_TESTUSER_CLIENT_ID, .QE_TESTUSER_CLIENT_SECRET,
      .QE_GCP_OSDCCSADMIN_JSON, .QE_GCP_KMS_SERVICE_ACCOUNT
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
  with_timeout "${INFRA_TIMEOUT_SECS}" "${ROOT_DIR}/qe-helper-scripts/create-aws-infrastructure.sh" "${args[@]}" \
    || warn "VPC cleanup reported errors (continuing)"
}

# Parallel AWS/GCP/ROSA — private env copies avoid helper write races; merge
# owned keys back after wait. See docs/playwright-qe-executor.md.

# Keys copied from each job's private env (has(key) only — never write null).
AWS_ENV_MERGE_KEYS=(
  QE_INFRA_REGIONS
  QE_SPOT_INTERRUPTION_QUEUE_URL
  QE_LOG_FORWARDING_S3_BUCKET_NAME
  QE_LOG_FORWARDING_S3_BUCKET_PREFIX
  QE_LOG_FORWARDING_CLOUDWATCH_ROLE_ARN
  QE_AUTONODE_ROLE_ARN
  QE_AUTONODE_ROLE_ARN_SECONDARY
)
AWS_ENV_DELETE_KEYS=(QE_SQS_QUEUE_URL)
GCP_ENV_MERGE_KEYS=(
  QE_INFRA_GCP
  QE_GCP_KEY_RING_LOCATION
  QE_GCP_KEY_RING
  QE_GCP_KEY_NAME
  QE_GCP_KMS_SERVICE_ACCOUNT
)

_jq_copy_present_keys() {
  local side="$1"
  shift
  local key
  for key in "$@"; do
    # shellcheck disable=SC2016  # $side is a jq var name
    printf ' | if ($%s[0] | has("%s")) then .%s = $%s[0].%s else . end' \
      "${side}" "${key}" "${key}" "${side}" "${key}"
  done
}

# Merge private env copies into ENV_DEST (including after partial failure).
_merge_parallel_env_results() {
  local aws_env="${1:-}" gcp_env="${2:-}"
  local jq_args=() jq_prog='.'

  if [[ -n "${aws_env}" && -f "${aws_env}" ]]; then
    jq_args+=(--slurpfile aws "${aws_env}")
    jq_prog+="$(_jq_copy_present_keys aws "${AWS_ENV_MERGE_KEYS[@]}")"
    local del_key
    for del_key in "${AWS_ENV_DELETE_KEYS[@]}"; do
      jq_prog+=" | del(.${del_key})"
    done
  fi
  if [[ -n "${gcp_env}" && -f "${gcp_env}" ]]; then
    jq_args+=(--slurpfile gcp "${gcp_env}")
    jq_prog+="$(_jq_copy_present_keys gcp "${GCP_ENV_MERGE_KEYS[@]}")"
  fi

  if [[ ${#jq_args[@]} -eq 0 ]]; then
    return 0
  fi

  jq "${jq_args[@]}" "${jq_prog}" "${ENV_DEST}" > "${ENV_DEST}.tmp" \
    && mv "${ENV_DEST}.tmp" "${ENV_DEST}"
  log "Merged parallel setup env results into ${ENV_DEST}"
}

_BG_PIDS=()
_BG_LABELS=()
_BG_LOGS=()
_BG_STATES=()

_bg_reset() {
  _BG_PIDS=()
  _BG_LABELS=()
  _BG_LOGS=()
  _BG_STATES=()
}

# _bg_run_fn <label> <statefile|""> [state_vars...] -- <cmd> [args...]
_bg_run_fn() {
  local label="$1" statefile="${2:-}"
  shift 2
  local -a state_vars=()
  while [[ $# -gt 0 && "$1" != "--" ]]; do
    state_vars+=("$1")
    shift
  done
  if [[ $# -lt 1 || "$1" != "--" ]]; then
    err "_bg_run_fn: missing -- before command"
    return 1
  fi
  shift

  local logfile
  logfile="$(mktemp)"
  (
    if [[ -n "${statefile}" && ${#state_vars[@]} -gt 0 ]]; then
      # shellcheck disable=SC2064
      trap '_dump_kv_state "'"${statefile}"'" '"${state_vars[*]}" EXIT
    else
      trap - EXIT
    fi
    "$@"
  ) > "${logfile}" 2>&1 &
  _BG_PIDS+=("$!")
  _BG_LABELS+=("${label}")
  _BG_LOGS+=("${logfile}")
  _BG_STATES+=("${statefile}")
}

# Wait jobs, print prefixed logs, source state files; fail if any rc != 0.
_bg_await() {
  local fail_msg="$1"
  local i rc any_fail=0
  local -a rcs=()

  for i in "${!_BG_PIDS[@]}"; do
    rc=0
    wait "${_BG_PIDS[$i]}" || rc=$?
    rcs+=("${rc}")
    [[ "${rc}" -ne 0 ]] && any_fail=1
  done

  for i in "${!_BG_PIDS[@]}"; do
    sed "s/^/[${_BG_LABELS[$i]}] /" "${_BG_LOGS[$i]}"
    rm -f "${_BG_LOGS[$i]}"
  done

  for i in "${!_BG_PIDS[@]}"; do
    # shellcheck disable=SC1090  # dynamically-named state file, by design
    [[ -n "${_BG_STATES[$i]}" && -s "${_BG_STATES[$i]}" ]] && source "${_BG_STATES[$i]}"
    [[ -n "${_BG_STATES[$i]}" ]] && rm -f "${_BG_STATES[$i]}"
  done

  _bg_reset

  if [[ "${any_fail}" -ne 0 ]]; then
    err "${fail_msg} (rcs=${rcs[*]})"
    return 1
  fi
  return 0
}

# shellcheck disable=SC2030,SC2031  # ENV_DEST rebound only in this subshell
_aws_setup_job() {
  local private_env="$1"
  ENV_DEST="${private_env}"
  export PLAYWRIGHT_ENV_FILE="${private_env}"
  configure_aws_cli
  setup_cloud_resources
}

# shellcheck disable=SC2030,SC2031
_gcp_setup_job() {
  local private_env="$1"
  ENV_DEST="${private_env}"
  export PLAYWRIGHT_ENV_FILE="${private_env}"
  configure_gcloud
  setup_gcp_resources
}

_rosa_setup_job() {
  # Re-auth: sibling AWS-job exports never reach this subshell.
  configure_aws_cli
  setup_rosa_roles
}

_cleanup_job() {
  local pre="${1:-}"
  [[ -n "${pre}" ]] && ${pre}
  "$2"
}

# Precompute VPC names (SIGTERM-safe), run jobs, merge private envs after wait.
run_parallel_setup() {
  local aws_state="" gcp_state=""
  local parallel_env_dir aws_env="" gcp_env=""
  parallel_env_dir="$(mktemp -d)"
  _bg_reset

  if [[ "${SETUP_CLOUD}" == "true" ]]; then
    VPC_NAME="$(normalize_aws_vpc_name)"
  fi
  if [[ "${SETUP_GCP_CLOUD}" == "true" ]]; then
    GCP_VPC_NAME="$(normalize_gcp_vpc_name)"
  fi

  if [[ "${SETUP_CLOUD}" == "true" ]]; then
    aws_env="${parallel_env_dir}/aws.env.json"
    aws_state="$(mktemp)"
    cp "${ENV_DEST}" "${aws_env}"
    chmod 600 "${aws_env}"
    _bg_run_fn aws "${aws_state}" VPC_NAME REGION VPC_CREATED -- _aws_setup_job "${aws_env}"
  fi

  if [[ "${SETUP_GCP_CLOUD}" == "true" ]]; then
    gcp_env="${parallel_env_dir}/gcp.env.json"
    gcp_state="$(mktemp)"
    cp "${ENV_DEST}" "${gcp_env}"
    chmod 600 "${gcp_env}"
    _bg_run_fn gcp "${gcp_state}" GCP_VPC_NAME GCP_REGION GCP_PROJECT_ID GCP_VPC_CREATED -- \
      _gcp_setup_job "${gcp_env}"
  fi

  if [[ "${SETUP_ROSA_ROLES}" == "true" ]]; then
    _bg_run_fn rosa "" -- _rosa_setup_job
  fi

  # Merge even on failure so partial creates reach ENV_DEST for cleanup/run.
  local await_rc=0
  _bg_await "Parallel setup failed" || await_rc=$?
  _merge_parallel_env_results "${aws_env}" "${gcp_env}"
  rm -rf "${parallel_env_dir}"

  if [[ "${await_rc}" -ne 0 ]]; then
    exit 1
  fi
}

# run_parallel_cleanup $run_aws $run_gcp [$aws_pre] [$gcp_pre]
# Auth pre-step failures fail the step; cleanup_* is best-effort.
run_parallel_cleanup() {
  local run_aws="${1:-true}" run_gcp="${2:-true}" aws_pre="${3:-}" gcp_pre="${4:-}"
  _bg_reset

  if [[ "${run_aws}" == "true" ]]; then
    _bg_run_fn aws-cleanup "" -- _cleanup_job "${aws_pre}" cleanup_cloud_resources
  fi
  if [[ "${run_gcp}" == "true" ]]; then
    _bg_run_fn gcp-cleanup "" -- _cleanup_job "${gcp_pre}" cleanup_gcp_resources
  fi

  _bg_await "Parallel cleanup pre-step failed" || exit 1
}

# Resource IDs only (no secrets). setup registers this as EXIT trap so it runs
# on every exit path, including partial failure — without changing exit status.
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
  # Restore toggles only when caller did not set them (else defaults win and skip teardown).
  if [[ "${_SETUP_CLOUD_EXPLICIT}" != "true" ]]; then
    SETUP_CLOUD="$(jq -r '.SETUP_CLOUD // "false"' "${state_file}")"
  fi
  if [[ "${_SETUP_GCP_CLOUD_EXPLICIT}" != "true" ]]; then
    SETUP_GCP_CLOUD="$(jq -r '.SETUP_GCP_CLOUD // "false"' "${state_file}")"
  fi
  if [[ "${_SKIP_SQS_QUEUE_EXPLICIT}" != "true" ]]; then
    SKIP_SQS_QUEUE="$(jq -r '.SKIP_SQS_QUEUE // "false"' "${state_file}")"
  fi
  if [[ "${_SKIP_S3_BUCKET_EXPLICIT}" != "true" ]]; then
    SKIP_S3_BUCKET="$(jq -r '.SKIP_S3_BUCKET // "false"' "${state_file}")"
  fi
  log "Infra state loaded: VPC=${VPC_NAME:-none} REGION=${REGION:-none} GCP_VPC=${GCP_VPC_NAME:-none} SETUP_CLOUD=${SETUP_CLOUD} SETUP_GCP_CLOUD=${SETUP_GCP_CLOUD}"
}

# all-mode EXIT trap: re-auth (setup ran in subshells) then best-effort cleanup.
# Subshell so cleanup exit 1 cannot override the original test exit code.
on_exit() {
  local rc=$?
  set +e
  copy_artifacts
  ( run_parallel_cleanup "${SETUP_CLOUD}" "${SETUP_GCP_CLOUD}" "configure_aws_cli" "configure_gcloud" ) || true
  exit "${EXIT_CODE:-${rc}}"
}

log "Playwright QE executor starting (MODE=${EXECUTOR_MODE}, SETUP_CLOUD=${SETUP_CLOUD}, SETUP_GCP_CLOUD=${SETUP_GCP_CLOUD}, EUT=${EUT}, BUILD_IDENTIFIER=${BUILD_IDENTIFIER})"

case "${EXECUTOR_MODE}" in

  # Prow step 1: create infra; EXIT trap writes state for cleanup.
  setup)
    trap write_infra_state EXIT

    prepare_env_file
    run_parallel_setup

    # Full env (with credentials) for the run step — job-local volume, not artifacts.
    if [[ -n "${SHARED_DIR:-}" ]]; then
      # shellcheck disable=SC2031  # ENV_DEST rebound only inside setup job subshells
      cp "${ENV_DEST}" "${SHARED_DIR}/playwright.env.json"
      chmod 600 "${SHARED_DIR}/playwright.env.json" || true
      log "Full env written to SHARED_DIR for run step"
    fi
    ;;

  # Prow step 2: run tests; cleanup is a separate step.
  run)
    STRIP_STATIC_INFRA=false  # keep QE_INFRA_* from setup

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

  # Prow step 3: tear down using state from setup (runs even if run was killed).
  cleanup)
    STRIP_STATIC_INFRA=false
    read_infra_state
    prepare_env_file

    run_aws="false"; aws_pre=""
    if [[ "${SETUP_CLOUD}" == "true" && -n "${VPC_NAME:-}" ]]; then
      run_aws="true"
      aws_pre="configure_aws_cli"
      VPC_CREATED=true
    else
      log "No AWS infra to clean up (SETUP_CLOUD=${SETUP_CLOUD}, VPC_NAME=${VPC_NAME:-empty})"
    fi

    run_gcp="false"; gcp_pre=""
    if [[ "${SETUP_GCP_CLOUD}" == "true" && -n "${GCP_VPC_NAME:-}" ]]; then
      run_gcp="true"
      gcp_pre="configure_gcloud"  # must activate SA; project id alone is not enough
      GCP_VPC_CREATED=true
    else
      log "No GCP infra to clean up (SETUP_GCP_CLOUD=${SETUP_GCP_CLOUD}, GCP_VPC_NAME=${GCP_VPC_NAME:-empty})"
    fi

    run_parallel_cleanup "${run_aws}" "${run_gcp}" "${aws_pre}" "${gcp_pre}"
    copy_artifacts
    ;;

  # Local single-step: setup → tests → exit-trap cleanup.
  all)
    trap on_exit EXIT
    prepare_env_file
    run_parallel_setup

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
