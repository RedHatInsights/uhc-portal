import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterListPage } from '../../page-objects/cluster-list-page';
import { CreateROSAWizardPage } from '../../page-objects/create-rosa-wizard-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

const associatedAccountsSelector = '**/api/accounts_mgmt/v1/organizations/*/labels';
const ARNsSelector = '**/api/clusters_mgmt/v1/aws_inquiries/sts_account_roles';
const userRoleSelector = '**/api/accounts_mgmt/v1/accounts/*/labels/sts_user_role';

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterListPage: ClusterListPage;
let createRosaWizardPage: CreateROSAWizardPage;

test.describe.skip('Rosa cluster tests', { tag: ['@ci'] }, () => {
  test.beforeAll(async ({ browser }) => {
    // Setup: auth + navigate to cluster list
    const setup = await setupTestSuite(browser, '/openshift/cluster-list');

    sharedContext = setup.context;
    sharedPage = setup.page;

    // Initialize page objects for this test suite
    clusterListPage = new ClusterListPage(sharedPage);
    createRosaWizardPage = new CreateROSAWizardPage(sharedPage);

    // Wait for cluster list data to load
    await clusterListPage.waitForDataReady();
    await clusterListPage.isClusterListScreen();
  });

  test.afterAll(async () => {
    await cleanupTestSuite(sharedContext);
  });

  test.describe('Create Rosa cluster', () => {
    test('navigates to create Rosa cluster wizard', async () => {
      await sharedPage.getByTestId('create_cluster_btn').click();
      // couldn't pass data-testids to composite PF Dropdown component :-(
      await sharedPage.locator('#rosa-create-cluster-dropdown').scrollIntoViewIfNeeded();
      await expect(sharedPage.locator('#rosa-create-cluster-dropdown')).toBeVisible();
      await sharedPage.locator('#rosa-create-cluster-dropdown').click();
      await expect(sharedPage.locator('#with-web')).toBeVisible();
      await sharedPage.locator('#with-web').click();
      await createRosaWizardPage.isCreateRosaPage();
      await expect(sharedPage.locator('.spinner-loading-text')).not.toBeVisible();
      await createRosaWizardPage.isControlPlaneTypeScreen();
    });

    test('selects standalone control plane mode', async () => {
      await createRosaWizardPage.selectStandaloneControlPlaneTypeOption();
    });

    test('moves next to the Accounts and Roles screen', async () => {
      await sharedPage.locator(createRosaWizardPage.primaryButton).click({ force: true });
      await createRosaWizardPage.isAccountsAndRolesScreen();
    });

    test.describe('test the Accounts and roles step', () => {
      test('tests for no associated accounts', async () => {
        // Mock API responses
        await sharedPage.route(associatedAccountsSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_no_associated_account.json');
          await route.fulfill({ json });
        });
        await sharedPage.route(ARNsSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_no_arns.json');
          await route.fulfill({ json });
        });

        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await createRosaWizardPage.isAccountsAndRolesScreen();
        await sharedPage.getByTestId('refresh-aws-accounts').click();

        // Wait for API calls to complete
        await sharedPage.waitForResponse(associatedAccountsSelector);

        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await sharedPage.locator(createRosaWizardPage.associatedAccountsDropdown).click();
        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await createRosaWizardPage.showsNoAssociatedAccounts();
      });

      test('tests for a single associated account, "no ARNs" alert, and 4 ARNs required messages', async () => {
        // Mock API responses
        await sharedPage.route(associatedAccountsSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_one_associated_account.json');
          await route.fulfill({ json });
        });
        await sharedPage.route(ARNsSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_no_arns.json');
          await route.fulfill({ json });
        });

        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await createRosaWizardPage.isAccountsAndRolesScreen();
        await sharedPage.getByTestId('refresh-aws-accounts').click();
        await sharedPage.waitForResponse(associatedAccountsSelector);
        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await expect(sharedPage.getByText('Loading account roles ARNs')).not.toBeVisible();
        await sharedPage.getByTestId('refresh_arns_btn').click();
        await sharedPage.waitForResponse(ARNsSelector);

        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await sharedPage.locator(createRosaWizardPage.associatedAccountsDropdown).click();
        await expect(sharedPage.locator(createRosaWizardPage.accountIdMenuItem)).toHaveCount(1);
        await sharedPage.locator(createRosaWizardPage.associatedAccountsDropdown).click();
        await createRosaWizardPage.showsNoARNsDetectedAlert();
        await expect(sharedPage.locator(createRosaWizardPage.ARNFieldRequiredMsg)).toHaveCount(4); // all 4 ARN fields are empty

        // Confirm alert opens drawer with correct content
        await sharedPage.getByText('create the required role').click();
        await expect(
          sharedPage.getByRole('heading', { name: 'Create account roles' }),
        ).toBeVisible();
        await expect(sharedPage.getByText('continue to step')).not.toBeVisible();
        await sharedPage.getByTestId('close-associate-account-btn').click();
      });

      test('tests for all ARNs and no "ARN required" messages', async () => {
        await sharedPage.route(ARNsSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_all_arns.json');
          await route.fulfill({ json });
        });

        await sharedPage.getByTestId('refresh_arns_btn').click();
        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await expect(sharedPage.getByText('Loading account roles ARNs')).not.toBeVisible();
        await sharedPage.waitForResponse(ARNsSelector);
        await expect(sharedPage.locator(createRosaWizardPage.ARNFieldRequiredMsg)).toHaveCount(0); // no ARN validation alerts
      });

      test('tests preventing Next if no user role, shows alert', async () => {
        await sharedPage.route(userRoleSelector, async (route) => {
          await route.fulfill({
            status: 404,
            body: '404 Not Found!',
            headers: {
              'x-not-found': 'true',
            },
          });
        });

        await sharedPage.locator(createRosaWizardPage.primaryButton).click({ force: true });
        await sharedPage.waitForResponse(userRoleSelector);

        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await createRosaWizardPage.isAccountsAndRolesScreen();
        await createRosaWizardPage.showsNoUserRoleAlert();

        // Confirm alert opens drawer with correct content
        await sharedPage.getByText('create the required role').click();
        await expect(sharedPage.getByRole('heading', { name: 'Create user role' })).toBeVisible();
        await expect(sharedPage.getByText('continue to step')).not.toBeVisible();
        await sharedPage.getByTestId('close-associate-account-btn').click();
      });

      test('tests if no ocm role, shows alert', async () => {
        await sharedPage.route(associatedAccountsSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_one_associated_account.json');
          await route.fulfill({ json });
        });

        await sharedPage.route(ARNsSelector, async (route) => {
          await route.fulfill({
            status: 400,
            json: {
              kind: 'Error',
              id: '400',
              href: '/api/clusters_mgmt/v1/errors/400',
              code: 'CLUSTERS-MGMT-400',
              reason:
                "Add 'arn:aws:iam::8888:role/RH-Managed-OpenShift-Installer' to the trust policy on IAM role 'ManagedOpenShift-OCM-Role-151515'",
              details: [
                {
                  Error_Key: 'NoTrustedRelationshipOnClusterRole',
                },
              ],
              operation_id: 'f15efc24-e3c6-436f-be01-7e8be1009265',
            },
          });
        });

        await sharedPage.getByTestId('refresh-aws-accounts').click();

        await sharedPage.waitForResponse(associatedAccountsSelector);
        await sharedPage.waitForResponse(ARNsSelector);

        await expect(sharedPage.locator(createRosaWizardPage.primaryButton)).not.toBeDisabled();
        await createRosaWizardPage.isAccountsAndRolesScreen();
        await createRosaWizardPage.showsNoOcmRoleAlert();

        // Confirm alert opens drawer with correct content
        await sharedPage.getByText('create the required role').click();
        await expect(sharedPage.getByRole('heading', { name: 'Create OCM role' })).toBeVisible();
        await expect(sharedPage.getByText('continue to step')).not.toBeVisible();
        await sharedPage.getByTestId('close-associate-account-btn').click();
      });

      // TODO: resolve timing and mock data issues
      // Alert "user-role could not be detected" persists after successfully getting mock user-role
      // something to do with react's render() loop and async mock data calls
      test.skip('tests Next goes to next step if no validation errors', async () => {
        await sharedPage.route(associatedAccountsSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_one_associated_account.json');
          await route.fulfill({ json });
        });
        await sharedPage.route(ARNsSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_all_arns.json');
          await route.fulfill({ json });
        });

        await sharedPage.route(userRoleSelector, async (route) => {
          const json = await import('../../fixtures/rosa/rosa_user_role.json');
          await route.fulfill({ json });
        });

        await sharedPage.route(
          '**/api.openshift.com/api/clusters_mgmt/v1/versions/**',
          async (route) => {
            const json = await import('../../fixtures/rosa/rosa_installable_cluster_versions.json');
            await route.fulfill({ json });
          },
        );

        await sharedPage.getByTestId('refresh-aws-accounts').click();
        await sharedPage.waitForResponse(associatedAccountsSelector);
        await expect(sharedPage.getByText('Loading account roles ARNs')).not.toBeVisible();
        await sharedPage.getByTestId('refresh_arns_btn').scrollIntoViewIfNeeded();
        await expect(sharedPage.getByTestId('refresh_arns_btn')).toBeVisible();
        await sharedPage.getByTestId('refresh_arns_btn').click();
        await sharedPage.waitForResponse(ARNsSelector);

        await sharedPage.locator(createRosaWizardPage.primaryButton).click({ force: true });
        await sharedPage.waitForResponse(userRoleSelector);
        await sharedPage.waitForResponse('**/api.openshift.com/api/clusters_mgmt/v1/versions/**');
        await createRosaWizardPage.isClusterDetailsScreen();
      });
    });

    test.describe.skip('test the Cluster details step', () => {
      test('tests for default version based on previous step', async () => {
        await createRosaWizardPage.isClusterDetailsScreen();
        // await sharedPage.locator(createRosaWizardPage.versionsDropdown).click();
        // await createRosaWizardPage.isSelectedVersion('4.10.18');
      });
    });
  });
});
