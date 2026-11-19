---
name: ocmui-refinement
description: >-
  Assist with OCMUI feature refinement and DDR (Design Decision Record) creation,
  and breaking accepted DDRs into implementation stories.
  Use when the user mentions DDR, refinement, OCMUI epic, feature refinement,
  OCMUI ticket, implementation stories, or asks to refine a Jira ticket for the OCM UI.
---

# OCMUI Refinement Assistant

Guide a developer (including first-timers) through refining an OCM UI feature:
discover requirements up the Jira hierarchy, teach the feature, draft a DDR, create
mockups, and break an accepted DDR into implementation stories.

The user typically starts with a spike or epic link, e.g.:

> Help me refine https://redhat.atlassian.net/browse/\<UI-SPIKE-OR-EPIC\>

## Audience and tone

- Assume the user may be new to OCMUI refinement.
- Be hand-holding at phase boundaries: say what you found, what is missing, and what
  happens next. Wait for confirmation before advancing phases.
- Do not ask the user for information Jira (or linked docs) already contain — discover
  it, then confirm.

## Progress UX (required)

Orient the user on **every** assistant reply. Phases are numbered **1–6** (no Phase 0).

### Step A — Friendly roadmap gate (before Phase 1)

When the user asks to refine a ticket, **reply immediately** with a short friendly
message and the roadmap. **Do not call tools or start discovery yet.**

Never write refinement files into the uhc-portal git tree. All skill outputs go under
user-supplied **`draft_ddr_dir`**.

#### A.1 First reply — roadmap + ask for `draft_ddr_dir`

```markdown
Sure! I can help refine <ISSUE_KEY>. Here are the steps we'll go through:

## Refinement roadmap
- **Phase 1 — Intake:** Discover Jira hierarchy, PRD/ADR/siblings; confirm sources.
- **Phase 2 — UI Overview:** Analyse confirmed docs; summarize UI / API / CLI impact.
- **Phase 3 — Codebase analysis:** Map affected wizards, Day 2 views, and API hooks.
- **Phase 4 — Mockups:** Optional lo-fi HTML under `draft_ddr_dir/mockups`.
- **Phase 5 — Draft DDR:** Write `<JiraID>_Draft_DDR.md` under `draft_ddr_dir`.
- **Phase 6 — Stories:** After DDR acceptance, update the epic and create child stories.

After Phase 3 you can choose: mockups before DDR, DDR before mockups, or skip mockups.

**Draft DDR directory (`draft_ddr_dir`):** Where should I create notes, mockups, and
the draft DDR? Reply with an absolute path **outside** the uhc-portal repo, e.g.
`/Users/<you>/repos/work/Refinements/<feature-slug>`
```

Footer Waiting on: `draft_ddr_dir path`

#### A.2 After the user provides a path — show layout + confirm

Immediately reply with the layout using **their actual path** (no tools yet). Use
one-line `#` comments on every row. Example shape:

I'll use this `draft_ddr_dir` layout:

```text
/Users/…/Refinements/<feature-slug>/
├── mockups/                           # Phase 4 lo-fi HTML mockups
├── <FeatureOrKey>_Refinement_Notes.md # Phase 2+ working notes (not the DDR)
└── <JiraID>_Draft_DDR.md              # Phase 5 draft DDR
```

**Use this `draft_ddr_dir`?** Reply `Y` / `yes` to create it (if needed) and start
**Phase 1 — Intake**. Reply `N` to give a different path.

Substitute real `<FeatureOrKey>` / `<JiraID>` guesses from the ticket when known;
otherwise keep placeholders and note they will be finalized in Phase 1.

Footer Waiting on: `confirm draft_ddr_dir Y/N`

#### A.3 On `Y` — prepare `draft_ddr_dir` and start Phase 1

Only after `Y` / `yes`:

1. **If `draft_ddr_dir` does not exist** — create it (and `mockups/`).
2. **If `draft_ddr_dir` already exists** — reuse that path, but treat this as a
   **fresh run**: delete/clear its contents (notes, draft DDR, `mockups/`, and any
   other files left from a prior run) so Phase 1 starts clean. Briefly tell the
   user you wiped the directory for a new run.
3. Remember the path as `<draft_ddr_dir>` for the session.
4. Begin **Phase 1 — Intake** (there is no Phase 0).

On `N`, ask for a new path and repeat A.2. Never default to the uhc-portal workspace.

### Step B — Narrated status while working (every discovery/analysis turn)

While fetching tickets/docs/code, keep the user oriented with short status lines
(Cursor’s step summaries count). Prefer concrete narration, e.g.:

- “Fetching the ticket hierarchy.”
- “Walking up to the feature and discovering sibling epics and linked docs.”
- “Pulling PRD/ADR links from the feature and checking sibling refinement spikes.”

During **Phase 1**, do **not** narrate scanning for DDR drafts or `mockups/` — those belong
to later phases under `<draft_ddr_dir>`.

Always do this during Phase 1+ tool work — never go silent for long stretches.

### Phase title (every phase reply after the roadmap gate)

Start the main body with an explicit H2. Use these **exact** phase names everywhere
(tables, “Proposed sources”, checkpoints, footers) — do not invent aliases like
“teach-in”, “feature briefing”, or “later DDR”:

```markdown
## Phase 1 — Intake: hierarchy & source discovery
## Phase 2 — UI Overview
## Phase 3 — Codebase analysis
## Phase 4 — Mockups
## Phase 5 — Draft DDR
## Phase 6 — Implementation stories
```

If a phase spans multiple replies, keep the same Phase title and optionally add a
subtitle (`### What`, `### How`).

### ASCII Jira hierarchy (required in Phase 1+)

Always show a compact ASCII map of the resolved chain (and keep it in later phases
when useful):

```text
<REFINE-SPIKE> (UI refine spike)
└── <UI-EPIC> ([OCM UI] epic)
    └── <FEATURE> (feature)
```

Replace placeholders with real keys/summaries. If the user started from the epic or
feature, still show the full useful chain.

### Progress footer (every reply after the roadmap gate)

End every reply with a footer. Use **words**, not empty checkbox glyphs:

| Marker | Meaning |
|---|---|
| `done` | Phase finished |
| `⚡ current` | Phase in progress (this reply) |
| upcoming phases | Listed by number/name only (not started) |

```markdown
---
**Progress:** done 1 Intake · ⚡ **2 UI Overview (current)** · 3 Codebase · 4 Mockups · 5 DDR · 6 Stories
**Waiting on:** <one line — e.g. confirm sources / review UI Overview / approve Jira creates>
```

If the user skips or reorders mockups/DDR, keep the phase **names** stable and note the
chosen order in **Waiting on** (e.g. `DDR first; mockups deferred`).

Roadmap-gate reply (before Phase 1 starts):

```markdown
---
**Progress:** (not started) 1 Intake · 2 UI Overview · 3 Codebase · 4 Mockups · 5 DDR · 6 Stories
**Waiting on:** `draft_ddr_dir` path   # then, after path: confirm draft_ddr_dir Y/N
```
## Portability (no personal Cursor setup required)

This skill must work for any teammate who has:

1. This skill package (`SKILL.md` + `templates/`)
2. A uhc-portal checkout (for Phase 3 `src/` reads)
3. Jira credentials as env vars **or** Atlassian MCP

**Do not depend on** the author’s personal Cursor rules, `session-context`,
`~/ocmui-tokens.sh` layout, `gog`, Slack MCP, or `~/.cursor/ocmui-templates/`.
Those may exist on one machine and change agent tone/tools, but they are **not**
part of this skill’s contract.

| Need | How (portable) |
|---|---|
| Jira | `$JIRA_EMAIL` + `$JIRA_TOKEN` via curl **or** Atlassian MCP |
| DDR / Jira story structure | `templates/` **inside this skill directory only** |
| Feature PRDs / Google Docs | Links from Jira + user excerpts in chat (no `gog` required) |
| Outputs | User-supplied `draft_ddr_dir` outside uhc-portal |

If personal rules conflict with this skill (e.g. old template paths), **follow this
skill** for refinement workflows.

## Prerequisites

| Dependency | Purpose | Required? |
|---|---|---|
| Jira access | Read feature hierarchy; create/update OCMUI / team UI tickets | Yes |
| `gh` CLI | Optional lookups in `openshift-online/ocm-api-model` | Recommended |
| uhc-portal workspace | Read-only codebase analysis (`src/`) | Yes for Phase 3 |
| Draft DDR directory | All skill-written notes / mockups / draft DDR | Yes (user-supplied path) |

**Jira access — MCP is optional, not required.** Either path works:

1. **Atlassian / Jira MCP** (if the user’s Cursor setup has it) — preferred when available
2. **Jira REST API** via `curl` with `$JIRA_EMAIL` and `$JIRA_TOKEN` — always a valid
   fallback; do not fail Phase 1 just because MCP is missing

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  -H "Content-Type: application/json" \
  "https://redhat.atlassian.net/rest/api/3/issue/<ISSUE_KEY>?fields=summary,description,status,issuetype,parent,issuelinks,labels,components,attachment,comment"
```

**If neither path works** (MCP missing / auth errors, and `$JIRA_EMAIL`/`$JIRA_TOKEN`
unset or rejected): **stop Phase 1**. Do not invent ticket content. Tell the user to
set up one of:

- **Env vars (simplest):** create an Atlassian API token at
  https://id.atlassian.com/manage-profile/security/api-tokens , then export
  `JIRA_EMAIL` (Red Hat email) and `JIRA_TOKEN` in the shell Cursor inherits
  (e.g. `~/.bashrc` / a sourced tokens file). Re-open the chat and retry.
- **Atlassian MCP:** follow **AGENTS.md → MCP Integrations → Jira MCP** in this
  repo (uv, wrapper script, `~/.cursor/mcp.json`), restart Cursor, then retry.

Point them at that AGENTS section rather than pasting a full MCP install into chat.
Wait for confirmation that access works before continuing Intake.

**Requirement docs:** Prefer links discovered from Jira (remote links, descriptions,
comments) or links the user provides in chat. Do not use a `support_docs/` folder.
If a linked Google Doc cannot be read automatically, ask the user for access, a
shareable summary, or key excerpts **in chat** — never require them to drop files
into the repo or `draft_ddr_dir`. Do not hardcode Drive folder or doc IDs.

**DDR drafting:** Only in **Phase 5**, write
`<draft_ddr_dir>/<JiraID>_Draft_DDR.md`. Do not discuss draft file naming in
Phases 1–3.

## Jira project rules

| Prefix | Role |
|---|---|
| **OCMUI-** | OCM UI team tickets — create/update allowed |
| **ROSAENG-** (OCM UI team / UI epics & spikes) | Create/update only when the work is clearly UI refinement owned by the OCM UI team |
| **OCM-**, **ROSA-**, **CS-**, **SDA-**, etc. | Backend/platform — **read-only** |
| **HCMSTRAT-**, **OCPSTRAT-**, **XCMSTRAT-** | Strategy — **read-only** context |

Base URL: `https://redhat.atlassian.net`

## Templates (skill package)

Read templates from this skill directory (sibling of `SKILL.md`), not from personal paths:

```text
templates/
├── ddr-template.md
└── jira/
    ├── epic-template.md
    ├── story-template.md
    ├── task-template.md
    └── bug-template.md
```

## OCM API reference

When tickets or docs mention API types/endpoints, verify against the live contract.
Do not trust ticket text or stale TypeScript types alone. Flag discrepancies.

**OpenAPI (field-level):**

```bash
curl -s "https://api.openshift.com/api/clusters_mgmt/v1/openapi" \
  | python3 -c "import json,sys; schemas=json.load(sys.stdin)['components']['schemas']; [print(json.dumps(schemas[k],indent=2)) for k in sorted(schemas) if '<SEARCH_TERM>' in k.lower()]"
```

**API model repo (comments + canonical names):**

```bash
gh api repos/openshift-online/ocm-api-model/contents/model/clusters_mgmt/v1 \
  --jq '.[].name' | grep -i <search_term>

gh api repos/openshift-online/ocm-api-model/contents/model/clusters_mgmt/v1/<type_name>.model \
  --jq '.content' | base64 -d
```

Also check `accounts_mgmt`, `service_logs`, etc. when relevant.

## Draft DDR directory vs uhc-portal workspace

| Location | Role |
|---|---|
| **uhc-portal workspace** (`./src`, etc.) | **Read-only** for Phase 3 codebase analysis. **Never** write refinement notes, draft DDRs, or mockups here. |
| **`<draft_ddr_dir>`** (user-supplied absolute path) | **Only** place the skill creates/updates refinement files. |

Example: `/home/<you>/work/Refinements/<feature-slug>`

```text
<draft_ddr_dir>/
├── mockups/                           # Phase 4 lo-fi HTML mockups
├── <FeatureOrKey>_Refinement_Notes.md # Phase 2+ working notes (not the DDR)
└── <JiraID>_Draft_DDR.md              # Phase 5 draft DDR
```

- **`mockups/`** — Phase 4 only
- **`*_Refinement_Notes.md`** — Phase 2+ scratch (not the DDR)
- **`<JiraID>_Draft_DDR.md`** — Phase 5 only (do not mention in Phases 1–3)

Do **not** create or mention a `support_docs/` folder.

### Fresh run — clean `draft_ddr_dir`

Each time the user confirms `draft_ddr_dir` with `Y` for a refinement run:

| Situation | Action |
|---|---|
| Directory missing | **Create** it (+ `mockups/`) |
| Directory exists | **Reuse** the path, but **erase all contents** first, then continue |

Do not merge or resume prior notes/drafts/mockups. Say briefly that the directory
was cleared for a new run. Only skip the wipe if the user explicitly asks to
preserve or diff against existing files.

---

## Workflow overview

After the user confirms `draft_ddr_dir` (`Y`), follow phases **1–6** in order.
Each phase ends with a user checkpoint. All file writes go under `<draft_ddr_dir>`.

| Phase | Goal | Gate |
|---|---|---|
| 1 | Resolve hierarchy, discover docs/siblings, confirm sources | User confirms materials |
| 2 | Analyse confirmed sources → **UI Overview** (UI / API / CLI impact) | User confirms understanding |
| 3 | Codebase analysis | User reviews findings; choose mockups↔DDR order |
| 4 | Mockups (optional; order is user choice) | User reviews or skips |
| 5 | Write `<JiraID>_Draft_DDR.md` | User reviews sections |
| 6 | Implementation stories (after DDR acceptance) | User approves Jira writes |

---

### Phase 1: Intake — hierarchy walk and source discovery

**Starts only after** the user confirms `<draft_ddr_dir>` with `Y` (Step A.3).

Narrate status while working (see Progress UX). Then present findings.

#### 1.1 Resolve the ticket chain

Walk **up** via `parent` / Epic Link until you identify:

1. **Refinement ticket** — often a Spike (“Create a DDR…”) with little feature content
2. **UI epic** — e.g. `[OCM UI] Epic for <FEATURE> — …` (placeholder until refined)
3. **Feature ticket** — e.g. `ROSA-…`, `OSD-…`, `OCM-…` (requirements live here or in linked PRD)

**Always** render the ASCII hierarchy map (see Progress UX).

If the user pasted the feature or UI epic directly, adapt — still walk up to the
feature and down to siblings.

#### 1.2 Discover children and siblings of the feature

From the **feature** ticket, list child epics / linked work. Prefer JQL such as:

```text
parent = <FEATURE_KEY> ORDER BY key ASC
```

Also fetch `issuelinks` and **remote links** on the feature and on each relevant child.

Categorize siblings by name/prefix when possible:

| Kind | Typical title markers |
|---|---|
| OCM UI | `[OCM UI]` |
| OCM API / Cluster Service | `[OCM API]`, CS/OCM backend |
| ROSA CLI | `[ROSA CLI]` |
| OCM CLI | `[OCM CLI]` |
| Terraform | `[Terraform]` |
| CAPI/CAPA | `[CAPI`, `CAPA]` |
| Docs | `[Docs]`, OSDOCS |

For each useful sibling, fetch: summary, description, status, comments, remote links,
attachments, and notable child spikes/stories (especially closed/in-review refinement
spikes — they often contain CLI/API decisions the UI must match).

**Do not** surface auto-created UI-epic scaffolding (E2E automation, feature-flag
stubs, post-merge testing placeholders, etc.) in the intake summary — it adds noise
and confuses scope. Only mention those later in Phase 6 when creating stories (to
avoid duplicates).

#### 1.3 Discover requirement documents

Search automatically (do not wait for the user to attach them):

1. Feature description + Acceptance Criteria
2. Remote links titled PRD / ADR / design / refinement
3. Attachments on feature and sibling epics
4. Comments that link to Google Docs, GitHub design docs, or OpenAPI
5. Links the user provides in chat (docs, tickets, design URLs)

**Missing docs are normal.** If no PRD/ADR exists, say so clearly and continue with
feature description + sibling findings. Do not block Intake on a missing ADR.

#### 1.4 Present discovery checklist (checkpoint)

Output a structured summary, then **stop and wait**:

```markdown
## Phase 1 — Intake: hierarchy & source discovery

### Hierarchy
```text
<ISSUE> (role)
└── <PARENT> (role)
    └── <FEATURE> (feature)
```

### Discovered sources
```

Fill the sources table with **informative** Location and Status cells — not tool names.

| Column | Requirement |
|---|---|
| **Location** | Clickable link whose **label is the real title** (doc title, ticket summary), not a generic label like “Product Requirement Document”. |
| **Status** | Start with a **clear maturity/presence label**, then provenance + one-line note. Prefer provenance over tool names. |

**Status vocabulary for sibling / doc rows** (do **not** use vague “Strong”):

| Label | Meaning |
|---|---|
| **Found** | Doc/ticket exists and was read (add provenance) |
| **Not found** | Looked for; absent |
| **Partial** | Some signal, incomplete |
| **Placeholder** | Epic/ticket exists but no useful refinement content yet |
| **Refined (sibling)** | Sibling client already refined (spike done / story written) — useful for **UI parity**, not a score of “DDR readiness” |

Never use “Strong” / “Weak”. If you mean “this sibling is refined enough to inform UI parity,” say **`Refined (sibling)`**.

Example (good):

| Source | Location | Status |
|---|---|---|
| **PRD** | [PRD: \<actual doc title\>](https://docs.google.com/…) | **Found** (readable; remote link on \<FEATURE\>) |
| **ROSA CLI epic / spike** | [\<CLI-EPIC\>](…) → spike [\<SPIKE\>](…) → story [\<STORY\>](…) | **Refined (sibling)** — \<one plain-language open question\> |

Example (bad):

| Source | Location | Status |
|---|---|---|
| PRD | [Product Requirement Document](https://docs.google.com/…) | **Found** (via tool name) |
| ROSA CLI … | … | **Strong** — refined |

Template rows to populate (Phase 1 only):

| Source | Location | Status |
|---|---|---|
| PRD | *real title + link* | Found / Not found + provenance |
| Backend ADR | … | … |
| Feature description | … | … |
| OCM API epic / spike | … | … |
| ROSA CLI epic / spike | … | … |
| OCM CLI / Terraform / other | … | … |
| Open questions from siblings | … | … |

**Omit from Phase 1 entirely:**

- UXD / mockups / `/mockups` (Phase 4 produces mockups; absence is expected)
- `<JiraID>_Draft_DDR.md` / draft DDR file naming (Phase 5 only)
- Auto-created E2E / feature-flag scaffolding under the UI epic (Phase 6 only)

Then:

```markdown
### Proposed sources of truth
For **Phase 2 — UI Overview**:
- List the docs/tickets/links you will analyse next.

### Still needed from you
- Confirm the list above, **or** share any additional doc/ticket links
```

Ask: **Are these all the docs and content I should analyse for Phase 2 — UI Overview?**

**Do not** ask about draft DDR files or mockups here.

**Phase 1 stays discovery-only.** No deep PRD dumps, no full UI Overview before the
user confirms sources.

Only after confirmation, proceed to Phase 2. If the user provides extra docs, read
them first and update the source list.

---

### Phase 2: UI Overview

After the user confirms sources, analyse the agreed materials (PRD, feature,
sibling CLI/API/TF refinements, comments) and produce the **UI Overview** before
mockups or the DDR.

Write working notes to
`<draft_ddr_dir>/<FeatureOrKey>_Refinement_Notes.md`, derived from the feature
title or Jira key. **Overwrite** if it already exists (Fresh run policy).
**Never** name this file `DDR_Refinement.md` or write it into uhc-portal.
Scratch analysis only — not DDR-template content.

Prefer the terms **UI Overview** and **UI impact** — avoid “teach-in.”

Audience: an OCM UI developer. Lead with what changes in the **console**. Backend
internals belong briefly under API / open questions, not in the feature summary.

**Keep this skill generic:** do not bake in examples from whatever feature is
currently being refined. Always derive products, outs, CLI/API notes, and UI
surfaces from *that* ticket’s sources.

#### 2.0 UI Overview (required — lead with this)

Use this exact heading and cover each bullet (`Unknown` / `N/A` when missing —
do not invent):

```markdown
## UI Overview

- **Feature summary** — …
- **Customer context / pain** — …
- **Console scenarios** (feed User Stories only) — …
- **Products in scope** — …
- **Where in the UI** — …
- **Day 1 (cluster creation wizards)** — …
- **Day 2 (cluster details / post-create)** — …
- **CLI status** — …
- **API / Cluster Service status** — …
- **Other clients** — …
- **Open questions that block or shape UI** — …
```

##### Feature summary (customer / UI voice)

2–4 sentences. Answer: *What can a console user do that they cannot do today?*

- **Do:** Describe the user-visible capability and where they exercise it (create
  wizard, cluster details, settings, etc.), plus any product/version gate in plain
  language.
- **Don’t:** Lead with platform/backend implementation detail (internal resource
  names, cloud plumbing, operator internals). Save that for API / codebase phases.
- Light product constraints are OK (“\<product\> only”, “version \<N\>+\”) — not a
  platform essay.

##### Customer context / pain

Brief (bullets OK): who the end user is, what job they’re doing, and what hurts
today or why the feature was requested (from feature/strategy tickets — `Unknown`
if missing). This feeds DDR **Why** later.

##### Console scenarios (for User Stories — not a separate DDR “use cases” list)

Internally identify 2–5 console scenarios (Day 1 / Day 2). In the **DDR**, express
them only as **User Stories** — do **not** also add a “Primary UI use cases”
block under What (that duplicated User Stories in practice).

##### Products in scope (+ outs that need explanation)

State in-scope products clearly. When a PRD/feature lists **out-of-scope** items,
do **not** paste them as an unexplained comma list. For each out that a UI engineer
might wonder about, add:

1. **What it is** (one short clause — decode jargon)
2. **Why the source mentions it** (related / deferred / orthogonal)
3. **Why this UI epic can ignore it** (or how it still constrains UI)

Generic shape (fill from *this* feature’s sources only):

- **In:** \<products / versions\>
- **Out (and why):**
  - **\<out item\>** — \<what it means\>. Listed because \<reason from PRD/feature\>.
    UI impact: \<none / deferred / separate epic\>.

Skip outs that have zero UI relevance only if you can say so in one clause; otherwise
gloss them. Never hardcode a standing “outs” list in this skill.

##### Where in the UI / Day 1 / Day 2

Be concrete about console surfaces (wizard steps, tabs, modals, fields) using **UI**
vocabulary from the product (labels the user sees). Deeper file-level mapping is
Phase 3; here a best-effort surface list is enough, refined in codebase analysis.

##### CLI status (UI-eyes, human readable)

Write for a UI engineer aligning parity — not a CLI ticket dump.

Include:

1. **Plain-language contract** — what CLI will allow/change, and what the UI should
   mirror (or intentionally not).
2. **Refinement state** — one readable sentence + links (spike/story status).
3. **What UI should copy vs ignore** — shared validation/defaults/version rules;
   mark unknowns as open.
4. **Open questions** — full sentences a UI engineer can act on, not telegram
   shorthand (`"\<topic\>"` → “Should the UI \<behavior\>? \<why it matters for
   console\>”).

Bad: `Spike \<KEY\> (Review) → story … Open: \<word\>; \<word\>; \<word\>.`

##### API / Cluster Service status

Same readability bar: who owns validation/defaults, what the UI must not
re-implement, blockers in plain language + links.

Pull from *all* confirmed sources, not only the PRD.

#### 2.1 Deepen with three lenses (UI impact)

After the UI Overview, expand only where needed:

**(a) UI impact** — controls, validation, empty/edge states, warnings, out of scope
for UI (with why, glossed from sources).

**(b) UI ↔ API integration** — endpoints/resources; validation ownership; version
gates / flags / errors to surface; OpenAPI / `ocm-api-model` verification; gaps.

**(c) Consistency with CLI (and other clients)** — parity in UI terms; intentional
differences called out; shared open questions in full sentences.

**Checkpoint** — use this wording (adapt lightly, keep the invite to ask questions):

> Does this **Phase 2 — UI Overview** match your understanding? I can expand on any
> item — now is a good time to ask questions so you're clear before we move on.
> When you're ready, say yes and we'll continue to **Phase 3 — Codebase analysis**.

Update `<FeatureOrKey>_Refinement_Notes.md` with any corrections from the discussion.

---

### Phase 3: Codebase analysis

**Read** UI code from the uhc-portal workspace (`./src`). **Write** analysis only
into `<draft_ddr_dir>/…_Refinement_Notes.md` — never create files under uhc-portal.

Using Phase 1–2 context:

1. Affected product paths
2. Affected lifecycle stages (Day 1 / Day 2)
3. Existing components, hooks, routes, and patterns to reuse or change
4. Current API integration points vs required contract
5. **Discrepancies worth flagging** — ticket vs code vs PRD/CLI conflicts, shared
   components that widen product scope, missing API fields, etc.

Append a **Codebase Analysis** section to `<FeatureOrKey>_Refinement_Notes.md`.

Carry every discrepancy forward: in **Phase 5** they become draft DDR
**Open Issues** (what / why it matters for UI / next step). Do not drop them after
Phase 3.

**Checkpoint — choose Phase 4 / 5 order:**

```markdown
Phase 3 is done. Next you can:
1. **Phase 4 — Mockups first**, then **Phase 5 — Draft DDR** (good if you want to "see" the UI before writing)
2. **Phase 5 — Draft DDR first**, then **Phase 4 — Mockups**
3. **Skip mockups** → go straight to **Phase 5 — Draft DDR**
```

Wait for the user’s choice before continuing. Default roadmap order is mockups then
DDR, but never force mockups.

---

### Phase 4: Mockups

Optional. Run when the user chose mockups-first, DDR-then-mockups, or asks for them.

- HTML files under `<draft_ddr_dir>/mockups/` per view
  (e.g. `day-1-wizard.html`, `day-2-machine-pools.html`)
- PatternFly look and feel; happy path + edge cases
- PatternFly AI guidance: https://github.com/patternfly/ai-helpers/blob/main/docs/guidelines/ai-prompt-guidance.md

If mockups run **before** the DDR, keep them lo-fi and treat them as design input for
Phase 5. When the draft DDR is written, link mockups only from **References**
(first bullet) — never as a How/Mockups section. Prefer a shareable URL if the user
has one; do not paste local `draft_ddr_dir` filesystem paths into the DDR.

Do not treat “no existing mockups in Jira” as a Phase 1 gap — this phase creates them.

---

### Phase 5: Draft DDR

Create **one** file under the draft DDR directory (no Google Doc workflow):

```text
<draft_ddr_dir>/<JiraID>_Draft_DDR.md
```

Use the UI epic key when known (else the refine-spike key), e.g.
`…/ROSAENG-69928_Draft_DDR.md`. **Overwrite** if it already exists from a prior run.

**DDR structure SoT at draft time:** this skill’s `templates/ddr-template.md`.
Apply that file’s section guidelines when drafting (including How’s “Guidelines”
list). Do **not** auto-fetch or auto-sync the live Google Doc on every run.

Official blank DDR template (human / maintainer reference — not required at
runtime):
https://docs.google.com/document/d/1QE1pgNfG-60Wve2ucAgefWShLFEZaB3mmj7U5d7-xjY/edit

- **Maintainers** occasionally re-sync `templates/ddr-template.md` from that gDoc
  when the team updates it (manual).
- **Without `gog` (or similar):** the skill **cannot** read Google Docs. Drafting
  still works from the packaged `templates/ddr-template.md`. If a *feature* PRD
  is a Google Doc link the agent can’t open, ask the user for excerpts in chat.

Draft from **Phase 2 — UI Overview** + **Phase 3 — Codebase analysis** (+ mockups
if Phase 4 already ran) + confirmed sources.

**Open Issues (required section):** Copy Phase 3 “discrepancies worth flagging” (and
any still-open parity/API questions that shape UI) into **Open Issues**. Each item:
what / why it matters for UI / proposed next step or owner. Use `N/A` only if none
remain.

**Rules:**

- **Template outline only.** Use exactly the `##` sections from
  `templates/ddr-template.md` (What, User Stories, Why, How, Tracking, References,
  Alternatives, Open Issues, Acceptance Criteria, Reviews). Do **not** invent extra
  top-level sections (e.g. Mockups). Do **not** invent persona/role sections that are
  not in the template. Under **How**, keep subheadings minimal and only for content
  structure (e.g. API usage) — never duplicate a later top-level section as a How
  subsection (especially **never** `### Tracking` under How; Tracking is only
  `## Tracking` once).
- Be concise; **do not repeat** concepts already covered in earlier sections
  (What → User Stories → Why → How). Why must not restate What’s use cases or
  feature definition at length.
- **No** uhc-portal file/path tables, component inventories, or “code touchpoints”
  in the DDR — that detail belongs in **Phase 6** Jira implementation stories
- **How → API usage** is required and must be **structured**, not a wall of text:
  - One **clearly separated** subsection (or headed block) **per API / operation**
    the UI calls (e.g. cluster create vs node-pool create vs node-pool patch)
  - For each: lead with a short **example request** (method + path + relevant JSON
    fields, including zeros / key payload shape), **then** 1 short paragraph on
    when the UI uses it, field meaning, and errors/gaps
  - Separate APIs visually (### headings or horizontal rules) — do not merge Day 1
    and Day 2 into one dense paragraph
  - Still **no** full OpenAPI schema dump and **no** uhc-portal code-path tables
- Day 1 / Day 2 surface and control behavior belongs in **How**, not under a
  “UI scope” blurb in **What**
- Only state what sources support; otherwise `N/A`
- Label assumptions that need team input
- **Never** add a standalone **Mockups** section in the DDR. If mockups exist, put
  them as the **first bullet under References**
- **Never** cite `draft_ddr_dir` local paths (refinement notes, local draft files) in
  the DDR — the published doc is a Google Doc with no access to those files
- **References** must not repeat header table links (Other docs, OCM Epic(s),
  Governing STRAT(s)/ADR(s), etc.) — only *additional* materials
- Omit the template’s **Prerequisites (LLM)** section from the filled draft

#### Customer context (team expectation)

Team consensus: **What**, **User Stories**, and **Why** must reflect how customers
use the feature and why they asked — not only UI controls.

Synthesize from sources (gaps → `Unknown` / `N/A`; do not invent customers), then:

- **What** — short feature framing only
- **User Stories** — concrete console scenarios as stories (**single** place for that
  content; no separate “use cases” list in What)
- **Why** — pain/demand and origin, without restating the stories

Keep mechanisms and API detail for **How**.

#### Section guidance (abbreviated)

- **What** — 1–2 short paragraphs of feature framing. **No** “Primary UI use cases”
  list; **no** “UI scope” inventory (How).
- **User Stories** — **Concentrate** console scenarios here. One persona heading;
  concise bullets; do not invent roles; do not spam “As a cluster administrator…”.
- **Why** — **Short markdown table**: Guideline | Content. Official rows first
  (Feature origin, Reasoning, Feature usage, Competitor analysis, Feature
  availability). **Pain points / demand last**. `N/A` when empty; no rehash of
  What/User Stories.
- **How** — Apply `templates/ddr-template.md` How guidelines: concise/concrete;
  UX impact; permissions; **API usage** as separate per-API blocks (example call
  first, then brief discussion); errors; testing; FedRAMP/rollout. No
  Mockups/Tracking under How.
- **Tracking** — **Once**, as `## Tracking` only.
- **Open Issues / References / Alternatives / Acceptance Criteria / Reviews** —
  per template only

Present section-by-section for iterative review when helpful. For **What** /
**User Stories** / **Why**, invite corrections before locking the draft.

If mockups were deferred, offer **Phase 4 — Mockups** after the draft checkpoint.

---

### Phase 6: Implementation stories

Only after the DDR is **accepted** (reviewers LGTM).

1. Update the UI epic description using `templates/jira/epic-template.md`
2. Create child stories using `templates/jira/story-template.md`
3. Check for auto-created standard stories (post-merge testing, CI/E2E automation,
   feature flags) before duplicating — this is the **only** phase where that
   scaffolding is discussed
4. Prefer Day 1 / Day 2 split when both apply; use scope prefixes from the story template

**Jira create (example):**

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
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

Adjust project/issue type IDs if the UI epic lives under a different team project
(e.g. ROSAENG) — follow the epic’s project, not a hardcoded key.

Description must be valid ADF. Report each new issue key/URL. If delete is not
permitted via API, tell the user to delete mistakes in the Jira UI.

**Always get explicit approval before creating or updating Jira issues.**

---

## Example response shape

For a prompt like `Help me refine <spike-url>`:

**First reply (roadmap gate — no tools):**
1. Friendly ack + **Refinement roadmap**
2. Ask for **`draft_ddr_dir`** (absolute path outside uhc-portal)
3. Footer: Waiting on: `draft_ddr_dir path`

**After user sends a path (still no Phase 1 tools):**
1. Print the `draft_ddr_dir/` tree with `#` one-line comments (real path filled in)
2. Ask **Use this `draft_ddr_dir`?** `Y` / `N`
3. Footer: Waiting on: `confirm draft_ddr_dir Y/N`

**On `Y` → Phase 1 — Intake:**
1. Create `draft_ddr_dir` if missing, or wipe existing contents for a fresh run
2. Narrated status while fetching
3. `## Phase 1 — Intake: hierarchy & source discovery`
4. ASCII hierarchy map + discovered sources
5. Proposed sources for **Phase 2 — UI Overview**
6. Ask confirm sources; footer `⚡ 1 Intake (current)`

**After user confirms sources (Phase 2 — UI Overview):**
1. `## Phase 2 — UI Overview`
2. Write `<draft_ddr_dir>/<Feature>_Refinement_Notes.md`
3. Checkpoint + footer
