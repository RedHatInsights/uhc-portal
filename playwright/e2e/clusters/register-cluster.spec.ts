import { test, expect } from '../../fixtures/pages';
import { v4 } from 'uuid';

test.describe.serial('Register cluster flow', { tag: ['@ci', '@smoke'] }, () => {
  const clusterID = v4();
  const displayName = `playwright-${clusterID}`;

  test.beforeAll(async ({ navigateTo }) => {
    // Navigate to cluster list with clean state
    await navigateTo('cluster-list');
  });

  test('navigate to register cluster', async ({ clusterListPage }) => {
    // Wait for cluster list data to load
    await clusterListPage.waitForDataReady();
    await clusterListPage.isClusterListScreen();

    await expect(clusterListPage.registerCluster()).toBeVisible();
    await clusterListPage.registerCluster().click();
    await clusterListPage.isRegisterClusterUrl();
    await clusterListPage.isRegisterClusterScreen();
  });

  test('shows an error when cluster ID is not valid', async ({ registerClusterPage }) => {
    await registerClusterPage.clusterIDInput().fill('not really a uuid');
    await registerClusterPage.clusterIDInput().blur();
    await expect(registerClusterPage.clusterIDError()).toBeVisible();
    await expect(registerClusterPage.clusterIDError()).toContainText(
      "Cluster ID 'not really a uuid' is not a valid UUID.",
    );
    await registerClusterPage.clusterIDInput().clear();
    await expect(registerClusterPage.clusterIDError()).toBeVisible();
    await expect(registerClusterPage.clusterIDError()).toContainText('Cluster ID is required.');
  });

  test('shows error when display name is not valid', async ({ registerClusterPage }) => {
    await registerClusterPage.displayNameInput().fill('a'.repeat(70));
    await registerClusterPage.displayNameInput().blur();
    await expect(registerClusterPage.displayNameError()).toBeVisible();
    await expect(registerClusterPage.displayNameError()).toContainText(
      'Cluster display name may not exceed 63 characters.',
    );
  });

  test('shows error when URL is not valid', async ({ registerClusterPage }) => {
    await registerClusterPage.clusterURLInput().fill('asdf');
    await registerClusterPage.clusterURLInput().blur();
    await expect(registerClusterPage.clusterURLError()).toBeVisible();
    await expect(registerClusterPage.clusterURLError()).toContainText(
      'The URL should include the scheme prefix (http://, https://)',
    );
    await registerClusterPage.clusterURLInput().clear();
    await registerClusterPage.clusterURLInput().fill('https://uwu');
    await registerClusterPage.clusterURLInput().blur();
    await expect(registerClusterPage.clusterURLError()).toBeVisible();
    await expect(registerClusterPage.clusterURLError()).toContainText('Invalid URL');
  });

  test('redirects to cluster list when clicking cancel', async ({
    clusterListPage,
    registerClusterPage,
  }) => {
    await registerClusterPage.cancelButton().click();
    await clusterListPage.isClusterListScreen();
  });

  test('creates a new cluster and redirects to its details page', async ({
    clusterListPage,
    registerClusterPage,
    clusterDetailsPage,
  }) => {
    await clusterListPage.registerCluster().click();
    await clusterListPage.isRegisterClusterUrl();
    await registerClusterPage.clusterIDInput().fill(clusterID);
    await registerClusterPage.clusterIDInput().blur();
    await expect(registerClusterPage.clusterIDError()).not.toBeVisible();
    await registerClusterPage.displayNameInput().fill(displayName);
    await registerClusterPage.displayNameInput().blur();
    await expect(registerClusterPage.displayNameError()).not.toBeVisible();
    await registerClusterPage.submitButton().click();
    await clusterDetailsPage.isClusterDetailsPage(displayName);
  });

  test('successfully changes the console URL for the cluster', async ({ clusterDetailsPage }) => {
    const url = 'http://example.com';
    await clusterDetailsPage.addConsoleURLButton().click();
    await clusterDetailsPage.waitForEditUrlModalToLoad();
    await clusterDetailsPage.editConsoleURLDialogInput().fill(url);
    await clusterDetailsPage.editConsoleURLDialogConfirm().click();
    await clusterDetailsPage.waitForEditUrlModalToClear();
    await clusterDetailsPage.waitForClusterDetailsLoad();
    await expect(clusterDetailsPage.openConsoleLink()).toHaveAttribute('href', url);
    await expect(clusterDetailsPage.openConsoleLink().locator('button')).toContainText(
      'Open console',
    );
  });

  test('successfully changes display name', async ({ clusterDetailsPage }) => {
    await clusterDetailsPage.actionsDropdownToggle().click();
    await clusterDetailsPage.editDisplayNameDropdownItem().click();
    await clusterDetailsPage.waitForEditDisplayNameModalToLoad();
    await clusterDetailsPage.editDisplayNameInput().clear();
    await clusterDetailsPage.editDisplayNameInput().fill(`${displayName}-test`);
    await clusterDetailsPage.editDisplayNameInput().blur();
    await clusterDetailsPage.editDisplaynameConfirm().click();
    await clusterDetailsPage.waitForEditDisplayNameModalToClear();
    await clusterDetailsPage.waitForClusterDetailsLoad();
    await clusterDetailsPage.waitForDisplayNameChange(displayName);
    await expect(clusterDetailsPage.clusterNameTitle()).toContainText(`${displayName}-test`);
  });

  test('successfully edit Subscription settings', async ({ clusterDetailsPage }) => {
    await clusterDetailsPage.editSubscriptionSettingsLink().click();
    await clusterDetailsPage.serviceLevelAgreementPremiumRadio().click();
    await clusterDetailsPage.clusterUsageProductionRadio().click();
    await clusterDetailsPage.subscriptionUnitsSocketsRadio().click();
    await clusterDetailsPage.numberOfSocketsInput().press('Control+a');
    await clusterDetailsPage.numberOfSocketsInput().fill('2');
    await clusterDetailsPage.saveSubscriptionButton().click();
    await clusterDetailsPage.waitForClusterDetailsLoad();
    await expect(clusterDetailsPage.subscriptionTypeValue()).toContainText(
      'Fixed capacity subscription from Red Hat',
      { timeout: 30000 },
    );
    await expect(clusterDetailsPage.serviceLevelAgreementValue()).toContainText('Premium');
    await expect(clusterDetailsPage.clusterUsageValue()).toContainText('Production');
    await expect(clusterDetailsPage.subscriptionUnitsValue()).toContainText('Sockets');
    await expect(clusterDetailsPage.coresOrSocketsValue()).toContainText('2 sockets');
    await expect(clusterDetailsPage.supportTypeValue()).toContainText('Red Hat support (L1-L3)');
  });

  test('successfully archives the newly created cluster', async ({ clusterDetailsPage }) => {
    await clusterDetailsPage.actionsDropdownToggle().click();
    await clusterDetailsPage.archiveClusterDropdownItem().click();
    await clusterDetailsPage.waitForArchiveClusterModalToLoad();
    await clusterDetailsPage.archiveClusterDialogConfirm().click();
    await expect(clusterDetailsPage.archivedClusterSuccessNotification()).toBeVisible();
    await clusterDetailsPage.waitForClusterDetailsLoad();
    await expect(clusterDetailsPage.unarchiveClusterButton()).toBeVisible();
  });

  test('successfully unarchives the archived cluster', async ({ clusterDetailsPage }) => {
    await clusterDetailsPage.unarchiveClusterButton().click();
    await clusterDetailsPage.waitForUnarchiveClusterModalToLoad();
    await clusterDetailsPage.unarchiveClusterDialogConfirm().click();
    await expect(clusterDetailsPage.unarchivedClusterSuccessNotification()).toBeVisible();
    await clusterDetailsPage.waitForClusterDetailsLoad();
  });

  test('Finally, archive the cluster created', async ({ clusterDetailsPage }) => {
    await clusterDetailsPage.actionsDropdownToggle().click();
    await clusterDetailsPage.archiveClusterDropdownItem().click();
    await clusterDetailsPage.waitForArchiveClusterModalToLoad();
    await clusterDetailsPage.archiveClusterDialogConfirm().click();
    await expect(clusterDetailsPage.archivedClusterSuccessNotification().nth(1)).toBeVisible();
    await clusterDetailsPage.waitForClusterDetailsLoad();
    await expect(clusterDetailsPage.unarchiveClusterButton()).toBeVisible();
  });
});
