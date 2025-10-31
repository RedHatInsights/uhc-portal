# Playwright E2E Tests

## Installation

### Prerequisites

Ensure you have Node.js (>= 18.12.0) and Yarn (>= 1.22.19) installed on your system.

### Install Dependencies

From the project root directory, install all dependencies including Playwright:

```bash
# Install all project dependencies (including Playwright)
yarn install

# Install Playwright browsers
yarn playwright install

# Optional: Install only Chromium browser for faster setup
yarn playwright install chromium
```

### Verify Installation

You can verify that Playwright is properly installed by running:

```bash
# Check Playwright version
yarn playwright --version

# List available tests (without running them)
yarn playwright test --list
```

## Setup

### Environment Variables

The tests support multiple authentication methods and cloud provider configurations. All environment variables should be configured in the `playwright.env.json` file.

#### Authentication Methods

The tests support:
- **Username/Password Authentication**: Standard Red Hat SSO login

1. **Username/Password Authentication (Primary)**:
   - `TEST_WITHQUOTA_USER`  - Username for test authentication
   - `TEST_WITHQUOTA_PASSWORD`  - Password for test authentication

#### Configuration Files

The test configuration uses `playwright.env.json` for environment-specific settings. All authentication credentials, cloud provider settings, infrastructure configurations, and test environment options are mapped in this file.

#### Example `playwright.env.json` Structure

```json
{
  "TEST_WITHQUOTA_USER": "your-username@example.com",
  "TEST_WITHQUOTA_PASSWORD": "your-password",
  "GOV_CLOUD": "false",
  "BROWSER": "firefox",
  "BASE_URL": "https://console.dev.redhat.com/openshift/"
  .....
}
```

**Note**: Create your own `playwright.env.json` file based on this structure. This file is not part of the repository and should not be committed to version control as it contains sensitive credentials.




### Running Tests

#### Using custom playwright script commands (Recommended)

```bash
# Run all tests in headless mode (CI/CD mode)
yarn playwright-headless

# Run tests with UI mode (interactive test explorer)
yarn playwright-ui

# Run tests in headed mode (see browser actions)
yarn playwright-headed

# Run tests in debug mode (step through tests)
yarn playwright-debug

# Show HTML test report
yarn playwright-report
```

#### Using Playwright CLI Directly

For more advanced usage and customized options:

```bash
# Run all tests
yarn playwright test

# Run specific test file
yarn playwright test playwright/e2e/clusters/register-cluster.spec.ts

# Run tests for specific directory
yarn playwright test playwright/e2e/downloads/

# Run with specific browser
BROWSER=chromium yarn playwright test

# Run with specific reporter
yarn playwright test --reporter=html

# Run with parallel executions in multiple workers
yarn playwright test --workers=<count>

# Run the tests with specific tags
yarn playwright test --grep="<tag>"

# Generate test code (record browser interactions)
yarn playwright codegen
```

### Authentication

The tests use a global setup that:
1. Loads environment variables from `playwright.env.json`
2. Performs authentication once before all tests run
3. Saves authentication state to `playwright/fixtures/storageState.json`
4. Reuses this state across all test runs
5. Sets necessary cookies to disable consent dialogs

#### Authentication Flow

1. **Global Setup** (`playwright/support/global-setup.ts`):
   - Creates a browser context with proper viewport settings
   - Sets GDPR consent cookies to bypass consent dialogs
   - Handles different authentication methods based on environment

2. **Login Process** (`playwright/page-objects/login-page.ts`):
   - **Standard Flow**: Username → Next → Password → Submit
   - **FedRAMP Flow**: Direct username/password entry for GOV_CLOUD environments


#### Session Management

- Authentication state is persisted in `storageState.json`
- Tests automatically reuse saved authentication without re-login
- Global timeout: 5 minutes per test
- Navigation timeout: 60 seconds
- Action timeout: 15 seconds

This approach is faster and more reliable than logging in for each test.

### Test Structure

```
playwright/
├── e2e/                    # Test files organized by feature
│   ├── clusters/          # Cluster management tests
│   ├── downloads/         # Downloads page tests
│   ├── osd/              # OpenShift Dedicated tests
│   ├── rosa/             # ROSA (Red Hat OpenShift Service on AWS) tests
│   └── rosa-hosted/      # ROSA Hosted Control Plane tests
├── fixtures/             # Test data and authentication state
│   ├── pages.ts          # Page object fixtures (dependency injection)
│   ├── storageState.json # Saved authentication state
│   └── *.json           # Test fixtures and mock data
├── page-objects/         # Page object models for reusable components
│   ├── base-page.ts     # Base page with common functionality
│   ├── login-page.ts    # Authentication page object
│   ├── cluster-*.ts     # Cluster-related page objects
│   └── downloads-page.ts # Downloads page object
└── support/             # Support utilities and configuration
    ├── auth-config.ts   # Authentication configuration
    ├── global-setup.ts  # Global test setup
    └── custom-commands.ts # Custom commands and utilities
```

### Page Object Fixture Pattern

This project uses **Playwright fixtures** for dependency injection of page objects, providing automatic setup/teardown and proper resource management.

#### Fixture Scope: Worker-Scoped

All page object fixtures are **worker-scoped**, meaning:
- Created **once per worker** (suite-level)
- **Shared across all tests** within that worker
- Perfect for **serial test flows** where tests build on each other
- Efficient - **no re-instantiation overhead**
- Automatic cleanup when worker ends

#### Basic Usage

Import the custom `test` and `expect` from fixtures:

```typescript
import { test, expect } from '../../fixtures/pages';

test.describe.serial('Register cluster flow', () => {
  test.beforeAll(async ({ page }) => {
    await page.goto('cluster-list');
  });

  test('navigate to register cluster', async ({ clusterListPage }) => {
    // Page object automatically injected, no manual setup!
    await clusterListPage.registerCluster().click();
  });

  test('fill cluster details', async ({ registerClusterPage }) => {
    // Same page instance, state maintained from previous test
    await registerClusterPage.clusterIDInput().fill('my-cluster');
  });
});
```

#### Benefits

✅ **No Manual Initialization** - Page objects injected automatically  
✅ **Worker-Scoped Reuse** - Created once, shared across suite tests  
✅ **Type-Safe** - Full TypeScript support with IntelliSense  
✅ **Automatic Cleanup** - Resources properly disposed  
✅ **State Persistence** - Perfect for serial user flows  

#### Available Page Object Fixtures

- `clusterListPage` - Cluster list operations
- `registerClusterPage` - Register cluster form
- `clusterDetailsPage` - Cluster details and actions
- `ocmRolesAndAccessPage` - OCM roles management
- `tokensPage` - Token management
- `downloadsPage` - Downloads and CLI tools
- `globalNavPage` - Global navigation menu


### Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `playwright.env.json` - Environment-specific variables (This is not part of repo)

### Troubleshooting

#### Authentication Issues
1. **Invalid Credentials**: Verify environment variables in `playwright.env.json`

#### Environment Issues
1. **Wrong Base URL**: Check `baseURL` in `playwright.config.ts` matches target environment
2. **Network Connectivity**: Verify access to target environment (staging/production)
3. **GOV_CLOUD Settings**: Ensure `GOV_CLOUD=true` for FedRAMP environments

#### Test Execution Issues
1. **Timeout Errors**: Tests include extended timeouts (5 minutes per test, 60s navigation)
2. **Loading Issues**: Tests wait for skeleton loaders and spinners to disappear
3. **Browser Issues**: Try different browsers using `BROWSER` environment variable


### Common Issues

#### Authentication Problems
- **Solution**: Delete `playwright/fixtures/storageState.json` to force re-authentication (only required for local runs)
- **Root Cause**: Expired or corrupted authentication state


#### Environment Variable Issues
- **Solution**: Verify all required variables are set in `playwright.env.json`
- **Check**: Run `yarn playwright test --list` to verify configuration loading

