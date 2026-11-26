# Capacity reservation helpers for create-aws-infrastructure.sh.
# Source this file; do not execute it.
#
# This file owns how a reservation is named, reused, created, and cancelled.
# The caller decides when to invoke these functions and writes
# CAPACITY_RESERVATION_ID, CAPACITY_RESERVATION_AZ, and
# CAPACITY_RESERVATION_INSTANCE_TYPE into playwright.env.json.
#
# Expects the caller to define print_status, print_warning, print_error,
# print_found, redact_sensitive, and get_availability_zones, and to set
# VPC_NAME and REGION before calling the functions.
# CLI flags stay in create-aws-infrastructure.sh and override the defaults below.

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    echo "Source this file from create-aws-infrastructure.sh; do not execute it." >&2
    exit 1
fi

# Targeted EC2 capacity reservation used by rosa-cluster-hosted-machine-pool-cr.spec.ts.
# Expires 3 hours after create or reuse, so a failed --cleanup still releases it.
# Instance type must match the machine pool (public advanced day1 workers use m6id.xlarge).
SKIP_CAPACITY_RESERVATION="${SKIP_CAPACITY_RESERVATION:-false}"
CR_INSTANCE_TYPE="${CR_INSTANCE_TYPE:-m6id.xlarge}"
CR_INSTANCE_COUNT="${CR_INSTANCE_COUNT:-3}"
CAPACITY_RESERVATION_ID=""
CAPACITY_RESERVATION_AZ=""
CAPACITY_RESERVATION_INSTANCE_TYPE=""

capacity_reservation_name() {
    echo "${VPC_NAME}-capacity-reservation"
}

# UTC end time 3 hours from now. macOS date uses -v; GNU date uses -d.
capacity_reservation_end_date() {
    if date -u -v+3H '+%Y-%m-%dT%H:%M:%SZ' >/dev/null 2>&1; then
        date -u -v+3H '+%Y-%m-%dT%H:%M:%SZ'
    else
        date -u -d '+3 hours' '+%Y-%m-%dT%H:%M:%SZ'
    fi
}

# Reuse an active or pending reservation tagged for this VPC. Sets
# CAPACITY_RESERVATION_ID, CAPACITY_RESERVATION_AZ, and
# CAPACITY_RESERVATION_INSTANCE_TYPE when one exists.
check_capacity_reservation_exists() {
    local reservation_name
    reservation_name="$(capacity_reservation_name)"

    local reservation_json
    reservation_json=$(aws ec2 describe-capacity-reservations \
        --region "$REGION" \
        --filters "Name=tag:Name,Values=${reservation_name}" "Name=state,Values=active,pending" \
        --query 'CapacityReservations[0].{ID:CapacityReservationId,AZ:AvailabilityZone,Type:InstanceType}' \
        --output json 2>/dev/null)

    local reservation_id
    reservation_id=$(echo "$reservation_json" | jq -r '.ID // empty')
    if [[ -z "$reservation_id" || "$reservation_id" == "null" ]]; then
        return 1
    fi

    CAPACITY_RESERVATION_ID="$reservation_id"
    CAPACITY_RESERVATION_AZ=$(echo "$reservation_json" | jq -r '.AZ // empty')
    local existing_type
    existing_type=$(echo "$reservation_json" | jq -r '.Type // empty')
    CAPACITY_RESERVATION_INSTANCE_TYPE="${existing_type:-$CR_INSTANCE_TYPE}"
    print_found "Capacity reservation '$reservation_name' already exists ($CAPACITY_RESERVATION_ID in $CAPACITY_RESERVATION_AZ)"
    if [[ -n "$existing_type" && "$existing_type" != "$CR_INSTANCE_TYPE" ]]; then
        print_warning "Existing capacity reservation instance type is $existing_type; requested $CR_INSTANCE_TYPE. Reusing the existing reservation."
    fi
    return 0
}

# Targeted reservation in the first subnet AZ so the HCP CR spec can pass its ID.
# Open/None machine pools in that spec do not use this ID.
create_capacity_reservation() {
    local end_date
    end_date="$(capacity_reservation_end_date)"

    if check_capacity_reservation_exists; then
        print_status "Capacity reservation expires at $end_date"
        aws ec2 modify-capacity-reservation \
            --region "$REGION" \
            --capacity-reservation-id "$CAPACITY_RESERVATION_ID" \
            --end-date-type limited \
            --end-date "$end_date" > /dev/null
        return 0
    fi

    local azs
    azs=($(get_availability_zones))
    local az="${azs[0]}"
    local reservation_name
    reservation_name="$(capacity_reservation_name)"

    print_warning "Creating a targeted capacity reservation. It expires at $end_date even if --cleanup fails."
    print_status "Creating capacity reservation '$reservation_name' ($CR_INSTANCE_COUNT x $CR_INSTANCE_TYPE in $az)..."

    local create_error
    create_error=$(mktemp)
    if ! CAPACITY_RESERVATION_ID=$(aws ec2 create-capacity-reservation \
        --region "$REGION" \
        --instance-type "$CR_INSTANCE_TYPE" \
        --instance-platform Linux/UNIX \
        --availability-zone "$az" \
        --instance-count "$CR_INSTANCE_COUNT" \
        --instance-match-criteria targeted \
        --end-date-type limited \
        --end-date "$end_date" \
        --tag-specifications "ResourceType=capacity-reservation,Tags=[{Key=Name,Value=${reservation_name}}]" \
        --query 'CapacityReservation.CapacityReservationId' \
        --output text 2>"$create_error"); then
        print_error "Failed to create capacity reservation in $az for $CR_INSTANCE_TYPE"
        print_error "$(redact_sensitive "$(cat "$create_error")")"
        rm -f "$create_error"
        exit 1
    fi
    rm -f "$create_error"

    CAPACITY_RESERVATION_AZ="$az"
    CAPACITY_RESERVATION_INSTANCE_TYPE="$CR_INSTANCE_TYPE"
    print_status "Capacity reservation created: $CAPACITY_RESERVATION_ID in $CAPACITY_RESERVATION_AZ"
}

cleanup_capacity_reservation() {
    local reservation_name
    reservation_name="$(capacity_reservation_name)"
    print_status "Cleaning up capacity reservation '$reservation_name'..."

    local reservation_ids
    reservation_ids=$(aws ec2 describe-capacity-reservations \
        --region "$REGION" \
        --filters "Name=tag:Name,Values=${reservation_name}" "Name=state,Values=active,pending" \
        --query 'CapacityReservations[].CapacityReservationId' \
        --output text 2>/dev/null)

    if [[ -z "$reservation_ids" || "$reservation_ids" == "None" ]]; then
        print_status "Capacity reservation '$reservation_name' not found. Nothing to clean up."
        return 0
    fi

    local reservation_id
    for reservation_id in $reservation_ids; do
        print_status "Cancelling capacity reservation $reservation_id"
        aws ec2 cancel-capacity-reservation \
            --capacity-reservation-id "$reservation_id" \
            --region "$REGION" > /dev/null
    done
    print_status "Capacity reservation cleanup completed"
}
