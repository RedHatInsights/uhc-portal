#!/bin/bash

# GCP Infrastructure Setup Script for OSD-GCP E2E tests.
#
# Creates: VPC network (custom mode), controlplane subnet, compute subnet,
#          PSC subnet (Private Service Connect), Cloud Router + NAT,
#          optional KMS key ring/key, and optional KMS service account.
#
# Writes QE_INFRA_GCP into playwright.env.json so Playwright tests can
# reference VPC_NAME, CONTROLPLANE_SUBNET, COMPUTE_SUBNET, etc.
#
# Requires: gcloud CLI authenticated with a service account that has
#           compute.admin, iam.serviceAccountAdmin, and cloudkms.admin roles.
#
# Usage:
#   # Create:
#   ./create-gcp-infrastructure.sh --project my-project --vpc-name ocmui-12345
#
#   # Create with KMS:
#   ./create-gcp-infrastructure.sh --project my-project --vpc-name ocmui-12345 \
#       --key-ring-name playwright-osd-keyring --key-name playwright-osd-key \
#       --kms-sa-id playwright-osd-sa
#
#   # Cleanup (does NOT delete KMS — keys cannot be immediately destroyed):
#   ./create-gcp-infrastructure.sh --project my-project --vpc-name ocmui-12345 --cleanup

set -euo pipefail

# Detect script directory and repository root.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration file location (override with PLAYWRIGHT_ENV_FILE).
PLAYWRIGHT_ENV_FILE="${PLAYWRIGHT_ENV_FILE:-$REPO_ROOT/playwright.env.json}"

# ---------------------------------------------------------------------------
# Defaults — all overridable via CLI flags.
# ---------------------------------------------------------------------------
PROJECT=""
VPC_NAME=""
REGION="${REGION:-us-central1}"
VPC_CIDR="10.0.0.0/16"
CONTROLPLANE_CIDR="10.0.1.0/24"
COMPUTE_CIDR="10.0.2.0/24"
PSC_CIDR="10.0.3.0/28"
KEY_RING_NAME=""
KEY_NAME=""
KMS_SA_ID=""
MODE=""   # empty = create, "cleanup" = teardown

# ---------------------------------------------------------------------------
# Colours / logging.
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { printf "${GREEN}[GCP-INFO]${NC} %s\n" "$1"; }
warn()  { printf "${YELLOW}[GCP-WARN]${NC} %s\n" "$1" >&2; }
err()   { printf "${RED}[GCP-ERROR]${NC} %s\n" "$1" >&2; }
found() { printf "${BLUE}[GCP-FOUND]${NC} %s\n" "$1"; }

# ---------------------------------------------------------------------------
# Argument parsing.
# ---------------------------------------------------------------------------
show_usage() {
  cat <<EOF
Usage: $0 [OPTIONS]

GCP Infrastructure Setup for OSD-GCP Playwright E2E tests.

Required:
  --project PROJECT          GCP project ID
  --vpc-name NAME            VPC network name (ephemeral, per-build)

Optional:
  --region REGION            GCP region (default: us-central1)
  --key-ring-name NAME       Cloud KMS key-ring name (fixed across builds)
  --key-name NAME            Cloud KMS key name inside the key-ring
  --kms-sa-id ID             Service-account ID for KMS access
  --cleanup                  Delete VPC resources (KMS is NOT deleted)
  --help                     Show this message
EOF
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --project)       PROJECT="$2"; shift 2 ;;
    --vpc-name)      VPC_NAME="$2"; shift 2 ;;
    --region)        REGION="$2"; shift 2 ;;
    --key-ring-name) KEY_RING_NAME="$2"; shift 2 ;;
    --key-name)      KEY_NAME="$2"; shift 2 ;;
    --kms-sa-id)     KMS_SA_ID="$2"; shift 2 ;;
    --cleanup)       MODE="cleanup"; shift ;;
    --help)          show_usage; exit 0 ;;
    *) err "Unknown option: $1"; show_usage; exit 1 ;;
  esac
done

if [[ -z "${PROJECT}" ]]; then
  err "--project is required"
  show_usage
  exit 1
fi
if [[ -z "${VPC_NAME}" ]]; then
  err "--vpc-name is required"
  show_usage
  exit 1
fi

# Derived names.
CONTROLPLANE_SUBNET="${VPC_NAME}-controlplane"
COMPUTE_SUBNET="${VPC_NAME}-compute"
PSC_SUBNET="${VPC_NAME}-psc"
ROUTER_NAME="${VPC_NAME}-router"
NAT_NAME="${VPC_NAME}-nat"

# ---------------------------------------------------------------------------
# Prerequisite checks.
# ---------------------------------------------------------------------------
check_gcloud() {
  if ! command -v gcloud &>/dev/null; then
    err "gcloud CLI not found"
    exit 1
  fi
}

check_jq() {
  if ! command -v jq &>/dev/null; then
    err "jq is not installed"
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Helpers.
# ---------------------------------------------------------------------------

# Return 0 when a GCP resource already exists.
network_exists()   { gcloud compute networks describe "${VPC_NAME}" --project="${PROJECT}" --format=json &>/dev/null; }
subnet_exists()    { gcloud compute networks subnets describe "$1" --project="${PROJECT}" --region="${REGION}" --format=json &>/dev/null; }
router_exists()    { gcloud compute routers describe "${ROUTER_NAME}" --project="${PROJECT}" --region="${REGION}" --format=json &>/dev/null; }
nat_exists()       { gcloud compute routers nats describe "${NAT_NAME}" --router="${ROUTER_NAME}" --project="${PROJECT}" --region="${REGION}" --format=json &>/dev/null; }
keyring_exists()   { gcloud kms keyrings describe "${KEY_RING_NAME}" --location="${REGION}" --project="${PROJECT}" --format=json &>/dev/null; }
key_exists()       { gcloud kms keys describe "${KEY_NAME}" --keyring="${KEY_RING_NAME}" --location="${REGION}" --project="${PROJECT}" --format=json &>/dev/null; }
sa_exists()        { gcloud iam service-accounts describe "${KMS_SA_ID}@${PROJECT}.iam.gserviceaccount.com" --project="${PROJECT}" --format=json &>/dev/null; }

# ---------------------------------------------------------------------------
# Create functions.
# ---------------------------------------------------------------------------
create_vpc() {
  if network_exists; then
    found "VPC '${VPC_NAME}' already exists"
    return 0
  fi
  log "Creating VPC network '${VPC_NAME}'..."
  gcloud compute networks create "${VPC_NAME}" \
    --project="${PROJECT}" \
    --subnet-mode=custom \
    --bgp-routing-mode=regional
  log "VPC network created"
}

create_subnet() {
  local name="$1" cidr="$2" purpose="${3:-}"

  if subnet_exists "${name}"; then
    found "Subnet '${name}' already exists"
    return 0
  fi

  log "Creating subnet '${name}' (${cidr}) in ${REGION}..."
  local args=(
    gcloud compute networks subnets create "${name}"
    --project="${PROJECT}"
    --network="${VPC_NAME}"
    --region="${REGION}"
    --range="${cidr}"
  )
  if [[ -n "${purpose}" ]]; then
    args+=(--purpose="${purpose}")
  fi
  "${args[@]}"
  log "Subnet '${name}' created"
}

create_router_and_nat() {
  if ! router_exists; then
    log "Creating Cloud Router '${ROUTER_NAME}'..."
    gcloud compute routers create "${ROUTER_NAME}" \
      --project="${PROJECT}" \
      --network="${VPC_NAME}" \
      --region="${REGION}"
    log "Cloud Router created"
  else
    found "Cloud Router '${ROUTER_NAME}' already exists"
  fi

  if ! nat_exists; then
    log "Creating Cloud NAT '${NAT_NAME}'..."
    gcloud compute routers nats create "${NAT_NAME}" \
      --router="${ROUTER_NAME}" \
      --project="${PROJECT}" \
      --region="${REGION}" \
      --nat-all-subnet-ip-ranges \
      --auto-allocate-nat-external-ips
    log "Cloud NAT created"
  else
    found "Cloud NAT '${NAT_NAME}' already exists"
  fi
}

create_kms() {
  if [[ -z "${KEY_RING_NAME}" || -z "${KEY_NAME}" ]]; then
    log "Skipping KMS setup (--key-ring-name / --key-name not provided)"
    return 0
  fi

  if ! keyring_exists; then
    log "Creating KMS key ring '${KEY_RING_NAME}' in ${REGION}..."
    gcloud kms keyrings create "${KEY_RING_NAME}" \
      --location="${REGION}" \
      --project="${PROJECT}"
    log "KMS key ring created"
  else
    found "KMS key ring '${KEY_RING_NAME}' already exists"
  fi

  if ! key_exists; then
    log "Creating KMS key '${KEY_NAME}'..."
    gcloud kms keys create "${KEY_NAME}" \
      --keyring="${KEY_RING_NAME}" \
      --location="${REGION}" \
      --project="${PROJECT}" \
      --purpose=encryption
    log "KMS key created"
  else
    found "KMS key '${KEY_NAME}' already exists"
  fi
}

create_kms_service_account() {
  if [[ -z "${KMS_SA_ID}" ]]; then
    log "Skipping KMS service account (--kms-sa-id not provided)"
    return 0
  fi

  local sa_email="${KMS_SA_ID}@${PROJECT}.iam.gserviceaccount.com"

  if ! sa_exists; then
    log "Creating service account '${KMS_SA_ID}'..."
    gcloud iam service-accounts create "${KMS_SA_ID}" \
      --project="${PROJECT}" \
      --display-name="Playwright OSD KMS SA"
    log "Service account created"
  else
    found "Service account '${KMS_SA_ID}' already exists"
  fi

  if [[ -n "${KEY_RING_NAME}" && -n "${KEY_NAME}" ]]; then
    log "Granting KMS encrypter/decrypter role to ${sa_email}..."
    gcloud kms keys add-iam-policy-binding "${KEY_NAME}" \
      --keyring="${KEY_RING_NAME}" \
      --location="${REGION}" \
      --project="${PROJECT}" \
      --member="serviceAccount:${sa_email}" \
      --role="roles/cloudkms.cryptoKeyEncrypterDecrypter" \
      --quiet
    log "KMS IAM binding set"
  fi
}

# ---------------------------------------------------------------------------
# Write QE_INFRA_GCP into the env file.
# ---------------------------------------------------------------------------
write_env_output() {
  local kms_key_id=""
  if [[ -n "${KEY_RING_NAME}" && -n "${KEY_NAME}" ]]; then
    kms_key_id="projects/${PROJECT}/locations/${REGION}/keyRings/${KEY_RING_NAME}/cryptoKeys/${KEY_NAME}"
  fi

  local kms_sa_email=""
  if [[ -n "${KMS_SA_ID}" ]]; then
    kms_sa_email="${KMS_SA_ID}@${PROJECT}.iam.gserviceaccount.com"
  fi

  # Build the QE_INFRA_GCP JSON object.
  # Top-level keys are used by non-PSC tests; PSC_INFRA is used by PSC tests.
  local infra_json
  infra_json=$(jq -n \
    --arg region "${REGION}" \
    --arg vpc "${VPC_NAME}" \
    --arg cp "${CONTROLPLANE_SUBNET}" \
    --arg compute "${COMPUTE_SUBNET}" \
    --arg psc "${PSC_SUBNET}" \
    --arg kms_key "${kms_key_id}" \
    --arg kms_sa "${kms_sa_email}" \
    '{
      REGION: $region,
      VPC_NAME: $vpc,
      CONTROLPLANE_SUBNET: $cp,
      COMPUTE_SUBNET: $compute,
      PSC_INFRA: {
        REGION: $region,
        VPC_NAME: $vpc,
        CONTROLPLANE_SUBNET: $cp,
        COMPUTE_SUBNET: $compute,
        PRIVATE_SERVICE_CONNECT_SUBNET: $psc
      }
    }
    | if $kms_key != "" then . + {KMS_KEY_ID: $kms_key} else . end
    | if $kms_sa  != "" then . + {KMS_SA_EMAIL: $kms_sa} else . end')

  if [[ -f "${PLAYWRIGHT_ENV_FILE}" ]]; then
    log "Updating QE_INFRA_GCP in ${PLAYWRIGHT_ENV_FILE}"
    jq --argjson infra "${infra_json}" \
      '.QE_INFRA_GCP = $infra' \
      "${PLAYWRIGHT_ENV_FILE}" > "${PLAYWRIGHT_ENV_FILE}.tmp" \
      && mv "${PLAYWRIGHT_ENV_FILE}.tmp" "${PLAYWRIGHT_ENV_FILE}"
  else
    log "Creating ${PLAYWRIGHT_ENV_FILE} with QE_INFRA_GCP"
    jq -n --argjson infra "${infra_json}" '{QE_INFRA_GCP: $infra}' > "${PLAYWRIGHT_ENV_FILE}"
  fi

  log "QE_INFRA_GCP written to ${PLAYWRIGHT_ENV_FILE}"
}

# ---------------------------------------------------------------------------
# Cleanup functions — delete VPC resources.  KMS is NOT deleted (keys cannot
# be immediately destroyed and key-ring names are fixed across builds).
# ---------------------------------------------------------------------------
cleanup_nat() {
  if nat_exists; then
    log "Deleting Cloud NAT '${NAT_NAME}'..."
    gcloud compute routers nats delete "${NAT_NAME}" \
      --router="${ROUTER_NAME}" \
      --project="${PROJECT}" \
      --region="${REGION}" \
      --quiet
    log "Cloud NAT deleted"
  else
    log "Cloud NAT '${NAT_NAME}' not found; skipping"
  fi
}

cleanup_router() {
  if router_exists; then
    log "Deleting Cloud Router '${ROUTER_NAME}'..."
    gcloud compute routers delete "${ROUTER_NAME}" \
      --project="${PROJECT}" \
      --region="${REGION}" \
      --quiet
    log "Cloud Router deleted"
  else
    log "Cloud Router '${ROUTER_NAME}' not found; skipping"
  fi
}

cleanup_subnet() {
  local name="$1"
  if subnet_exists "${name}"; then
    log "Deleting subnet '${name}'..."
    gcloud compute networks subnets delete "${name}" \
      --project="${PROJECT}" \
      --region="${REGION}" \
      --quiet
    log "Subnet '${name}' deleted"
  else
    log "Subnet '${name}' not found; skipping"
  fi
}

cleanup_vpc() {
  if network_exists; then
    log "Deleting VPC network '${VPC_NAME}'..."
    gcloud compute networks delete "${VPC_NAME}" \
      --project="${PROJECT}" \
      --quiet
    log "VPC network deleted"
  else
    log "VPC network '${VPC_NAME}' not found; skipping"
  fi
}

cleanup_env_output() {
  if [[ -f "${PLAYWRIGHT_ENV_FILE}" ]] && jq empty "${PLAYWRIGHT_ENV_FILE}" &>/dev/null; then
    log "Removing QE_INFRA_GCP from ${PLAYWRIGHT_ENV_FILE}"
    jq 'del(.QE_INFRA_GCP)' "${PLAYWRIGHT_ENV_FILE}" > "${PLAYWRIGHT_ENV_FILE}.tmp" \
      && mv "${PLAYWRIGHT_ENV_FILE}.tmp" "${PLAYWRIGHT_ENV_FILE}"
  fi
}

run_cleanup() {
  log "Starting GCP infrastructure cleanup (VPC=${VPC_NAME}, region=${REGION})"
  check_gcloud

  cleanup_nat
  cleanup_router
  cleanup_subnet "${PSC_SUBNET}"
  cleanup_subnet "${COMPUTE_SUBNET}"
  cleanup_subnet "${CONTROLPLANE_SUBNET}"
  cleanup_vpc
  cleanup_env_output

  log "GCP infrastructure cleanup complete"
}

# ---------------------------------------------------------------------------
# Create entry-point.
# ---------------------------------------------------------------------------
run_create() {
  log "Starting GCP infrastructure setup (VPC=${VPC_NAME}, region=${REGION}, project=${PROJECT})"
  check_gcloud
  check_jq

  create_vpc
  create_subnet "${CONTROLPLANE_SUBNET}" "${CONTROLPLANE_CIDR}"
  create_subnet "${COMPUTE_SUBNET}" "${COMPUTE_CIDR}"
  create_subnet "${PSC_SUBNET}" "${PSC_CIDR}" "PRIVATE_SERVICE_CONNECT"
  create_router_and_nat
  create_kms
  create_kms_service_account
  write_env_output

  log "GCP infrastructure setup complete"
}

# ---------------------------------------------------------------------------
# Main dispatch.
# ---------------------------------------------------------------------------
case "${MODE}" in
  cleanup) run_cleanup ;;
  *)       run_create ;;
esac
