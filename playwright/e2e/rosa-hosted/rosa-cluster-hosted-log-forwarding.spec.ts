import { test, expect } from '../../fixtures/pages';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const day2Properties = clusterProfiles['rosa-hosted-public-advanced']['day2-profile'];
const logForwardingProperties = day2Properties.ControlPlaneLogForwarding;
const validationFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-wizard-validation.spec.json');

test.describe.serial(
  'ROSA HCP Day2 - Control plane log forwarding management',
  { tag: ['@day2', '@rosa-hosted', '@rosa', '@hcp', '@log-forwarding', '@advanced'] },
  () => {
    const clusterName = process.env.CLUSTER_NAME || clusterProperties.ClusterName;
    const s3BucketName = process.env.QE_LOG_FORWARDING_S3_BUCKET_NAME || '';
    const s3BucketPrefix = process.env.QE_LOG_FORWARDING_S3_BUCKET_PREFIX || '';
    const cwRoleArn = process.env.QE_LOG_FORWARDING_CLOUDWATCH_ROLE_ARN || '';
    const cwLogGroupName = clusterProperties.CloudWatchLogGroupName;
    const updatedS3BucketPrefix = logForwardingProperties.UpdatedS3BucketPrefix;
    const updatedCwLogGroupName = logForwardingProperties.UpdatedCwLogGroupName;
    const editedCwLogGroupName = logForwardingProperties.EditedCwLogGroupName;
    const s3SelectedGroup = logForwardingProperties.SelectedGroup;
    const s3Validation = validationFixture.LogForwarding.S3;
    const cwValidation = validationFixture.LogForwarding.CloudWatch;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!s3BucketName || !s3BucketPrefix || !cwRoleArn) {
        throw new Error(
          'Missing required env vars: QE_LOG_FORWARDING_S3_BUCKET_NAME, QE_LOG_FORWARDING_S3_BUCKET_PREFIX, QE_LOG_FORWARDING_CLOUDWATCH_ROLE_ARN',
        );
      }
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test('Navigate to cluster and open the Settings tab', async ({
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.navigateToSettingsTab();
    });

    test('Verify Control plane log forwarding section is visible', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.scrollToLogForwardingSection();
      await clusterDetailsPage.isLogForwardingSectionVisible();
    });

    // ── Verify pre-existing configurations ────────────────────────────────

    test('Verify pre-existing Amazon S3 configuration properties', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.logForwardingCardTitle('Amazon S3')).toBeVisible({
        timeout: 30000,
      });
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('Amazon S3', 'Configuration', 'Enabled'),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('Amazon S3', 'Bucket name', s3BucketName),
      ).toBeVisible();
      await expect(clusterDetailsPage.logForwardingCardKebab('Amazon S3')).toBeVisible();
    });

    test('Verify pre-existing CloudWatch configuration properties', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.logForwardingCardTitle('CloudWatch')).toBeVisible({
        timeout: 30000,
      });
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Configuration', 'Enabled'),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Log group name', cwLogGroupName),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Role ARN', cwRoleArn),
      ).toBeVisible();
      await expect(clusterDetailsPage.logForwardingCardKebab('CloudWatch')).toBeVisible();
    });

    test('Verify Add configuration button is disabled when both exist', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.addConfigurationButton()).toBeDisabled();
      const tooltip = await clusterDetailsPage.hoverAddConfigurationButton();
      await expect(tooltip).toBeVisible();
    });

    // ── Delete pre-existing configurations to reach empty state ───────────

    test('Delete pre-existing CloudWatch configuration', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openCardKebabAction('CloudWatch', 'Delete configuration');
      await expect(
        clusterDetailsPage.logForwardingModalHeading('Delete', 'CloudWatch'),
      ).toBeVisible();
      await expect(clusterDetailsPage.logForwardingDeleteDescription()).toContainText(
        'will stop the stream of cluster logs to CloudWatch',
      );
      await clusterDetailsPage.confirmDeleteLogForwarding();
      await expect(clusterDetailsPage.logForwardingCardTitle('CloudWatch')).toBeHidden({
        timeout: 30000,
      });
    });

    test('Delete pre-existing Amazon S3 configuration', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openCardKebabAction('Amazon S3', 'Delete configuration');
      await expect(
        clusterDetailsPage.logForwardingModalHeading('Delete', 'Amazon S3'),
      ).toBeVisible();
      await expect(clusterDetailsPage.logForwardingDeleteDescription()).toContainText(s3BucketName);
      await clusterDetailsPage.confirmDeleteLogForwarding();
      await expect(clusterDetailsPage.logForwardingCardTitle('Amazon S3')).toBeHidden({
        timeout: 30000,
      });
    });

    // ── Verify empty state ────────────────────────────────────────────────

    test('Verify empty state shows "No log forwarding configured"', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.logForwardingEmptyState()).toBeVisible({ timeout: 30000 });
      await expect(clusterDetailsPage.addConfigurationButton()).toBeEnabled();

      await clusterDetailsPage.navigateToOverviewTab();
      await expect(clusterDetailsPage.controlPlaneLogForwardingDescription()).toContainText(
        'Disabled',
      );
      await clusterDetailsPage.controlPlaneLogForwardingViewDetailsLink().click();
      await clusterDetailsPage.isLogForwardingSectionVisible();
    });

    // ── Amazon S3 dialog form validations ─────────────────────────────────

    test('Validate Amazon S3 dialog - bucket name field errors', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openAddConfigurationMenu('Amazon S3');
      await expect(clusterDetailsPage.logForwardingModalHeading('Add', 'Amazon S3')).toBeVisible();

      await clusterDetailsPage.logForwardingBucketNameInput().fill(s3Validation.BucketNameTooShort);
      await clusterDetailsPage.logForwardingBucketPrefixInput().click();
      await clusterDetailsPage.isTextContainsInPage(s3Validation.BucketNameTooShortError);

      await clusterDetailsPage.logForwardingBucketNameInput().clear();
      await clusterDetailsPage.logForwardingBucketNameInput().fill(s3Validation.BucketNameTooLong);
      await clusterDetailsPage.logForwardingBucketPrefixInput().click();
      await clusterDetailsPage.isTextContainsInPage(s3Validation.BucketNameTooLongError);

      await clusterDetailsPage.logForwardingBucketNameInput().clear();
      await clusterDetailsPage
        .logForwardingBucketNameInput()
        .fill(s3Validation.BucketNameStartsUppercase);
      await clusterDetailsPage.logForwardingBucketPrefixInput().click();
      await clusterDetailsPage.isTextContainsInPage(s3Validation.BucketNameStartsUppercaseError);

      await clusterDetailsPage.logForwardingBucketNameInput().clear();
      await clusterDetailsPage
        .logForwardingBucketNameInput()
        .fill(s3Validation.BucketNameConsecutiveDots);
      await clusterDetailsPage.logForwardingBucketPrefixInput().click();
      await clusterDetailsPage.isTextContainsInPage(s3Validation.BucketNameConsecutiveDotsError);

      await clusterDetailsPage.logForwardingBucketNameInput().clear();
      await clusterDetailsPage
        .logForwardingBucketNameInput()
        .fill(s3Validation.BucketNameIPAddress);
      await clusterDetailsPage.logForwardingBucketPrefixInput().click();
      await clusterDetailsPage.isTextContainsInPage(s3Validation.BucketNameIPAddressError);

      await clusterDetailsPage.logForwardingModalCancelButton().click();
    });

    test('Validate Amazon S3 dialog - bucket prefix field errors', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openAddConfigurationMenu('Amazon S3');
      await expect(clusterDetailsPage.logForwardingModalHeading('Add', 'Amazon S3')).toBeVisible();

      await clusterDetailsPage.logForwardingBucketNameInput().fill(s3BucketName);
      await clusterDetailsPage
        .logForwardingBucketPrefixInput()
        .fill(s3Validation.BucketPrefixConsecutiveDots);
      await clusterDetailsPage.logForwardingBucketNameInput().click();
      await clusterDetailsPage.isTextContainsInPage(s3Validation.BucketPrefixConsecutiveDotsError);

      await clusterDetailsPage.logForwardingBucketPrefixInput().clear();
      await clusterDetailsPage.logForwardingBucketNameInput().click();
      await clusterDetailsPage.isTextContainsInPage(
        s3Validation.BucketPrefixConsecutiveDotsError,
        false,
      );

      await clusterDetailsPage.logForwardingModalCancelButton().click();
    });

    // ── CloudWatch dialog form validations ──────────────────────────────

    test('Validate CloudWatch dialog - required field errors', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openAddConfigurationMenu('CloudWatch');
      await expect(clusterDetailsPage.logForwardingModalHeading('Add', 'CloudWatch')).toBeVisible();

      await clusterDetailsPage.logForwardingLogGroupNameInput().clear();
      await clusterDetailsPage.logForwardingRoleArnInput().click();
      await clusterDetailsPage.isTextContainsInPage(cwValidation.LogGroupNameRequired);

      await clusterDetailsPage.logForwardingRoleArnInput().clear();
      await clusterDetailsPage.logForwardingLogGroupNameInput().click();
      await clusterDetailsPage.isTextContainsInPage(cwValidation.RoleArnRequired);

      await clusterDetailsPage.logForwardingModalCancelButton().click();
    });

    test('Validate CloudWatch dialog - log group name field errors', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openAddConfigurationMenu('CloudWatch');
      await expect(clusterDetailsPage.logForwardingModalHeading('Add', 'CloudWatch')).toBeVisible();

      await clusterDetailsPage
        .logForwardingLogGroupNameInput()
        .fill(cwValidation.LogGroupNameInvalidChars);
      await clusterDetailsPage.logForwardingRoleArnInput().click();
      await clusterDetailsPage.isTextContainsInPage(cwValidation.LogGroupNameInvalidCharsError);

      await clusterDetailsPage.logForwardingLogGroupNameInput().clear();
      await clusterDetailsPage
        .logForwardingLogGroupNameInput()
        .fill(cwValidation.LogGroupNameWithColon);
      await clusterDetailsPage.logForwardingRoleArnInput().click();
      await clusterDetailsPage.isTextContainsInPage(cwValidation.LogGroupNameWithColonError);

      await clusterDetailsPage.logForwardingLogGroupNameInput().clear();
      await clusterDetailsPage
        .logForwardingLogGroupNameInput()
        .fill(cwValidation.LogGroupNameTooLong);
      await clusterDetailsPage.logForwardingRoleArnInput().click();
      await clusterDetailsPage.isTextContainsInPage(cwValidation.LogGroupNameTooLongError);

      await clusterDetailsPage.logForwardingModalCancelButton().click();
    });

    test('Validate CloudWatch dialog - role ARN field errors', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openAddConfigurationMenu('CloudWatch');
      await expect(clusterDetailsPage.logForwardingModalHeading('Add', 'CloudWatch')).toBeVisible();

      await clusterDetailsPage.logForwardingRoleArnInput().fill(cwValidation.RoleArnInvalidFormat);
      await clusterDetailsPage.logForwardingLogGroupNameInput().click();
      await clusterDetailsPage.isTextContainsInPage(cwValidation.RoleArnInvalidFormatError);

      await clusterDetailsPage.logForwardingRoleArnInput().clear();
      await clusterDetailsPage.logForwardingRoleArnInput().fill(cwValidation.RoleArnWhitespace);
      await clusterDetailsPage.logForwardingLogGroupNameInput().click();
      await clusterDetailsPage.isTextContainsInPage(cwValidation.RoleArnWhitespaceError);

      await clusterDetailsPage.logForwardingModalCancelButton().click();
    });

    // ── Add new configurations ────────────────────────────────────────────

    test('Add Amazon S3 log forwarding configuration with first group only', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openAddConfigurationMenu('Amazon S3');
      await expect(clusterDetailsPage.logForwardingModalHeading('Add', 'Amazon S3')).toBeVisible();
      await expect(clusterDetailsPage.logForwardingSubmitButton()).toBeDisabled();
      await clusterDetailsPage.fillS3Configuration(s3BucketName, s3BucketPrefix);
      await clusterDetailsPage.selectLogForwardingGroup(s3SelectedGroup);
      await clusterDetailsPage.submitLogForwardingModal();
    });

    test('Verify Amazon S3 configuration card is displayed with correct details', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.logForwardingCardTitle('Amazon S3')).toBeVisible({
        timeout: 30000,
      });
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('Amazon S3', 'Configuration', 'Enabled'),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('Amazon S3', 'Bucket name', s3BucketName),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('Amazon S3', 'Bucket prefix', s3BucketPrefix),
      ).toBeVisible();
      await expect(clusterDetailsPage.logForwardingCardKebab('Amazon S3')).toBeVisible();
      await expect(clusterDetailsPage.logForwardingEmptyState()).toBeHidden();

      const logForwardingDescription =
        clusterDetailsPage.controlPlaneLogForwardingDescription();
      await clusterDetailsPage.navigateToOverviewTab();
      await expect(logForwardingDescription).toContainText('Amazon S3: Enabled');
      await expect(logForwardingDescription).toContainText('CloudWatch: Disabled');
      await clusterDetailsPage.controlPlaneLogForwardingViewDetailsLink().click();
      await clusterDetailsPage.isLogForwardingSectionVisible();
    });

    test('Verify Amazon S3 selected groups and applications are displayed', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.logForwardingSelectedGroupsHeading()).toBeVisible();
      await expect(clusterDetailsPage.logForwardingGroupCategory(s3SelectedGroup)).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingGroupLabel(s3SelectedGroup, 'kube-apiserver'),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingGroupLabel(s3SelectedGroup, 'audit-webhook'),
      ).toBeVisible();
    });

    test('Verify Add configuration dropdown still shows CloudWatch option', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.addConfigurationButton().click();
      await expect(clusterDetailsPage.addConfigurationMenuItem('CloudWatch')).toBeVisible();
      await clusterDetailsPage.pressKey('Escape');
    });

    test('Add CloudWatch log forwarding configuration', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openAddConfigurationMenu('CloudWatch');
      await expect(clusterDetailsPage.logForwardingModalHeading('Add', 'CloudWatch')).toBeVisible();
      await expect(clusterDetailsPage.logForwardingSubmitButton()).toBeDisabled();
      await clusterDetailsPage.logForwardingPrerequisiteCheckbox().check();
      await clusterDetailsPage.fillCloudWatchConfiguration(updatedCwLogGroupName, cwRoleArn);
      await clusterDetailsPage.selectAllLogForwardingGroups();
      await clusterDetailsPage.submitLogForwardingModal();
    });

    test('Verify CloudWatch configuration card is displayed with correct details', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.logForwardingCardTitle('CloudWatch')).toBeVisible({
        timeout: 30000,
      });
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Configuration', 'Enabled'),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Log group name', updatedCwLogGroupName),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Role ARN', cwRoleArn),
      ).toBeVisible();
    });

    test('Verify Add configuration button is disabled after both are added', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.addConfigurationButton()).toBeDisabled();
      const tooltip = await clusterDetailsPage.hoverAddConfigurationButton();
      await expect(tooltip).toBeVisible();

      const logForwardingDescription =
        clusterDetailsPage.controlPlaneLogForwardingDescription();
      await clusterDetailsPage.navigateToOverviewTab();
      await expect(logForwardingDescription).toContainText('Amazon S3: Enabled');
      await expect(logForwardingDescription).toContainText('CloudWatch: Enabled');
      await clusterDetailsPage.controlPlaneLogForwardingViewDetailsLink().click();
      await clusterDetailsPage.isLogForwardingSectionVisible();
    });

    // ── Edit existing configuration ───────────────────────────────────────

    test('Edit Amazon S3 configuration - update bucket prefix', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openCardKebabAction('Amazon S3', 'Edit configuration');
      await expect(clusterDetailsPage.logForwardingModalHeading('Edit', 'Amazon S3')).toBeVisible();
      await expect(clusterDetailsPage.logForwardingBucketNameInput()).toHaveValue(s3BucketName);
      await expect(clusterDetailsPage.logForwardingSubmitButton()).toBeDisabled();
      await clusterDetailsPage.logForwardingBucketPrefixInput().clear();
      await clusterDetailsPage.logForwardingBucketPrefixInput().fill(updatedS3BucketPrefix);
      await clusterDetailsPage.submitLogForwardingModal();
    });

    test('Verify edited Amazon S3 configuration shows updated bucket prefix', async ({
      clusterDetailsPage,
    }) => {
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('Amazon S3', 'Bucket prefix', updatedS3BucketPrefix),
      ).toBeVisible({ timeout: 30000 });
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('Amazon S3', 'Bucket name', s3BucketName),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('Amazon S3', 'Configuration', 'Enabled'),
      ).toBeVisible();
    });

    test('Edit CloudWatch configuration - update log group name', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openCardKebabAction('CloudWatch', 'Edit configuration');
      await expect(
        clusterDetailsPage.logForwardingModalHeading('Edit', 'CloudWatch'),
      ).toBeVisible();
      await expect(clusterDetailsPage.logForwardingLogGroupNameInput()).toHaveValue(
        updatedCwLogGroupName,
      );
      await expect(clusterDetailsPage.logForwardingRoleArnInput()).toHaveValue(cwRoleArn);
      await expect(clusterDetailsPage.logForwardingSubmitButton()).toBeDisabled();
      await clusterDetailsPage.logForwardingLogGroupNameInput().clear();
      await clusterDetailsPage.logForwardingLogGroupNameInput().fill(editedCwLogGroupName);
      await clusterDetailsPage.submitLogForwardingModal();
    });

    test('Verify edited CloudWatch configuration shows updated log group name', async ({
      clusterDetailsPage,
    }) => {
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Log group name', editedCwLogGroupName),
      ).toBeVisible({ timeout: 30000 });
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Role ARN', cwRoleArn),
      ).toBeVisible();
      await expect(
        clusterDetailsPage.logForwardingPropertyValue('CloudWatch', 'Configuration', 'Enabled'),
      ).toBeVisible();
    });

    // ── Delete and re-add to leave cluster in a consistent state ──────────

    test('Delete CloudWatch configuration via kebab menu', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openCardKebabAction('CloudWatch', 'Delete configuration');
      await expect(
        clusterDetailsPage.logForwardingModalHeading('Delete', 'CloudWatch'),
      ).toBeVisible();
      await expect(clusterDetailsPage.logForwardingDeleteDescription()).toContainText(
        editedCwLogGroupName,
      );
      await clusterDetailsPage.confirmDeleteLogForwarding();
    });

    test('Verify CloudWatch card is removed and Add configuration is re-enabled', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.logForwardingCardTitle('CloudWatch')).toBeHidden({
        timeout: 30000,
      });
      await expect(clusterDetailsPage.logForwardingCardTitle('Amazon S3')).toBeVisible();
      await expect(clusterDetailsPage.addConfigurationButton()).toBeEnabled();

      const logForwardingDescription =
        clusterDetailsPage.controlPlaneLogForwardingDescription();
      await clusterDetailsPage.navigateToOverviewTab();
      await expect(logForwardingDescription).toContainText('Amazon S3: Enabled');
      await expect(logForwardingDescription).toContainText('CloudWatch: Disabled');
      await clusterDetailsPage.controlPlaneLogForwardingViewDetailsLink().click();
      await clusterDetailsPage.isLogForwardingSectionVisible();
    });

    test('Re-add CloudWatch configuration after deletion', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openAddConfigurationMenu('CloudWatch');
      await expect(clusterDetailsPage.logForwardingModalHeading('Add', 'CloudWatch')).toBeVisible();
      await clusterDetailsPage.logForwardingPrerequisiteCheckbox().check();
      await clusterDetailsPage.fillCloudWatchConfiguration(updatedCwLogGroupName, cwRoleArn);
      await clusterDetailsPage.selectAllLogForwardingGroups();
      await clusterDetailsPage.submitLogForwardingModal();
    });

    test('Verify both configurations are present after full CRUD cycle', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.logForwardingCardTitle('Amazon S3')).toBeVisible({
        timeout: 30000,
      });
      await expect(clusterDetailsPage.logForwardingCardTitle('CloudWatch')).toBeVisible();
      await expect(clusterDetailsPage.addConfigurationButton()).toBeDisabled();

      const logForwardingDescription =
        clusterDetailsPage.controlPlaneLogForwardingDescription();
      await clusterDetailsPage.navigateToOverviewTab();
      await expect(logForwardingDescription).toContainText('Amazon S3: Enabled');
      await expect(logForwardingDescription).toContainText('CloudWatch: Enabled');
      await clusterDetailsPage.controlPlaneLogForwardingViewDetailsLink().click();
      await clusterDetailsPage.isLogForwardingSectionVisible();
    });

    // ── Restore initial state (runs even if tests fail) ─────────────────

    test.afterAll(async ({ clusterDetailsPage }) => {
      // Delete existing configs if present
      if (await clusterDetailsPage.logForwardingCardTitle('CloudWatch').isVisible()) {
        await clusterDetailsPage.openCardKebabAction('CloudWatch', 'Delete configuration');
        await clusterDetailsPage.confirmDeleteLogForwarding();
        await expect(clusterDetailsPage.logForwardingCardTitle('CloudWatch')).toBeHidden({
          timeout: 30000,
        });
      }

      if (await clusterDetailsPage.logForwardingCardTitle('Amazon S3').isVisible()) {
        await clusterDetailsPage.openCardKebabAction('Amazon S3', 'Delete configuration');
        await clusterDetailsPage.confirmDeleteLogForwarding();
        await expect(clusterDetailsPage.logForwardingCardTitle('Amazon S3')).toBeHidden({
          timeout: 30000,
        });
      }

      // Add CloudWatch with initial values
      await clusterDetailsPage.openAddConfigurationMenu('CloudWatch');
      await clusterDetailsPage.logForwardingPrerequisiteCheckbox().check();
      await clusterDetailsPage.fillCloudWatchConfiguration(cwLogGroupName, cwRoleArn);
      await clusterDetailsPage.selectAllLogForwardingGroups();
      await clusterDetailsPage.submitLogForwardingModal();

      // Add Amazon S3 with initial values
      await clusterDetailsPage.openAddConfigurationMenu('Amazon S3');
      await clusterDetailsPage.fillS3Configuration(s3BucketName, s3BucketPrefix);
      await clusterDetailsPage.selectAllLogForwardingGroups();
      await clusterDetailsPage.submitLogForwardingModal();
    });
  },
);
