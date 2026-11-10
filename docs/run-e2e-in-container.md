# Run E2E in Container

`playwright/scripts/run-e2e-in-container.sh` is the **local** host wrapper for running Playwright E2E tests in the same container image OpenShift CI uses. It builds the image (optional), mounts your credentials and artifact directory, and starts the container.

It does **not** run in Prow. CI invokes [`playwright-qe-executor.sh`](./playwright-qe-executor.md) directly inside the job image. This script is how you reproduce that environment on your laptop.

For test-writing conventions, see [`Playwright-e2e-test-automation-guidelines.md`](./Playwright-e2e-test-automation-guidelines.md).

---

## How it relates to the executor

```
you (laptop)
  └─ run-e2e-in-container.sh          # build image, docker/podman run, mounts
       └─ container
            ├─ SETUP_CLOUD=true  → --entrypoint playwright-qe-executor.sh
            │                      setup → tests → cleanup (EXECUTOR_MODE=all)
            └─ SETUP_CLOUD=false → --entrypoint npx playwright test
```

| Script | Runs where | Responsibility |
|---|---|---|
| `run-e2e-in-container.sh` | Host | Image build, platform, mounts, env passthrough |
| `playwright-qe-executor.sh` | Container / CI | Credentials, cloud infra, Playwright, cleanup |

---

## Prerequisites

1. **Podman or Docker** on the host (Podman preferred if both are installed).
2. **`playwright.env.json`** at the repo root (or pass `ENV_FILE=...`) with SSO / AWS / GCP credentials the tests need.
3. For `SETUP_CLOUD=true`: valid `QE_AWS_ACCESS_KEY_ID` / `QE_AWS_ACCESS_KEY_SECRET` (and ROSA org-admin client credentials if role setup is enabled).

---

## Quick start

```bash
# Playwright only (no ephemeral cloud) — default
./playwright/scripts/run-e2e-in-container.sh

# Ephemeral AWS VPC + ROSA roles + tests + cleanup
SETUP_CLOUD=true ./playwright/scripts/run-e2e-in-container.sh

# Narrow the suite
TEST_ARGS="playwright/e2e/rosa --grep @smoke" ./playwright/scripts/run-e2e-in-container.sh

# Skip rebuild when the image is already up to date
BUILD=false SETUP_CLOUD=true ./playwright/scripts/run-e2e-in-container.sh
```

Artifacts land in `playwright-artifacts/container/` by default.

---

## Modes

### Playwright-only (default)

`SETUP_CLOUD=false` and `SETUP_GCP_CLOUD=false`:

- Overrides the image entrypoint to `npx playwright test`
- Mounts the env file read-only at `/app/playwright.env.json`
- No VPC / ROSA role creation

Use this when you already have static infra in the env file, or when the suite under test does not need ephemeral cloud resources.

### Cloud pipeline

`SETUP_CLOUD=true` and/or `SETUP_GCP_CLOUD=true`:

- Overrides entrypoint to `playwright-qe-executor.sh` (works with the tests-only image default)
- Runs the single-step model (`EXECUTOR_MODE=all`): create infra → run tests → cleanup via exit trap
- Mounts the env file at `/secrets/playwright.env.json` and sets `PLAYWRIGHT_ENV_SOURCE`
- `SETUP_ROSA_ROLES` defaults to the same value as `SETUP_CLOUD`

This is the local equivalent of the CI executor flow (without Prow’s separate setup/run/cleanup steps).

---

## Configuration

All knobs are environment variables.

### Common

| Variable | Default | Purpose |
|---|---|---|
| `ENV_FILE` | `./playwright.env.json` | Host path to credentials JSON. Mounted into the container. |
| `BUILD` | `true` | Build `Dockerfile.playwright` before running. Set `false` to reuse an existing image. |
| `IMAGE_NAME` | `uhc-portal-playwright:local` | Image tag to build/run. |
| `PLATFORM` | host arch (`linux/arm64` or `linux/amd64`) | Container platform. Prefer native arch on Apple Silicon — avoid `linux/amd64` under qemu unless you need to match CI. |
| `CONTAINER_ENGINE` | `podman` if present, else `docker` | Override to force an engine. |
| `ARTIFACT_DIR` | `./playwright-artifacts/container` | Host directory for reports/results. |
| `EUT` | `staging` | Target env: `staging` \| `production` \| `local`. For `local`, TLS verification is disabled in the container. |
| `WORKERS` | `2` | Playwright `--workers` passed into the container. |
| `TEST_ARGS` | `playwright/e2e` (or with `--grep` if `GREP_TAGS` is set) | Arguments for `npx playwright test`. |
| `GREP_TAGS` | _(empty)_ | If set, default `TEST_ARGS` becomes `playwright/e2e --grep ${GREP_TAGS}`. |

### Cloud toggles (passed through to the executor)

| Variable | Default | Purpose |
|---|---|---|
| `SETUP_CLOUD` | `false` | Ephemeral AWS VPC (+ SQS/S3 unless skipped). |
| `SETUP_GCP_CLOUD` | `false` | Ephemeral GCP VPC + KMS. |
| `SETUP_ROSA_ROLES` | follows `SETUP_CLOUD` | Create OCM / account / user roles via `rosa`. |
| `SKIP_SQS_QUEUE` | `false` | Skip SQS in AWS helper. |
| `SKIP_S3_BUCKET` | `false` | Skip S3 in AWS helper. |
| `GCP_VPC_NAME` / `GCP_REGION` / `GCP_KEY_RING_NAME` / `GCP_KEY_NAME` / `GCP_KMS_SA_ID` | — | Optional GCP overrides (only passed when `SETUP_GCP_CLOUD=true`). |

Executor-only variables (`EXECUTOR_MODE`, `SHARED_DIR`, timeouts, etc.) are documented in [`playwright-qe-executor.md`](./playwright-qe-executor.md). This wrapper does not set `EXECUTOR_MODE`, so the executor uses its default (`all`).

---

## Platform notes

On Apple Silicon the script defaults to `linux/arm64`. Forcing `PLATFORM=linux/amd64` runs under qemu emulation, which is slower and can make AWS CLI / network calls flaky. Prefer native arm64 for local runs; use amd64 only when you need to match a CI image architecture.

```bash
# Explicit native (usually unnecessary — this is the default on arm64 hosts)
PLATFORM=linux/arm64 SETUP_CLOUD=true ./playwright/scripts/run-e2e-in-container.sh
```

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| `missing env file` | Create `playwright.env.json` or set `ENV_FILE` to an absolute path. |
| `AWS STS check failed` | Keys in the env file; container network/DNS; prefer native `PLATFORM`. Re-run after confirming `aws sts get-caller-identity` works on the host with the same keys. |
| `ERR: AWS region not set` during ROSA role setup | Fixed in the executor by calling `configure_aws_cli` in the ROSA job; rebuild/pull a current image (`BUILD=true`). |
| Slow or flaky cloud setup on Mac | Avoid `PLATFORM=linux/amd64` on Apple Silicon. |
| Stale CLIs / script inside the image | Rebuild: `BUILD=true` (default). |

---

## Examples

```bash
# Full AWS cloud path, smoke tags only
SETUP_CLOUD=true GREP_TAGS='@smoke' ./playwright/scripts/run-e2e-in-container.sh

# GCP as well
SETUP_CLOUD=true SETUP_GCP_CLOUD=true ./playwright/scripts/run-e2e-in-container.sh

# Against staging UI with a pre-built image
BUILD=false EUT=staging TEST_ARGS='playwright/e2e/clusters' \
  ./playwright/scripts/run-e2e-in-container.sh

# Local UI (self-signed certs)
EUT=local ./playwright/scripts/run-e2e-in-container.sh
```
