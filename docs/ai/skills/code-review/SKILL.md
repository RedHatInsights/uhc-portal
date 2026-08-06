---
name: code-review
description: >-
  Review a GitHub pull request against team coding standards, repo conventions,
  and established patterns. Use when the user mentions code review, review PR,
  review pull request, check PR, or asks you to review changes in a PR.
---

# Code Review

Multi-pass PR review against team coding standards, established patterns, and e2e guidelines.

Review a GitHub PR methodically in multiple passes, posting inline comments with
fix suggestions, then verifying the author's fixes.

## Prerequisites — Read the Repo's Guidelines First

Before starting any review pass, read the repo's authoritative guidelines:

1. **`AGENTS.md`** (repo root) — project overview, structure, document index,
   PR conventions, and review process. This is the entry point.
2. **`docs/code-guide.md`** — coding standards (components, hooks, TypeScript,
   styling, testing, documenting). Cross-reference every finding against this.
3. **`docs/unit-testing.md`** — unit test patterns and RTL best practices.
4. **`docs/pull-request-process.md`** — PR size limits, review checklist, merge
   requirements.
5. **`docs/Playwright-e2e-test-automation-guidelines.md`** — e2e selector
   strategy, page objects, fixtures, tagging.
6. **`.cursor/rules/`** (per-developer, not in repo) — rule files such as
   `playwright-e2e-tests-rules.mdc` may exist locally.

If `AGENTS.md` references a doc, read it before reviewing code in that area.

## Pass 0: Architecture & Structure

Before reviewing any code line-by-line, take a structural pass. These are the
highest-value findings and the easiest to miss once you're deep in the code.

1. **Check directory placement / domain coupling** — for every **new file** added
   by the PR, trace its imports. If a file in a shared directory (`common/`,
   `utils/`, `queries/`) imports from a product-specific path (e.g.,
   `wizards/rosa/constants`, `clusters/osd/`), it is misplaced. New files should
   be co-located with the domain they depend on, not in shared directories.
   Compare against sibling directories of the same wizard/feature to see where
   similar files live (e.g., `NetworkScreen/`, `ControlPlaneScreen/`).

2. **Compare architectural approach against sibling features** — for each new
   "screen", "step", or "section" added to an existing wizard or page:
   - How do sibling steps handle **validation**? (field-level `validate` prop vs
     central form validator vs schema-based)
   - How do sibling steps handle **data fetching**? (which service, hook pattern,
     query key conventions)
   - How do sibling steps handle **state management**? (Formik fields, context,
     local state)
   - If the new code uses a *different* mechanism than every other sibling,
     **investigate the constraint before flagging it.** A divergence may be
     intentional and necessary. For example:
     - **PatternFly Wizard + Formik gotcha:** PF Wizard mounts ALL steps
       simultaneously (inactive steps live in hidden `<div style="display:none">`).
       This means all Formik `<Field validate={...}>` validators are registered
       at all times. `validateForm()` fires them ALL — including fields from
       steps the user isn't on. Conditionally-required fields (e.g., fields
       that become required when a toggle is enabled) MUST use a central
       form-level validator with step-awareness (`activeStepId`) rather than
       field-level `validate` props, or users will get stuck on unrelated steps.
     - Only flag a divergence as an issue if you can confirm the standard
       pattern would actually work for the new code's specific constraints.

3. **Check API completeness** — for each API endpoint the PR calls, check the
   OpenAPI spec or API model for related endpoints that might also be needed.
   Ask: "Does this feature need data from multiple endpoints? Is only one being
   called?" Look for sets of related resources (e.g., groups AND applications,
   subscriptions AND quotas) where consuming only one gives an incomplete view.

4. **Check data transformation fidelity** — when the PR transforms API responses
   into UI models (tree builders, mappers, selectors), verify that:
   - All items from the API response are represented in the UI model (no silent
     drops — e.g., filtering out empty arrays, single-item groups, disabled items)
   - Edge cases are handled: empty responses, single-item collections, missing
     optional fields
   - The transformation preserves semantics (e.g., a "group" in the API should
     still appear as a group in the UI, not collapsed into a leaf)

## Pass 1: Correctness & Standards

1. **Read the PR description** — fetch with `gh pr view <number>`.
2. **Verify test instructions** — confirm the "How to Test" steps are accurate
   and complete. Flag mismatches, missing steps, or ambiguous bucket/resource
   names. **Confirm the PR's "How to Test" captures the associated JIRA
   ticket's Acceptance Criteria.**
3. **Clarify critical requirements** — ask the user to state any must-have
   behaviors (e.g., "Feature X must only affect Y, not Z"). Trace through the
   code to verify these requirements are met. If the user provides a critical
   requirement, explicitly confirm each location where it's enforced.
4. **Bootstrap from CodeRabbit** — if CodeRabbit left comments, read them first.
   Assess which findings are still valid after the latest force-push and which
   were already addressed. This avoids duplicate work.
5. **Read all changed files** — use subagents to read new and modified files in
   parallel while also exploring existing codebase patterns for comparison.
6. **Check against team rules** — the repo's coding standards live in
   `docs/code-guide.md` (referenced from `AGENTS.md`). Key sections to check:
   General Conventions, Component Structure, Coding Patterns, React Hooks
   Patterns, useEffect guidelines, Avoid Custom Styling, Data Loading and
   Error States, TypeScript rules (no `any`, no `as`, no default exports,
   `import type`), Import Restrictions/Order, and Documenting (Storybook).
   Also check `docs/unit-testing.md` and `docs/pull-request-process.md`
   (PR size limits, review checklist). Cross-reference every finding against
   the specific rule and cite the doc section when commenting.
7. **Check established patterns** — compare new code against existing sibling
   files in the same directory AND against sibling steps/features in the parent
   directory. Look for:
   - File naming conventions (does the filename match the default export?)
   - Import patterns (`import type` for type-only imports)
   - Component structure (props interfaces, hooks usage, conditional rendering)
   - Validation patterns — specifically compare the *mechanism* (field-level
     `validate` prop, central form validator, schema validation) against how
     sibling steps in the same wizard/page validate
   - Service layer patterns (how are API calls structured?)
   - Constants organization (enums, field IDs, step IDs)
   - Directory placement sanity check — if Pass 0 flagged misplaced files,
     verify this is noted in the findings
8. **Check DRY** — search for duplicate constants, URLs, error messages, or
   logic that could use an existing helper. **Before suggesting a new helper,
   search the codebase for similar existing patterns** (e.g., search
   `isMarketplace`, `billingModel`, or the enum being checked).
9. **Review comments in new code** — are they accurate? Do they reference
   correct filenames? Are any JSDoc blocks attached to the wrong function?

### Output format for Pass 1

Present findings in two tables:

**Blocking / Should Fix** — with file, line number, and suggested fix
(include code snippets using GitHub `suggestion` blocks where possible).

**Non-Blocking / Worth Discussing** — prefix each with
"Non-Blocker Observation:" when posting.

**Do NOT post comments yet.** List them with file + line number and let the
user review, trim, and approve before posting.

## Pass 2: Optimization & Tests

Take a second pass with a different lens:

- **React best practices** — prop typing (interfaces vs type aliases), prop
  drilling vs targeted props, memoization opportunities, inline functions in JSX.
- **Unit tests** — imports from `~/testUtils`, query selector priority
  (`getByRole` > `getByLabelText` > ... > `getByTestId`), `jest.clearAllMocks()`
  cleanup, `checkAccessibility` calls, fixture organization, loading/error state
  coverage.
- **E2e tests** — check `docs/Playwright-e2e-test-automation-guidelines.md` for
  selector strategy. Prefer `getByRole` with name, avoid CSS selectors.
- **E2e Playwright PR deep-checks** — when the PR adds or modifies Playwright
  e2e tests, apply these additional checks:
  1. **Rule compliance** — verify against
     `docs/Playwright-e2e-test-automation-guidelines.md`. Check `is<PageName>()`
     completeness (URL + heading), selector priority, serial vs parallel usage,
     tagging strategy, fixture registration, and anti-patterns.
  2. **Reuse existing helpers** — search `playwright/page-objects/` and
     `playwright/support/` for existing methods before accepting new ones. Flag
     duplicated patterns (kebab/delete flows, row filtering, modal interactions,
     alert verification) that already have established implementations in sibling
     page objects. New helpers are fine when no prior art exists, but the default
     assumption should be reuse.
  3. **Compare against sibling specs** — find the closest existing spec in
     `playwright/e2e/` (same product, same lifecycle phase) and compare: test
     structure, `beforeAll` patterns, navigation approach, assertion style
     (`toBeHidden` vs `toHaveCount`), and tagging. Deviations need justification.
  4. **Real assertions, not echo tests** — many e2e tests are AI-assisted or
     generated. Verify that tests assert *actual system behavior* (API responses,
     DOM changes from real interactions, navigation state) rather than just
     round-tripping fixture data (feeding mock data in and asserting the same
     mock data comes out). If a test fills a form value from a JSON fixture and
     then asserts that exact string appears in the UI, ask: is the system
     actually doing anything, or are we testing that Playwright can read what it
     just typed?
  5. **Edge cases** — for each user action tested (add, delete, validate), ask
     what happens on: duplicate input, empty state before/after, permission
     boundaries, concurrent modifications, and error recovery (modal stays open,
     API timeout). Flag missing coverage as non-blocking observations.
- **Missing test coverage** — are there new components with no test file? Count
  distinct code paths (error, loading, success) and flag untested ones.
- **Impact analysis** — for each modified shared component, search for all
  usages: `grep -r "ComponentName" --include="*.tsx" | grep -v test | grep -v stories`
  List all usages and flag any that might be affected (Day 2 flows, modals,
  other wizards, other products like ROSA vs OSD). Ask "where else is this
  used?" for every shared component.

Present findings the same way as Pass 1. Let the user filter before posting.

## Posting Comments

When the user approves:

1. Use `gh api repos/{owner}/{repo}/pulls/{number}/reviews` to post a single
   review with all inline comments in one batch.
2. For blocking items, include GitHub `suggestion` code blocks where possible.
3. For non-blocking items, prefix each comment body with
   **"Non-Blocker Observation:"**.
4. Post blocking and non-blocking as separate review batches so they are visually
   distinct on the PR.
5. **Title comments by UI area, not file name** — when writing the comment
   heading, use titles like "Infrastructure Type Selection (Billing Model Step)"
   instead of "BillingModel.tsx". The comment is still attached to the specific
   line for individual replies, but the title makes it accessible to QE and
   product reviewers scanning the review.
6. **Address the author directly** — start comments with `@username` and
   phrase as questions or requests for investigation rather than demands.
   Consider the author's experience level when framing feedback.

## Verifying Fixes

When the author pushes fix commits:

1. Fetch the latest PR head:
   `git fetch upstream pull/{number}/head:pr-{number}-latest --force`
2. Diff against the previous head: `git diff {old_sha}..pr-{number}-latest`
3. For each comment where the author replied "Done":
   - Verify the code change matches the requested fix.
   - Mark as **correct** or **not yet addressed**.
4. Present a scorecard table: comment, fix description, correct yes/no.
5. **Only resolve threads that are verified correct in code.** Do not resolve
   threads where the author said "Done" but the code doesn't reflect it yet.
6. Resolve verified threads via GraphQL `resolveReviewThread` mutation.

## Key Principles

- **Set the persona** — review as a conservative, devil's advocate reviewer.
- **Separate passes** — correctness first, optimization second.
- **Plan before posting** — list comments with line numbers, let user filter.
- **Scope aggressively** — trim out-of-scope findings (e.g., e2e tests tracked
  in a separate story, Storybook gaps that aren't blocking).
- **Cite the rules** — every comment should reference the specific team rule or
  established pattern it violates, not generic "best practice."
- **Challenge assumptions** — don't take test instructions or PR descriptions
  at face value. Verify claims by tracing through the code. Ask "Is this
  actually true?" for any assertion about system behavior.
- **Deep dive on ambiguous logic** — when reviewing quota/permission/feature
  flag logic, trace through helper methods to understand exactly what
  parameters are being checked. Surface-level review misses subtle bugs.
- **Close the loop** — review isn't done when comments are posted. It's done
  when fixes are verified.
