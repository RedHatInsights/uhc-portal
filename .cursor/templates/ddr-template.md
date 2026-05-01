# DDR Template

Replace the guidance text in each section with content for the feature. For any bullet where no supporting data is available from Jira tickets, backend DDRs, or PRDs, write "N/A" rather than speculating.

---

## OCMUI DDR XXXX: \<Feature Title\>

### *\<One-sentence summary, e.g., "How we propose to expose AutoNode configuration in console.redhat.com"\>*

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

## What

A short summary of what decision this document is reaching and what components it touches.

## User Stories

Describe user stories for this change from the perspective of OCM UI end-users.

User stories provide context but do not replace business requirements. Business context belongs in the XCMSTRAT; architecture decisions belong in ADRs.

Keep user stories concise. If multiple stories share the same persona, state the persona once and use a grouped format:

*Example:*
- *As a ROSA HCP cluster administrator using console.redhat.com, I want to:*
  - *\<action 1\> so that \<outcome 1\>.*
  - *\<action 2\> so that \<outcome 2\>.*

## Why

Why this feature is relevant for customers using the UI.

Consider:
- **Feature origin** — customer request (which/how many?), internal need, or catching up with OpenShift
- **Reasoning** — how does this help the product?
- **Usage data** — do we have numbers? Related feature data?
- **Competitor analysis**
- **Feature availability** — why should this live in the UI? Does it exist in other consoles?

For any bullet where no supporting data is available from Jira tickets, backend DDRs, or PRDs, write "N/A" rather than speculating.

## How

Full overview of the proposed solution.

Guidelines:
- Concise and concrete; avoid opinions where possible
- Impact on existing codebase — significant refactoring needed?
- Impact on existing UX — significant changes needed?
- Required roles/permissions
- Error handling approach
- API support and potential gaps
- Testing strategy
- FedRAMP impact and rollout plan (independent vs. synchronized release)
- May include: diagrams, API specs, pseudo-code
- Avoid: copy/pasted Slack/email/Jira conversations, open questions, unclear or contradicting solutions

The DDR must pass the **"Author Vacation Test"** — any engineer with equivalent skill but no context must have enough information to implement the design by reading this document alone.

Wireframes or lo-fi mockups are helpful to outline the design (what information is displayed and where). If UXD team involvement is required, state that here — wireframes are then not needed. Hi-fi mockups should be avoided at this stage.

Wireframes should be hosted externally (e.g., as HTML files in `/mockups`) and linked here, not embedded directly.

### Tracking

Metrics to track as part of this feature. We use Segment → Amplitude for feature usage tracking. Segment data is mandatory for all new features.

## References

- Follow-up Jira tickets
- Impacted Jira tickets
- Related design documents
- External documentation
- Test plans

## Alternatives

Potential alternative approaches investigated during design. Explain why the proposed solution in "How" is preferred over each alternative. Include the impact of not doing this work.

## Acceptance Criteria

Required only if the DDR affects more than one domain (OCM, HCC, ACM, etc.). List the domain areas and required acceptance from each domain owner.

## Reviews

| Reviewed by | Date | Notes |
| :--- | :--- | :--- |
| | | |

**Review SLA:**
- The DDR author assigns a comment to area owners, triggering a **72-hour SLA**. Re-reviews reset the SLA.
- If the SLA is breached, the author escalates to management.
