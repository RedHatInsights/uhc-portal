# Cypress tests

Cypress tests are stored in the `cypress/` directory. We use the "page objects" pattern, in `cypress/pageobjects` - these define selectors for various components.
Test cases are in `cypress/e2e`.

We run different subsets in different environments, controlled by `{ tags: [...] }` on the suites/individual tests.

## Tests running on every MR

These are marked `tags: ['ci']`.
For running locally, you'll need credentials in environment variables - `CYPRESS_TEST_WITHQUOTA_USER` and `CYPRESS_TEST_WITHQUOTA_PASSWORD` (ask team members), 
and `npm start` (or equivalent dev-env) is already running in another terminal.
In GitLab-CI, these come from the repo's Settings > CI/CD.

## QE smoke tests

There is a larger (and slower) set of tests run by QE periodically, marked `tags: ['smoke']` (with some tests shared — `['ci', 'smoke']`).
These run in `ocm-cypress-smoke` job, using secrets coming from Vault — defined in app-interface repo.

Since they run post-merge, they typically run against staging or production, not a local environment.
See `run/cypress-qe-executor.sh` script in this repo.

## Running locally:

All these commands require the relevant env vars to be exported in the terminal where you run cypress.

To launch the Cypress test runner:

```
npm run cypress-ui
```

(Note this shows all tests; you may want to append e.g. `--env grepTags=ci` to see just one subset)

To run Cypress in headless mode:

```
npm run cypress-headless
```

To execute a specific test in headless mode:

```
npm run cypress-headless -- --spec 'cypress/e2e/RosaClusterWizard.js'
```
