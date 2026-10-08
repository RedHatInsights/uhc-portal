#!/usr/bin/env bash
# Create or delete a GCP VPC for testing:
#   - custom VPC (regional routing)
#   - control-plane, worker, and PSC subnets in one region
#   - Cloud Router + public Cloud NAT (AUTO_ONLY, all subnets)
#
# Usage:
#   ./create-gcp-vpc.sh <name> [--project PROJECT] [--region REGION]
#   ./create-gcp-vpc.sh <name> -d [--project PROJECT] [--region REGION]
#
# Example:
#   ./create-gcp-vpc.sh my-test-vpc
#   ./create-gcp-vpc.sh my-test-vpc -d
#   ./create-gcp-vpc.sh my-test-vpc --project ocm-ui-dev --region us-west1

set -euo pipefail

usage() {
  cat <<EOF
Usage: $(basename "$0") <name> [-d|--delete] [--project PROJECT] [--region REGION]

Creates (default) or deletes (-d) these resources:
  <name>                         custom VPC (REGIONAL routing)
  <name>-control-plane           10.0.0.0/25   PRIVATE + PGA
  <name>-psc                     10.0.0.128/29 PRIVATE_SERVICE_CONNECT
  <name>-worker                  10.0.2.0/23   PRIVATE + PGA
  <name>-router                  Cloud Router
  <name>-nat                     Cloud NAT (AUTO_ONLY, all subnet ranges)

Defaults:
  --project  current gcloud project (or ocm-ui-dev if unset)
  --region   us-west1
EOF
  exit 1
}

if [[ $# -lt 1 ]]; then
  usage
fi

NAME=""
DELETE=false
PROJECT="$(gcloud config get-value project 2>/dev/null || true)"
if [[ -z "$PROJECT" || "$PROJECT" == "(unset)" ]]; then
  PROJECT="ocm-ui-dev"
fi
REGION="us-west1"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      ;;
    -d|--delete)
      DELETE=true
      shift
      ;;
    --project)
      PROJECT="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      ;;
    *)
      if [[ -n "$NAME" ]]; then
        echo "Unexpected argument: $1" >&2
        usage
      fi
      NAME="$1"
      shift
      ;;
  esac
done

if [[ -z "$NAME" ]]; then
  usage
fi

NETWORK="$NAME"
CONTROL_PLANE_SUBNET="${NAME}-control-plane"
WORKER_SUBNET="${NAME}-worker"
PSC_SUBNET="${NAME}-psc"
ROUTER="${NAME}-router"
NAT="${NAME}-nat"

CONTROL_PLANE_CIDR="10.0.0.0/25"
WORKER_CIDR="10.0.2.0/23"
PSC_CIDR="10.0.0.128/29"

echo "==> Project:  $PROJECT"
echo "==> Region:   $REGION"
echo "==> Network:  $NETWORK"
echo "==> Mode:     $([[ "$DELETE" == true ]] && echo delete || echo create)"
echo

delete_resources() {
  # Order matters: NAT -> router -> firewalls -> subnets -> network
  echo "==> Deleting Cloud NAT: $NAT"
  gcloud compute routers nats delete "$NAT" \
    --project="$PROJECT" \
    --router="$ROUTER" \
    --region="$REGION" \
    --quiet || echo "    (NAT not found or already deleted)"

  echo "==> Deleting Cloud Router: $ROUTER"
  gcloud compute routers delete "$ROUTER" \
    --project="$PROJECT" \
    --region="$REGION" \
    --quiet || echo "    (router not found or already deleted)"

  echo "==> Deleting firewall rules for network: $NETWORK"
  local fw_rules=""
  local fw_list_rc=0
  fw_rules="$(gcloud compute firewall-rules list \
    --project="$PROJECT" \
    --filter="network=https://www.googleapis.com/compute/v1/projects/${PROJECT}/global/networks/${NETWORK}" \
    --format="value(name)" 2>&1)" || fw_list_rc=$?
  if [[ "$fw_list_rc" -ne 0 ]]; then
    echo "ERROR: failed to list firewall rules for network: $NETWORK" >&2
    echo "$fw_rules" >&2
    return 1
  fi
  if [[ -z "$fw_rules" ]]; then
    echo "    (no firewall rules found)"
  else
    while IFS= read -r rule; do
      [[ -z "$rule" ]] && continue
      echo "    deleting firewall rule: $rule"
      gcloud compute firewall-rules delete "$rule" \
        --project="$PROJECT" \
        --quiet || echo "    (failed to delete $rule)"
    done <<< "$fw_rules"
  fi

  for subnet in "$CONTROL_PLANE_SUBNET" "$WORKER_SUBNET" "$PSC_SUBNET"; do
    echo "==> Deleting subnet: $subnet"
    gcloud compute networks subnets delete "$subnet" \
      --project="$PROJECT" \
      --region="$REGION" \
      --quiet || echo "    (subnet not found or already deleted)"
  done

  echo "==> Deleting VPC network: $NETWORK"
  local describe_err=""
  local describe_rc=0
  # Capture stderr only; treat not-found as absent, fail on permission/API errors.
  describe_err="$(gcloud compute networks describe "$NETWORK" \
    --project="$PROJECT" \
    --format="value(name)" 2>&1 >/dev/null)" || describe_rc=$?
  if [[ "$describe_rc" -eq 0 ]]; then
    if gcloud compute networks delete "$NETWORK" \
      --project="$PROJECT" \
      --quiet; then
      :
    else
      echo "ERROR: failed to delete VPC network: $NETWORK" >&2
      return 1
    fi
  elif [[ "$describe_err" == *"was not found"* || "$describe_err" == *"NOT_FOUND"* ]]; then
    echo "    (network not found or already deleted)"
  else
    echo "ERROR: failed to look up VPC network: $NETWORK" >&2
    echo "$describe_err" >&2
    return 1
  fi

  echo
  echo "Done. Deleted resources for: $NETWORK"
}

create_resources() {
  echo "==> Creating VPC network: $NETWORK"
  gcloud compute networks create "$NETWORK" \
    --project="$PROJECT" \
    --subnet-mode=custom \
    --bgp-routing-mode=regional

  echo "==> Creating subnet: $CONTROL_PLANE_SUBNET ($CONTROL_PLANE_CIDR)"
  gcloud compute networks subnets create "$CONTROL_PLANE_SUBNET" \
    --project="$PROJECT" \
    --network="$NETWORK" \
    --region="$REGION" \
    --range="$CONTROL_PLANE_CIDR" \
    --enable-private-ip-google-access \
    --stack-type=IPV4_ONLY \
    --purpose=PRIVATE

  echo "==> Creating subnet: $WORKER_SUBNET ($WORKER_CIDR)"
  gcloud compute networks subnets create "$WORKER_SUBNET" \
    --project="$PROJECT" \
    --network="$NETWORK" \
    --region="$REGION" \
    --range="$WORKER_CIDR" \
    --enable-private-ip-google-access \
    --stack-type=IPV4_ONLY \
    --purpose=PRIVATE

  echo "==> Creating subnet: $PSC_SUBNET ($PSC_CIDR)"
  gcloud compute networks subnets create "$PSC_SUBNET" \
    --project="$PROJECT" \
    --network="$NETWORK" \
    --region="$REGION" \
    --range="$PSC_CIDR" \
    --stack-type=IPV4_ONLY \
    --purpose=PRIVATE_SERVICE_CONNECT

  echo "==> Creating Cloud Router: $ROUTER"
  gcloud compute routers create "$ROUTER" \
    --project="$PROJECT" \
    --network="$NETWORK" \
    --region="$REGION"

  echo "==> Creating Cloud NAT: $NAT"
  gcloud compute routers nats create "$NAT" \
    --project="$PROJECT" \
    --router="$ROUTER" \
    --region="$REGION" \
    --auto-allocate-nat-external-ips \
    --nat-all-subnet-ip-ranges \
    --endpoint-types=ENDPOINT_TYPE_VM

  echo
  echo "Done. Created:"
  echo "  network: $NETWORK"
  echo "  subnets: $CONTROL_PLANE_SUBNET, $WORKER_SUBNET, $PSC_SUBNET"
  echo "  router:  $ROUTER"
  echo "  nat:     $NAT"
  echo
  echo "Note: firewall rules were not created (by design)."
}

if [[ "$DELETE" == true ]]; then
  delete_resources
else
  create_resources
fi
