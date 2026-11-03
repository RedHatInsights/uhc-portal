# Agent coding rules

Enforce these rules when writing or reviewing code. 

When changing existing code, if following these rules would require significant refactoring beyond the requested change, stop and ask the user for confirmation before proceeding.

## General

- Functional components with hooks only — no class components.
- PascalCase for component files and names; camelCase for non-component files, functions, and variables.
- kebab-case for shell scripts and config files.
- `UPPER_SNAKE_CASE` for true constants.
- Boolean props on custom components must be prefixed with `is`, `has`, `can`, or `should`.
- Do not add `console.log` to application code. Remove debug logging before merging. ESLint enforces `no-console` for application code under `src/` (tests and stories are exempt).
- Before creating a new hook, query, utility, or helper, search the entire codebase for an existing implementation — not only `src/queries/` or `src/hooks/`. Reuse duplicates; consider extracting to a shared location.
- Do not extend existing duplication (e.g. Day 1 vs Day 2, or JS vs TS variants of the same logic). Flag it and consolidate before adding another variant.
- Before writing new logic, check parent, sibling, and nearby files for the same logic and reuse it.
- Do not copy workarounds from existing code without understanding why they exist (e.g. `setTimeout` around Formik `setFieldTouched`).

## Components

- Organize by feature: a container owns logic; presentational children display props and handle UI interactions.
- Keep UI components thin. Prefer deriving values from props over local `useState` when possible.
- Extract a new component when nesting conditional / top-level if/else; reserve ternaries for small, readable cases.
- Put complex data logic in custom hooks.
- Pass only the props a component needs — not whole objects.
- Presentational components must not contain domain/business logic; pass configured values from the parent.
- Do not put state-dependent logic in `useEffect`; define logic explicitly.
- Prefer state machines over multiple related `useState` calls.
- Do not use `setTimeout` with an empty or no-op callback. Other `setTimeout` uses need a comment explaining why.

## Hooks

- Do not use `useMemo` for work that is not computationally expensive, including passthrough values such as returning `children` unchanged.
- Use `useCallback` only when the function is a hook dependency, provided via context / custom hooks, or passed to a memoized child.
- Do not wrap simple same-component event handlers in `useCallback`.
- Hook dependency arrays must use referentially stable values.
- Do not use `useEffect` to copy a prop or state value into local `useState`. Derive during render instead.
- Do not leave `// eslint-disable-next-line react-hooks/exhaustive-deps` without a comment explaining why. Prefer fixing the dependency array.
- Do not use `useEffect` to transform data for render, handle user events, reset state when props change, update state from props/state, or set default input values. Use it only to sync with external systems or for unmount cleanup.

## Styling

- Do not use inline `style` props for layout, spacing, color, or typography.
- Prefer PatternFly components and layout components (`Stack`, `Flex`, `Grid`, etc.) over custom CSS.
- Prefer layout components over utility-only spacing when structuring a page or feature section. Justify exceptions in the PR description or a code comment.
- Do not add ad-hoc CSS or className workarounds when layout components or PatternFly utilities can solve the problem. Custom CSS is a rare, documented exception.

## Data loading

- Always handle loading and error states for async data. Use PatternFly `Skeleton` / `Spinner` for loading and `Alert` (or existing error UI) for failures. Do not fail silently.

## Imports

- Use `~` for `src/` imports.
- PatternFly icons: `@patternfly/react-icons/dist/esm/icons/<icon>`
- PatternFly tokens: `@patternfly/react-tokens/dist/esm/<token>`
- Import `apiRequest` only from `~/services/apiRequest`.
- Do not import from `do_not_use` directories.
- Import order (simple-import-sort): `react`, `next`, then letter packages → `@` → `~` → `../` → `./` → styles → side effects.

## TypeScript

- When changing a JS file, convert it to TypeScript in a separate PR before further changes when practical.
- Prefer `unknown` over `any`; add type guards.
- Avoid `as` type assertions except rare DOM cases (e.g. `event.target as HTMLInputElement`).
- Provide fallbacks with optional chaining; do not use `?.` to hide missing loading data.
- Optional properties are optional only when callers may omit them — not to silence type errors.
- Prefer named exports over default exports.
- Do not add barrel `index.ts` re-export files.
- Do not add `// @ts-ignore` without a motivated exception.

## Libraries

- Do not use Redux for new development. Use TanStack Query for data-fetching and async state.
- Do not use `lodash/get`, `lodash/set`, or similar accessors when `?.` and `??` suffice. Use lodash only when plain TS/JS is unclear.

## Documenting and testing

- Document new feature / reusable UI components with Storybook stories.
- All code changes must be tested. Follow `docs/unit-testing.md` for unit tests and the Playwright docs for E2E.
