# Continuous Integration

We use [Konflux][1] for CI, and own the `ocm-ui-tenant` namespace. This namespace hosts the [`ocm-ui` application][8], which in turn holds the [`uhc-portal` build component][12] pointing at this code repo.


## Build Pipelines

The app is built into container images pushed to quay.io. There are three pipeline actions:

1. **PR opened/updated** → [`pull-request` pipeline][3] → temporary image (expires in 5 days)
2. **PR merged** → [`push` pipeline][4] → permanent image → [snapshot][5] created
3. **Deployment** → release pipeline → signed image in [quay.io/redhat-services-prod][7] → App-Interface/GitOps

See [pipeline runs][9], [snapshots][5], and [releases][6] in Konflux UI. Build images stored in [quay.io/redhat-user-workloads][2].

### Workflow

#### 1. PR opened/updated (validation)

```
PR opened/updated
    → clone repo → build container → run unit tests → security scans
    → temporary image pushed to quay.io (expires in 5 days)
    → GitHub check status updated
```

#### 2. PR merged (build release candidate)

```
PR merged
    → clone repo → build container (production) → run unit tests → security scans
    → permanent image pushed to quay.io
    → Snapshot created automatically
```

#### 3. Deployment

```
Snapshot created
    → Release pipeline validates and signs the image
    → Signed image pushed to quay.io/redhat-services-prod
    → App-Interface/GitOps deploys to staging and/or production
```

> **Note:** Staging vs production deployment is controlled by App-Interface/GitOps, not Konflux.

### Troubleshooting PR Failures

When a PR's Konflux check fails, click through to the [pipeline run][9] to see which task failed.

| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| `clone-repository-oci-ta` fails | Registry auth or network issue | Retry; if persistent, check #konflux-users |
| `build-container` fails | Dockerfile error or clone failed | Check logs; fix clone first if it failed |
| `run-unit-tests` fails | Test/lint failure or OOM | Check test output; may need more memory |
| `401 Unauthorized` pushing to quay.io | Expired or missing credentials | Contact #konflux-users |

**To retry a failed pipeline:**
- Push a new commit, or
- Add `/retest` comment on the PR, or
- Click "Re-run" in [Konflux UI][9]

**Getting help:**
- [Konflux FAQ][13]
- **#konflux-users** Slack channel


## Persisted Configuration

Most Konflux configuration (component, release plans, user access) is persisted as YAML in the [konflux-release-data][10] repository:

- `/tenants-config/.../ocm-ui-tenant/` — tenant and component config
- `/config/.../ReleasePlanAdmission/ocm-ui/` — release configuration

To update, use scripts in konflux-release-data — see the [tenants-config readme][14].


## Our Custom Setup

Our pipelines extend a shared pipeline config commonly used in HCC tenant-apps, equipped with an additional task for running unit tests and linting during build. See [docker-build-run-unit-tests][11] at the `RedHatInsights/konflux-pipelines` repo.

The test script and memory limits are configured in our [`.tekton/`][3] files.



[1]: https://konflux.pages.redhat.com/docs/users/index.html
[2]: https://quay.io/repository/redhat-user-workloads/ocm-ui-tenant/uhc-portal
[3]: https://github.com/RedHatInsights/uhc-portal/blob/main/.tekton/uhc-portal-pull-request.yaml
[4]: https://github.com/RedHatInsights/uhc-portal/blob/main/.tekton/uhc-portal-push.yaml
[5]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/snapshots
[6]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/releases
[7]: https://quay.io/repository/redhat-services-prod/ocm-ui-tenant/uhc-portal
[8]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/
[9]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/activity/pipelineruns
[10]: https://gitlab.cee.redhat.com/releng/konflux-release-data
[11]: https://github.com/RedHatInsights/konflux-pipelines/blob/main/pipelines/platform-ui/docker-build-run-unit-tests.yaml
[12]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/components/uhc-portal
[13]: https://konflux.pages.redhat.com/docs/users/faq/general-questions.html
[14]: https://gitlab.cee.redhat.com/releng/konflux-release-data/-/blob/main/tenants-config/README.md?ref_type=heads#add-or-update-a-tenant-namespace-with-the-helper-script
