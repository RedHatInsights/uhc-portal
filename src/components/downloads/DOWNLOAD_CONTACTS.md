# console.redhat.com/openshift/downloads Ownership Map

When the weekly link checker finds a broken URL on the downloads page, we need to know which Red Hat team to contact. This document maps each download tool to its upstream team (for binary/tarball URLs) and the documentation team (for "Get started" / "Learn more" links).

> **Note:** The OCMUI team owns the _downloads page source code_. This file documents the _external teams_ who publish the binaries and maintain the documentation that the downloads page links to.
>
> For external documentation links used across the entire app (wizards, tooltips, etc.), see [`src/common/EXTERNAL_LINKS_CONTACTS.md`](../../common/EXTERNAL_LINKS_CONTACTS.md).

## Base Download URL Domains

| Domain | URL Pattern | Responsible Org |
|--------|-------------|-----------------|
| mirror.openshift.com | `https://mirror.openshift.com/pub/openshift-v4/...` | ART (Automated Release Tooling) publishes binaries here |
| developers.redhat.com (CGW) | `https://developers.redhat.com/content-gateway/rest/...` | Content Gateway team hosts; individual product teams publish |
| github.com | `https://github.com/redhat-developer/app-services-cli/releases/...` | redhat-developer GitHub org |

## External Ownership Map

### CLI Tools

| Display Name | GitHub Repo | Binary Contacts (from OWNERS) | Doc Links Maintained By | Rover Groups Search |
|-------------|-------------|-------------------------------|------------------------|---------------------|
| OpenShift CLI (oc) | [openshift/oc](https://github.com/openshift/oc) | ART team — Justin Pierce (@jupierce), Joep van Delft (@joepvd, jdelft@redhat.com), Siddharth Sharma (@thegreyd) | Andrea Hoffer (ahoffer@redhat.com) — OSDOCS | art- , openshift-clients |
| OCM API CLI (ocm) | [openshift-online/ocm-cli](https://github.com/openshift-online/ocm-cli) | Ren Campos (@rcampos2029, rcampos@redhat.com), Miguel Pereira (@miguelhbrito) | Frances McDonald (fmcdonal@redhat.com) — OSDOCS | ocm- , sd-sre |
| ROSA CLI (rosa) | [openshift/rosa](https://github.com/openshift/rosa) | Lucas Freitas (@olucasfreitas, lufreita@redhat.com), Jericho Keyne (@jerichokeyne), Amanda Katz (@amandahla, amanda.katz@redhat.com), Brae Troutman (@BraeTroutman), Ling Lan (@marcolan018, llan@redhat.com), Guilherme Branco (@gdbranco), Rob Blake (@robpblake) | Eric Ponvelle (eponvell@redhat.com) — OSDOCS | rosa , managed-openshift |
| Knative CLI (kn) | [openshift-knative/client](https://github.com/openshift-knative/client) | Christoph Stäbler (@creydr), David Simansky (@dsimansk), Kaustubh Pande (@Kaustubh-pande), Marek Schmidt (@maschmid), Michal Vinkler (@mvinkler, mvinkler@redhat.com), Rudra Pratap (@rudyredhat1, rpratap@redhat.com) | Andrea Hoffer (ahoffer@redhat.com) — OSDOCS | openshift-serverless |
| Tekton CLI (tkn) | [tektoncd/cli](https://github.com/tektoncd/cli) | Divyanshu Agrawal (@divyansh42), Vincent Demeester (@vdemeester, vdemeest@redhat.com), Chmouel Boudjnah (@chmouel, chmouel@chmouel.com), Vinamra Jain (@vinamra28) | Andrea Hoffer (ahoffer@redhat.com) — OSDOCS | openshift-pipelines |
| Argo CD CLI (argocd) | [redhat-developer/gitops-operator](https://github.com/redhat-developer/gitops-operator) | William Tam (@wtam2018, wtam@redhat.com), chetan-rns, jannfis, jgwest, anandf, varshab1210, svghadi | [OSDOCS — GitOps](../../common/EXTERNAL_LINKS_CONTACTS.md#osdocs) | openshift-gitops |
| Shipwright CLI (shp) | [shipwright-io/build](https://github.com/shipwright-io/build) | Enrique Encalada (@qu1queee), Sascha Schwarze (@SaschaSchwarze0, schwarzs@de.ibm.com), HeavyWombat, apoorvajagtap | [OSDOCS — Builds](../../common/EXTERNAL_LINKS_CONTACTS.md#osdocs) | openshift-builds , shipwright |

### Developer Tools

| Display Name | GitHub Repo | Binary Contacts (from OWNERS) | Doc Links Maintained By | Rover Groups Search |
|-------------|-------------|-------------------------------|------------------------|---------------------|
| Developer CLI (odo) | [redhat-developer/odo](https://github.com/redhat-developer/odo) | **DEPRECATED** — see [odo deprecation](https://odo.dev/blog/odo-deprecation-announcement) | odo.dev (upstream community) | odo , developer-tools |
| Helm 3 CLI (helm) | [helm/helm](https://github.com/helm/helm) (upstream) | ART team publishes RH builds — Justin Pierce (@jupierce), Joep van Delft (@joepvd, jdelft@redhat.com), Siddharth Sharma (@thegreyd) | Andrea Hoffer (ahoffer@redhat.com) — OSDOCS | helm , art- |
| Operator Package Mgr (opm) | [operator-framework/operator-sdk](https://github.com/operator-framework/operator-sdk) | sdk-admins, sdk-approvers (GitHub teams) | Michael Burke (mburke@redhat.com) — OSDOCS | olm- , operator-framework |
| Operator SDK CLI | [operator-framework/operator-sdk](https://github.com/operator-framework/operator-sdk) | sdk-admins, sdk-approvers — **removed in OCP 4.19** | Michael Burke (mburke@redhat.com) — OSDOCS | operator-sdk , olm- |
| RHOAS CLI (rhoas) | [redhat-developer/app-services-cli](https://github.com/redhat-developer/app-services-cli) | Product deprecated; repo not archived | GitHub repo README | app-services |

### Installation Tools

| Display Name | GitHub Repo | Binary Contacts (from OWNERS) | Doc Links Maintained By | Rover Groups Search |
|-------------|-------------|-------------------------------|------------------------|---------------------|
| OCP Installer (all archs) | [openshift/installer](https://github.com/openshift/installer) | ART publishes binaries; installer team owns code | Max Bridges (mbridges@redhat.com) — OSDOCS | openshift-installer , art- |
| OpenShift Local (CRC) | [crc-org/crc](https://github.com/crc-org/crc) | Christophe Fergeau (@cfergeau), Praveen Kumar (@praveenkumar), Anjan Nath (@anjannath), Gerard Braad (@gbraad), Yevhen Vydolob (@evidolob, yvydolob@redhat.com), Adrián Riobo Lorenzo (@adrianriobo) | crc.dev (upstream community) | crc , openshift-local |

### Disconnected / Customization Tools

| Display Name | GitHub Repo | Binary Contacts (from OWNERS) | Doc Links Maintained By | Rover Groups Search |
|-------------|-------------|-------------------------------|------------------------|---------------------|
| Mirror Registry | [quay/mirror-registry](https://github.com/quay/mirror-registry) | (OWNERS file empty — check quay team) | Max Bridges (mbridges@redhat.com) — OSDOCS | mirror-registry , quay- |
| oc-mirror Plugin | [openshift/oc-mirror](https://github.com/openshift/oc-mirror) | Alex Guidi (@aguidirh), Rafael F. (@r4f4, rdossant@redhat.com), adolfo-ab, Dylan Orzel (@dorzel) | Max Bridges (mbridges@redhat.com) — OSDOCS | oc-mirror , art- |
| Butane | [coreos/butane](https://github.com/coreos/butane) | Yaakov Selkowitz, MCO team | Max Bridges (mbridges@redhat.com) — OSDOCS | coreos , machine-config |
| CoreOS Installer | [coreos/coreos-installer](https://github.com/coreos/coreos-installer) | Yaakov Selkowitz, MCO team | Max Bridges (mbridges@redhat.com) — OSDOCS | coreos , machine-config |
| Cloud Credential Operator (ccoctl) | [openshift/cloud-credential-operator](https://github.com/openshift/cloud-credential-operator) | Mark Old (@dlom, mold@redhat.com), Jeremiah Stuever (@jstuever) | Max Bridges (mbridges@redhat.com) — OSDOCS | cloud-credential , cco- |

### Tokens

| Display Name | GitHub Repo | Binary Contacts (from OWNERS) | Doc Links Maintained By | Rover Groups Search |
|-------------|-------------|-------------------------------|------------------------|---------------------|
| Pull Secret | — (API: /api/accounts_mgmt/v1/access_token) | OCM / Accounts Management team | Frances McDonald (fmcdonal@redhat.com) — OSDOCS (OCM docs) | ocm- , accounts-management |
| OCM API Token | — (page: [console.redhat.com/openshift/token](https://console.redhat.com/openshift/token)) | OCM / Accounts Management team | — (no external doc link) | ocm- , accounts-management |

---

## How This Map Was Compiled

This ownership map was built using AI-assisted research:

1. **Parsed `src/common/installLinks.mjs`** to extract all download URL base paths and tool identifiers.
2. **Mapped URL path segments to product names** (e.g., `/clients/pipeline/` = Tekton/Pipelines).
3. **Identified the upstream GitHub repo** for each tool.
4. **Queried GitHub OWNERS files** via `gh api repos/ORG/REPO/contents/OWNERS` to get real approver names.
5. **Looked up full names and emails** via `gh api users/USERNAME` for each approver.
6. **Queried `openshift/openshift-docs` commit history** by path to identify documentation writers per product area.
7. **Derived Rover Group search terms** from product names for manual team lookup.

### Refreshing This Data

OWNERS files and doc team assignments change as team members rotate. To refresh:

```bash
# Refresh binary OWNERS
gh api repos/ORG/REPO/contents/OWNERS --jq '.content' | base64 -d

# Refresh doc writers for a specific area
gh api "repos/openshift/openshift-docs/commits?path=PATH&per_page=5" \
  --jq '.[] | "\(.commit.author.name) <\(.commit.author.email)>"'
```
