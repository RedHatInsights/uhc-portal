# console.redhat.com/openshift/downloads Ownership Map

When the weekly link checker finds a broken URL on the downloads page, we need to know which Red Hat team to contact. This document maps each download tool to its upstream team (for binary/tarball URLs) and the Slack channel to ask about documentation links.

> **Note:** The OCMUI team owns the _downloads page source code_. This file documents the _external teams_ who publish the binaries and maintain the documentation that the downloads page links to.
>
> For external documentation links used across the entire app (wizards, tooltips, etc.), see [`src/common/EXTERNAL_LINKS_CONTACTS.md`](../../common/EXTERNAL_LINKS_CONTACTS.md).

## Base Download URL Domains

| Domain | URL Pattern | Responsible Org | Slack Channel |
|--------|-------------|-----------------|---------------|
| mirror.openshift.com | `https://mirror.openshift.com/pub/openshift-v4/...` | ART (Automated Release Tooling) | `#forum-ocp-art` |
| developers.redhat.com (CGW) | `https://developers.redhat.com/content-gateway/rest/...` | Content Gateway team hosts; individual product teams publish | `#rel-eng` |
| github.com | `https://github.com/redhat-developer/app-services-cli/releases/...` | redhat-developer GitHub org | (varies per repo) |

## External Ownership Map

For broken doc links ("Get started" / "Learn more"), file a ticket in the **OSDOCS** JIRA project or ask in `#forum-ocp-docs`.

### CLI Tools

| Display Name | Upstream OWNERS | Binary Contacts | Slack Channel |
|-------------|-----------------|-----------------|---------------|
| OpenShift CLI (oc) | [openshift/oc/OWNERS](https://github.com/openshift/oc/blob/master/OWNERS) | ART team | `#forum-ocp-art` |
| OCM API CLI (ocm) | [openshift-online/ocm-cli/OWNERS](https://github.com/openshift-online/ocm-cli/blob/main/OWNERS) | See OWNERS file | `#forum-rosa-service-engineering` |
| ROSA CLI (rosa) | [openshift/rosa/OWNERS](https://github.com/openshift/rosa/blob/master/OWNERS) | See OWNERS file | `#forum-rosa-service-engineering` (`@rosa-cli-tf-devs`) |
| Knative CLI (kn) | [openshift-knative/client/OWNERS](https://github.com/openshift-knative/client/blob/main/OWNERS) | See OWNERS file | `#team-serverless` |
| Tekton CLI (tkn) | [tektoncd/cli/OWNERS](https://github.com/tektoncd/cli/blob/main/OWNERS) | See OWNERS file | `#forum-openshift-builds` |
| Argo CD CLI (argocd) | [redhat-developer/gitops-operator/OWNERS](https://github.com/redhat-developer/gitops-operator/blob/master/OWNERS) | See OWNERS file | `#forum-openshift-gitops` |
| Shipwright CLI (shp) | [shipwright-io/cli/OWNERS](https://github.com/shipwright-io/cli/blob/main/OWNERS) | See OWNERS file | `#forum-openshift-builds` |

### Developer Tools

| Display Name | Upstream OWNERS | Binary Contacts | Slack Channel |
|-------------|-----------------|-----------------|---------------|
| Developer CLI (odo) | [redhat-developer/odo/OWNERS](https://github.com/redhat-developer/odo/blob/main/OWNERS) | **DEPRECATED** — see [odo deprecation](https://odo.dev/blog/odo-deprecation-announcement) | — |
| Helm 3 CLI (helm) | [helm/helm](https://github.com/helm/helm) (upstream) | ART team publishes RH builds | `#forum-helm` |
| Operator Package Mgr (opm) | [operator-framework/operator-registry/OWNERS](https://github.com/operator-framework/operator-registry/blob/master/OWNERS) | OLM team (see OWNERS file) | `#olm-dev` (Kubernetes Slack) |
| Operator SDK CLI | [operator-framework/operator-sdk/OWNERS](https://github.com/operator-framework/operator-sdk/blob/master/OWNERS) | **removed in OCP 4.19** | `#olm-dev` (Kubernetes Slack) |
| RHOAS CLI (rhoas) | [redhat-developer/app-services-cli](https://github.com/redhat-developer/app-services-cli) | Product deprecated; repo not archived | — |

### Installation Tools

| Display Name | Upstream OWNERS | Binary Contacts | Slack Channel |
|-------------|-----------------|-----------------|---------------|
| OCP Installer (all archs) | [openshift/installer/OWNERS](https://github.com/openshift/installer/blob/master/OWNERS) | ART publishes binaries; installer team owns code | `#forum-ocp-installer` |
| OpenShift Local (CRC) | [crc-org/crc/OWNERS](https://github.com/crc-org/crc/blob/main/OWNERS) | See OWNERS file | `#forum-crc` |

### Disconnected / Customization Tools

| Display Name | Upstream OWNERS | Binary Contacts | Slack Channel |
|-------------|-----------------|-----------------|---------------|
| Mirror Registry | [quay/mirror-registry](https://github.com/quay/mirror-registry) | (OWNERS file empty — check quay team) | `#forum-quay` |
| oc-mirror Plugin | [openshift/oc-mirror/OWNERS](https://github.com/openshift/oc-mirror/blob/main/OWNERS) | See OWNERS file | `#forum-ocp-art` |
| Butane | [coreos/butane/OWNERS](https://github.com/coreos/butane/blob/main/OWNERS) | MCO team (see OWNERS file) | `#forum-ocp-installer` |
| CoreOS Installer | [coreos/coreos-installer/OWNERS](https://github.com/coreos/coreos-installer/blob/main/OWNERS) | MCO team (see OWNERS file) | `#forum-ocp-installer` |
| Cloud Credential Operator (ccoctl) | [openshift/cloud-credential-operator/OWNERS](https://github.com/openshift/cloud-credential-operator/blob/master/OWNERS) | See OWNERS file | `#forum-cloud-credential-operator` |

### Tokens

| Display Name | Upstream OWNERS | Binary Contacts | Slack Channel |
|-------------|-----------------|-----------------|---------------|
| Pull Secret | — (API: /api/accounts_mgmt/v1/access_token) | OCM / Accounts Management team | `#forum-managed-openshift` |
| OCM API Token | — (page: [console.redhat.com/openshift/token](https://console.redhat.com/openshift/token)) | OCM / Accounts Management team | `#forum-managed-openshift` |

---

## How This Map Was Compiled

This ownership map was built using AI-assisted research:

1. **Parsed `src/common/installLinks.mjs`** to extract all download URL base paths and tool identifiers.
2. **Identified the upstream GitHub repo** for each tool and linked directly to the `OWNERS` file as the durable source of truth for contacts.
3. **Cross-referenced Slack channels** using Slack MCP search and upstream CONTRIBUTING.md files to find the team forum channel for each product area.

### Refreshing This Data

Slack channels are long-lived. OWNERS files rotate naturally. To check current binary owners:

```bash
gh api repos/ORG/REPO/contents/OWNERS --jq '.content' | base64 -d
```
