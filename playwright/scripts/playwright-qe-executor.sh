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
#   `setup` writes qe-infra-state.json via an EXIT trap (see write_infra_state /
#   read_infra_state below), not an explicit end-of-function call. This means
#   the state file — and therefore the identifiers `cleanup` needs — gets
#   written on EVERY exit path out of the setup step, including a mid-sequence
#   `exit 1` from configure_aws_cli, setup_cloud_resources, configure_gcloud,
#   setup_gcp_resources, or setup_rosa_roles. Without this, a failure after a
#   cloud resource was already created (e.g. the AWS VPC succeeds but the
#   mandatory OCM role creation then fails) would skip state-writing entirely,
#   leaving that resource with no record for `cleanup` to act on. The trap
#   only writes state — it never performs cleanup and never changes the
#   setup step's exit code.
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
#   GREP_TAGS / TEST_ARGS / BROWSER / PLAYWRIGHT_TRACE
#   WORKERS=50%                   Playwright --workers. Accepts an absolute count (e.g. 4) or a
#                                 percentage of logical CPU cores (default: 50%, scaling
#                                 dynamically with the machine/container running the tests).
#                                 Override with a fixed number on CI runners where browser-based
#                                 tests need lower parallelism than the CPU count would suggest.
#   VPC_NAME / REGION / BUILD_IDENTIFIER
#   GCP_VPC_NAME / GCP_REGION / GCP_KEY_RING_NAME / GCP_KEY_NAME / GCP_KMS_SA_ID
#   CLI_TIMEOUT_SECS=120          Bound on short admin/API calls (aws sts, rosa, gcloud auth).
#                                 Only enforced when the `timeout` utility is available;
#                                 degrades to unbounded (with a warning) otherwise, e.g. local
#                                 macOS dev without GNU coreutils.
#   INFRA_TIMEOUT_SECS=1200       Bound on the AWS/GCP helper-script create/cleanup calls.
#
# AWS, GCP, and ROSA/OCM role setup (and the matching cleanup calls) target independent
# cloud APIs and don't depend on each other's output, so `setup`/`all`/`cleanup` run them
# concurrently via run_parallel_setup / run_parallel_cleanup rather than one after another —
# see those functions below for how per-job state (VPC_NAME, GCP_PROJECT_ID, etc.) is
# captured back from each background subshell.
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
WORKERS="${WORKERS:-50%}"
PLAYWRIGHT_TRACE="${PLAYWRIGHT_TRACE:-off}"
GREP_TAGS="${GREP_TAGS:-@ci|@smoke|@wizard-validation}"
TEST_ARGS="${TEST_ARGS:-playwright/e2e --grep ${GREP_TAGS}}"
# OCP version to target for account-role creation. When set, passed as
# --version to `rosa create account-roles` so tests run against a specific
# OpenShift version rather than the current default.
VERSION="${VERSION:-}"
CREDENTIALS_DIR="${CREDENTIALS_DIR:-/var/run/secrets/uhc-portal-playwright}"
BUILD_IDENTIFIER="${BUILD_IDENTIFIER:-${PROW_JOB_ID:-${BUILD_ID:-local-$(date +%s)}}}"
# Timeouts — see with_timeout() below. Short bound for quick admin/API calls (auth checks,
# role creation) vs. a long bound for the AWS/GCP helper scripts (which include multi-minute
# AWS waiters, e.g. NAT gateway create/delete).
CLI_TIMEOUT_SECS="${CLI_TIMEOUT_SECS:-120}"
INFRA_TIMEOUT_SECS="${INFRA_TIMEOUT_SECS:-1200}"

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
# with_timeout <seconds> <cmd> [args...] — bound a command's runtime so a
# hung CLI call (auth check, role creation, helper script) doesn't block the
# whole step indefinitely. Falls back to running unbounded, with a one-time
# warning, when the `timeout` utility (GNU coreutils) isn't available — e.g.
# local macOS dev without it installed — so behavior never regresses to
# "command not found" on platforms that lack it.
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# register_exit_cleanup <cmd> — append a cleanup command to the EXIT trap
# without clobbering whatever is already registered (write_infra_state in
# `setup` mode, on_exit in `all` mode, or a per-job trap set by
# run_parallel_setup). The new command runs first, then whatever was
# previously registered — so callers can compose cleanup actions regardless
# of call order.
# ---------------------------------------------------------------------------
register_exit_cleanup() {
  local new_cmd="$1"
  local existing
  existing="$(trap -p EXIT | sed -E "s/^trap -- '(.*)' EXIT\$/\\1/")"
  # SC2064: expanding ${new_cmd}/${existing} now (registration time) rather
  # than at signal time is intentional — we want a fully-resolved command
  # string baked into the trap, not variables re-evaluated later.
  if [[ -n "${existing}" ]]; then
    # shellcheck disable=SC2064
    trap "${new_cmd}; ${existing}" EXIT
  else
    # shellcheck disable=SC2064
    trap "${new_cmd}" EXIT
  fi
}

# ---------------------------------------------------------------------------
# _dump_kv_state <file> <var1> [var2 ...] — write the given variables (by
# name) as shell-quoted KEY=VALUE assignments to <file>. Used by
# run_parallel_setup so a backgrounded subshell can hand its shared-state
# variables (VPC_NAME, GCP_PROJECT_ID, etc.) back to the parent shell after
# `wait` — subshells don't share variable state with their parent, so this
# is the hand-off mechanism. Registered as that subshell's own EXIT trap, so
# it fires whatever happens inside (success or a mid-sequence `exit 1`).
# ---------------------------------------------------------------------------
_dump_kv_state() {
  local out_file="$1"
  shift
  local var
  : > "${out_file}"
  for var in "$@"; do
    printf '%s=%q\n' "${var}" "${!var:-}" >> "${out_file}"
  done
}

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
  if with_timeout "${CLI_TIMEOUT_SECS}" aws sts get-caller-identity >/dev/null 2>&1; then
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
    # Pass --version when VERSION is set so tests target a specific OCP version.
    [[ -n "${VERSION:-}" ]] && account_role_args+=(--version "${VERSION}")
    log "Creating account roles prefix=${account_prefix}${VERSION:+ version=${VERSION}}"
    with_timeout "${CLI_TIMEOUT_SECS}" rosa create account-roles "${account_role_args[@]}" >/dev/null 2>&1 \
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

# ---------------------------------------------------------------------------
# GCP cloud setup / teardown.
# ---------------------------------------------------------------------------
configure_gcloud() {
  if ! command -v gcloud >/dev/null 2>&1; then
    err "gcloud CLI not found (required for SETUP_GCP_CLOUD)"
    exit 1
  fi

  # The service-account key (QE_GCP_OSDCCSADMIN_JSON) is the most sensitive
  # credential this script handles — a full private key, not just a token.
  # Guard this whole block against `set -x` the same way configure_aws_cli
  # and setup_rosa_roles guard their secrets: without this, `echo
  # "${sa_key_json}" | ...` below would print the complete decoded key to
  # the xtrace output if the script is ever run with `bash -x` for debugging.
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
  # Safety net: guarantee the decoded key file is removed however this
  # process exits (success, an early `exit 1` below, or gcloud failing under
  # `set -e`) — not just on the happy path. Composes with whatever EXIT trap
  # is already registered (write_infra_state / on_exit / a run_parallel_setup
  # per-job trap) instead of replacing it.
  register_exit_cleanup "rm -f $(printf '%q' "${sa_key_file}")"

  # QE_GCP_OSDCCSADMIN_JSON may be a JSON string (double-encoded) or an object.
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
  with_timeout "${INFRA_TIMEOUT_SECS}" "${ROOT_DIR}/qe-helper-scripts/create-aws-infrastructure.sh" "${args[@]}" \
    || warn "VPC cleanup reported errors (continuing)"
}

# ---------------------------------------------------------------------------
# Parallel orchestration — AWS, GCP, and ROSA/OCM target independent cloud
# APIs and don't depend on each other's output, so setup and cleanup run
# them concurrently rather than one after another. AWS VPC create/delete
# alone can block on a multi-minute NAT gateway wait, so serializing all
# three needlessly adds minutes of wall-clock time per run.
# ---------------------------------------------------------------------------

# _merge_parallel_env_results <aws_env|""> <gcp_env|""> — fold each job's
# privately-written infra keys back into ENV_DEST after run_parallel_setup.
#
# AWS and GCP helpers both do read-modify-write against PLAYWRIGHT_ENV_FILE
# via the same `${file}.tmp` staging path. Giving each job a private copy
# avoids lost updates (QE_INFRA_REGIONS vs QE_INFRA_GCP) and tmp collisions;
# this merge is the hand-back step. Only keys each helper owns are copied —
# credentials and unrelated fields stay as prepare_env_file left them.
_merge_parallel_env_results() {
  local aws_env="${1:-}" gcp_env="${2:-}"
  local jq_args=() jq_prog

  jq_prog='.'
  if [[ -n "${aws_env}" && -f "${aws_env}" ]]; then
    jq_args+=(--slurpfile aws "${aws_env}")
    # Pull AWS-owned keys when present; also drop the legacy QE_SQS_QUEUE_URL
    # the AWS helper always deletes on a successful write.
    # shellcheck disable=SC2016  # jq program text; $aws is a jq variable, not bash
    jq_prog+='
      | .QE_INFRA_REGIONS = ($aws[0].QE_INFRA_REGIONS // .QE_INFRA_REGIONS)
      | if ($aws[0] | has("QE_SPOT_INTERRUPTION_QUEUE_URL")) then
          .QE_SPOT_INTERRUPTION_QUEUE_URL = $aws[0].QE_SPOT_INTERRUPTION_QUEUE_URL
        else . end
      | if ($aws[0] | has("QE_LOG_FORWARDING_S3_BUCKET_NAME")) then
          .QE_LOG_FORWARDING_S3_BUCKET_NAME = $aws[0].QE_LOG_FORWARDING_S3_BUCKET_NAME
        else . end
      | if ($aws[0] | has("QE_LOG_FORWARDING_S3_BUCKET_PREFIX")) then
          .QE_LOG_FORWARDING_S3_BUCKET_PREFIX = $aws[0].QE_LOG_FORWARDING_S3_BUCKET_PREFIX
        else . end
      | if ($aws[0] | has("QE_LOG_FORWARDING_CLOUDWATCH_ROLE_ARN")) then
          .QE_LOG_FORWARDING_CLOUDWATCH_ROLE_ARN = $aws[0].QE_LOG_FORWARDING_CLOUDWATCH_ROLE_ARN
        else . end
      | if ($aws[0] | has("QE_AUTONODE_ROLE_ARN")) then
          .QE_AUTONODE_ROLE_ARN = $aws[0].QE_AUTONODE_ROLE_ARN
        else . end
      | if ($aws[0] | has("QE_AUTONODE_ROLE_ARN_SECONDARY")) then
          .QE_AUTONODE_ROLE_ARN_SECONDARY = $aws[0].QE_AUTONODE_ROLE_ARN_SECONDARY
        else . end
      | del(.QE_SQS_QUEUE_URL)'
  fi
  if [[ -n "${gcp_env}" && -f "${gcp_env}" ]]; then
    jq_args+=(--slurpfile gcp "${gcp_env}")
    # shellcheck disable=SC2016  # jq program text; $gcp is a jq variable, not bash
    jq_prog+='
      | .QE_INFRA_GCP = ($gcp[0].QE_INFRA_GCP // .QE_INFRA_GCP)'
  fi

  # Nothing to merge (neither cloud job ran, or both private files missing).
  if [[ ${#jq_args[@]} -eq 0 ]]; then
    return 0
  fi

  jq "${jq_args[@]}" "${jq_prog}" "${ENV_DEST}" > "${ENV_DEST}.tmp" \
    && mv "${ENV_DEST}.tmp" "${ENV_DEST}"
  log "Merged parallel setup env results into ${ENV_DEST}"
}

# run_parallel_setup — background the AWS, GCP, and ROSA setup steps.
#
# Subshells don't share variable state with their parent, so each AWS/GCP
# job registers ITS OWN EXIT trap (via `trap ... EXIT`, replacing whatever
# it inherited from the parent at fork time — e.g. `write_infra_state` in
# `setup` mode) that dumps its shared-state variables (VPC_NAME,
# GCP_PROJECT_ID, etc.) to a result file via _dump_kv_state. Because that's
# an EXIT trap, it fires however the job's subshell exits — success or a
# mid-sequence `exit 1` from configure_aws_cli / setup_cloud_resources /
# configure_gcloud / setup_gcp_resources — so partial progress is never
# lost. The parent re-applies those variables to its own scope after `wait`,
# so write_infra_state (and, in `all` mode, cleanup_*) see them. The ROSA
# job has no shared state to hand back, so it only needs its inherited trap
# cleared (`trap - EXIT`) so it doesn't redundantly fire the parent's trap
# from inside its own subshell.
#
# AWS and GCP helpers both mutate PLAYWRIGHT_ENV_FILE via read-modify-write
# on the same `.tmp` path. To avoid lost updates when both run, each job
# gets a private copy of ENV_DEST (also rebound as ENV_DEST / PLAYWRIGHT_ENV_FILE
# inside that subshell). After wait, _merge_parallel_env_results folds the
# keys each helper owns back into the shared ENV_DEST.
#
# Each job's output is buffered to a log file and printed (prefixed, in a
# fixed order) only after `wait` completes, so concurrent output from the
# three jobs doesn't interleave mid-line.
#
# SC2030/SC2031: ENV_DEST / PLAYWRIGHT_ENV_FILE are rebound inside each
# `(...)&` subshell on purpose (private env copies). Those assignments are
# local to the subshell and must not affect the parent — shellcheck's
# "change might be lost" warning is the desired behavior here.
# shellcheck disable=SC2030,SC2031
run_parallel_setup() {
  local aws_pid="" gcp_pid="" rosa_pid=""
  local aws_rc=0 gcp_rc=0 rosa_rc=0
  local aws_log gcp_log rosa_log aws_result gcp_result
  local parallel_env_dir aws_env="" gcp_env=""
  aws_log="$(mktemp)"; gcp_log="$(mktemp)"; rosa_log="$(mktemp)"
  aws_result="$(mktemp)"; gcp_result="$(mktemp)"
  parallel_env_dir="$(mktemp -d)"

  if [[ "${SETUP_CLOUD}" == "true" ]]; then
    aws_env="${parallel_env_dir}/aws.env.json"
    cp "${ENV_DEST}" "${aws_env}"
    chmod 600 "${aws_env}"
    (
      trap '_dump_kv_state "'"${aws_result}"'" VPC_NAME REGION VPC_CREATED' EXIT
      # Private env copy — see comment on _merge_parallel_env_results.
      ENV_DEST="${aws_env}"
      export PLAYWRIGHT_ENV_FILE="${aws_env}"
      configure_aws_cli
      setup_cloud_resources
    ) > "${aws_log}" 2>&1 &
    aws_pid=$!
  fi

  if [[ "${SETUP_GCP_CLOUD}" == "true" ]]; then
    gcp_env="${parallel_env_dir}/gcp.env.json"
    cp "${ENV_DEST}" "${gcp_env}"
    chmod 600 "${gcp_env}"
    (
      trap '_dump_kv_state "'"${gcp_result}"'" GCP_VPC_NAME GCP_REGION GCP_PROJECT_ID GCP_VPC_CREATED' EXIT
      ENV_DEST="${gcp_env}"
      export PLAYWRIGHT_ENV_FILE="${gcp_env}"
      configure_gcloud
      setup_gcp_resources
    ) > "${gcp_log}" 2>&1 &
    gcp_pid=$!
  fi

  if [[ "${SETUP_ROSA_ROLES}" == "true" ]]; then
    # ROSA reads ENV_DEST for OCM client credentials and does not write infra
    # keys, so it shares the parent env file. But `rosa create ocm-role
    # --mode auto` also talks to AWS IAM and needs AWS_* exported in THIS
    # subshell — configure_aws_cli's exports from the AWS job never reach
    # here (subshell isolation). Re-auth here so region/keys are set.
    (
      trap - EXIT
      configure_aws_cli
      setup_rosa_roles
    ) > "${rosa_log}" 2>&1 &
    rosa_pid=$!
  fi

  [[ -n "${aws_pid}" ]]  && { wait "${aws_pid}"  || aws_rc=$?;  }
  [[ -n "${gcp_pid}" ]]  && { wait "${gcp_pid}"  || gcp_rc=$?;  }
  [[ -n "${rosa_pid}" ]] && { wait "${rosa_pid}" || rosa_rc=$?; }

  [[ -n "${aws_pid}" ]]  && sed 's/^/[aws]  /'  "${aws_log}"
  [[ -n "${gcp_pid}" ]]  && sed 's/^/[gcp]  /'  "${gcp_log}"
  [[ -n "${rosa_pid}" ]] && sed 's/^/[rosa] /' "${rosa_log}"
  rm -f "${aws_log}" "${gcp_log}" "${rosa_log}"

  # Re-apply shared state captured by the AWS/GCP jobs' EXIT traps so
  # downstream code (write_infra_state, cleanup_*) sees it, regardless of
  # whether that job succeeded or failed partway through.
  # shellcheck disable=SC1090  # dynamically-named result file, by design
  [[ -n "${aws_pid}" && -s "${aws_result}" ]] && source "${aws_result}"
  # shellcheck disable=SC1090
  [[ -n "${gcp_pid}" && -s "${gcp_result}" ]] && source "${gcp_result}"
  rm -f "${aws_result}" "${gcp_result}"

  # Fold each job's privately-written infra keys back into the shared env.
  # Done even when a job failed — a partial write (e.g. AWS succeeded, GCP
  # failed) must still land in ENV_DEST so cleanup/run see what was created.
  _merge_parallel_env_results "${aws_env}" "${gcp_env}"
  rm -rf "${parallel_env_dir}"

  if [[ "${aws_rc}" -ne 0 || "${gcp_rc}" -ne 0 || "${rosa_rc}" -ne 0 ]]; then
    err "Parallel setup failed (aws_rc=${aws_rc} gcp_rc=${gcp_rc} rosa_rc=${rosa_rc})"
    exit 1
  fi
}

# run_parallel_cleanup — background the AWS and GCP cleanup steps.
#
# Unlike run_parallel_setup, neither job needs to hand state back to the
# parent: cleanup_cloud_resources / cleanup_gcp_resources are terminal
# operations that already treat their own failures as warnings (never
# fatal), so they always return 0. The only way either job can fail is if
# an optional pre-step (e.g. configure_aws_cli / configure_gcloud, used by
# the `cleanup` mode case arm to (re)authenticate in a fresh container) exits
# non-zero — that's still surfaced and still fails the overall step, exactly
# as it would sequentially.
#
# Args: $1 = run AWS job ("true"/"false")   $2 = run GCP job ("true"/"false")
#       $3 = optional AWS pre-step command (e.g. "configure_aws_cli", or "")
#       $4 = optional GCP pre-step command (e.g. "configure_gcloud", or "")
run_parallel_cleanup() {
  local run_aws="${1:-true}" run_gcp="${2:-true}" aws_pre="${3:-}" gcp_pre="${4:-}"
  local aws_pid="" gcp_pid="" aws_rc=0 gcp_rc=0
  local aws_log gcp_log
  aws_log="$(mktemp)"; gcp_log="$(mktemp)"

  if [[ "${run_aws}" == "true" ]]; then
    (
      trap - EXIT  # don't inherit the parent's write_infra_state/on_exit trap
      [[ -n "${aws_pre}" ]] && ${aws_pre}
      cleanup_cloud_resources
    ) > "${aws_log}" 2>&1 &
    aws_pid=$!
  fi

  if [[ "${run_gcp}" == "true" ]]; then
    (
      trap - EXIT
      [[ -n "${gcp_pre}" ]] && ${gcp_pre}
      cleanup_gcp_resources
    ) > "${gcp_log}" 2>&1 &
    gcp_pid=$!
  fi

  [[ -n "${aws_pid}" ]] && { wait "${aws_pid}" || aws_rc=$?; }
  [[ -n "${gcp_pid}" ]] && { wait "${gcp_pid}" || gcp_rc=$?; }

  [[ -n "${aws_pid}" ]] && sed 's/^/[aws-cleanup]  /' "${aws_log}"
  [[ -n "${gcp_pid}" ]] && sed 's/^/[gcp-cleanup]  /' "${gcp_log}"
  rm -f "${aws_log}" "${gcp_log}"

  if [[ "${aws_rc}" -ne 0 || "${gcp_rc}" -ne 0 ]]; then
    err "Parallel cleanup pre-step failed (aws_rc=${aws_rc} gcp_rc=${gcp_rc})"
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Infra state — written by `setup` mode, read by `cleanup` mode.
# Stores only resource identifiers (no credentials) so cleanup always knows
# what to delete even if it runs in a separate Prow container.
#
# write_infra_state is registered as an EXIT trap for the `setup` branch
# (`trap write_infra_state EXIT`) rather than called explicitly at the end of
# the setup sequence. That guarantees it fires on every exit path — normal
# completion or any `exit 1` partway through — so a partial setup failure
# never leaves a cloud resource (AWS VPC/SQS/S3, GCP network) orphaned with
# no state file for `cleanup` to find. A trap that doesn't call `exit`
# itself does not change the process's final exit status, so this cannot
# mask a setup failure.
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
    # Since write_infra_state runs from setup's EXIT trap, this file should
    # exist whenever `setup` ran at all — even if it failed partway through.
    # A missing file here means `setup` never ran (e.g. SHARED_DIR wasn't
    # shared, or the setup step itself never started), not merely that it
    # failed.
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
  # configure_aws_cli/configure_gcloud must run again here, even though `all`
  # mode already ran them earlier in this same process: that earlier call
  # happened inside run_parallel_setup's AWS/GCP background *subshells*
  # (`( ... ) &`), and a subshell's exported env vars (AWS_ACCESS_KEY_ID,
  # etc.) never propagate back to this parent process once the subshell
  # exits. Without re-authenticating here, the aws/gcloud CLIs inside this
  # cleanup call's own subshells would have no credentials at all — same
  # as the explicit 3-step `cleanup` case arm, which passes these same two
  # functions as pre-steps for exactly this reason.
  #
  # Run it in a subshell: unlike the `cleanup` case arm (where failing the
  # dedicated cleanup step is correct), run_parallel_cleanup's own `exit 1`
  # on a pre-step failure must not escape on_exit and override the exit
  # code below — on_exit's contract is to always finish with the original
  # ${EXIT_CODE:-${rc}}, consistent with cleanup failures being best-effort
  # and swallowed everywhere else in this script.
  ( run_parallel_cleanup "${SETUP_CLOUD}" "${SETUP_GCP_CLOUD}" "configure_aws_cli" "configure_gcloud" ) || true
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
  #
  # An EXIT trap writes resource state on every exit path — success or a
  # mid-sequence `exit 1` from any helper (e.g. setup_rosa_roles failing after
  # setup_cloud_resources already created a VPC) — so the dedicated cleanup
  # step always has a state file to act on. The trap only writes state; it
  # does not perform cleanup and does not alter the script's exit status.
  # -------------------------------------------------------------------------
  setup)
    trap write_infra_state EXIT

    prepare_env_file

    # Runs AWS/GCP/ROSA setup concurrently — see run_parallel_setup. Each
    # backgrounded job only replaces ITS OWN forked copy of this trap (so
    # write_infra_state doesn't redundantly fire inside those subshells);
    # this parent-level trap is untouched and still fires exactly once,
    # here, after all three jobs finish and hand their state back.
    run_parallel_setup

    # Copy the full env (with credentials) to SHARED_DIR for the run step.
    # SHARED_DIR is a job-local volume — it is NOT uploaded to artifact stores.
    if [[ -n "${SHARED_DIR:-}" ]]; then
      # SC2031: ENV_DEST is only rebound inside run_parallel_setup subshells;
      # the parent value is unchanged. See that function's shellcheck note.
      # shellcheck disable=SC2031
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

    # Decide what to clean up, then run the AWS and GCP legs concurrently
    # (run_parallel_cleanup) instead of one after another — the same
    # rationale as run_parallel_setup, now applied to teardown.
    run_aws="false"; aws_pre=""
    if [[ "${SETUP_CLOUD}" == "true" && -n "${VPC_NAME:-}" ]]; then
      run_aws="true"
      aws_pre="configure_aws_cli"
      VPC_CREATED=true  # signal cleanup_cloud_resources to proceed
    else
      log "No AWS infra to clean up (SETUP_CLOUD=${SETUP_CLOUD}, VPC_NAME=${VPC_NAME:-empty})"
    fi

    run_gcp="false"; gcp_pre=""
    if [[ "${SETUP_GCP_CLOUD}" == "true" && -n "${GCP_VPC_NAME:-}" ]]; then
      # configure_gcloud must always be called — GCP_PROJECT_ID from state is not
      # sufficient; the service account still needs to be activated for gcloud CLI.
      run_gcp="true"
      gcp_pre="configure_gcloud"
      GCP_VPC_CREATED=true  # signal cleanup_gcp_resources to proceed
    else
      log "No GCP infra to clean up (SETUP_GCP_CLOUD=${SETUP_GCP_CLOUD}, GCP_VPC_NAME=${GCP_VPC_NAME:-empty})"
    fi

    run_parallel_cleanup "${run_aws}" "${run_gcp}" "${aws_pre}" "${gcp_pre}"

    copy_artifacts
    ;;

  # -------------------------------------------------------------------------
  # all — legacy single-step mode (local dev + backward compat).
  # Cleanup runs via an exit trap — best-effort only; will not run on eviction.
  # -------------------------------------------------------------------------
  all)
    trap on_exit EXIT
    prepare_env_file

    # Runs AWS/GCP/ROSA setup concurrently — see run_parallel_setup. As in
    # `setup` mode, each backgrounded job only replaces its own forked copy
    # of this trap; the parent-level `on_exit` trap is untouched.
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
