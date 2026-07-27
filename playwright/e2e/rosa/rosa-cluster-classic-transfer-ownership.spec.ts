import { test, expect } from '../../fixtures/pages';
import { CLUSTER_LIST_FULL_PATH } from '../../support/playwright-constants';
import { getAuthConfig } from '../../support/auth-config';

const clusterDetails = require('../../fixtures/rosa/rosa-cluster-classic-public-creation-advanced.spec.json');
const transferOwnershipProperties =
  clusterDetails['rosa-classic-public-advanced']['day2-profile'].AccessControl.TransferOwnership;
const clusterNamePrefix = clusterDetails['rosa-classic-public-advanced'].ClusterNamePrefix;
const { username: testUser } = getAuthConfig();

test.describe.serial(
  'ROSA classic cluster access control transfer ownership',
  { tag: ['@day2', '@rosa', '@rosa-classic', '@public', '@transfer'] },
  () => {
    let clusterName: string;

    test(`Open cluster matching ${clusterNamePrefix}`, async ({
      navigateTo,
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterNamePrefix);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterNamePrefix, 'startsWith');
      clusterName = await clusterDetailsPage.clusterNameTitle().innerText();
    });

    test("Cluster's Access control tab - Transfer Ownership", async ({
      clusterDetailsPage,
      transferOwnershipPage,
    }) => {
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
      await clusterDetailsPage.accessControlTab().click();
      await transferOwnershipPage.transferOwnershipTab().click();
      await transferOwnershipPage.cancelExistingTransferIfPending();
      await transferOwnershipPage.isTransferClusterSection(
        'Transfer ownership',
        'Transferring cluster ownership allows another individual in the same or a different organization to manage this cluster',
      );
      await transferOwnershipPage.initiateTransferButton().click();
      await transferOwnershipPage.isTransferOwnershipDialogHeader(
        `Transfer ownership of ${clusterName}`,
      );
      await transferOwnershipPage.fillTransferOwnershipForm(
        transferOwnershipProperties.AccountDetails.Username,
        transferOwnershipProperties.AccountDetails.AccountID,
        transferOwnershipProperties.AccountDetails.OrganizationID,
      );
      await transferOwnershipPage.submitTransferAndWaitForAlert();
      await transferOwnershipPage.closeAlert();
      await transferOwnershipPage.isTransferPendingHeaders();
      await transferOwnershipPage.isTransferDetailsSection(
        '',
        testUser,
        transferOwnershipProperties.AccountDetails.Username,
        'pending',
      );
    });

    test("Cluster's Access control tab - Cancel transfer Ownership", async ({
      transferOwnershipPage,
    }) => {
      await transferOwnershipPage.cancelTransferButton().click();
      await transferOwnershipPage.isCancelTransferModel();
      await transferOwnershipPage.cancelTransferAndWaitForAlert();
      await transferOwnershipPage.closeAlert();
    });

    test('Cluster transfer Ownership from Actions', async ({
      page,
      clusterDetailsPage,
      transferOwnershipPage,
    }) => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await page.getByRole('menuitem', { name: 'Transfer cluster ownership' }).click();
      await transferOwnershipPage.isTransferOwnershipDialogHeader(
        `Transfer ownership of ${clusterName}`,
      );
      await transferOwnershipPage.fillTransferOwnershipForm(
        transferOwnershipProperties.AccountDetails.Username,
        transferOwnershipProperties.AccountDetails.AccountID,
        transferOwnershipProperties.AccountDetails.OrganizationID,
      );
      await transferOwnershipPage.submitTransferAndWaitForAlert();
      await transferOwnershipPage.closeAlert();

      await clusterDetailsPage.actionsDropdownToggle().click();
      await page.getByRole('menuitem', { name: 'Transfer cluster ownership' }).click();
      await transferOwnershipPage.isTransferOwnershipProgressDialogHeader(
        `Transfer in progress for ${clusterName}`,
      );
      await transferOwnershipPage.isTransferOwnershipProgressDialogDetails(
        '',
        testUser,
        transferOwnershipProperties.AccountDetails.Username,
        'pending',
      );
      await transferOwnershipPage.cancelTransferButtonFromModel().click();
      await transferOwnershipPage.closeAlert();
    });

    test('Cluster transfer Ownership from Overview page', async ({
      clusterDetailsPage,
      transferOwnershipPage,
    }) => {
      await clusterDetailsPage.overviewTab().click();
      await clusterDetailsPage.clusterOwnerLink().click();
      await transferOwnershipPage.isTransferOwnershipDialogHeader(
        `Transfer ownership of ${clusterName}`,
      );
      await transferOwnershipPage.fillTransferOwnershipForm(
        transferOwnershipProperties.AccountDetails.Username,
        transferOwnershipProperties.AccountDetails.AccountID,
        transferOwnershipProperties.AccountDetails.OrganizationID,
      );
      await transferOwnershipPage.submitTransferAndWaitForAlert();
      await transferOwnershipPage.closeAlert();

      await clusterDetailsPage.clusterOwnerLink().click();
      await transferOwnershipPage.isTransferOwnershipProgressDialogHeader(
        `Transfer in progress for ${clusterName}`,
      );
      await transferOwnershipPage.isTransferOwnershipProgressDialogDetails(
        '',
        testUser,
        transferOwnershipProperties.AccountDetails.Username,
        'pending',
      );
      await transferOwnershipPage.cancelTransferButtonFromModel().click();
      await transferOwnershipPage.closeAlert();
    });

    test('Cluster transfer Ownership from cluster list page', async ({
      navigateTo,
      clusterListPage,
      transferOwnershipPage,
    }) => {
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForClusterInClusterList(clusterName);
      await clusterListPage.clickClusterKebabAction(clusterName, 'Transfer cluster ownership');
      await transferOwnershipPage.isTransferOwnershipDialogHeader(
        `Transfer ownership of ${clusterName}`,
      );
      await transferOwnershipPage.fillTransferOwnershipForm(
        transferOwnershipProperties.AccountDetails.Username,
        transferOwnershipProperties.AccountDetails.AccountID,
        transferOwnershipProperties.AccountDetails.OrganizationID,
      );
      await transferOwnershipPage.submitTransferAndWaitForAlert();
      await transferOwnershipPage.closeAlert();

      await clusterListPage.clickClusterKebabAction(clusterName, 'Transfer cluster ownership');
      await transferOwnershipPage.isTransferOwnershipProgressDialogHeader(
        `Transfer in progress for ${clusterName}`,
      );
      await transferOwnershipPage.isTransferOwnershipProgressDialogDetails(
        '',
        testUser,
        transferOwnershipProperties.AccountDetails.Username,
        'pending',
      );
      await transferOwnershipPage.cancelTransferButtonFromModel().click();
      await transferOwnershipPage.closeAlert();
    });

    test('Cluster transfer Ownership model field validations', async ({
      clusterListPage,
      transferOwnershipPage,
    }) => {
      await clusterListPage.clickClusterKebabAction(clusterName, 'Transfer cluster ownership');

      await transferOwnershipPage.transferOwnershipUsernameInput().fill(testUser);
      await transferOwnershipPage.transferOwnershipUsernameInput().blur();
      await transferOwnershipPage.isTransferFieldValidationShown(
        transferOwnershipProperties.AccountValidations.TransferYourselfError,
      );

      await transferOwnershipPage
        .transferOwnershipUsernameInput()
        .fill(transferOwnershipProperties.AccountValidations.LongUserNameIDs);
      await transferOwnershipPage.transferOwnershipUsernameInput().blur();
      await transferOwnershipPage.isTransferFieldValidationShown(
        transferOwnershipProperties.AccountValidations.LongCharacterLengthError,
      );

      await transferOwnershipPage.transferOwnershipUsernameInput().clear();
      await transferOwnershipPage
        .transferOwnershipAccountIDInput()
        .fill(transferOwnershipProperties.AccountValidations.LongUserNameIDs);
      await transferOwnershipPage.transferOwnershipAccountIDInput().blur();
      await transferOwnershipPage.isTransferFieldValidationShown(
        transferOwnershipProperties.AccountValidations.LongCharacterLengthError,
      );

      await transferOwnershipPage.transferOwnershipAccountIDInput().clear();
      await transferOwnershipPage
        .transferOwnershipOrganizationIDInput()
        .fill(transferOwnershipProperties.AccountValidations.LongUserNameIDs);
      await transferOwnershipPage.transferOwnershipOrganizationIDInput().blur();
      await transferOwnershipPage.isTransferFieldValidationShown(
        transferOwnershipProperties.AccountValidations.LongCharacterLengthError,
      );

      await transferOwnershipPage.transferOwnershipOrganizationIDInput().clear();
      await transferOwnershipPage
        .transferOwnershipOrganizationIDInput()
        .fill(transferOwnershipProperties.AccountValidations.InvalidAccountOrgID);
      await transferOwnershipPage.transferOwnershipOrganizationIDInput().blur();
      await transferOwnershipPage.isTransferFieldValidationShown(
        transferOwnershipProperties.AccountValidations.InvalidOrganizationIDError,
      );

      await transferOwnershipPage.transferOwnershipOrganizationIDInput().clear();
      await transferOwnershipPage
        .transferOwnershipAccountIDInput()
        .fill(transferOwnershipProperties.AccountValidations.InvalidAccountOrgID);
      await transferOwnershipPage.transferOwnershipAccountIDInput().blur();
      await transferOwnershipPage.isTransferFieldValidationShown(
        transferOwnershipProperties.AccountValidations.InvalidAccountIDError,
      );

      await transferOwnershipPage.transferOwnershipAccountIDInput().clear();
      await expect(transferOwnershipPage.initiateTransferButtonFromModel()).toBeDisabled();
      await transferOwnershipPage.cancelButtonFromModel().click();
    });

    test('Cluster transfer Ownership - transfer vs cluster transfer requests page', async ({
      navigateTo,
      clusterListPage,
      clusterRequestsPage,
      transferOwnershipPage,
    }) => {
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForClusterInClusterList(clusterName);
      await clusterListPage.clickClusterKebabAction(clusterName, 'Transfer cluster ownership');
      await transferOwnershipPage.fillTransferOwnershipForm(
        transferOwnershipProperties.AccountDetails.Username,
        transferOwnershipProperties.AccountDetails.AccountID,
        transferOwnershipProperties.AccountDetails.OrganizationID,
      );
      await transferOwnershipPage.submitTransferAndWaitForAlert();
      await transferOwnershipPage.closeAlert();
      await clusterListPage.isPendingTransferRequestsBannerShown(true, '1');

      await clusterListPage.clickClusterKebabAction(clusterName, 'Transfer cluster ownership');
      await transferOwnershipPage.isTransferOwnershipProgressDialogHeader(
        `Transfer in progress for ${clusterName}`,
      );
      await transferOwnershipPage.cancelTransferButtonFromModel().click();
      await transferOwnershipPage.closeAlert();
      await clusterListPage.isPendingTransferRequestsBannerShown(false, '0');

      await clusterListPage.clickClusterKebabAction(clusterName, 'Transfer cluster ownership');
      await transferOwnershipPage.fillTransferOwnershipForm(
        transferOwnershipProperties.AccountDetails.Username,
        transferOwnershipProperties.AccountDetails.AccountID,
        transferOwnershipProperties.AccountDetails.OrganizationID,
      );
      await transferOwnershipPage.submitTransferAndWaitForAlert();
      await transferOwnershipPage.closeAlert();
      await clusterListPage.showPendingTransferRequestsLink().click();
      await clusterRequestsPage.isClusterRequestsScreen();
      await clusterRequestsPage.checkClusterRequestsRowByClusterName(
        clusterName,
        'Pending',
        'ROSA',
        testUser,
        transferOwnershipProperties.AccountDetails.Username,
      );
    });

    test('Cluster transfer Ownership - cancel cluster transfer requests', async ({
      clusterRequestsPage,
    }) => {
      await clusterRequestsPage.cancelClusterRequestsByClusterName(clusterName);
      await clusterRequestsPage.checkClusterRequestsRowByClusterName(
        clusterName,
        'Closed',
        'ROSA',
        testUser,
        transferOwnershipProperties.AccountDetails.Username,
        'Canceled',
      );
    });
  },
);
