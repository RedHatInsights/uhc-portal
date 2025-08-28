#!/bin/bash

help()
{
  echo "----------------------------------------------------------------------------"
  echo "Utlities for Setting up ROSA resource as well as AWS cloud resources."
  echo "Example 1): cypress-qe-prerun.sh -a cypress.env.json -v 1 -r us-west-2"
  echo "            Create AWS cloud resources command referring cypress.env.json & update the details."
  echo "Example 2): cypress-qe-prerun.sh -b cypress.env.json -v 1 -r us-west-2"
  echo "            Create ROSA and AWS cloud resources command referring cypress.env.json & update the details."
  echo "Example 3): cypress-qe-prerun.sh -c cypress.env.json"
  echo "            Run ROSA CLI resource creation command referring cypress.env.json."
  echo "Example 4): cypress-qe-prerun.sh -d cypress.env.json"
  echo "            Delete the cloud resources (ex: delete the VPC) listed in cypress.env.json."
  echo "options:"
  echo "-a   Setup all cloud pre-requistis (Cloud resources such as VPC, Subnets etc in AWS) for cypress automation."
  echo "-b   Setup both ROSA and cloud pre-requistis for cypress automation."
  echo "-c   Setup all the ROSA requirements such as ocm-roles,user-roles etc for cypress automation."
  echo "-d   Delete all cloud resources from cypress.env.json."
  echo "-n   (optional) Name of the VPC that will be prefix to VPC name."
  echo "-r   Region to be used for VPC creation (Ex: us-west-2). Supported regions are us-west-2, us-east-2, eu-west-2, ap-south-2, ap-northeast-2."
  echo "-v   Number of vpcs to be created."
  echo "-------------------------------------------------------------------------"
  exit
}

while getopts :c:a:b:v:r:n:d:h option
do
   case "${option}"
       in
       c)ROSA_RESOURCES=${OPTARG};;
       a)CLOUD_RESOURCES=${OPTARG};;
       b)BOTH_RESOURCES=${OPTARG};;
       v)VPC_COUNT=${OPTARG};;
       r)REGION=${OPTARG};;
       n)NAME_OF_VPC=${OPTARG};;
       d)DELETE_RESOURCES=${OPTARG};;
       h)help
   esac
done

function setup_rosa_resources()
{
 # Reading and parsing cypress.env.json for CLI steps.
 echo "Reading and parsing $1 file."
 config_json=`cat $1`
 echo "cypress.env.json file contents : $config_json"
 TEST_QE_AWS_ACCESS_KEY_ID=`echo "$config_json" | jq '.QE_AWS_ACCESS_KEY_ID'`
 TEST_QE_AWS_ACCESS_KEY_SECRET=`echo "$config_json" | jq '.QE_AWS_ACCESS_KEY_SECRET'`
 TEST_QE_AWS_REGION=`echo "$config_json" | jq '.QE_AWS_REGION'`
 TEST_QE_AWS_ID=`echo "$config_json" | jq -r '.QE_AWS_ID'`
 QE_ORGADMIN_OFFLINE_TOKEN=`echo "$config_json" | jq -r '.QE_ORGADMIN_OFFLINE_TOKEN'`
 QE_ORGADMIN_CLIENT_ID=`echo "$config_json" | jq -r '.QE_ORGADMIN_CLIENT_ID'`
 QE_ORGADMIN_CLIENT_SECRET=`echo "$config_json" | jq -r '.QE_ORGADMIN_CLIENT_SECRET'`
 ENV_AUT=`echo "$config_json" | jq -r '.QE_ENV_AUT'`
 QE_ACCOUNT_ROLE_PREFIX=`echo "$config_json" | jq -r '.QE_ACCOUNT_ROLE_PREFIX'`
 QE_OCM_ROLE_PREFIX=`echo "$config_json" | jq -r '.QE_OCM_ROLE_PREFIX'`
 QE_USER_ROLE_PREFIX=`echo "$config_json" | jq -r '.QE_USER_ROLE_PREFIX'`
 QE_USE_OFFLINE_TOKEN=`echo "$config_json" | jq -r '.QE_USE_OFFLINE_TOKEN'`

 # Executing ROSA commands for pre-config step.
 echo "Executing ROSA pre-config commands"
 rosa version
 aws configure set aws_access_key_id "${TEST_QE_AWS_ACCESS_KEY_ID}"
 aws configure set aws_secret_access_key "${TEST_QE_AWS_ACCESS_KEY_SECRET}"
 aws configure set region "${TEST_QE_AWS_REGION}"
 aws configure set output "json"

 if [ "$QE_USE_OFFLINE_TOKEN" = true ];then
   echo "Login via Offline token"
   rosa login --token $QE_ORGADMIN_OFFLINE_TOKEN --env $ENV_AUT
 else
   echo "Login via service account client definition"
   rosa login --client-id $QE_ORGADMIN_CLIENT_ID --client-secret $QE_ORGADMIN_CLIENT_SECRET  --env $ENV_AUT
 fi

 linked_ocmrole=$(rosa list ocm-roles | awk '$3 == "Yes" { print $2 }')
 if [ ! -z $linked_ocmrole ];then
   rosa unlink ocm-role --role-arn $linked_ocmrole  -y
 fi

 linked_userrole=$(rosa list user-roles | awk '$3 == "Yes" { print $2 }')
 if [ ! -z $linked_userrole ];then
   rosa unlink user-role --role-arn $linked_userrole  -y
 fi
 ocmroles_success_msg=$(rosa create ocm-role --prefix ${QE_OCM_ROLE_PREFIX} --mode auto --admin -y 2>&1)
 orphen_ocmroles=$(echo $ocmroles_success_msg |  grep "unlink" | sed -n -l4 "s/.*\(arn:aws:iam::${TEST_QE_AWS_ID}:.*[0-9]\).*/\1/p")
 if [ ! -z $orphen_ocmroles ];then
   rosa unlink ocm-role --role-arn $orphen_ocmroles  -y
   ocmroles_success_msg=$(rosa create ocm-role --prefix ${QE_OCM_ROLE_PREFIX} --mode auto --admin -y)
 fi
 echo $ocmroles_success_msg

 # If QE_USE_OFFLINE_TOKEN = False then Do not create user-roles always the user-role associated to test org preserved.
 # See https://issues.redhat.com/browse/DPP-14920
 if [ "$QE_USE_OFFLINE_TOKEN" = true ];then
   userroles_success_msg=$(rosa create user-role --prefix ${QE_USER_ROLE_PREFIX} --mode auto -y 2>&1)
   orphen_userroles=$(echo $userroles_success_msg |  grep "unlink" | sed -n "s/.*\(arn:aws:iam::${TEST_QE_AWS_ID}:.*[0-9]\).*/\1/p")
   if [ ! -z $orphen_userroles ];then
     rosa unlink user-role --role-arn $orphen_userroles  -y
     userroles_success_msg=$(rosa create user-role --prefix ${QE_USER_ROLE_PREFIX} --mode auto -y)
   fi
   echo $userroles_success_msg
 fi

 rosa create account-roles --prefix ${QE_ACCOUNT_ROLE_PREFIX} --mode auto -y
 echo "Completed ROSA pre-config commands!"
}

function setup_cloud_resources()
{
 if [[ ! -z $VPC_COUNT  &&  ! -z $REGION ]];then
   # Conditions to check the current regions and the supported availability zones based on the region
   if [ $REGION = us-west-2 ] || [ $REGION = us-east-2 ] || [ $REGION = eu-west-2 ] || [ $REGION = ap-south-2 ]; then
       zones=("a" "b" "c")
   elif [ $REGION = ap-northeast-2 ]; then
       zones=("a" "c" "d")
   else
       echo "Specified region is not supported , refer help."
       help
   fi

   if [[ "$VPC_COUNT" =~ ^[0-9]+$ ]]; then
       if [[ "$VPC_COUNT" -le 0 ]]; then
       echo "Invalid VPC count i.e ${VPC_COUNT}. VPC count should be an integer value > 0 !"
       help
       fi
   else
       echo "Invalid VPC format i.e ${VPC_COUNT}. VPC count should be an positive integer value !"
       help
   fi
   echo "Starting cloud resource creation!!"
   QE_INFRA_REGIONS='{"QE_INFRA_REGIONS":{"'${REGION}'":['
   for((i=1; i <=$VPC_COUNT; i++)); do
       # Create VPC ID
       if [ ! -z $NAME_OF_VPC ];then
         VPC_NAME="${NAME_OF_VPC}-$(date '+%m%d%H%M%S')"
       else
         VPC_NAME="ocmuiqe-$(date '+%m%d%H%M%S')"
       fi
       create_vpc="$(rosa-support create vpc --region ${REGION} --name ${VPC_NAME} 2>&1 | tail -n 3)"

       # Extract VPC ID
       vpc_id="$(echo $create_vpc | grep -o 'VPC ID: vpc-[a-zA-Z0-9]*' | awk '{print $NF}')"
       echo "Created VPC and VPC ID: $vpc_id and VPC NAME:$VPC_NAME"

       # Create Security Group IDs
       create_securitygroup="$(rosa-support create security-groups --name-prefix=${VPC_NAME} --region ${REGION} --vpc-id $vpc_id --count 2  2>&1 | tail -n 1)"
       echo $create_securitygroup
       # Extract Security Group IDs
       securitygroup_id_1="$(echo $create_securitygroup | awk 'NR == 1 { print $7 }'| awk -F, '{print $1}')"
       securitygroup_id_2="$(echo $create_securitygroup | awk 'NR == 1 { print $7 }'| awk -F, '{print $2}'| tr -d "'\"")"
       security_grp1_name="${VPC_NAME}-0"
       security_grp2_name="${VPC_NAME}-1"
       echo "Security Group IDs: $securitygroup_id_1, $securitygroup_id_2"
       echo "Security Group Names: $security_grp1_name, $security_grp2_name"     

       if [[ $i -gt 1 && $i -le $VPC_COUNT ]]; then
         QE_INFRA_REGIONS+=","
       fi

       QE_INFRA_REGIONS+='{"VPC-ID": "'${vpc_id}'",
                 "VPC_NAME": "'${VPC_NAME}'",
                 "SECURITY_GROUPS": ["'${securitygroup_id_1}'", "'${securitygroup_id_2}'"],
                 "SECURITY_GROUPS_NAME": ["'${security_grp1_name}'","'${security_grp2_name}'"],
                 "SUBNETS":{ "ZONES" :{ zone-values }}}'
       ZONEVALUES=""
       counter=1
     # Loop through zones
       for zone in ${zones[@]} ; do
           echo "VPC ID: $vpc_id, Iteration: $i, Zone: $zone"
           # Creates Linked Subnet
           create_linked_subnet="$(rosa-support create subnets --region ${REGION} --availability-zones ${REGION}$zone --vpc-id $vpc_id 2>&1 | tail -n 2)"
           # Extract public and private subnet IDs
           public_subnet_id="$(echo "$create_linked_subnet" | grep -o 'PUBLIC SUBNET: subnet-[a-zA-Z0-9]*' | awk '{print $NF}')"
           private_subnet_id="$(echo "$create_linked_subnet" | grep -o 'PRIVATE SUBNET: subnet-[a-zA-Z0-9]*' | awk '{print $NF}')"
           public_subnet_name="${VPC_NAME}-public-${REGION}$zone"
           private_subnet_name="${VPC_NAME}-private-${REGION}$zone"
           echo "Public Subnet ID: $public_subnet_id, Private Subnet ID:  $private_subnet_id, Zone: $zone"
           echo "Public Subnet names: $public_subnet_name, Private Subnet names:  $private_subnet_name, Zone: $zone"
          
           if [[ $counter -gt 1 && $counter -le ${#zones[@]} ]]
           then
             ZONEVALUES+=","
           fi

           ZONEVALUES+='"'${REGION}${zone}'": {
                   "PUBLIC_SUBNET_NAME": "'${public_subnet_name}'",
                   "PUBLIC_SUBNET_ID":"'${public_subnet_id}'",
                   "PRIVATE_SUBNET_NAME": "'${private_subnet_name}'",
                   "PRIVATE_SUBNET_ID": "'${private_subnet_id}'"}'

           counter=$((counter+1))
     done
     ZONE_DEFINITION=$(echo $ZONEVALUES)
     QE_INFRA_REGIONS=$(echo "$QE_INFRA_REGIONS" | sed "s/zone-values/$ZONE_DEFINITION/")
   done
   QE_INFRA_REGIONS+="]}}"
   echo $QE_INFRA_REGIONS > vpc.json
 else
   echo "Invalid parameters or call. Refer the help!"
   help
 fi
}

function cleanup_cloud_resources()
{
   if [[ ! -z $VPC_COUNT  &&  ! -z $REGION ]];then
     echo "Invalid parameters are supplied and will be ignored!"
   fi
   if [ ! -z $DELETE_RESOURCES ];then
     echo "Delete VPC action"
     QE_TEST_INFRA_REGIONS=$(cat $DELETE_RESOURCES | jq '.QE_INFRA_REGIONS')
     TOTAL_ZONES=$(echo $QE_TEST_INFRA_REGIONS | jq -r 'keys | ( .[] | tostring )')
     for ZONE in $TOTAL_ZONES; do
       echo "Looking for VPCs from ${ZONE}"
       TOTAL_VPC_DATA=$(echo $QE_TEST_INFRA_REGIONS | jq '.["'$ZONE'"]')
       TOTAL_VPC_PER_ZONE=$(echo $TOTAL_VPC_DATA | jq 'length')
       echo "Total number of VPCs from Zone ${ZONE} is ${TOTAL_VPC_PER_ZONE}"
       for((i=0; i <$TOTAL_VPC_PER_ZONE; i++)); do
         VPC_ID=$(echo $TOTAL_VPC_DATA | jq -r '.['${i}']["VPC-ID"]')
         echo "Starting cleanup of VPC ID ${VPC_ID}"
         delete_vpc="$(rosa-support delete vpc  --vpc-id ${VPC_ID} --region ${ZONE} --total-clean 2>&1)"
         echo $delete_vpc
         if [[ "$delete_vpc" =~ "Delete vpc ${VPC_ID} successfuly " ]]; then
           echo "(/) Cloud resource cleanup on VPC:${VPC_ID} done!!"
         else
           echo "(X) Cloud resource cleanup on VPC: ${VPC_ID} failed and refer logs!!"
         fi
       done
     done
 else
   echo "Invalid parameters or call. Refer the help!"
   help
 fi
}

if [ ! -z $BOTH_RESOURCES ];then
 setup_rosa_resources $BOTH_RESOURCES
 setup_cloud_resources
elif [ ! -z $ROSA_RESOURCES ];then
   setup_rosa_resources $ROSA_RESOURCES
elif [ ! -z $CLOUD_RESOURCES ];then
   setup_cloud_resources
elif [ ! -z $DELETE_RESOURCES ];then
   cleanup_cloud_resources
else
   echo "Invalid parameters or call. Refer the help!"
   help
fi