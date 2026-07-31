# `console.redhat.com/openshift` API Contact Map

When you have questions about an API — its behavior, expected response data, contract changes, or deprecation timelines — use this map to find the owning team's Slack channel and JIRA project.

**Quick reference:**
1. Find the API below.
2. Go to the listed Slack channel and ask there.
3. For tracked work, file a ticket in the listed JIRA project and cross-post in the channel.

## APIs Consumed by the UI

### Clusters Management (CS)
- **Path:** `/api/clusters_mgmt/v1`
- **UI Areas:**

  | Cluster list | Archived cluster list |
  |---|---|
  | Cluster details (all tabs) | OSD wizard (AWS/GCP) |
  | OSD Trial wizard | ROSA Classic wizard |
  | ROSA HCP wizard | ROSA Get Started wizard |
  | Machine pools (OSD/ROSA Classic) | Node pools (ROSA HCP) |
  | Upgrades/Settings | Networking |
  | Access control | Add-ons |
  | Support | Monitoring |
  | Cluster logs | Install cluster pages |

- **Slack:** `#forum-rosa-service-engineering`, `#forum-osd-gcp-eng`
- **JIRA:** SDA

### Account Management (AMS)
- **Path:** `/api/accounts_mgmt/v1`
- **UI Areas:**

  | Quota page | Dashboard |
  |---|---|
  | Cluster list | Cluster details |
  | OSD wizard (AWS/GCP) | ROSA Classic wizard |
  | ROSA HCP wizard | ROSA Get Started wizard |
  | Access control | Support tab |
  | Downloads page | GovCloud form |
  | Cluster transfer list | CLI login page |
  | Register cluster page | Create cluster page |
  | Monitoring tab | Install cluster pages |

- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** SDA

### Authorizations
- **Path:** `/api/authorizations/v1`
- **UI Areas:**
  - All pages (permission gating)
  - GovCloud form (T&C acceptance)
  - Terms acceptance (create wizards, CLI login)
  - Feature flags
- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** SDA

### Access Transparency
- **Path:** `/api/access_transparency/v1`
- **UI Areas:**
  - Access request tab
  - Access request detail page
  - Cluster list (pending request badge)
  - Cluster requests page
- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** SDA

### Service Logs
- **Path:** `/api/service_logs/v1`
- **UI Areas:**
  - Cluster logs tab
- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** SDA

### Upgrades Info
- **Path:** `/api/upgrades_info/v1`
- **UI Areas:**
  - Releases page
  - ROSA Classic wizard
  - ROSA HCP wizard
  - ROSA Get Started wizard
- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** SDA

### Cost Management
- **Path:** `/cost-management/v1`
- **UI Areas:**
  - Dashboard (Cost card)
  - Cluster details
- **Slack:** `#forum-cost-mgmt`
- **JIRA:** COST

### Insights Results Aggregator
- **Path:** `/insights-results-aggregator/v1`, `/v2`
- **UI Areas:**
  - Dashboard (Insights card)
  - Cluster details
- **Slack:** `#forum-consoledot`
- **JIRA:** CCX

### FedRAMP Customer Interest
- **Path:** `/fedramp-customer-interest/incident`
- **UI Areas:**
  - GovCloud form
- **Slack:** `#forum-consoledot`

### Demo Experience (ROSA Hands-On)
- **Path:** `api.demo-experience.demo.redhat.com`
- **UI Areas:**
  - ROSA Hands-On page
- **Slack:** `#tmp-rosa-handson`

### Product Life Cycles
- **Path:** `access.redhat.com/product-life-cycles/api/v1`
- **UI Areas:**

  | Releases page | Cluster details |
  |---|---|
  | OSD wizard | ROSA Classic wizard |
  | ROSA HCP wizard | ROSA Get Started wizard |
- **Slack:** `#forum-ocp-release`
- **JIRA:** PLMCORE

### GitHub REST
- **Path:** `api.github.com/repos/.../releases/latest`
- **UI Areas:**
  - Downloads page
  - Install cluster instruction pages
- **Slack:** N/A (public GitHub API)

### Assisted Installer
- **Path:** Federated (module federation remote)
- **UI Areas:**
  - Overview page
  - Create cluster page
  - Cluster list
  - Cluster list (empty state)
  - Cluster details
  - Dashboard (empty state)
- **Slack:** `#forum-assisted-installer`
- **JIRA:** MGMT

---

## Cross-Cutting Slack Channels

- `#forum-rosa-service-engineering` — Primary hub for all OCM backend services (CS, AMS, ATS, OSL, Upgrades Info)
- `#forum-osd-gcp-eng` — OSD GCP-specific cluster issues (WIF, firewall rules, instance types, permissions)
- `#forum-rosa-eng` — Broader ROSA engineering discussions
- `#forum-managed-openshift` — Cross-product managed OpenShift discussions (OSD + ROSA)
- `#forum-consoledot` — HCC platform services (Insights, Cost Management, FedRAMP)
- `#forum-ocp-release` — OCP release lifecycle, Product Life Cycles API
- `#sd-app-sre` — SRE operations for all OCM/HCC services
- `#ocm-osd-ui` — Inbound channel where backend teams (SRE, ROSA eng, CCS docs, AMS, platform), support (CEE/TAMs), and cross-team stakeholders reach the OCM UI team
- `#webrca-status-board-adoption` — WebRCA + Status Board

---

## Maintenance

- **Types out of date?** Run `make openapi` from the repo root (`RedHatInsights/uhc-portal`) to regenerate types. See `openapi/README.md` for spec source URLs.
- **New API to consume?** Update this file and add the generation command to the root `Makefile`.
