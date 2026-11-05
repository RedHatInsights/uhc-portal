# Jira Story Description Template

Use this template when creating implementation stories under an OCMUI epic. Format as Atlassian Document Format (ADF) when creating via API.

## Naming Convention

Prefix each implementation story summary with a bracketed scope tag:

| Scope | Prefix pattern | Examples |
|:---|:---|:---|
| ROSA HCP wizard | `[ROSA HCP Wizard]` | `[ROSA HCP Wizard] Add AutoNode settings to creation flow` |
| ROSA Classic wizard | `[ROSA Classic Wizard]` | `[ROSA Classic Wizard] Add proxy configuration step` |
| OSD GCP CCS wizard | `[OSD GCP CCS Wizard]` | `[OSD GCP CCS Wizard] Add Exclude namespace selectors section` |
| OSD AWS wizard | `[OSD AWS Wizard]` | `[OSD AWS Wizard] Add audit log forwarding` |
| Cluster Details page | `[Cluster Details, <Tab>]` | `[Cluster Details, Networking] Edit Application Ingress modal` |
| Machine Pools | `[Machine Pools]` | `[Machine Pools] Support AutoNode-managed pools` |

When a story spans multiple product paths, list them: `[ROSA HCP, OSD GCP]`.

## Description Sections

### User Story

> As a [user role], I want [feature] so that I can [benefit].

One or two sentences summarizing the user-facing goal.

Common user roles: OCM cluster administrator, ROSA cluster owner, OSD organization admin, SRE, platform engineer.

### Mockups

> _To be added_

Leave empty initially. The user or UXD will attach mockup screenshots later.

### Acceptance Criteria

Checklist of verifiable conditions:
- User can \<perform action\>
- If \<error condition\>, an error message is displayed: "\<message\>"
- Field validation: \<rules\>
- Warning/info alerts: \<conditions and text\>
- Tooltips / help popovers: \<content\>
- Segment tracking event fires on \<trigger\>

### Implementation Details

No source code, but provide enough technical context for any team member to start:
- Entry point file(s) or component(s) to modify
- Existing pattern to follow (e.g., "mirrors the existing Excluded Namespaces field")
- API endpoint(s) and payload shape
- Known constraints or gotchas

### Additional Resources

- Link to the DDR (Google Doc)
- Parent feature ticket (e.g., OSDGCP-31)
- RFE ticket (e.g., RFE-6424)
- Backend / API tickets
- Relevant documentation or KB articles

### More Information Needed (optional)

Include this section only if there are open questions or items that need clarification before implementation can begin. Omit if everything is clear.

## Story Breakdown Strategy

Each epic typically gets two categories of children:

**Implementation stories** (feature-specific):
1. **Day 1 story** — wizard / cluster creation flow changes
2. **Day 2 story** — cluster detail view and edit modal changes

If a feature only affects Day 1 or Day 2, omit the other. If the scope is large, split further (e.g., separate stories for read-only display vs. edit modal, or for different product paths).

**Standard stories** (6 total) are auto-created when the epic is created — do not create duplicates.
