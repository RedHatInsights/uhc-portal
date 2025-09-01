import { test, expect, Page, BrowserContext } from '@playwright/test';
import { SubscriptionsPage } from '../../page-objects/subscriptions-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';
const SubscriptionDedicatedAnnual = require('../../fixtures/subscription/SubscriptionDedicated.json');

const annualDescriptionText =
  'The summary of all annual subscriptions for OpenShift Dedicated and select add-ons purchased by your organization or granted by Red Hat. For subscription information on OpenShift Container Platform or Red Hat OpenShift Service on AWS (ROSA), see OpenShift Usage';
const onDemandDecriptionText =
  'Active subscriptions allow your organization to use up to a certain number of OpenShift Dedicated clusters. Overall OSD subscription capacity and usage can be viewed in';

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let subscriptionsPage: SubscriptionsPage;

test.describe.serial('Subscription page (OCP-25171)', { tag: ['@smoke'] }, () => {
  test.beforeAll(async ({ browser }) => {
    // Setup: auth + navigate to subscriptions
    const setup = await setupTestSuite(browser, 'quota');

    sharedContext = setup.context;
    sharedPage = setup.page;

    // Initialize page objects for this test suite
    subscriptionsPage = new SubscriptionsPage(sharedPage);

    // Wait for data to load
    await subscriptionsPage.waitForDataReady();
  });

  test.afterAll(async () => {
    await cleanupTestSuite(sharedContext);
  });

  test('Check the Subscription - from left navigations', async () => {
    await expect(subscriptionsPage.subscriptionLeftNavigationMenu()).toBeVisible();
    await subscriptionsPage.subscriptionLeftNavigationMenu().click();
    await subscriptionsPage.annualSubscriptionLeftNavigationMenu().click();
    await subscriptionsPage.isDedicatedAnnualPage();
    //await subscriptionsPage.isDedicatedSectionHeader();
  });

  test('Check the Subscription - Annual Subscriptions (Managed) page headers', async () => {
    await sharedPage.goto('quota');
    // Setting the customized quota response from fixture definitions.
    await subscriptionsPage.patchCustomQuotaDefinition(SubscriptionDedicatedAnnual);
    await subscriptionsPage.isDedicatedAnnualPage();
    // await subscriptionsPage.isDedicatedSectionHeader();

    await expect(sharedPage.getByText(annualDescriptionText)).toBeVisible();
    await subscriptionsPage.isContainEmbeddedLink(
      'OpenShift Usage',
      '/openshift/subscriptions/usage/openshift',
    );

    await subscriptionsPage.isSubscriptionTableHeader();
  });

  test('Check the Subscription - Annual Subscriptions (Managed) page details', async () => {
    await subscriptionsPage.checkQuotaTableColumns('Resource type');
    await subscriptionsPage.checkQuotaTableColumns('Resource name');
    await subscriptionsPage.checkQuotaTableColumns('Availability');
    await subscriptionsPage.checkQuotaTableColumns('Plan type');
    await subscriptionsPage.checkQuotaTableColumns('Cluster type');
    await subscriptionsPage.checkQuotaTableColumns('Used');
    await subscriptionsPage.checkQuotaTableColumns('Capacity');

    await subscriptionsPage.planTypeHelpButton().click();
    await expect(
      sharedPage.getByText('Standard: Cluster infrastructure costs paid by Red Hat'),
    ).toBeVisible();
    await expect(
      sharedPage.getByText('CCS: Cluster infrastructure costs paid by the customer'),
    ).toBeVisible();
    await subscriptionsPage.planTypeHelpButton().click();

    // Validate first row
    let firstRow = subscriptionsPage.getQuotaTableRow(SubscriptionDedicatedAnnual.items[0]);
    let rowElement = firstRow.locator('..');
    let cells = rowElement.locator('td');
    await expect(cells.nth(1)).toContainText(
      SubscriptionDedicatedAnnual.items[0].related_resources[0].resource_name,
    );
    await expect(cells.nth(2)).toContainText('N/A');
    await expect(cells.nth(3)).toContainText('Standard');
    await expect(cells.nth(4)).toContainText('OSD');
    await expect(cells.nth(5)).toContainText('10 of 10');

    // Validate second row
    let secondRow = subscriptionsPage.getQuotaTableRow(SubscriptionDedicatedAnnual.items[1]);
    rowElement = secondRow.locator('..');
    cells = rowElement.locator('td');
    await expect(cells.nth(1)).toContainText(
      SubscriptionDedicatedAnnual.items[1].related_resources[0].resource_name,
    );
    await expect(cells.nth(2)).toContainText('N/A');
    await expect(cells.nth(3)).toContainText('CCS');
    await expect(cells.nth(4)).toContainText('OSD');
    await expect(cells.nth(5)).toContainText('50 of 100');

    // Validate third row
    let thirdRow = subscriptionsPage.getQuotaTableRow(SubscriptionDedicatedAnnual.items[2]);
    rowElement = thirdRow.locator('..');
    cells = rowElement.locator('td');
    await expect(cells.nth(1)).toContainText(
      SubscriptionDedicatedAnnual.items[2].related_resources[0].resource_name,
    );
    await expect(cells.nth(2)).toContainText('N/A');
    await expect(cells.nth(3)).toContainText('Standard');
    await expect(cells.nth(4)).toContainText('OSD');
    await expect(cells.nth(5)).toContainText('0 of 280');
  });

  test('Check the Subscription - Dedicated Ondemand page headers', async () => {
    await sharedPage.goto('quota/resource-limits');
    // Setting the customized quota response from fixture definitions.
    await subscriptionsPage.patchCustomQuotaDefinition(SubscriptionDedicatedAnnual);
    await subscriptionsPage.isDedicatedOnDemandPage();
    //await subscriptionsPage.isDedicatedOnDemandSectionHeader();

    await expect(sharedPage.getByText(onDemandDecriptionText)).toBeVisible();
    await subscriptionsPage.isContainEmbeddedLink(
      'Dedicated (On-Demand)',
      '/openshift/subscriptions/openshift-dedicated',
    );

    await subscriptionsPage.isSubscriptionTableHeader();
  });

  test('Check the Subscription - Dedicated Ondemand page details', async () => {
    await subscriptionsPage.checkQuotaTableColumns('Resource type');
    await subscriptionsPage.checkQuotaTableColumns('Resource name');
    await subscriptionsPage.checkQuotaTableColumns('Availability');
    await subscriptionsPage.checkQuotaTableColumns('Plan type');
    await subscriptionsPage.checkQuotaTableColumns('Cluster type');
    await subscriptionsPage.checkQuotaTableColumns('Used');
    await subscriptionsPage.checkQuotaTableColumns('Capacity');

    await subscriptionsPage.planTypeHelpButton().click();
    await expect(
      sharedPage.getByText('Standard: Cluster infrastructure costs paid by Red Hat'),
    ).toBeVisible();
    await expect(
      sharedPage.getByText('CCS: Cluster infrastructure costs paid by the customer'),
    ).toBeVisible();
    await subscriptionsPage.planTypeHelpButton().click();

    // Validate fourth row (ROSA cluster)
    let fourthRow = subscriptionsPage.getQuotaTableRow(SubscriptionDedicatedAnnual.items[3]);
    let rowElement = fourthRow.locator('..');
    let cells = rowElement.locator('td');
    await expect(cells.nth(1)).toContainText(
      SubscriptionDedicatedAnnual.items[3].related_resources[0].resource_name,
    );
    await expect(cells.nth(2)).toContainText('N/A');
    await expect(cells.nth(3)).toContainText('CCS');
    await expect(cells.nth(4)).toContainText('ROSA');
    await expect(cells.nth(5)).toContainText('1 of 2020');

    // Validate fifth row (vCPU)
    let fifthRow = subscriptionsPage.getQuotaTableRow(SubscriptionDedicatedAnnual.items[4]);
    rowElement = fifthRow.locator('..');
    cells = rowElement.locator('td');
    await expect(cells.nth(1)).toContainText('vCPU');
    await expect(cells.nth(2)).toContainText('N/A');
    await expect(cells.nth(3)).toContainText('CCS');
    await expect(cells.nth(4)).toContainText('ROSA');
    await expect(cells.nth(5)).toContainText('48 of 204000');
  });

  test('Check the Subscription - Annual Subscriptions (Managed) page when no quota available', async () => {
    await sharedPage.goto('quota');
    // Setting the empty quota response to check the empty conditions
    await subscriptionsPage.patchCustomQuotaDefinition();
    await subscriptionsPage.isDedicatedAnnualPage();
    await expect(sharedPage.getByText('You do not have any quota')).toBeVisible();
  });

  test('Check the Subscription - Dedicated Ondemand page when no quota available', async () => {
    await sharedPage.goto('quota/resource-limits');
    // Setting the empty quota response to check the empty conditions
    await subscriptionsPage.patchCustomQuotaDefinition();
    await subscriptionsPage.isDedicatedOnDemandPage();
    await expect(
      sharedPage.getByText('Marketplace On-Demand subscriptions not detected'),
    ).toBeVisible();

    const enableMarketplaceLink = subscriptionsPage.enableMarketplaceLink();
    await expect(enableMarketplaceLink).toHaveAttribute(
      'href',
      /https:\/\/marketplace\.redhat\.com\/en-us\/products\/red-hat-openshift-dedicated/,
    );

    const learnMoreLink = subscriptionsPage.learnMoreLink();
    await expect(learnMoreLink).toHaveAttribute(
      'href',
      /https:\/\/access\.redhat\.com\/documentation\/en-us\/openshift_cluster_manager\/2023\/html\/managing_clusters\/assembly-cluster-subscriptions/,
    );
  });
});
