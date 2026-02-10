import { test, expect } from '../../fixtures/pages';

const clusterProperties = require('../../fixtures/osd-aws/osd-ccs-aws-advanced-cluster-creation.spec.json');
const clusterName = process.env.CLUSTER_NAME || clusterProperties?.ClusterName || '';
const { notificationContact, validations } = clusterProperties['day2-profile'].Support;

test.describe.serial(
  'OSD AWS public cluster - Support actions',
  { tag: ['@day2', '@osd', '@aws', '@public', '@support'] },
  () => {
    test.beforeAll(async ({ clusterListPage, navigateTo }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
    });

    test.afterAll(async ({ clusterSupportPage }) => {
      const userCount = await clusterSupportPage.getNotificationContactCountByUsername(
        notificationContact.username,
      );
      const userExists = userCount > 0;

      if (userExists) {
        await clusterSupportPage.deleteNotificationContactByUsername(notificationContact.username);
      }
    });

    test(`Open ${clusterName} cluster`, async ({ clusterListPage, clusterDetailsPage }) => {
      await clusterListPage.searchAndOpenClusterDetailsPage(clusterName);
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
    });

    test(`Support tab validation for the cluster ${clusterName}`, async ({
      clusterDetailsPage,
      clusterSupportPage,
    }) => {
      await clusterDetailsPage.supportTab().click();
      await clusterSupportPage.isNotificationContactVisible();

      await clusterSupportPage.getAddNotificationContactButton().click();
      await clusterSupportPage.isNotificationContactModalVisible();
      await clusterSupportPage.getCancelButton().click();

      await expect(clusterSupportPage.getOpenSupportCaseButton()).toBeVisible();
      await clusterSupportPage.checkSupportCaseTableHeaders();
    });

    test(`Add notification contact for the cluster ${clusterName}`, async ({
      clusterSupportPage,
    }) => {
      await clusterSupportPage.getAddNotificationContactButton().click();
      await clusterSupportPage.getUsernameInput().fill(notificationContact.username);
      await clusterSupportPage.getAddContactButton().click();

      await clusterSupportPage.isSuccessNotificationVisible();
      await clusterSupportPage.checkNotificationContactTableHeaders();
      await clusterSupportPage.checkNotificationContacts(
        notificationContact.username,
        notificationContact.firstName,
        notificationContact.lastName,
      );
      await clusterSupportPage.deleteNotificationContactByUsername(notificationContact.username);
      await clusterSupportPage.isDeleteNotificationVisible();
    });

    test(`Add notification contact validation for the cluster ${clusterName}`, async ({
      clusterSupportPage,
    }) => {
      await clusterSupportPage.getAddNotificationContactButton().click();
      await clusterSupportPage.getUsernameInput().fill(validations.invalidUsername);
      await clusterSupportPage.isTextContainsInPage(validations.invalidUsernameError);

      await clusterSupportPage.getUsernameInput().clear();
      await clusterSupportPage.getUsernameInput().fill(validations.nonExistentUsername);
      await clusterSupportPage.getAddContactButton().click();
      await clusterSupportPage.isTextContainsInPage(validations.nonExistentUsernameError);

      await clusterSupportPage.getCancelButton().click();
    });
  },
);
