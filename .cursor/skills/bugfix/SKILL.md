---
name: bugfix
description: >-
  Systematic bug scrubbing and resolution workflow for OCMUI Interruption Catcher duties.
  Use when the user mentions bug, bugfix, defect, scrub, reproduce, diagnose, 
  Interruption Catcher, or provides an OCMUI bug ticket to fix.
---

# Bug Fix Workflow for OCMUI/UHC Portal

Systematic bug scrubbing and resolution workflow for OCMUI Interruption Catcher duties. Guides through bug triage, reproduction, diagnosis, fix implementation, testing, and PR creation following UHC Portal team standards.

## Prerequisites

Ensure your tokens are configured as environment variables (`$JIRA_EMAIL`, `$JIRA_TOKEN`).
See `.cursor/setup-tokens.sh` for setup instructions. GitHub CLI should be authenticated: `gh auth status`

## Workflow Phases

Follow these phases in order. The user provides a Jira bug ticket (e.g., `OCMUI-1234`).

**Bug template:** When creating or improving bug descriptions, follow [bug-description.md](../../templates/jira/bug-description.md) for consistent formatting (Environment, Steps to Reproduce, Expected/Actual Result, etc.).

---

### Phase 1: Scrub

**Purpose**: Evaluate unscrubbed bugs from the Defect Manager Dashboard

**Process**:
1. Fetch the Jira ticket using REST API
2. Determine if it's really a bug (vs story/task)
3. Check reproducibility from description
4. Identify blockers (needs-uxd, backend dependencies)
5. Verify priority level:
   - **Blocker**: Complete halt in critical functionality (login fails, white screens)
   - **Critical**: Significant degradation, no workaround
   - **Major**: Important features affected, complex workaround
   - **Normal**: Moderate impact, straightforward workaround
   - **Minor**: Minimal impact
6. Recommend Jira updates (labels, priority, blocked status)

**Output**: Write findings to `artifacts/bugfix/scrub-report-{issue-key}.md`

**When to skip**: Jump to Phase 2 for already-scrubbed bugs, or Phase 3 for Blocker/Critical bugs.

Wait for user review before proceeding.

---

### Phase 2: Reproduce

**Purpose**: Systematically reproduce the bug

**Process**:
1. Parse bug report and extract key information
2. Identify environment requirements (local dev, staging, specific data)
3. Document minimal reproduction steps
4. Attempt reproduction with variations
5. Assess actual severity vs reported severity

**Output**: Append "Reproduction" section to scrub report, or write `artifacts/bugfix/reproduction-{issue-key}.md`

Wait for user confirmation before proceeding.

---

### Phase 3: Diagnose

**Purpose**: Perform root cause analysis

**Process**:
1. Locate relevant code in `./src`
2. Trace execution flow from user action to bug manifestation
3. Examine git history for recent changes (`git log --oneline -20 -- <file>`)
4. Form hypotheses and test them
5. Identify the specific code causing the issue
6. Assess impact: Are there similar patterns elsewhere?
7. Recommend fix strategy

**Output**: Write `artifacts/bugfix/root-cause-{issue-key}.md`

Wait for user review of diagnosis before implementing fix.

---

### Phase 4: Fix

**Purpose**: Implement the bug fix following UHC Portal standards

**Process**:
1. Create feature branch: `git checkout -b bugfix/OCMUI-{number}-{brief-description}`
2. Implement minimal code changes
3. Follow coding standards (reference `.cursor/rules/*.mdc` files):
   - TypeScript: Strict typing, proper interfaces, no `any`
   - React: Functional components, hooks, no inline functions in JSX
   - PatternFly: Use PatternFly components, no custom CSS
4. Run linters: `yarn lint && yarn prettier:fix`
5. Document implementation choices

**Output**: Modified code files + `artifacts/bugfix/implementation-{issue-key}.md`

---

### Phase 5: Test

**Purpose**: Verify the fix with comprehensive testing

**Process**:
1. Write unit tests (Jest + React Testing Library)
   - Follow `.cursor/rules/unit-test-rules.mdc`
   - Arrange-Act-Assert pattern
   - Test behavior, not implementation
   - Use proper query priorities (`getByRole` first)
2. Run coverage check: `yarn test-changes`
3. Create Playwright e2e tests if UI changes
   - Follow `.cursor/rules/playwright-e2e-tests-rules.mdc`
   - Page object pattern, extend `BasePage`
   - Use proper test tags (`@ci`, `@smoke`, `@day1`/`@day2`)
4. Perform manual verification

**Output**: New test files + `artifacts/bugfix/verification-{issue-key}.md`

---

### Phase 6: Document & PR

**Purpose**: Create PR and prepare Jira updates

**Process**:
1. Commit changes with message: `OCMUI-{number}: {brief description}`
2. Push branch: `git push -u origin HEAD`
3. Create draft PR using team template:
   ```bash
   gh pr create --draft --title "OCMUI-{number}: {description}" --body "$(cat <<'EOF'
   ## Summary
   {1-2 sentences describing the fix}

   ## Root Cause
   {Brief explanation of what was wrong}

   ## Changes
   - {List of changes made}

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Playwright tests added/updated (if UI changes)
   - [ ] Manual verification on local dev
   - [ ] `yarn test-changes` passes

   ## Jira
   {Link to OCMUI ticket}

   ## AI Attribution
   {If AI assisted, note here}
   EOF
   )"
   ```
4. Recommend Jira status transition: **To Do** → **Code Review**
5. Remind about review requirements: 2 dev + 1 QE approval

**Output**: Draft PR + `artifacts/bugfix/pr-summary-{issue-key}.md`

---

## Quick Reference

### Jira API

Use the environment variables `$JIRA_EMAIL` and `$JIRA_TOKEN`:

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  "https://redhat.atlassian.net/rest/api/3/issue/<ISSUE_KEY>?fields=summary,description,status,priority,labels,comment"
```

### Git Commands

```bash
# Create bugfix branch
git checkout -b bugfix/OCMUI-{number}-{description}

# Check recent changes to a file
git log --oneline -10 -- path/to/file.tsx

# Find who last modified a line
git blame path/to/file.tsx
```

### Testing Commands

```bash
# Run tests for changed files only
yarn test-changes

# Run specific test file
yarn test path/to/file.test.tsx

# Run Playwright tests
yarn playwright test --grep "test name"
```

### PR Requirements

- **DRAFT first**: Create as draft initially
- **Jira ticket in title**: `OCMUI-XXXX: Brief description`
- **Size limits**: Max 1000 lines or 30 files
- **Approvals**: 2 dev + 1 QE required

---

## References

- **Defect Manager Dashboard**: https://issues.redhat.com/secure/Dashboard.jspa?selectPageId=12358493
- **UHC Portal Repo**: https://github.com/RedHatInsights/uhc-portal
- **Original ACP Workflow**: https://github.com/RedHatInsights/ocmui-workflows/tree/ambient/session-0935813f-5ddb-4730-84b7-259016fb153e/bugfix
