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
npx playwright install

# Optional: Install only Chromium browser for faster setup
npx playwright install chromium
```

### Verify Installation

You can verify that Playwright is properly installed by running:

```bash
# Check Playwright version
npx playwright --version

# List available tests (without running them)
npx playwright test --list
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




### Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test playwright/e2e/clusters/register-cluster.spec.ts

# Run tests for specific directory
npx playwright test playwright/e2e/downloads/

# Run with specific browser
BROWSER=chromium npx playwright test

# Run with UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Run with specific reporter
npx playwright test --reporter=html

# Run with parallel execution disabled
npx playwright test --workers=1
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

3. **Authentication Methods**:
   - **Interactive Login**: Browser-based login with Red Hat SSO
   - **Service Account**: OAuth client credentials for automated access

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

### Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `playwright.env.json` - Environment-specific variables
- `playwright.env.json.example` - Template for environment configuration

### Troubleshooting

#### Authentication Issues
1. **Invalid Credentials**: Verify environment variables in `playwright.env.json`
2. **Expired Tokens**: Refresh offline tokens from [Red Hat Console](https://console.redhat.com/openshift/token)
3. **Permission Issues**: Ensure test users have appropriate permissions for target environments

#### Environment Issues
1. **Wrong Base URL**: Check `baseURL` in `playwright.config.ts` matches target environment
2. **Network Connectivity**: Verify access to target environment (staging/production)
3. **GOV_CLOUD Settings**: Ensure `GOV_CLOUD=true` for FedRAMP environments

#### Test Execution Issues
1. **Timeout Errors**: Tests include extended timeouts (5 minutes per test, 60s navigation)
2. **Loading Issues**: Tests wait for skeleton loaders and spinners to disappear
3. **Browser Issues**: Try different browsers using `BROWSER` environment variable

#### ROSA CLI Integration
1. **CLI Authentication**: Ensure ROSA CLI is installed and accessible
2. **Token Expiration**: Check if offline tokens need renewal
3. **Log Files**: Review `cli-logs.txt` for CLI command output

### Common Issues

#### Authentication Problems
- **Solution**: Delete `playwright/fixtures/storageState.json` to force re-authentication
- **Root Cause**: Expired or corrupted authentication state

#### Base URL Mismatch
- **Solution**: Ensure the `baseURL` in `playwright.config.ts` matches your target environment
- **Example**: `https://console.dev.redhat.com/openshift/` for staging

#### Environment Variable Issues
- **Solution**: Verify all required variables are set in `playwright.env.json`
- **Check**: Run `npx playwright test --list` to verify configuration loading

#### Browser Compatibility
- **Solution**: Test with different browsers using `BROWSER=chromium|firefox|webkit`
- **Default**: All browsers run unless specified

#### Network and Connectivity
- **VPN Required**: Some environments may require VPN access
- **Firewall**: Ensure test runner can access target URLs
- **Proxy**: Configure proxy settings if required by your environment

