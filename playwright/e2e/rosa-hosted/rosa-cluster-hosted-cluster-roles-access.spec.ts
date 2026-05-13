import { expect, test } from '../../fixtures/pages';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');

const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const clusterName = process.env.CLUSTER_NAME || clusterProperties.ClusterName;

test.describe.serial(
  'ROSA HCP Cluster Roles and Access tests(OCP-29399)',
  { tag: ['@day2', '@access-control', '@rosa-hosted', '@hcp'] },
  () => {
    const dedicatedAdminUser = `da-user-${Math.random().toString(36).slice(2, 7)}`;
    const clusterAdminUser = `ca-user-${Math.random().toString(36).slice(2, 7)}`;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to HCP cluster and go to Cluster Roles and Access tab', async ({
      clusterListPage,
      clusterRolesAndAccessPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterRolesAndAccessPage.goToAccessControlTab();
      await clusterRolesAndAccessPage.goToClusterRolesAndAccessTab();
      await clusterRolesAndAccessPage.isClusterRolesAndAccessPage();
    });

    test('Verify Cluster Roles and Access tab layout', async ({ clusterRolesAndAccessPage }) => {
      await expect(clusterRolesAndAccessPage.clusterAdminUsersHeading()).toBeVisible();
      await expect(clusterRolesAndAccessPage.learnMoreLink()).toBeVisible();
      await expect(clusterRolesAndAccessPage.addUserButton()).toBeVisible();
    });

    test('Verify sub-tabs are visible under Access control', async ({
      clusterRolesAndAccessPage,
    }) => {
      await expect(clusterRolesAndAccessPage.identityProvidersTab()).toBeVisible();
      await expect(clusterRolesAndAccessPage.clusterRolesAndAccessTab()).toBeVisible();
      await expect(clusterRolesAndAccessPage.ocmRolesAndAccessTab()).toBeVisible();
    });

    test('Verify Add user dialog default state and field visibility', async ({
      clusterRolesAndAccessPage,
    }) => {
      await clusterRolesAndAccessPage.openAddUserDialog();

      await expect(clusterRolesAndAccessPage.addClusterUserDialogHeading()).toBeVisible();
      await expect(clusterRolesAndAccessPage.userIdInput()).toBeVisible();
      await expect(clusterRolesAndAccessPage.userIdInput()).toBeEmpty();
      await expect(clusterRolesAndAccessPage.dedicatedAdminsRadio()).toBeChecked();
      await expect(clusterRolesAndAccessPage.clusterAdminsRadio()).not.toBeChecked();
      await expect(clusterRolesAndAccessPage.addUserSubmitButton()).toBeDisabled();

      await clusterRolesAndAccessPage.cancelButton().click();
      await expect(clusterRolesAndAccessPage.addClusterUserDialogHeading()).toBeHidden();
    });

    test('Validate user ID - empty input keeps submit disabled', async ({
      clusterRolesAndAccessPage,
    }) => {
      await clusterRolesAndAccessPage.openAddUserDialog();

      await expect(clusterRolesAndAccessPage.addUserSubmitButton()).toBeDisabled();

      await clusterRolesAndAccessPage.cancelButton().click();
    });

    test('Validate user ID - whitespace-only input keeps submit disabled', async ({
      clusterRolesAndAccessPage,
    }) => {
      await clusterRolesAndAccessPage.openAddUserDialog();

      await clusterRolesAndAccessPage.userIdInput().fill(' ');
      await expect(clusterRolesAndAccessPage.addUserSubmitButton()).toBeDisabled();

      await clusterRolesAndAccessPage.cancelButton().click();
    });

    test('Validate user ID - valid input enables submit button', async ({
      clusterRolesAndAccessPage,
    }) => {
      await clusterRolesAndAccessPage.openAddUserDialog();

      await clusterRolesAndAccessPage.userIdInput().fill('valid-user');
      await expect(clusterRolesAndAccessPage.addUserSubmitButton()).toBeEnabled();

      await clusterRolesAndAccessPage.cancelButton().click();
    });

    test('Validate user ID - clearing input disables submit again', async ({
      clusterRolesAndAccessPage,
    }) => {
      await clusterRolesAndAccessPage.openAddUserDialog();

      await clusterRolesAndAccessPage.userIdInput().fill('some-user');
      await expect(clusterRolesAndAccessPage.addUserSubmitButton()).toBeEnabled();

      await clusterRolesAndAccessPage.userIdInput().clear();
      await expect(clusterRolesAndAccessPage.addUserSubmitButton()).toBeDisabled();

      await clusterRolesAndAccessPage.cancelButton().click();
    });

    test('Add user with dedicated-admins group and verify in table', async ({
      clusterRolesAndAccessPage,
    }) => {
      await clusterRolesAndAccessPage.addClusterUser(dedicatedAdminUser, 'dedicated-admins');

      await expect(clusterRolesAndAccessPage.userRow(dedicatedAdminUser)).toBeVisible({
        timeout: 30000,
      });
      await expect(clusterRolesAndAccessPage.userRow(dedicatedAdminUser)).toContainText(
        'dedicated-admins',
      );
    });

    test('Add user with cluster-admins group and verify in table', async ({
      clusterRolesAndAccessPage,
    }) => {
      await clusterRolesAndAccessPage.addClusterUser(clusterAdminUser, 'cluster-admins');

      await expect(clusterRolesAndAccessPage.userRow(clusterAdminUser)).toBeVisible({
        timeout: 30000,
      });
      await expect(clusterRolesAndAccessPage.userRow(clusterAdminUser)).toContainText(
        'cluster-admins',
      );
    });

    test('Verify both users coexist in the table', async ({ clusterRolesAndAccessPage }) => {
      await expect(clusterRolesAndAccessPage.userRow(dedicatedAdminUser)).toBeVisible();
      await expect(clusterRolesAndAccessPage.userRow(clusterAdminUser)).toBeVisible();
    });

    test('Delete dedicated-admins user and verify removal', async ({
      clusterRolesAndAccessPage,
    }) => {
      await clusterRolesAndAccessPage.deleteClusterUser(dedicatedAdminUser);
      await expect(clusterRolesAndAccessPage.userRow(dedicatedAdminUser)).toBeHidden({
        timeout: 30000,
      });
    });

    test('Delete cluster-admins user and verify removal', async ({ clusterRolesAndAccessPage }) => {
      await clusterRolesAndAccessPage.deleteClusterUser(clusterAdminUser);
      await expect(clusterRolesAndAccessPage.userRow(clusterAdminUser)).toBeHidden({
        timeout: 30000,
      });
    });

    test.afterAll(async ({ clusterRolesAndAccessPage }) => {
      await clusterRolesAndAccessPage.deleteClusterUser(dedicatedAdminUser).catch(() => {
        console.error(`Failed to delete user ${dedicatedAdminUser} or already deleted`);
      });
      await clusterRolesAndAccessPage.deleteClusterUser(clusterAdminUser).catch(() => {
        console.error(`Failed to delete user ${clusterAdminUser} or already deleted`);
      });
    });
  },
);
