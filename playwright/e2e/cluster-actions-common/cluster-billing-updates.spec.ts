import { expect, test } from '../../fixtures/pages';

const rosaHostedFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const clusterName =
  process.env.CLUSTER_NAME ||
  rosaHostedFixture['rosa-hosted-public-advanced']['day1-profile'].ClusterName;
const awsBillingAccountId = process.env.QE_AWS_BILLING_ID || '';
const secondaryAWSBillingAccountId = process.env.QE_AWS_SECONDARY_BILLING_ID || '';

test.describe.serial(
  'Rosa hosted cluster (hypershift) - Overview actions (OCP-76127)',
  { tag: ['@day2', '@rosa-hosted', '@rosa', '@hcp', '@advanced', '@billing'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage, clusterDetailsPage }) => {
      if (!awsBillingAccountId || !secondaryAWSBillingAccountId) {
        throw new Error(
          'Missing required env vars: QE_AWS_BILLING_ID, QE_AWS_SECONDARY_BILLING_ID',
        );
      }
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.waitForClusterDetailsLoad();
    });

    test('can validate billing account filter within the dropdown', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openEditBillingAccountModal();
      await clusterDetailsPage.openBillingAccountDropdown();

      await expect(
        clusterDetailsPage.billingAccountDocLink('Connect a new AWS billing account'),
      ).toHaveAttribute('href', 'https://console.aws.amazon.com/rosa/home');

      await clusterDetailsPage.filterBillingAccount('awsBillingAccount');
      await clusterDetailsPage.isTextContainsInPage('Please enter numeric digits only.');

      await clusterDetailsPage.filterBillingAccount('??');
      await clusterDetailsPage.isTextContainsInPage('Please enter numeric digits only.');

      await clusterDetailsPage.filterBillingAccount('46555555');
      await clusterDetailsPage.isTextContainsInPage('No results found');

      await clusterDetailsPage.closeBillingAccountDropdown();
    });

    test('can update billing account to a secondary account', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openEditBillingAccountModal();

      await expect(
        clusterDetailsPage.billingAccountDocLink('Connect a new AWS billing account'),
      ).toHaveAttribute('href', 'https://console.aws.amazon.com/rosa/home');

      await clusterDetailsPage.openBillingAccountDropdown();
      await clusterDetailsPage.filterBillingAccount(secondaryAWSBillingAccountId);
      await clusterDetailsPage.selectBillingAccount(secondaryAWSBillingAccountId);
      await expect(clusterDetailsPage.refreshAWSAccountsButton()).toBeVisible();
      await clusterDetailsPage.updateBillingAccount();
    });

    test('can verify updated billing account in cluster history tab', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.navigateToClusterHistoryTab();
      await clusterDetailsPage.historyRefreshButton().click();
      await clusterDetailsPage.expandHistoryRowEntry('Billing account updated');
      await clusterDetailsPage.verifyHistoryRowContainsText(
        `Billing account has been updated to '${secondaryAWSBillingAccountId}'`,
      );
    });

    test.afterAll(async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.navigateToOverviewTab();
      await clusterDetailsPage.openEditBillingAccountModal();
      await clusterDetailsPage.openBillingAccountDropdown();
      await clusterDetailsPage.filterBillingAccount(awsBillingAccountId);
      await clusterDetailsPage.selectBillingAccount(awsBillingAccountId);
      await clusterDetailsPage.updateBillingAccount();
    });
  },
);
