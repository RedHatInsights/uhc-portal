# Test Automation Guidelines

## Table of Contents

1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [Creating New Test Specs](#creating-new-test-specs)
4. [Page Object Model (POM)](#page-object-model-pom)
5. [Using Fixtures](#using-fixtures)
6. [Selector Strategy](#selector-strategy)
7. [Test Organization](#test-organization)
8. [Test Data Management](#test-data-management)
9. [Tagging Strategy](#tagging-strategy)
   - [Test Execution Tiers](#test-execution-tiers)
   - [Choosing the Right Tier for New Tests](#choosing-the-right-tier-for-new-tests)
10. [Best Practices](#best-practices)
11. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
12. [Debugging Tests](#debugging-tests)
13. [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)

---

## Project Structure

```text
playwright/
├── e2e/                          # Test specification files
│   ├── clusters/                 # Cluster management tests
│   ├── rosa/                     # ROSA Classic tests
│   ├── osd-aws/                  # OSD on AWS tests
│   └── ...                       # Other feature folders
├── fixtures/                     # Test fixtures and data
│   ├── pages.ts                  # Page object fixtures (DI)
│   ├── storageState.json         # Authentication state
│   ├── rosa/                     # ROSA Classic test data
│   ├── osd-aws/                  # OSD AWS test data
│   └── ...                       # Other fixture folders
├── page-objects/                 # Page Object Models
│   ├── base-page.ts              # Base page with common methods
│   └── *-page.ts                 # Feature-specific page objects
└── support/                      # Support utilities
    ├── auth-config.ts            # Authentication configuration
    ├── custom-commands.ts        # Custom helper commands
    ├── global-setup.ts           # Global test setup
    ├── global-teardown.ts        # Global test teardown
    └── playwright-constants.ts   # Constants and timeouts
```

---

## Naming Conventions

### Test Files

| Convention        | Pattern                               | Example                                           |
| ----------------- | ------------------------------------- | ------------------------------------------------- |
| Feature tests     | `<feature>.spec.ts`                   | `downloads.spec.ts`                               |
| Creation tests    | `<product>-<type>-creation.spec.ts`   | `osd-ccs-aws-creation.spec.ts`                    |
| Validation tests  | `<product>-wizard-validation.spec.ts` | `rosa-classic-wizard-validation.spec.ts`          |
| Compound features | `<feature>-<subfeature>.spec.ts`      | `subscription-list.spec.ts, cluster-list.spec.ts` |

### Page Objects

| Convention   | Pattern                           | Example                                     |
| ------------ | --------------------------------- | ------------------------------------------- |
| Page class   | `<Feature>Page`                   | `ClusterListPage`, `DownloadsPage`          |
| File name    | `<feature>-page.ts`               | `cluster-list-page.ts`, `downloads-page.ts` |
| Wizard pages | `create-<product>-wizard-page.ts` | `create-rosa-wizard-page.ts`                |

### Test Data Files

| Convention      | Pattern                 | Example                                    |
| --------------- | ----------------------- | ------------------------------------------ |
| Validation data | `<spec-name>.spec.json` | `rosa-classic-wizard-validation.spec.json` |
| Creation data   | `<spec-name>.spec.json` | `osd-ccs-aws-creation.spec.json`           |

### Test Titles

```typescript
// ✅ Good: Descriptive and action-oriented
test('can expand and collapse rows', ...);
test('validates cluster ID format', ...);
test('navigates to cluster details on row click', ...);

// ❌ Bad: Vague or passive
test('test download', ...);
test('cluster list works', ...);
test('validation', ...);
```

---

## Creating New Test Specs

### Step 1: Create the Spec File

If a page object fixture **already exists** in `fixtures/pages.ts`, you can use it directly:

```typescript
// playwright/e2e/downloads/downloads-feature.spec.ts
import { test, expect } from '../../fixtures/pages';

test.describe.serial('Downloads feature', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ navigateTo, downloadsPage }) => {
    await navigateTo('/openshift/downloads');
    await downloadsPage.isDownloadsPage();
  });

  test('can view pull secret', async ({ downloadsPage }) => {
    await expect(downloadsPage.pullSecretRow()).toBeVisible();
  });

  test('can download CLI tools', async ({ page, downloadsPage }) => {
    // Test implementation
  });
});
```

If you need a **new page object**, first check if one exists in `page-objects/`. If not, follow Steps 2 and 3 below to create the page object and register it as a fixture.

**Example template for new features** (replace `featurePage` with your actual fixture name after completing Steps 2-3):

```typescript
// playwright/e2e/<feature>/<feature-name>.spec.ts
import { test, expect } from '../../fixtures/pages';

test.describe.serial('Feature name', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ navigateTo, yourFeatureNewPage }) => {
    await navigateTo('feature-url');
    await yourFeatureNewPage.isYourFeatureNewPage();
  });

  test('first test case', async ({ page, yourFeatureNewPage }) => {
    // Test implementation
  });

  test('second test case', async ({ yourFeatureNewPage }) => {
    // Test implementation
  });
});
```

### Step 2: Create or Update Page Object

If a page object doesn't exist for your feature:

```typescript
// playwright/page-objects/feature-page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class FeaturePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Page validation
  async isFeaturePage(): Promise<void> {
    await this.assertUrlIncludes('/feature');
    await expect(this.page.locator('h1')).toContainText('Feature Title');
  }

  // Element locators (return Locator, not Promise)
  featureButton(): Locator {
    return this.page.getByTestId('feature-button');
  }

  featureInput(): Locator {
    return this.page.getByTestId('feature-input');
  }

  // Actions (async methods)
  async performAction(value: string): Promise<void> {
    await this.featureInput().fill(value);
    await this.featureButton().click();
  }
}
```

### Step 3: Register Page Object in Fixtures

```typescript
// playwright/fixtures/pages.ts

// 1. Import the page object
import { FeaturePage } from '../page-objects/feature-page';

// 2. Add to WorkerFixtures type
type WorkerFixtures = {
  // ... existing fixtures
  featurePage: FeaturePage;
};

// 3. Add the fixture definition
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ... existing fixtures

  featurePage: [
    async ({ authenticatedPage }, use) => {
      const pageObject = new FeaturePage(authenticatedPage);
      await use(pageObject);
    },
    { scope: 'worker' },
  ],
});
```

### Step 4: Create Test Data (if needed)

```json
// playwright/fixtures/<feature>/<feature-name>.spec.json
{
  "ValidationScenarios": {
    "FieldName": {
      "InvalidValues": ["value1", "value2"],
      "InvalidErrors": ["Error message 1", "Error message 2"],
      "ValidValue": "valid-value"
    }
  },
  "TestData": {
    "defaultValue": "test-value",
    "expectedResult": "expected-output"
  }
}
```

---

## Page Object Model (POM)

### Base Page Structure

All page objects extend `BasePage` which provides common utilities:

```typescript
class BasePage {
  protected page: Page;

  // Navigation
  async goto(path: string): Promise<void>;
  async assertUrlIncludes(path: string): Promise<void>;

  // Element interaction
  async click(selector: string | Locator): Promise<void>;
  async fill(selector: string | Locator, text: string): Promise<void>;
  async getText(selector: string | Locator): Promise<string>;
  async isVisible(selector: string | Locator): Promise<boolean>;

  // Waiting
  async waitForSelector(selector: string, options?): Promise<Locator>;
  async waitForLoadState(state?): Promise<void>;

  // Helpers
  getByTestId(testId: string): Locator;

  // Screenshots
  async captureScreenshot(name: string, options?): Promise<string>;
  async captureErrorScreenshot(error: Error, context?: string): Promise<string>;
}
```

### Page Object Patterns

#### Pattern 1: Locator Methods (Return `Locator`)

```typescript
// ✅ Good: Return Locator for chainability and auto-waiting
filterInput(): Locator {
  return this.page.getByTestId('filter-input');
}

submitButton(): Locator {
  return this.page.getByRole('button', { name: 'Submit' });
}

// Usage in tests
await page.featurePage.filterInput().fill('search term');
await page.featurePage.submitButton().click();
```

#### Pattern 2: Action Methods (Async)

```typescript
// ✅ Good: Encapsulate complex actions
async selectOption(optionName: string): Promise<void> {
  await this.optionDropdown().click();
  await this.page.getByRole('option', { name: optionName }).click();
}

async waitForDataReady(): Promise<void> {
  await this.page.locator('div[data-ready="true"]').waitFor({ timeout: 120000 });
}
```

#### Pattern 3: Assertion Methods

```typescript
// ✅ Good: Page-specific assertions
async isClusterListPage(): Promise<void> {
  await this.assertUrlIncludes('/openshift/cluster-list');
  await expect(this.page.locator('h1')).toContainText('Cluster List');
}

async isTextContainsInPage(text: string, shouldExist: boolean = true): Promise<void> {
  if (shouldExist) {
    await expect(this.page.getByText(text)).toBeVisible();
  } else {
    await expect(this.page.getByText(text)).not.toBeVisible();
  }
}
```

---

## Using Fixtures

### Worker-Scoped Fixtures

All fixtures are **worker-scoped** for serial test suites:

```typescript
// ✅ Correct: Use fixtures from test signature
test.describe.serial('My feature', () => {
  test.beforeAll(async ({ navigateTo, featurePage }) => {
    await navigateTo('feature');
    await featurePage.isFeaturePage();
  });

  test('test 1', async ({ featurePage }) => {
    await featurePage.doSomething();
  });

  test('test 2', async ({ featurePage }) => {
    // Same page instance, state maintained
    await featurePage.doSomethingElse();
  });
});
```

### Available Fixtures

| Fixture                | Description                            |
| ---------------------- | -------------------------------------- |
| `page`                 | Pre-authenticated page (worker-scoped) |
| `navigateTo`           | Navigation helper function             |
| `clusterListPage`      | ClusterListPage instance               |
| `clusterDetailsPage`   | ClusterDetailsPage instance            |
| `createRosaWizardPage` | CreateRosaWizardPage instance          |
| `createOSDWizardPage`  | CreateOSDWizardPage instance           |
| `downloadsPage`        | DownloadsPage instance                 |
| `registerClusterPage`  | RegisterClusterPage instance           |
| `tokensPage`           | TokensPage instance                    |

> **Note:** The examples throughout this document use illustrative fixture names (e.g., `featurePage`, `registerPage`) to demonstrate patterns. Always refer to `fixtures/pages.ts` for the actual list of available fixtures. If you need a fixture that doesn't exist, follow the [Fixture Registration](#step-3-register-page-object-in-fixtures) steps to create it.

### Navigation Helper

```typescript
// Use navigateTo for clean navigation
test.beforeAll(async ({ navigateTo }) => {
  await navigateTo('cluster-list');
});

// With wait options (avoid 'networkidle' — it can hang with polling/websockets)
test('my test', async ({ navigateTo }) => {
  await navigateTo('cluster-list', { waitUntil: 'domcontentloaded' });
});
```

---

## Selector Strategy

### Priority Order (Best to Worst)

1. **Accessible roles with names** (Most stable)

   ```typescript
   this.page.getByRole('button', { name: 'Submit' });
   this.page.getByRole('textbox', { name: 'Email' });
   ```

2. **Label text**

   ```typescript
   this.page.getByLabel('Email address');
   ```

3. **Text content** (Use sparingly)

   ```typescript
   this.page.getByText('Submit application');
   ```

4. **`data-testid` attributes**

   ```typescript
   this.page.getByTestId('submit-button');
   ```

5. **CSS selectors** — Avoid
   ```typescript
   this.page.locator('button.submit-btn');
   this.page.locator('#cluster-name-input');
   this.page.locator('[aria-label="Close"]');
   ```
   > ⚠️ **Note:** CSS selectors are brittle and tightly coupled to implementation details. PatternFly class selectors (e.g., `.pf-c-button`, `.pf-m-primary`, `.pf-v5-c-*`) are especially problematic as they may change between framework versions. Some existing tests use CSS selectors due to unavoidable circumstances (e.g., elements lacking accessible roles or test IDs). When you encounter these, the recommendation is to update the application source to add proper accessible attributes and then migrate the selector to a higher-priority strategy above.

### Selector Examples

```typescript
// ✅ Best: Accessible roles with names (preferred)
submitButton(): Locator {
  return this.page.getByRole('button', { name: 'Submit' });
}

clusterNameInput(): Locator {
  return this.page.getByRole('textbox', { name: /cluster name/i });
}

// ✅ Good: Label text
emailInput(): Locator {
  return this.page.getByLabel('Email address');
}

// ✅ Acceptable: data-testid when no better option exists
clusterCard(): Locator {
  return this.page.getByTestId('cluster-card');
}

// ❌ Bad: PatternFly class selectors (framework-specific, may change between versions)
submitButton(): Locator {
  return this.page.locator('.pf-c-button.pf-m-primary');
}

// ❌ Bad: Dynamic IDs (brittle, implementation-dependent)
clusterNameInput(): Locator {
  return this.page.locator('input#name-field-35');
}
```

### Filtering and Chaining

```typescript
// Filter by parent
pullSecretRow(): Locator {
  return this.page.locator('tr').filter({ hasText: 'Pull secret' });
}

// Chain locators
downloadButton(): Locator {
  return this.pullSecretRow().getByRole('button', { name: 'Download' });
}

// nth element
firstClusterLink(): Locator {
  return this.page.locator('td[data-label="Name"] a').first();
}
```

---

## Test Organization

### Serial vs Parallel Tests

#### Use `test.describe.serial` When:

- Tests represent a user flow (wizard steps)
- Tests build on each other's state
- Order matters for the test scenario

```typescript
test.describe.serial('Cluster creation wizard', () => {
  test('Step 1: Select control plane', async ({ createRosaWizardPage }) => {
    await createRosaWizardPage.selectControlPlane('Classic');
  });

  test('Step 2: Configure accounts', async ({ createRosaWizardPage }) => {
    // Continues from Step 1
    await createRosaWizardPage.configureAccounts();
  });

  test('Step 3: Set cluster details', async ({ createRosaWizardPage }) => {
    // Continues from Step 2
    await createRosaWizardPage.setClusterDetails();
  });
});
```

#### Use Regular `test.describe` When:

- Tests are independent
- Each test sets up its own state
- Order doesn't matter

```typescript
test.describe('Cluster list validation', () => {
  test.beforeEach(async ({ navigateTo, clusterListPage }) => {
    await navigateTo('cluster-list');
    await clusterListPage.waitForDataReady();
  });

  test('can filter by name', async ({ clusterListPage }) => {
    // Independent test
  });

  test('can sort by status', async ({ clusterListPage }) => {
    // Independent test
  });
});
```

### Test Lifecycle Hooks

```typescript
test.describe.serial('Feature tests', { tag: ['@ci'] }, () => {
  // Runs once before all tests in the suite
  test.beforeAll(async ({ navigateTo, featurePage }) => {
    await navigateTo('feature-page');
    await featurePage.waitForPageReady();
  });

  // Runs before each test
  test.beforeEach(async ({ page }) => {
    // Reset specific state if needed
  });

  // Runs after each test
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      // Capture debug info on failure
    }
  });

  // Runs once after all tests
  test.afterAll(async () => {
    // Cleanup resources
  });
});
```

---

## Test Data Management

### External Test Data Files

Store complex test data in JSON files:

```json
// fixtures/rosa/rosa-cluster-classic-wizard-validation.spec.json
{
  "ClusterSettings": {
    "Details": {
      "InvalidClusterNamesValues": ["a", "cluster name with spaces", "UPPERCASE"],
      "InvalidClusterNamesErrors": [
        "Cluster names must be at least 3 characters",
        "Cluster names cannot contain spaces",
        "Cluster names must be lowercase"
      ]
    }
  }
}
```

Use in tests:

```typescript
import validationData from '../../fixtures/rosa/rosa-cluster-classic-wizard-validation.spec.json';

test('validates cluster name', async ({ createRosaWizardPage }) => {
  for (
    let i = 0;
    i < validationData.ClusterSettings.Details.InvalidClusterNamesValues.length;
    i++
  ) {
    await createRosaWizardPage.setClusterName(
      validationData.ClusterSettings.Details.InvalidClusterNamesValues[i],
    );
    await createRosaWizardPage.isTextContainsInPage(
      validationData.ClusterSettings.Details.InvalidClusterNamesErrors[i],
    );
  }
});
```

> **Note:** Both `import` and `require()` are acceptable for loading JSON fixtures. The `import` syntax provides type inference on JSON keys, while `require()` is widely used across the existing test suite and works reliably at runtime. Choose either approach consistently within a file.

### Environment Variables

Access environment variables from `playwright.env.json`. Refer to the [Playwright README — Configuration Files](../playwright/README.md#configuration-files) for the expected structure and configuration details.

```typescript
test.describe.serial('AWS cluster tests', () => {
  const awsAccountID = process.env.QE_AWS_ID || '';
  const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';

  test('configure AWS account', async ({ createRosaWizardPage }) => {
    await createRosaWizardPage.selectAWSAccount(awsAccountID);
  });
});
```

### Dynamic Test Data

Generate unique values for each test run:

```typescript
const clusterName = `ocmui-playwright-smoke-${Math.random().toString(36).substring(7)}`;
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
```

---

## Tagging Strategy

### Test Execution Tiers

Every test belongs to one or more execution tiers. Understanding these tiers is essential when writing new tests, as they determine **when** and **where** a test runs.

#### CI Tests (`@ci`)

CI tests are the first line of defense. They run **on every pull request** to catch regressions before code is merged.

- **Purpose:** Validate basic functionality and catch obvious breakages at PR level.
- **Scope:** Lightweight read-only or low-impact actions — page loads, element visibility, navigation, form validation, list rendering, and UI component behavior.
- **Execution environment:** CI pipeline, triggered automatically on every PR.
- **Expectations:** Fast execution (each spec should complete within a few minutes), no infrastructure side-effects, no cluster creation or deletion.
- **Examples:** Verifying the cluster list page renders, downloads page content is visible, wizard field validation errors appear correctly.

```typescript
test.describe.serial('Downloads page', { tag: ['@ci'] }, () => {
  test('page loads and shows pull secret section', async ({ downloadsPage }) => {
    await expect(downloadsPage.pullSecretRow()).toBeVisible();
  });
});
```

#### Smoke Tests (`@smoke`)

Smoke tests verify that **all critical functional paths are working** end-to-end. They act as a system stability gate.

- **Purpose:** Confirm that core Day 0 (pre-creation) and Day 1 (creation and initial setup) workflows function correctly after a deployment.
- **Scope:** Critical user journeys only — cluster creation wizards, key Day 1 operations. These are the paths that, if broken, would block users from performing essential tasks.
- **Execution environment:** Runs **daily** against the **staging** environment.
- **Expectations:** Tests may create real resources (clusters, subscriptions). Each test should be robust and reliable — flaky tests undermine the value of the smoke suite. Keep the suite focused; not every feature needs a smoke test, only the ones critical to system usability.
- **Examples:** ROSA Classic cluster creation, ROSA HCP cluster creation, OSD cluster creation.

```typescript
test.describe.serial(
  'ROSA Classic cluster creation',
  { tag: ['@smoke', '@rosa', '@rosa-classic', '@day1', '@cluster-creation'] },
  () => {
    test('Step 1: Configure accounts and roles', async ({ createRosaWizardPage }) => {
      // Critical path: account selection and role configuration
    });

    test('Step 2: Set cluster details and create', async ({ createRosaWizardPage }) => {
      // Critical path: cluster provisioning
    });
  },
);
```

#### Advanced Tests (`@advanced`, `@day1`, `@day2`)

Advanced tests provide **comprehensive coverage** across all feature combinations, configurations, and edge cases. Use the `@day1` and `@day2` tags alongside `@advanced` to indicate which lifecycle phase the test covers.

- **Purpose:** Exercise the full breadth of functionality, including Day 1 (cluster creation and initial setup), Day 2 (post-creation management such as scaling, upgrades, and configuration changes), and Day 0 operations across different product flavors and configuration permutations.
- **Scope:** Multi-flavored cluster creation (different regions, network configurations, encryption options, machine types), Day 2 operations (machine pool management, scaling, upgrades, identity provider configuration, networking changes), and cross-feature interactions.
- **Execution environment:** Currently executed on-demand against staging or dedicated test environments. A daily scheduled run is planned once the remaining tests are ported/created.
- **Expectations:** Longer execution time is acceptable. Tests can cover complex, multi-step workflows and edge cases that are too slow or resource-intensive for CI or smoke runs.
- **Examples:** Creating a ROSA cluster with private link + KMS encryption + custom machine pools, then performing Day 2 operations like adding an IDP, scaling machine pools, and triggering an upgrade.

```typescript
test.describe.serial(
  'ROSA Classic private cluster with custom networking',
  { tag: ['@advanced', '@rosa', '@rosa-classic', '@day1', '@cluster-creation'] },
  () => {
    test('Create cluster with PrivateLink and KMS encryption', async ({ createRosaWizardPage }) => {
      // Advanced: specific network + encryption combination
    });
  },
);
```

### Choosing the Right Tier for New Tests

Use the following decision guide when adding a new test:

| Question                                                                                        | If Yes                                                      | If No          |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------- |
| Does it verify basic page rendering, navigation, or form validation without creating resources? | Tag `@ci`                                                   | Continue below |
| Does it cover a critical Day 0 or Day 1 workflow that, if broken, would block users?            | Tag `@smoke`                                                | Continue below |
| Does it involve cluster creation or initial setup?                                              | Also tag `@day1`                                            | Continue below |
| Does it involve post-creation operations (scaling, upgrades, IDP, networking, etc.)?            | Also tag `@day2`                                            | Continue below |
| Does it test a specific configuration variant, Day 2 operation, or edge case?                   | Tag `@advanced` (with `@day1` and/or `@day2` as applicable) | Revisit scope  |

**A test can belong to multiple tiers.** For example, a basic wizard validation test might be tagged `@ci` (runs on every PR) and also `@smoke` (validates a critical path). However, be intentional — adding a slow cluster-creation test to `@ci` will degrade PR feedback time for all contributors.

**Rule of thumb:**

- If in doubt, start with `@advanced` and promote to `@smoke` or `@ci` only when the test is fast, stable, and covers a critical path.
- Always pair with `@day1` (creation/initial setup) or `@day2` (post-creation management) to indicate the lifecycle phase.
- `@ci` tests must be **fast and side-effect-free**.
- `@smoke` tests should be **reliable and focused on critical paths** (typically `@day1`).
- `@advanced` tests can be **thorough and resource-intensive** (use `@day1`, `@day2`, or both).

### Available Tags

| Tag                  | Description             | When to Use                                                   |
| -------------------- | ----------------------- | ------------------------------------------------------------- |
| `@ci`                | CI pipeline tests       | Fast, side-effect-free tests that run on every PR             |
| `@smoke`             | Smoke tests             | Critical Day 0/Day 1 paths; runs against staging              |
| `@advanced`          | Advanced tests          | Comprehensive coverage, multi-flavor and Day 2 ops; scheduled |
| `@wizard-validation` | Wizard validation tests | Form validation tests                                         |
| `@rosa`              | ROSA tests              | All ROSA-related tests                                        |
| `@rosa-classic`      | ROSA Classic tests      | Classic control plane tests                                   |
| `@rosa-hosted`       | ROSA HCP tests          | Hosted control plane tests                                    |
| `@osd`               | OSD tests               | OpenShift Dedicated tests                                     |
| `@day1`              | Day 1 operations        | Cluster creation and initial setup                            |
| `@day2`              | Day 2 operations        | Post-creation cluster management                              |

### Day 1 and Day 2 Test Dependencies

**Important:** Day 2 tests have a dependency on Day 1 cluster availability.

- **`@day1`**: Tests that create clusters or perform initial setup operations. These tests provision the resources needed for day 2 operations.
- **`@day2`**: Tests that perform post-creation operations like machine pool management, upgrades, scaling, etc. These tests **require** an existing cluster created by a day 1 spec.

**Before creating or running a `@day2` spec:**

1. Ensure the corresponding `@day1` spec exists and has been executed successfully
2. Verify the day 1 cluster is available and in a ready state
3. Reference the day 1 cluster name/ID in your day 2 spec fixture

```typescript
// Example: Day 2 spec referencing a Day 1 cluster
import fixture from '../../fixtures/rosa/rosa-cluster-day1.spec.json';

test.describe.serial(
  'ROSA Machine Pool Management',
  {
    tag: ['@day2', '@rosa', '@rosa-classic'],
  },
  () => {
    // Option 1: Reference cluster name from fixture file (recommended)
    const clusterName = fixture.clusterName;

    // Option 2: Hardcode cluster name (if cluster is pre-existing)
    // const clusterName = 'ocmui-playwright-day1-cluster';

    // Note: 'clusterDetailsPage' is an illustrative fixture name
    // Check fixtures/pages.ts for actual available fixtures
    test('should add machine pool', async ({ clusterDetailsPage }) => {
      // Day 2 operations on existing cluster
    });
  },
);
```

### Applying Tags

```typescript
// Single tag
test.describe.serial('Downloads page', { tag: ['@ci'] }, () => {
  // ...
});

// Multiple tags
test.describe.serial(
  'ROSA Classic validation',
  {
    tag: ['@smoke', '@wizard-validation', '@rosa', '@rosa-classic'],
  },
  () => {
    // ...
  },
);

// Individual test tags
test('critical test', { tag: ['@smoke'] }, async () => {
  // ...
});
```

### Running Tagged Tests

```bash
# Run smoke tests only
yarn playwright test --grep="@smoke"

# Run ROSA tests
yarn playwright test --grep="@rosa"

# Exclude specific tags
yarn playwright test --grep-invert="@cluster-creation"

# Combine tags
yarn playwright test --grep="@smoke" --grep="@rosa"
```

---

## Best Practices

### 1. Wait for Elements Properly

```typescript
// ✅ Good: Use built-in auto-waiting
await expect(button).toBeVisible();
await button.click();

// ✅ Good: Wait for specific elements or page object methods
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await downloadsPage.waitForDataReady();

// ❌ Bad: Arbitrary delays
await page.waitForTimeout(5000);
```

### 2. Write Atomic Tests

```typescript
// ✅ Good: Self-contained test
// Note: 'featurePage' is illustrative - use an actual fixture from pages.ts
test('validates email format', async ({ featurePage }) => {
  await featurePage.emailInput().fill('invalid-email');
  await expect(featurePage.emailError()).toContainText('Invalid email format');
});

// ❌ Bad: Test depends on previous test state
test('validates email format', async ({ featurePage }) => {
  // Assumes form is already open from previous test
  await featurePage.emailInput().fill('invalid-email');
});
```

### 3. Use Meaningful Assertions

```typescript
// ✅ Good: Specific assertions
await expect(clusterListPage.filterInput()).toHaveValue('my-cluster');
await expect(page.locator('h1')).toContainText('Cluster List');
await expect(createButton).toBeEnabled();

// ❌ Bad: Overly broad assertions
await expect(page).toBeTruthy();
```

### 4. Clean Up Test State

```typescript
test.afterAll(async () => {
  // Clean up downloaded files
  const downloadsFolder = path.join(process.cwd(), 'test-results', 'downloads');
  if (fs.existsSync(pullSecretPath)) {
    fs.unlinkSync(pullSecretPath);
  }
});
```

### 5. Handle Flaky Elements

```typescript
// ✅ Good: Wait for element to be stable
await page.locator('.dropdown').click();
await page.waitForSelector('.dropdown-menu[data-ready="true"]');

// ✅ Good: Retry flaky operations
await expect(async () => {
  await page.locator('button').click();
  await expect(page.locator('.result')).toBeVisible();
}).toPass({ timeout: 10000 });
```

### 6. Use Direct Navigation Instead of Browser History

```typescript
// ❌ Bad: goBack() can be unreliable and lead to flaky tests
test('test with back navigation', async ({ page, clusterListPage }) => {
  await clusterListPage.viewClusterArchives().click();
  await page.goBack(); // Avoid - browser history state is unpredictable
});

// ✅ Good: Navigate directly to the desired page
test('test with direct navigation', async ({ navigateTo, clusterListPage }) => {
  await clusterListPage.viewClusterArchives().click();
  // Perform actions on archives page...

  // Navigate directly instead of using goBack()
  await navigateTo('cluster-list');
  await clusterListPage.waitForDataReady();
});
```

---

## Anti-Patterns to Avoid

### ❌ Don't Use Hard-Coded Waits or Network Idle

```typescript
// ❌ Bad: Hard-coded timeout
await page.waitForTimeout(5000);

// ❌ Bad: networkidle can hang with polling/websockets and is slow
await page.waitForLoadState('networkidle');

// ✅ Good: Wait for specific elements to be visible
await expect(element).toBeVisible();
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
```

### ❌ Don't Use Brittle Selectors

```typescript
// ❌ Bad
this.page.locator('div > div > button.pf-c-button');
this.page.locator('#auto-generated-id-12345');

// ✅ Good
this.page.getByRole('button', { name: 'Submit' });
this.page.getByLabel('Email address');
```

### ❌ Don't Store State in Page Objects

```typescript
// ❌ Bad: Page object stores test state
class BadPage extends BasePage {
  private currentClusterName: string = '';

  async createCluster(name: string) {
    this.currentClusterName = name; // Don't do this
  }
}

// ✅ Good: Let the page maintain state
class GoodPage extends BasePage {
  async createCluster(name: string) {
    await this.clusterNameInput().fill(name);
    await this.submitButton().click();
  }
}
```

### ❌ Don't Use Parallel Tests with Worker-Scoped Fixtures

```typescript
// ❌ Bad: Parallel tests with shared page
test.describe('Parallel tests', () => {
  test('test 1', async ({ page }) => {
    await page.goto('page-a');  // Conflicts!
  });

  test('test 2', async ({ page }) => {
    await page.goto('page-b');  // Same page instance!
  });
});

// ✅ Good: Serial tests
test.describe.serial('Serial tests', () => {
  test('test 1', async ({ page }) => { ... });
  test('test 2', async ({ page }) => { ... });
});
```

### ❌ Don't Ignore Test Failures

```typescript
// ❌ Bad: Catching and ignoring errors
try {
  await element.click();
} catch {
  // Silently fail
}

// ✅ Good: Let failures propagate or handle explicitly
await element.click(); // Will fail with clear error message
```

### ❌ Don't Skip Tests Without Tracking

```typescript
// ❌ Bad: Permanent skip with no tracking
test.skip('broken test', async () => { ... });

// ✅ Good: Skip with issue reference
test.skip('broken test - JIRA-1234', async () => { ... });

// ✅ Better: Fix the test or remove it
```

---

## Debugging Tests

### Run in Different Modes

```bash
# UI Mode (Interactive)
yarn playwright-ui

# Headed Mode (See browser)
yarn playwright-headed

# Debug Mode (Step through)
yarn playwright-debug

# Specific test file
yarn playwright test playwright/e2e/downloads/downloads.spec.ts --headed
```

### Add Debug Output

```typescript
test('debug test', async ({ page, featurePage }) => {
  // Log current URL
  console.log('Current URL:', page.url());

  // Take screenshot for debugging
  await page.screenshot({ path: 'debug-screenshot.png' });

  // Pause execution (in debug mode)
  await page.pause();
});
```

### Check Page State

```typescript
test('validate state', async ({ page }) => {
  // Check URL
  expect(page.url()).toContain('/expected-path');

  // Check page content
  const content = await page.content();
  console.log('Page has expected element:', content.includes('expected-text'));

  // Check element visibility
  const isVisible = await page.locator('.element').isVisible();
  console.log('Element visible:', isVisible);
});
```

### Using Trace Viewer

```bash
# Run with tracing
yarn playwright test --trace on

# Open trace viewer
yarn playwright show-trace test-results/trace.zip
```

### Common Issues and Solutions

| Issue             | Likely Cause             | Solution                                  |
| ----------------- | ------------------------ | ----------------------------------------- |
| Blank page        | Navigation timing        | Wait for a specific element to be visible |
| Element not found | Timing or selector issue | Check selector, add wait                  |
| Stale element     | DOM changed              | Re-query the element                      |
| Auth failure      | Expired storage state    | Delete `storageState.json`                |
| Flaky test        | Race condition           | Add proper waits                          |

---

## Quick Reference

### Test Template

Use an existing fixture from `fixtures/pages.ts`, or replace `yourPageObject` with your custom fixture after creating it:

```typescript
import { test, expect } from '../../fixtures/pages';

test.describe.serial('Feature Name', { tag: ['@ci', '@smoke'] }, () => {
  // Replace 'yourPageObject' with an actual fixture (e.g., downloadsPage, clusterListPage)
  test.beforeAll(async ({ navigateTo, yourPageObject }) => {
    await navigateTo('feature-url');
    await yourPageObject.isYourPage();
  });

  test('should perform action', async ({ yourPageObject }) => {
    await yourPageObject.actionButton().click();
    await expect(yourPageObject.resultElement()).toBeVisible();
  });
});
```

### Page Object Template

Replace `YourFeaturePage` and method names with your feature-specific names:

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class YourFeaturePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isYourFeaturePage(): Promise<void> {
    await this.assertUrlIncludes('/your-feature');
  }

  actionButton(): Locator {
    return this.page.getByTestId('action-button');
  }

  resultElement(): Locator {
    return this.page.getByTestId('result-element');
  }
}
```

### Fixture Registration Template

Add to `fixtures/pages.ts` (replace `yourFeaturePage` and `YourFeaturePage` with your names):

```typescript
yourFeaturePage: [
  async ({ authenticatedPage }, use) => {
    const pageObject = new YourFeaturePage(authenticatedPage);
    await use(pageObject);
  },
  { scope: 'worker' },
],
```

---

## Frequently Asked Questions (FAQ)

For common questions about writing and debugging Playwright tests, see the dedicated **[Playwright FAQ](Playwright-e2e-test-automation-faq.md)**.

---

## Additional Resources

- [Playwright Official Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Best Practices](https://playwright.dev/docs/pom)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
