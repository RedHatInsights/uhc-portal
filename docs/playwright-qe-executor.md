# Playwright QE Executor

`playwright/scripts/playwright-qe-executor.sh` creates ephemeral cloud infra, runs Playwright E2E tests, then tears the infra down.

| Who | How to run |
|---|---|
| **Local (container)** | Prefer [`run-e2e-in-container.md`](./run-e2e-in-container.md) — builds the CI image and calls this script for you |
| **Local (host)** | Call this script directly with `ENV_FILE=playwright.env.json` |
| **OpenShift CI (Prow)** | Job steps call this script with `EXECUTOR_MODE=setup\|run\|cleanup` |

Test-writing guide: [`Playwright-e2e-test-automation-guidelines.md`](./Playwright-e2e-test-automation-guidelines.md).

---

## What it does

1. Load credentials into `playwright.env.json` (never by scanning the repo).
2. Optionally create AWS VPC / GCP VPC / ROSA roles (**in parallel**).
3. Run `npx playwright test`.
4. Clean up cloud resources (best-effort).

Controlled by `EXECUTOR_MODE` (default: `all`).

---

## Two ways to run

### Local / single process — `EXECUTOR_MODE=all` (default)

One process: **setup → tests → cleanup**. Cleanup uses an exit trap (runs on failure; may not run if the process is killed hard).

```bash
ENV_FILE=playwright.env.json SETUP_CLOUD=true \
  ./playwright/scripts/playwright-qe-executor.sh
```

Or use the container wrapper: `SETUP_CLOUD=true ./playwright/scripts/run-e2e-in-container.sh`.

### CI / three steps — `setup` → `run` → `cleanup`

Three separate containers share `SHARED_DIR`. Cleanup is its own step, so infra is still torn down if the test pod is killed or evicted.

```
setup     resolve creds → create AWS/GCP/ROSA in parallel
          → write SHARED_DIR/playwright.env.json
          → write SHARED_DIR/qe-infra-state.json (EXIT trap; even on failure)

run       read env from SHARED_DIR → Playwright → copy artifacts

cleanup   read state from SHARED_DIR → destroy AWS/GCP in parallel
```

Simulate locally:

```bash
SHARED_DIR=/tmp/qe-shared ENV_FILE=playwright.env.json EXECUTOR_MODE=setup \
  ./playwright/scripts/playwright-qe-executor.sh
SHARED_DIR=/tmp/qe-shared EXECUTOR_MODE=run \
  ./playwright/scripts/playwright-qe-executor.sh
SHARED_DIR=/tmp/qe-shared ENV_FILE=playwright.env.json EXECUTOR_MODE=cleanup \
  ./playwright/scripts/playwright-qe-executor.sh
```

---

## Setup in parallel (AWS + GCP + ROSA)

When enabled, these run at the same time:

| Job | What it does |
|---|---|
| **AWS** | Auth → create VPC / SQS / S3 → write `QE_INFRA_REGIONS` (and related keys) |
| **GCP** | Auth → create VPC / KMS → write `QE_INFRA_GCP` |
| **ROSA** | Auth to AWS (needed for IAM) → `rosa` login → OCM role (**required**) → account/user roles (warnings only on failure) |

Important details:

- **Private env copies** — AWS and GCP each write to their own temp copy of the env file, then results are merged. Avoids races when both update `playwright.env.json`.
- **ROSA needs AWS creds in its own job** — `configure_aws_cli` runs inside the ROSA subshell (`rosa create ocm-role` talks to AWS IAM).
- **State on every exit** — in `setup` mode, `qe-infra-state.json` is written by an EXIT trap so cleanup still knows what to delete after a partial failure.
- Logs are printed after all jobs finish, prefixed `[aws]`, `[gcp]`, `[rosa]`.

---

## Configuration

Everything is an env var. Credentials are the only required input.

### Mode & cloud

| Variable | Default | Purpose |
|---|---|---|
| `EXECUTOR_MODE` | `all` | `all` \| `setup` \| `run` \| `cleanup` |
| `SETUP_CLOUD` | `true` | Ephemeral AWS VPC (+ SQS/S3 unless skipped) |
| `SETUP_GCP_CLOUD` | `false` | Ephemeral GCP VPC + KMS |
| `SETUP_ROSA_ROLES` | follows `SETUP_CLOUD` | Create OCM / account / user roles |
| `STRIP_STATIC_INFRA` | follows `SETUP_CLOUD` | Strip static infra keys before create. Forced `false` in `run` / `cleanup` |
| `SKIP_SQS_QUEUE` / `SKIP_S3_BUCKET` | `false` | Skip those AWS resources |

### Credentials

| Variable | Default | Purpose |
|---|---|---|
| `ENV_FILE` | — | Path to env JSON (local) |
| `PLAYWRIGHT_ENV_SOURCE` | — | Highest precedence; `run` mode points this at `SHARED_DIR` |
| `CREDENTIALS_DIR` | `/var/run/secrets/uhc-portal-playwright` | Vault mount (one JSON file, or one file per key) |
| `EUT` | `staging` | `staging` \| `production` \| `local` — sets `BASE_URL` and ROSA env |

Precedence: `PLAYWRIGHT_ENV_SOURCE` → `ENV_FILE` → `CREDENTIALS_DIR/playwright.env.json` → per-key files under `CREDENTIALS_DIR`.

### Tests

| Variable | Default | Purpose |
|---|---|---|
| `GREP_TAGS` | `@ci\|@smoke\|@wizard-validation` | Default `--grep` |
| `TEST_ARGS` | `playwright/e2e --grep ${GREP_TAGS}` | Full Playwright args |
| `BROWSER` | `chromium` | Playwright project |
| `WORKERS` | `50%` | Absolute count or % of CPUs |
| `PLAYWRIGHT_TRACE` | `off` | Trace mode |
| `VERSION` | — | Passed to `rosa create account-roles --version` |

### Naming, timeouts, CI

| Variable | Default | Purpose |
|---|---|---|
| `BUILD_IDENTIFIER` | Prow id / `local-<timestamp>` | Suffix for resource names |
| `VPC_NAME` / `REGION` | derived from build id / env file | AWS naming |
| `GCP_VPC_NAME` / `GCP_REGION` / KMS overrides | derived / optional | GCP naming |
| `CLI_TIMEOUT_SECS` | `120` | Short CLI calls (`aws`, `rosa`, `gcloud`) |
| `INFRA_TIMEOUT_SECS` | `1200` | AWS/GCP helper scripts |
| `SHARED_DIR` | — | Shared volume for 3-step mode (env + infra state; not artifacts) |
| `ARTIFACT_DIR` | — | Where Playwright results are copied for Prow |

Timeouts need the `timeout` binary (GNU coreutils). Without it (some macOS setups), commands run unbounded after a one-time warning.

---

## Artifacts & secrets

- Test output: `playwright-artifacts/` → copied to `ARTIFACT_DIR` when set.
- In `run` / `cleanup` / `all`, a **scrubbed** env (credentials and account IDs removed) may be written under `SHARED_DIR`. Resource names are kept.
- `setup` writes the **full** env (with credentials) to `SHARED_DIR` for the `run` step only. That volume is job-local, not the public artifact store.

---

## Prow usage

```bash
CREDENTIALS_DIR=/var/run/secrets/uhc-portal-playwright \
  EXECUTOR_MODE=setup \
  ./playwright/scripts/playwright-qe-executor.sh
```

Prow injects `SHARED_DIR` and `ARTIFACT_DIR`. Pass the same `SETUP_CLOUD` / `SETUP_GCP_CLOUD` to both `setup` and `cleanup`.

---

## Known limitations

1. **`SETUP_CLOUD` / `SETUP_GCP_CLOUD` are not restored from the state file** — set them the same on `setup` and `cleanup`, or GCP/AWS cleanup may be skipped.
2. **Only OCM role creation is fatal** for ROSA — account/user role failures are warnings.
3. **Cleanup errors are warnings** — teardown is best-effort so one failure does not block the rest.
