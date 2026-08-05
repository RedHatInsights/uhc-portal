# console.redhat.com/openshift/downloads Ownership Map

When the weekly link checker finds a broken URL on the downloads page, use this map to find which team to contact.

> For external documentation links used across the entire app, see [`docs/contacts/EXTERNAL_LINKS_CONTACTS.md`](EXTERNAL_LINKS_CONTACTS.md).

## Base Download URL Domains

| Domain | URL Pattern | Responsible Org | Slack Channel |
|--------|-------------|-----------------|---------------|
| mirror.openshift.com | `https://mirror.openshift.com/pub/openshift-v4/...` | ART (Automated Release Tooling) | `#forum-ocp-art` |
| developers.redhat.com (CGW) | `https://developers.redhat.com/content-gateway/rest/...` | Content Gateway team hosts; individual product teams publish | `#rel-eng` |
| github.com | `https://github.com/redhat-developer/app-services-cli/releases/...` | redhat-developer GitHub org | (varies per repo) |

## External Ownership Map

For broken doc links ("Get started" / "Learn more"), file a ticket in the **OSDOCS** JIRA project or ask in `#forum-ocp-docs`.

### CLI Tools

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| OpenShift CLI (oc) | [openshift/oc/OWNERS](https://github.com/openshift/oc/blob/master/OWNERS) | `#forum-ocp-art` | ART publishes binary |
| OCM API CLI (ocm) | [openshift-online/ocm-cli/OWNERS](https://github.com/openshift-online/ocm-cli/blob/main/OWNERS) | `#forum-rosa-service-engineering` | |
| ROSA CLI (rosa) | [openshift/rosa/OWNERS](https://github.com/openshift/rosa/blob/master/OWNERS) | `#forum-rosa-service-engineering` | ping `@rosa-cli-tf-devs` |
| Knative CLI (kn) | [openshift-knative/client/OWNERS](https://github.com/openshift-knative/client/blob/main/OWNERS) | `#team-serverless` | |
| Tekton CLI (tkn) | [tektoncd/cli/OWNERS](https://github.com/tektoncd/cli/blob/main/OWNERS) | `#forum-openshift-builds` | |
| Argo CD CLI (argocd) | [redhat-developer/gitops-operator/OWNERS](https://github.com/redhat-developer/gitops-operator/blob/master/OWNERS) | `#forum-openshift-gitops` | |
| Shipwright CLI (shp) | [shipwright-io/cli/OWNERS](https://github.com/shipwright-io/cli/blob/main/OWNERS) | `#forum-openshift-builds` | |

### Developer Tools

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| Developer CLI (odo) | [redhat-developer/odo](https://github.com/redhat-developer/odo/blob/main/OWNERS) | — | **DEPRECATED** |
| Helm 3 CLI (helm) | [helm/helm](https://github.com/helm/helm) (upstream) | `#forum-helm` | ART publishes RH builds |
| Operator Package Mgr (opm) | [operator-framework/operator-registry/OWNERS](https://github.com/operator-framework/operator-registry/blob/master/OWNERS) | `#olm-dev` (Kubernetes Slack) | |
| Operator SDK CLI | [operator-framework/operator-sdk/OWNERS](https://github.com/operator-framework/operator-sdk/blob/master/OWNERS) | `#olm-dev` (Kubernetes Slack) | Removed in OCP 4.19 |
| RHOAS CLI (rhoas) | [redhat-developer/app-services-cli](https://github.com/redhat-developer/app-services-cli) | — | **DEPRECATED** |

### Installation Tools

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| OCP Installer (all archs) | [openshift/installer/OWNERS](https://github.com/openshift/installer/blob/master/OWNERS) | `#forum-ocp-installer` | ART publishes binaries |
| OpenShift Local (CRC) | [crc-org/crc/OWNERS](https://github.com/crc-org/crc/blob/main/OWNERS) | `#forum-crc` | |

### Disconnected / Customization Tools

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| Mirror Registry | [quay/mirror-registry](https://github.com/quay/mirror-registry) | `#forum-quay` | OWNERS file empty |
| oc-mirror Plugin | [openshift/oc-mirror/OWNERS](https://github.com/openshift/oc-mirror/blob/main/OWNERS) | `#forum-ocp-art` | |
| Butane | [coreos/butane/OWNERS](https://github.com/coreos/butane/blob/main/OWNERS) | `#forum-ocp-installer` | MCO team |
| CoreOS Installer | [coreos/coreos-installer/OWNERS](https://github.com/coreos/coreos-installer/blob/main/OWNERS) | `#forum-ocp-installer` | MCO team |
| Cloud Credential Operator (ccoctl) | [openshift/cloud-credential-operator/OWNERS](https://github.com/openshift/cloud-credential-operator/blob/master/OWNERS) | `#forum-cloud-credential-operator` | |

### Tokens

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| Pull Secret | — | `#forum-managed-openshift` | API: /api/accounts_mgmt/v1/access_token |
| OCM API Token | — | `#forum-managed-openshift` | [console.redhat.com/openshift/token](https://console.redhat.com/openshift/token) |

