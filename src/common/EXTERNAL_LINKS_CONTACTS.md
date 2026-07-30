# External Links Contacts

This document maps all external documentation URLs used across the OCMUI app to the teams who maintain them. Use this when the weekly link checker reports a broken doc/support link.

> **Note:** For download-specific binary URLs and tool ownership, see [`src/components/downloads/DOWNLOAD_CONTACTS.md`](../components/downloads/DOWNLOAD_CONTACTS.md).

## Source Files

| File | Purpose |
|------|---------|
| `src/common/installLinks.mjs` | Download binary URLs + CLI doc links used on downloads page |
| `src/common/docLinks.mjs` | Documentation links used across the app (docs.redhat.com, AWS, GCP) |
| `src/common/supportLinks.mjs` | Support/KB links (access.redhat.com) |
| `src/common/urlUtils.mjs` | Aggregates all links from the above files (used by check-links) |

## Base Documentation Domains

<a id="osdocs"></a>

### OSDOCS (docs.redhat.com)

All `docs.redhat.com` links are maintained by the CCS (Customer Content Services) team.

JIRA project: **OSDOCS** | Slack: `#forum-ocp-docs` (OCP) or `#forum-hcm-docs` (ROSA/OSD/OCM)

| Domain | Base URL | Slack Channel | Source File |
|--------|---------|---------------|-------------|
| OCP | `docs.redhat.com/.../openshift_container_platform/latest/html/` | `#forum-ocp-docs` | installLinks.mjs, docLinks.mjs |
| ROSA | `docs.redhat.com/.../red_hat_openshift_service_on_aws/4/html/` | `#forum-hcm-docs` | docLinks.mjs |
| ROSA Classic | `docs.redhat.com/.../red_hat_openshift_service_on_aws_classic_architecture/4/html/` | `#forum-hcm-docs` | docLinks.mjs |
| OSD | `docs.redhat.com/.../openshift_dedicated/4/html/` | `#forum-hcm-docs` | docLinks.mjs |
| OCM | `docs.redhat.com/.../openshift_cluster_manager/1-latest/html/` | `#forum-hcm-docs` | docLinks.mjs |
| Cost Management | `docs.redhat.com/.../cost_management_service/1-latest/html/` | `#forum-ocp-docs` | docLinks.mjs |
| GitOps | `docs.redhat.com/.../red_hat_openshift_gitops/` | `#forum-openshift-gitops` | installLinks.mjs |
| Builds | `docs.redhat.com/.../builds_for_red_hat_openshift/` | `#forum-openshift-builds` | installLinks.mjs |
| MTV | `docs.redhat.com/.../migration_toolkit_for_virtualization/` | `#forum-ocp-docs` | installLinks.mjs |

### Others

| Domain | Base URL | Responsible Team | Slack Channel | Source File |
|--------|---------|-----------------|---------------|-------------|
| Red Hat Support Portal | `access.redhat.com/articles/...`, `access.redhat.com/support/...`, `access.redhat.com/solutions/...` | Support Engineering / KCS authors | `#forum-customer-portal` | supportLinks.mjs |
| AWS Docs | `docs.aws.amazon.com/...` | AWS (external, not RH-controlled) | — | docLinks.mjs |
| GCP Docs | `cloud.google.com/...` | Google (external, not RH-controlled) | — | docLinks.mjs |
| Azure Docs | `azure.microsoft.com/...` | Microsoft (external, not RH-controlled) | — | docLinks.mjs |
| Red Hat website | `www.redhat.com/en/...` | Red Hat Marketing / Web team | — | docLinks.mjs |

## Resolution Process

### When a docs.redhat.com Link Breaks

Doc links typically break when:
- The docs team restructures pages during an OCP version bump
- A product is deprecated and its docs are removed
- A page path is renamed (e.g., `installing-aws-default` → `installer-provisioned-infrastructure`)

**Steps:**
1. File a JIRA ticket in the **OSDOCS** project
2. Ask in `#forum-ocp-docs` (OCP docs) or `#forum-hcm-docs` (ROSA/OSD/OCM docs)
3. Or find who last modified the broken path:
   ```bash
   gh api "repos/openshift/openshift-docs/commits?path=PATH&per_page=5" \
     --jq '.[] | .commit.author.name'
   ```

### When a Support/KB Link Breaks (access.redhat.com)

Support portal links (`access.redhat.com/articles/...`, `/solutions/...`) are managed by Support Engineering (KCS articles). Ask in `#forum-customer-portal` or search for the article number internally.

### When a Third-Party Link Breaks (AWS/GCP/Azure)

Links to AWS, GCP, and Azure documentation are external. When they break:
- Check if the URL path changed (these vendors reorganize docs frequently)
- Search their current docs for the topic
- Update `docLinks.mjs` with the new URL — no external team to contact

---

## How This Map Was Compiled

This document was built using AI-assisted research:

1. **Parsed `src/common/installLinks.mjs`, `src/common/docLinks.mjs`, and `src/common/supportLinks.mjs`** to extract all external documentation domains.
2. **Identified doc base URLs** and grouped by product area.
3. **Cross-referenced Slack channels** using Slack MCP search and upstream repo CONTRIBUTING.md files to find the correct forum channels per product/team.

Slack channels are durable. When in doubt, ask in the relevant channel — the team will route to the current owner.
