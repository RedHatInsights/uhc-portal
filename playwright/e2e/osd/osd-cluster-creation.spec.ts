import { test, expect } from '../../fixtures/pages';

const clusterName = `test-${Math.random().toString(36).substr(2, 10)}`;

test.describe.serial('OSD cluster tests', { tag: ['@ci'] }, () => {
  test.beforeAll(async ({ navigateTo, clusterListPage }) => {
    // Navigate to cluster-list and wait for data to load
    await navigateTo('cluster-list');
    await clusterListPage.waitForDataReady();
    await clusterListPage.isClusterListScreen();
  });
  test('Create OSD cluster on AWS flow- navigates to create OSD cluster', async ({
    page,
    createClusterPage,
    createOSDWizardPage,
  }) => {
    await page.getByTestId('create_cluster_btn').click();
    await createClusterPage.isCreateClusterPage();
    await createOSDWizardPage.osdCreateClusterButton().click();
    await createOSDWizardPage.isCreateOSDPage();
  });

  test('shows an error with invalid and empty names', async ({ page, createOSDWizardPage }) => {
    await createOSDWizardPage.isBillingModelScreen();
    // select Red Hat account cloud option (previously default value)
    await page.locator(createOSDWizardPage.billingModelRedHatCloudAccountOption).click();
    await page.locator(createOSDWizardPage.primaryButton).click();
    await page.getByTestId('aws-provider-card').click();
    await page.locator(createOSDWizardPage.primaryButton).click();

    await createOSDWizardPage.isClusterDetailsScreen();
    await page.locator(createOSDWizardPage.clusterNameInput).scrollIntoViewIfNeeded();
    await page
      .locator(createOSDWizardPage.clusterNameInput)
      .fill('aaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaa-aaaaaaaa');
    await createOSDWizardPage.expectClusterNameErrorMessage('1 - 54 characters');
    await page.locator(createOSDWizardPage.clusterNameInput).clear();
    await expect(page.locator(createOSDWizardPage.clusterNameInputError)).toHaveCount(4);
    await page.locator(createOSDWizardPage.clusterNameInput).clear();
    await page.locator(createOSDWizardPage.clusterNameInput).fill('a*a');
    await createOSDWizardPage.expectClusterNameErrorMessage(
      'Consist of lower-case alphanumeric characters, or hyphen (-)',
    );

    await page.locator(createOSDWizardPage.clusterNameInput).clear();
    await page.locator(createOSDWizardPage.clusterNameInput).fill('9a');
    await createOSDWizardPage.expectClusterNameErrorMessage(
      'Start with a lower-case alphabetic character',
    );

    await page.locator(createOSDWizardPage.clusterNameInput).clear();
    await page.locator(createOSDWizardPage.clusterNameInput).fill('a*');
    await createOSDWizardPage.expectClusterNameErrorMessage(
      'End with a lower-case alphanumeric character',
    );
  });

  test('View Create OSD Trial cluster page - navigates to create OSD Trial cluster and CCS is selected', async ({
    navigateTo,
    createOSDWizardPage,
  }) => {
    await navigateTo('create');
    await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdTrialCreateClusterButton());
    await createOSDWizardPage.isCreateOSDTrialPage();
    await createOSDWizardPage.isTrailDefinitionScreen();
  });

  test.skip('fills OSD wizard but does not really create an OSD cluster', async ({
    page,
    createOSDWizardPage,
  }) => {
    // TODO: This test fails because the page state is not preserved between serial tests
    // The test ends up back on the cluster list page instead of continuing from the OSD wizard
    // This needs investigation into why the page navigation is not maintained in Playwright serial tests
    console.log('Third test URL:', page.url());
    // Ensure we're on the cluster details screen
    await createOSDWizardPage.isClusterDetailsScreen();
    await page.locator(createOSDWizardPage.clusterNameInput).clear();
    await page.locator(createOSDWizardPage.clusterNameInput).fill(clusterName);
    await expect(page.locator(createOSDWizardPage.clusterNameInputError)).toHaveCount(0);

    // click "next" until the cluster is created :)
    await page.locator(createOSDWizardPage.primaryButton).click();
    await createOSDWizardPage.isMachinePoolScreen();
    await expect(page.locator('.spinner-loading-text')).not.toBeVisible();
    await page.locator(createOSDWizardPage.primaryButton).click();
    await createOSDWizardPage.isNetworkingScreen();
    await page.locator(createOSDWizardPage.primaryButton).click();
    await createOSDWizardPage.isCIDRScreen();
    await page.locator(createOSDWizardPage.primaryButton).click();
    await createOSDWizardPage.isClusterUpdatesScreen();
    await page.locator(createOSDWizardPage.primaryButton).click();
    await createOSDWizardPage.isReviewScreen();
  });
});
