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

| Convention | Pattern | Example |
|------------|---------|---------|
| Feature tests | `<feature>.spec.ts` | `downloads.spec.ts` |
| Creation tests | `<product>-<type>-creation.spec.ts` | `osd-ccs-aws-cluster-creation.spec.ts` |
| Validation tests | `<product>-wizard-validation.spec.ts` | `rosa-cluster-classic-wizard-validation.spec.ts` |
| Compound features | `<feature>-<subfeature>.spec.ts` | `cluster-list.spec.ts` |

### Page Objects

| Convention | Pattern | Example |
|------------|---------|---------|
| Page class | `<Feature>Page` | `ClusterListPage`, `DownloadsPage` |
| File name | `<feature>-page.ts` | `cluster-list-page.ts`, `downloads-page.ts` |
| Wizard pages | `create-<product>-wizard-page.ts` | `create-rosa-wizard-page.ts` |

### Test Data Files

| Convention | Pattern | Example |
|------------|---------|---------|
| Validation data | `<spec-name>.spec.json` | `rosa-cluster-classic-wizard-validation.spec.json` |
| Creation data | `<spec-name>.spec.json` | `osd-ccs-aws-cluster-creation.spec.json` |

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

```typescript
// playwright/e2e/<feature>/<feature-name>.spec.ts
import { test, expect } from '../../fixtures/pages';

test.describe.serial('Feature name', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ navigateTo, featurePage }) => {
    await navigateTo('feature-url');
    await featurePage.isFeaturePage();
  });

  test('first test case', async ({ page, featurePage }) => {
    // Test implementation
  });

  test('second test case', async ({ featurePage }) => {
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
  async goto(path: string): Promise<void>
  async assertUrlIncludes(path: string): Promise<void>
  
  // Element interaction
  async click(selector: string | Locator): Promise<void>
  async fill(selector: string | Locator, text: string): Promise<void>
  async getText(selector: string | Locator): Promise<string>
  async isVisible(selector: string | Locator): Promise<boolean>
  
  // Waiting
  async waitForSelector(selector: string, options?): Promise<Locator>
  async waitForLoadState(state?): Promise<void>
  
  // Helpers
  getByTestId(testId: string): Locator
  
  // Screenshots
  async captureScreenshot(name: string, options?): Promise<string>
  async captureErrorScreenshot(error: Error, context?: string): Promise<string>
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

| Fixture | Description |
|---------|-------------|
| `page` | Pre-authenticated page (worker-scoped) |
| `navigateTo` | Navigation helper function |
| `clusterListPage` | ClusterListPage instance |
| `clusterDetailsPage` | ClusterDetailsPage instance |
| `createRosaWizardPage` | CreateRosaWizardPage instance |
| `createOSDWizardPage` | CreateOSDWizardPage instance |
| `downloadsPage` | DownloadsPage instance |
| `registerClusterPage` | RegisterClusterPage instance |
| `tokensPage` | TokensPage instance |
| ...and more | See `fixtures/pages.ts` for full list |

### Navigation Helper

```typescript
// Use navigateTo for clean navigation
test.beforeAll(async ({ navigateTo }) => {
  await navigateTo('cluster-list');
});

// With wait options
test('my test', async ({ navigateTo }) => {
  await navigateTo('cluster-list', { waitUntil: 'networkidle' });
});
```

---

## Selector Strategy

### Priority Order (Best to Worst)

1. **Accessible roles with names** (Most stable)
   ```typescript
   this.page.getByRole('button', { name: 'Submit' })
   this.page.getByRole('textbox', { name: 'Email' })
   ```

2. **Label text**
   ```typescript
   this.page.getByLabel('Email address')
   ```

3. **Text content** (Use sparingly)
   ```typescript
   this.page.getByText('Submit application')
   ```

4. **`data-testid` attributes**
   ```typescript
   this.page.getByTestId('submit-button')
   ```

5. **CSS selectors** (Last resort)
   ```typescript
   this.page.locator('button.submit-btn')
   this.page.locator('#cluster-name-input')
   this.page.locator('[aria-label="Close"]')
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
      "InvalidClusterNamesValues": [
        "a",
        "cluster name with spaces",
        "UPPERCASE"
      ],
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
const validationData = require('../../fixtures/rosa/rosa-cluster-classic-wizard-validation.spec.json');

test('validates cluster name', async ({ createRosaWizardPage }) => {
  for (let i = 0; i < validationData.ClusterSettings.Details.InvalidClusterNamesValues.length; i++) {
    await createRosaWizardPage.setClusterName(
      validationData.ClusterSettings.Details.InvalidClusterNamesValues[i]
    );
    await createRosaWizardPage.isTextContainsInPage(
      validationData.ClusterSettings.Details.InvalidClusterNamesErrors[i]
    );
  }
});
```

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

| Tag | Description | When to Use |
|-----|-------------|-------------|
| `@ci` | CI pipeline tests | Tests for every PR |
| `@smoke` | Smoke tests | Critical path validation |
| `@wizard-validation` | Wizard validation tests | Form validation tests |
| `@rosa` | ROSA tests | All ROSA-related tests |
| `@rosa-classic` | ROSA Classic tests | Classic control plane tests |
| `@rosa-hosted` | ROSA HCP tests | Hosted control plane tests |
| `@osd` | OSD tests | OpenShift Dedicated tests |
| `@cluster-creation` | Cluster creation tests | Full creation flows |

### Applying Tags

```typescript
// Single tag
test.describe.serial('Downloads page', { tag: ['@ci'] }, () => {
  // ...
});

// Multiple tags
test.describe.serial('ROSA Classic validation', { 
  tag: ['@smoke', '@wizard-validation', '@rosa', '@rosa-classic'] 
}, () => {
  // ...
});

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
test('validates email format', async ({ registerPage }) => {
  await registerPage.emailInput().fill('invalid-email');
  await expect(registerPage.emailError()).toContainText('Invalid email format');
});

// ❌ Bad: Test depends on previous test state
test('validates email format', async ({ registerPage }) => {
  // Assumes form is already open from previous test
  await registerPage.emailInput().fill('invalid-email');
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

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Blank page | Navigation timing | Wait for a specific element to be visible |
| Element not found | Timing or selector issue | Check selector, add wait |
| Stale element | DOM changed | Re-query the element |
| Auth failure | Expired storage state | Delete `storageState.json` |
| Flaky test | Race condition | Add proper waits |

---

## Quick Reference

### Test Template

```typescript
import { test, expect } from '../../fixtures/pages';

test.describe.serial('Feature Name', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ navigateTo, featurePage }) => {
    await navigateTo('feature-url');
    await featurePage.isFeaturePage();
  });

  test('should perform action', async ({ featurePage }) => {
    await featurePage.actionButton().click();
    await expect(featurePage.resultElement()).toBeVisible();
  });
});
```

### Page Object Template

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class FeaturePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isFeaturePage(): Promise<void> {
    await this.assertUrlIncludes('/feature');
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

```typescript
featurePage: [
  async ({ authenticatedPage }, use) => {
    const pageObject = new FeaturePage(authenticatedPage);
    await use(pageObject);
  },
  { scope: 'worker' },
],
```

---

## Additional Resources

- [Playwright Official Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Best Practices](https://playwright.dev/docs/pom)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)




