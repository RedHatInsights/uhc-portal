# Jira Task Description Template

Use this template for non-user-facing technical work (refactoring, infrastructure, tech debt). Format as Atlassian Document Format (ADF) when creating via API.

A task is different from a story: tasks are technical work that doesn't directly change user-facing functionality.

## Description Sections

### Description

> So that [benefit], as a [developer/team], I want [work to be done].

One or two sentences explaining the technical goal and why it matters.

Example: "So that we can use hooks and more modern React components, as a developer, I want to convert a set of class components to functional components."

### Acceptance Criteria

A list of testable conditions that define when the task is complete:
- Specific files or components affected
- Measurable outcomes (e.g., "no class components remain in X directory")
- No change to user-facing behavior (if applicable)

### Additional Information

Any context that helps understand the work:
- Related tickets or prior art
- Common patterns or hooks to use
- Dependencies on other work

### Out of Scope

Explicitly state what is NOT part of this task to prevent scope creep.

### Implementation Notes (optional)

Technical approach if already known. Can be added during refinement.

### More Information Needed (optional)

Include only if there are open questions. Omit if everything is clear.

## Example

**Description:**
So that we can use hooks and more modern React components, as a developer, I want to convert a set of class components to functional components.

**Acceptance Criteria:**
- The following files no longer contain class components:
  - `src/components/clusters/install/InstallArmAWSUPI.jsx`
  - `src/components/clusters/install/InstallArmAzureIPI.jsx`
  - `src/components/clusters/install/InstallArmBareMetalABI.jsx`
- There is no change to how the components look and behave

**Additional Information:**
Common hooks (e.g., Redux's `useDispatch` and `useGlobalState`) will be used if necessary.

**Out of Scope:**
- Refactoring into TypeScript
- Refactoring unit tests into RTL
- Moving from Redux to React Query
