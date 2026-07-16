# Pre-Merge Testing Workflow

This workflow guides comprehensive pre-merge testing of pull requests and feature branches to identify functional bugs, regressions, and test coverage gaps before code reaches production.

## When to Use

Use this workflow when:
- Conducting pre-merge review and testing
- Finding all functional issues in a feature branch
- Auditing commits before merge
- Assessing regression impacts of code changes
- Validating test coverage for new features
- User says "pre-merge test", "review for bugs", or "find all functional issues"

## Workflow

### Step 1 — Identify scope

```bash
# List commits introduced by the feature branch (not yet in base)
git log <base-branch>..HEAD --oneline

# Get full diff of all changed files
git diff <base-branch>...HEAD
```

Ask the user for the base branch if not provided. Default to `main`.

### Step 2 — Collect context

For every file touched by the diff:

1. **Read the changed source file** to understand the before/after intent.

2. **Search for matching Playwright specs** (`playwright/e2e/`) and **unit tests** (`*.test.ts`) that cover the changed component or function. Use two passes:
   - **Direct match**: search for specs that import or reference the changed component or function by name.
   - **Route/page match**: identify the page or route the changed component belongs to (e.g. from its file path or parent component), then search `playwright/e2e/` broadly for any spec that navigates to the same page or route — even if it does not directly import the changed file. These indirect specs are high-risk for UI behaviour regressions.
   
   Read all matched specs and page objects (`playwright/page-objects/`) to understand what UI behaviour and assertions are currently expected.

3. **Read the PR description** if the user pastes it, or ask for it.

### Step 3 — Identify functional bugs, regression impacts, and E2E coverage bugs

Focus only on issues introduced by the new commits. Do not report pre-existing issues.

Look for:
- Logic errors, off-by-one, incorrect conditions, missing guard clauses
- Broken UI interactions or state management regressions
- API calls with wrong payloads, missing params, or unhandled error paths
- Race conditions or async/await misuse
- Accessibility or form validation regressions

**Report both of the following as bugs** (use the same bug template and severity headings — do not treat them as notes-only):

1. **Missing Playwright E2E coverage** — new or changed user-facing behaviour has no matching Playwright spec (direct or route/page match) that asserts the new behaviour. File a dedicated bug (e.g. `BUG-00N · Missing E2E coverage for <flow>`).
2. **Stale / required Playwright E2E updates** — the feature change alters UI, selectors, flows, or assertions that existing Playwright specs or page objects rely on. File a dedicated bug (e.g. `BUG-00N · E2E specs need update for <change>`) listing the affected `playwright/e2e/` and `playwright/page-objects/` files and what must change.

**Regression impact analysis** — for each bug or risky change, assess:
- Which existing features, pages, or user flows could break as a side effect
- Whether shared utilities, mock data, or page objects were modified in ways that affect other consumers (check all consumers, not just the feature under review)
- Whether the change alters behaviour that existing Playwright or unit tests rely on (even if those tests still pass, the tested behaviour may have shifted)
- The blast radius: is the impact isolated to one component, or does it ripple across multiple views

### Step 4 — Output the bug report

Print the report inline using the template below. Group bugs under severity headings.

---

## Bug Report Template

```markdown
## Pre-Merge Testing Report — <branch-name>

Diff base: `<base-branch>`  |  Commits reviewed: <N>  |  Files changed: <N>

---

### 🔴 Critical  (blocks merge / data loss / security risk)

#### BUG-001 · <Short title>

**Description**  
<One paragraph explaining what is wrong and why it matters.>

**Simulation setup** (if required)  
<Describe how to simulate the conditions needed to reproduce this bug. Include specific steps for:>
- Network conditions (block requests, simulate timeouts, slow connections)
- API mocking (mock error responses, specific status codes, malformed data)
- Browser DevTools modifications (throttling, offline mode, disable cache)
- State setup (specific user roles, cluster states, feature flags)
- Example:
  - "Mock the API to return 503 status with no response body"
  - "Use Chrome DevTools → Network → Throttling → Offline"
  - "Mock apiRequest.post to reject with: `new Error('Network timeout')`"

**Steps to reproduce**  
1. <Step 1>
2. <Step 2>
3. <Step N>

**Expected behaviour**  
<What should happen according to the PR description or existing tests.>

**Actual behaviour**  
<What actually happens with the new code.>

**Code reference**  
```ts
// The problematic change
<snippet>
```

**Regression impact**  
<Which existing features, pages, or user flows could break as a side effect. Note the blast radius (isolated vs cross-cutting) and any downstream consumers affected.>

**Affected file(s)**  
`path/to/file.ts` — line <N>

---

### 🟡 Major  (user-visible bug, degraded UX, but workaround exists)

#### BUG-002 · ...
(same template)

---

### 🟠 Minor  (edge case, cosmetic, low impact)

#### BUG-003 · ...
(same template)

---

### ✅ No issues or regression risks found in
- `path/to/clean-file.ts`
```

---

## Severity Guide

| Severity | Criteria |
|----------|----------|
| 🔴 Critical | Data loss, security hole, crash, blocks core user flow; missing E2E for a critical path that has no other coverage |
| 🟡 Major | Wrong output, broken feature, regression visible to most users; missing E2E for a primary user flow; existing E2E/page objects that would fail or assert wrong behaviour after the change |
| 🟠 Minor | Edge case, cosmetic glitch, misleading label, low-traffic path; missing E2E for a low-traffic or secondary flow; minor selector/assertion updates needed |
