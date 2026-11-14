#!/bin/bash

# Create OSD GCP BYO firewall rule sets for Playwright E2E (public, private/PSC, Shared VPC).
# Ensures WIF configs exist (create if missing), resolves WIF IDs by display name,
# generates/applies ocm gcp create firewall-rules scripts, and optionally updates
# playwright.env.json (QE_GCP_WIF_CONFIG*, QE_INFRA_GCP.*FIREWALL_RULES_NAME).
#
# Shared VPC firewalls are created in the host project against the existing shared VPC.
# This script does not grant host-project IAM (Network/Security Admin) for WIF SAs;
# that must be done by a host-project admin when Shared VPC create fails validation.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLAYWRIGHT_ENV_FILE="$REPO_ROOT/playwright.env.json"

# Configuration (override via CLI flags or env vars)
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
VPC_NAME="${VPC_NAME:-}"
MACHINE_CIDR="${MACHINE_CIDR:-10.0.0.0/16}"

WIF_PUBLIC="${WIF_PUBLIC:-}"
WIF_PRIVATE="${WIF_PRIVATE:-}"
WIF_SHARED="${WIF_SHARED:-}"

FW_PREFIX="${FW_PREFIX:-test-firewall}"

# Existing Shared VPC host resources (not created by this script).
SHARED_HOST_PROJECT_ID="${SHARED_HOST_PROJECT_ID:-ocm-ui-dev-shared-vpc}"
SHARED_VPC_NAME="${SHARED_VPC_NAME:-ocmui-osd-shared-vpc}"

# ocm gcp create firewall-rules mode: manual (script + run) or auto (apply via ocm).
FIREWALL_MODE="${FIREWALL_MODE:-manual}"
UPDATE_WIF="${UPDATE_WIF:-false}"
CREATE_PUBLIC="${CREATE_PUBLIC:-true}"
CREATE_PRIVATE="${CREATE_PRIVATE:-true}"
CREATE_SHARED="${CREATE_SHARED:-true}"
UPDATE_PLAYWRIGHT_ENV="${UPDATE_PLAYWRIGHT_ENV:-true}"
APPLY_SCRIPTS="${APPLY_SCRIPTS:-true}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status()  { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
print_warning() { printf "${YELLOW}[WARNING]${NC} %s\n" "$1"; }
print_error()   { printf "${RED}[ERROR]${NC} %s\n" "$1"; }
print_found()   { printf "${BLUE}[FOUND]${NC} %s\n" "$1"; }

require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    print_error "'$1' is not installed or not on PATH."
    exit 1
  fi
}

check_prereqs() {
  require_cmd ocm
  require_cmd gcloud
  require_cmd jq

  if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
    print_error "No GCP project set. Pass --project PROJECT_ID or run: gcloud config set project PROJECT_ID"
    exit 1
  fi

  if [[ -z "${VPC_NAME}" ]]; then
    print_error "VPC name is required. Pass --vpc-name NAME (non-PSC / public VPC)."
    exit 1
  fi

  if [[ -z "${WIF_PUBLIC}" || -z "${WIF_PRIVATE}" || -z "${WIF_SHARED}" ]]; then
    print_error "WIF display names are required: --wif-public, --wif-private, --wif-shared"
    exit 1
  fi

  if [[ "${FIREWALL_MODE}" != "manual" && "${FIREWALL_MODE}" != "auto" ]]; then
    print_error "--mode must be manual or auto"
    exit 1
  fi

  # --mode auto needs an ocm-cli that advertises it (available in 1.0.17+).
  if [[ "${FIREWALL_MODE}" == "auto" ]]; then
    if ! ocm gcp create firewall-rules --help 2>&1 | grep -Eq 'auto \(default\)|^[[:space:]]*auto[[:space:]]'; then
      print_error "--mode auto requires ocm-cli that supports 'ocm gcp create firewall-rules --mode auto' (1.0.17+). Upgrade ocm-cli or use --mode manual."
      exit 1
    fi
  fi

  print_status "Using GCP project: ${PROJECT_ID}"
  print_status "Public VPC: ${VPC_NAME}"
  print_status "PSC VPC: ${PSC_VPC_NAME}"
  print_status "Shared VPC host: ${SHARED_HOST_PROJECT_ID} / ${SHARED_VPC_NAME}"
}

derive_resource_names() {
  # Match create-gcp-infrastructure.sh: test-vpc -> test-psc-vpc
  # Preserve an exported PSC_VPC_NAME override for the private firewall target.
  if [[ -z "${PSC_VPC_NAME:-}" ]]; then
    if [[ "${VPC_NAME}" == *-* ]]; then
      PSC_VPC_NAME="${VPC_NAME%%-*}-psc-${VPC_NAME#*-}"
    else
      PSC_VPC_NAME="${VPC_NAME}-psc"
    fi
  fi

  # Names are always derived from --fw-prefix: <prefix>-public|psc|shared
  FW_NAME_PUBLIC="${FW_PREFIX}-public"
  FW_NAME_PRIVATE="${FW_PREFIX}-psc"
  FW_NAME_SHARED="${FW_PREFIX}-shared"
}

# Returns 0 if a wif-config with this exact display_name exists.
wif_exists() {
  local name=$1
  local id
  id=$(resolve_wif_id "${name}" 2>/dev/null || true)
  [[ -n "${id}" ]]
}

# Resolve WIF ID from exact display_name (avoids test-wif-1 matching test-wif-1-private).
resolve_wif_id() {
  local name=$1
  local line id display
  local matched=""

  while IFS= read -r line; do
    [[ -z "${line}" ]] && continue
    # Default columns: id, display_name, ... — take first two fields.
    id=$(awk '{print $1}' <<< "${line}")
    display=$(awk '{print $2}' <<< "${line}")
    if [[ "${display}" == "${name}" ]]; then
      if [[ -n "${matched}" ]]; then
        print_error "Multiple wif-configs found with display_name '${name}'"
        return 1
      fi
      matched="${id}"
    fi
  done < <(ocm gcp list wif-configs --columns id,display_name --no-headers 2>/dev/null)

  if [[ -z "${matched}" ]]; then
    return 1
  fi
  printf '%s\n' "${matched}"
}

ensure_wif() {
  local name=$1
  local id

  if id=$(resolve_wif_id "${name}"); then
    print_found "WIF '${name}' exists (id=${id})"
    if [[ "${UPDATE_WIF}" == "true" ]]; then
      print_status "Updating WIF '${name}'..."
      ocm gcp update wif-config "${name}"
    fi
    return 0
  fi

  print_status "Creating WIF '${name}' in project ${PROJECT_ID}..."
  ocm gcp create wif-config --name "${name}" --project "${PROJECT_ID}"
  if ! id=$(resolve_wif_id "${name}"); then
    print_error "Created WIF '${name}' but could not resolve its ID"
    exit 1
  fi
  print_status "Created WIF '${name}' (id=${id})"
}

create_and_apply_firewall() {
  local fw_name=$1
  local wif_id=$2
  local project_id=$3
  local vpc_name=$4
  local profile=${5:-}
  local script_path
  local -a cmd

  cmd=(
    ocm gcp create firewall-rules
    --name="${fw_name}"
    --wif-config="${wif_id}"
    --project-id="${project_id}"
    --vpc-name="${vpc_name}"
    --machine-cidr="${MACHINE_CIDR}"
    --mode="${FIREWALL_MODE}"
  )

  if [[ -n "${profile}" ]]; then
    cmd+=(--profile="${profile}")
  fi

  if [[ "${FIREWALL_MODE}" == "manual" ]]; then
    script_path=$(mktemp "${TMPDIR:-/tmp}/createFW-${fw_name}.XXXXXX.sh")
    cmd+=(--output-file="${script_path}")
    print_status "Generating firewall script: ${script_path}"
    print_status "  name=${fw_name} wif=${wif_id} project=${project_id} vpc=${vpc_name}${profile:+ profile=${profile}}"
    "${cmd[@]}"
    chmod +x "${script_path}"
    if [[ "${APPLY_SCRIPTS}" == "true" ]]; then
      print_status "Applying ${script_path}..."
      # Generated scripts often omit set -e; run with fail-fast so a failed gcloud
      # command does not look like a successful partial apply.
      if ! bash -euo pipefail "${script_path}"; then
        rm -f "${script_path}"
        print_error "Firewall apply script failed for '${fw_name}'"
        exit 1
      fi
      rm -f "${script_path}"
      print_status "Removed temporary script ${script_path}"
    else
      print_warning "Skipping apply (--skip-apply). Script left at: ${script_path}"
    fi
  else
    print_status "Creating firewall rules (auto): ${fw_name}"
    print_status "  wif=${wif_id} project=${project_id} vpc=${vpc_name}${profile:+ profile=${profile}}"
    "${cmd[@]}"
  fi
}

replace_file_from_stdout() {
  local dest=$1
  shift
  local tmp="${dest}.tmp"
  if ! "$@" > "${tmp}"; then
    rm -f "${tmp}"
    return 1
  fi
  if ! mv "${tmp}" "${dest}"; then
    rm -f "${tmp}"
    return 1
  fi
  return 0
}

update_playwright_env() {
  if [[ "${UPDATE_PLAYWRIGHT_ENV}" != "true" ]]; then
    print_warning "Skipping playwright.env.json update (--skip-env-update)"
    return 0
  fi

  if [[ ! -f "${PLAYWRIGHT_ENV_FILE}" ]]; then
    print_warning "${PLAYWRIGHT_ENV_FILE} not found; skip env update"
    return 0
  fi
  if ! jq empty "${PLAYWRIGHT_ENV_FILE}" >/dev/null 2>&1; then
    print_error "Invalid JSON in ${PLAYWRIGHT_ENV_FILE}"
    exit 1
  fi

  cp "${PLAYWRIGHT_ENV_FILE}" "${PLAYWRIGHT_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
  print_status "Updating WIF / FIREWALL_RULES_NAME entries in ${PLAYWRIGHT_ENV_FILE}"

  if ! replace_file_from_stdout "${PLAYWRIGHT_ENV_FILE}" \
    jq \
      --arg wif_public "${WIF_PUBLIC}" \
      --arg wif_private "${WIF_PRIVATE}" \
      --arg wif_shared "${WIF_SHARED}" \
      --arg fw_public "${FW_NAME_PUBLIC}" \
      --arg fw_private "${FW_NAME_PRIVATE}" \
      --arg fw_shared "${FW_NAME_SHARED}" \
      --arg create_public "${CREATE_PUBLIC}" \
      --arg create_private "${CREATE_PRIVATE}" \
      --arg create_shared "${CREATE_SHARED}" \
      '
        .QE_GCP_WIF_CONFIG = $wif_public
        | .QE_GCP_WIF_CONFIG_PRIVATE = $wif_private
        | .QE_GCP_WIF_CONFIG_SHARED_VPC = $wif_shared
        | .QE_INFRA_GCP = (.QE_INFRA_GCP // {})
        | if $create_public == "true" then
            .QE_INFRA_GCP.FIREWALL_RULES_NAME = $fw_public
          else .
          end
        | if $create_private == "true" then
            .QE_INFRA_GCP.PSC_INFRA = ((.QE_INFRA_GCP.PSC_INFRA // {}) + {FIREWALL_RULES_NAME: $fw_private})
          else .
          end
        | if $create_shared == "true" then
            .QE_INFRA_GCP.SHARED_VPC_INFRA = ((.QE_INFRA_GCP.SHARED_VPC_INFRA // {}) + {FIREWALL_RULES_NAME: $fw_shared})
          else .
          end
      ' "${PLAYWRIGHT_ENV_FILE}"; then
    print_error "Failed to update ${PLAYWRIGHT_ENV_FILE}"
    exit 1
  fi

  print_status "Updated ${PLAYWRIGHT_ENV_FILE}"
}

print_summary() {
  cat <<EOF

=== GCP BYO firewall summary ===
Project:              ${PROJECT_ID}
Machine CIDR:         ${MACHINE_CIDR}
Mode:                 ${FIREWALL_MODE}

WIF public:           ${WIF_PUBLIC} (${WIF_PUBLIC_ID:-n/a})
WIF private:          ${WIF_PRIVATE} (${WIF_PRIVATE_ID:-n/a})
WIF shared:           ${WIF_SHARED} (${WIF_SHARED_ID:-n/a})

Public FW:            ${FW_NAME_PUBLIC}  vpc=${VPC_NAME}  (enabled=${CREATE_PUBLIC})
Private/PSC FW:       ${FW_NAME_PRIVATE}  vpc=${PSC_VPC_NAME} profile=private  (enabled=${CREATE_PRIVATE})
Shared VPC FW:        ${FW_NAME_SHARED}  host=${SHARED_HOST_PROJECT_ID} vpc=${SHARED_VPC_NAME}  (enabled=${CREATE_SHARED})

Note: Shared VPC cluster create still requires host-project IAM for the WIF SAs
(Compute Network Admin + Compute Security Admin on ${SHARED_HOST_PROJECT_ID}).

EOF
}

show_usage() {
  cat <<EOF
Usage: $0 [OPTIONS]

Ensure WIF configs exist and create BYO firewall rule sets for OSD GCP E2E:
  - Public (non-PSC VPC)
  - Private / PSC (--profile=private on PSC VPC)
  - Shared VPC (host project + existing shared VPC)

Configuration (CLI or env):
  --project PROJECT_ID            Service / WIF GCP project (default: gcloud config project)
  --vpc-name NAME                 Non-PSC (public) VPC name (required)
                                  PSC VPC is derived like create-gcp-infrastructure.sh
                                  (test-vpc -> test-psc-vpc) unless PSC_VPC_NAME is set
  --machine-cidr CIDR             Machine CIDR (default: 10.0.0.0/16)
  --wif-public NAME               Public WIF display name (required)
  --wif-private NAME              Private/PSC WIF display name (required)
  --wif-shared NAME               Shared VPC WIF display name (required)
  --fw-prefix PREFIX              Firewall name prefix (default: test-firewall)
                                  Creates: PREFIX-public, PREFIX-psc, PREFIX-shared
  --shared-host-project ID        Shared VPC host project (default: ocm-ui-dev-shared-vpc)
  --shared-vpc-name NAME          Shared VPC name (default: ocmui-osd-shared-vpc)
  --mode manual|auto              Firewall create mode (default: manual)
                                  auto requires ocm-cli 1.0.17+ (firewall-rules --mode auto)
  --update-wif                    Run ocm gcp update wif-config when WIF already exists
  --skip-public                   Do not create public firewall rules
  --skip-private                  Do not create private/PSC firewall rules
  --skip-shared                   Do not create Shared VPC firewall rules
  --skip-apply                    In manual mode, generate scripts but do not run them
  --skip-env-update               Do not update playwright.env.json
  --help                          Show this help

Examples:
  $0 --project ocm-ui-dev --vpc-name test-vpc \\
     --wif-public test-wif-1 --wif-private test-wif-1-private --wif-shared test-wif-1-shared-vpc \\
     --fw-prefix test-firewall

  $0 --project ocm-ui-dev --vpc-name test-vpc \\
     --wif-public test-wif-1 --wif-private test-wif-1-private --wif-shared test-wif-1-shared-vpc \\
     --fw-prefix test-firewall --mode auto --skip-shared
EOF
}

main() {
  derive_resource_names
  check_prereqs

  print_status "Ensuring WIF configs..."
  ensure_wif "${WIF_PUBLIC}"
  ensure_wif "${WIF_PRIVATE}"
  ensure_wif "${WIF_SHARED}"

  WIF_PUBLIC_ID=$(resolve_wif_id "${WIF_PUBLIC}")
  WIF_PRIVATE_ID=$(resolve_wif_id "${WIF_PRIVATE}")
  WIF_SHARED_ID=$(resolve_wif_id "${WIF_SHARED}")
  print_status "Resolved WIF IDs: public=${WIF_PUBLIC_ID} private=${WIF_PRIVATE_ID} shared=${WIF_SHARED_ID}"

  if [[ "${CREATE_PUBLIC}" == "true" ]]; then
    create_and_apply_firewall "${FW_NAME_PUBLIC}" "${WIF_PUBLIC_ID}" "${PROJECT_ID}" "${VPC_NAME}"
  else
    print_warning "Skipping public firewall (--skip-public)"
  fi

  if [[ "${CREATE_PRIVATE}" == "true" ]]; then
    create_and_apply_firewall "${FW_NAME_PRIVATE}" "${WIF_PRIVATE_ID}" "${PROJECT_ID}" "${PSC_VPC_NAME}" "private"
  else
    print_warning "Skipping private/PSC firewall (--skip-private)"
  fi

  if [[ "${CREATE_SHARED}" == "true" ]]; then
    create_and_apply_firewall "${FW_NAME_SHARED}" "${WIF_SHARED_ID}" "${SHARED_HOST_PROJECT_ID}" "${SHARED_VPC_NAME}"
  else
    print_warning "Skipping Shared VPC firewall (--skip-shared)"
  fi

  update_playwright_env
  print_summary
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT_ID="$2"
      shift 2
      ;;
    --vpc-name)
      VPC_NAME="$2"
      shift 2
      ;;
    --machine-cidr)
      MACHINE_CIDR="$2"
      shift 2
      ;;
    --wif-public)
      WIF_PUBLIC="$2"
      shift 2
      ;;
    --wif-private)
      WIF_PRIVATE="$2"
      shift 2
      ;;
    --wif-shared)
      WIF_SHARED="$2"
      shift 2
      ;;
    --fw-prefix)
      FW_PREFIX="$2"
      shift 2
      ;;
    --shared-host-project)
      SHARED_HOST_PROJECT_ID="$2"
      shift 2
      ;;
    --shared-vpc-name)
      SHARED_VPC_NAME="$2"
      shift 2
      ;;
    --mode)
      FIREWALL_MODE="$2"
      shift 2
      ;;
    --update-wif)
      UPDATE_WIF="true"
      shift
      ;;
    --skip-public)
      CREATE_PUBLIC="false"
      shift
      ;;
    --skip-private)
      CREATE_PRIVATE="false"
      shift
      ;;
    --skip-shared)
      CREATE_SHARED="false"
      shift
      ;;
    --skip-apply)
      APPLY_SCRIPTS="false"
      shift
      ;;
    --skip-env-update)
      UPDATE_PLAYWRIGHT_ENV="false"
      shift
      ;;
    --help|-h)
      show_usage
      exit 0
      ;;
    *)
      print_error "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

main
