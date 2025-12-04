import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterHistoryPage from '../../pageobjects/ClusterHistory.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';

const clusterDetails = require('../../fixtures/rosa-hosted/RosaHostedClusterCreatePublic.json');
const awsBillingAccountId = Cypress.env('QE_AWS_BILLING_ID');
const secondaryAWSBillingAccountId =
  clusterDetails['rosa-hosted-public']['day2-profile']['SecondaryAWSBillingAccountId'];
const clusterName = clusterDetails['rosa-hosted-public']['day1-profile']['ClusterName'];

describe(
  'Rosa hosted cluster (hypershift) - Overview actions(OCP-76127)',
  { tags: ['day2', 'hosted', 'rosa', 'hcp'] },
  () => {
    before(() => {
      cy.visit(CLUSTER_LIST_PATH);
      ClusterListPage.waitForDataReady();
    });

    it(`Open ${clusterName} cluster`, () => {
      ClusterListPage.filterTxtField().should('be.visible').click();
      ClusterListPage.filterTxtField().clear().type(clusterName);
      ClusterListPage.waitForDataReady();
      ClusterListPage.openClusterDefinition(clusterName);
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterName);
    });

    it(`Validations for the billing account field within the dropdown`, () => {
      ClusterDetailsPage.showBillingMarketplaceAccountLink();

      ClusterDetailsPage.clickAWSBillingAccountsDropDown();

      ClusterDetailsPage.verifyBillingAccountDocLink('Connect ROSA to a new AWS billing account');

      ClusterDetailsPage.filterAWSBillingAccount('awsBillingAccount');

      cy.contains('Please enter numeric digits only.').should('be.visible');

      ClusterDetailsPage.filterAWSBillingAccount('??');

      cy.contains('Please enter numeric digits only.').should('be.visible');
      ClusterDetailsPage.filterAWSBillingAccount('46555555');
      cy.contains('No results found').should('be.visible');

      ClusterDetailsPage.showEditAWSBillingAccountModal();
    });

    it(`Update billing account values within the Billing marketplace account dropdown`, () => {
      ClusterDetailsPage.showBillingMarketplaceAccountLink();
      ClusterDetailsPage.verifyBillingAccountDocLink('Connect a new AWS billing account');
      ClusterDetailsPage.clickAWSBillingAccountsDropDown();
      ClusterDetailsPage.filterAWSBillingAccount(secondaryAWSBillingAccountId);
      ClusterDetailsPage.selectAWSBillingAccount(secondaryAWSBillingAccountId);
      ClusterDetailsPage.refreshBillingAWSAccountButton();
      ClusterDetailsPage.updateAWSBillingAccount();
    });

    it(`Check the updated billing account value in the cluster history tab`, () => {
      ClusterDetailsPage.clusterHistoryTab().click();
      ClusterHistoryPage.refreshSpinner();
      ClusterHistoryPage.expandClusterHistoryRowEntry('Billing account updated');
      ClusterHistoryPage.isRowContainsText(
        `Billing account has been updated to '${secondaryAWSBillingAccountId}'`,
      );
    });

    after(`Revert the Billing account changes made in the earlier test steps`, () => {
      ClusterDetailsPage.overviewTab().click();
      ClusterDetailsPage.showBillingMarketplaceAccountLink();
      ClusterDetailsPage.clickAWSBillingAccountsDropDown();
      ClusterDetailsPage.filterAWSBillingAccount(awsBillingAccountId);
      ClusterDetailsPage.selectAWSBillingAccount(awsBillingAccountId);
      ClusterDetailsPage.updateAWSBillingAccount();
    });
  },
);
