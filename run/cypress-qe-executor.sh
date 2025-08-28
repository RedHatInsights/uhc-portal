#!/bin/bash -e
# This script starts a podman pod that runs the Cypress tests.
# Specially designed for QE related pipeline runs.

export ELECTRON_RUN_AS_NODE=1
EXECUTION_EXIT_STATUS=0
# Checks on Different flavours w.r.t ENVIRONMENT, BROWSER, TAGS
if [ $1 ]
then
  if [ $1 = 'staging' ]; then
    ENVIRONMENT="console.dev.redhat.com"
  elif [ $1 = 'production' ]; then
    ENVIRONMENT="console.redhat.com"
  else
    echo "No matching test environment found! Supported environments are staging and production."
    exit 1
  fi
fi
if [ $2 ]; then BROWSER="$2"; fi
if [ $3 ]; then TAGS="$3"; fi

if [[ $1 =~ "production" ]]; then
  ENV_AUT="production"
else
  ENV_AUT="staging"
fi

# TAGS are comma seperated strings and will be combination of day 0/1/2/3 and products or common tags."
# TAGS are filtered with day1,day2 and day3 categories to spilt the execution model.
# TAGS="day1+list,smoke,day2+rosa"
TAGS_ARRAY=($(echo $TAGS | tr ',' "\n"))
for i in "${!TAGS_ARRAY[@]}"
do
      if [[ ${TAGS_ARRAY[$i]} =~ "day1" ]];then
        DAY1_TAGS+="${TAGS_ARRAY[$i]} "
      elif [[ ${TAGS_ARRAY[$i]} =~ "day2" ]];then
        DAY2_TAGS+="${TAGS_ARRAY[$i]} "
      elif [[ ${TAGS_ARRAY[$i]} =~ "day3" ]];then
        DAY3_TAGS+="${TAGS_ARRAY[$i]} "
      else
        OTHER_TAGS+="${TAGS_ARRAY[$i]} "
      fi
done
DAY1_TAGS+="$OTHER_TAGS"

# Writing env variables definitions from vault to cypress.env.json.
cat > cypress.env.json << EOF
${TEST_QE_CYPRESS_ENV_VARIABLES}
EOF

echo "*******************Execution details***************************"
echo "** ENVIRONMENT URL under test : https://$ENVIRONMENT/openshift  **"
echo "** BROWSER under test     : $BROWSER  **"
echo "** Selected tags for whole executions are : $TAGS  **"
echo "**************************************************************"

cd "$(dirname "$(dirname "$0")")"  # repo root directory (above run/ that contains this script)

# Find the Jenkins build number that will be appended to the pod and container
# names, or else use the date if not running inside Jenkins:
build_number="${BUILD_NUMBER}"
if [ -z "${build_number}" ]; then
  build_number=$(date +%s)
fi

rosacli_container_name="rosacli-${build_number}";
cloudutil_container_name="cloudutil-${build_number}";

# Cypress images with browser for containerized runs
browser_image="quay.io/app-sre/ocmui-cypress-tests:updated"
# ROSA CLI images for pre-requisits containerized runs
rosacli_image="registry.ci.openshift.org/ci/rosa-aws-cli:latest"
# QCMQE image for setting up cloud resources for the runs
cloudutil_image="quay.io/openshifttest/ocmqeaws:1.2.0"

mkdir -p "${PWD}/cypress/videos"
mkdir -p "${PWD}/cypress/screenshots"
mkdir -p "${PWD}/run/output/embedded_files"

# Precondition on Quay credentail definition
if [ -z "${QUAY_USER}" ]; then
  echo "The 'quay.io' push user name hasn't been provided."
  echo "Make sure to set the 'QUAY_USER' environment variable."
  exit 1
fi
if [ -z "${QUAY_TOKEN}" ]; then
  echo "The 'quay.io' push token hasn't been provided."
  echo "Make sure to set the 'QUAY_TOKEN' environment variable."
  exit 1
fi
# Login to Quay with user
podman login -u "${QUAY_USER}" --password-stdin <<< "${QUAY_TOKEN}" quay.io

function cypress_container_run(){
  browser_container_name=$1
  pod_id=$2
  tags=$3
  echo "*******************Container profile details***************************"
  echo "** Continer names                 : $browser_container_name  **"
  echo "** Selected case tags/profile are : $tags  **"
  echo "**************************************************************"
  browser_container_id=$(
    podman run \
      --pod "${pod_id}" \
      --name "${browser_container_name}" \
      --shm-size "2g" \
      --security-opt label="disable" \
      --pull newer \
      --volume "${PWD}/cypress.config.js:/e2e/cypress.config.js" \
      --volume "${PWD}/tsconfig.json:/e2e/tsconfig.json" \
      --volume "${PWD}/cypress.env.json:/e2e/cypress.env.json" \
      --volume "${PWD}/cypress:/e2e/cypress" \
      --volume "${PWD}/node_modules:/e2e/node_modules" \
      --env "CYPRESS_BASE_URL=https://${ENVIRONMENT}/openshift/" \
      --env NO_COLOR=1 \
      --env "CYPRESS_grepTags=${tags}" \
      --entrypoint=cypress \
      "${browser_image}" \
      run --browser ${BROWSER}
  )
  cypress_container_id=$(podman ps -a -q -f name=$browser_container_name)
  echo "Cypress container id is ${cypress_container_id}"
}

function collect_logs(){
  browser_container_name=$1
    if [ ! -z "${browser_container_name}" ]; then
      echo "Starting log collection from ${browser_container_name}"
      podman logs "${browser_container_name}"
      podman logs "${browser_container_name}" &> "${browser_container_name}-browser.log"
      echo "copying cypress screenshots & videos to /run/output/embedded_files/..."
      podman cp "${browser_container_name}:/e2e/cypress/screenshots/" ${PWD}"/run/output/embedded_files/"
      podman cp "${browser_container_name}:/e2e/cypress/videos/" "${PWD}/run/output/embedded_files/"
      podman cp "${browser_container_name}:cli-logs.txt" ${PWD}"/cli-logs.txt"
      echo "Completed log collection from ${browser_container_name}"
    fi
}

function cloudutil_container_run(){

  TEST_QE_AWS_ACCESS_KEY_ID=$(jq -r '.QE_AWS_ACCESS_KEY_ID' ${PWD}/cypress.env.json)
  TEST_QE_AWS_ACCESS_KEY_SECRET=$(jq -r '.QE_AWS_ACCESS_KEY_SECRET' ${PWD}/cypress.env.json)
  TEST_QE_AWS_REGION=$(jq -r '.QE_AWS_REGION' ${PWD}/cypress.env.json)

  cloudutil_container_name=$1
  pod_id=$2
  is_create_resource_action=$3
  cloud_command="bash cypress-qe-prerun.sh"
  if [[ "$is_create_resource_action" = true ]]; then
    cloud_command+=" -a cypress.env.json -v 1 -r ${TEST_QE_AWS_REGION}"
  else
    cloud_command+=" -d cypress.env.json"
  fi
  # Cloudutil container for creating cloud resources for test runs.
  echo "Creating cloud util container with command : ${cloud_command}"
  cloudutil_container_id=$(
    podman run \
      --pod "${pod_id}" \
      --security-opt label="disable" \
      --user root \
      --volume "${PWD}/cypress.env.json:/usr/bin/cypress.env.json" \
      --volume "${PWD}/cypress-qe-prerun.sh:/usr/bin/cypress-qe-prerun.sh" \
      --env AWS_ACCESS_KEY_ID="${TEST_QE_AWS_ACCESS_KEY_ID}"  \
      --env AWS_SECRET_ACCESS_KEY="${TEST_QE_AWS_ACCESS_KEY_SECRET}" \
      --name "${cloudutil_container_name}" \
      "${cloudutil_image}" \
      ${cloud_command}
  )
  cloudutil_container_id=$(podman ps -a -q -f name=$cloudutil_container_name)
  echo "Cloud util container id - $cloudutil_container_id"

  if [ ! -z "${cloudutil_container_name}" ]; then
      podman logs "${cloudutil_container_name}"
      if [[ "$is_create_resource_action" = true ]]; then
        echo "Copying cloudutil prerun logs..."
        podman logs "${cloudutil_container_name}" &> cloudutil-prerun-logs.log
        podman cp "${cloudutil_container_name}:vpc.json" ${PWD}"/vpc.json"
      else
        echo "Copying cloudutil cleanup logs..."
        podman logs "${cloudutil_container_name}" &> cloudutil-cleanup-logs.log
      fi
  fi
}
# Create the initially empty pod for cypress runs.
pod_id=$(
  podman pod create \
    --name "cypress-${build_number}" \
    --add-host "qa.foo.redhat.com:127.0.0.1" \
    --add-host "prod.foo.redhat.com:127.0.0.1" \
    --add-host "registry-1.docker.io/v2/:127.0.0.0" \
    --publish "4444" \
    --publish "5900" \
    --share "net"
)
echo "Cypress testing pod id - $pod_id"

# rosa cli container for executing CLI steps.
echo "Creating rosa cli container."
rosacli_container_id=$(
  podman run \
    --pod "${pod_id}" \
    --security-opt label="disable" \
    --user root \
    --volume "${PWD}/cypress.env.json:/rosa/cypress.env.json" \
    --volume "${PWD}/cypress-qe-prerun.sh:/rosa/cypress-qe-prerun.sh" \
    --name "${rosacli_container_name}" \
    "${rosacli_image}" \
    sh cypress-qe-prerun.sh -c cypress.env.json
)
rosacli_container_id=$(podman ps -a -q -f name=$rosacli_container_name)
echo "ROSA CLI container id - $rosacli_container_id"

if [ ! -z "${rosacli_container_name}" ]; then
    echo "Copying rosacli prerun logs..."
    podman logs "${rosacli_container_name}"
    podman logs "${rosacli_container_name}" &> rosacli-prerun-logs.log
fi


# Cloudutil container for creating cloud resources for test runs.
cloudutil_container_run $cloudutil_container_name $pod_id true

# Check the if the vpc.json created and pushed by container valid or not
# if valid parse the definition to cypress.env.json else do not parse to cypress.env.json.
IS_VALID_JSON=$(cat vpc.json | jq -e . >/dev/null 2>&1 ; echo ${PIPESTATUS[1]})
if [[ $IS_VALID_JSON -eq 0 ]]
then
  jq -s add cypress.env.json vpc.json >> "tmp" && mv "tmp" cypress.env.json
else
  echo "The VPC JSON content is invalid- it could be due to the issue that cloud resources failed to create.."
  echo "Please review the logs!"
fi

# Add to the pod the Cypress runner & start the runs.
# Container that helps for day1 , day0 ,other common tests.
if [ ! -z "${DAY1_TAGS}" ]; then
  echo ">> Starting DAY-1 operations + Other common test executions."
  browser_container_name="cypress-day1-common-tests-${build_number}"
  cypress_container_run $browser_container_name $pod_id "$DAY1_TAGS"
  collect_logs $browser_container_name
  echo ">> Completed DAY-1 operations/ Other common test executions."
fi

# Sleeps the execution for 1 hr to make day1 clusters ready for day 2 actions.
if [ ! -z "${DAY1_TAGS}" ] && [ ! -z "${DAY2_TAGS}" ]; then
    echo "** Sleeps for 50m to make day1 clusters ready for day2 actions. **"
    sleep 50m
fi

# Container that helps for day2 tests.
if [ ! -z "${DAY2_TAGS}" ]; then
  echo ">> Starting DAY-2 operations test executions."
  browser_container_name="cypress-day2-tests-${build_number}"
  cypress_container_run $browser_container_name $pod_id "$DAY2_TAGS"
  collect_logs $browser_container_name
  echo ">> Completed DAY-2 operations test executions."
fi

# Container that helps for day3 cleanup actions.
if [ ! -z "${DAY3_TAGS}" ]; then
  echo ">> Starting DAY-3 operations test executions."
  browser_container_name="cypress-day3-tests-${build_number}";
  cypress_container_run $browser_container_name $pod_id "$DAY3_TAGS"
  collect_logs $browser_container_name
  echo ">> Completed DAY-3 operations test executions."
fi

browser_logfile_counts=$(find . -type f -name '*browser.log'|wc -l)
pass_execution_counts=$(grep -F "All specs passed" *browser.log|wc -l)
if [ $pass_execution_counts -ne $browser_logfile_counts ]; then
    EXECUTION_EXIT_STATUS=1
fi
echo "** $browser_logfile_counts out of $pass_execution_counts executions are passed ! **"

# echo "Starting cleanup cloud resources!"
cloudutil_container_run "${cloudutil_container_name}-cleanup" $pod_id false

if [ ! -z "${pod_id}" ]; then
  echo "Cleaning and deleting all pods."
  # Kill all the containers in the pod:
  podman pod rm --force "${pod_id}"
fi

exit $EXECUTION_EXIT_STATUS
