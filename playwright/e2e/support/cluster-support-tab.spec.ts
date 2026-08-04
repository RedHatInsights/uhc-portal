import { expect, test } from '../../fixtures/pages';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const supportData = require('../../fixtures/support/cluster-support-tab.spec.json');

const clusterName =
  process.env.CLUSTER_NAME ||
  clusterProfiles['rosa-hosted-public-advanced']['day1-profile']['ClusterName'];
const notificationContact = supportData['NotificationContact'];

test.describe.serial(
  'ROSA HCP Cluster Support tab tests',
  { tag: ['@day2', '@advanced', '@rosa-hosted', '@hcp'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test(`Navigate to ${clusterName} cluster`, async ({ clusterListPage, clusterDetailsPage }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
    });

    test('Validate Support tab layout and sections', async ({ clusterSupportPage }) => {
      await clusterSupportPage.goToSupportTab();
      await clusterSupportPage.isClusterSupportPage();
      await expect(clusterSupportPage.addNotificationContactButton()).toBeVisible();
      await expect(clusterSupportPage.openSupportCaseButton()).toBeVisible();
      await clusterSupportPage.checkSupportCaseTableHeaders();
    });

    test('Open and cancel Add notification contact modal', async ({ clusterSupportPage }) => {
      await clusterSupportPage.openAddNotificationContactModal();
      await expect(clusterSupportPage.addNotificationContactModalHeading()).toBeVisible();
      await expect(clusterSupportPage.addNotificationContactModalDescription()).toBeVisible();
      await clusterSupportPage.cancelButton().click();
      await expect(clusterSupportPage.addNotificationContactModalHeading()).toBeHidden();
    });

    test('Add notification contact and verify in table', async ({ clusterSupportPage }) => {
      await clusterSupportPage.addNotificationContact(notificationContact.ValidUsername);
      await expect(clusterSupportPage.notificationContactAddedAlert()).toBeVisible();
      await clusterSupportPage.checkNotificationContactTableHeaders();
      await clusterSupportPage.checkNotificationContacts(
        notificationContact.ValidUsername,
        notificationContact.ExpectedFirstName,
        notificationContact.ExpectedLastName,
      );
    });

    test('Delete notification contact and verify removal', async ({ clusterSupportPage }) => {
      await clusterSupportPage.deleteNotificationContactByUsername(
        notificationContact.ValidUsername,
      );
      await expect(clusterSupportPage.notificationContactDeletedAlert()).toBeVisible();
      await expect(
        clusterSupportPage.notificationContactRow(notificationContact.ValidUsername),
      ).toHaveCount(0);
    });

    test('Validate username field - illegal symbols show inline error', async ({
      clusterSupportPage,
    }) => {
      await clusterSupportPage.openAddNotificationContactModal();
      await clusterSupportPage.usernameInput().fill(notificationContact.InvalidUsernameWithSymbols);
      await expect(
        clusterSupportPage.inlineValidationError(notificationContact.InvalidUsernameSymbolsError),
      ).toBeVisible();
      await clusterSupportPage.usernameInput().clear();
      await clusterSupportPage.cancelButton().click();
    });

    test('Validate username field - unknown username shows server error', async ({
      clusterSupportPage,
    }) => {
      await clusterSupportPage.openAddNotificationContactModal();
      await clusterSupportPage.usernameInput().fill(notificationContact.ValidUsernameNotFound);
      await clusterSupportPage.addContactButton().click();
      await expect(
        clusterSupportPage.inlineValidationError(notificationContact.UsernameNotFoundError),
      ).toBeVisible();
      await clusterSupportPage.cancelButton().click();
    });
  },
);
