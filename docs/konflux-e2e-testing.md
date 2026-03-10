# Konflux CI Pipeline — uhc-portal

This document describes the Konflux CI pipeline configuration in
`uhc-portal-pull-request.yaml` and the Playwright changes required to make
E2E tests work inside the Konflux environment.

## Pipeline overview

The PipelineRun triggers on every pull request to `main`. It references the
shared [docker-build-run-all-tests](https://github.com/RedHatInsights/konflux-pipelines/blob/main/pipelines/platform-ui/docker-build-run-all-tests.yaml)
pipeline and executes three main stages:

| Stage | What it does |
|---|---|
| **Docker build** | Builds the uhc-portal container image from `build-tools/Dockerfile` and pushes to Quay. |
| **Unit tests** | Installs dependencies, runs `yarn lint`, `yarn prettier`, and `yarn test`. Memory: 6 Gi. |
| **E2E tests** | Starts the built app via Caddy sidecar, runs Playwright against it. Memory: 10 Gi. |

## Terminology

| Term | URL | SSO provider |
|---|---|---|
| **OCMUI staging** | `console.dev.redhat.com` | `sso.redhat.com` |
| **Konflux staging** | `console.stage.redhat.com` | `sso.stage.redhat.com` |
| **Production** | `console.redhat.com` | `sso.redhat.com` |
| **Local proxy sidecar** | `prod.foo.redhat.com:1337` | `sso.redhat.com` (whitelisted `redirect_uri`) |

## E2E test architecture

### The proxy sidecar

Konflux runs a **frontend-dev-proxy** sidecar (Caddy) inside the test pod,
listening at `https://prod.foo.redhat.com:1337`. The pod's `hostAliases`
resolve that hostname to `127.0.0.1` / `::1` — it is a local-only address,
not an external environment.

The proxy's routing is:

```
/apps/openshift*   →  reverse_proxy 127.0.0.1:8000   (the PR build)
everything else    →  reverse_proxy console.dev.redhat.com  (OCMUI staging upstream)
```

The app-specific routes come from the `ocm-ui-dev-proxy-caddyfile` ConfigMap.
The built application container (Caddy on port 8000) is configured via the
`ocm-ui-app-caddy-config` ConfigMap volume-mounted at `/etc/caddy`.

The shared pipeline defaults to `HCC_ENV=stage` (which would use
`stage.foo.redhat.com:1337`). We override this to `HCC_ENV=prod` via the
`e2e-hcc-env` pipeline parameter, which switches the proxy to
`prod.foo.redhat.com:1337`. This override was added in
[konflux-pipelines#219](https://github.com/RedHatInsights/konflux-pipelines/pull/219).

### SSO authentication

`prod.foo.redhat.com:1337` is whitelisted in `sso.redhat.com` as a valid
OAuth `redirect_uri`. The browser navigates directly to the proxy sidecar,
SSO login works natively, and no URL rewriting or transparent proxying is
needed. This is the same hostname used by our GitHub Actions Playwright
workflows (`e2e-ci-playwright.yml`, `e2e-smoke-playwright.yml`).

Note: `stage.foo.redhat.com:1337` is **not** whitelisted in `sso.redhat.com`,
which is why the `HCC_ENV=prod` override is required.

## Playwright files changed for Konflux CI

### `playwright/support/global-setup.ts`

Runs once before all tests:

1. Navigates to `prod.foo.redhat.com:1337/` (the proxy sidecar).
2. Authenticates via SSO (`sso.redhat.com` accepts `prod.foo` as `redirect_uri`).
3. Saves the authenticated session to `storageState.json`.

### `playwright/fixtures/pages.ts`

The custom test fixture that creates worker-scoped authenticated browser
contexts. Key setting for Konflux CI:

- **`ignoreHTTPSErrors: true`** on `browser.newContext()` — the proxy's
  internal TLS cert is self-signed.

### `playwright/support/auth-config.ts`

Reads credentials from `TEST_WITHQUOTA_USER` / `TEST_WITHQUOTA_PASSWORD`
(local/smoke) with fallback to `E2E_USER` / `E2E_PASSWORD` (Konflux secret).

## Environment variables

Set in the `e2e-tests-script` section of the YAML:

| Variable | Value | Purpose |
|---|---|---|
| `CI` | `true` | Enables retries (2) and parallel workers (4) in `playwright.config.ts`. |
| `NODE_TLS_REJECT_UNAUTHORIZED` | `0` | Accept the proxy's self-signed TLS cert at the Node.js level. |
| `BASE_URL` | `https://prod.foo.redhat.com:1337/openshift/` | Browser navigates directly to the proxy sidecar. |

Pipeline parameters for the proxy sidecar:

| Parameter | Value | Purpose |
|---|---|---|
| `e2e-hcc-env` | `prod` | Switches the proxy from `stage.foo` to `prod.foo.redhat.com:1337`. |
| `e2e-hcc-env-url` | `https://console.dev.redhat.com` | OCMUI staging as the upstream for the proxy. |

Credentials are injected by the shared pipeline from the Konflux secret
`ocm-ui-credentials-secret` (referenced via the `e2e-credentials-secret`
param). The secret provides `E2E_USER` and `E2E_PASSWORD`.

## Konflux resources

| Resource | Name | Purpose |
|---|---|---|
| **Secret** | `ocm-ui-credentials-secret` | E2E test credentials (`e2e-user`, `e2e-password`) and proxy config (`e2e-stage-actual-hostname`). |
| **ConfigMap** | `ocm-ui-dev-proxy-caddyfile` | Custom Caddy routes for the frontend-dev-proxy sidecar (`/apps/openshift*` → app container). |
| **ConfigMap** | `ocm-ui-app-caddy-config` | Caddyfile for the built application container, volume-mounted to `/etc/caddy`. |
| **ServiceAccount** | `build-pipeline-uhc-portal` | Pipeline service account with access to secrets and image push. |

## Open items

- **Secret cleanup**: The `e2e-hcc-env-url` key in `ocm-ui-credentials-secret`
  is no longer consumed by the shared pipeline (moved to a pipeline parameter).
  It can be removed from the Konflux secret to avoid confusion.

## Artifact persistence

Konflux pipelines run in ephemeral pods — all filesystem state is lost when the
pipeline completes. Currently there is no built-in mechanism for persisting
Playwright screenshots, videos, or HTML reports beyond the pipeline's lifetime.

**Current approach**: The test summary (pass/fail counts, failed test names) is
printed directly to Tekton logs, which are retained by Konflux. Failure
artifacts (screenshots, videos, traces) are listed in the logs with file sizes
but are not persisted.

**Future options**:
- Upload artifacts to an S3/object-storage bucket as a post-test step.
- Use Tekton Results with an artifact backend (if/when supported by Konflux).
- Push the HTML report to GitHub Pages or a similar hosting target.

## Resource limits

| Task | Step | Memory |
|---|---|---|
| `run-unit-tests` | `unit-tests` | 6 Gi |
| `run-e2e-tests` | `e2e-tests` | 10 Gi |
| workspace PVC | — | 10 Gi storage |

The E2E step needs 10 Gi because Playwright runs 4 Chromium workers in
parallel, each consuming ~1.5–2 Gi.
