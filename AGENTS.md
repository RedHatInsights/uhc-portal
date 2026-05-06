# OCM UI (uhc-portal)

UI for OpenShift Cluster Manager — a React/TypeScript single-page application running on console.redhat.com under the `/openshift` route.

## Dev Environment

Prerequisites: Node.js >= 22 (LTS), Yarn >= 1.22.19, Podman >= 5.5.2.

```bash
yarn install
yarn fec patch-etc-hosts   # first-time setup, patches /etc/hosts
```

The app runs inside the [Frontend Components (FEC)](https://github.com/RedHatInsights/frontend-components) framework, which provides a containerized Chrome shell, webpack dev server, and backend proxying.

Two development modes:

- `yarn dev` — `fec dev` with Hot Module Reloading. Requires Red Hat VPN. Runs webpack on the host.
- `yarn start` — `fec dev-proxy` using a Podman container as proxy. No HMR (manual refresh).

UI is available at `https://prod.foo.redhat.com:1337/openshift/`. Switch backends with `?env=staging` / `?env=production` / `?env=mockdata`.

Custom Chrome port: `FEC_CHROME_PORT=<PORT> yarn dev`.

Entry point: `src/bootstrap.ts`. FEC config: `fec.config.js`. Module federation exposes `./RootApp` from `src/chrome-main.tsx`.

## Build

```bash
yarn build          # development build
yarn build:prod     # production build
```

Output goes to `dist/`. Uses webpack via FEC.

## Test

### Unit tests

Framework: Jest + React Testing Library. Config: `jest.config.js`.

```bash
yarn test                          # full suite with coverage
yarn test-no-coverage              # without coverage
yarn test-local                    # reduced CPU (--maxWorkers=50%)
yarn test-changes                  # only files changed since main
yarn test-changes-with-enforcement # changed files with 80% statement threshold
```

Test files use `<Name>.test.tsx` suffix and live next to the source file they test. Some legacy tests exist in `__tests__/` subdirectories — when updating those components, move the test file to sit alongside the source. Coverage output: `unitTestCoverage/`.

Import `render`, `screen` from `~/testUtils` (not from `@testing-library/react` directly). Use the `user` object returned by render for interactions, not `fireEvent`. Use the `withState` utility for Redux state.

Query priority: `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByDisplayValue` > `getByAltText` > `getByTitle` > `getByTestId`.

Snapshot tests are banned (ESLint rule `no-snapshot-testing/no-snapshot-testing`).

Unit test conventions (see `docs/unit-testing.md` for full details):

- Use `it()`, not `test()`, for test definitions
- Test descriptions follow the format: "expected result when conditions" (e.g., `it('displays error when API call fails')`)
- Top-level `describe` block name matches the component: `describe('<MyComponent />', () => { ... })`
- Render inside each `it()` block, never in `beforeAll` or `beforeEach`
- Use `.test.tsx` suffix, never `.spec.`
- Query type usage: `getBy` when element exists, `queryBy` when asserting it does not exist, `findBy` to wait for async appearance
- Prefer `findBy` over `waitFor` for async assertions. Do not save `findBy` results to a variable — use inline (RTL bug causes CI flakes)
- Use `within()` for scoped queries instead of `querySelector`
- Use `toBeInTheDocument()` for existence checks, not `toBeTruthy()` or `toBeVisible()`
- Clear textbox before typing: `await user.clear(input)` then `await user.type(input, 'value')`
- Use the `checkAccessibility` utility (based on Axe-core) for mandatory a11y checks in every component test.
- Avoid `try/catch` blocks in unit tests — let failures propagate naturally

### E2E tests (Playwright)

Config: `playwright.config.ts`. Tests: `playwright/e2e/`. Page objects: `playwright/pages/`.

```bash
yarn playwright-headless       # all tests
yarn playwright-e2e-ci         # CI-tagged tests only (@ci)
yarn playwright-ui             # interactive UI mode
yarn playwright-debug          # debug mode
yarn playwright-report         # view HTML report
```

Environment config is loaded from `playwright.env.json` at the project root. Auth state is saved by `playwright/support/global-setup.ts` to `storageState.json`.

Import `test` and `expect` from the custom fixtures (`../../fixtures/pages`), never from `@playwright/test`. Page objects extend `BasePage`. Fixtures are worker-scoped. Use `navigateTo` for navigation instead of `page.goto()`.

Tags: `@ci` (fast, side-effect-free), `@smoke` (critical paths, daily staging), `@advanced` (comprehensive). Always pair with `@day1` or `@day2`. For detailed Playwright conventions (page objects, selectors, fixtures, anti-patterns), see `.cursor/rules/playwright-e2e-tests-rules.mdc`.

### Cypress (legacy)

Cypress E2E tests exist in `cypress/` but Playwright is the active framework for new tests.

## Code Style

Extends Airbnb ESLint config with TypeScript, Prettier, and React Hooks plugins. Config: `.eslintrc`. Prettier config: `.prettierrc`.

```bash
yarn lint              # ESLint on src/ and run/
yarn prettier          # check formatting
yarn prettier:fix      # fix formatting
yarn lint-prettier     # both
```

Husky pre-commit hook runs `lint-staged` on staged files (auto-formats with Prettier).

### Import order (enforced by `simple-import-sort`)

1. `react`, then packages starting with a letter
2. Packages starting with `@`
3. Packages starting with `~` (src alias)
4. Relative `../` imports
5. Relative `./` imports
6. Style imports (`.css`, `.scss`)

### Import restrictions (ESLint errors)

- PatternFly icons: use full ESM path `@patternfly/react-icons/dist/esm/icons/<icon>`
- PatternFly tokens: use full ESM path `@patternfly/react-tokens/dist/esm/<token>`
- `apiRequest`: always import from `~/services/apiRequest`
- Files in `do_not_use` directories must not be imported

### Path alias

`~` maps to `src/` (configured in `tsconfig.json`, `jest.config.js`, and `fec.config.js`).

### Key conventions

- Functional components with hooks only (no class components)
- PascalCase for component files and names; camelCase for non-component files, functions, variables
- `UPPER_SNAKE_CASE` for true constants
- No default exports; use named exports
- No barrel files (`index.ts` re-exports)
- Avoid `any` — use `unknown` with type guards; avoid `as` type assertions; avoid `// @ts-ignore` (must be a motivated exception)
- Use `import type` for type-only imports (e.g., `import type { ChromeAPI } from '...'`) to avoid runtime import overhead
- Prefer ternary `{condition ? <Component /> : null}` over short-circuit `{condition && <Component />}` for conditional rendering
- Avoid custom CSS — use PatternFly components and layout (`Stack`, `Flex`, `Grid`) instead of utility classes or inline styles
- Redux is legacy — use TanStack Query (`@tanstack/react-query` v5) for all new data fetching:
  - Include request parameters in the query key so React Query refetches when they change
  - Use the `enabled` option to prevent queries from running when dependencies are not available
  - Use `queryClient.invalidateQueries` in mutation `onSuccess` callbacks to refresh related data
  - Use the `formatErrorData` helper from `src/queries/helpers` for consistent error handling across all query hooks
- Lodash only when plain TS/JS cannot achieve the same result
- No `setTimeout` hacks without a justifying comment
- Boolean props prefixed with `is`, `has`, `can`, `should`
- `useEffect` only for external system synchronization and unmount cleanup — not for derived state, data transforms, or setting defaults (see `docs/code-guide.md`)
- `useCallback`/`useMemo` only when necessary (hook deps, context providers, memoized child props)
- Prefer state machines over multiple interdependent `useState` calls
- Provide fallback values when using optional chaining — do not use optional chaining to mask absence of data during loading
- Avoid passing whole objects as props when the component only needs a few properties
- Always handle loading states (PF `Skeleton`/`Spinner`) and error states (PF `Alert`) for async data
- Circular dependencies checked in CI: `yarn find-circular-dependencies`
- Before creating a new UI component, search `src/components/common` and PatternFly docs — do not duplicate existing patterns

## Architecture

```
src/
  bootstrap.ts          # App entry point
  chrome-main.tsx       # Module federation root
  common/               # Shared utilities, link definitions (docLinks, supportLinks, installLinks)
  components/           # Feature components organized by domain
  config/               # Environment and app configuration
  hoc/                  # Higher-order components
  hooks/                # Shared custom hooks
  queries/              # TanStack Query hooks organized by feature/domain
  redux/                # Legacy Redux store, reducers, actions
  services/             # API request layer and service functions
  styles/               # Global styles
  types/                # OpenAPI-generated TypeScript types
```

### OpenAPI types

Types in `src/types/` are generated from OpenAPI specs. Regenerate with `make openapi`. Source specs are fetched from `api.stage.openshift.com` and `console.redhat.com`. See `openapi/README.md`. Always consult these types for API structures — do not redefine types that exist in generated files.

### Component structure

Organize by feature. Each feature has a container component (logic) and presentational components (display). Example:

```
UsersList/
  UsersList.tsx           # Container
  UsersList.test.tsx
  UsersList.stories.tsx
  useUsersList.ts         # Feature-specific hook
  components/             # Presentational children
  types.ts
  utils/
```

Presentational components receive data via props — no domain/business logic inside them. Document components with Storybook stories (`.stories.tsx` files alongside components). Run with `yarn storybook`.

### External links

Link URLs are organized into three files in `src/common/`:
- `installLinks.mjs` — binary downloads, console URLs
- `supportLinks.mjs` — access.redhat.com, support docs, knowledge base
- `docLinks.mjs` — docs.redhat.com, educational content

### Mocking

A Python mock server (`mockdata/mockserver.py`) runs alongside the dev server. Access mock data with `?env=mockdata`. See `mockdata/README.md`.

## PR and Commit Conventions

- PR title must include the Jira ticket ID (e.g., `OCMUI-1234: Short description`)
- PRs over 1,000 lines or 30 files must be split (exceptions require discussion)
- Requires 2 dev approvals + 1 QE approval before merge
- Squash-merge to `main`
- AI-assisted code must be marked with `Assisted-by:` or `Generated-by:` in PR description and squash commit message (e.g., `Assisted-by: Cursor/gemini-2.5-pro`)
- Run `yarn test-changes` to verify unit test coverage on changed files
- When converting JS files to TS, do the conversion in a separate PR before further changes
- Respond to CodeRabbit (AI reviewer) comments before requesting human review

## Security

- Never commit sensitive data: API keys, passwords, account IDs, customer emails
- Never reference non-public Red Hat strategies, product plans, or in-boundary names (domains, URLs) per FedRAMP
- A `rh-pre-commit` hook scans for sensitive data — install it per `docs/contributing.md#setup`
- Never input confidential, customer-specific data, or internal Red Hat strategic plans into public AI code assistants.

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on PRs and pushes to `main`:

1. **Install** — `yarn install`, checks for uncommitted changes
2. **Build** — `yarn build`
3. **Lint** — `yarn lint-prettier`
4. **Unit Tests** — `yarn test` with Codecov upload
5. **Circular Dependencies** — `yarn find-circular-dependencies`

E2E tests run in separate workflows: `e2e-ci-playwright.yml` (on PRs) and `e2e-smoke-playwright.yml` (scheduled).

Node version in CI: 24.x.
