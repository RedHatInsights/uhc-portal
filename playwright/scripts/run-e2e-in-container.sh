#!/usr/bin/env bash
# Build (optional) and run Playwright E2E suites in the CI container.
#
# By default runs ALL test suites under playwright/e2e (rosa, rosa-hosted,
# osd-aws, osd-gcp, clusters, access-control, downloads, etc.).
# Narrow the scope by overriding TEST_ARGS or GREP_TAGS.
#
# Modes:
#   Default (no cloud): mount env read-only, run Playwright only.
#   SETUP_CLOUD=true:   option-1 pipeline — ephemeral VPC + optional ROSA roles + test + cleanup
#                       (same flow OpenShift CI will use via playwright-qe-executor.sh).
#
# Architecture:
#   Defaults to the host arch (linux/arm64 on Apple Silicon, linux/amd64 on Intel/CI).
#   Override with PLATFORM=linux/amd64 or PLATFORM=linux/arm64.
#
# Examples:
#   ./playwright/scripts/run-e2e-in-container.sh
#   SETUP_CLOUD=true ./playwright/scripts/run-e2e-in-container.sh
#   TEST_ARGS="playwright/e2e/rosa --grep @smoke" ./playwright/scripts/run-e2e-in-container.sh
#   PLATFORM=linux/amd64 BUILD=true ./playwright/scripts/run-e2e-in-container.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

IMAGE_NAME="${IMAGE_NAME:-uhc-portal-playwright:local}"
ENV_FILE="${ENV_FILE:-${ROOT_DIR}/playwright.env.json}"
BUILD="${BUILD:-true}"
WORKERS="${WORKERS:-2}"
SETUP_CLOUD="${SETUP_CLOUD:-false}"
SETUP_GCP_CLOUD="${SETUP_GCP_CLOUD:-false}"
SETUP_ROSA_ROLES="${SETUP_ROSA_ROLES:-${SETUP_CLOUD}}"
EUT="${EUT:-staging}"
GREP_TAGS="${GREP_TAGS:-}"
# Default: all tests across every suite under playwright/e2e.
# Set GREP_TAGS to filter (e.g. "@smoke|@wizard-validation"), or override TEST_ARGS entirely.
if [[ -n "${GREP_TAGS}" ]]; then
  TEST_ARGS="${TEST_ARGS:-playwright/e2e --grep ${GREP_TAGS}}"
else
  TEST_ARGS="${TEST_ARGS:-playwright/e2e}"
fi
SKIP_SQS_QUEUE="${SKIP_SQS_QUEUE:-false}"
SKIP_S3_BUCKET="${SKIP_S3_BUCKET:-false}"

# Host-native platform by default (multi-arch Dockerfile).
if [[ -z "${PLATFORM:-}" ]]; then
  case "$(uname -m)" in
    arm64|aarch64) PLATFORM=linux/arm64 ;;
    *) PLATFORM=linux/amd64 ;;
  esac
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: missing env file: ${ENV_FILE}" >&2
  echo "Create playwright.env.json (or set ENV_FILE=...) with SSO/AWS keys used by global-setup." >&2
  echo "For SETUP_CLOUD=true, omit QE_INFRA_REGIONS (or they will be stripped); VPC is created per run." >&2
  exit 1
fi

CONTAINER_ENGINE="${CONTAINER_ENGINE:-}"
if [[ -z "${CONTAINER_ENGINE}" ]]; then
  if command -v podman >/dev/null 2>&1; then
    CONTAINER_ENGINE=podman
  else
    CONTAINER_ENGINE=docker
  fi
fi

if [[ "${BUILD}" == "true" ]]; then
  echo "==> Building ${IMAGE_NAME} (${PLATFORM}) with ${CONTAINER_ENGINE}"
  BUILD_ARGS=(
    --platform "${PLATFORM}"
    -f Dockerfile.playwright
    -t "${IMAGE_NAME}"
  )
  # --ignorefile is Podman-only; Docker reads .dockerignore automatically.
  if [[ "${CONTAINER_ENGINE}" == "podman" ]]; then
    BUILD_ARGS+=(--ignorefile .dockerignore)
  fi
  ${CONTAINER_ENGINE} build "${BUILD_ARGS[@]}" .
fi

ARTIFACT_DIR="${ARTIFACT_DIR:-${ROOT_DIR}/playwright-artifacts/container}"
mkdir -p "${ARTIFACT_DIR}"

echo "==> Running Playwright in container"
echo "    PLATFORM=${PLATFORM}"
echo "    SETUP_CLOUD=${SETUP_CLOUD}"
echo "    TEST_ARGS=${TEST_ARGS}"
echo "    WORKERS=${WORKERS}"

RUN_ARGS=(
  --rm
  --platform "${PLATFORM}"
  -e CI=true
  -e BROWSER=chromium
  -e WORKERS="${WORKERS}"
  -e EUT="${EUT}"
  -e GREP_TAGS="${GREP_TAGS}"
  -e TEST_ARGS="${TEST_ARGS}"
  -e SETUP_CLOUD="${SETUP_CLOUD}"
  -e SETUP_GCP_CLOUD="${SETUP_GCP_CLOUD}"
  -e SETUP_ROSA_ROLES="${SETUP_ROSA_ROLES}"
  -e SKIP_SQS_QUEUE="${SKIP_SQS_QUEUE}"
  -e SKIP_S3_BUCKET="${SKIP_S3_BUCKET}"
  -e PLAYWRIGHT_ENV_SOURCE=/secrets/playwright.env.json
  -e ARTIFACT_DIR=/app/playwright-artifacts
  -v "${ENV_FILE}:/secrets/playwright.env.json:ro,Z"
  -v "${ARTIFACT_DIR}:/app/playwright-artifacts:Z"
)

# Pass through GCP-specific env vars when GCP cloud setup is enabled.
if [[ "${SETUP_GCP_CLOUD}" == "true" ]]; then
  RUN_ARGS+=(
    -e GCP_VPC_NAME="${GCP_VPC_NAME:-}"
    -e GCP_REGION="${GCP_REGION:-us-central1}"
    -e GCP_KEY_RING_NAME="${GCP_KEY_RING_NAME:-}"
    -e GCP_KEY_NAME="${GCP_KEY_NAME:-}"
    -e GCP_KMS_SA_ID="${GCP_KMS_SA_ID:-}"
  )
fi

# Only disable TLS verification for local dev (self-signed certs).
if [[ "${EUT}" == "local" ]]; then
  RUN_ARGS+=(-e NODE_TLS_REJECT_UNAUTHORIZED=0)
fi

if [[ "${SETUP_CLOUD}" == "true" || "${SETUP_GCP_CLOUD}" == "true" ]]; then
  # Image ENTRYPOINT is playwright-qe-executor.sh (VPC → roles → test → cleanup).
  ${CONTAINER_ENGINE} run "${RUN_ARGS[@]}" "${IMAGE_NAME}"
else
  # Playwright-only: skip cloud prerun/cleanup.
  # shellcheck disable=SC2086
  ${CONTAINER_ENGINE} run "${RUN_ARGS[@]}" \
    -e SETUP_CLOUD=false \
    -e SETUP_GCP_CLOUD=false \
    -e SETUP_ROSA_ROLES=false \
    -v "${ENV_FILE}:/app/playwright.env.json:ro,Z" \
    --entrypoint npx \
    "${IMAGE_NAME}" \
    playwright test \
    ${TEST_ARGS} \
    --project=chromium \
    --workers="${WORKERS}"
fi
