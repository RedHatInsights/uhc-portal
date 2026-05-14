# Jira Epic Description Template

Use this template when creating or updating OCMUI epic descriptions. Format as Atlassian Document Format (ADF) when creating via API.

Based on the OCM UI Epics template.

## Sections

### Description

Includes the functionality from the perspective of the person who desires that functionality. Write as user stories where possible.

Consider answering:
- What are we trying to solve?
- Where did the request come from?
- Do we have usage data from other clients?
- Should it also live in the UI, if other clients already support it?

### Acceptance Criteria

A list of high-level conditions that must be met for considering the epic complete. They should not focus too much on details but instead capture the outcome of the epic.

Consider also if user analytics should be tracked and where when introducing new features.

### Mockups/Design

If the epic changes the UI, provide lo-fi mockups to document design decisions. If affecting multiple areas, mockups should document user flows and include architectural considerations.

If the epic does not affect the UI, use this section to document high-level design decisions.

### Out of Scope

Include any feature/functionality/task that will NOT be part of the epic scope.

### Testing Implications

Outline how to test the functionality at a high level. Identify key testing areas and note any areas that might be indirectly impacted by the changes.

### Implementation Notes

Provide information on:
- Involved API endpoints and how to use them (or if they need to be mocked initially)
- List of permissions/capabilities required
- High-level impact on existing code (e.g., opportunity for JS/TS conversion, legacy code refactoring, missing test coverage)

### More Information Needed

Anything that still needs to be clarified or decided.

## Guidelines

**Goal:** The team understands enough to break the epic down into smaller tasks/stories confidently. They can describe the work in their own words. The team clearly understands when the epic will be done.

**Avoid:**
- Technical discovery (a technical summary is OK if it helps roughly size an epic)
- Bucket, phased/milestone, or quarterly epics without a clear, well-defined scope or end
- Epics so small they only hold a single child item (these should be stories/tasks instead)
- Copy/paste conversations from Slack/email (if relevant, summarize and provide a link)
- Running refinement conversation (only a summary is needed in comments)

## Example

**Description:**
As an OSD or ROSA cluster administrator, I'd like to manage the existing htpasswd as an IDP, so that I can make changes instead of deleting and recreating the entire htpasswd each time I need to make a change.

**Acceptance Criteria:**
An administrator can do the following to an existing htpasswd:
- View all users (username only)
  - Sort by user name
  - Move through sets of users (pagination)
  - Filter by user name
- Add a new user
- Change the password for a user
- Delete a user
- Delete multiple users at once

**Out of Scope:**
- Uploading and/or downloading htpasswd files for editing/creating htpasswd
- View current passwords for an htpasswd user

**Testing Implications:**
Because this is implementing new functionality, new tests will need to be written.
