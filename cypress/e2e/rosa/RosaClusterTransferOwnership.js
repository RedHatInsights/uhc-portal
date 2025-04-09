import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetails from '../../pageobjects/ClusterDetails.page';
import TransferOwnershipPage from '../../pageobjects/ClusterTransferOwnership.page';
import ClusterActions from '../../pageobjects/ClusterActions.page';
import CommonPopups from '../../pageobjects/CommonPopups.page';

const clusterDetails = require('../../fixtures/rosa/RosaClusterClassicCreatePublic.json');
const clusterProfiles = ['rosa-classic-public'];

describe(
  'ROSA  classic Cluster Access control transfer ownership ',
  { tags: ['rosa', 'day2', 'public', 'multizone', 'classic', 'singlezone', 'transfer'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Open.*cluster/g)) {
        cy.visit('/cluster-list');
        ClusterListPage.waitForDataReady();
      }
    });

    clusterProfiles.forEach((clusterProfile) => {
      let clusterProperties = clusterDetails[clusterProfile]['day1-profile'];
      let transferOwnershipProperties =
        clusterDetails[clusterProfile]['day2-profile'].AccessControl.TransferOwnership;

      let clusterName = clusterProperties.ClusterName;

      it(`Open ${clusterName} cluster`, () => {
        ClusterListPage.filterTxtField().should('be.visible').click();
        ClusterListPage.filterTxtField().clear().type(clusterName);
        ClusterListPage.waitForDataReady();
        ClusterListPage.openClusterDefinition(clusterName);
      });

      it("Cluster's Access control tab > Transfer Ownerhip", () => {
        ClusterDetails.waitForInstallerScreenToLoad();
        ClusterDetails.isClusterDetailsPage(clusterProperties.ClusterName);
        ClusterDetails.accessControlTab().click();
        TransferOwnershipPage.transferOwnershipTab().click();
        TransferOwnershipPage.isTransferClusterSection(
          'Transfer ownership',
          'Transferring cluster ownership allows another individual in the same or a different organization to manage this cluster',
        );
        TransferOwnershipPage.initiateTransferButton().click();
        TransferOwnershipPage.isTransferOwnershipDialogHeader(
          `Transfer ownership of ${clusterName}`,
        );
        TransferOwnershipPage.transferOwnershipUsernameInput().type(
          transferOwnershipProperties.AccountDetails.Username,
        );
        TransferOwnershipPage.transferOwnershipAccountIDInput().type(
          transferOwnershipProperties.AccountDetails.AccountID,
        );
        TransferOwnershipPage.transferOwnershipOrganizationIDInput().type(
          transferOwnershipProperties.AccountDetails.OrganizationID,
        );
        let dateOfRequest = new Date().toLocaleString();
        TransferOwnershipPage.transferModelInitiateTransferButton().click();
        CommonPopups.isClusterTransferAlertShown();
        CommonPopups.closeAlert();
        TransferOwnershipPage.isTransferPendingHeaders();
        TransferOwnershipPage.isTransferDetailsSection(
          dateOfRequest,
          Cypress.env('TEST_WITHQUOTA_USER'),
          transferOwnershipProperties.AccountDetails.Username,
          'pending',
        );
      });
      it("Cluster's Access control tab > Cancel transfer Ownerhip", () => {
        TransferOwnershipPage.cancelTransferButton().click();
        TransferOwnershipPage.isCancelTransferModel();
        TransferOwnershipPage.cancelTransferButtonFromModel().click();
        CommonPopups.isClusterTransferCancelAlertShown();
        CommonPopups.closeAlert();
      });

      it('Cluster transfer Ownerhip from Actions', () => {
        ClusterActions.actionsDropdown().click();
        ClusterActions.clickActionsMenuItem('Transfer cluster ownership');
        TransferOwnershipPage.isTransferOwnershipDialogHeader(
          `Transfer ownership of ${clusterName}`,
        );
        TransferOwnershipPage.transferOwnershipUsernameInput().type(
          transferOwnershipProperties.AccountDetails.Username,
        );
        TransferOwnershipPage.transferOwnershipAccountIDInput().type(
          transferOwnershipProperties.AccountDetails.AccountID,
        );
        TransferOwnershipPage.transferOwnershipOrganizationIDInput().type(
          transferOwnershipProperties.AccountDetails.OrganizationID,
        );
        let dateOfRequest = new Date().toLocaleString();
        TransferOwnershipPage.transferModelInitiateTransferButton().click();
        CommonPopups.isClusterTransferAlertShown();
        CommonPopups.closeAlert();
        ClusterActions.actionsDropdown().click();
        ClusterActions.clickActionsMenuItem('Transfer cluster ownership');
        TransferOwnershipPage.isTransferOwnershipProgressDialogHeader(
          `Transfer in progress for ${clusterName}`,
        );
        TransferOwnershipPage.isTransferOwnershipProgressDialogDetails(
          dateOfRequest,
          Cypress.env('TEST_WITHQUOTA_USER'),
          transferOwnershipProperties.AccountDetails.Username,
          'pending',
        );
        TransferOwnershipPage.cancelTransferButtonFromModel().click();
        CommonPopups.isClusterTransferCancelAlertShown();
        CommonPopups.closeAlert();
      });

      it('Cluster transfer Ownerhip from Overview page', () => {
        ClusterDetails.overviewTab().click();
        ClusterDetails.clusterOwnerLink().click();
        TransferOwnershipPage.isTransferOwnershipDialogHeader(
          `Transfer ownership of ${clusterName}`,
        );
        TransferOwnershipPage.transferOwnershipUsernameInput().type(
          transferOwnershipProperties.AccountDetails.Username,
        );
        TransferOwnershipPage.transferOwnershipAccountIDInput().type(
          transferOwnershipProperties.AccountDetails.AccountID,
        );
        TransferOwnershipPage.transferOwnershipOrganizationIDInput().type(
          transferOwnershipProperties.AccountDetails.OrganizationID,
        );
        let dateOfRequest = new Date().toLocaleString();
        TransferOwnershipPage.transferModelInitiateTransferButton().click();
        CommonPopups.isClusterTransferAlertShown();
        CommonPopups.closeAlert();
        ClusterDetails.clusterOwnerLink().click();
        TransferOwnershipPage.isTransferOwnershipProgressDialogHeader(
          `Transfer in progress for ${clusterName}`,
        );
        TransferOwnershipPage.isTransferOwnershipProgressDialogDetails(
          dateOfRequest,
          Cypress.env('TEST_WITHQUOTA_USER'),
          transferOwnershipProperties.AccountDetails.Username,
          'pending',
        );
        TransferOwnershipPage.cancelTransferButtonFromModel().click();
        CommonPopups.isClusterTransferCancelAlertShown();
        CommonPopups.closeAlert();
      });

      it('Cluster transfer Ownerhip from cluster list page', () => {
        cy.visit('/cluster-list');
        ClusterListPage.waitForDataReady();
        ClusterListPage.filterTxtField().should('be.visible').click();
        ClusterListPage.filterTxtField().clear().type(clusterName);
        ClusterListPage.waitForClusterInClusterList(clusterName);
        ClusterListPage.clickClusterKebabIcon(clusterName);
        ClusterListPage.clickKebabMenuItem('Transfer cluster ownership');
        TransferOwnershipPage.isTransferOwnershipDialogHeader(
          `Transfer ownership of ${clusterName}`,
        );
        TransferOwnershipPage.transferOwnershipUsernameInput().type(
          transferOwnershipProperties.AccountDetails.Username,
        );
        TransferOwnershipPage.transferOwnershipAccountIDInput().type(
          transferOwnershipProperties.AccountDetails.AccountID,
        );
        TransferOwnershipPage.transferOwnershipOrganizationIDInput().type(
          transferOwnershipProperties.AccountDetails.OrganizationID,
        );
        let dateOfRequest = new Date().toLocaleString();
        TransferOwnershipPage.transferModelInitiateTransferButton().click();
        CommonPopups.isClusterTransferAlertShown();
        CommonPopups.closeAlert();
        ClusterListPage.clickClusterKebabIcon(clusterName);
        ClusterListPage.clickKebabMenuItem('Transfer cluster ownership');
        TransferOwnershipPage.isTransferOwnershipProgressDialogHeader(
          `Transfer in progress for ${clusterName}`,
        );
        TransferOwnershipPage.isTransferOwnershipProgressDialogDetails(
          dateOfRequest,
          Cypress.env('TEST_WITHQUOTA_USER'),
          transferOwnershipProperties.AccountDetails.Username,
          'pending',
        );
        TransferOwnershipPage.cancelTransferButtonFromModel().click();
        CommonPopups.isClusterTransferCancelAlertShown();
        CommonPopups.closeAlert();
      });
      it('Cluster transfer Ownerhip model field validations', () => {
        ClusterListPage.clickClusterKebabIcon(clusterName);
        ClusterListPage.clickKebabMenuItem('Transfer cluster ownership');
        TransferOwnershipPage.transferOwnershipUsernameInput()
          .type(Cypress.env('TEST_WITHQUOTA_USER'))
          .blur();
        TransferOwnershipPage.isTransferFieldValidationShown(
          transferOwnershipProperties.AccountValidations.TransferYourselfError,
        );
        TransferOwnershipPage.transferOwnershipUsernameInput()
          .type(transferOwnershipProperties.AccountValidations.LongUserNameIDs)
          .blur();
        TransferOwnershipPage.isTransferFieldValidationShown(
          transferOwnershipProperties.AccountValidations.LongCharacterLengthError,
        );
        TransferOwnershipPage.transferOwnershipUsernameInput().clear();
        TransferOwnershipPage.transferOwnershipAccountIDInput()
          .type(transferOwnershipProperties.AccountValidations.LongUserNameIDs)
          .blur();
        TransferOwnershipPage.isTransferFieldValidationShown(
          transferOwnershipProperties.AccountValidations.LongCharacterLengthError,
        );
        TransferOwnershipPage.transferOwnershipAccountIDInput().clear();
        TransferOwnershipPage.transferOwnershipOrganizationIDInput()
          .type(transferOwnershipProperties.AccountValidations.LongUserNameIDs)
          .blur();
        TransferOwnershipPage.isTransferFieldValidationShown(
          transferOwnershipProperties.AccountValidations.LongCharacterLengthError,
        );
        TransferOwnershipPage.transferOwnershipOrganizationIDInput().clear();
        TransferOwnershipPage.transferOwnershipOrganizationIDInput()
          .type(transferOwnershipProperties.AccountValidations.InvalidAccountOrgID)
          .blur();
        TransferOwnershipPage.isTransferFieldValidationShown(
          transferOwnershipProperties.AccountValidations.InvalidOrganizationIDError,
        );
        TransferOwnershipPage.transferOwnershipOrganizationIDInput().clear();
        TransferOwnershipPage.transferOwnershipAccountIDInput()
          .type(transferOwnershipProperties.AccountValidations.InvalidAccountOrgID)
          .blur();
        TransferOwnershipPage.isTransferFieldValidationShown(
          transferOwnershipProperties.AccountValidations.InvalidAccountIDError,
        );
        TransferOwnershipPage.transferOwnershipAccountIDInput().clear();
        TransferOwnershipPage.initiateTransferButtonFromModel().should('be.disabled');
        TransferOwnershipPage.cancelButtonFromModel().click();
      });
    });
  },
);
