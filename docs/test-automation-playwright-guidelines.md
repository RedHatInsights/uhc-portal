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
10. [Best Practices](#best-practices)
11. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
12. [Debugging Tests](#debugging-tests)
13. [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)

---

## Project Structure

```
playwright/
├── e2e/                          # Test specification files
│   ├── clusters/                 # Cluster management tests
│   ├── downloads/                # Downloads page tests
│   ├── osd/                      # OpenShift Dedicated tests
│   ├── osd-aws/                  # OSD AWS-specific tests
│   ├── osd-gcp/                  # OSD GCP-specific tests
│   ├── overview/                 # Overview page tests
│   ├── releases/                 # Releases page tests
│   ├── rosa/                     # ROSA Classic tests
│   ├── rosa-hosted/              # ROSA Hosted Control Plane tests
│   └── subscriptions/            # Subscription tests
├── fixtures/                     # Test fixtures and data
│   ├── pages.ts                  # Page object fixtures (DI)
│   ├── storageState.json         # Authentication state
│   ├── osd/                      # OSD test data
│   ├── osd-aws/                  # OSD AWS test data
│   ├── osd-gcp/                  # OSD GCP test data
│   ├── rosa/                     # ROSA test data
│   ├── rosa-hosted/              # ROSA Hosted test data
│   └── subscription/             # Subscription test data
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

| Convention        | Pattern                               | Example                                          |
| ----------------- | ------------------------------------- | ------------------------------------------------ |
| Feature tests     | `<feature>.spec.ts`                   | `downloads.spec.ts`                              |
| Creation tests    | `<product>-<type>-creation.spec.ts`   | `osd-ccs-aws-cluster-creation.spec.ts`           |
| Validation tests  | `<product>-wizard-validation.spec.ts` | `rosa-cluster-classic-wizard-validation.spec.ts` |
| Compound features | `<feature>-<subfeature>.spec.ts`      | `cluster-list.spec.ts`                           |

### Page Objects

| Convention   | Pattern                           | Example                                     |
| ------------ | --------------------------------- | ------------------------------------------- |
| Page class   | `<Feature>Page`                   | `ClusterListPage`, `DownloadsPage`          |
| File name    | `<feature>-page.ts`               | `cluster-list-page.ts`, `downloads-page.ts` |
| Wizard pages | `create-<product>-wizard-page.ts` | `create-rosa-wizard-page.ts`                |

### Test Data Files

| Convention      | Pattern                 | Example                                            |
| --------------- | ----------------------- | -------------------------------------------------- |
| Validation data | `<spec-name>.spec.json` | `rosa-cluster-classic-wizard-validation.spec.json` |
| Creation data   | `<spec-name>.spec.json` | `osd-ccs-aws-cluster-creation.spec.json`           |

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
    await yourFeatureNewPage.isyourFeatureNewPage();
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

5. **CSS selectors** (Last resort)
   ```typescript
   this.page.locator('button.submit-btn');
   this.page.locator('#cluster-name-input');
   this.page.locator('[aria-label="Close"]');
   ```
   > ⚠️ **Note:** PatternFly class selectors (e.g., `.pf-c-button`, `.pf-m-primary`, `.pf-v5-c-*`) are **not recommended** as they are framework-specific and may change between versions.

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

> **Note:** The project uses ES modules (`"module": "esnext"` in tsconfig) with `"resolveJsonModule": true`. Always use `import` syntax for JSON fixtures rather than `require()`.

### Environment Variables

Access environment variables from `playwright.env.json`:

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

### Available Tags

| Tag                  | Description             | When to Use                        |
| -------------------- | ----------------------- | ---------------------------------- |
| `@ci`                | CI pipeline tests       | Tests for every PR                 |
| `@smoke`             | Smoke tests             | Critical path validation           |
| `@wizard-validation` | Wizard validation tests | Form validation tests              |
| `@rosa`              | ROSA tests              | All ROSA-related tests             |
| `@rosa-classic`      | ROSA Classic tests      | Classic control plane tests        |
| `@rosa-hosted`       | ROSA HCP tests          | Hosted control plane tests         |
| `@osd`               | OSD tests               | OpenShift Dedicated tests          |
| `@cluster-creation`  | Cluster creation tests  | Full creation flows                |
| `@day1`              | Day 1 operations        | Cluster creation and initial setup |
| `@day2`              | Day 2 operations        | Post-creation cluster management   |

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

### Q: Why do we have single navigation in serial tests?

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

### Q: When should I use the `page` fixture directly vs. a page object fixture?

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

### Q: Why do we import `test` and `expect` from `../../fixtures/pages` instead of `@playwright/test`?

Our custom `fixtures/pages.ts` extends Playwright's base `test` object with project-specific fixtures like `navigateTo`, `clusterListPage`, and other page objects. Importing from `@playwright/test` directly would give you a `test` function that doesn't know about these fixtures, and you'd get TypeScript errors when trying to destructure them. Always import from the fixtures file:

```typescript
// ✅ Correct
import { test, expect } from '../../fixtures/pages';

// ❌ Wrong — custom fixtures won't be available
import { test, expect } from '@playwright/test';
```

### Q: Why is `networkidle` discouraged even though Playwright supports it?

`networkidle` waits until there are no network connections for 500ms. In modern web apps that use polling, WebSockets, or long-lived API connections (like our portal), the network never truly goes "idle," causing tests to hang until they time out. Instead, wait for a **specific, visible element** that signals the page is ready:

```typescript
// ❌ May hang indefinitely on pages with background polling
await page.waitForLoadState('networkidle');

// ✅ Wait for the actual content you need
await expect(page.getByRole('heading', { name: 'Clusters' })).toBeVisible();
await clusterListPage.waitForDataReady();
```

### Q: How do I fix "Auth failure" or "storageState not found" errors?

The authentication storage state (`storageState.json`) is created during the global setup and reused across workers. If it becomes stale or corrupted:

1. **Delete the file:** Remove `storageState.json` from the project root and re-run tests. Global setup will re-authenticate.
2. **Check credentials:** Ensure your environment variables (login URL, username, password) are correctly set in `playwright.env.json`.

### Q: How do I run just one specific test or test file?

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

### Q: My test passes locally but fails in CI. How do I debug it?

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

### Q: How do I debug a failing test locally?

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

### Q: Should locator methods in page objects be `async` or synchronous?

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

### Q: When should I create a new page object vs. adding to an existing one?

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

### Q: How do I handle test data like cluster names or configuration values?

Use **JSON fixture files** stored in `playwright/fixtures/<feature>/`. These keep test data separate from test logic and make it easy to update values without modifying specs:

```typescript
// Load fixture data
const testData = require('../../fixtures/rosa/rosa-cluster.spec.json');

test('create cluster', async ({ createRosaWizardPage }) => {
  await createRosaWizardPage.clusterNameInput().fill(testData.clusterName);
});
```

Avoid hard-coding test data directly in spec files, especially values that may change across environments.

### Q: How do I handle tests that need data that might not exist?

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

### Q: What tags should I use for my tests?

| Tag                 | When to Use                                |
| ------------------- | ------------------------------------------ |
| `@ci`               | Tests that should run on every CI pipeline |
| `@smoke`            | Critical path tests for quick validation   |
| `@rosa`             | ROSA-specific functionality                |
| `@osd`              | OpenShift Dedicated tests                  |
| `@cluster-creation` | Long-running cluster creation tests        |

Apply tags at the `test.describe` level for the whole suite, or on individual `test()` calls for granular control. Every test should have at least one tag.

### Q: Can I use `test.only` or `test.skip` during development?

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

---

## Additional Resources

- [Playwright Official Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Best Practices](https://playwright.dev/docs/pom)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
