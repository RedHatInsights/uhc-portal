# Cluster Creation Wizards

> Multi-step PatternFly Wizard forms for creating OpenShift clusters. Covers ROSA (Classic + HCP) and OSD (AWS + GCP). ~337 files total. OCP/self-managed flows live elsewhere (`../CreateClusterPage/`, `../RegisterCluster/`).

---

# Overview

## Directory Layout

| Directory | Files | Purpose |
|-----------|-------|---------|
| `rosa/` | ~154 | ROSA Classic + ROSA HCP — one wizard, two control-plane modes. See [`rosa/AGENTS.md`](rosa/AGENTS.md). |
| `osd/` | ~78 | OpenShift Dedicated (AWS, GCP, GCP Marketplace, Trial). See [`osd/AGENTS.md`](osd/AGENTS.md). |
| `common/` | ~87 | Shared submit logic, form sections, review screens used by both |
| `form/` | ~12 | Reusable Formik field wrappers (`TextInputField`, `CheckboxField`, etc.) |
| `hooks/` | ~6 | Shared hooks (`useFormState`, `useClusterWizardResetStepsHook`) |

## Entry Points

| Product | Entry File | Route(s) | Redux wrapper |
|---------|-----------|-----------|---------------|
| **ROSA** (Classic + HCP) | `rosa/CreateROSAWizard.jsx` | `/create/rosa/wizard` | `rosa/index.js` — `connect()` injects `onSubmit`, quota, machineTypes |
| **OSD** (AWS, GCP, Trial) | `osd/CreateOsdWizard.tsx` | `/create/osd`, `/create/osdtrial`, `/create/osdgcp` | None — uses `useDispatch` directly |

**Glossary:**
- **`cluster.managed`:** Both ROSA and OSD create `managed: true` clusters (Red Hat manages the control plane).
- **Customer cloud subscription (CCS):** Customer provides their own cloud account credentials, vs "Red Hat cloud account" where Red Hat owns the infrastructure.

## Submit Flow

`submitOSDRequest.js` — despite the name, builds the Clusters Management API request body for **both** OSD and ROSA:

```
Formik onSubmit
  → submitOSDRequest(dispatch, params)(formValues)
    → createClusterRequest(params, formData, options)  // builds JSON body
    → upgradeScheduleRequest(formData)                 // optional schedule
    → dispatch(createCluster(request, schedule))       // Redux action → API
```

`createClusterRequest` is a large function of conditional logic mapping form values to the clusters_mgmt API schema — AWS/GCP differences, CCS vs Red Hat cloud, HCP fields, proxy, encryption, autoscaling, etc.

## Shared Code (`common/`)

| Directory/File | Used by | Purpose |
|----------------|---------|---------|
| `ClusterSettings/Details/` | OSD + ROSA | Version, channel, region, FIPS, etcd encryption |
| `ClusterSettings/MachinePool/` | OSD + ROSA (+ day-2 machine pool editing) | Instance type, node count, autoscale, labels |
| `NetworkingSection/` | OSD + ROSA | Default ingress fields, AZ selection |
| `ReviewCluster/` | OSD + ROSA | Review screen sections |
| `EncryptionSection/` | OSD + ROSA | KMS key location combobox |
| `VPCDropdown/` | OSD + ROSA | AWS VPC selection |
| `ClusterUpdates.tsx` | OSD directly; ROSA via `UpdatesScreen` | Upgrade schedule config |
| `utils/quotas.ts` | Both | Quota availability checks |
| `constants.ts` | Both | Shared `FieldId` enum for form field names |

## Cross-Feature Imports (Day-2 Components)

Wizards import from cluster details to maintain consistency between create and manage flows:

| What | Imported from | Used in wizard |
|------|---------------|----------------|
| Machine pool min/max node validation | `ClusterDetailsMultiRegion/.../machinePoolsHelper` | `common/ClusterSettings/MachinePool/` |
| Ingress popovers & load balancer constants | `ClusterDetailsMultiRegion/.../Networking/` | `common/NetworkingSection/`, `osd/Networking/` |
| Security groups components | `ClusterDetailsMultiRegion/.../MachinePools/` | `rosa/VPCScreen/`, `rosa/MachinePoolScreen/` |
| Quota model & selectors | `clusters/common/quotaModel`, `clusters/common/quotaSelectors` | Both wizards |
| Machine type selection | `clusters/common/MachineTypeSelection` | Machine pool steps |

## Known Tech Debt

- **`submitOSDRequest.js` naming:** Misleading — serves both OSD and ROSA.
- **`createClusterRequest` is very large:** Extensive conditionals for all product/provider combos. Should be decomposed per-product.
- **Day-2 imports create coupling:** Wizard screens importing from `ClusterDetailsMultiRegion/` means day-2 changes can break creation flows. No cross-flow test coverage.
- **Quota logic duplicated:** `common/utils/quotas.ts` and `clusters/common/quotaSelectors` compute availability from different data shapes.

---

# Constraints

> The following sections use the **documentation router** pattern from the [Linux Foundation AAIF standard](https://www.linuxfoundation.org/blog/introducing-the-ai-agent-interoperability-framework) for AI-consumable project documentation. These headings are recognized by Cursor, Claude Code, Copilot, Codex, and 20+ AI coding tools. The nearest AGENTS.md to the code being edited takes precedence — like `.gitignore` scoping.

## Patterns to Follow

- **Form state access:** Always use `useFormState()` hook, never raw `useFormikContext()`. The typed hook provides the correct generic.
- **Form fields:** Use wrappers in `form/` (`TextInputField`, etc.) or create a new one there.
- **New wizard steps:** Add step ID to `constants.ts` (OSD) or `rosaWizardConstants.js` (ROSA). Add `<WizardStep>` in the main wizard component.
- **Validation:** Add to `formValidators.ts` in the respective product directory. Validation is per-step, not global.
- **Feature-gated steps:** Use `useFeatureGate` and conditionally render the `<WizardStep>`. See `LogForwardingScreen` (HCP-only, gated).
- **Placement:** Shared between OSD and ROSA → `common/`. ROSA-only but shared between Classic and HCP → `rosa/common/`.
- **Data fetching:** Use React Query hooks in `src/queries/RosaWizardQueries/` or `src/queries/OsdWizardQueries/`.

## Anti-Patterns (DO NOT)

- **Do NOT create a separate wizard entry point for HCP.** Classic and HCP share one ROSA wizard. Gate HCP-only features on `isHypershiftSelected`, not a new route.
- **Do NOT modify `submitOSDRequest.js` without understanding it serves both OSD and ROSA.** A ROSA-only field still goes through this file.
- **Do NOT import wizard internals from day-2 (cluster details) components.** Dependency flows one way: wizards → cluster details, never reverse. Existing reverse imports are tech debt.
- **Do NOT bypass `useFormState` with direct Formik context access.**
- **Do NOT inline Formik `<Field>` with custom render props.** Use the wrappers in `form/`.
- **Do NOT add new Redux actions for wizard data fetching.** Use React Query.

## Stop Conditions

- Modifying `submitOSDRequest.js` → understand it builds requests for both products, test both.
- Making a step conditionally visible → update `formValidators.ts` — hidden steps must not block validation.
- Adding a ROSA-only feature → confirm whether it applies to both Classic and HCP, or gate on `isHypershiftSelected`.
- Touching `common/ClusterSettings/MachinePool/` → this affects both wizards AND day-2 machine pool editing.

## Examples

- `osd/CreateOsdWizard.tsx` — cleanest wizard orchestration (fully TypeScript, modern patterns)
- `rosa/LogForwarding/` — reference for feature-gated, HCP-only wizard step
- `common/ClusterSettings/Details/` — shared form section used by both products
