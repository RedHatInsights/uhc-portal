# Playwright QE Executor

`playwright/scripts/playwright-qe-executor.sh` creates ephemeral cloud infra, runs Playwright E2E tests, then tears the infra down.

| Who | How to run |
|---|---|
| **Local (container)** | Prefer [`run-e2e-in-container.md`](./run-e2e-in-container.md) — builds the CI image and calls this script for you |
| **Local (host)** | Call this script directly with `ENV_FILE=playwright.env.json` |
| **OpenShift CI (Prow)** | Job steps call this script with `EXECUTOR_MODE=setup\|run\|cleanup` |

Test-writing guide: [`Playwright-e2e-test-automation-guidelines.md`](./Playwright-e2e-test-automation-guidelines.md).  
Env file structure: [`playwright/README.md`](../playwright/README.md#configuration-files).

---

## Prerequisites

1. **`playwright.env.json`** (gitignored) at the repo root, or pass `ENV_FILE=...`. Minimum keys:

   | Key | Needed for |
   |---|---|
   | `TEST_WITHQUOTA_USER` / `TEST_WITHQUOTA_PASSWORD` | SSO login in Playwright global setup |
   | `QE_AWS_ACCESS_KEY_ID` / `QE_AWS_ACCESS_KEY_SECRET` | `SETUP_CLOUD=true` and ROSA role setup |
   | `QE_ORGADMIN_CLIENT_ID` / `QE_ORGADMIN_CLIENT_SECRET` | `SETUP_ROSA_ROLES=true` |
   | `QE_GCP_OSDCCSADMIN_JSON` (and related) | `SETUP_GCP_CLOUD=true` |

2. **Host runs only:** browsers matching the installed `@playwright/test` version (currently `1.64.1`):

   ```bash
   npx playwright install
   ```

   After a Playwright package bump, missing browsers show as `browserType.launch: Executable doesn't exist ... chromium_headless_shell-<rev>`.

3. **Optional:** GNU `timeout` (coreutils). Without it, CLI/infra timeouts are skipped after a one-time warning (common on macOS).

4. **Lint (optional):** `shellcheck -x playwright/scripts/playwright-qe-executor.sh`

---

## What it does

1. Load credentials into `playwright.env.json` (never by scanning the repo).
2. Optionally create AWS VPC / GCP VPC / ROSA roles (**in parallel**).
3. Run `npx playwright test`.
4. Clean up cloud resources (best-effort).

Controlled by `EXECUTOR_MODE` (default: `all`).

Default cloud toggles on this script (different from the container wrapper):

| Variable | Default here | Default in `run-e2e-in-container.sh` |
|---|---|---|
| `SETUP_CLOUD` | `true` | `false` |
| `SETUP_GCP_CLOUD` | `false` | `false` |

For a host smoke run **without** creating VPC/roles, set `SETUP_CLOUD=false` explicitly.

---

## Two ways to run

### Local / single process — `EXECUTOR_MODE=all` (default)

One process: **setup → tests → cleanup**. Cleanup uses an exit trap (runs on failure; may not run if the process is killed hard).

```bash
# Full cloud path
ENV_FILE=playwright.env.json SETUP_CLOUD=true \
  ./playwright/scripts/playwright-qe-executor.sh

# Tests only (no ephemeral AWS / ROSA roles)
ENV_FILE=playwright.env.json SETUP_CLOUD=false \
  GREP_TAGS='@smoke' \
  ./playwright/scripts/playwright-qe-executor.sh
```

Or use the container wrapper: `SETUP_CLOUD=true ./playwright/scripts/run-e2e-in-container.sh`.

### CI / three steps — `setup` → `run` → `cleanup`

Three separate containers share `SHARED_DIR`. Cleanup is its own step, so infra is still torn down if the test pod is killed or evicted.

```
setup     resolve creds → create AWS/GCP/ROSA in parallel
          → write SHARED_DIR/playwright.env.json (full env, with credentials)
          → write SHARED_DIR/qe-infra-state.json (EXIT trap; even on failure)

run       read env from SHARED_DIR → Playwright → copy artifacts
          → may overwrite SHARED_DIR/playwright.env.json with a scrubbed copy

cleanup   read state from SHARED_DIR → destroy AWS/GCP in parallel
```

If `SHARED_DIR` is set, the executor creates it (`mkdir -p`) when missing. Prow usually pre-creates the volume; local sims often use `/tmp/qe-shared`.

Simulate locally:

```bash
SHARED_DIR=/tmp/qe-shared ENV_FILE=playwright.env.json EXECUTOR_MODE=setup \
  SETUP_CLOUD=true ./playwright/scripts/playwright-qe-executor.sh
SHARED_DIR=/tmp/qe-shared EXECUTOR_MODE=run \
  GREP_TAGS='@smoke' ./playwright/scripts/playwright-qe-executor.sh
SHARED_DIR=/tmp/qe-shared ENV_FILE=playwright.env.json EXECUTOR_MODE=cleanup \
  ./playwright/scripts/playwright-qe-executor.sh
```

**Do not** copy a scrubbed `SHARED_DIR/playwright.env.json` over your real repo `playwright.env.json`. Scrubbed copies drop SSO/AWS/GCP secrets; the next `setup` then fails with `QE_AWS_ACCESS_KEY_ID / QE_AWS_ACCESS_KEY_SECRET missing`.

---

## Setup in parallel (AWS + GCP + ROSA)

When enabled, these run at the same time:

| Job | What it does |
|---|---|
| **AWS** | Auth → create VPC / SQS / S3 → write `QE_INFRA_REGIONS` (and related keys) |
| **GCP** | Auth → create VPC / KMS → write `QE_INFRA_GCP` + `QE_GCP_KEY_*` |
| **ROSA** | Auth to AWS (needed for IAM) → `rosa` login → OCM role (**required**) → account/user roles (warnings only on failure) |

Important details:

- **Private env copies** — AWS/GCP each mutate a temp copy; after `wait`, owned keys merge via `AWS_ENV_MERGE_KEYS` / `GCP_ENV_MERGE_KEYS` (`has(key)` only — never null).
- **GCP KMS keys** — `QE_GCP_KEY_RING_LOCATION`, `QE_GCP_KEY_RING`, `QE_GCP_KEY_NAME`, `QE_GCP_KMS_SERVICE_ACCOUNT` are included in the GCP merge list.
- **ROSA re-auths AWS** in its own subshell (`rosa create ocm-role` talks to IAM).
- **State on every exit** — `setup` writes `qe-infra-state.json` via EXIT trap so cleanup can tear down after partial failure.
- Logs print after all jobs finish, prefixed `[aws]` / `[gcp]` / `[rosa]`.

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
| `GREP_TAGS` | `@ci\|@smoke\|@wizard-validation` | Default `--grep` value. Must not contain whitespace or glob characters (`* ? [`): `TEST_ARGS` is expanded unquoted, so spaces become extra Playwright file args and globs expand against the working directory. For patterns with spaces (e.g. `@smoke && foo`), set `TEST_ARGS` with a quoted `--grep` instead of using `GREP_TAGS`. |
| `TEST_ARGS` | `playwright/e2e --grep ${GREP_TAGS}` | Full Playwright args (whitespace-split when passed to `npx playwright test`) |
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
| `SHARED_DIR` | — | Shared volume for 3-step mode (env + infra state; not artifacts). Created if missing. |
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

Prow injects `SHARED_DIR` and `ARTIFACT_DIR`. `cleanup` restores `SETUP_CLOUD` / `SETUP_GCP_CLOUD` / `SKIP_SQS_QUEUE` / `SKIP_S3_BUCKET` from `qe-infra-state.json` when those variables were not set explicitly on the cleanup step. An explicit env value on cleanup still wins over the state file.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `Executable doesn't exist ... chromium_headless_shell-<rev>` | Host browsers out of date vs `@playwright/test`. Run `npx playwright install`. |
| `QE_AWS_ACCESS_KEY_ID / QE_AWS_ACCESS_KEY_SECRET missing` | Env file incomplete, or overwritten with a scrubbed `SHARED_DIR` copy. Restore full secrets in `playwright.env.json`. |
| `cp: .../SHARED_DIR/playwright.env.json: No such file` | Older script without `mkdir -p`; current executor creates `SHARED_DIR` when set. |
| `page.waitForURL` / SSO stuck on `login-actions/authenticate` | **Playwright login**, not the shell script. Check `TEST_WITHQUOTA_USER` / `TEST_WITHQUOTA_PASSWORD`; verify login manually; debug with `npx playwright test --headed`. |
| Parallel setup `aws_rc=1` / `rosa_rc=1` | Missing AWS keys or STS/auth failure in those jobs; see `[aws]` / `[rosa]` log prefixes. |
| Partial setup then script error | Cloud resources may already exist; use `EXECUTOR_MODE=cleanup` with `SHARED_DIR` / `qe-infra-state.json`, or tear down via the AWS/GCP helpers using names in the env file. |

---

## Known limitations

1. **Only OCM role creation is fatal** for ROSA — account/user role failures are warnings.
2. **Cleanup errors are warnings** — teardown is best-effort so one failure does not block the rest.
