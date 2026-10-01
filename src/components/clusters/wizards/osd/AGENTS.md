# OSD Wizard (OpenShift Dedicated)

> Fully TypeScript. Uses PatternFly `<Wizard>` + Formik at the top level. Creates OSD clusters on AWS or GCP with either Customer cloud subscription (CCS) or Red Hat cloud account infrastructure.

---

# Overview

## Steps

1. **Billing Model** (`BillingModel/`) — marketplace vs standard billing, subscription type (Annual, On-Demand, Free Trial)
2. **Cluster Settings** (expandable parent)
   - Cloud Provider (`ClusterSettings/CloudProvider/`) — AWS or GCP, CCS toggle, credential input
   - Details (`ClusterSettings/Details/`) — name, version, channel, region, FIPS, etcd encryption
   - Machine Pool (`common/ClusterSettings/MachinePool/`) — instance type, node count/autoscale, labels
3. **Networking** (expandable parent)
   - Configuration (`Networking/Configuration.tsx`) — network type, host prefix
   - VPC Settings (`Networking/VpcSettings/`) — existing VPC selection, subnets, security groups
   - Cluster Proxy (`Networking/ClusterProxy.tsx`) — HTTP/HTTPS proxy, no-proxy, CA bundle
   - CIDR Ranges (`Networking/CidrRanges/`) — machine/service/pod CIDR inputs
4. **Updates** (`common/ClusterUpdates.tsx`) — upgrade schedule (manual/automatic/cron)
5. **Review & Create** (`ReviewAndCreate/`) — summary, submit

## Key Files

| File | Role |
|------|------|
| `CreateOsdWizard.tsx` | Formik + Wizard orchestration, step definitions, submit handler |
| `CreateOsdWizardFooter.tsx` | Validation-aware Next/Back/Create footer |
| `constants.ts` | Step IDs, field IDs, initial values, URL paths per product variant |
| `formValidators.ts` | Per-step Formik validation schema |
| `OsdWizardContext.tsx` | Context for GCP Marketplace flow (carries external account info) |

## Product Variants

The same `CreateOsdWizard` handles 4 variants via `product` prop:
- **OSD AWS** — standard
- **OSD GCP** — standard
- **OSD GCP Marketplace** (`isOSDFromGoogleCloud`) — pre-selects GCP, disables billing model step
- **OSD Trial** — limited node count, no billing model step

## Node Limits

Worker node maximums are version-gated (from `clusters/common/machinePools/constants.ts`):
- **4.14.14+:** max 249 (when `MAX_NODES_TOTAL_249` gate enabled)
- **Pre-4.14.14:** max 180

## Known Tech Debt

- None significant — OSD wizard is the cleanest wizard code. Fully TypeScript, modern patterns.
- The shared `submitOSDRequest.js` it calls is still legacy JS (see parent `AGENTS.md`).

---

# Constraints

> The following sections use the **documentation router** pattern from the [Linux Foundation AAIF standard](https://www.linuxfoundation.org/blog/introducing-the-ai-agent-interoperability-framework) for AI-consumable project documentation. These headings are recognized by Cursor, Claude Code, Copilot, Codex, and 20+ AI coding tools. The nearest AGENTS.md to the code being edited takes precedence — like `.gitignore` scoping.

## Patterns to Follow

- **Use `useDispatch` directly** (no Redux `connect()` wrapper — unlike ROSA). Follow this pattern for any new dispatches.
- **Use `useFormState()` for form context**, never raw `useFormikContext()`.
- **Submit calls `submitOSDRequest.js`** from `../common/`. Changes there affect ROSA too — test both.
- **4 product variants share one wizard.** Gate variant-specific UI on the `product` prop, don't create separate components.

## Anti-Patterns (DO NOT)

- **Do NOT bypass `useFormState` with direct Formik context access.**
- **Do NOT create separate wizard components per product variant.** Use the `product` prop.

## Stop Conditions

- Changing billing model logic → understand the 4 product variants and which steps are skipped for each.
- Making a step conditionally visible → update `osdWizardFormValidator`.
- Touching `common/ClusterSettings/MachinePool/` → shared with ROSA and day-2 machine pool editing.

## Examples

- `CreateOsdWizard.tsx` — this entire file is the reference implementation for a clean wizard (TypeScript, declarative steps, `useDispatch`)
