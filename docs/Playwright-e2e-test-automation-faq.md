# Playwright Test Automation — Frequently Asked Questions (FAQ)

> This FAQ is a companion to the [Test Automation Guidelines](Playwright-e2e-test-automation-guidelines.md).

## Q: Why do we have single navigation in serial tests?

Because all tests in a `test.describe.serial` block share the same **worker-scoped page instance**, we navigate once in `test.beforeAll` to set the starting page and then let individual tests continue from where the previous test left off. This avoids redundant page loads and keeps the suite fast. Each test can still navigate if needed, but the initial navigation only happens once.

```typescript
test.describe.serial('Downloads feature', { tag: ['@ci', '@smoke'] }, () => {
  // ✅ Navigate once — all tests below share this starting point
  test.beforeAll(async ({ navigateTo, downloadsPage }) => {
    await navigateTo('/openshift/downloads');
    await downloadsPage.isDownloadsPage();
  });

  test('can view pull secret', async ({ downloadsPage }) => {
    // Already on the downloads page — no navigation needed
    await expect(downloadsPage.pullSecretRow()).toBeVisible();
  });

  test('can download CLI tools', async ({ downloadsPage }) => {
    // Still on the same page from the previous test
    await expect(downloadsPage.cliToolsSection()).toBeVisible();
  });
});
```

If a test navigates away (e.g., clicks a link to another page), subsequent tests should either navigate back explicitly using `navigateTo` or be designed to work from the new location. Avoid `page.goBack()` — use direct navigation instead.

## Q: When should I use the `page` fixture directly vs. a page object fixture?

Use **page object fixtures** (e.g., `clusterListPage`, `downloadsPage`) for all interactions with page elements -- they provide readable, reusable methods and encapsulate selectors. Use the raw `page` fixture only when you need low-level access that page objects don't cover, such as taking screenshots, checking the URL, or interacting with browser-level APIs.

```typescript
test('example', async ({ page, clusterListPage }) => {
  // Page object for element interactions
  await expect(clusterListPage.filterInput()).toBeVisible();

  // Raw page for low-level operations
  console.log('URL:', page.url());
  await page.screenshot({ path: 'debug.png' });
});
```

## Q: Why do we import `test` and `expect` from `../../fixtures/pages` instead of `@playwright/test`?

Our custom `fixtures/pages.ts` extends Playwright's base `test` object with project-specific fixtures like `navigateTo`, `clusterListPage`, and other page objects. Importing from `@playwright/test` directly would give you a `test` function that doesn't know about these fixtures, and you'd get TypeScript errors when trying to destructure them. Always import from the fixtures file:

```typescript
// ✅ Correct
import { test, expect } from '../../fixtures/pages';

// ❌ Wrong — custom fixtures won't be available
import { test, expect } from '@playwright/test';
```

## Q: Why is `networkidle` discouraged even though Playwright supports it?

`networkidle` waits until there are no network connections for 500ms. In modern web apps that use polling, WebSockets, or long-lived API connections (like our portal), the network never truly goes "idle," causing tests to hang until they time out. Instead, wait for a **specific, visible element** that signals the page is ready:

```typescript
// ❌ May hang indefinitely on pages with background polling
await page.waitForLoadState('networkidle');

// ✅ Wait for the actual content you need
await expect(page.getByRole('heading', { name: 'Clusters' })).toBeVisible();
await clusterListPage.waitForDataReady();
```

## Q: How do I fix "Auth failure" or "storageState not found" errors?

The authentication storage state (`storageState.json`) is created during the global setup and reused across workers. If it becomes stale or corrupted:

1. **Delete the file:** Remove `storageState.json` from the project root and re-run tests. Global setup will re-authenticate.
2. **Check credentials:** Ensure your environment variables (login URL, username, password) are correctly set in `playwright.env.json`. Refer to the [Playwright README — Configuration Files](../playwright/README.md#configuration-files) for the expected structure and configuration details.

## Q: How do I run just one specific test or test file?

```bash
# Run a specific test file
yarn playwright test playwright/e2e/downloads/downloads.spec.ts

# Run a specific test by title (grep)
yarn playwright test -g "can view pull secret"

# Run tests matching a tag
yarn playwright test --grep="@smoke"

# Run in headed mode to watch the browser
yarn playwright test playwright/e2e/downloads/downloads.spec.ts --headed

# Run in UI mode for interactive debugging
yarn playwright-ui
```

## Q: My test passes locally but fails in CI. How do I debug it?

1. **Check the trace:** CI runs generate traces automatically. Download the trace artifact and open it:
   ```bash
   yarn playwright show-trace test-results/trace.zip
   ```
2. **Look at screenshots/videos:** Test artifacts (screenshots on failure, videos if configured) are uploaded as CI artifacts.
3. **Reproduce headless locally:** CI runs headless by default. Test locally in headless mode to rule out headed-vs-headless differences:
   ```bash
   yarn playwright test playwright/e2e/your-test.spec.ts
   ```
4. **Check timing:** CI environments are typically slower. If your test relies on tight timing, add proper waits for element visibility rather than hard-coded timeouts.

## Q: How do I debug a failing test locally?

Playwright offers several modes to help you understand what a test is doing step by step:

1. **UI Mode (recommended first step):** Opens an interactive interface where you can watch test execution, inspect DOM snapshots at each step, and re-run individual tests:

   ```bash
   yarn playwright-ui
   ```

2. **Debug Mode:** Launches the browser with Playwright Inspector, letting you step through each action one at a time:

   ```bash
   yarn playwright-debug
   # Or for a specific file:
   PWDEBUG=1 yarn playwright test playwright/e2e/your-test.spec.ts
   ```

3. **Headed Mode:** Runs the test with a visible browser so you can see what's happening, but without the step-by-step debugger:

   ```bash
   yarn playwright test playwright/e2e/your-test.spec.ts --headed
   ```

4. **Add `page.pause()` to your test:** Drops you into the Playwright Inspector at a specific point in your test. Remove before committing:

   ```typescript
   test('debug this step', async ({ page, clusterListPage }) => {
     await clusterListPage.filterInput().fill('my-cluster');
     await page.pause(); // Execution stops here — inspect the page
     await clusterListPage.searchButton().click();
   });
   ```

5. **Trace Viewer:** Run with tracing enabled to capture a detailed timeline of every action, network request, and DOM snapshot:
   ```bash
   yarn playwright test --trace on
   yarn playwright show-trace test-results/trace.zip
   ```

Start with **UI Mode** for most debugging — it gives you the fastest feedback loop without modifying your test code.

## Q: Should locator methods in page objects be `async` or synchronous?

**Locator methods should be synchronous** (no `async`, no `await`). Playwright locators are lazy -- they don't query the DOM until an action or assertion is performed on them. Making them `async` adds unnecessary overhead and breaks chaining.

```typescript
// ✅ Good: Synchronous locator method
submitButton(): Locator {
  return this.page.getByRole('button', { name: 'Submit' });
}

// ❌ Bad: Unnecessary async
async submitButton(): Promise<Locator> {
  return this.page.getByRole('button', { name: 'Submit' });
}
```

**Action methods** (those that perform clicks, fills, navigation) _should_ be `async` since they interact with the browser.

## Q: When should I create a new page object vs. adding to an existing one?

Use this decision guide:

| Scenario                                                 | Action                                           | Example                                                             |
| -------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| Testing a **new page** with its own URL and distinct UI  | Create a **new** page object                     | A new "Billing" page at `/billing`                                  |
| Adding tests for elements on an **already-modeled page** | **Add methods** to the existing page object      | Adding `filterByStatus()` to `ClusterListPage`                      |
| A page has grown very large with many unrelated sections | Consider **splitting** into focused page objects | Separate `ClusterDetailsOverviewPage` and `ClusterDetailsNodesPage` |

**Creating a new page object** requires three steps:

1. Create the class in `page-objects/` extending `BasePage`
2. Register it as a fixture in `fixtures/pages.ts`
3. Use it in your spec file

**Adding to an existing page object** only requires adding the method:

```typescript
// Adding a new method to an existing page object
export class ClusterListPage extends BasePage {
  // ... existing methods ...

  // New method — no fixture changes needed
  filterByStatus(status: string): Locator {
    return this.page.getByRole('option', { name: status });
  }
}
```

Before creating a new page object, always check `page-objects/` to see if one already covers your page. Duplicate page objects for the same page cause confusion and maintenance burden.

## Q: How do I handle test data like cluster names or configuration values?

Use **JSON fixture files** stored in `playwright/fixtures/<feature>/`. These keep test data separate from test logic and make it easy to update values without modifying specs:

```typescript
// Load fixture data
const testData = require('../../fixtures/rosa/rosa-cluster.spec.json');

test('create cluster', async ({ createRosaWizardPage }) => {
  await createRosaWizardPage.clusterNameInput().fill(testData.clusterName);
});
```

Avoid hard-coding test data directly in spec files, especially values that may change across environments.

## Q: How do I handle tests that need data that might not exist?

It depends on whether the data is a **hard requirement** or **environment-dependent**. The two cases should be handled differently:

**1. Hard requirements — Fail fast with a clear error**

If the entire test suite depends on a specific env variable or resource (e.g., `QE_TEST_CLUSTER_NAME`), a missing value means the environment is misconfigured. The test should **fail immediately** with an explicit error, not skip silently — otherwise broken CI setups go unnoticed.

```typescript
test.describe.serial('Cluster details', { tag: ['@ci'] }, () => {
  const clusterName = process.env.QE_TEST_CLUSTER_NAME;

  // ✅ Fail fast — this env var is required for the suite to be meaningful
  test.beforeAll(async () => {
    if (!clusterName) {
      throw new Error(
        'QE_TEST_CLUSTER_NAME env var must be set — test environment is misconfigured',
      );
    }
  });

  test('shows cluster overview', async ({ clusterDetailsPage }) => {
    await expect(clusterDetailsPage.clusterNameHeading()).toContainText(clusterName!);
  });
});
```

**2. Optional / environment-dependent data — Skip with a reason**

If the data is legitimately optional (e.g., the test can only run when clusters happen to exist in the environment), use `test.skip` so the report clearly shows why the tests didn't run.

```typescript
test.describe.serial('Subscription management', { tag: ['@ci'] }, () => {
  test.beforeAll(async ({ navigateTo, clusterListPage }) => {
    await navigateTo('cluster-list');
    const clusterCount = await clusterListPage.clusterRows().count();
    // ✅ Skip — clusters may not exist in every test environment
    test.skip(clusterCount === 0, 'No clusters available in this environment');
  });

  test('view subscription details', async ({ clusterListPage }) => {
    await clusterListPage.firstClusterRow().click();
    // ...
  });
});
```

**3. Self-contained suites — Create the data as part of setup**

When possible, make the test self-sufficient by creating and cleaning up its own data, so it doesn't depend on external state at all.

```typescript
test.describe.serial('Cluster lifecycle', { tag: ['@cluster-creation'] }, () => {
  const clusterName = `test-cluster-${Math.random().toString(36).substring(7)}`;

  test('create cluster', async ({ createRosaWizardPage }) => {
    await createRosaWizardPage.clusterNameInput().fill(clusterName);
    await createRosaWizardPage.submitButton().click();
    // Wait for creation to complete...
  });

  test('verify cluster appears in list', async ({ navigateTo, clusterListPage }) => {
    await navigateTo('cluster-list');
    await expect(clusterListPage.clusterRowByName(clusterName)).toBeVisible();
  });

  test.afterAll(
    async (
      {
        /* cleanup fixture */
      },
    ) => {
      // Clean up the created resource
    },
  );
});
```

**How to decide:**

| Scenario                                              | Action                                       | Example                                      |
| ----------------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| Env var the suite **cannot run without**              | **Fail** with `throw new Error(...)`         | `QE_TEST_CLUSTER_NAME`, `QE_AWS_ID`          |
| Data that **may or may not** exist in the environment | **Skip** with `test.skip(condition, reason)` | Clusters, subscriptions in a shared env      |
| Data that the test **can create itself**              | **Set up** in `beforeAll` or first test      | Dynamically created clusters, temp resources |

The key principle: **never let a test produce a cryptic, misleading error because of missing preconditions.** Hard requirements should fail loudly and immediately so misconfigured environments are caught. Optional preconditions should skip with a clear reason. In neither case should a test silently pass without verifying anything.

## Q: What tags should I use for my tests?

| Tag                 | When to Use                                |
| ------------------- | ------------------------------------------ |
| `@ci`               | Tests that should run on every CI pipeline |
| `@smoke`            | Critical path tests for quick validation   |
| `@rosa`             | ROSA-specific functionality                |
| `@osd`              | OpenShift Dedicated tests                  |
| `@cluster-creation` | Long-running cluster creation tests        |

Apply tags at the `test.describe` level for the whole suite, or on individual `test()` calls for granular control. Every test should have at least one tag.

## Q: Can I use `test.only` or `test.skip` during development?

- **`test.only`:** Fine during local development to focus on a specific test, but never commit it -- it will silently skip all other tests in CI.
- **`test.skip`:** Acceptable only with a tracking reference (e.g., JIRA ticket) explaining why. Permanent skips without tracking are an anti-pattern:

```typescript
// ✅ Acceptable: Skip with tracking
test.skip('broken feature - JIRA-1234', async () => {
  /* ... */
});

// ❌ Bad: Permanent skip with no context
test.skip('this test', async () => {
  /* ... */
});
```
