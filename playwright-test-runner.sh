#!/bin/bash

set -e

# Configurable variables
playwrite_container_name="playwright-ocmui"
playwrite_image="localhost/playwright-rosa-image:latest"
container_workdir="/usr/src/app"
base_url="https://console.dev.redhat.com/openshift/"
playwright_project="chromium"
playwright_grep="@smoke"
playwright_workers="5"

# Output directory configuration
host_output_base_dir="${PWD}/playwright-artifacts"

# Container path configuration (should match playwright.config.ts)
container_artifacts_dir="playwright-artifacts"
container_artifacts_path="${container_workdir}/${container_artifacts_dir}"

# Remove existing container with the same name, if any
if podman container exists "${playwrite_container_name}"; then
  echo "Removing existing container: ${playwrite_container_name}"
  podman rm -f "${playwrite_container_name}"
fi

# Run the container
echo "Starting Playwright container: ${playwrite_container_name}"
podman run \
  --name "${playwrite_container_name}" \
  --workdir "${container_workdir}" \
  --shm-size "2g" \
  --security-opt label=disable \
  --pull newer \
  --volume "${PWD}/playwright.config.ts:${container_workdir}/playwright.config.ts" \
  --volume "${PWD}/playwright:${container_workdir}/playwright" \
  --volume "${PWD}/node_modules:${container_workdir}/node_modules" \
  --volume "${PWD}/package.json:${container_workdir}/package.json" \
  --volume "${PWD}/yarn.lock:${container_workdir}/yarn.lock" \
  --volume "${PWD}/playwright.env.json:${container_workdir}/playwright.env.json" \
  --env "BASE_URL=${base_url}" \
  "${playwrite_image}" \
  npx playwright test --project="${playwright_project}" --grep "${playwright_grep}" --workers "${playwright_workers}"

# Create output directory if it doesn't exist
mkdir -p "${host_output_base_dir}"

# Copy all artifacts from container to host in one step
echo "Copying all playwright artifacts to: ${host_output_base_dir}"
podman cp "${playwrite_container_name}:${container_artifacts_path}" "${host_output_base_dir}"
# Optionally remove the container
echo "Cleaning up container: ${playwrite_container_name}"
podman rm "${playwrite_container_name}"

echo "✅ Playwright test run complete. Results copied to ${host_output_base_dir}"

