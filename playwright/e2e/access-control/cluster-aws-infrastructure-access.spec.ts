import { expect, test } from '../../fixtures/pages';

const testData = require('../../fixtures/access-control/cluster-aws-infrastructure-access.spec.json');
const clusterFixture = require('../../fixtures/osd-aws/osd-non-ccs-aws-cluster-creation-advanced.spec.json');

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const clusterName =
  process.env.CLUSTER_NAME ||
  clusterFixture['osd-nonccs-aws-public-advanced']['day1-profile'].ClusterName;
const runId = Math.random().toString(36).slice(2, 7);

let awsAccountId: string;
let iamUserName: string;
let validIamUserArn: string;
let invalidIamUserArn: string;

test.describe.serial(
  'OSD non-CCS AWS cluster - AWS infrastructure access (OCP-27994, OCP-27996)',
  {
    tag: [
      '@day2',
      '@access-control',
      '@osd',
      '@aws',
      '@advanced',
      '@non-ccs',
      '@aws-infrastructure-access',
    ],
  },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      awsAccountId = requireEnv('QE_AWS_ID');
      validIamUserArn = process.env.QE_AWS_INFRA_ACCESS_IAM_ARN?.trim();
      if (!validIamUserArn) {
        iamUserName = requireEnv('QE_AWS_IAM_USER');
        validIamUserArn = `arn:aws:iam::${awsAccountId}:user/${iamUserName}`;
      }
      invalidIamUserArn = `arn:aws:iam::${awsAccountId}:user/${testData.GrantRole.InvalidIamUserNamePrefix}-${runId}`;

      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test.afterAll(async ({ awsInfrastructureAccessPage }) => {
      for (const roleName of [
        testData.GrantRole.ReadOnlyRoleName,
        testData.GrantRole.NetworkManagementRoleName,
      ]) {
        await awsInfrastructureAccessPage
          .deleteGrantIfExists(validIamUserArn, roleName)
          .catch(() => {
            console.error(
              `Failed to delete ${roleName} grant for ${validIamUserArn} or already deleted`,
            );
          });
      }
      await awsInfrastructureAccessPage.deleteGrantIfExists(invalidIamUserArn).catch(() => {
        console.error(`Failed to delete grant for ${invalidIamUserArn} or already deleted`);
      });
    });

    test(`Navigate to ${clusterName} AWS infrastructure access tab`, async ({
      clusterListPage,
      clusterDetailsPage,
      awsInfrastructureAccessPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await awsInfrastructureAccessPage.goToAccessControlTab();
      await awsInfrastructureAccessPage.goToAwsInfrastructureAccessTab();
      await awsInfrastructureAccessPage.isAwsInfrastructureAccessPage();
    });

    test('Verify AWS infrastructure access tab layout', async ({ awsInfrastructureAccessPage }) => {
      await expect(awsInfrastructureAccessPage.sectionHeading()).toBeVisible();
      await expect(awsInfrastructureAccessPage.awsLoginLink()).toBeVisible();
      await expect(awsInfrastructureAccessPage.grantRoleButton()).toBeEnabled();
    });

    test('Verify Access control sub-tabs for OSD non-CCS AWS cluster', async ({
      awsInfrastructureAccessPage,
    }) => {
      await expect(awsInfrastructureAccessPage.identityProvidersTab()).toBeVisible();
      await expect(awsInfrastructureAccessPage.clusterRolesAndAccessTab()).toBeVisible();
      await expect(awsInfrastructureAccessPage.ocmRolesAndAccessTab()).toBeVisible();
      await expect(awsInfrastructureAccessPage.awsInfrastructureAccessTab()).toBeVisible();
    });

    test('Verify Grant role dialog default state and field visibility', async ({
      awsInfrastructureAccessPage,
    }) => {
      await awsInfrastructureAccessPage.openGrantRoleModal();

      await expect(awsInfrastructureAccessPage.grantModalHeading()).toBeVisible();
      await expect(awsInfrastructureAccessPage.iamArnInput()).toBeVisible();
      await expect(awsInfrastructureAccessPage.iamArnInput()).toBeEmpty();
      await expect(awsInfrastructureAccessPage.grantRoleSubmitButton()).toBeDisabled();

      await awsInfrastructureAccessPage.iamArnInput().fill('a');
      await awsInfrastructureAccessPage.iamArnInput().clear();
      await awsInfrastructureAccessPage.iamArnInput().blur();
      await awsInfrastructureAccessPage.isTextContainsInPage(testData.Validation.EmptyArnError);

      await awsInfrastructureAccessPage.cancelButton().click();
      await expect(awsInfrastructureAccessPage.grantModalHeading()).toBeHidden();
    });

    test('Validate AWS IAM ARN - invalid format keeps submit disabled', async ({
      awsInfrastructureAccessPage,
    }) => {
      await awsInfrastructureAccessPage.openGrantRoleModal();

      await awsInfrastructureAccessPage.iamArnInput().fill(testData.Validation.InvalidArnInput);
      await awsInfrastructureAccessPage.iamArnInput().blur();
      await expect(
        awsInfrastructureAccessPage.getByText(testData.Validation.InvalidArnError),
      ).toBeVisible();
      await expect(awsInfrastructureAccessPage.grantRoleSubmitButton()).toBeDisabled();

      await awsInfrastructureAccessPage.cancelButton().click();
      await expect(awsInfrastructureAccessPage.grantModal()).toBeHidden();
    });

    test('Validate AWS IAM ARN - whitespace keeps submit disabled', async ({
      awsInfrastructureAccessPage,
    }) => {
      await awsInfrastructureAccessPage.openGrantRoleModal();

      await awsInfrastructureAccessPage.iamArnInput().fill(testData.Validation.WhitespaceArnInput);
      await awsInfrastructureAccessPage.iamArnInput().blur();
      await expect(
        awsInfrastructureAccessPage.getByText(testData.Validation.WhitespaceArnError),
      ).toBeVisible();
      await expect(awsInfrastructureAccessPage.grantRoleSubmitButton()).toBeDisabled();

      await awsInfrastructureAccessPage.cancelButton().click();
      await expect(awsInfrastructureAccessPage.grantModal()).toBeHidden();
    });

    test('Validate AWS IAM ARN - valid format enables submit button', async ({
      awsInfrastructureAccessPage,
    }) => {
      await awsInfrastructureAccessPage.openGrantRoleModal();

      await awsInfrastructureAccessPage.iamArnInput().fill(validIamUserArn);
      await expect(awsInfrastructureAccessPage.grantRoleSubmitButton()).toBeEnabled();

      await awsInfrastructureAccessPage.cancelButton().click();
      await expect(awsInfrastructureAccessPage.grantModal()).toBeHidden();
    });

    test('Grant role with non-existent IAM user shows failed status and failure notification', async ({
      awsInfrastructureAccessPage,
    }) => {
      for (const roleName of [
        testData.GrantRole.ReadOnlyRoleName,
        testData.GrantRole.NetworkManagementRoleName,
      ]) {
        await awsInfrastructureAccessPage.deleteGrantIfExists(validIamUserArn, roleName);
      }

      await awsInfrastructureAccessPage.grantInfrastructureAccessRole(
        invalidIamUserArn,
        testData.GrantRole.ReadOnlyRoleName,
      );

      await awsInfrastructureAccessPage.waitForGrantFailure(
        invalidIamUserArn,
        testData.GrantRole.ReadOnlyRoleName,
      );
      const expectedFailureTitle = testData.Notifications.GrantFailureTitle.replace(
        '{userArn}',
        invalidIamUserArn,
      );
      await awsInfrastructureAccessPage.isTextContainsInPage(expectedFailureTitle);
      await expect(
        awsInfrastructureAccessPage.grantRow(
          invalidIamUserArn,
          testData.GrantRole.ReadOnlyRoleName,
        ),
      ).toContainText(testData.GrantRole.ReadOnlyRoleName);
      await expect(
        awsInfrastructureAccessPage.copyUrlButton(
          invalidIamUserArn,
          testData.GrantRole.ReadOnlyRoleName,
        ),
      ).toBeDisabled();

      await awsInfrastructureAccessPage.deleteGrant(
        invalidIamUserArn,
        testData.GrantRole.ReadOnlyRoleName,
      );
    });

    test('Grant Read Only role with valid IAM user shows ready status and success notification', async ({
      awsInfrastructureAccessPage,
    }) => {
      await awsInfrastructureAccessPage.grantInfrastructureAccessRole(
        validIamUserArn,
        testData.GrantRole.ReadOnlyRoleName,
      );

      await awsInfrastructureAccessPage.waitForGrantSuccess(
        validIamUserArn,
        testData.GrantRole.ReadOnlyRoleName,
      );
      const expectedReadOnlySuccessTitle = testData.Notifications.GrantSuccessTitle
        .replace('{roleName}', testData.GrantRole.ReadOnlyRoleName)
        .replace('{userArn}', validIamUserArn);
      await awsInfrastructureAccessPage.isTextContainsInPage(expectedReadOnlySuccessTitle);
      await expect(
        awsInfrastructureAccessPage.grantRow(validIamUserArn, testData.GrantRole.ReadOnlyRoleName),
      ).toContainText(testData.GrantRole.ReadOnlyRoleName);
      await expect(
        awsInfrastructureAccessPage.copyUrlButton(
          validIamUserArn,
          testData.GrantRole.ReadOnlyRoleName,
        ),
      ).toBeEnabled();
    });

    test('Grant Network management role to the same IAM user shows ready status and success notification', async ({
      awsInfrastructureAccessPage,
    }) => {
      await awsInfrastructureAccessPage.grantInfrastructureAccessRole(
        validIamUserArn,
        testData.GrantRole.NetworkManagementRoleName,
      );

      await awsInfrastructureAccessPage.waitForGrantSuccess(
        validIamUserArn,
        testData.GrantRole.NetworkManagementRoleName,
      );
      const expectedNetworkMgmtSuccessTitle = testData.Notifications.GrantSuccessTitle
        .replace('{roleName}', testData.GrantRole.NetworkManagementRoleName)
        .replace('{userArn}', validIamUserArn);
      await awsInfrastructureAccessPage.isTextContainsInPage(expectedNetworkMgmtSuccessTitle);
      await expect(
        awsInfrastructureAccessPage.grantRow(validIamUserArn, testData.GrantRole.ReadOnlyRoleName),
      ).toContainText('Ready');
      await expect(
        awsInfrastructureAccessPage.grantRow(
          validIamUserArn,
          testData.GrantRole.NetworkManagementRoleName,
        ),
      ).toContainText('Ready');
      await expect(
        awsInfrastructureAccessPage.copyUrlButton(
          validIamUserArn,
          testData.GrantRole.NetworkManagementRoleName,
        ),
      ).toBeEnabled();

      await awsInfrastructureAccessPage.deleteGrant(
        validIamUserArn,
        testData.GrantRole.ReadOnlyRoleName,
      );
      await awsInfrastructureAccessPage.deleteGrant(
        validIamUserArn,
        testData.GrantRole.NetworkManagementRoleName,
      );
    });
  },
);
