# ROSA Wizard (Red Hat OpenShift Service on AWS)

> Mixed JS/TS — the main wizard and several screens are still `.jsx` (legacy). Classic and HCP are **not** separate wizards; branching happens via `isHypershiftSelected` after the first step.

---

# Overview

## Steps

1. **Control Plane** (`ControlPlaneScreen/`) — HCP vs Classic tile selection. Only shown when `HYPERSHIFT_WIZARD_FEATURE` gate is enabled.
2. **Accounts & Roles** (`AccountsRolesScreen/`) — AWS account, operator role ARNs, OIDC config
3. **Cluster Settings** (expandable parent)
   - Details (`ClusterSettings/Details/`) — name, version, channel, region, AZ, FIPS, etcd encryption, private cluster
   - Machine Pool (`MachinePoolScreen/`) — instance type, node count/autoscale, labels, taints, security groups
4. **Networking** (expandable parent)
   - Configuration (`NetworkScreen/`) — network type, host prefix
   - VPC Settings (`VPCScreen/`) — **hidden for HCP** (HCP requires existing VPC in Machine Pool step)
   - Cluster Proxy (`ClusterProxyScreen.jsx`) — proxy settings, CA upload
   - CIDR Ranges (`CIDRScreen/`) — machine/service/pod CIDR
5. **Cluster Roles & Policies** (`ClusterRolesScreen/`) — installer/support/worker role ARNs, managed policies toggle
6. **Additional Settings** (expandable parent)
   - Updates (`UpdatesScreen/` → `rosa/common/Upgrades/`) — upgrade schedule
   - Log Forwarding (`LogForwarding/`) — **HCP only** (when `HCP_LOG_FORWARDING` gate enabled)
7. **Review** (`ReviewClusterScreen/`) — full summary, `DebugClusterRequest` in dev

## Key Files

| File | Role |
|------|------|
| `CreateROSAWizard.jsx` | Formik + Wizard orchestration, step visibility, HCP branching |
| `index.js` | Redux `connect()` — injects `onSubmit` (wraps `submitOSDRequest`), quota, machineTypes |
| `constants.ts` | Field IDs, initial values (separate set for restricted env) |
| `rosaWizardConstants.js` | Step IDs, step names |
| `formValidators.ts` | Per-step validation (includes HCP log forwarding rules) |
| `CreateRosaGetStarted/CreateRosaGetStarted.tsx` | Prerequisites page at `/create/rosa/getstarted` (not part of wizard) |

## Classic vs HCP Branching

The same form renders both modes. Key differences:

| Concern | Classic | HCP |
|---------|---------|-----|
| VPC step | Shown — optional existing VPC | Hidden — VPC/subnet in Machine Pool step |
| Security groups | `SecurityGroupsSection` | `SecurityGroupsSectionHCP` |
| Etcd encryption | `EtcdEncryptionSection` | `HCPEtcdEncryptionSection` |
| Log forwarding | Not available | Dedicated step (S3/CloudWatch) |
| Worker node min | 2 | 2 per zone |
| Worker node max | 249 (4.14.14+), 180 (older) | 500 (4.15.15+/4.14.28+), 90 (older) |
| Availability zones | Multi-AZ optional | Always multi-AZ |

Node maximums are version-gated from `clusters/common/machinePools/constants.ts` + `utils.ts`. The `MAX_NODES_TOTAL_249` feature gate controls Classic/OSD 249 cap vs 180 fallback.

## ROSA-Specific Shared Code (`rosa/common/`)

Not the same as `wizards/common/` — ROSA-only helpers:
- `Upgrades/UpgradeSettingsFields.jsx` — upgrade schedule fields
- `NoConsoleRoleAlert.tsx` — missing AWS console access warning
- `PrerequisitesInfoBox.tsx` — inline prerequisite guidance

## Known Tech Debt

- **ROSA wizard still `.jsx`:** Main wizard, footer, and ~36 screen files are untyped JavaScript. OSD is fully TypeScript.
- **Redux `connect()` on entry:** `index.js` uses legacy `connect()`. OSD uses `useDispatch` directly.
- **Legacy `.jsx` migration targets:** `CreateROSAWizard.jsx`, `CreateRosaWizardFooter.jsx`, `NetworkScreen/`, `CIDRScreen/`, `ClusterRolesScreen/`, `ClusterProxyScreen.jsx`, `ReviewClusterScreen/`, `AccountsRolesScreen/AccountRolesARNsSection/`, `MachinePoolScreen/components/ScaleSection.jsx`, `VPCScreen/AWSSubnetFields.jsx`.

---

# Constraints

> The following sections use the **documentation router** pattern from the [Linux Foundation AAIF standard](https://www.linuxfoundation.org/blog/introducing-the-ai-agent-interoperability-framework) for AI-consumable project documentation. These headings are recognized by Cursor, Claude Code, Copilot, Codex, and 20+ AI coding tools. The nearest AGENTS.md to the code being edited takes precedence — like `.gitignore` scoping.

## Patterns to Follow

- **Use `useFormState()` for form context**, never raw `useFormikContext()`.
- **New step IDs go in `rosaWizardConstants.js`**, not `constants.ts` (that's for shared/OSD step IDs).
- **Feature-gated steps:** Use `useFeatureGate` and conditionally render the `<WizardStep>`. See `LogForwardingScreen`.
- **Submit goes through `submitOSDRequest.js`** (in `../common/`). It serves both ROSA and OSD despite the name.

## Anti-Patterns (DO NOT)

- **Do NOT create a separate wizard or route for HCP.** Classic and HCP share this wizard. Gate HCP-only features on `isHypershiftSelected`.
- **Do NOT bypass `useFormState` with direct Formik context access.**

## Stop Conditions

- Adding an HCP-only feature → confirm it's gated on `isHypershiftSelected`, not a separate route.
- Changing node limits → check both `constants.ts` in `clusters/common/machinePools/` AND the feature gate `MAX_NODES_TOTAL_249`.
- Touching VPC/subnet logic → Classic and HCP handle this in different steps (`VPCScreen` vs `MachinePoolScreen`).
- Validation change → update `formValidators.ts`. Hidden steps must not block validation.

## Examples

- `LogForwarding/` — reference for feature-gated, HCP-only step
- `ControlPlaneScreen/` — reference for tile-based selection with feature gate visibility
