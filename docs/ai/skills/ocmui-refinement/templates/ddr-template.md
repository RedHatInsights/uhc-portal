# OCMUI Design Document Template

Replace guidance with feature content. Where Jira / PRD / ADR data is missing, write
`N/A` rather than speculating.

**Draft-only note:** Working drafts may include an **Open Issues** section (from codebase
/ source discrepancies). Resolve or move those before treating the DDR as review-ready.
The official How guidance still says to avoid leaving open questions in a final DDR.

---

## OCMUI DDR \<KEY\>: \<Feature Title\>

### *\<One-sentence summary, e.g., "How we would like to propose and agree on designs"\>*

| Field | Value |
| :--- | :--- |
| **Date** | \<today's date\> |
| **Status** | Draft |
| **Status changed date** | \<today's date\> |
| **Status changed reason** | Initial draft |
| **Authors** | \<@Author(s)\> |
| **Sponsor** | \<@Sponsor — must be a Team Lead or Staff Engineer\> |
| **Governing ADR(s)** | \<ADR link\> |
| **Governing STRAT(s)** | \<XCMSTRAT or SDSTRAT links\> |
| **OCM Epic(s)** | \<Jira ticket link(s)\> |
| **Other docs** | \<links\> |
| **Slack Channel** (optional) | \<#channel\> |

## Prerequisites (Before you start a DDR — omit from final published draft)

Treat LLMs as a refinement tool, not an author. You own the content, structure, and
accuracy of the DDR.

**When writing**

- Use an LLM to help refine, clarify, reorganize, or provide a final review of your DDR.
- Do not let an LLM write the document end-to-end.
- Keep only LLM output that is clear, accurate, and useful. Discard anything that is
  sloppy, repetitive, padded, or confusing.
- Keep DDRs concise and slop-free so reviewers can focus on the decision, not the prose.

**When reviewing**

- Immediately reject any DDR (or refinement) that reads as LLM-generated slop—filler,
  repetition, vague abstractions, or unnecessary detail.

## What

<!-- GUIDANCE: Feature framing only (1–2 short paragraphs).
Do NOT list “Primary UI use cases” here — put console scenarios in User Stories.
Do NOT put “UI scope” / wizard-step inventories here (that is How).
Do NOT put Why justification or API/implementation detail here. -->

Short summary of what decision this document is reaching and what capability it
introduces for console users.

\<Link to a document about how to review a DDR\>

*Example: This design doc is proposing an implementation for BYO OIDC in ROSA.*

## User Stories

<!-- GUIDANCE: This is the single place for console scenarios (formerly “use cases”).
Prefer one persona group unless sources name others — do not invent roles. Avoid
repeating “As a cluster administrator” on every line; heading once, then bullets. -->

Describe user stories for this change from Managed OpenShift / UI console personas.

User stories provide context but do not replace business requirements (XCMSTRAT) or
SD-wide architecture (ADRs).

Keep concise. If multiple stories share a persona, state the persona once and group:

*Example:*
- *As a ROSA HCP cluster admin using console.redhat.com, I want to:*
  - *manage the existing htpasswd IDP so I can change users without recreating it.*
  - *switch release channel to EUS so I stay compliant and still get critical updates.*

## Why

<!-- GUIDANCE: Concise. Do not restate What or User Stories. Render as a markdown
table. Official guideline rows first; Pain points / demand LAST (extra context,
not a classic template sub-heading). N/A when empty; do not pad. -->

Why this feature matters for customers using the UI, without repeating What / User
Stories.

| Guideline | Content |
| :--- | :--- |
| **Feature origin** | Who asked? (customer / internal / catching up with OpenShift) |
| **Reasoning** | How this helps the product (outcomes, not mechanisms) |
| **Feature usage** | Numbers/data if any; else N/A |
| **Competitor analysis** | If known; else N/A |
| **Feature availability** | Why it belongs in the UI |
| **Pain points / demand** | *(last)* What is hard today; what drove the request |

Provide only information collected from these questions. Do not copy/paste or link
raw conversations inside this document.

## How

<!-- GUIDANCE: Proposal for reviewers — UI behavior + API contract.
Day 1/Day 2 surfaces and control behavior live HERE (not in What as “UI scope”).
DO NOT include file/path tables, component inventories, or story-level
implementation detail (that belongs in Jira implementation stories).
DO include ### API usage with one clearly separated block per API/operation.
Each block: (1) short example call (method, path, key JSON fields), then
(2) brief when/why/errors — not a wall of text; not a full OpenAPI dump.
DO NOT put Tracking here — Tracking is the following top-level section only. -->

Full overview of the proposed solution.

Guidelines:

- Concise and concrete; avoid opinions where possible
- Impact on existing UX — significant changes needed? (behavioral, not file lists)
- Required roles/permissions
- **API usage (required)** — one subsection per API/operation the UI uses. For
  each: example request first, then a short paragraph (when used, fields, errors /
  gaps). Visually separate APIs. No full schema dump; no code-path tables.
  Example shape:

  ### API usage

  #### Cluster create (`POST …/clusters`)
  ```http
  POST /api/clusters_mgmt/v1/clusters
  { "nodes": { "compute": 0 } }
  ```
  When the user chooses fixed size 0 on eligible HCP create… (1 short paragraph)

  #### Node pool update (`PATCH …/node_pools/{id}`)
  ```http
  PATCH /api/clusters_mgmt/v1/clusters/{id}/node_pools/{pool_id}
  { "replicas": 0 }
  ```
  Day-2 scale-to-zero… (1 short paragraph)
- Error handling (prefer surfacing API/CS errors when they own validation)
- Testing approach (high level)
- FedRAMP impact and rollout (independent vs synchronized release)
- May include: diagrams; short API field/endpoint callouts
- Avoid: copy/pasted Slack/email/Jira; unclear solutions; React/TS file maps;
  “code touchpoints” tables

Ultimately, DDRs must pass the **"Author Vacation Test"** for **design and API
contract** — implementers still break work into Jira stories for code-level detail.

If UXD involvement is required, state that in How. Do **not** add a standalone
**Mockups** section — link mockups from **References** (first bullet) when available.

## Tracking

<!-- GUIDANCE: Only appearance of Tracking in the DDR. Do not also add ### Tracking
under How. -->

Metrics for this feature. Segment → Amplitude for usage tracking and telemetry.
Segment data is **mandatory** for all new features and part of feature development.

## References

<!-- GUIDANCE: Only materials NOT already in the header table (Other docs, OCM
Epic(s), Governing STRAT(s)/ADR(s), etc.). Never link local draft_ddr_dir paths
(refinement notes, local markdown) — the published DDR is a Google Doc. -->

Related materials **not** already listed in the header, for example:

- Link to Mockup if available *(first bullet when mockups exist)*
- Follow-up Jira tickets
- Impacted Jira tickets
- Related design documents (if not in Other docs)
- External documentation providing context
- Test plans

## Alternatives

Optional. Alternatives investigated during design. Defend why **How** is preferred.
Explain impact of not doing the work / not taking the decision, if needed.

## Open Issues

<!-- DRAFT USE: Carry Phase 3 “discrepancies worth flagging” and other unresolved
source conflicts here. Each item: what / why it matters for UI / proposed next step
or owner. Resolve before review; use N/A if none remain. -->

Unresolved items that block or shape the UI decision (API gaps, product-scope
conflicts, parity questions with CLI/other clients, missing requirements).

## Acceptance Criteria

Required only if the DDR affects more than one domain (OCM, HCC, ACM, etc.). List
domains and required acceptance from each domain owner. Sponsor may also list
required actions, dependent designs, or groups to inform.

Skip if only one domain is affected.

## Reviews

As author, first assign **OCMUI Junior Staff** for review, then one person from
**OCMUI Senior Staff** and one from any team member in the reviewer table, and
`@` them so they are notified. Also post a Slack message to the reviewer list in
the team channel.

Anybody may review and provide feedback. Acceptance and rejection are reserved for
stakeholders in Acceptance Criteria.

| Reviewed by | Date | Notes |
| :--- | :--- | :--- |
| | | |

**Review SLA:**

- The DDR author assigns a comment to the appropriate area owners that triggers the
  **72-hour SLA**. Re-reviews reset the SLA.
- If the SLA is breached, the author escalates to management so the review is
  prioritised.

**Guidelines:** Multiple reviews from the same person go in different rows.
