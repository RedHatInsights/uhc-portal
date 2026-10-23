# Jira Bug Description Template

Use this template when filing or updating OCMUI bug tickets. Format as Atlassian Document Format (ADF) when creating via API.

## Description Sections

### Description / User Impact

Briefly describe how this bug is impacting users. Focus on the user's perspective, not technical details.

Example: "Users cannot create new clusters because the 'Create' button is unresponsive after selecting a region."

### Environment
Specify where the bug was observed:
- **Environment**: Production / Staging / Integration
- **URL**: Direct link to the affected page (if applicable)
- **Browser**: Chrome / Firefox / Safari / Edge / Any
- **OS**: macOS / Windows / Linux / Any

### Priority
Indicate suggested priority with justification:
- **Blocker**: Complete halt in critical functionality (login fails, white screens)
- **Critical**: Significant degradation, no workaround
- **Major**: Important features affected, complex workaround exists
- **Normal**: Moderate impact, straightforward workaround
- **Minor**: Minimal impact, cosmetic issues

### Steps to Reproduce
Numbered list of precise steps:
1. Navigate to \<page/URL\>
2. Perform \<action\>
3. Observe \<behavior\>

Include any prerequisites (specific cluster type, configuration, user role, etc.).

### Expected Result
What should happen when following the steps above.

### Actual Result
What actually happens — the buggy behavior observed.

### Attachments
Include relevant evidence:
- Screenshots showing the issue
- Screen recordings demonstrating the steps
- Console errors (browser dev tools)
- Network request/response (if API-related)

## Example

**Environment**: Staging  
**URL**: https://console.redhat.com/openshift/details/s/abc123#overview  
**Browser**: Any browser  
**OS**: Any OS  

**Priority**: Critical

**Steps to Reproduce**
1. Create or have an HCP cluster in Ready state
2. Create a machine pool with autoscaling enabled, min replicas = 0
3. Navigate to the cluster Overview page
4. Observe the "Machine pools" status in the details panel

**Expected Result**  
Machine pools status shows Ready (green check icon) since current replicas = 0 is within the valid autoscaling range.

**Actual Result**  
Machine pools status shows Pending (spinner icon) even though the cluster and all pools are healthy.

## Labels

Apply appropriate labels:
- `scrubbed` — after bug triage is complete
- `needs-uxd` — if UX design input is required
- `needs-backend` — if backend/API changes are required
- `regression` — if this worked previously
