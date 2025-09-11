import { test, expect, Page, BrowserContext } from '@playwright/test';
import { v4 } from 'uuid';
import { getAuthConfig } from '../../support/auth-config-helper';
import { ClusterDetailsPage } from '../../page-objects/cluster-details-page';
import { ClusterListPage } from '../../page-objects/cluster-list-page';
import { OCMRolesAndAccessPage } from '../../page-objects/ocm-roles-access-page';
import { RegisterClusterPage } from '../../page-objects/register-cluster-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterListPage: ClusterListPage;
let registerClusterPage: RegisterClusterPage;
let clusterDetailsPage: ClusterDetailsPage;
let ocmRolesAndAccessPage: OCMRolesAndAccessPage;

test.describe.serial('OCM Roles And Access', { tag: ['@ci', '@smoke'] }, () => {
  const clusterID = v4();
  const displayName = `cypress-${clusterID}`;
  const { username } = getAuthConfig();

  test.beforeAll(async ({ browser }) => {
    // Setup: auth + navigate to cluster list
    const setup = await setupTestSuite(browser, '/openshift/cluster-list');

    sharedContext = setup.context;
    sharedPage = setup.page;

    // Initialize page objects for this test suite
    clusterListPage = new ClusterListPage(sharedPage);
    registerClusterPage = new RegisterClusterPage(sharedPage);
    clusterDetailsPage = new ClusterDetailsPage(sharedPage);
    ocmRolesAndAccessPage = new OCMRolesAndAccessPage(sharedPage);

    // Wait for cluster list data to load
    await clusterListPage.waitForDataReady();
    await clusterListPage.isClusterListScreen();
  });

  test.afterAll(async () => {
    await cleanupTestSuite(sharedContext);
  });

  test('successfully registers a new cluster and redirects to its details page', async () => {
    await expect(clusterListPage.registerCluster()).toBeVisible();
    await clusterListPage.registerCluster().click();
    await clusterListPage.isRegisterClusterUrl();
    await clusterListPage.isRegisterClusterScreen();
    await registerClusterPage.clusterIDInput().fill(clusterID);
    await registerClusterPage.clusterIDInput().blur();
    await registerClusterPage.displayNameInput().fill(displayName);
    await registerClusterPage.displayNameInput().blur();
    await registerClusterPage.submitButton().click();
    await clusterDetailsPage.isClusterDetailsPage(displayName);
  });

  test('successfully navigates to OCM Roles And Access', async () => {
    await ocmRolesAndAccessPage.accessControlTabButton().click();
    await ocmRolesAndAccessPage.assertUrlIncludes('#accessControl');
    await expect(ocmRolesAndAccessPage.grantRoleButton()).toBeVisible();
    await expect(ocmRolesAndAccessPage.OCMRolesAndAccessTable()).toBeVisible();
  });

  test('successfully validate and grant the RBAC', async () => {
    await ocmRolesAndAccessPage.grantRoleButton().click({ force: true });
    await expect(ocmRolesAndAccessPage.grantRoleUserInput()).toBeVisible();
    await ocmRolesAndAccessPage.grantRoleUserInput().fill(' ');
    await expect(
      ocmRolesAndAccessPage.ocmRoleAndAccessDialog().getByText('Red Hat login cannot be empty'),
    ).toBeVisible();
    await ocmRolesAndAccessPage.grantRoleUserInput().fill(v4());
    await ocmRolesAndAccessPage.submitButton().click();
    await expect(
      ocmRolesAndAccessPage
        .ocmRoleAndAccessDialog()
        .getByText('The specified username does not exist'),
    ).toBeVisible();
    await ocmRolesAndAccessPage.grantRoleUserInput().clear();
    await ocmRolesAndAccessPage.grantRoleUserInput().fill(username);
    await ocmRolesAndAccessPage.grantRoleUserInput().blur();
    await ocmRolesAndAccessPage.submitButton().click();
    await ocmRolesAndAccessPage.waitForGrantRoleModalToClear();
  });

  test('successfully displays the newly added user', async () => {
    await expect(ocmRolesAndAccessPage.usernameCell()).toHaveText(username);
  });

  test('successfully deletes the user', async () => {
    await ocmRolesAndAccessPage.OCMRolesAndAccessTableActionButton().click({ force: true });
    await ocmRolesAndAccessPage.OCMRolesAndAccessTableDeleteButton().click();
    await expect(ocmRolesAndAccessPage.usernameCell()).not.toBeVisible();
  });

  test('Finally, archive the cluster created', async () => {
    await clusterDetailsPage.actionsDropdownToggle().click({ force: true });
    await clusterDetailsPage.archiveClusterDropdownItem().click();
    await clusterDetailsPage.archiveClusterDialogConfirm().click();
    await clusterDetailsPage.waitForClusterDetailsLoad();
    await expect(clusterDetailsPage.unarchiveClusterButton()).toBeVisible();
  });
});
