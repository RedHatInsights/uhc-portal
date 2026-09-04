# `console.redhat.com/openshift` API Contact Map

When you have questions about an API — its behavior, expected response data, contract changes, or deprecation timelines — use this map to find the owning team's Slack channel and JIRA project.

**Quick reference:**
1. Find the API below.
2. Go to the listed Slack channel and ask there.
3. For tracked work, file a ticket in the listed JIRA project and cross-post in the channel.

## APIs Consumed by the UI

### Clusters Management (CS)
- **Path:** [`/api/clusters_mgmt/v1`](https://api.openshift.com/?urls.primaryName=Clusters+management+service)
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
- **JIRA:** [ROSAENG](https://redhat.atlassian.net/projects/ROSAENG)

### Account Management (AMS)
- **Path:** [`/api/accounts_mgmt/v1`](https://api.openshift.com/?urls.primaryName=Accounts+management+service)
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
- **JIRA:** [ROSAENG](https://redhat.atlassian.net/projects/ROSAENG)

### Authorizations
- **Path:** [`/api/authorizations/v1`](https://api.openshift.com/?urls.primaryName=Authorization+service)
- **UI Areas:**
  - All pages (permission gating)
  - GovCloud form (T&C acceptance)
  - Terms acceptance (create wizards, CLI login)
  - Feature flags (API call routes here; flag definitions managed in Unleash by our team)
- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** [ROSAENG](https://redhat.atlassian.net/projects/ROSAENG)

### Access Transparency
- **Path:** [`/api/access_transparency/v1`](https://api.openshift.com/?urls.primaryName=Access+Transparency+Service)
- **UI Areas:**
  - Access request tab
  - Access request detail page
  - Cluster list (pending request badge)
  - Cluster requests page
- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** [ROSAENG](https://redhat.atlassian.net/projects/ROSAENG)

### Service Logs
- **Path:** [`/api/service_logs/v1`](https://api.openshift.com/?urls.primaryName=Service+logs)
- **UI Areas:**
  - Cluster logs tab
- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** [ROSAENG](https://redhat.atlassian.net/projects/ROSAENG)

### Upgrades Info
- **Path:** [`/api/upgrades_info/v1`](https://api.openshift.com/?urls.primaryName=Upgrades+information+service)
- **UI Areas:**
  - Releases page
  - ROSA Classic wizard
  - ROSA HCP wizard
  - ROSA Get Started wizard
- **Slack:** `#forum-rosa-service-engineering`
- **JIRA:** [ROSAENG](https://redhat.atlassian.net/projects/ROSAENG)

### Cost Management
- **Path:** `/cost-management/v1`
- **UI Areas:**
  - Dashboard (Cost card)
  - Cluster details
- **Slack:** `#forum-cost-mgmt`
- **JIRA:** [COST](https://redhat.atlassian.net/projects/COST)

### Insights Results Aggregator
- **Path:** `/insights-results-aggregator/v1`, `/v2`
- **UI Areas:**
  - Dashboard (Insights card)
  - Cluster details
- **Slack:** `#forum-consoledot`
- **JIRA:** [CCX](https://redhat.atlassian.net/projects/CCX)

### FedRAMP Customer Interest
- **Path:** `/fedramp-customer-interest/incident`
- **UI Areas:**
  - GovCloud form
- **Slack:** `#forum-consoledot`

### Demo Experience (ROSA Hands-On)
- **Path:** `https://api.demo-experience.demo.redhat.com`
- **UI Areas:**
  - ROSA Hands-On page
- **Slack:** `#tmp-rosa-handson` (fallback: `#forum-managed-openshift`)

### Product Life Cycles
- **Path:** `access.redhat.com/product-life-cycles/api/v1`
- **UI Areas:**

  | Releases page | Cluster details |
  |---|---|
  | OSD wizard | ROSA Classic wizard |
  | ROSA HCP wizard | ROSA Get Started wizard |

- **Slack:** `#forum-ocp-release`
- **JIRA:** [PLMCORE](https://redhat.atlassian.net/projects/PLMCORE)

### GitHub REST
- **Path:** `api.github.com/repos/.../releases/latest`
- **UI Areas:**
  - Downloads page
  - Install cluster instruction pages
- **Slack:** `#ocm-osd-ui` (our code makes these calls; GitHub is a public API)

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
- **JIRA:** [MGMT](https://redhat.atlassian.net/projects/MGMT)

---

## Product Managers

| Product Area | Slack |
|-------------|-------|
| ROSA | `@Bala Chandrasekaran`, `@Aaren`, `@Sean Y` |
| OSD | `@Shreyans Mulkutkar` |
| ARO | `@Jerome`, `@Oren Kashi` |
| OCM | `@Likhith` |
| Marketplace/Billing | `@Likhith`, `@Jiri Fiala` |
| ROSA Hyperfleet | `@Aaren`, `@Abhishek Gupta` |

---

## Cross-Cutting Slack Channels

- `#forum-rosa-service-engineering` — Primary hub for all OCM backend services (CS, AMS, ATS, OSL, Upgrades Info)
- `#forum-osd-gcp-eng` — OSD GCP-specific cluster issues (WIF, firewall rules, instance types, permissions)
- `#forum-rosa-eng` — Broader ROSA engineering discussions
- `#forum-managed-openshift` — Cross-product managed OpenShift discussions (OSD + ROSA)
- `#forum-cost-mgmt` — Cost Management API
- `#forum-consoledot` — HCC platform services (Insights, FedRAMP)
- `#forum-ocp-release` — OCP release lifecycle, Product Life Cycles API
- `#sd-app-sre` — SRE operations for all OCM/HCC services
- `#ocm-osd-ui` — Inbound channel where backend teams (SRE, ROSA eng, CCS docs, AMS, platform), support (CEE/TAMs), and cross-team stakeholders reach the OCM UI team
- `#webrca-status-board-adoption` — WebRCA + Status Board
