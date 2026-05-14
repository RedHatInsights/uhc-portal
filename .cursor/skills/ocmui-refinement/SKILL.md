---
name: ocmui-refinement
description: >-
  Assist with OCMUI feature refinement and DDR (Design Decision Record) creation,
  and breaking accepted DDRs into implementation stories.
  Use when the user mentions DDR, refinement, OCMUI epic, feature refinement,
  OCMUI ticket, implementation stories, or asks to refine a Jira ticket for the OCM UI.
---

# OCMUI Refinement Assistant

Refine OCMUI features, produce DDR documents, and break accepted DDRs into implementation stories. The user provides a Jira ticket ID; you gather context, analyze the codebase, draft the DDR, and create child Jira stories.

## Prerequisites

Ensure your tokens are configured as environment variables (`$JIRA_EMAIL`, `$JIRA_TOKEN`).
See `.cursor/setup-tokens.sh` for setup instructions.

## Jira Access

The OCMUI project lives on Atlassian Cloud. Use the REST API v3 for all Jira access.

**Important:** Only create or update **OCMUI-** tickets. Other project prefixes are read-only references:
- **OCMUI-** = OCM UI team tickets (we create/update these)
- **OCM-** = Backend API service tickets (read-only, referenced for API context)
- **ROSA-**, **CS-**, **SDA-** = Other backend/platform tickets (read-only)
- **HCMSTRAT-**, **OCPSTRAT-** = Strategy tickets (read-only, for context only)

**Base URL:** `https://redhat.atlassian.net`

**Fetch an issue:**

Use the environment variables `$JIRA_EMAIL` and `$JIRA_TOKEN`:

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  "https://redhat.atlassian.net/rest/api/3/issue/<ISSUE_KEY>?fields=summary,description,status,issuetype,parent,issuelinks,labels,components,attachment,comment"
```

Adjust `fields=` as needed. Descriptions are in Atlassian Document Format (ADF) — render to plain text.

**Available data per issue:**
- Summary, description, status, type, labels, components
- Parent link — one level up: OCMUI epic → ROSA/OCM feature ticket
- Linked issues (blocks, depends, relates, cloners)
- Attachments list and download URLs
- Comments

**Not accessible:** Google Docs or anything behind SSO that isn't the Jira API.

## OCM API Reference

When Jira tickets, support docs, or PRDs mention API types or endpoints, you **must** verify them against the live OCM API schema. Do not assume that types or fields described in tickets are accurate — always confirm against the published contract. Flag any discrepancies (missing fields, renamed types, fields not yet published, etc.) in your findings.

Look up the exact schema from these sources:

**OpenAPI spec** (preferred for field-level detail):

```bash
curl -s "https://api.openshift.com/api/clusters_mgmt/v1/openapi" \
  | python3 -c "import json,sys; schemas=json.load(sys.stdin)['components']['schemas']; [print(json.dumps(schemas[k],indent=2)) for k in sorted(schemas) if '<SEARCH_TERM>' in k.lower()]"
```

**OCM API model repo** (canonical type definitions with comments):

```bash
gh api repos/openshift-online/ocm-api-model/contents/model/clusters_mgmt/v1 \
  --jq '.[].name' | grep -i <search_term>
```

Then fetch the matching `.model` file:

```bash
gh api repos/openshift-online/ocm-api-model/contents/model/clusters_mgmt/v1/<type_name>.model \
  --jq '.content' | base64 -d
```

Use the exact field names, types, and descriptions from these sources in the DDR — do not rely solely on the TypeScript types in the uhc-portal codebase, as they may lag behind the API model.

## Workflow

The user provides an OCMUI Jira ticket ID (e.g., `OCMUI-4268`). Before starting, scan the working directory for:

- **`OCMUI DDR*.md`** — the DDR file for this feature. May be a fresh template or an existing draft. This is the file you fill in during Step 3.
- **`/support_docs`** — supplementary materials (PRDs, backend DDRs, design specs, etc.) that cannot be fetched via the Jira API. Always read everything here.

Follow these steps in order. Each builds on the previous.

### Step 1: Gather Context from Jira

Pull and synthesize all available Jira context automatically. Do not ask the user for information Jira already contains.

1. **Fetch the OCMUI ticket** — summary, description, status, links, attachments, comments.
2. **Fetch the parent feature ticket** — one level up (e.g., OCMUI-4268 → ROSA-17). This ROSA/OCM feature ticket contains the bulk of requirements and acceptance criteria. No need to go higher — strategy tickets (HCMSTRAT, OCPSTRAT) rarely have actionable UI detail.
3. **Fetch key linked issues** — from both the OCMUI ticket and its parent. Focus on:
   - Sibling OCMUI epics under the same parent (prior art / related UI work)
   - Backend or API tickets (OCM-, CS-, SDA-) defining the API surface
4. **Check `/support_docs`** — read all user-provided materials (PRDs, backend DDRs, etc.) and incorporate into analysis.
5. **Look up API schemas** — if any API types or endpoints are mentioned in the tickets or support docs, fetch the exact schema from the OCM API (see "OCM API Reference" above). Include the field-level detail in your findings.
6. **Note relevant attachments** — images, screenshots, diagrams on either ticket.
7. **Write findings to `DDR_Refinement.md`** in the working directory:
   - **Feature summary** — plain-language description
   - **Ticket hierarchy** — OCMUI epic and parent feature, with keys and summaries
   - **Linked issues** — grouped by relationship type
   - **API surface** — CLI commands, API endpoints, backend tickets defining what the UI must expose
   - **Open questions / gaps** — anything unclear, missing, or contradictory across the tickets. Do not flag the absence of UXD designs or mockups — those are created in Step 4 as part of this workflow

Wait for the user to review `DDR_Refinement.md` before proceeding.

### Step 2: Analyze the OCMUI Codebase

The UI codebase lives at `./src` (relative to workspace root).

Using Step 1 context, analyze the source to determine:

1. **Affected product paths** — ROSA HCP, ROSA Classic, OSD-GCP, OSD-AWS, BYOC or Red Hat Managed, or multiple?
2. **Affected lifecycle stages** — Day 1 (creation wizard), Day 2 (detail/edit views, machine pools, settings), or both?
3. **Existing components and patterns** — concrete files, components, hooks, API calls to change or reuse.
4. **API integration points** — current API endpoints for related features; new endpoints this feature requires.

Cross-reference with Jira context. Flag discrepancies (e.g., ticket scopes to ROSA HCP only but codebase has a shared component affecting OSD).

**Append a "Codebase Analysis" section to `DDR_Refinement.md`** — affected product paths, lifecycle stages, existing components/files, API integration points, discrepancies.

Wait for the user to review before proceeding.

### Step 3: Draft the DDR

Read the DDR template from [ddr-template.md](../../templates/ddr-template.md), then draft each section based on the combined Jira + codebase analysis.

**Drafting rules:**

- **Be concise** — do not repeat information across sections. State something once, where it belongs. For user stories sharing the same persona, state the persona once and group the actions beneath it.
- **Respect section boundaries** — "What" = decision and scope. "Why" = customer context, business justification, motivation. "How" = technical solution only. Do not put customer info or business reasoning in "How"; do not put implementation details in "Why".
- **No UI code** — only include code snippets for OCM API specs, or when UI code must change to accommodate a new/updated API contract. No React/TypeScript examples.
- **Only state what you know** — if no supporting data exists in Jira, backend DDR, or PRD, write "N/A". Applies especially to "Usage data", "Competitor analysis", etc.
- **Label assumptions** — anything not confirmed by Jira or code must be marked as an assumption needing team input.
- **Reference existing patterns** — point to analogous features in the codebase.
- **Wireframes** — lo-fi mockups encouraged. Host as HTML in `/mockups` and link from the DDR.

Fill in the `OCMUI DDR*.md` file in the working directory. If fresh, populate all sections. If existing draft, update and refine. Present section-by-section for iterative review.

**When finalized:** the user copies the Markdown into a Google Doc in the [OCMUI Refinement gDrive folder](https://drive.google.com/drive/u/0/folders/16ybpHxjl4uuc-9Bad4VSb6fIMZ2hBfC7).

### Step 4: Create Mockups

After DDR review, generate HTML mockups for the proposed UI changes.

- Separate files in `/mockups` per view (e.g., `day-1-wizard.html`, `day-2-detail.html`).
- Match OCM UI look and feel — use PatternFly components and styling.
- Cover happy-path and edge cases (empty states, validation errors, disabled states).
- If user provided screenshots, match the visual style closely.

For PatternFly guidance, see: https://github.com/patternfly/ai-helpers/blob/main/docs/guidelines/ai-prompt-guidance.md

The user will screenshot rendered mockups and embed them in the DDR Google Doc.

### Step 5: Create Implementation Stories

Once the DDR is **accepted** (all reviewers LGTM), break the epic into child implementation stories in Jira. The user provides the OCMUI epic key (e.g., `OCMUI-3028`).

#### Update the Epic Description

Before creating child stories, update the parent epic's description.

**Read the template:** [epic-description.md](../../templates/jira/epic-description.md)

Follow the template guidelines for structure and content. Remember to preserve any existing content that should be kept.

#### Create Implementation Stories

**Read the template:** [story-description.md](../../templates/jira/story-description.md)

Follow the template for:
- Story naming conventions (scope prefixes)
- Story breakdown strategy (Day 1 / Day 2)
- Description sections (Overview, Mockups, Acceptance Criteria, etc.)

**Note:** Standard stories (Post-merge testing, CI Automation, E2E Automation, feature flag stories) are auto-created when the epic is created. Check if they exist before creating duplicates.

#### Creating Stories via Jira API

Use the REST API to create child stories under the epic:

```bash
curl -s -u "$JIRA_AUTH" \
  -X POST "https://redhat.atlassian.net/rest/api/3/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": { "key": "OCMUI" },
      "issuetype": { "id": "10009" },
      "parent": { "key": "<EPIC_KEY>" },
      "summary": "<STORY_SUMMARY>",
      "description": <ADF_JSON>,
      "labels": ["ui-active-item"]
    }
  }'
```

All child stories (implementation and standard) use issue type **Story** (`"id": "10009"`).

The `description` field must be valid Atlassian Document Format (ADF) JSON — a `doc` node with `paragraph`, `heading`, `bulletList`, etc. child nodes. For standard stories, use `inlineCard` nodes to link to the parent epic.

**Note:** The Jira API token does not have delete permissions. If a story is created in error, the user must delete it manually via the Jira UI.

After creating each story, report the new issue key and URL to the user.
