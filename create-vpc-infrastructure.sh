#!/bin/bash

# AWS VPC Infrastructure Setup Script
# Creates: VPC, 3 public subnets, 3 private subnets, 2 security groups (no rules)

set -e  # Exit on any error

# Configuration Variables
VPC_NAME="cypress-test-ci"
VPC_CIDR="10.0.0.0/16"
REGION="us-west-2"

# Subnet CIDR blocks
PUBLIC_SUBNET_1_CIDR="10.0.1.0/24"
PUBLIC_SUBNET_2_CIDR="10.0.2.0/24"
PUBLIC_SUBNET_3_CIDR="10.0.3.0/24"

PRIVATE_SUBNET_1_CIDR="10.0.10.0/24"
PRIVATE_SUBNET_2_CIDR="10.0.20.0/24"
PRIVATE_SUBNET_3_CIDR="10.0.30.0/24"

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
        --query 'AvailabilityZones[0:3].ZoneName' \
        --output text
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
    
    # Check and create public subnet 1
    if ! check_subnet_exists "$VPC_NAME-public-subnet-1" "PUBLIC_SUBNET_1_ID"; then
        PUBLIC_SUBNET_1_ID=$(aws ec2 create-subnet \
            --vpc-id $VPC_ID \
            --cidr-block $PUBLIC_SUBNET_1_CIDR \
            --availability-zone ${AZS[0]} \
            --region $REGION \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$VPC_NAME-public-subnet-1}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        print_status "Created Public Subnet 1: $PUBLIC_SUBNET_1_ID (${AZS[0]})"
    fi
    
    # Check and create public subnet 2
    if ! check_subnet_exists "$VPC_NAME-public-subnet-2" "PUBLIC_SUBNET_2_ID"; then
        PUBLIC_SUBNET_2_ID=$(aws ec2 create-subnet \
            --vpc-id $VPC_ID \
            --cidr-block $PUBLIC_SUBNET_2_CIDR \
            --availability-zone ${AZS[1]} \
            --region $REGION \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$VPC_NAME-public-subnet-2}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        print_status "Created Public Subnet 2: $PUBLIC_SUBNET_2_ID (${AZS[1]})"
    fi
    
    # Check and create public subnet 3
    if ! check_subnet_exists "$VPC_NAME-public-subnet-3" "PUBLIC_SUBNET_3_ID"; then
        PUBLIC_SUBNET_3_ID=$(aws ec2 create-subnet \
            --vpc-id $VPC_ID \
            --cidr-block $PUBLIC_SUBNET_3_CIDR \
            --availability-zone ${AZS[2]} \
            --region $REGION \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$VPC_NAME-public-subnet-3}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        print_status "Created Public Subnet 3: $PUBLIC_SUBNET_3_ID (${AZS[2]})"
    fi
    
    # Enable auto-assign public IP for public subnets
    aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_1_ID --map-public-ip-on-launch
    aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_2_ID --map-public-ip-on-launch
    aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_3_ID --map-public-ip-on-launch
    
    print_status "Public subnets configured:"
    print_status "  Public Subnet 1: $PUBLIC_SUBNET_1_ID (${AZS[0]})"
    print_status "  Public Subnet 2: $PUBLIC_SUBNET_2_ID (${AZS[1]})"
    print_status "  Public Subnet 3: $PUBLIC_SUBNET_3_ID (${AZS[2]})"
}

# Function to create private subnets
create_private_subnets() {
    print_status "Creating private subnets..."
    
    # Get availability zones
    AZS=($(get_availability_zones))
    
    # Check and create private subnet 1
    if ! check_subnet_exists "$VPC_NAME-private-subnet-1" "PRIVATE_SUBNET_1_ID"; then
        PRIVATE_SUBNET_1_ID=$(aws ec2 create-subnet \
            --vpc-id $VPC_ID \
            --cidr-block $PRIVATE_SUBNET_1_CIDR \
            --availability-zone ${AZS[0]} \
            --region $REGION \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$VPC_NAME-private-subnet-1}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        print_status "Created Private Subnet 1: $PRIVATE_SUBNET_1_ID (${AZS[0]})"
    fi
    
    # Check and create private subnet 2
    if ! check_subnet_exists "$VPC_NAME-private-subnet-2" "PRIVATE_SUBNET_2_ID"; then
        PRIVATE_SUBNET_2_ID=$(aws ec2 create-subnet \
            --vpc-id $VPC_ID \
            --cidr-block $PRIVATE_SUBNET_2_CIDR \
            --availability-zone ${AZS[1]} \
            --region $REGION \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$VPC_NAME-private-subnet-2}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        print_status "Created Private Subnet 2: $PRIVATE_SUBNET_2_ID (${AZS[1]})"
    fi
    
    # Check and create private subnet 3
    if ! check_subnet_exists "$VPC_NAME-private-subnet-3" "PRIVATE_SUBNET_3_ID"; then
        PRIVATE_SUBNET_3_ID=$(aws ec2 create-subnet \
            --vpc-id $VPC_ID \
            --cidr-block $PRIVATE_SUBNET_3_CIDR \
            --availability-zone ${AZS[2]} \
            --region $REGION \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$VPC_NAME-private-subnet-3}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        print_status "Created Private Subnet 3: $PRIVATE_SUBNET_3_ID (${AZS[2]})"
    fi
    
    print_status "Private subnets configured:"
    print_status "  Private Subnet 1: $PRIVATE_SUBNET_1_ID (${AZS[0]})"
    print_status "  Private Subnet 2: $PRIVATE_SUBNET_2_ID (${AZS[1]})"
    print_status "  Private Subnet 3: $PRIVATE_SUBNET_3_ID (${AZS[2]})"
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
    associate_subnet_with_route_table $PUBLIC_SUBNET_1_ID $PUBLIC_RT_ID
    associate_subnet_with_route_table $PUBLIC_SUBNET_2_ID $PUBLIC_RT_ID
    associate_subnet_with_route_table $PUBLIC_SUBNET_3_ID $PUBLIC_RT_ID
    
    # Associate private subnets with private route table
    associate_subnet_with_route_table $PRIVATE_SUBNET_1_ID $PRIVATE_RT_ID
    associate_subnet_with_route_table $PRIVATE_SUBNET_2_ID $PRIVATE_RT_ID
    associate_subnet_with_route_table $PRIVATE_SUBNET_3_ID $PRIVATE_RT_ID
    
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
    print_status "Creating security groups..."
    
    # Check and create development security group
    if ! check_security_group_exists "$VPC_NAME-dev-sg" "DEV_SG_ID"; then
        DEV_SG_ID=$(aws ec2 create-security-group \
            --group-name "$VPC_NAME-dev-sg" \
            --description "Development environment security group" \
            --vpc-id $VPC_ID \
            --region $REGION \
            --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$VPC_NAME-dev-sg},{Key=Environment,Value=development}]" \
            --query 'GroupId' \
            --output text)
        print_status "Created development security group: $DEV_SG_ID"
    fi
    
    # Check and create testing security group
    if ! check_security_group_exists "$VPC_NAME-test-sg" "TEST_SG_ID"; then
        TEST_SG_ID=$(aws ec2 create-security-group \
            --group-name "$VPC_NAME-test-sg" \
            --description "Testing environment security group" \
            --vpc-id $VPC_ID \
            --region $REGION \
            --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$VPC_NAME-test-sg},{Key=Environment,Value=testing}]" \
            --query 'GroupId' \
            --output text)
        print_status "Created testing security group: $TEST_SG_ID"
    fi
    
    # Security groups created without any ingress rules
    # Rules can be added later as needed
    print_status "Security groups configured:"
    print_status "  Development SG: $DEV_SG_ID"
    print_status "  Testing SG: $TEST_SG_ID"
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
    
    # Validate subnets
    if ! check_subnet_exists "$VPC_NAME-public-subnet-1" "PUBLIC_SUBNET_1_ID"; then
        print_error "Public Subnet 1 validation failed"
        validation_failed=true
    fi
    
    if ! check_subnet_exists "$VPC_NAME-public-subnet-2" "PUBLIC_SUBNET_2_ID"; then
        print_error "Public Subnet 2 validation failed"
        validation_failed=true
    fi
    
    if ! check_subnet_exists "$VPC_NAME-public-subnet-3" "PUBLIC_SUBNET_3_ID"; then
        print_error "Public Subnet 3 validation failed"
        validation_failed=true
    fi
    
    if ! check_subnet_exists "$VPC_NAME-private-subnet-1" "PRIVATE_SUBNET_1_ID"; then
        print_error "Private Subnet 1 validation failed"
        validation_failed=true
    fi
    
    if ! check_subnet_exists "$VPC_NAME-private-subnet-2" "PRIVATE_SUBNET_2_ID"; then
        print_error "Private Subnet 2 validation failed"
        validation_failed=true
    fi
    
    if ! check_subnet_exists "$VPC_NAME-private-subnet-3" "PRIVATE_SUBNET_3_ID"; then
        print_error "Private Subnet 3 validation failed"
        validation_failed=true
    fi
    
    # Validate security groups
    if ! check_security_group_exists "$VPC_NAME-dev-sg" "DEV_SG_ID"; then
        print_error "Development Security Group validation failed"
        validation_failed=true
    fi
    
    if ! check_security_group_exists "$VPC_NAME-test-sg" "TEST_SG_ID"; then
        print_error "Testing Security Group validation failed"
        validation_failed=true
    fi
    
    # Validate route tables
    if ! check_route_table_exists "$VPC_NAME-public-rt" "PUBLIC_RT_ID"; then
        print_error "Public Route Table validation failed"
        validation_failed=true
    fi
    
    if ! check_route_table_exists "$VPC_NAME-private-rt" "PRIVATE_RT_ID"; then
        print_error "Private Route Table validation failed"
        validation_failed=true
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
    
    # Define the cypress environment file
    CYPRESS_ENV_FILE="cypress.env.json"
    
    # Create the new VPC infrastructure JSON structure
    NEW_VPC_DATA='{
        "VPC-ID": "'$VPC_ID'",
        "VPC_NAME": "'$VPC_NAME'",
        "SECURITY_GROUPS": [
          "'$DEV_SG_ID'",
          "'$TEST_SG_ID'"
        ],
        "SECURITY_GROUPS_NAME": [
          "'$VPC_NAME'-dev-sg",
          "'$VPC_NAME'-test-sg"
        ],
        "SUBNETS": {
          "ZONES": {
            "'${AZS[0]}'": {
              "PUBLIC_SUBNET_NAME": "'$VPC_NAME'-public-subnet-1",
              "PUBLIC_SUBNET_ID": "'$PUBLIC_SUBNET_1_ID'",
              "PRIVATE_SUBNET_NAME": "'$VPC_NAME'-private-subnet-1",
              "PRIVATE_SUBNET_ID": "'$PRIVATE_SUBNET_1_ID'"
            },
            "'${AZS[1]}'": {
              "PUBLIC_SUBNET_NAME": "'$VPC_NAME'-public-subnet-2",
              "PUBLIC_SUBNET_ID": "'$PUBLIC_SUBNET_2_ID'",
              "PRIVATE_SUBNET_NAME": "'$VPC_NAME'-private-subnet-2",
              "PRIVATE_SUBNET_ID": "'$PRIVATE_SUBNET_2_ID'"
            },
            "'${AZS[2]}'": {
              "PUBLIC_SUBNET_NAME": "'$VPC_NAME'-public-subnet-3",
              "PUBLIC_SUBNET_ID": "'$PUBLIC_SUBNET_3_ID'",
              "PRIVATE_SUBNET_NAME": "'$VPC_NAME'-private-subnet-3",
              "PRIVATE_SUBNET_ID": "'$PRIVATE_SUBNET_3_ID'"
            }
          }
        }
      }'
    
    # Check if cypress.env.json exists
    if [[ -f "$CYPRESS_ENV_FILE" ]]; then
        print_status "Updating existing cypress.env.json file..."
        
        # Create a backup
        cp "$CYPRESS_ENV_FILE" "${CYPRESS_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Check if the file has valid JSON structure
        if ! jq empty "$CYPRESS_ENV_FILE" > /dev/null 2>&1; then
            print_error "Invalid JSON in $CYPRESS_ENV_FILE. Please fix the file structure."
            exit 1
        fi
        
        # Always overwrite QE_INFRA_REGIONS with the new VPC infrastructure data
        print_status "Overwriting QE_INFRA_REGIONS in $CYPRESS_ENV_FILE"
        jq --arg region "$REGION" --argjson vpc_data "$NEW_VPC_DATA" \
            '.QE_INFRA_REGIONS = {($region): [$vpc_data]}' \
            "$CYPRESS_ENV_FILE" > "${CYPRESS_ENV_FILE}.tmp" && mv "${CYPRESS_ENV_FILE}.tmp" "$CYPRESS_ENV_FILE"
        
        if [[ $? -eq 0 ]]; then
            print_status "Successfully updated $CYPRESS_ENV_FILE"
        else
            print_error "Failed to update $CYPRESS_ENV_FILE"
            exit 1
        fi
        
    else
        print_status "Creating new cypress.env.json file..."
        
        # Create new cypress.env.json with just the VPC infrastructure data
        cat > "$CYPRESS_ENV_FILE" << EOF
{
  "QE_INFRA_REGIONS": {
    "$REGION": [
      $NEW_VPC_DATA
    ]
  }
}
EOF
        print_status "Created new $CYPRESS_ENV_FILE"
    fi
    
    print_status "VPC infrastructure created successfully!"
    print_status "Configuration updated in: $CYPRESS_ENV_FILE"
}

# Main execution
main() {
    print_status "Starting VPC infrastructure creation..."
    print_status "Region: $REGION"
    print_status "VPC CIDR: $VPC_CIDR"
    
    check_aws_cli
    check_aws_credentials
    check_jq
    
    create_vpc
    create_internet_gateway
    create_public_subnets
    create_private_subnets
    create_route_tables
    create_security_groups
    
    # Uncomment the next line if you want to create a NAT Gateway
    create_nat_gateway
    
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
    echo ""
    
    read -p "Are you sure you want to proceed? Type 'yes' to confirm: " confirm
    if [[ "$confirm" != "yes" ]]; then
        print_status "Cleanup cancelled."
        exit 0
    fi
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
            --query 'RouteTables[0].Associations[?!Main].AssociationId' \
            --output text 2>/dev/null)
        
        for association in $ASSOCIATIONS; do
            if [[ "$association" != "None" && "$association" != "" ]]; then
                print_status "Removing association: $association"
                aws ec2 disassociate-route-table --association-id $association --region $REGION
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
            print_status "Attempting to list remaining dependencies..."
            aws ec2 describe-route-tables --route-table-ids $PUBLIC_RT_ID --region $REGION || true
        fi
    fi
    
    # Clean up private route table
    if [[ "$PRIVATE_RT_ID" != "None" && "$PRIVATE_RT_ID" != "" ]]; then
        print_status "Cleaning up private route table: $PRIVATE_RT_ID"
        
        # Remove associations
        ASSOCIATIONS=$(aws ec2 describe-route-tables \
            --route-table-ids $PRIVATE_RT_ID \
            --region $REGION \
            --query 'RouteTables[0].Associations[?!Main].AssociationId' \
            --output text 2>/dev/null)
        
        for association in $ASSOCIATIONS; do
            if [[ "$association" != "None" && "$association" != "" ]]; then
                print_status "Removing association: $association"
                aws ec2 disassociate-route-table --association-id $association --region $REGION
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
            print_status "Attempting to list remaining dependencies..."
            aws ec2 describe-route-tables --route-table-ids $PRIVATE_RT_ID --region $REGION || true
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

# Function to update cypress.env.json after cleanup
cleanup_cypress_config() {
    print_status "Cleaning up cypress.env.json configuration..."
    
    CYPRESS_ENV_FILE="cypress.env.json"
    
    if [[ -f "$CYPRESS_ENV_FILE" ]]; then
        # Create a backup
        cp "$CYPRESS_ENV_FILE" "${CYPRESS_ENV_FILE}.cleanup-backup.$(date +%Y%m%d_%H%M%S)"
        
        # Remove the region entry from QE_INFRA_REGIONS
        if jq empty "$CYPRESS_ENV_FILE" > /dev/null 2>&1; then
            print_status "Removing $REGION from QE_INFRA_REGIONS in $CYPRESS_ENV_FILE"
            jq --arg region "$REGION" 'del(.QE_INFRA_REGIONS[$region])' \
                "$CYPRESS_ENV_FILE" > "${CYPRESS_ENV_FILE}.tmp" && mv "${CYPRESS_ENV_FILE}.tmp" "$CYPRESS_ENV_FILE"
            
            # If QE_INFRA_REGIONS is now empty, you might want to keep the structure or remove it entirely
            # This keeps the empty object for now
            print_status "Configuration cleaned up in $CYPRESS_ENV_FILE"
        else
            print_warning "Could not parse $CYPRESS_ENV_FILE as valid JSON. Manual cleanup may be required."
        fi
    else
        print_status "No cypress.env.json file found"
    fi
}

# Main cleanup function
cleanup_infrastructure() {
    print_status "Starting infrastructure cleanup..."
    print_status "Region: $REGION"
    print_status "VPC Name: $VPC_NAME"
    
    check_aws_cli
    check_aws_credentials
    check_jq
    
    # Check if VPC exists and get its ID
    if ! check_vpc_exists; then
        print_warning "VPC '$VPC_NAME' not found in region '$REGION'"
        print_status "Nothing to clean up."
        return 0
    fi
    
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
    
    # Cleanup in reverse order of creation
    cleanup_nat_gateway
    cleanup_route_tables
    cleanup_security_groups
    cleanup_subnets
    cleanup_internet_gateway
    cleanup_vpc
    cleanup_cypress_config
    
    print_status "=== Cleanup Completed Successfully ==="
    print_status "All AWS resources for VPC '$VPC_NAME' have been deleted."
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --validate-only    Only validate existing resources, don't create new ones"
    echo "  --cleanup          Delete all created AWS resources (DESTRUCTIVE)"
    echo "  --help             Show this help message"
    echo ""
    echo "Default behavior: Create missing resources and validate everything exists"
}

# Parse command line arguments
case "${1:-}" in
    --validate-only)
        validate_only
        ;;
    --cleanup)
        cleanup_infrastructure
        ;;
    --help)
        show_usage
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac 