# Playwright QE Executor

`playwright/scripts/playwright-qe-executor.sh` is the single entry point for running OCM UI E2E tests — locally and in OpenShift CI (Prow). It provisions ephemeral cloud infrastructure, runs the Playwright suite against it, and tears the infrastructure back down.

For running that flow in a container on your laptop, see [`run-e2e-in-container.md`](./run-e2e-in-container.md). For test-writing conventions (page objects, fixtures, tagging) see [`Playwright-e2e-test-automation-guidelines.md`](./Playwright-e2e-test-automation-guidelines.md). This doc covers the executor itself.

---

## How it runs

The script supports two execution models, controlled by `EXECUTOR_MODE`.

### 3-step Prow model (CI)

Each step is a separate container in a Prow multistage job, all sharing a `SHARED_DIR` volume. The key benefit: **cleanup runs even if the test step is killed or evicted**, because it's a dedicated step rather than a trap inside the same process.

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: EXECUTOR_MODE=setup                                 │
│                                                             │
│  1. Resolve credentials → playwright.env.json               │
│  2. Create cloud infra in parallel:                         │
│       [AWS]  VPC + SQS queue + S3 bucket                    │
│       [GCP]  VPC + KMS  (if SETUP_GCP_CLOUD=true)          │
│       [ROSA] configure AWS CLI → OCM/account/user roles     │
│              (needs AWS_* in its own subshell for IAM)      │
│  3. Write full env to SHARED_DIR/playwright.env.json        │
│  4. Write resource IDs to SHARED_DIR/qe-infra-state.json   │
│     ↳ written via EXIT trap — fires even on partial failure │
└─────────────────────────────────────────────────────────────┘
                           │ SHARED_DIR
┌─────────────────────────────────────────────────────────────┐
│ Step 2: EXECUTOR_MODE=run                                   │
│                                                             │
│  1. Read env from SHARED_DIR/playwright.env.json            │
│  2. Run: npx playwright test ...                            │
│  3. Copy artifacts to ARTIFACT_DIR (Prow artifact store)    │
│  4. Exit with Playwright's own exit code                    │
└─────────────────────────────────────────────────────────────┘
                           │ SHARED_DIR
┌─────────────────────────────────────────────────────────────┐
│ Step 3: EXECUTOR_MODE=cleanup                               │
│                                                             │
│  1. Read resource IDs from SHARED_DIR/qe-infra-state.json  │
│  2. Re-authenticate to AWS and/or GCP                       │
│  3. Destroy cloud resources in parallel (best-effort)       │
│  4. Copy any remaining artifacts                            │
└─────────────────────────────────────────────────────────────┘
```

### Single-step model (local dev)

`EXECUTOR_MODE=all` (the default) runs the full sequence — setup, tests, cleanup — in one process. Cleanup runs via an `on_exit` trap, so it still runs on an early failure. It won't run if the process is killed outright (OOM, pod eviction), which is why CI uses the 3-step model.

```bash
# With ephemeral AWS infra:
ENV_FILE=playwright.env.json SETUP_CLOUD=true \
  ./playwright/scripts/playwright-qe-executor.sh

# Against pre-existing / static infra (skip VPC creation):
ENV_FILE=playwright.env.json SETUP_CLOUD=false \
  ./playwright/scripts/playwright-qe-executor.sh
```

### Simulating the 3-step model locally

```bash
SHARED_DIR=/tmp/qe-shared ENV_FILE=playwright.env.json EXECUTOR_MODE=setup \
  ./playwright/scripts/playwright-qe-executor.sh

SHARED_DIR=/tmp/qe-shared EXECUTOR_MODE=run \
  ./playwright/scripts/playwright-qe-executor.sh

SHARED_DIR=/tmp/qe-shared ENV_FILE=playwright.env.json EXECUTOR_MODE=cleanup \
  ./playwright/scripts/playwright-qe-executor.sh
```

---

## Configuration reference

Everything is an environment variable with a sensible default. The only required inputs are credentials.

### Mode & cloud toggles

| Variable | Default | Purpose |
|---|---|---|
| `EXECUTOR_MODE` | `all` | `all` \| `setup` \| `run` \| `cleanup` |
| `SETUP_CLOUD` | `true` | Create/destroy the ephemeral AWS VPC, SQS queue, and S3 bucket. |
| `SETUP_GCP_CLOUD` | `false` | Create/destroy the ephemeral GCP VPC + KMS. |
| `SETUP_ROSA_ROLES` | follows `SETUP_CLOUD` | Create OCM role, account roles, and user role via the `rosa` CLI. |
| `STRIP_STATIC_INFRA` | follows `SETUP_CLOUD` | Remove `QE_INFRA_REGIONS` from the env before creating ephemeral infra, so tests don't accidentally target static infra. Always `false` in `run` and `cleanup` modes. |
| `SKIP_SQS_QUEUE` | `false` | Skip SQS queue creation/cleanup. |
| `SKIP_S3_BUCKET` | `false` | Skip S3 bucket creation/cleanup. |

### Credentials & environment

| Variable | Default | Purpose |
|---|---|---|
| `ENV_FILE` | — | Path to a `playwright.env.json` file (local dev). |
| `PLAYWRIGHT_ENV_SOURCE` | — | Explicit path, highest precedence. Set automatically by `run` mode to point at the file `setup` wrote to `SHARED_DIR`. |
| `CREDENTIALS_DIR` | `/var/run/secrets/uhc-portal-playwright` | Vault mount — either a single `playwright.env.json` or one file per credential key. |
| `EUT` | `staging` | Target environment: `staging` \| `production` \| `local`. Sets `BASE_URL` and the `rosa login --env` target. |

Credential precedence (highest → lowest): `PLAYWRIGHT_ENV_SOURCE` → `ENV_FILE` → `CREDENTIALS_DIR/playwright.env.json` → one-file-per-key under `CREDENTIALS_DIR`. The script never scans the source tree for credentials.

### Test execution

| Variable | Default | Purpose |
|---|---|---|
| `GREP_TAGS` | `@ci\|@smoke\|@wizard-validation` | Playwright `--grep` filter. |
| `TEST_ARGS` | `playwright/e2e --grep ${GREP_TAGS}` | Full argument list for `npx playwright test`. |
| `BROWSER` | `chromium` | Playwright `--project`. |
| `WORKERS` | `50%` | Playwright `--workers`. Accepts an absolute count (e.g. `4`) or a percentage of CPU cores. Override with a fixed number on CI runners where lower parallelism is needed. |
| `PLAYWRIGHT_TRACE` | `off` | Playwright trace mode. |
| `VERSION` | — | OCP version passed to `rosa create account-roles --version`. |

### Resource naming

| Variable | Default | Purpose |
|---|---|---|
| `BUILD_IDENTIFIER` | `$PROW_JOB_ID` → `$BUILD_ID` → `local-<timestamp>` | Suffix appended to generated resource names. |
| `VPC_NAME` | `playwright-ocmui-${BUILD_IDENTIFIER}` (slugified) | AWS VPC name. Set explicitly to reuse an existing VPC. |
| `REGION` | from `QE_AWS_REGION` in env file, else `us-west-2` | AWS region. |
| `GCP_VPC_NAME` | `ocmui-gcp-${BUILD_IDENTIFIER}` (slugified) | GCP VPC name. |
| `GCP_REGION` | `$REGION` or `us-central1` | GCP region. |
| `GCP_KEY_RING_NAME` / `GCP_KEY_NAME` / `GCP_KMS_SA_ID` | — | Optional KMS overrides for `create-gcp-infrastructure.sh`. |

### Timeouts

| Variable | Default | Purpose |
|---|---|---|
| `CLI_TIMEOUT_SECS` | `120` | Timeout for short CLI calls: `aws sts`, `gcloud auth`, individual `rosa` commands. |
| `INFRA_TIMEOUT_SECS` | `1200` | Timeout for the AWS/GCP helper scripts, which include multi-minute waiters (e.g. NAT gateway). |

Timeouts are enforced via the `with_timeout` helper and require the `timeout` utility (GNU coreutils). On macOS without it, `with_timeout` logs a one-time warning and runs commands unbounded.

### Prow / CI plumbing

| Variable | Purpose |
|---|---|
| `SHARED_DIR` | Job-local volume shared across all 3 Prow steps. Holds `playwright.env.json` and `qe-infra-state.json`. Never uploaded to artifact stores. |
| `ARTIFACT_DIR` | If set, `playwright-artifacts/` is copied here for the Prow artifact browser (Deck/GCS). |

---

## OpenShift CI (Prow) usage

```bash
# Each step is invoked with the appropriate EXECUTOR_MODE.
# CREDENTIALS_DIR is mounted by Prow from Vault.
CREDENTIALS_DIR=/var/run/secrets/uhc-portal-playwright \
  EXECUTOR_MODE=setup \
  ./playwright/scripts/playwright-qe-executor.sh
```

`SHARED_DIR` and `ARTIFACT_DIR` are injected automatically by Prow. The `setup` and `cleanup` steps must be configured with the same `SETUP_CLOUD`/`SETUP_GCP_CLOUD` values — see [Known limitations](#known-limitations).

---

## Internals

This section is for contributors modifying the script. Readers who just want to run or configure it can stop here.

### Cloud provisioning

Each cloud has three functions — authenticate, create, destroy:

| Cloud | Auth | Create | Destroy |
|---|---|---|---|
| AWS | `configure_aws_cli` | `setup_cloud_resources` | `cleanup_cloud_resources` |
| GCP | `configure_gcloud` | `setup_gcp_resources` | `cleanup_gcp_resources` |
| ROSA/OCM | — | `setup_rosa_roles` | — |

**AWS**: `configure_aws_cli` reads credentials from the env file, exports `AWS_*` vars, and fails fast with an STS check before any resource is created. `setup_cloud_resources` delegates to `qe-helper-scripts/create-aws-infrastructure.sh`, which writes `QE_INFRA_REGIONS` back into the env file.

**GCP**: `configure_gcloud` reads `QE_GCP_OSDCCSADMIN_JSON`, writes it to a `chmod 600` temp file for `gcloud auth activate-service-account`, then deletes it immediately. The key-writing block runs with `set +x` to prevent secrets appearing in bash xtrace output. `setup_gcp_resources` delegates to `qe-helper-scripts/create-gcp-infrastructure.sh`.

**ROSA**: `setup_rosa_roles` is skipped with a warning (not a failure) if the `rosa` CLI isn't installed. The OCM role creation (`rosa create ocm-role`) is the **only mandatory step** — a failure there is fatal. Account roles and user role failures are warnings only. Because that step creates IAM roles in AWS, the ROSA parallel job calls `configure_aws_cli` first so `AWS_REGION` / access keys are set in its own subshell (exports from the AWS job do not propagate).

### Parallel orchestration

AWS, GCP, and ROSA provisioning target independent APIs and run concurrently as background subshells rather than one after another. This matters because AWS VPC creation alone can take several minutes waiting on NAT gateway availability.

**Setup** (`run_parallel_setup`): each job runs in a `( ... ) &` subshell with its stdout/stderr buffered to a temp file. After all jobs finish, their output is printed in a fixed order prefixed `[aws]`, `[gcp]`, `[rosa]`. Because subshells can't share variables with their parent, the AWS and GCP jobs write their resource names (`VPC_NAME`, `GCP_VPC_NAME`, etc.) to a temp file on exit; the parent `source`s those files after `wait` so downstream code (state-writing, cleanup) sees them.

AWS and GCP helpers both mutate `playwright.env.json` via read-modify-write on the same `.tmp` path. To avoid lost updates when both run, each job gets a **private copy** of the env file. After `wait`, `_merge_parallel_env_results` copies only the keys each helper owns (`QE_INFRA_REGIONS` / SQS / S3 / role ARNs from AWS; `QE_INFRA_GCP` from GCP) back into the shared env file.

**Cleanup** (`run_parallel_cleanup`): same pattern — AWS and GCP cleanup legs run concurrently, with their output prefixed `[aws-cleanup]` / `[gcp-cleanup]`.

> **Note for contributors adding new parallel jobs:** each background subshell inherits the parent's `EXIT` trap at fork time. Any new job must either register its own trap (as the AWS/GCP setup jobs do, to write their state) or clear it with `trap - EXIT` (as the ROSA job and cleanup jobs do). Failing to do one of these will cause the parent's `write_infra_state` or `on_exit` trap to fire a second time from inside the subshell.

### State file contract

`setup` and `cleanup` run in separate containers and communicate purely through `SHARED_DIR/qe-infra-state.json`. The file contains resource identifiers only (VPC names, region, flags) — no credentials.

- **`write_infra_state`** is registered as an `EXIT` trap at the start of the `setup` step, not called at the end. This means the state file is written on **every** exit path — including a mid-run failure like OCM role creation failing after the VPC was already created — so the `cleanup` step always has a record of what needs to be destroyed.
- **`read_infra_state`** loads those identifiers back in the `cleanup` step. An explicitly-set environment variable always wins over what's in the file (`${VAR:-$(jq ...)}`).

### Cleanup guarantees

Cleanup failures are treated as warnings, not errors. Both `cleanup_cloud_resources` and `cleanup_gcp_resources` log failures and continue, so cleanup always attempts every resource type rather than stopping at the first error. A partial cleanup won't fail the Prow step.

---

## Known limitations

- **`SETUP_CLOUD` and `SETUP_GCP_CLOUD` must be set consistently across `setup` and `cleanup` steps.** These two variables are defaulted at script startup before `read_infra_state` runs, so their values in the state file are ignored. If the `cleanup` step's Prow configuration omits `SETUP_GCP_CLOUD=true`, GCP resources won't be cleaned up even if `setup` created them.

- **Most ROSA failures are non-fatal by design.** Only OCM role creation is mandatory. Account role and user role failures degrade to warnings so a transient ROSA API issue doesn't block the whole pipeline.
