#!/bin/bash

# GCP VPC + KMS infrastructure for OSD GCP tests (custom VPC, PSC, etcd/disk encryption)
# Creates: custom VPC, control-plane/compute/PSC subnets, Cloud NAT (optional),
#          Cloud KMS key ring + crypto key + KMS service account (optional)
# Default region: us-central1; KMS key ring location follows that region unless overridden
# Optionally updates playwright.env.json (QE_INFRA_GCP, PSC_INFRA, QE_GCP_KEY_*)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLAYWRIGHT_ENV_FILE="$REPO_ROOT/playwright.env.json"

# Configuration (override via CLI flags or env vars)
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
REGION="${REGION:-us-central1}"
VPC_NAME="${VPC_NAME:-playwright-osd}"

# Optional explicit names (empty => derived from VPC_NAME after CLI parse)
CONTROLPLANE_SUBNET="${CONTROLPLANE_SUBNET:-}"
COMPUTE_SUBNET="${COMPUTE_SUBNET:-}"
PSC_SUBNET="${PSC_SUBNET:-}"
ROUTER_NAME="${ROUTER_NAME:-}"
NAT_NAME="${NAT_NAME:-}"

# CIDRs must sit inside the OSD Machine CIDR (default 10.0.0.0/16)
CONTROLPLANE_CIDR="${CONTROLPLANE_CIDR:-10.0.0.0/20}"
COMPUTE_CIDR="${COMPUTE_CIDR:-10.0.16.0/20}"
# PSC subnet must be /29 or larger and dedicated to one cluster
PSC_CIDR="${PSC_CIDR:-10.0.32.0/29}"

CREATE_CLOUD_NAT="${CREATE_CLOUD_NAT:-true}"
CREATE_PSC="${CREATE_PSC:-true}"
CREATE_KMS="${CREATE_KMS:-true}"
UPDATE_PLAYWRIGHT_ENV="${UPDATE_PLAYWRIGHT_ENV:-true}"

# Cloud KMS names follow VPC_NAME unless set explicitly (default VPC: playwright-osd).
# Key ring location follows REGION unless --key-ring-location is set.
KEY_RING_LOCATION="${KEY_RING_LOCATION:-}"
KEY_RING_NAME="${KEY_RING_NAME:-}"
KEY_NAME="${KEY_NAME:-}"
# Account ID only (email: ${KMS_SA_ID}@${PROJECT_ID}.iam.gserviceaccount.com)
KMS_SA_ID="${KMS_SA_ID:-}"
# Set to full email to use an existing SA (skips SA creation; IAM binding still applied)
KMS_SERVICE_ACCOUNT="${KMS_SERVICE_ACCOUNT:-}"
CREATE_KMS_SA="${CREATE_KMS_SA:-true}"

derive_resource_names() {
  # playwright-osd -> playwright-psc-osd (insert -psc- after the first segment)
  if [[ -z "${PSC_VPC_NAME:-}" ]]; then
    if [[ "${VPC_NAME}" == *-* ]]; then
      PSC_VPC_NAME="${VPC_NAME%%-*}-psc-${VPC_NAME#*-}"
    else
      PSC_VPC_NAME="${VPC_NAME}-psc"
    fi
  fi

  CONTROLPLANE_SUBNET="${CONTROLPLANE_SUBNET:-${PSC_VPC_NAME}-controlplane}"
  COMPUTE_SUBNET="${COMPUTE_SUBNET:-${PSC_VPC_NAME}-compute}"
  PSC_SUBNET="${PSC_SUBNET:-${PSC_VPC_NAME}-psc}"
  ROUTER_NAME="${ROUTER_NAME:-${PSC_VPC_NAME}-router}"
  NAT_NAME="${NAT_NAME:-${PSC_VPC_NAME}-nat}"

  # Custom VPC without PSC uses the base name (default: playwright-osd).
  NON_PSC_VPC_NAME="${NON_PSC_VPC_NAME:-${VPC_NAME}}"
  NON_PSC_CONTROLPLANE_SUBNET="${NON_PSC_CONTROLPLANE_SUBNET:-${NON_PSC_VPC_NAME}-controlplane}"
  NON_PSC_COMPUTE_SUBNET="${NON_PSC_COMPUTE_SUBNET:-${NON_PSC_VPC_NAME}-compute}"
  NON_PSC_ROUTER_NAME="${NON_PSC_ROUTER_NAME:-${NON_PSC_VPC_NAME}-router}"
  NON_PSC_NAT_NAME="${NON_PSC_NAT_NAME:-${NON_PSC_VPC_NAME}-nat}"

  KEY_RING_LOCATION="${KEY_RING_LOCATION:-${REGION}}"

  local key_ring="${VPC_NAME}-keyring"
  local key_name="${VPC_NAME}-key"
  KEY_RING_NAME="${KEY_RING_NAME:-${key_ring:0:63}}"
  KEY_NAME="${KEY_NAME:-${key_name:0:63}}"

  if [[ -z "${KMS_SA_ID}" ]]; then
    # GCP service account IDs are 6-30 characters and cannot end with '-'
    local sa_id="${VPC_NAME}-sa"
    sa_id="${sa_id:0:30}"
    sa_id="${sa_id%-}"
    KMS_SA_ID="${sa_id}"
  fi
}

derive_kms_service_account_email() {
  if [[ -n "${KMS_SERVICE_ACCOUNT}" ]]; then
    KMS_SA_EMAIL="${KMS_SERVICE_ACCOUNT}"
    CREATE_KMS_SA="false"
    return 0
  fi
  KMS_SA_EMAIL="${KMS_SA_ID}@${PROJECT_ID}.iam.gserviceaccount.com"
}

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
  require_cmd gcloud
  require_cmd jq

  if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
    print_error "No GCP project set. Pass --project PROJECT_ID or run: gcloud config set project PROJECT_ID"
    exit 1
  fi

  if ! gcloud projects describe "${PROJECT_ID}" &>/dev/null; then
    print_error "Unable to access project '${PROJECT_ID}'. Check auth: gcloud auth login / gcloud auth application-default login"
    exit 1
  fi

  print_status "Using GCP project: ${PROJECT_ID}"
  print_status "Region: ${REGION}"
}

network_exists() {
  local name=${1:-${VPC_NAME}}
  gcloud compute networks describe "${name}" \
    --project="${PROJECT_ID}" \
    --format='value(name)' &>/dev/null
}

subnet_exists() {
  local subnet_name=$1
  gcloud compute networks subnets describe "${subnet_name}" \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --format='value(name)' &>/dev/null
}

router_exists() {
  local name=${1:-${ROUTER_NAME}}
  gcloud compute routers describe "${name}" \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --format='value(name)' &>/dev/null
}

nat_exists() {
  local nat_name=${1:-${NAT_NAME}}
  local router_name=${2:-${ROUTER_NAME}}
  gcloud compute routers nats describe "${nat_name}" \
    --project="${PROJECT_ID}" \
    --router="${router_name}" \
    --region="${REGION}" \
    --format='value(name)' &>/dev/null
}

create_vpc() {
  if network_exists; then
    print_found "VPC '${VPC_NAME}' already exists"
    return 0
  fi

  print_status "Creating custom-mode VPC '${VPC_NAME}'..."
  gcloud compute networks create "${VPC_NAME}" \
    --project="${PROJECT_ID}" \
    --subnet-mode=custom \
    --bgp-routing-mode=regional
  print_status "Created VPC '${VPC_NAME}'"
}

create_subnet() {
  local name=$1
  local cidr=$2
  local purpose=${3:-}

  if subnet_exists "${name}"; then
    print_found "Subnet '${name}' already exists"
    return 0
  fi

  print_status "Creating subnet '${name}' (${cidr}) in ${REGION}..."

  if [[ -n "${purpose}" ]]; then
    # PSC producer subnets: purpose only (no private Google access flag)
    gcloud compute networks subnets create "${name}" \
      --project="${PROJECT_ID}" \
      --network="${VPC_NAME}" \
      --region="${REGION}" \
      --range="${cidr}" \
      --purpose="${purpose}"
  else
    gcloud compute networks subnets create "${name}" \
      --project="${PROJECT_ID}" \
      --network="${VPC_NAME}" \
      --region="${REGION}" \
      --range="${cidr}" \
      --enable-private-ip-google-access
  fi

  print_status "Created subnet '${name}'"
}

create_subnets() {
  create_subnet "${CONTROLPLANE_SUBNET}" "${CONTROLPLANE_CIDR}"
  create_subnet "${COMPUTE_SUBNET}" "${COMPUTE_CIDR}"
  # Required for OSD PSC installs; purpose must be PRIVATE_SERVICE_CONNECT
  create_subnet "${PSC_SUBNET}" "${PSC_CIDR}" "PRIVATE_SERVICE_CONNECT"
}

create_non_psc_vpc() {
  local saved_vpc="${VPC_NAME}"
  local saved_cp="${CONTROLPLANE_SUBNET}"
  local saved_compute="${COMPUTE_SUBNET}"
  local saved_router="${ROUTER_NAME}"
  local saved_nat="${NAT_NAME}"

  VPC_NAME="${NON_PSC_VPC_NAME}"
  CONTROLPLANE_SUBNET="${NON_PSC_CONTROLPLANE_SUBNET}"
  COMPUTE_SUBNET="${NON_PSC_COMPUTE_SUBNET}"
  ROUTER_NAME="${NON_PSC_ROUTER_NAME}"
  NAT_NAME="${NON_PSC_NAT_NAME}"

  create_vpc
  create_subnet "${CONTROLPLANE_SUBNET}" "${CONTROLPLANE_CIDR}"
  create_subnet "${COMPUTE_SUBNET}" "${COMPUTE_CIDR}"
  create_cloud_nat

  VPC_NAME="${saved_vpc}"
  CONTROLPLANE_SUBNET="${saved_cp}"
  COMPUTE_SUBNET="${saved_compute}"
  ROUTER_NAME="${saved_router}"
  NAT_NAME="${saved_nat}"
}

create_cloud_nat() {
  if [[ "${CREATE_CLOUD_NAT}" != "true" ]]; then
    print_warning "Skipping Cloud NAT (CREATE_CLOUD_NAT=false). Ensure outbound internet access exists for OSD."
    return 0
  fi

  if ! router_exists; then
    print_status "Creating Cloud Router '${ROUTER_NAME}'..."
    gcloud compute routers create "${ROUTER_NAME}" \
      --project="${PROJECT_ID}" \
      --network="${VPC_NAME}" \
      --region="${REGION}"
  else
    print_found "Cloud Router '${ROUTER_NAME}' already exists"
  fi

  if ! nat_exists; then
    print_status "Creating Cloud NAT '${NAT_NAME}' for outbound internet access..."
    gcloud compute routers nats create "${NAT_NAME}" \
      --project="${PROJECT_ID}" \
      --router="${ROUTER_NAME}" \
      --region="${REGION}" \
      --nat-all-subnet-ip-ranges \
      --auto-allocate-nat-external-ips
  else
    print_found "Cloud NAT '${NAT_NAME}' already exists"
  fi
}

keyring_exists() {
  gcloud kms keyrings describe "${KEY_RING_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${KEY_RING_LOCATION}" \
    --format='value(name)' &>/dev/null
}

kms_key_exists() {
  gcloud kms keys describe "${KEY_NAME}" \
    --project="${PROJECT_ID}" \
    --keyring="${KEY_RING_NAME}" \
    --location="${KEY_RING_LOCATION}" \
    --format='value(name)' &>/dev/null
}

kms_service_account_exists() {
  gcloud iam service-accounts describe "${KMS_SA_EMAIL}" \
    --project="${PROJECT_ID}" \
    --format='value(email)' &>/dev/null
}

create_kms_keyring() {
  if keyring_exists; then
    print_found "KMS key ring '${KEY_RING_NAME}' (${KEY_RING_LOCATION}) already exists"
    return 0
  fi

  print_status "Creating KMS key ring '${KEY_RING_NAME}' in location '${KEY_RING_LOCATION}'..."
  gcloud kms keyrings create "${KEY_RING_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${KEY_RING_LOCATION}"
  print_status "Created KMS key ring '${KEY_RING_NAME}'"
}

create_kms_crypto_key() {
  if kms_key_exists; then
    print_found "KMS crypto key '${KEY_NAME}' already exists"
    return 0
  fi

  print_status "Creating KMS crypto key '${KEY_NAME}' (purpose=encryption)..."
  gcloud kms keys create "${KEY_NAME}" \
    --project="${PROJECT_ID}" \
    --keyring="${KEY_RING_NAME}" \
    --location="${KEY_RING_LOCATION}" \
    --purpose=encryption
  print_status "Created KMS crypto key '${KEY_NAME}'"
}

create_kms_service_account() {
  if [[ "${CREATE_KMS_SA}" != "true" ]]; then
    if ! kms_service_account_exists; then
      print_error "KMS service account '${KMS_SA_EMAIL}' not found; create it or omit --kms-service-account"
      exit 1
    fi
    print_found "Using existing KMS service account '${KMS_SA_EMAIL}'"
    return 0
  fi

  if kms_service_account_exists; then
    print_found "KMS service account '${KMS_SA_EMAIL}' already exists"
    return 0
  fi

  print_status "Creating KMS service account '${KMS_SA_ID}'..."
  gcloud iam service-accounts create "${KMS_SA_ID}" \
    --project="${PROJECT_ID}" \
    --display-name="OCM UI QE OSD GCP KMS (${KMS_SA_ID})"
  print_status "Created KMS service account '${KMS_SA_EMAIL}'"
}

grant_kms_role() {
  local member=$1
  print_status "Granting roles/cloudkms.cryptoKeyEncrypterDecrypter on '${KEY_NAME}' to '${member}'..."
  gcloud kms keys add-iam-policy-binding "${KEY_NAME}" \
    --project="${PROJECT_ID}" \
    --keyring="${KEY_RING_NAME}" \
    --location="${KEY_RING_LOCATION}" \
    --member="${member}" \
    --role="roles/cloudkms.cryptoKeyEncrypterDecrypter" \
    --quiet
}

grant_kms_crypto_key_access() {
  grant_kms_role "serviceAccount:${KMS_SA_EMAIL}"

  local project_number compute_sa
  project_number=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
  compute_sa="service-${project_number}@compute-system.iam.gserviceaccount.com"
  grant_kms_role "serviceAccount:${compute_sa}"
}

create_kms() {
  if [[ "${CREATE_KMS}" != "true" ]]; then
    print_warning "Skipping Cloud KMS (CREATE_KMS=false). Set QE_GCP_KEY_* in playwright.env.json manually."
    return 0
  fi

  derive_kms_service_account_email
  print_status "KMS resources use the '${VPC_NAME}' prefix; creating only the ones that are missing"
  create_kms_keyring
  create_kms_crypto_key
  create_kms_service_account
  grant_kms_crypto_key_access
}

validate_resources() {
  print_status "=== Validating GCP infrastructure ==="
  local failed=false

  if [[ "${CREATE_PSC}" == "true" ]]; then
    if ! network_exists "${PSC_VPC_NAME}"; then
      print_error "VPC '${PSC_VPC_NAME}' is missing"
      failed=true
    fi

    for subnet in "${CONTROLPLANE_SUBNET}" "${COMPUTE_SUBNET}" "${PSC_SUBNET}"; do
      if ! subnet_exists "${subnet}"; then
        print_error "Subnet '${subnet}' is missing"
        failed=true
      fi
    done

    local psc_purpose
    psc_purpose=$(gcloud compute networks subnets describe "${PSC_SUBNET}" \
      --project="${PROJECT_ID}" \
      --region="${REGION}" \
      --format='value(purpose)' 2>/dev/null || true)
    if [[ "${psc_purpose}" != "PRIVATE_SERVICE_CONNECT" ]]; then
      print_error "Subnet '${PSC_SUBNET}' purpose is '${psc_purpose:-unknown}', expected PRIVATE_SERVICE_CONNECT"
      failed=true
    else
      print_status "PSC subnet purpose OK: PRIVATE_SERVICE_CONNECT"
    fi

    if [[ "${CREATE_CLOUD_NAT}" == "true" ]]; then
      if ! router_exists; then
        print_error "Cloud Router '${ROUTER_NAME}' is missing"
        failed=true
      fi
      if ! nat_exists; then
        print_error "Cloud NAT '${NAT_NAME}' is missing"
        failed=true
      fi
    fi
  fi

  if ! network_exists "${NON_PSC_VPC_NAME}"; then
    print_error "VPC '${NON_PSC_VPC_NAME}' is missing"
    failed=true
  fi
  for subnet in "${NON_PSC_CONTROLPLANE_SUBNET}" "${NON_PSC_COMPUTE_SUBNET}"; do
    if ! subnet_exists "${subnet}"; then
      print_error "Subnet '${subnet}' is missing"
      failed=true
    fi
  done
  if [[ "${CREATE_CLOUD_NAT}" == "true" ]]; then
    if ! router_exists "${NON_PSC_ROUTER_NAME}"; then
      print_error "Cloud Router '${NON_PSC_ROUTER_NAME}' is missing"
      failed=true
    fi
    if ! nat_exists "${NON_PSC_NAT_NAME}" "${NON_PSC_ROUTER_NAME}"; then
      print_error "Cloud NAT '${NON_PSC_NAT_NAME}' is missing"
      failed=true
    fi
  fi

  if [[ "${CREATE_KMS}" == "true" ]]; then
    derive_kms_service_account_email
    if ! keyring_exists; then
      print_error "KMS key ring '${KEY_RING_NAME}' (${KEY_RING_LOCATION}) is missing"
      failed=true
    fi
    if ! kms_key_exists; then
      print_error "KMS crypto key '${KEY_NAME}' is missing"
      failed=true
    fi
    if ! kms_service_account_exists; then
      print_error "KMS service account '${KMS_SA_EMAIL}' is missing"
      failed=true
    fi
  fi

  if [[ "${failed}" == "true" ]]; then
    return 1
  fi

  print_status "All expected resources are present"
  return 0
}

print_summary() {
  local psc_summary="PSC VPC:              skipped (--psc false)"
  if [[ "${CREATE_PSC}" == "true" ]]; then
    psc_summary=$(cat <<EOF
PSC VPC:              ${PSC_VPC_NAME}
  Control plane:      ${CONTROLPLANE_SUBNET} (${CONTROLPLANE_CIDR})
  Compute:            ${COMPUTE_SUBNET} (${COMPUTE_CIDR})
  PSC subnet:         ${PSC_SUBNET} (${PSC_CIDR}, purpose=PRIVATE_SERVICE_CONNECT)
  Router / NAT:       ${ROUTER_NAME} / ${NAT_NAME}
EOF
)
  fi

  cat <<EOF

=== GCP OSD VPC summary ===
Project:              ${PROJECT_ID}
Region:               ${REGION}
${psc_summary}
Non-PSC VPC:          ${NON_PSC_VPC_NAME}
  Control plane:      ${NON_PSC_CONTROLPLANE_SUBNET} (${CONTROLPLANE_CIDR})
  Compute:            ${NON_PSC_COMPUTE_SUBNET} (${COMPUTE_CIDR})
  Router / NAT:       ${NON_PSC_ROUTER_NAME} / ${NON_PSC_NAT_NAME}
Cloud NAT enabled:    ${CREATE_CLOUD_NAT}
Cloud KMS:            ${KEY_RING_NAME} / ${KEY_NAME} @ ${KEY_RING_LOCATION} (enabled=${CREATE_KMS})
KMS service account:  ${KMS_SA_EMAIL:-<set when CREATE_KMS=true>}

Suggested Machine CIDR for OSD wizard: 10.0.0.0/16
  (must contain all three subnet ranges)

Use for:
  - OSD custom VPC: ${NON_PSC_VPC_NAME} + control-plane + compute
  - OSD PSC:        ${PSC_VPC_NAME} + control-plane + compute + PSC subnet

EOF
}

merge_playwright_env_json() {
  local input_file=$1
  local gcp_json=$2
  jq \
    --argjson gcp "${gcp_json}" \
    --arg kms_enabled "${CREATE_KMS}" \
    --arg key_loc "${KEY_RING_LOCATION}" \
    --arg key_ring "${KEY_RING_NAME}" \
    --arg key_name "${KEY_NAME}" \
    --arg kms_sa "${KMS_SA_EMAIL}" \
    '
      .QE_INFRA_GCP = ((.QE_INFRA_GCP // {}) + $gcp)
      | if ($gcp | has("PSC_INFRA")) then
          .QE_INFRA_GCP.PSC_INFRA = ((.QE_INFRA_GCP.PSC_INFRA // {}) + $gcp.PSC_INFRA)
        else .
        end
      | if $kms_enabled == "true" then
          .QE_GCP_KEY_RING_LOCATION = (if (.QE_GCP_KEY_RING_LOCATION // "") == "" then $key_loc else .QE_GCP_KEY_RING_LOCATION end)
          | .QE_GCP_KEY_RING = (if (.QE_GCP_KEY_RING // "") == "" then $key_ring else .QE_GCP_KEY_RING end)
          | .QE_GCP_KEY_NAME = (if (.QE_GCP_KEY_NAME // "") == "" then $key_name else .QE_GCP_KEY_NAME end)
          | .QE_GCP_KMS_SERVICE_ACCOUNT = (if (.QE_GCP_KMS_SERVICE_ACCOUNT // "") == "" then $kms_sa else .QE_GCP_KMS_SERVICE_ACCOUNT end)
        else .
        end
    ' "${input_file}"
}

update_playwright_env() {
  if [[ "${UPDATE_PLAYWRIGHT_ENV}" != "true" ]]; then
    print_warning "Skipping playwright.env.json update (UPDATE_PLAYWRIGHT_ENV=false)"
    return 0
  fi

  if [[ "${CREATE_KMS}" == "true" ]]; then
    derive_kms_service_account_email
  fi

  local gcp_infra_json
  if [[ "${CREATE_PSC}" == "true" ]]; then
    gcp_infra_json=$(jq -n \
      --arg region "${REGION}" \
      --arg vpc "${NON_PSC_VPC_NAME}" \
      --arg cp "${NON_PSC_CONTROLPLANE_SUBNET}" \
      --arg compute "${NON_PSC_COMPUTE_SUBNET}" \
      --arg psc_vpc "${PSC_VPC_NAME}" \
      --arg psc_cp "${CONTROLPLANE_SUBNET}" \
      --arg psc_compute "${COMPUTE_SUBNET}" \
      --arg psc "${PSC_SUBNET}" \
      '{
        REGION: $region,
        VPC_NAME: $vpc,
        CONTROLPLANE_SUBNET: $cp,
        COMPUTE_SUBNET: $compute,
        PSC_INFRA: {
          REGION: $region,
          VPC_NAME: $psc_vpc,
          CONTROLPLANE_SUBNET: $psc_cp,
          COMPUTE_SUBNET: $psc_compute,
          PRIVATE_SERVICE_CONNECT_SUBNET: $psc
        }
      }')
  else
    gcp_infra_json=$(jq -n \
      --arg region "${REGION}" \
      --arg vpc "${NON_PSC_VPC_NAME}" \
      --arg cp "${NON_PSC_CONTROLPLANE_SUBNET}" \
      --arg compute "${NON_PSC_COMPUTE_SUBNET}" \
      '{
        REGION: $region,
        VPC_NAME: $vpc,
        CONTROLPLANE_SUBNET: $cp,
        COMPUTE_SUBNET: $compute
      }')
  fi

  if [[ -f "${PLAYWRIGHT_ENV_FILE}" ]]; then
    if ! jq empty "${PLAYWRIGHT_ENV_FILE}" >/dev/null 2>&1; then
      print_error "Invalid JSON in ${PLAYWRIGHT_ENV_FILE}"
      exit 1
    fi

    cp "${PLAYWRIGHT_ENV_FILE}" "${PLAYWRIGHT_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    print_status "Merging QE_INFRA_GCP into ${PLAYWRIGHT_ENV_FILE}; filling only missing QE_GCP_KEY_* values"
    merge_playwright_env_json "${PLAYWRIGHT_ENV_FILE}" "${gcp_infra_json}" > "${PLAYWRIGHT_ENV_FILE}.tmp" \
      && mv "${PLAYWRIGHT_ENV_FILE}.tmp" "${PLAYWRIGHT_ENV_FILE}"
  else
    print_status "Creating ${PLAYWRIGHT_ENV_FILE}"
    if [[ "${CREATE_KMS}" == "true" ]]; then
      jq -n \
        --argjson gcp "${gcp_infra_json}" \
        --arg key_loc "${KEY_RING_LOCATION}" \
        --arg key_ring "${KEY_RING_NAME}" \
        --arg key_name "${KEY_NAME}" \
        --arg kms_sa "${KMS_SA_EMAIL}" \
        '{
          QE_INFRA_GCP: $gcp,
          QE_GCP_KEY_RING_LOCATION: $key_loc,
          QE_GCP_KEY_RING: $key_ring,
          QE_GCP_KEY_NAME: $key_name,
          QE_GCP_KMS_SERVICE_ACCOUNT: $kms_sa
        }' > "${PLAYWRIGHT_ENV_FILE}"
    else
      jq -n --argjson gcp "${gcp_infra_json}" '{ QE_INFRA_GCP: $gcp }' > "${PLAYWRIGHT_ENV_FILE}"
    fi
  fi

  print_status "Updated ${PLAYWRIGHT_ENV_FILE}"
}

cleanup_cloud_nat() {
  if nat_exists; then
    print_status "Deleting Cloud NAT '${NAT_NAME}'..."
    gcloud compute routers nats delete "${NAT_NAME}" \
      --project="${PROJECT_ID}" \
      --router="${ROUTER_NAME}" \
      --region="${REGION}" \
      --quiet
  fi

  if router_exists; then
    print_status "Deleting Cloud Router '${ROUTER_NAME}'..."
    gcloud compute routers delete "${ROUTER_NAME}" \
      --project="${PROJECT_ID}" \
      --region="${REGION}" \
      --quiet
  fi
}

cleanup_subnets() {
  for subnet in "${PSC_SUBNET}" "${COMPUTE_SUBNET}" "${CONTROLPLANE_SUBNET}"; do
    [[ -z "${subnet}" ]] && continue
    if subnet_exists "${subnet}"; then
      print_status "Deleting subnet '${subnet}'..."
      gcloud compute networks subnets delete "${subnet}" \
        --project="${PROJECT_ID}" \
        --region="${REGION}" \
        --quiet
    fi
  done
}

cleanup_vpc() {
  if network_exists; then
    print_status "Deleting VPC '${VPC_NAME}'..."
    gcloud compute networks delete "${VPC_NAME}" \
      --project="${PROJECT_ID}" \
      --quiet
  fi
}

cleanup_playwright_env() {
  if [[ ! -f "${PLAYWRIGHT_ENV_FILE}" ]]; then
    return 0
  fi
  if ! jq empty "${PLAYWRIGHT_ENV_FILE}" >/dev/null 2>&1; then
    print_warning "Could not parse ${PLAYWRIGHT_ENV_FILE}; skip config cleanup"
    return 0
  fi

  print_status "Clearing matching QE_INFRA_GCP / PSC_INFRA entries from ${PLAYWRIGHT_ENV_FILE}"
  jq --arg vpc "${NON_PSC_VPC_NAME}" \
    --arg psc_vpc "${PSC_VPC_NAME}" \
    --arg psc_enabled "${CREATE_PSC}" \
    '
    if (.QE_INFRA_GCP.VPC_NAME // "") == $vpc then
      del(.QE_INFRA_GCP.VPC_NAME, .QE_INFRA_GCP.CONTROLPLANE_SUBNET, .QE_INFRA_GCP.COMPUTE_SUBNET, .QE_INFRA_GCP.REGION)
    else . end
    | if $psc_enabled == "true" and (.QE_INFRA_GCP.PSC_INFRA.VPC_NAME // "") == $psc_vpc then
        del(.QE_INFRA_GCP.PSC_INFRA)
      else .
      end
  ' "${PLAYWRIGHT_ENV_FILE}" > "${PLAYWRIGHT_ENV_FILE}.tmp" \
    && mv "${PLAYWRIGHT_ENV_FILE}.tmp" "${PLAYWRIGHT_ENV_FILE}"
}

cleanup_named_vpc() {
  local saved_vpc="${VPC_NAME}"
  local saved_router="${ROUTER_NAME}"
  local saved_nat="${NAT_NAME}"
  local saved_cp="${CONTROLPLANE_SUBNET}"
  local saved_compute="${COMPUTE_SUBNET}"
  local saved_psc="${PSC_SUBNET}"

  VPC_NAME=$1
  ROUTER_NAME=$2
  NAT_NAME=$3
  CONTROLPLANE_SUBNET=$4
  COMPUTE_SUBNET=$5
  PSC_SUBNET=$6

  if network_exists; then
    cleanup_cloud_nat
    cleanup_subnets
    cleanup_vpc
  else
    print_warning "VPC '${VPC_NAME}' not found; skipping VPC/NAT cleanup"
  fi

  VPC_NAME="${saved_vpc}"
  ROUTER_NAME="${saved_router}"
  NAT_NAME="${saved_nat}"
  CONTROLPLANE_SUBNET="${saved_cp}"
  COMPUTE_SUBNET="${saved_compute}"
  PSC_SUBNET="${saved_psc}"
}

cleanup_infrastructure() {
  local targets="'${NON_PSC_VPC_NAME}'"
  if [[ "${CREATE_PSC}" == "true" ]]; then
    targets="'${NON_PSC_VPC_NAME}' and PSC VPC '${PSC_VPC_NAME}'"
  fi
  print_warning "This will DELETE VPC ${targets} (and related subnets/NAT) in ${REGION} (${PROJECT_ID}). KMS keys and QE_GCP_KEY_* values are left in place."
  check_prereqs

  if [[ "${CREATE_PSC}" == "true" ]]; then
    cleanup_named_vpc "${PSC_VPC_NAME}" "${ROUTER_NAME}" "${NAT_NAME}" \
      "${CONTROLPLANE_SUBNET}" "${COMPUTE_SUBNET}" "${PSC_SUBNET}"
  fi
  cleanup_named_vpc "${NON_PSC_VPC_NAME}" "${NON_PSC_ROUTER_NAME}" "${NON_PSC_NAT_NAME}" \
    "${NON_PSC_CONTROLPLANE_SUBNET}" "${NON_PSC_COMPUTE_SUBNET}" ""

  cleanup_playwright_env
  print_status "Cleanup completed"
}

main() {
  print_status "Starting GCP VPC (+ optional KMS) setup for OSD GCP tests"
  check_prereqs
  if [[ "${CREATE_PSC}" == "true" ]]; then
    local saved_vpc="${VPC_NAME}"
    VPC_NAME="${PSC_VPC_NAME}"
    create_vpc
    create_subnets
    create_cloud_nat
    VPC_NAME="${saved_vpc}"
  else
    print_warning "Skipping PSC VPC and PSC_INFRA (--psc false)."
  fi
  create_non_psc_vpc
  create_kms

  if validate_resources; then
    print_summary
    update_playwright_env
  else
    print_error "Validation failed"
    exit 1
  fi
}

validate_only() {
  check_prereqs
  if validate_resources; then
    print_summary
    update_playwright_env
  else
    exit 1
  fi
}

show_usage() {
  cat <<EOF
Usage: $0 [OPTIONS]

Create a Google Cloud custom VPC for OSD custom-VPC and OSD PSC installs
in us-central1 (or another region).

Creates:
  - Non-PSC VPC (default: playwright-osd) with control plane and compute subnets
  - PSC VPC (default: playwright-psc-osd) with control plane, compute, and PSC subnets
  - Cloud Router + Cloud NAT on each VPC (outbound internet; recommended for OSD)
  - Cloud KMS key ring + crypto key + service account (for OSD custom encryption; default on)

Configuration (CLI or env):
  --project PROJECT_ID          GCP project (default: gcloud config project)
  --region REGION               Region (default: us-central1)
  --vpc-name NAME               Non-PSC VPC name (default: playwright-osd; PSC VPC: playwright-psc-osd)
  --controlplane-subnet NAME    Control plane subnet name
  --compute-subnet NAME         Compute subnet name
  --psc-subnet NAME             PSC subnet name
  --controlplane-cidr CIDR      Default: 10.0.0.0/20
  --compute-cidr CIDR           Default: 10.0.16.0/20
  --psc-cidr CIDR               Default: 10.0.32.0/29
  --psc true|false              Create PSC VPC and PSC_INFRA (default: true)
  --skip-nat                    Do not create Cloud Router / NAT
  --skip-kms                    Do not create Cloud KMS / QE_GCP_KEY_* env keys
  --key-ring-location LOC       KMS key ring location (default: the --region value)
  --key-ring-name NAME          KMS key ring (default: <vpc-name>-keyring)
  --key-name NAME               KMS crypto key (default: <vpc-name>-key)
  --kms-sa-id ID                KMS service account ID (default: <vpc-name>-sa)
  --kms-service-account EMAIL   Use existing SA email (do not create another account)
  --skip-env-update             Do not update playwright.env.json

Modes:
  --validate-only               Validate existing resources only
  --cleanup                     Delete created resources (DESTRUCTIVE)
  --help                        Show this help

Examples:
  $0 --project my-gcp-project
  $0 --project my-gcp-project --vpc-name jaya-osd-psc-vpc
  $0 --project my-gcp-project --psc false
  $0 --project my-gcp-project --validate-only
  $0 --project my-gcp-project --vpc-name jaya-osd-psc-vpc --cleanup
EOF
}

MODE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT_ID="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --vpc-name)
      VPC_NAME="$2"
      shift 2
      ;;
    --controlplane-subnet)
      CONTROLPLANE_SUBNET="$2"
      shift 2
      ;;
    --compute-subnet)
      COMPUTE_SUBNET="$2"
      shift 2
      ;;
    --psc-subnet)
      PSC_SUBNET="$2"
      shift 2
      ;;
    --controlplane-cidr)
      CONTROLPLANE_CIDR="$2"
      shift 2
      ;;
    --compute-cidr)
      COMPUTE_CIDR="$2"
      shift 2
      ;;
    --psc-cidr)
      PSC_CIDR="$2"
      shift 2
      ;;
    --psc)
      case "$2" in
        true|false) CREATE_PSC="$2" ;;
        *)
          print_error "--psc must be true or false"
          exit 1
          ;;
      esac
      shift 2
      ;;
    --skip-nat)
      CREATE_CLOUD_NAT="false"
      shift
      ;;
    --skip-kms)
      CREATE_KMS="false"
      shift
      ;;
    --key-ring-location)
      KEY_RING_LOCATION="$2"
      shift 2
      ;;
    --key-ring-name)
      KEY_RING_NAME="$2"
      shift 2
      ;;
    --key-name)
      KEY_NAME="$2"
      shift 2
      ;;
    --kms-sa-id)
      KMS_SA_ID="$2"
      shift 2
      ;;
    --kms-service-account)
      KMS_SERVICE_ACCOUNT="$2"
      shift 2
      ;;
    --skip-env-update)
      UPDATE_PLAYWRIGHT_ENV="false"
      shift
      ;;
    --validate-only)
      MODE="validate"
      shift
      ;;
    --cleanup)
      MODE="cleanup"
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

derive_resource_names

case "${MODE}" in
  validate) validate_only ;;
  cleanup)  cleanup_infrastructure ;;
  *)        main ;;
esac
