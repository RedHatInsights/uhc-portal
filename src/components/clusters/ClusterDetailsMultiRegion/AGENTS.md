# Cluster Details Page

> The main cluster detail view at `/openshift/details/s/:subscriptionId` — an 11-tab page showing all aspects of a single OpenShift cluster. This is the largest and most complex feature area in the codebase (~554 files).

---

# Overview

## What This Page Does

Displays and manages a single cluster across 11 tabs. Supports ROSA (Classic + HCP), OSD (AWS/GCP), ARO, and self-managed OCP. Each tab is effectively an independent sub-application sharing a common data layer and refresh mechanism.

**Glossary — `cluster.managed`:** `managed: true` = Red Hat manages the control plane (ROSA, OSD — both CCS and Red Hat-infra). `managed: false` = self-managed OCP (on-premise, bare metal, Assisted Installer). ARO is `managed: true` but often excluded separately because Azure manages its control plane.

## Key Files

| File | Role |
|------|------|
| `ClusterDetails.jsx` | **Orchestrator** — assembles data, computes tab visibility from ~15 boolean flags, renders all tabs, owns refresh cascade. God component (see Tech Debt). |
| `index.js` | Redux `connect()` wrapper — injects only `toggleSubscriptionReleased` (cluster ownership transfer). |
| `components/ClusterDetailsTop/ClusterDetailsTop.jsx` | Page header — cluster name, status badges, alerts, action buttons, `RefreshButton` (10s/60s auto-refresh), `ClusterStatusMonitor` (5s polling during provisioning/uninstalling). |
| `components/common/ClusterTabIds.ts` | `ClusterTabsId` enum for tab identification. |
| `clusterDetailsHelper.ts` | Refresh event types (`CLICKED`, `AUTO`, `NONE`) for parent-child refresh coordination. |

## Tabs

Tab visibility is computed in `ClusterDetails.jsx` from cluster state, product type, cloud provider, and capabilities.

| Tab | Directory | Visible When | Key Content & Actions |
|-----|-----------|-------------|----------------------|
| **Overview** | `Overview/` | Always | Cluster metadata, node counts, autoscaling, encryption, OIDC. Toggle delete protection, edit billing. `DetailsRight.jsx` has dense conditional rendering for 19+ field groups. |
| **Monitoring** | `Monitoring/` | Unmanaged only (self-managed OCP) | Health summary, firing alerts, node/operator status, resource charts. Read-only. |
| **Access Control** | `AccessControl/` | All non-archived | 6 sub-tabs: Identity Providers, Cluster Roles, OCM Roles, AWS Infrastructure Access, External Auth, Transfer Ownership. Very high complexity. |
| **Add-ons** | `AddOns/` | Managed, non-archived, not in install/pending | Add-on gallery with install/uninstall, parameter config, billing. React Query + Redux drawer + Formik. |
| **Cluster History** | `ClusterLogs/` | All non-archived with valid ID | Paginated service logs with filters. React Query. |
| **Networking** | `Networking/` | Managed, ready/updating/hibernating, AWS or GCP+CCS | Ingress config, CIDRs, VPC, proxy. Reuses wizard form components for ingress fields. |
| **Machine Pools** | `MachinePools/` | Managed, not archived, not transitional | Node/machine pool CRUD, autoscaling, labels/taints, security groups, kubelet config. Very high complexity. |
| **Support** | `Support/` | Managed with external cluster ID, not OSD Trial | Notification contacts (add/delete), support cases (read-only, links to Red Hat Portal). |
| **Update Settings** | `UpgradeSettings/` | Managed, not ARO, not archived | Upgrade strategy, node drain, version management, log forwarding (HCP ROSA). |
| **Add Hosts** | External (`AIHostsClusterDetailTab`) | Assisted Install clusters only | Federated component from Assisted Installer lib. |
| **Access Request** | `AccessRequest/` | `accessProtection.enabled` is true | SRE access request approval/denial. React Query. |

## Refresh Architecture (5 Coexisting Paths)

```
RefreshButton (10s/60s interval)
  └─ refreshClusterDetails()          ← RQ-only invalidation (queries/refreshEntireCache.ts)

ClusterStatusMonitor (5s polling when cluster in transition)
  └─ refresh()                        ← Full refresh (RQ + Redux cascade)

Manual refresh button click
  └─ refreshClusterDetails()          ← Same as auto-refresh (RQ-only)

refreshRelatedResources() (Redux cascade)
  └─ Dispatches: getUsers, getClusterRouters, getSchedules, fetchUpgradeGates,
     fetchClusterInsights, refetchClusterIdentityProviders, org quota, logs

Tab-local refresh
  └─ Individual tabs call their own refetch
```

`RefreshButton` uses RQ-only invalidation. `ClusterStatusMonitor` and initial mount use full `refresh()` (RQ + Redux). `anyModalOpen` pauses auto-refresh so re-renders don't reset form fields in open modals.

## Data Flow

Query hooks live in `src/queries/ClusterDetailsQueries/` (~100+ files), not in this directory. Main entry: `useFetchClusterDetails` chains subscription → cluster → permissions → inflight checks → limited support → upgrade gates.

On page load, ~35-45 API calls fire for a managed cluster. Tabs render with `hidden` (not unmounted), so all tab queries fire immediately — not lazily on tab selection.

## Known Tech Debt

- **God component:** `ClusterDetails.jsx` owns tab visibility, refresh orchestration, and all tab rendering.
- **Split refresh:** `RefreshButton` (RQ-only) vs `ClusterStatusMonitor` (full). Target: unify (SDA-2249).
- **Hidden tabs:** Most tabs mount on load, firing unnecessary API calls. Only `ClusterLogs` and `AIHostsClusterDetailTab` get `isVisible` prop.
- **`refreshRelatedResources()` decomposition:** Each tab should own its own refresh. Jira: SDA-2249.
- **Redux `connect()` on entry:** `index.js` wraps for a single action. Replace with `useDispatch`.
- **PropTypes:** `ClusterDetails.jsx` uses PropTypes. Target: convert to `.tsx`.
- **`DetailsRight.jsx`:** 19+ conditional field groups. Target: extract per-section components.

---

# Constraints

> The following sections use the **documentation router** pattern from the [Linux Foundation AAIF standard](https://www.linuxfoundation.org/blog/introducing-the-ai-agent-interoperability-framework) for AI-consumable project documentation. These headings are recognized by Cursor, Claude Code, Copilot, Codex, and 20+ AI coding tools. The nearest AGENTS.md to the code being edited takes precedence — like `.gitignore` scoping.

## Patterns to Follow

- **New data fetching:** Create a React Query hook in `src/queries/ClusterDetailsQueries/` following `useFetch[Resource]` naming. The Redux layer is legacy and being migrated away.
- **New tab content:** Add a component under `components/`, add a `ClusterTabsId` enum value, add visibility logic and `TabContent` in `ClusterDetails.jsx`.
- **Mutations:** Use React Query `useMutation`. See `useDeleteMachinePool.ts` or `useAddClusterAddOn.ts`.
- **Modal state:** Use Redux `modalActions.openModal(modalId)` / `closeModal()` for modals that need to pause auto-refresh (anything with form fields). Use local state for simple confirmation dialogs.
- **Feature gates:** Use `useFeatureGate('FEATURE_NAME')` from `~/queries/featureGates/useFetchFeatureGate`. Gate constants are in `~/queries/featureGates/featureConstants.ts`.
- **Testing:** Co-locate tests in `__tests__/`. Test the unconnected component, not the Redux wrapper.

## Anti-Patterns (DO NOT)

- **Do NOT add new Redux reducers or actions for data fetching.** Use React Query. The Redux layer is legacy.
- **Do NOT add new dispatches to `refreshRelatedResources()`.** Tech debt tracked by SDA-2249. New data sources must use React Query with their own invalidation.
- **Do NOT add new responsibilities to `ClusterDetails.jsx`.** It is a god component (~800 lines) with one prop (`toggleSubscriptionReleased` from Redux `connect()`), ~10 `useGlobalState` selectors, refresh orchestration, and all 11 tab renders. Push new state and logic down to tab components or extract into hooks.
- **Do NOT import from `wizards/` in tab components.** Machine Pools does this and it's tech debt, not a pattern. Dependency flows one way: wizards → cluster details, never reverse.
- **Do NOT use `lodash/get`.** Use optional chaining. Existing `get()` calls are legacy.
- **Do NOT "fix" the split between `RefreshButton` and `refresh()` without understanding the 5-path model** in the Overview section. They are intentionally different (for now).

## Stop Conditions

- Modifying `ClusterDetails.jsx` beyond adding a tab → extract a hook first.
- Adding a new Redux reducer → use React Query instead.
- Change touches more than 2 tabs in a single PR → split the work. Each tab is an independent sub-app.
- Refresh behavior seems wrong → read the 5-path refresh section in Overview before changing anything.

## Examples

- `useFetchLimitedSupportReasons.ts` — clean React Query hook pattern
- `useDeleteMachinePool.ts` — standard mutation + cache invalidation
- `useFetchMachineOrNodePools.ts` — query hook used across multiple tabs (deduplication via shared cache)
