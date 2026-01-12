import { test, expect } from '../../fixtures/pages';
import { v4 } from 'uuid';
import { getAuthConfig } from '../../support/auth-config';

test.describe.serial('OCM Roles And Access', { tag: ['@ci', '@smoke'] }, () => {
  const clusterID = v4();
  const displayName = `playwright-${clusterID}`;
  const { username } = getAuthConfig();

  test.beforeAll(async ({ navigateTo }) => {
    // Navigate to cluster list with clean state
    await navigateTo('cluster-list');
  });

  test('successfully registers a new cluster and redirects to its details page', async ({
    clusterListPage,
    registerClusterPage,
    clusterDetailsPage,
  }) => {
    // Wait for cluster list data to load
    await clusterListPage.waitForDataReady();
    await clusterListPage.isClusterListScreen();

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

  test('successfully navigates to OCM Roles And Access', async ({ ocmRolesAndAccessPage }) => {
    await ocmRolesAndAccessPage.accessControlTabButton().click();
    await ocmRolesAndAccessPage.assertUrlIncludes('#accessControl');
    await expect(ocmRolesAndAccessPage.grantRoleButton()).toBeVisible();
    await expect(ocmRolesAndAccessPage.ocmRolesAndAccessTable()).toBeVisible();
  });

  test('successfully validate and grant the RBAC', async ({ ocmRolesAndAccessPage }) => {
    await ocmRolesAndAccessPage.grantRoleButton().click();
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

  test('successfully displays the newly added user', async ({ ocmRolesAndAccessPage }) => {
    await expect(ocmRolesAndAccessPage.usernameCell()).toHaveText(username);
  });

  test('successfully deletes the user', async ({ ocmRolesAndAccessPage }) => {
    await ocmRolesAndAccessPage.ocmRolesAndAccessTableActionButton().click();
    await ocmRolesAndAccessPage.deleteRoleConfirm().click();
    await ocmRolesAndAccessPage.ocmRolesAndAccessTableDeleteButton().click();
    await ocmRolesAndAccessPage.deleteRoleConfirm().click();
    await expect(ocmRolesAndAccessPage.usernameCell()).not.toBeVisible();
  });

  test('Finally, archive the cluster created', async ({ clusterDetailsPage }) => {
    await clusterDetailsPage.actionsDropdownToggle().click();
    await clusterDetailsPage.archiveClusterDropdownItem().click();
    await clusterDetailsPage.archiveClusterDialogConfirm().click();
    await clusterDetailsPage.waitForClusterDetailsLoad();
    await expect(clusterDetailsPage.unarchiveClusterButton()).toBeVisible();
  });
});
