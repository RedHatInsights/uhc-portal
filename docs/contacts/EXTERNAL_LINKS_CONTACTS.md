# External Links Contacts

When the weekly link checker reports a broken doc or support link, use this map to find who to contact.

> **Note:** For download-specific binary URLs, see [`docs/contacts/DOWNLOAD_CONTACTS.md`](DOWNLOAD_CONTACTS.md).

## Contacts by Slack Channel

### `#forum-hcm-docs` — ROSA, OSD, OCM docs

JIRA project: **OSDOCS**

| Domain | Base URL |
|--------|----------|
| ROSA | `docs.redhat.com/.../red_hat_openshift_service_on_aws/4/html/` |
| ROSA Classic | `docs.redhat.com/.../red_hat_openshift_service_on_aws_classic_architecture/4/html/` |
| OSD | `docs.redhat.com/.../openshift_dedicated/4/html/` |
| OCM | `docs.redhat.com/.../openshift_cluster_manager/1-latest/html/` |

### `#forum-ocp-docs` — OCP, Cost Management, MTV docs

JIRA project: **OSDOCS**

| Domain | Base URL |
|--------|----------|
| OCP | `docs.redhat.com/.../openshift_container_platform/latest/html/` |
| Cost Management | `docs.redhat.com/.../cost_management_service/1-latest/html/` |
| MTV | `docs.redhat.com/.../migration_toolkit_for_virtualization/` |

### `#forum-openshift-gitops` — GitOps docs

| Domain | Base URL |
|--------|----------|
| GitOps | `docs.redhat.com/.../red_hat_openshift_gitops/` |

### `#forum-openshift-builds` — Builds docs

| Domain | Base URL |
|--------|----------|
| Builds | `docs.redhat.com/.../builds_for_red_hat_openshift/` |

### `#forum-customer-portal` — Support/KB links, Red Hat website

| Domain | Base URL |
|--------|----------|
| Support Portal | `access.redhat.com/articles/...`, `access.redhat.com/solutions/...` |
| Red Hat website | `www.redhat.com/en/...` |

### `#forum-rosa-eng` — AWS docs (used in ROSA context)

| Domain | Base URL |
|--------|----------|
| AWS Docs | `docs.aws.amazon.com/...` |

### `#forum-osd-gcp-eng` — GCP docs (used in OSD context)

| Domain | Base URL |
|--------|----------|
| GCP Docs | `cloud.google.com/...` |

### `#forum-managed-openshift` — Azure docs (used in ARO context)

| Domain | Base URL |
|--------|----------|
| Azure Docs | `azure.microsoft.com/...` |

## Resolution Steps

### Broken `docs.redhat.com` link

1. Ask in the Slack channel listed above for the product area.
2. File a JIRA ticket in the **OSDOCS** project with the broken URL.
3. If the path has simply been renamed (e.g., `installing-aws-default` → `installer-provisioned-infrastructure`), search the current docs and update the URL in `docLinks.mjs` or `installLinks.mjs`.

### Broken `access.redhat.com` link

Ask in `#forum-customer-portal` or search for the article number internally.

### Broken third-party link (AWS/GCP/Azure)

These are external docs not maintained by Red Hat. Ask in the relevant product channel listed above for help locating the new URL, then update `docLinks.mjs`.
