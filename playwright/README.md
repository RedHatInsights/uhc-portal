# Playwright E2E Tests

## Installation

### Install Dependencies

From the project root directory, install all dependencies including Playwright:

```bash
# Install all project dependencies (including Playwright)
yarn install

# Install Playwright
yarn playwright install

# Install all Playwright  dependecies and supported browsers
# Download the supported browser binaries (Chromium, Firefox, WebKit).
# Install OS-level dependencies needed to run them (on Linux).
yarn playwright install --with-deps

# Optional : Install only Chromium browser for faster setup
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

1. **Username/Password Authentication (Primary)**:
   - `TEST_WITHQUOTA_USER` - Username for test authentication
   - `TEST_WITHQUOTA_PASSWORD` - Password for test authentication

#### Configuration Files

The test configuration uses `playwright.env.json` for environment-specific settings. All authentication credentials, cloud provider settings, infrastructure configurations, and test environment options are mapped in this file.

#### Example `playwright.env.json` Structure

```json
{
  "TEST_WITHQUOTA_USER": "<username>",  # Required for basic test case executions
  "TEST_WITHQUOTA_PASSWORD": "<password>", # Required for basic test case executions
  "QE_ORGADMIN_USER": "<org admin username>",
  "QE_ORGADMIN_PASSWORD": "<org admin password>",
  "QE_ORGADMIN_CLIENT_ID": "<org admin client id >", # Required for smoke/advanced test case executions
  "QE_ORGADMIN_CLIENT_SECRET": "<org admin client secret>", # Required for smoke/advanced test case executions
  "QE_ORGADMIN_OFFLINE_TOKEN": <org admin offline token> # Required for smoke/advanced test case executions
  "QE_GCP_OSDCCSADMIN_JSON": {<service account json definition>}, # Required for GCP smoke/advanced test case executions
  "QE_AWS_ACCESS_KEY_ID": "<AWS access key>", # Required for smoke/advanced AWS test case executions
  "QE_AWS_ACCESS_KEY_SECRET": "<AWS secret key>",# Required for smoke/advanced AWS test case executions
  "QE_AWS_REGION": "<Region>", # Required for smoke/advanced AWS test case executions
  "QE_AWS_ID": "<AWS ID>", # Required for smoke/advanced AWS test case executions
  "QE_ENV_AUT": "staging", # Required for smoke/advanced AWS test case executions
  "QE_AWS_BILLING_ID": "<AWS billing ID>", # Required for smoke/advanced AWS test case executions
  "QE_GCP_KEY_RING_LOCATION": "<gcp key location>",# Required for smoke/advanced GCP test case executions
  "QE_GCP_KEY_RING": "<gcp keyring name>",# Required for smoke/advanced GCP test case executions
  "QE_GCP_KEY_NAME": "<gcp key name>",# Required for smoke/advanced GCP test case executions
  "QE_GCP_KMS_SERVICE_ACCOUNT": "<kms gcp ervice account>",# Required for smoke/advanced GCP test case executions
  "QE_ACCOUNT_ROLE_PREFIX": "cypress-account-roles", # Required for smoke/advanced test case executions
  "QE_OCM_ROLE_PREFIX": "cypress-ocm-role", # Required for smoke/advanced  test case executions
  "QE_USER_ROLE_PREFIX": "cypress-user-role", # Required for smoke/advanced  test case executions
  "ROSACLI_LOGS": "cli-logs.txt", # Required for smoke/advanced  test case executions
  "QE_GCP_WIF_CONFIG": "<wif config id name>", # Required for smoke/advanced GCP test case executions
  "QE_USE_OFFLINE_TOKEN": false,
  "QE_INFRA_GCP": { # Required for smoke/advanced GCP test case executions
    "VPC_NAME": "<GCP vpc name>",
    "CONTROLPLANE_SUBNET": "<control plane subnet>",
    "COMPUTE_SUBNET": "<compute subnet>",
    "PSC_INFRA": {
      "VPC_NAME": "<psc vpc name>",
      "CONTROLPLANE_SUBNET": "<control-plane subnet name>",
      "COMPUTE_SUBNET": "<compute subnet name>",
      "PRIVATE_SERVICE_CONNECT_SUBNET": "<psc subnet name>"
    }
  },
  "QE_INFRA_REGIONS": { # Required for smoke/advanced AWS test case executions
    "us-west-2": [
      {
        "VPC-ID": "<vpc id>",
        "VPC_NAME": "<vpc name>",
        "SECURITY_GROUPS": [
          "<security group id 1>",
          "<security group id 2>"
        ],
        "SECURITY_GROUPS_NAME": [
          "<security group name 1>",
          "<security group name 2>"
        ],
        "SUBNETS": {
          "ZONES": {
            "<az region>": {
              "PUBLIC_SUBNET_NAME": "<public subnet name>",
              "PUBLIC_SUBNET_ID": "<public subnet id>",
              "PRIVATE_SUBNET_NAME": "<private subnet name>",
              "PRIVATE_SUBNET_ID": "<private subnet id>"
            },
            "<az region>": {
              "PUBLIC_SUBNET_NAME": "<public subnet name>",
              "PUBLIC_SUBNET_ID": "<public subnet id>",
              "PRIVATE_SUBNET_NAME": "<private subnet name>",
              "PRIVATE_SUBNET_ID": "<private subnet id>"
            },
            "<az region>": {
              "PUBLIC_SUBNET_NAME": "<public subnet name>",
              "PUBLIC_SUBNET_ID": "<public subnet id>",
              "PRIVATE_SUBNET_NAME": "<private subnet name>",
              "PRIVATE_SUBNET_ID": "<private subnet id>"
            }
          }
        }
      }
    ]
  }
}
```

**Note**: Create your own `playwright.env.json` file based on this structure. This file is not part of the repository and should not be committed to version control as it contains sensitive credentials.

### Running Tests locally

### Test Tags and Categories

The Playwright test suite uses tags to categorize tests for different execution scenarios:

#### Available Tags

- **`@ci`** - Critical integration tests that run for every merge request (MR)

  - These are essential tests that verify core functionality
  - Designed to be fast and reliable to provide quick feedback on PRs
  - Includes basic functionality tests across all major features

- **`@smoke`** - Comprehensive smoke tests that verify system health
  - Larger set of test cases covering broader system functionality
  - Typically runs against staging environments
  - Includes end-to-end scenarios and integration workflows
  - More thorough validation of features and user journeys

#### Running Tests by Tags

You can run specific test categories using the package scripts or direct Playwright commands:

```bash
# Run CI tests (configured for every MR)
yarn playwright-e2e-ci

# Run smoke tests (comprehensive system health check)
yarn playwright-e2e-smoke

# Run tests with multiple tags
yarn playwright test --grep "@ci|@smoke"
```

#### Package Scripts for Test Execution

The following npm/yarn scripts are available for running Playwright tests:

```bash
# All Tests - Run entire test suite
yarn playwright-headless

# Interactive UI Mode - Visual test runner
yarn playwright-ui

# View Test Reports - Open HTML test report
yarn playwright-report
```

### Useful Playwright commands

```bash
# Run all tests
yarn playwright test

# Run specific test file
yarn playwright test playwright/e2e/clusters/register-cluster.spec.ts

# Run tests for specific directory
yarn playwright test playwright/e2e/downloads/

# Run with specific browser
BROWSER=chromium yarn playwright test

# Run with UI mode (interactive)
yarn playwright test --ui

# Run in headed mode (see browser)
yarn playwright test --headed

# Run with debug mode
yarn playwright test --debug

# Run with specific reporter
yarn playwright test --reporter=html

# Run with parallel execution disabled
yarn playwright test --workers=1

# Run  playwright for record the page definition
yarn playwright codegen
```

### Authentication

The tests use a global setup that:

1. Loads environment variables from `playwright.env.json`
2. Performs authentication once before all tests run
3. Saves authentication state to `playwright/fixtures/storageState.json`
4. Reuses this state across all test runs
5. Sets necessary cookies to disable consent dialogs

**Note**: `storageState.json` will automatically create and save in fixture folder during execution. This file is not part of the repository and should not be committed to version control as it contains sensitive credentials.

#### Authentication Flow

1. **Global Setup** (`playwright/support/global-setup.ts`):

   - Creates a browser context with proper viewport settings
   - Sets GDPR consent cookies to bypass consent dialogs
   - Handles different authentication methods based on environment

2. **Login Process** (`playwright/page-objects/login-page.ts`):
   - **Standard Flow**: Username → Next → Password → Submit

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
├── e2e/                        # Test files organized by feature
│   ├── clusters/               # Cluster management tests
│   ├── downloads/              # Downloads and tokens page tests
│   ├── osd/                    # OpenShift Dedicated general tests
│   ├── osd-aws/                # OSD AWS-specific tests
│   ├── osd-gcp/                # OSD GCP-specific tests
│   ├── overview/               # Overview page tests
│   ├── releases/               # Releases page tests
│   ├── rosa/                   # ROSA (Red Hat OpenShift Service on AWS) tests
│   ├── rosa-hosted/            # ROSA Hosted Control Plane tests
│   └── subscriptions/          # Subscriptions page tests
├── fixtures/                   # Test data and configuration files
│   ├── osd/                    # OSD test fixtures
│   ├── osd-aws/                # OSD AWS-specific test fixtures
│   ├── osd-gcp/                # OSD GCP-specific test fixtures
│   ├── rosa/                   # ROSA test fixtures
│   ├── rosa-hosted/            # ROSA Hosted test fixtures
│   ├── subscription/           # Subscription test fixtures
│   └── storageState.json       # Saved authentication state (auto-generated, never commit)
├── page-objects/               # Page object models for reusable components
│   ├── base-page.ts            # Base page with common functionality
│   ├── login-page.ts           # Authentication page object
│   ├── global-nav-page.ts      # Global navigation page object
│   ├── cluster-*.ts            # Cluster-related page objects
│   ├── create-*-wizard-page.ts # Wizard creation page objects
└── support/                    # Support utilities and configuration
    ├── auth-config.ts          # Authentication configuration
    ├── global-setup.ts         # Global test setup
    ├── global-teardown.ts      # Global test teardown
    ├── test-setup.ts           # Individual test setup utilities
    └── custom-commands.ts      # Custom commands and utilities
```

### Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `playwright.env.json` - Environment-specific variables (This is not part of repo)
