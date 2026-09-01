#!/bin/bash

# AWS VPC Infrastructure Setup Script
# Creates: VPC, 2-3 public subnets, 2-3 private subnets (based on available AZs), configurable security groups (no rules),
#          SQS queue (EventBridge-wired), and an S3 bucket + prefix for ROSA log forwarding
# Requires: At least 2 availability zones in the target region

set -e  # Exit on any error

# Detect script directory and repository root
# This allows the script to work from any location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration file location (always in repo root)
PLAYWRIGHT_ENV_FILE="$REPO_ROOT/playwright.env.json"

# Configuration Variables (can be overridden via command line)
VPC_NAME="${VPC_NAME:-playwright-ocmui}"
VPC_CIDR="${VPC_CIDR:-10.0.0.0/16}"
REGION="${REGION:-us-west-2}"
NUM_SECURITY_GROUPS="${NUM_SECURITY_GROUPS:-2}"  # Number of security groups to create
# Empty means derive from VPC_NAME after args are parsed (see apply_vpc_scoped_defaults).
QUEUE_PREFIX="${QUEUE_PREFIX:-}"
SKIP_SQS_QUEUE="${SKIP_SQS_QUEUE:-false}"  # Set to true to skip SQS queue creation
S3_BUCKET_NAME="${S3_BUCKET_NAME:-}"
S3_BUCKET_PREFIX="${S3_BUCKET_PREFIX:-logs}"  # Folder / key prefix inside the S3 bucket
SKIP_S3_BUCKET="${SKIP_S3_BUCKET:-false}"  # Set to true to skip S3 bucket creation

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

print_warning() {
    printf "${YELLOW}[WARNING]${NC} %s\n" "$1"
}

print_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
}

print_found() {
    printf "${BLUE}[FOUND]${NC} %s\n" "$1"
}

# SQS/EventBridge/S3 names must be lowercase alphanumeric + hyphen.
sanitize_aws_name() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g; s/--*/-/g; s/^-//; s/-$//'
}

# Queue, EventBridge rules, and S3 bucket follow the VPC name so create/cleanup stay together.
apply_vpc_scoped_defaults() {
    local vpc_slug
    vpc_slug="$(sanitize_aws_name "$VPC_NAME")"
    if [ -z "$vpc_slug" ]; then
        print_error "VPC name '$VPC_NAME' is empty after sanitizing"
        exit 1
    fi

    if [ -z "$QUEUE_PREFIX" ]; then
        QUEUE_PREFIX="$vpc_slug"
    fi

    if [ -z "$S3_BUCKET_NAME" ]; then
        S3_BUCKET_NAME="$vpc_slug"
        if [ ${#S3_BUCKET_NAME} -gt 63 ]; then
            S3_BUCKET_NAME="${S3_BUCKET_NAME:0:63}"
            S3_BUCKET_NAME="${S3_BUCKET_NAME%-}"
        fi
    fi
}

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
}

# Function to check if jq is installed
check_jq() {
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install it first."
        print_error "On macOS: brew install jq"
        print_error "On Ubuntu/Debian: sudo apt-get install jq"
        print_error "On RHEL/CentOS: sudo yum install jq"
        exit 1
    fi
}

# Function to check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
}

# Function to check if VPC exists
check_vpc_exists() {
    print_status "Checking if VPC '$VPC_NAME' exists..."
    
    EXISTING_VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=tag:Name,Values=$VPC_NAME" \
        --region $REGION \
        --query 'Vpcs[0].VpcId' \
        --output text 2>/dev/null)
    
    if [[ "$EXISTING_VPC_ID" != "None" && "$EXISTING_VPC_ID" != "" ]]; then
        print_found "VPC '$VPC_NAME' already exists with ID: $EXISTING_VPC_ID"
        VPC_ID=$EXISTING_VPC_ID
        return 0
    else
        print_status "VPC '$VPC_NAME' does not exist."
        return 1
    fi
}

# Function to check if Internet Gateway exists
check_internet_gateway_exists() {
    print_status "Checking if Internet Gateway exists for VPC..."
    
    EXISTING_IGW_ID=$(aws ec2 describe-internet-gateways \
        --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'InternetGateways[0].InternetGatewayId' \
        --output text 2>/dev/null)
    
    if [[ "$EXISTING_IGW_ID" != "None" && "$EXISTING_IGW_ID" != "" ]]; then
        print_found "Internet Gateway already exists with ID: $EXISTING_IGW_ID"
        IGW_ID=$EXISTING_IGW_ID
        return 0
    else
        print_status "Internet Gateway does not exist for VPC."
        return 1
    fi
}

# Function to check if subnet exists by name
check_subnet_exists() {
    local subnet_name=$1
    local subnet_var_name=$2
    
    local existing_subnet_id=$(aws ec2 describe-subnets \
        --filters "Name=tag:Name,Values=$subnet_name" "Name=vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'Subnets[0].SubnetId' \
        --output text 2>/dev/null)
    
    if [[ "$existing_subnet_id" != "None" && "$existing_subnet_id" != "" ]]; then
        print_found "Subnet '$subnet_name' already exists with ID: $existing_subnet_id"
        eval "$subnet_var_name=$existing_subnet_id"
        return 0
    else
        return 1
    fi
}

# Function to check if security group exists
check_security_group_exists() {
    local sg_name=$1
    local sg_var_name=$2
    
    local existing_sg_id=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=$sg_name" "Name=vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null)
    
    if [[ "$existing_sg_id" != "None" && "$existing_sg_id" != "" ]]; then
        print_found "Security Group '$sg_name' already exists with ID: $existing_sg_id"
        eval "$sg_var_name=$existing_sg_id"
        return 0
    else
        return 1
    fi
}

# Function to check if route table exists
check_route_table_exists() {
    local rt_name=$1
    local rt_var_name=$2
    
    local existing_rt_id=$(aws ec2 describe-route-tables \
        --filters "Name=tag:Name,Values=$rt_name" "Name=vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'RouteTables[0].RouteTableId' \
        --output text 2>/dev/null)
    
    if [[ "$existing_rt_id" != "None" && "$existing_rt_id" != "" ]]; then
        print_found "Route Table '$rt_name' already exists with ID: $existing_rt_id"
        eval "$rt_var_name=$existing_rt_id"
        return 0
    else
        return 1
    fi
}

# Function to check if NAT Gateway exists
check_nat_gateway_exists() {
    print_status "Checking if NAT Gateway exists..."
    
    EXISTING_NAT_GW_ID=$(aws ec2 describe-nat-gateways \
        --filter "Name=vpc-id,Values=$VPC_ID" "Name=state,Values=available" \
        --region $REGION \
        --query 'NatGateways[0].NatGatewayId' \
        --output text 2>/dev/null)
    
    if [[ "$EXISTING_NAT_GW_ID" != "None" && "$EXISTING_NAT_GW_ID" != "" ]]; then
        print_found "NAT Gateway already exists with ID: $EXISTING_NAT_GW_ID"
        NAT_GW_ID=$EXISTING_NAT_GW_ID
        return 0
    else
        print_status "NAT Gateway does not exist."
        return 1
    fi
}

# Function to get availability zones
get_availability_zones() {
    aws ec2 describe-availability-zones \
        --region $REGION \
        --filters "Name=state,Values=available" \
        --query 'AvailabilityZones[0:3].ZoneName' \
        --output text
}

# Function to validate availability zones
validate_availability_zones() {
    print_status "Validating availability zones in region $REGION..."
    
    local azs=($(get_availability_zones))
    local num_azs=${#azs[@]}
    
    if [ $num_azs -lt 2 ]; then
        print_error "Insufficient availability zones in region $REGION"
        print_error "Found: $num_azs AZ(s), Required: at least 2 AZs"
        print_error "Available AZs: ${azs[*]}"
        exit 1
    fi
    
    print_status "Found $num_azs available AZ(s): ${azs[*]}"
    echo $num_azs
}

# Function to create VPC
create_vpc() {
    if check_vpc_exists; then
        return 0
    fi
    
    print_status "Creating VPC..."
    
    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block $VPC_CIDR \
        --region $REGION \
        --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$VPC_NAME}]" \
        --query 'Vpc.VpcId' \
        --output text)
    
    print_status "VPC created with ID: $VPC_ID"
    
    # Enable DNS hostnames and resolution
    aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
    aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support
    
    print_status "DNS hostnames and resolution enabled for VPC"
}

# Function to create Internet Gateway
create_internet_gateway() {
    if check_internet_gateway_exists; then
        return 0
    fi
    
    print_status "Creating Internet Gateway..."
    
    IGW_ID=$(aws ec2 create-internet-gateway \
        --region $REGION \
        --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$VPC_NAME-igw}]" \
        --query 'InternetGateway.InternetGatewayId' \
        --output text)
    
    print_status "Internet Gateway created with ID: $IGW_ID"
    
    # Attach Internet Gateway to VPC
    aws ec2 attach-internet-gateway \
        --internet-gateway-id $IGW_ID \
        --vpc-id $VPC_ID \
        --region $REGION
    
    print_status "Internet Gateway attached to VPC"
}

# Function to create public subnets
create_public_subnets() {
    print_status "Creating public subnets..."
    
    # Get availability zones
    AZS=($(get_availability_zones))
    local num_azs=${#AZS[@]}
    
    # Define CIDR blocks for public subnets
    local public_cidrs=("10.0.1.0/24" "10.0.2.0/24" "10.0.3.0/24")
    
    # Arrays to store subnet IDs (global scope)
    PUBLIC_SUBNET_IDS=()
    
    # Create subnets dynamically based on available AZs
    for i in $(seq 0 $((num_azs - 1))); do
        local subnet_num=$((i + 1))
        local subnet_name="$VPC_NAME-public-subnet-$subnet_num"
        local subnet_var="PUBLIC_SUBNET_${subnet_num}_ID"
        local subnet_cidr="${public_cidrs[$i]}"
        local az="${AZS[$i]}"
        
        # Check and create public subnet
        if ! check_subnet_exists "$subnet_name" "$subnet_var"; then
            local subnet_id=$(aws ec2 create-subnet \
                --vpc-id $VPC_ID \
                --cidr-block $subnet_cidr \
                --availability-zone $az \
                --region $REGION \
                --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$subnet_name}]" \
                --query 'Subnet.SubnetId' \
                --output text)
            eval "$subnet_var=$subnet_id"
            print_status "Created Public Subnet $subnet_num: $subnet_id ($az)"
        else
            local subnet_id=$(eval echo \$$subnet_var)
            print_status "Using existing Public Subnet $subnet_num: $subnet_id ($az)"
        fi
        
        # Store subnet ID
        PUBLIC_SUBNET_IDS+=("$(eval echo \$$subnet_var)")
        
        # Enable auto-assign public IP for public subnet
        aws ec2 modify-subnet-attribute --subnet-id $(eval echo \$$subnet_var) --map-public-ip-on-launch --region $REGION
    done
    
    print_status "Public subnets configured:"
    for i in $(seq 0 $((num_azs - 1))); do
        local subnet_num=$((i + 1))
        local subnet_var="PUBLIC_SUBNET_${subnet_num}_ID"
        print_status "  Public Subnet $subnet_num: $(eval echo \$$subnet_var) (${AZS[$i]})"
    done
}

# Function to create private subnets
create_private_subnets() {
    print_status "Creating private subnets..."
    
    # Get availability zones
    AZS=($(get_availability_zones))
    local num_azs=${#AZS[@]}
    
    # Define CIDR blocks for private subnets
    local private_cidrs=("10.0.10.0/24" "10.0.20.0/24" "10.0.30.0/24")
    
    # Arrays to store subnet IDs (global scope)
    PRIVATE_SUBNET_IDS=()
    
    # Create subnets dynamically based on available AZs
    for i in $(seq 0 $((num_azs - 1))); do
        local subnet_num=$((i + 1))
        local subnet_name="$VPC_NAME-private-subnet-$subnet_num"
        local subnet_var="PRIVATE_SUBNET_${subnet_num}_ID"
        local subnet_cidr="${private_cidrs[$i]}"
        local az="${AZS[$i]}"
        
        # Check and create private subnet
        if ! check_subnet_exists "$subnet_name" "$subnet_var"; then
            local subnet_id=$(aws ec2 create-subnet \
                --vpc-id $VPC_ID \
                --cidr-block $subnet_cidr \
                --availability-zone $az \
                --region $REGION \
                --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$subnet_name}]" \
                --query 'Subnet.SubnetId' \
                --output text)
            eval "$subnet_var=$subnet_id"
            print_status "Created Private Subnet $subnet_num: $subnet_id ($az)"
        else
            local subnet_id=$(eval echo \$$subnet_var)
            print_status "Using existing Private Subnet $subnet_num: $subnet_id ($az)"
        fi
        
        # Store subnet ID
        PRIVATE_SUBNET_IDS+=("$(eval echo \$$subnet_var)")
    done
    
    print_status "Private subnets configured:"
    for i in $(seq 0 $((num_azs - 1))); do
        local subnet_num=$((i + 1))
        local subnet_var="PRIVATE_SUBNET_${subnet_num}_ID"
        print_status "  Private Subnet $subnet_num: $(eval echo \$$subnet_var) (${AZS[$i]})"
    done
}

# Function to create route tables
create_route_tables() {
    print_status "Creating route tables..."
    
    # Check and create public route table
    if ! check_route_table_exists "$VPC_NAME-public-rt" "PUBLIC_RT_ID"; then
        PUBLIC_RT_ID=$(aws ec2 create-route-table \
            --vpc-id $VPC_ID \
            --region $REGION \
            --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$VPC_NAME-public-rt}]" \
            --query 'RouteTable.RouteTableId' \
            --output text)
        print_status "Created public route table: $PUBLIC_RT_ID"
    fi
    
    # Check and create private route table
    if ! check_route_table_exists "$VPC_NAME-private-rt" "PRIVATE_RT_ID"; then
        PRIVATE_RT_ID=$(aws ec2 create-route-table \
            --vpc-id $VPC_ID \
            --region $REGION \
            --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$VPC_NAME-private-rt}]" \
            --query 'RouteTable.RouteTableId' \
            --output text)
        print_status "Created private route table: $PRIVATE_RT_ID"
    fi
    
    # Add route to internet gateway for public route table (if not exists)
    EXISTING_ROUTE=$(aws ec2 describe-route-tables \
        --route-table-ids $PUBLIC_RT_ID \
        --region $REGION \
        --query "RouteTables[0].Routes[?DestinationCidrBlock=='0.0.0.0/0'].GatewayId" \
        --output text 2>/dev/null)
    
    if [[ "$EXISTING_ROUTE" == "" || "$EXISTING_ROUTE" == "None" ]]; then
        aws ec2 create-route \
            --route-table-id $PUBLIC_RT_ID \
            --destination-cidr-block 0.0.0.0/0 \
            --gateway-id $IGW_ID \
            --region $REGION
        print_status "Added internet route to public route table"
    else
        print_found "Internet route already exists in public route table"
    fi
    
    # Associate public subnets with public route table
    for subnet_id in "${PUBLIC_SUBNET_IDS[@]}"; do
        associate_subnet_with_route_table $subnet_id $PUBLIC_RT_ID
    done
    
    # Associate private subnets with private route table
    for subnet_id in "${PRIVATE_SUBNET_IDS[@]}"; do
        associate_subnet_with_route_table $subnet_id $PRIVATE_RT_ID
    done
    
    print_status "Route tables configured:"
    print_status "  Public Route Table: $PUBLIC_RT_ID"
    print_status "  Private Route Table: $PRIVATE_RT_ID"
}

# Helper function to associate subnet with route table
associate_subnet_with_route_table() {
    local subnet_id=$1
    local route_table_id=$2
    
    # Check if association already exists
    EXISTING_ASSOCIATION=$(aws ec2 describe-route-tables \
        --route-table-ids $route_table_id \
        --region $REGION \
        --query "RouteTables[0].Associations[?SubnetId=='$subnet_id'].AssociationId" \
        --output text 2>/dev/null)
    
    if [[ "$EXISTING_ASSOCIATION" == "" || "$EXISTING_ASSOCIATION" == "None" ]]; then
        aws ec2 associate-route-table --subnet-id $subnet_id --route-table-id $route_table_id --region $REGION
        print_status "Associated subnet $subnet_id with route table $route_table_id"
    else
        print_found "Subnet $subnet_id already associated with route table $route_table_id"
    fi
}

# Function to create security groups
create_security_groups() {
    print_status "Creating $NUM_SECURITY_GROUPS security groups..."
    
    # Array to store security group IDs and names
    SECURITY_GROUP_IDS=()
    SECURITY_GROUP_NAMES=()
    
    # Create the specified number of security groups
    for i in $(seq 1 $NUM_SECURITY_GROUPS); do
        SG_NAME="$VPC_NAME-sg-$i"
        SG_VAR_NAME="SG_${i}_ID"
        
        # Check if security group already exists
        if ! check_security_group_exists "$SG_NAME" "$SG_VAR_NAME"; then
            SG_ID=$(aws ec2 create-security-group \
                --group-name "$SG_NAME" \
                --description "Security group $i for $VPC_NAME" \
                --vpc-id $VPC_ID \
                --region $REGION \
                --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$SG_NAME},{Key=Index,Value=$i}]" \
                --query 'GroupId' \
                --output text)
            print_status "Created security group $i: $SG_ID ($SG_NAME)"
            eval "$SG_VAR_NAME=$SG_ID"
        else
            # Get the ID from the variable that was set by check_security_group_exists
            SG_ID=$(eval echo \$$SG_VAR_NAME)
        fi
        
        # Store in arrays for later use
        SECURITY_GROUP_IDS+=("$SG_ID")
        SECURITY_GROUP_NAMES+=("$SG_NAME")
    done
    
    # Security groups created without any ingress rules
    # Rules can be added later as needed
    print_status "Security groups configured:"
    for i in $(seq 1 $NUM_SECURITY_GROUPS); do
        print_status "  SG $i: ${SECURITY_GROUP_IDS[$((i-1))]} (${SECURITY_GROUP_NAMES[$((i-1))]})"
    done
}

# Function to create NAT Gateway (optional)
create_nat_gateway() {
    if check_nat_gateway_exists; then
        return 0
    fi
    
    print_status "Creating NAT Gateway for private subnets..."
    
    # Allocate Elastic IP for NAT Gateway
    ELASTIC_IP_ALLOCATION_ID=$(aws ec2 allocate-address \
        --domain vpc \
        --region $REGION \
        --query 'AllocationId' \
        --output text)
    
    # Add tags to Elastic IP after creation
    aws ec2 create-tags \
        --resources $ELASTIC_IP_ALLOCATION_ID \
        --tags Key=Name,Value=$VPC_NAME-nat-eip \
        --region $REGION
    
    # Create NAT Gateway in first public subnet
    NAT_GW_ID=$(aws ec2 create-nat-gateway \
        --subnet-id $PUBLIC_SUBNET_1_ID \
        --allocation-id $ELASTIC_IP_ALLOCATION_ID \
        --region $REGION \
        --query 'NatGateway.NatGatewayId' \
        --output text)
    
    # Wait for NAT Gateway to be available
    print_status "Waiting for NAT Gateway to be available..."
    aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GW_ID --region $REGION
    
    # Add tags to NAT Gateway after creation
    aws ec2 create-tags \
        --resources $NAT_GW_ID \
        --tags Key=Name,Value=$VPC_NAME-nat-gw \
        --region $REGION
    
    # Add route to NAT Gateway for private route table (if not exists)
    EXISTING_NAT_ROUTE=$(aws ec2 describe-route-tables \
        --route-table-ids $PRIVATE_RT_ID \
        --region $REGION \
        --query "RouteTables[0].Routes[?DestinationCidrBlock=='0.0.0.0/0'].NatGatewayId" \
        --output text 2>/dev/null)
    
    if [[ "$EXISTING_NAT_ROUTE" == "" || "$EXISTING_NAT_ROUTE" == "None" ]]; then
        aws ec2 create-route \
            --route-table-id $PRIVATE_RT_ID \
            --destination-cidr-block 0.0.0.0/0 \
            --nat-gateway-id $NAT_GW_ID \
            --region $REGION
        print_status "Added NAT Gateway route to private route table"
    else
        print_found "NAT Gateway route already exists in private route table"
    fi
    
    print_status "NAT Gateway created: $NAT_GW_ID"
    print_status "Elastic IP allocated: $ELASTIC_IP_ALLOCATION_ID"
}

# Function to check if the SQS queue already exists (sets QUEUE_URL if found)
check_sqs_queue_exists() {
    local queue_name="${QUEUE_PREFIX}-spot-interruption-queue"

    local existing_url
    existing_url=$(aws sqs get-queue-url \
        --queue-name "$queue_name" \
        --region "$REGION" \
        --query 'QueueUrl' \
        --output text 2>/dev/null)

    if [[ -n "$existing_url" && "$existing_url" != "None" ]]; then
        print_found "SQS queue '$queue_name' already exists"
        QUEUE_URL="$existing_url"
        return 0
    else
        return 1
    fi
}

# Function to create the SQS queue and wire up EventBridge rules/targets
# for EC2 spot interruption warnings and rebalance recommendations
create_sqs_queue() {
    local queue_name="${QUEUE_PREFIX}-spot-interruption-queue"

    if ! check_sqs_queue_exists; then
        print_status "Creating SQS queue '$queue_name'..."
        aws sqs create-queue \
            --queue-name "$queue_name" \
            --region "$REGION" > /dev/null

        local account_id
        account_id=$(aws sts get-caller-identity --query Account --output text)
        QUEUE_URL="https://sqs.${REGION}.amazonaws.com/${account_id}/${queue_name}"
        print_status "Queue created: $queue_name"
    fi

    QUEUE_ARN=$(aws sqs get-queue-attributes \
        --queue-url "$QUEUE_URL" \
        --attribute-names QueueArn \
        --region "$REGION" \
        --query 'Attributes.QueueArn' --output text)

    print_status "Configuring EventBridge rule for spot interruption warnings..."
    aws events put-rule \
        --name "${QUEUE_PREFIX}-spot-interruption-warning" \
        --event-pattern '{"source":["aws.ec2"],"detail-type":["EC2 Spot Instance Interruption Warning"]}' \
        --region "$REGION" > /dev/null

    aws events put-targets \
        --rule "${QUEUE_PREFIX}-spot-interruption-warning" \
        --targets "Id=1,Arn=${QUEUE_ARN}" \
        --region "$REGION" > /dev/null

    print_status "Configuring EventBridge rule for rebalance recommendations..."
    aws events put-rule \
        --name "${QUEUE_PREFIX}-rebalance-recommendation" \
        --event-pattern '{"source":["aws.ec2"],"detail-type":["EC2 Instance Rebalance Recommendation"]}' \
        --region "$REGION" > /dev/null

    aws events put-targets \
        --rule "${QUEUE_PREFIX}-rebalance-recommendation" \
        --targets "Id=1,Arn=${QUEUE_ARN}" \
        --region "$REGION" > /dev/null

    print_status "Setting queue policy to allow EventBridge to send messages..."
    aws sqs set-queue-attributes \
        --queue-url "$QUEUE_URL" \
        --region "$REGION" \
        --attributes '{
    "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"events.amazonaws.com\"},\"Action\":\"sqs:SendMessage\",\"Resource\":\"'${QUEUE_ARN}'\"}]}"
  }'

    print_status "SQS queue configured: $queue_name"
}

# Function to delete the SQS queue and its EventBridge rules/targets
cleanup_sqs_queue() {
    local queue_name="${QUEUE_PREFIX}-spot-interruption-queue"

    print_status "Cleaning up SQS queue and EventBridge rules..."

    if check_sqs_queue_exists; then
        for rule_name in "${QUEUE_PREFIX}-spot-interruption-warning" "${QUEUE_PREFIX}-rebalance-recommendation"; do
            if aws events describe-rule --name "$rule_name" --region "$REGION" &> /dev/null; then
                aws events remove-targets --rule "$rule_name" --ids "1" --region "$REGION" 2>/dev/null || true
                aws events delete-rule --name "$rule_name" --region "$REGION" 2>/dev/null || true
                print_status "Deleted EventBridge rule: $rule_name"
            fi
        done

        aws sqs delete-queue --queue-url "$QUEUE_URL" --region "$REGION"
        print_status "Deleted SQS queue: $queue_name"
    else
        print_status "SQS queue '$queue_name' not found. Nothing to clean up."
    fi
}

# Normalize the S3 prefix so playwright.env.json always stores a folder name without slashes
normalize_s3_prefix() {
    local prefix="${1#/}"
    prefix="${prefix%/}"
    echo "$prefix"
}

# Function to check if the S3 bucket already exists
check_s3_bucket_exists() {
    if aws s3api head-bucket --bucket "$S3_BUCKET_NAME" --region "$REGION" 2>/dev/null; then
        print_found "S3 bucket already exists"
        return 0
    else
        return 1
    fi
}

# Function to create the S3 bucket (if missing) and the log-forwarding prefix folder
create_s3_bucket() {
    S3_BUCKET_PREFIX="$(normalize_s3_prefix "$S3_BUCKET_PREFIX")"

    if [ -z "$S3_BUCKET_NAME" ]; then
        print_error "S3 bucket name cannot be empty"
        exit 1
    fi
    if [ -z "$S3_BUCKET_PREFIX" ]; then
        print_error "S3 bucket prefix cannot be empty"
        exit 1
    fi

    if ! check_s3_bucket_exists; then
        print_status "Creating S3 bucket in region '$REGION'..."

        # us-east-1 is the S3 default and rejects LocationConstraint
        if [ "$REGION" = "us-east-1" ]; then
            aws s3api create-bucket \
                --bucket "$S3_BUCKET_NAME" \
                --region "$REGION" > /dev/null
        else
            aws s3api create-bucket \
                --bucket "$S3_BUCKET_NAME" \
                --region "$REGION" \
                --create-bucket-configuration LocationConstraint="$REGION" > /dev/null
        fi

        print_status "S3 bucket created"
    fi

    print_status "Blocking public access on S3 bucket..."
    aws s3api put-public-access-block \
        --bucket "$S3_BUCKET_NAME" \
        --region "$REGION" \
        --public-access-block-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
        > /dev/null

    local prefix_key="${S3_BUCKET_PREFIX}/"
    print_status "Ensuring S3 prefix folder exists..."
    aws s3api put-object \
        --bucket "$S3_BUCKET_NAME" \
        --key "$prefix_key" \
        --region "$REGION" > /dev/null

    print_status "S3 log-forwarding resources configured"
}

# Function to delete the S3 bucket and all objects (including the prefix folder)
cleanup_s3_bucket() {
    print_status "Cleaning up S3 bucket '$S3_BUCKET_NAME'..."

    if check_s3_bucket_exists; then
        aws s3 rb "s3://${S3_BUCKET_NAME}" --force --region "$REGION" > /dev/null
        print_status "Deleted S3 bucket: $S3_BUCKET_NAME"
    else
        print_status "S3 bucket '$S3_BUCKET_NAME' not found. Nothing to clean up."
    fi
}

# Function to validate all resources exist
validate_resources() {
    print_status "=== Validating Infrastructure ==="
    
    local validation_failed=false
    
    # Validate VPC
    if ! check_vpc_exists; then
        print_error "VPC validation failed"
        validation_failed=true
    fi
    
    # Validate Internet Gateway
    if ! check_internet_gateway_exists; then
        print_error "Internet Gateway validation failed"
        validation_failed=true
    fi
    
    # Validate subnets - dynamically based on available AZs
    AZS=($(get_availability_zones))
    local num_azs=${#AZS[@]}
    
    for i in $(seq 1 $num_azs); do
        if ! check_subnet_exists "$VPC_NAME-public-subnet-$i" "PUBLIC_SUBNET_${i}_ID"; then
            print_error "Public Subnet $i validation failed"
            validation_failed=true
        fi
        
        if ! check_subnet_exists "$VPC_NAME-private-subnet-$i" "PRIVATE_SUBNET_${i}_ID"; then
            print_error "Private Subnet $i validation failed"
            validation_failed=true
        fi
    done
    
    # Validate security groups
    for i in $(seq 1 $NUM_SECURITY_GROUPS); do
        SG_NAME="$VPC_NAME-sg-$i"
        SG_VAR_NAME="SG_${i}_ID"
        if ! check_security_group_exists "$SG_NAME" "$SG_VAR_NAME"; then
            print_error "Security Group $i ($SG_NAME) validation failed"
            validation_failed=true
        fi
    done
    
    # Validate route tables
    if ! check_route_table_exists "$VPC_NAME-public-rt" "PUBLIC_RT_ID"; then
        print_error "Public Route Table validation failed"
        validation_failed=true
    fi
    
    if ! check_route_table_exists "$VPC_NAME-private-rt" "PRIVATE_RT_ID"; then
        print_error "Private Route Table validation failed"
        validation_failed=true
    fi
    
    # Validate SQS queue (unless skipped)
    if [ "$SKIP_SQS_QUEUE" != "true" ]; then
        if ! check_sqs_queue_exists; then
            print_error "SQS queue validation failed"
            validation_failed=true
        fi
    fi

    # Validate S3 bucket (unless skipped)
    if [ "$SKIP_S3_BUCKET" != "true" ]; then
        if ! check_s3_bucket_exists; then
            print_error "S3 bucket validation failed"
            validation_failed=true
        fi
    fi
    
    if [ "$validation_failed" = true ]; then
        print_error "Infrastructure validation failed!"
        return 1
    else
        print_status "All infrastructure resources validated successfully!"
        return 0
    fi
}

# Function to output summary
output_summary() {
    print_status "=== VPC Infrastructure Summary ==="
    
    # Get availability zones
    AZS=($(get_availability_zones))
    local num_azs=${#AZS[@]}
    
    # Build security groups arrays dynamically
    SG_IDS_JSON=""
    SG_NAMES_JSON=""
    for i in $(seq 1 $NUM_SECURITY_GROUPS); do
        SG_VAR_NAME="SG_${i}_ID"
        SG_ID=$(eval echo \$$SG_VAR_NAME)
        SG_NAME="$VPC_NAME-sg-$i"
        
        # Add comma if not first element
        if [ $i -gt 1 ]; then
            SG_IDS_JSON+=","
            SG_NAMES_JSON+=","
        fi
        SG_IDS_JSON+="\"$SG_ID\""
        SG_NAMES_JSON+="\"$SG_NAME\""
    done
    
    # Build zones JSON dynamically based on available AZs
    ZONES_JSON=""
    for i in $(seq 0 $((num_azs - 1))); do
        local subnet_num=$((i + 1))
        local az="${AZS[$i]}"
        local public_subnet_var="PUBLIC_SUBNET_${subnet_num}_ID"
        local private_subnet_var="PRIVATE_SUBNET_${subnet_num}_ID"
        local public_subnet_id=$(eval echo \$$public_subnet_var)
        local private_subnet_id=$(eval echo \$$private_subnet_var)
        
        # Add comma if not first zone
        if [ $i -gt 0 ]; then
            ZONES_JSON+=","
        fi
        
        ZONES_JSON+='
            "'$az'": {
              "PUBLIC_SUBNET_NAME": "'$VPC_NAME'-public-subnet-'$subnet_num'",
              "PUBLIC_SUBNET_ID": "'$public_subnet_id'",
              "PRIVATE_SUBNET_NAME": "'$VPC_NAME'-private-subnet-'$subnet_num'",
              "PRIVATE_SUBNET_ID": "'$private_subnet_id'"
            }'
    done
    
    # Create the new VPC infrastructure JSON structure
    NEW_VPC_DATA='{
        "VPC-ID": "'$VPC_ID'",
        "VPC_NAME": "'$VPC_NAME'",
        "SECURITY_GROUPS": [
          '$SG_IDS_JSON'
        ],
        "SECURITY_GROUPS_NAME": [
          '$SG_NAMES_JSON'
        ],
        "SUBNETS": {
          "ZONES": {'$ZONES_JSON'
          }
        }
      }'
    
    # Check if playwright.env.json exists
    if [[ -f "$PLAYWRIGHT_ENV_FILE" ]]; then
        print_status "Updating existing playwright.env.json file..."
        
        # Create a backup
        cp "$PLAYWRIGHT_ENV_FILE" "${PLAYWRIGHT_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Check if the file has valid JSON structure
        if ! jq empty "$PLAYWRIGHT_ENV_FILE" > /dev/null 2>&1; then
            print_error "Invalid JSON in $PLAYWRIGHT_ENV_FILE. Please fix the file structure."
            exit 1
        fi
        
        # Always overwrite QE_INFRA_REGIONS with the new VPC infrastructure data,
        # record the SQS queue URL (if created) as QE_SPOT_INTERRUPTION_QUEUE_URL,
        # and record the S3 log-forwarding bucket/prefix (if created)
        print_status "Overwriting QE_INFRA_REGIONS in $PLAYWRIGHT_ENV_FILE"
        local s3_bucket=""
        local s3_prefix=""
        if [ "$SKIP_S3_BUCKET" != "true" ]; then
            s3_bucket="$S3_BUCKET_NAME"
            s3_prefix="$S3_BUCKET_PREFIX"
        fi
        jq --arg region "$REGION" --argjson vpc_data "$NEW_VPC_DATA" --arg queue_url "${QUEUE_URL:-}" \
            --arg s3_bucket "$s3_bucket" --arg s3_prefix "$s3_prefix" \
            '.QE_INFRA_REGIONS = {($region): [$vpc_data]}
             | if $queue_url != "" then .QE_SPOT_INTERRUPTION_QUEUE_URL = $queue_url else . end
             | del(.QE_SQS_QUEUE_URL)
             | if $s3_bucket != "" then .QE_LOG_FORWARDING_S3_BUCKET_NAME = $s3_bucket else . end
             | if $s3_prefix != "" then .QE_LOG_FORWARDING_S3_BUCKET_PREFIX = $s3_prefix else . end' \
            "$PLAYWRIGHT_ENV_FILE" > "${PLAYWRIGHT_ENV_FILE}.tmp" && mv "${PLAYWRIGHT_ENV_FILE}.tmp" "$PLAYWRIGHT_ENV_FILE"
        
        if [[ $? -eq 0 ]]; then
            print_status "Successfully updated $PLAYWRIGHT_ENV_FILE"
        else
            print_error "Failed to update $PLAYWRIGHT_ENV_FILE"
            exit 1
        fi
        
    else
        print_status "Creating new playwright.env.json file..."
        
        # Create new playwright.env.json with the VPC infrastructure data,
        # the SQS queue URL (if created), and the S3 log-forwarding bucket/prefix (if created)
        local extra_fields=""
        if [[ -n "${QUEUE_URL:-}" ]]; then
            extra_fields+=",
  \"QE_SPOT_INTERRUPTION_QUEUE_URL\": \"$QUEUE_URL\""
        fi
        if [ "$SKIP_S3_BUCKET" != "true" ]; then
            extra_fields+=",
  \"QE_LOG_FORWARDING_S3_BUCKET_NAME\": \"$S3_BUCKET_NAME\",
  \"QE_LOG_FORWARDING_S3_BUCKET_PREFIX\": \"$S3_BUCKET_PREFIX\""
        fi
        cat > "$PLAYWRIGHT_ENV_FILE" << EOF
{
  "QE_INFRA_REGIONS": {
    "$REGION": [
      $NEW_VPC_DATA
    ]
  }$extra_fields
}
EOF
        print_status "Created new $PLAYWRIGHT_ENV_FILE"
    fi
    
    print_status "VPC infrastructure created successfully!"
    print_status "Configuration updated in: $PLAYWRIGHT_ENV_FILE"
}

# Main execution
main() {
    print_status "Starting VPC infrastructure creation..."
    print_status "Region: $REGION"
    print_status "VPC Name: $VPC_NAME"
    print_status "VPC CIDR: $VPC_CIDR"
    print_status "SQS/EventBridge prefix: $QUEUE_PREFIX"
    print_status "S3 bucket: $S3_BUCKET_NAME"
    
    check_aws_cli
    check_aws_credentials
    check_jq
    
    # Validate availability zones before proceeding
    validate_availability_zones
    
    create_vpc
    create_internet_gateway
    create_public_subnets
    create_private_subnets
    create_route_tables
    create_security_groups
    
    # Uncomment the next line if you want to create a NAT Gateway
    create_nat_gateway
    
    # Create the SQS queue + EventBridge wiring (unless skipped)
    if [ "$SKIP_SQS_QUEUE" != "true" ]; then
        create_sqs_queue
    else
        print_status "Skipping SQS queue creation (--skip-sqs-queue)"
    fi

    # Create the S3 bucket + prefix folder for log forwarding (unless skipped)
    if [ "$SKIP_S3_BUCKET" != "true" ]; then
        create_s3_bucket
    else
        print_status "Skipping S3 bucket creation (--skip-s3-bucket)"
    fi
    
    # Validate all resources exist
    if validate_resources; then
        output_summary
    else
        print_error "Infrastructure validation failed. Please check the errors above."
        exit 1
    fi
}

# Function to only validate existing infrastructure
validate_only() {
    print_status "Running validation-only mode..."
    print_status "Region: $REGION"
    
    check_aws_cli
    check_aws_credentials
    check_jq
    
    # Validate availability zones
    validate_availability_zones
    
    if validate_resources; then
        output_summary
        print_status "Validation completed successfully!"
    else
        print_error "Validation failed. Some resources are missing."
        exit 1
    fi
}

# Function to confirm cleanup action
confirm_cleanup() {
    # Display warning about what will be deleted
    print_warning "This will DELETE ALL resources for VPC '$VPC_NAME' in region '$REGION'!"
    print_warning "This action is IRREVERSIBLE!"
    echo ""
    print_status "Resources that will be deleted:"
    print_status "  - VPC: $VPC_NAME"
    print_status "  - All subnets (public and private)"
    print_status "  - Route tables and routes"
    print_status "  - Security groups"
    print_status "  - Internet Gateway"
    print_status "  - NAT Gateway (if exists)"
    print_status "  - Elastic IP (if exists)"
    if [ "$SKIP_SQS_QUEUE" != "true" ]; then
        print_status "  - SQS queue and EventBridge rules (prefix: $QUEUE_PREFIX)"
    fi
    if [ "$SKIP_S3_BUCKET" != "true" ]; then
        print_status "  - S3 bucket: $S3_BUCKET_NAME (including all objects)"
    fi
    echo ""
    print_status "Proceeding with cleanup..."
}

# Function to delete NAT Gateway and associated Elastic IP
cleanup_nat_gateway() {
    print_status "Cleaning up NAT Gateway..."
    
    # Find NAT Gateway
    NAT_GW_ID=$(aws ec2 describe-nat-gateways \
        --filter "Name=vpc-id,Values=$VPC_ID" "Name=state,Values=available" \
        --region $REGION \
        --query 'NatGateways[0].NatGatewayId' \
        --output text 2>/dev/null)
    
    if [[ "$NAT_GW_ID" != "None" && "$NAT_GW_ID" != "" ]]; then
        print_status "Found NAT Gateway: $NAT_GW_ID"
        
        # Get the Elastic IP allocation ID before deleting NAT Gateway
        ELASTIC_IP_ALLOCATION_ID=$(aws ec2 describe-nat-gateways \
            --nat-gateway-ids $NAT_GW_ID \
            --region $REGION \
            --query 'NatGateways[0].NatGatewayAddresses[0].AllocationId' \
            --output text 2>/dev/null)
        
        # Delete routes that use this NAT Gateway first
        if [[ -n "$PRIVATE_RT_ID" ]]; then
            print_status "Removing NAT Gateway routes from private route table..."
            aws ec2 delete-route \
                --route-table-id $PRIVATE_RT_ID \
                --destination-cidr-block 0.0.0.0/0 \
                --region $REGION 2>/dev/null || true
        fi
        
        # Delete NAT Gateway
        print_status "Deleting NAT Gateway: $NAT_GW_ID"
        aws ec2 delete-nat-gateway --nat-gateway-id $NAT_GW_ID --region $REGION
        
        # Wait for NAT Gateway to be deleted
        print_status "Waiting for NAT Gateway to be deleted..."
        aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT_GW_ID --region $REGION
        
        # Release Elastic IP
        if [[ "$ELASTIC_IP_ALLOCATION_ID" != "None" && "$ELASTIC_IP_ALLOCATION_ID" != "" ]]; then
            print_status "Releasing Elastic IP: $ELASTIC_IP_ALLOCATION_ID"
            aws ec2 release-address --allocation-id $ELASTIC_IP_ALLOCATION_ID --region $REGION
        fi
        
        print_status "NAT Gateway and Elastic IP cleaned up successfully"
    else
        print_status "No NAT Gateway found"
    fi
}

# Helper function to remove all custom routes from a route table
remove_custom_routes() {
    local route_table_id=$1
    local route_table_name=$2
    
    print_status "Removing custom routes from $route_table_name..."
    
    # Get all non-local routes
    local routes=$(aws ec2 describe-route-tables \
        --route-table-ids $route_table_id \
        --region $REGION \
        --query 'RouteTables[0].Routes[?Origin!=`CreateRouteTable`].DestinationCidrBlock' \
        --output text 2>/dev/null)
    
    for route in $routes; do
        if [[ "$route" != "None" && "$route" != "" ]]; then
            print_status "Removing route: $route from $route_table_name"
            aws ec2 delete-route \
                --route-table-id $route_table_id \
                --destination-cidr-block $route \
                --region $REGION 2>/dev/null || true
        fi
    done
}

# Function to cleanup route table associations and routes
cleanup_route_tables() {
    print_status "Cleaning up route tables..."
    
    # Get route table IDs
    PUBLIC_RT_ID=$(aws ec2 describe-route-tables \
        --filters "Name=tag:Name,Values=$VPC_NAME-public-rt" "Name=vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'RouteTables[0].RouteTableId' \
        --output text 2>/dev/null)
    
    PRIVATE_RT_ID=$(aws ec2 describe-route-tables \
        --filters "Name=tag:Name,Values=$VPC_NAME-private-rt" "Name=vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'RouteTables[0].RouteTableId' \
        --output text 2>/dev/null)
    
    # Clean up public route table
    if [[ "$PUBLIC_RT_ID" != "None" && "$PUBLIC_RT_ID" != "" ]]; then
        print_status "Cleaning up public route table: $PUBLIC_RT_ID"
        
        # Remove associations
        ASSOCIATIONS=$(aws ec2 describe-route-tables \
            --route-table-ids $PUBLIC_RT_ID \
            --region $REGION \
            --query 'RouteTables[0].Associations[?Main==`false`].RouteTableAssociationId' \
            --output text 2>/dev/null)
        
        for association in $ASSOCIATIONS; do
            if [[ "$association" != "None" && "$association" != "" ]]; then
                print_status "Removing association: $association"
                aws ec2 disassociate-route-table --association-id $association --region $REGION 2>/dev/null || true
            fi
        done
        
        # Remove all custom routes
        remove_custom_routes $PUBLIC_RT_ID "public route table"
        
        # Wait a moment for route deletions to propagate
        sleep 2
        
        # Delete route table
        print_status "Deleting public route table: $PUBLIC_RT_ID"
        if ! aws ec2 delete-route-table --route-table-id $PUBLIC_RT_ID --region $REGION 2>/dev/null; then
            print_warning "Failed to delete public route table $PUBLIC_RT_ID - it may still have dependencies"
            print_status "Listing remaining associations..."
            REMAINING=$(aws ec2 describe-route-tables \
                --route-table-ids $PUBLIC_RT_ID \
                --region $REGION \
                --query 'RouteTables[0].Associations[?Main==`false`].{AssocId:RouteTableAssociationId,SubnetId:SubnetId}' \
                --output table 2>/dev/null || echo "Unable to retrieve details")
            echo "$REMAINING"
        fi
    fi
    
    # Clean up private route table
    if [[ "$PRIVATE_RT_ID" != "None" && "$PRIVATE_RT_ID" != "" ]]; then
        print_status "Cleaning up private route table: $PRIVATE_RT_ID"
        
        # Remove associations
        ASSOCIATIONS=$(aws ec2 describe-route-tables \
            --route-table-ids $PRIVATE_RT_ID \
            --region $REGION \
            --query 'RouteTables[0].Associations[?Main==`false`].RouteTableAssociationId' \
            --output text 2>/dev/null)
        
        for association in $ASSOCIATIONS; do
            if [[ "$association" != "None" && "$association" != "" ]]; then
                print_status "Removing association: $association"
                aws ec2 disassociate-route-table --association-id $association --region $REGION 2>/dev/null || true
            fi
        done
        
        # Remove all custom routes
        remove_custom_routes $PRIVATE_RT_ID "private route table"
        
        # Wait a moment for route deletions to propagate
        sleep 2
        
        # Delete route table
        print_status "Deleting private route table: $PRIVATE_RT_ID"
        if ! aws ec2 delete-route-table --route-table-id $PRIVATE_RT_ID --region $REGION 2>/dev/null; then
            print_warning "Failed to delete private route table $PRIVATE_RT_ID - it may still have dependencies"
            print_status "Listing remaining associations..."
            REMAINING=$(aws ec2 describe-route-tables \
                --route-table-ids $PRIVATE_RT_ID \
                --region $REGION \
                --query 'RouteTables[0].Associations[?Main==`false`].{AssocId:RouteTableAssociationId,SubnetId:SubnetId}' \
                --output table 2>/dev/null || echo "Unable to retrieve details")
            echo "$REMAINING"
        fi
    fi
    
    print_status "Route tables cleaned up successfully"
}

# Function to cleanup security groups
cleanup_security_groups() {
    print_status "Cleaning up security groups..."
    
    # Get security group IDs
    SECURITY_GROUPS=$(aws ec2 describe-security-groups \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=$VPC_NAME-*" \
        --region $REGION \
        --query 'SecurityGroups[].GroupId' \
        --output text 2>/dev/null)
    
    for sg_id in $SECURITY_GROUPS; do
        if [[ "$sg_id" != "None" && "$sg_id" != "" ]]; then
            print_status "Deleting security group: $sg_id"
            aws ec2 delete-security-group --group-id $sg_id --region $REGION
        fi
    done
    
    print_status "Security groups cleaned up successfully"
}

# Function to cleanup subnets
cleanup_subnets() {
    print_status "Cleaning up subnets..."
    
    # Get all subnets in the VPC
    SUBNETS=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'Subnets[].SubnetId' \
        --output text 2>/dev/null)
    
    for subnet_id in $SUBNETS; do
        if [[ "$subnet_id" != "None" && "$subnet_id" != "" ]]; then
            print_status "Deleting subnet: $subnet_id"
            aws ec2 delete-subnet --subnet-id $subnet_id --region $REGION
        fi
    done
    
    print_status "Subnets cleaned up successfully"
}

# Function to cleanup Internet Gateway
cleanup_internet_gateway() {
    print_status "Cleaning up Internet Gateway..."
    
    # Get Internet Gateway ID
    IGW_ID=$(aws ec2 describe-internet-gateways \
        --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'InternetGateways[0].InternetGatewayId' \
        --output text 2>/dev/null)
    
    if [[ "$IGW_ID" != "None" && "$IGW_ID" != "" ]]; then
        print_status "Found Internet Gateway: $IGW_ID"
        
        # Detach from VPC
        print_status "Detaching Internet Gateway from VPC..."
        aws ec2 detach-internet-gateway \
            --internet-gateway-id $IGW_ID \
            --vpc-id $VPC_ID \
            --region $REGION
        
        # Delete Internet Gateway
        print_status "Deleting Internet Gateway: $IGW_ID"
        aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID --region $REGION
        
        print_status "Internet Gateway cleaned up successfully"
    else
        print_status "No Internet Gateway found"
    fi
}

# Function to cleanup VPC
cleanup_vpc() {
    print_status "Cleaning up VPC..."
    
    if [[ -n "$VPC_ID" && "$VPC_ID" != "None" ]]; then
        print_status "Deleting VPC: $VPC_ID"
        aws ec2 delete-vpc --vpc-id $VPC_ID --region $REGION
        print_status "VPC deleted successfully"
    else
        print_status "No VPC found to delete"
    fi
}

# Function to update playwright.env.json after cleanup
cleanup_playwright_config() {
    print_status "Cleaning up playwright.env.json configuration..."
    
    if [[ -f "$PLAYWRIGHT_ENV_FILE" ]]; then
        # Remove the region entry from QE_INFRA_REGIONS
        # No backup needed - infrastructure is already deleted
        if jq empty "$PLAYWRIGHT_ENV_FILE" > /dev/null 2>&1; then
            print_status "Removing $REGION from QE_INFRA_REGIONS in $PLAYWRIGHT_ENV_FILE"
            local jq_filter='del(.QE_INFRA_REGIONS[$region])'
            if [ "$SKIP_SQS_QUEUE" != "true" ]; then
                print_status "Removing QE_SPOT_INTERRUPTION_QUEUE_URL from $PLAYWRIGHT_ENV_FILE"
                jq_filter="$jq_filter | del(.QE_SPOT_INTERRUPTION_QUEUE_URL) | del(.QE_SQS_QUEUE_URL)"
            fi
            if [ "$SKIP_S3_BUCKET" != "true" ]; then
                print_status "Removing S3 log-forwarding keys from $PLAYWRIGHT_ENV_FILE"
                jq_filter="$jq_filter | del(.QE_LOG_FORWARDING_S3_BUCKET_NAME) | del(.QE_LOG_FORWARDING_S3_BUCKET_PREFIX)"
            fi
            jq --arg region "$REGION" "$jq_filter" \
                "$PLAYWRIGHT_ENV_FILE" > "${PLAYWRIGHT_ENV_FILE}.tmp" && mv "${PLAYWRIGHT_ENV_FILE}.tmp" "$PLAYWRIGHT_ENV_FILE"
            
            # If QE_INFRA_REGIONS is now empty, you might want to keep the structure or remove it entirely
            # This keeps the empty object for now
            print_status "Configuration cleaned up in $PLAYWRIGHT_ENV_FILE"
        else
            print_warning "Could not parse $PLAYWRIGHT_ENV_FILE as valid JSON. Manual cleanup may be required."
        fi
    else
        print_status "No playwright.env.json file found"
    fi
}

# Main cleanup function
cleanup_infrastructure() {
    print_status "Starting infrastructure cleanup..."
    print_status "Region: $REGION"
    print_status "VPC Name: $VPC_NAME"
    print_status "SQS/EventBridge prefix: $QUEUE_PREFIX"
    print_status "S3 bucket: $S3_BUCKET_NAME"
    
    check_aws_cli
    check_aws_credentials
    check_jq
    
    # Queue and bucket are named from the VPC; delete them even if the VPC is already gone.
    if [ "$SKIP_SQS_QUEUE" != "true" ]; then
        cleanup_sqs_queue
    fi

    if [ "$SKIP_S3_BUCKET" != "true" ]; then
        cleanup_s3_bucket
    fi
    
    if check_vpc_exists; then
        # Get all resource IDs before deletion for route table cleanup
        PUBLIC_RT_ID=$(aws ec2 describe-route-tables \
            --filters "Name=tag:Name,Values=$VPC_NAME-public-rt" "Name=vpc-id,Values=$VPC_ID" \
            --region $REGION \
            --query 'RouteTables[0].RouteTableId' \
            --output text 2>/dev/null)
        
        PRIVATE_RT_ID=$(aws ec2 describe-route-tables \
            --filters "Name=tag:Name,Values=$VPC_NAME-private-rt" "Name=vpc-id,Values=$VPC_ID" \
            --region $REGION \
            --query 'RouteTables[0].RouteTableId' \
            --output text 2>/dev/null)
        
        print_status "=== Starting Cleanup Process ==="
        
        cleanup_nat_gateway
        cleanup_route_tables
        cleanup_security_groups
        cleanup_subnets
        cleanup_internet_gateway
        cleanup_vpc
    else
        print_warning "VPC '$VPC_NAME' not found in region '$REGION'"
    fi

    cleanup_playwright_config
    
    print_status "=== Cleanup Completed Successfully ==="
    print_status "All AWS resources for VPC '$VPC_NAME' have been deleted."
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "AWS VPC Infrastructure Setup Script"
    echo ""
    echo "Configuration (via CLI args or environment variables):"
    echo "  --region REGION           AWS region (default: us-west-2, env: REGION)"
    echo "  --vpc-name NAME           VPC name (default: playwright-ocmui, env: VPC_NAME)"
    echo "  --vpc-cidr CIDR           VPC CIDR block (default: 10.0.0.0/16, env: VPC_CIDR)"
    echo "  --security-groups COUNT   Number of security groups to create (default: 2, env: NUM_SECURITY_GROUPS)"
    echo "  --queue-prefix PREFIX     SQS queue / EventBridge rule name prefix (default: sanitized VPC name, env: QUEUE_PREFIX)"
    echo "  --s3-bucket-name NAME     S3 bucket for ROSA log forwarding (default: sanitized VPC name, env: S3_BUCKET_NAME)"
    echo "  --s3-bucket-prefix PREFIX S3 folder / key prefix inside the bucket (default: logs, env: S3_BUCKET_PREFIX)"
    echo ""
    echo "Options:"
    echo "  --skip-sqs-queue          Skip creating/validating/cleaning up the SQS queue (env: SKIP_SQS_QUEUE)"
    echo "  --skip-s3-bucket          Skip creating/validating/cleaning up the S3 bucket (env: SKIP_S3_BUCKET)"
    echo "  --validate-only           Only validate existing resources, don't create new ones"
    echo "  --cleanup                 Delete all created AWS resources (DESTRUCTIVE)"
    echo "  --help                    Show this help message"
    echo ""
    echo "Default behavior: Create missing resources (including an SQS queue wired to EventBridge"
    echo "                   spot-interruption/rebalance-recommendation events, and an S3 bucket"
    echo "                   with a logs prefix for ROSA log forwarding) and validate everything"
    echo "                   exists. SQS/EventBridge and the S3 bucket are named from the VPC so"
    echo "                   --cleanup removes the matching queue, rules, and bucket together."
    echo "                   The queue URL is written to playwright.env.json as QE_SPOT_INTERRUPTION_QUEUE_URL."
    echo "                   The S3 bucket and prefix are written as QE_LOG_FORWARDING_S3_BUCKET_NAME"
    echo "                   and QE_LOG_FORWARDING_S3_BUCKET_PREFIX."
}

# Parse command line arguments
MODE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --region)
            REGION="$2"
            shift 2
            ;;
        --vpc-name)
            VPC_NAME="$2"
            shift 2
            ;;
        --vpc-cidr)
            VPC_CIDR="$2"
            shift 2
            ;;
        --security-groups)
            NUM_SECURITY_GROUPS="$2"
            # Validate that it's a positive integer
            if ! [[ "$NUM_SECURITY_GROUPS" =~ ^[1-9][0-9]*$ ]]; then
                print_error "Invalid number of security groups: $NUM_SECURITY_GROUPS (must be a positive integer)"
                exit 1
            fi
            shift 2
            ;;
        --queue-prefix)
            QUEUE_PREFIX="$2"
            shift 2
            ;;
        --s3-bucket-name)
            S3_BUCKET_NAME="$2"
            shift 2
            ;;
        --s3-bucket-prefix)
            S3_BUCKET_PREFIX="$2"
            shift 2
            ;;
        --skip-sqs-queue)
            SKIP_SQS_QUEUE="true"
            shift
            ;;
        --skip-s3-bucket)
            SKIP_S3_BUCKET="true"
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
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

apply_vpc_scoped_defaults

# Execute based on mode
case "$MODE" in
    validate)
        validate_only
        ;;
    cleanup)
        cleanup_infrastructure
        ;;
    *)
        main
        ;;
esac 