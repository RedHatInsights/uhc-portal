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
| OpenShift CLI (oc) | [OWNERS](https://github.com/openshift/oc/blob/master/OWNERS) / [ALIASES](https://github.com/openshift/oc/blob/master/OWNERS_ALIASES) | `#forum-ocp-art` | ART publishes binary |
| OCM API CLI (ocm) | [OWNERS](https://github.com/openshift-online/ocm-cli/blob/main/OWNERS) | `#forum-rosa-service-engineering` | |
| ROSA CLI (rosa) | [OWNERS](https://github.com/openshift/rosa/blob/master/OWNERS) | `#forum-rosa-service-engineering` | ping `@rosa-cli-tf-devs` |
| Knative CLI (kn) | [OWNERS](https://github.com/openshift-knative/client/blob/main/OWNERS) / [ALIASES](https://github.com/openshift-knative/client/blob/main/OWNERS_ALIASES) | `#team-serverless` | |
| Tekton CLI (tkn) | [OWNERS](https://github.com/tektoncd/cli/blob/main/OWNERS) | `#forum-openshift-builds` | |
| Argo CD CLI (argocd) | [OWNERS](https://github.com/redhat-developer/gitops-operator/blob/master/OWNERS) | `#forum-openshift-gitops` | |
| Shipwright CLI (shp) | [OWNERS](https://github.com/shipwright-io/cli/blob/main/OWNERS) | `#forum-openshift-builds` | |

### Developer Tools

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| Developer CLI (odo) | [OWNERS](https://github.com/redhat-developer/odo/blob/main/OWNERS) | — | **DEPRECATED** |
| Helm 3 CLI (helm) | [helm/helm](https://github.com/helm/helm) (upstream) | `#forum-helm`, `#helm-eng` | ART publishes RH builds |
| Operator Package Mgr (opm) | [OWNERS](https://github.com/operator-framework/operator-registry/blob/master/OWNERS) | `#olm-dev` (Kubernetes Slack) | |
| Operator SDK CLI | [OWNERS](https://github.com/operator-framework/operator-sdk/blob/master/OWNERS) / [ALIASES](https://github.com/operator-framework/operator-sdk/blob/master/OWNERS_ALIASES) | `#olm-dev` (Kubernetes Slack) | Removed in OCP 4.19 |
| RHOAS CLI (rhoas) | [redhat-developer/app-services-cli](https://github.com/redhat-developer/app-services-cli) | — | **DEPRECATED** |

### Installation Tools

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| OCP Installer (all archs) | [OWNERS](https://github.com/openshift/installer/blob/master/OWNERS) / [ALIASES](https://github.com/openshift/installer/blob/master/OWNERS_ALIASES) | `#forum-ocp-installer` | ART publishes binaries |
| OpenShift Local (CRC) | [OWNERS](https://github.com/crc-org/crc/blob/main/OWNERS) / [ALIASES](https://github.com/crc-org/crc/blob/main/OWNERS_ALIASES) | `#forum-crc` | |

### Disconnected / Customization Tools

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| Mirror Registry | [quay/mirror-registry](https://github.com/quay/mirror-registry) | `#forum-quay` | No OWNERS file |
| oc-mirror Plugin | [OWNERS](https://github.com/openshift/oc-mirror/blob/main/OWNERS) | `#forum-ocp-art` | |
| Butane | [coreos/butane](https://github.com/coreos/butane) | `#forum-ocp-installer` | MCO team; no OWNERS file |
| CoreOS Installer | [coreos/coreos-installer](https://github.com/coreos/coreos-installer) | `#forum-ocp-installer` | MCO team; no OWNERS file |
| Cloud Credential Operator (ccoctl) | [OWNERS](https://github.com/openshift/cloud-credential-operator/blob/master/OWNERS) | `#forum-cloud-credential-operator` | |

### Tokens

| Display Name | Upstream OWNERS | Slack Channel | Notes |
|-------------|-----------------|---------------|-------|
| Pull Secret | — | `#forum-managed-openshift` | API: /api/accounts_mgmt/v1/access_token |
| OCM API Token | — | `#forum-managed-openshift` | [console.redhat.com/openshift/token](https://console.redhat.com/openshift/token) |

