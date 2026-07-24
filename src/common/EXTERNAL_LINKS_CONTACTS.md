# External Links Contacts

This document maps all external documentation URLs used across the OCMUI app to the teams and people who maintain them. Use this when the weekly link checker reports a broken doc/support link.

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

All `docs.redhat.com` links are maintained by the CCS (Customer Content Services) team. File broken link tickets in the **OSDOCS** JIRA project.

| Domain | Base URL | Doc Team Contacts | Source File |
|--------|---------|-------------------|-------------|
| OCP | `docs.redhat.com/.../openshift_container_platform/latest/html/` | Varies by area (see below) | installLinks.mjs, docLinks.mjs |
| ROSA | `docs.redhat.com/.../red_hat_openshift_service_on_aws/4/html/` | Eric Ponvelle (eponvell@redhat.com), Jake Berger (jberger@redhat.com), Ben Hardesty (bhardest@redhat.com) | docLinks.mjs |
| ROSA Classic | `docs.redhat.com/.../red_hat_openshift_service_on_aws_classic_architecture/4/html/` | Eric Ponvelle, Jeana Routh (jeana@redhat.com) | docLinks.mjs |
| OSD | `docs.redhat.com/.../openshift_dedicated/4/html/` | Jake Berger (jberger@redhat.com), Jeana Routh (jeana@redhat.com), Ben Scott (bscott@redhat.com) | docLinks.mjs |
| OCM | `docs.redhat.com/.../openshift_cluster_manager/1-latest/html/` | Frances McDonald (fmcdonal@redhat.com), Janelle Neczypor (jneczypo@redhat.com) | docLinks.mjs |
| Cost Management | `docs.redhat.com/.../cost_management_service/1-latest/html/` | See resolution process below | docLinks.mjs |
| GitOps | `docs.redhat.com/.../red_hat_openshift_gitops/` | See resolution process below | installLinks.mjs |
| Builds | `docs.redhat.com/.../builds_for_red_hat_openshift/` | See resolution process below | installLinks.mjs |
| MTV | `docs.redhat.com/.../migration_toolkit_for_virtualization/` | See resolution process below | installLinks.mjs |

### Others

| Domain | Base URL | Responsible Team | Source File |
|--------|---------|-----------------|-------------|
| Red Hat Support Portal | `access.redhat.com/articles/...`, `access.redhat.com/support/...`, `access.redhat.com/solutions/...` | Support Engineering / KCS authors | supportLinks.mjs |
| AWS Docs | `docs.aws.amazon.com/...` | AWS (external, not RH-controlled) | docLinks.mjs |
| GCP Docs | `cloud.google.com/...` | Google (external, not RH-controlled) | docLinks.mjs |
| Azure Docs | `azure.microsoft.com/...` | Microsoft (external, not RH-controlled) | docLinks.mjs |
| Red Hat website | `www.redhat.com/en/...` | Red Hat Marketing / Web team | docLinks.mjs |

## OCP Documentation Areas and Contacts

The OCP docs base (`docs.redhat.com/.../openshift_container_platform/`) is divided into topic areas, each with a dedicated writer:

| OCP Doc Path | Topic Area | Primary Doc Writer | Email |
|-------------|-----------|-------------------|-------|
| `/cli_tools/` | CLI tools (oc, kn, tkn, opm, helm) | Andrea Hoffer | ahoffer@redhat.com |
| `/installing_*/` | All installation methods | Max Bridges | mbridges@redhat.com |
| `/authentication_*/` | Identity providers, auth | Michael Burke | mburke@redhat.com |
| `/updating_clusters/` | Cluster upgrades | Michael Burke | mburke@redhat.com |
| `/networking*/` | Networking, proxy, ingress | William Gabor, Brendan Daly | wgabor@redhat.com |
| `/operators*/` | OLM, Operator SDK | Michael Burke, William Gabor | mburke@redhat.com |
| `/disconnected_environments/` | Mirror registry, oc-mirror | Max Bridges | mbridges@redhat.com |
| `/machine_management/` | Machine pools, autoscaling | See resolution process below | — |
| `/postinstallation_configuration/` | Multi-arch, post-install | Max Bridges | mbridges@redhat.com |

## Resolution Process

### When a docs.redhat.com Link Breaks

Doc links typically break when:
- The docs team restructures pages during an OCP version bump
- A product is deprecated and its docs are removed
- A page path is renamed (e.g., `installing-aws-default` → `installer-provisioned-infrastructure`)

**Steps:**
1. File a JIRA ticket in the **OSDOCS** project
2. Contact the relevant doc writer from the tables above
3. Or find who last modified the broken path:
   ```bash
   gh api "repos/openshift/openshift-docs/commits?path=PATH&per_page=5" \
     --jq '.[] | {author: .commit.author.name, email: .commit.author.email}'
   ```

### When a Support/KB Link Breaks (access.redhat.com)

Support portal links (`access.redhat.com/articles/...`, `/solutions/...`) are managed by Support Engineering. These are Knowledge-Centered Support (KCS) articles. There's no single JIRA project — contact the support team or search for the article number internally.

### When a Third-Party Link Breaks (AWS/GCP/Azure)

Links to AWS, GCP, and Azure documentation are external. When they break:
- Check if the URL path changed (these vendors reorganize docs frequently)
- Search their current docs for the topic
- Update `docLinks.mjs` with the new URL — no external team to contact

---

## How This Map Was Compiled

This document was built using AI-assisted research:

1. **Parsed `src/common/docLinks.mjs` and `src/common/supportLinks.mjs`** to extract all external documentation domains.
2. **Identified doc base URLs** and grouped by product area.
3. **Queried `openshift/openshift-docs` commit history** by path to identify documentation writers per product area:
   ```bash
   gh api "repos/openshift/openshift-docs/commits?path=PATH&per_page=5" \
     --jq '.[] | "\(.commit.author.name) <\(.commit.author.email)>"'
   ```

### Refreshing This Data

Doc team assignments change as writers rotate. To find the current owner for any doc path:

```bash
gh api "repos/openshift/openshift-docs/commits?path=PATH&per_page=5" \
  --jq '.[] | "\(.commit.author.name) <\(.commit.author.email)>"'
```

Replace `PATH` with the topic directory (e.g., `cli_reference`, `installing`, `networking`, `rosa_install_access_delete_clusters`, `authentication`).
