import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterListPage } from '../../page-objects/cluster-list-page';
import { CreateClusterPage } from '../../page-objects/create-cluster-page';
import { CreateOSDWizardPage } from '../../page-objects/create-osd-wizard-page';
import { GlobalNavPage } from '../../page-objects/global-nav-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

const clusterName = `test-${Math.random().toString(36).substr(2, 10)}`;

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterListPage: ClusterListPage;
let createClusterPage: CreateClusterPage;
let createOSDWizardPage: CreateOSDWizardPage;
let globalNavPage: GlobalNavPage;

test.describe.serial('OSD cluster tests', { tag: ['@ci'] }, () => {
  test.beforeAll(async ({ browser }) => {
    // Setup: auth + navigate to cluster list
    const setup = await setupTestSuite(browser, 'cluster-list');

    sharedContext = setup.context;
    sharedPage = setup.page;

    // Initialize page objects for this test suite
    clusterListPage = new ClusterListPage(sharedPage);
    createClusterPage = new CreateClusterPage(sharedPage);
    createOSDWizardPage = new CreateOSDWizardPage(sharedPage);
    globalNavPage = new GlobalNavPage(sharedPage);

    // Wait for cluster list data to load
    await clusterListPage.waitForDataReady();
    await clusterListPage.isClusterListScreen();
  });

  test.afterAll(async () => {
    await cleanupTestSuite(sharedContext);
  });

  test.describe.serial('Create OSD cluster on AWS flow', () => {
    test('navigates to create OSD cluster', async () => {
      await sharedPage.getByTestId('create_cluster_btn').click();
      await createClusterPage.isCreateClusterPage();
      await createOSDWizardPage.osdCreateClusterButton().click();
      await createOSDWizardPage.isCreateOSDPage();
    });

    test('shows an error with invalid and empty names', async () => {
      await createOSDWizardPage.isBillingModelScreen();
      // select Red Hat account cloud option (previously default value)
      await sharedPage.locator(createOSDWizardPage.billingModelRedHatCloudAccountOption).click();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
      await sharedPage.getByTestId('aws-provider-card').click();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();

      await createOSDWizardPage.isClusterDetailsScreen();
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).scrollIntoViewIfNeeded();
      await sharedPage
        .locator(createOSDWizardPage.clusterNameInput)
        .fill('aaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaa-aaaaaaaa');
      await expect(sharedPage.locator(createOSDWizardPage.clusterNameInputError)).toContainText(
        '1 - 54 characters',
      );
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).clear();
      await expect(sharedPage.locator(createOSDWizardPage.clusterNameInputError)).toHaveCount(4);
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).clear();
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).fill('a*a');
      await expect(sharedPage.locator(createOSDWizardPage.clusterNameInputError)).toContainText(
        'Consist of lower-case alphanumeric',
      );
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).clear();
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).fill('9a');
      await expect(sharedPage.locator(createOSDWizardPage.clusterNameInputError)).toContainText(
        'Start with a lower-case alphabetic',
      );
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).clear();
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).fill('a*');
      await expect(
        sharedPage.locator(createOSDWizardPage.clusterNameInputError).last(),
      ).toContainText('End with a lower-case alphanumeric');
    });

    test.skip('fills OSD wizard but does not really create an OSD cluster', async () => {
      // TODO: This test fails because the page state is not preserved between serial tests
      // The test ends up back on the cluster list page instead of continuing from the OSD wizard
      // This needs investigation into why the page navigation is not maintained in Playwright serial tests
      console.log('Third test URL:', sharedPage.url());
      // Ensure we're on the cluster details screen
      await createOSDWizardPage.isClusterDetailsScreen();
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).clear();
      await sharedPage.locator(createOSDWizardPage.clusterNameInput).fill(clusterName);
      await expect(sharedPage.locator(createOSDWizardPage.clusterNameInputError)).toHaveCount(0);

      // click "next" until the cluster is created :)
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
      await createOSDWizardPage.isMachinePoolScreen();
      await expect(sharedPage.locator('.spinner-loading-text')).not.toBeVisible();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
      await createOSDWizardPage.isNetworkingScreen();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
      await createOSDWizardPage.isCIDRScreen();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
      await createOSDWizardPage.isClusterUpdatesScreen();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
      await createOSDWizardPage.isReviewScreen();
    });
  });
});

test.describe('OSD Trial cluster tests', () => {
  let trialSharedContext: BrowserContext;
  let trialSharedPage: Page;
  let trialClusterListPage: ClusterListPage;
  let trialCreateClusterPage: CreateClusterPage;
  let trialCreateOSDWizardPage: CreateOSDWizardPage;
  let trialGlobalNavPage: GlobalNavPage;

  test.beforeAll(async ({ browser }) => {
    // Setup: auth + navigate to cluster list
    const setup = await setupTestSuite(browser, 'cluster-list');

    trialSharedContext = setup.context;
    trialSharedPage = setup.page;

    // Initialize page objects for this test suite
    trialClusterListPage = new ClusterListPage(trialSharedPage);
    trialCreateClusterPage = new CreateClusterPage(trialSharedPage);
    trialCreateOSDWizardPage = new CreateOSDWizardPage(trialSharedPage);
    trialGlobalNavPage = new GlobalNavPage(trialSharedPage);

    // Wait for cluster list data to load
    await trialClusterListPage.waitForDataReady();
  });

  test.afterAll(async () => {
    await cleanupTestSuite(trialSharedContext);
  });

  test.describe('View Create OSD Trial cluster page', () => {
    test('navigates to create OSD Trial cluster and CCS is selected', async () => {
      await trialGlobalNavPage.breadcrumbItem('Cluster List').click({ force: true });

      await trialClusterListPage.waitForDataReady();

      await trialSharedPage.getByTestId('create_cluster_btn').click();
      await trialCreateClusterPage.isCreateClusterPage();
      await trialSharedPage.getByTestId('osd-create-trial-cluster').click({ force: true });
      await trialCreateOSDWizardPage.isCreateOSDTrialPage();
      await expect(trialSharedPage.locator(trialCreateOSDWizardPage.CCSSelected)).toBeVisible();
      await expect(trialSharedPage.locator(trialCreateOSDWizardPage.TrialSelected)).toBeVisible();
    });
  });
});
