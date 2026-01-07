import { test, expect } from '../../fixtures/pages';
import type { QuotaItem } from '../../page-objects/subscriptions-page';

const SubscriptionDedicatedAnnual: {
  items: QuotaItem[];
} = require('../../fixtures/subscription/subscriptions.spec.json');

const TEST_DATA = {
  DESCRIPTIONS: {
    ANNUAL:
      'The summary of all annual subscriptions for OpenShift Dedicated and select add-ons purchased by your organization or granted by Red Hat. For subscription information on OpenShift Container Platform or Red Hat OpenShift Service on AWS (ROSA), see OpenShift Usage',
    ON_DEMAND:
      'Active subscriptions allow your organization to use up to a certain number of OpenShift Dedicated clusters. Overall OSD subscription capacity and usage can be viewed in',
  },
  EMPTY_STATES: {
    NO_QUOTA: 'You do not have any quota',
    NO_MARKETPLACE: 'Marketplace On-Demand subscriptions not detected',
  },
} as const;

test.describe.serial('Subscription page (OCP-25171)', { tag: ['@smoke'] }, () => {
  test.beforeAll(async ({ navigateTo, subscriptionsPage }) => {
    // Navigate to subscriptions and wait for data to load
    await navigateTo('quota');
    await subscriptionsPage.waitForDataReady();
  });

  test('Check the Subscription - from left navigations', async ({ subscriptionsPage }) => {
    await expect(subscriptionsPage.subscriptionLeftNavigationMenu()).toBeVisible();
    await subscriptionsPage.expandSubscriptionLeftNavigationMenu();
    await subscriptionsPage.annualSubscriptionLeftNavigationMenu().click();
    await subscriptionsPage.isDedicatedAnnualPage();
  });

  test('Check the Subscription - Annual Subscriptions (Managed) page headers', async ({
    navigateTo,
    page,
    subscriptionsPage,
  }) => {
    await navigateTo('quota');
    // Setting the customized quota response from fixture definitions.
    await subscriptionsPage.patchCustomQuotaDefinition(SubscriptionDedicatedAnnual);
    await subscriptionsPage.isDedicatedAnnualPage();

    await expect(page.getByText(TEST_DATA.DESCRIPTIONS.ANNUAL)).toBeVisible();
    await subscriptionsPage.isContainEmbeddedLink(
      'OpenShift Usage',
      '/openshift/subscriptions/usage/openshift',
    );

    await subscriptionsPage.isSubscriptionTableHeader();
  });

  test('Check the Subscription - Annual Subscriptions (Managed) page details', async ({
    subscriptionsPage,
  }) => {
    await subscriptionsPage.validateAllQuotaTableColumns();
    await subscriptionsPage.validatePlanTypeHelpPopover();

    // Validate first row
    await subscriptionsPage.validateQuotaTableRow(SubscriptionDedicatedAnnual.items[0], {
      resourceName: SubscriptionDedicatedAnnual.items[0].related_resources[0].resource_name,
      availability: 'N/A',
      planType: 'Standard',
      clusterType: 'OSD',
      usage: '10 of 10',
    });

    // Validate second row
    await subscriptionsPage.validateQuotaTableRow(SubscriptionDedicatedAnnual.items[1], {
      resourceName: SubscriptionDedicatedAnnual.items[1].related_resources[0].resource_name,
      availability: 'N/A',
      planType: 'CCS',
      clusterType: 'OSD',
      usage: '50 of 100',
    });

    // Validate third row
    await subscriptionsPage.validateQuotaTableRow(SubscriptionDedicatedAnnual.items[2], {
      resourceName: SubscriptionDedicatedAnnual.items[2].related_resources[0].resource_name,
      availability: 'N/A',
      planType: 'Standard',
      clusterType: 'OSD',
      usage: '0 of 280',
    });
  });

  test('Check the Subscription - Dedicated Ondemand page headers', async ({
    navigateTo,
    page,
    subscriptionsPage,
  }) => {
    await navigateTo('quota/resource-limits');
    // Setting the customized quota response from fixture definitions.
    await subscriptionsPage.patchCustomQuotaDefinition(SubscriptionDedicatedAnnual);
    await subscriptionsPage.isDedicatedOnDemandPage();

    await expect(page.getByText(TEST_DATA.DESCRIPTIONS.ON_DEMAND)).toBeVisible();
    await subscriptionsPage.isContainEmbeddedLink(
      'Dedicated (On-Demand)',
      '/openshift/subscriptions/openshift-dedicated',
    );

    await subscriptionsPage.isSubscriptionTableHeader();
  });

  test('Check the Subscription - Dedicated Ondemand page details', async ({
    subscriptionsPage,
  }) => {
    await subscriptionsPage.validateAllQuotaTableColumns();
    await subscriptionsPage.validatePlanTypeHelpPopover();

    // Validate fourth row (ROSA cluster)
    await subscriptionsPage.validateQuotaTableRow(SubscriptionDedicatedAnnual.items[3], {
      resourceName: SubscriptionDedicatedAnnual.items[3].related_resources[0].resource_name,
      availability: 'N/A',
      planType: 'CCS',
      clusterType: 'ROSA',
      usage: '1 of 2020',
    });

    // Validate fifth row (vCPU)
    await subscriptionsPage.validateQuotaTableRow(SubscriptionDedicatedAnnual.items[4], {
      resourceName: 'vCPU',
      availability: 'N/A',
      planType: 'CCS',
      clusterType: 'ROSA',
      usage: '48 of 204000',
    });
  });

  test('Check the Subscription - Annual Subscriptions (Managed) page when no quota available', async ({
    navigateTo,
    page,
    subscriptionsPage,
  }) => {
    await navigateTo('quota');
    // Setting the empty quota response to check the empty conditions
    await subscriptionsPage.patchCustomQuotaDefinition();
    await subscriptionsPage.isDedicatedAnnualPage();
    await expect(page.getByText(TEST_DATA.EMPTY_STATES.NO_QUOTA)).toBeVisible();
  });

  test('Check the Subscription - Dedicated Ondemand page when no quota available', async ({
    navigateTo,
    page,
    subscriptionsPage,
  }) => {
    await navigateTo('quota/resource-limits');
    // Setting the empty quota response to check the empty conditions
    await subscriptionsPage.patchCustomQuotaDefinition();
    await subscriptionsPage.isDedicatedOnDemandPage();
    await expect(page.getByText(TEST_DATA.EMPTY_STATES.NO_MARKETPLACE)).toBeVisible();

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
