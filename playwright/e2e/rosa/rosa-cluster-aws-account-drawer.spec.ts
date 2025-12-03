import { test, expect } from '../../fixtures/pages';

const clusterControlPlanes = ['Hosted', 'Classic'];
const instructionsLink =
  'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-manual.html';

test.describe.serial(
  'Rosa cluster AWS account drawer check (OCP-48396)',
  { tag: ['@smoke', '@rosa-hosted', '@rosa', '@rosa-classic'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      // Navigate to create/rosa/wizard
      await navigateTo('create/rosa/wizard');
    });
    clusterControlPlanes.forEach((controlPlane) => {
      test(`Step - Open ROSA wizard and Select control plane type - ${controlPlane}`, async ({
        navigateTo,
        createRosaWizardPage,
      }) => {
        if (controlPlane === 'Classic') {
          await navigateTo('create/rosa/wizard');
        }
        await createRosaWizardPage.isControlPlaneTypeScreen();
        if (controlPlane === 'Hosted') {
          await createRosaWizardPage.selectHostedControlPlaneTypeOption().click();
        } else {
          await createRosaWizardPage.selectStandaloneControlPlaneTypeOption().click();
        }
        await createRosaWizardPage.rosaNextButton().click();
      });

      test(`Step - ROSA Accounts and roles - Check drawer - ${controlPlane}`, async ({
        page,
        createRosaWizardPage,
      }) => {
        await createRosaWizardPage.isAccountsAndRolesScreen();
        await createRosaWizardPage.isNotAssociateAccountsDrawer();
        await createRosaWizardPage.howToAssociateNewAWSAccountButton().click();
        await createRosaWizardPage.isAssociateAccountsDrawer();

        // Check that all step buttons exist
        await expect(createRosaWizardPage.rosaAssociateDrawerFirstStepButton()).toBeVisible();
        await expect(createRosaWizardPage.rosaAssociateDrawerSecondStepButton()).toBeVisible();
        await expect(createRosaWizardPage.rosaAssociateDrawerThirdStepButton()).toBeVisible();

        // Check that first step is expanded
        await expect(createRosaWizardPage.rosaAssociateDrawerFirstStepButton()).toHaveAttribute(
          'aria-expanded',
          'true',
        );

        // Test close button functionality
        await createRosaWizardPage.howToAssociateNewAWSAccountDrawerCloseButton().click();
        await createRosaWizardPage.isNotAssociateAccountsDrawer();
        await createRosaWizardPage.howToAssociateNewAWSAccountButton().click();
        await createRosaWizardPage.isAssociateAccountsDrawer();
        await createRosaWizardPage.howToAssociateNewAWSAccountDrawerXButton().click();
        await createRosaWizardPage.isNotAssociateAccountsDrawer();

        // Reopen drawer for detailed testing
        await createRosaWizardPage.howToAssociateNewAWSAccountButton().click();
        await createRosaWizardPage.isAssociateAccountsDrawer();

        // Test OCM role fields and tabs (Step 1)
        await expect(createRosaWizardPage.rosaListOcmField()).toHaveValue('rosa list ocm-role');

        // Check initial tab states
        await expect(createRosaWizardPage.rosaCreateOcmTab()).toHaveAttribute(
          'aria-pressed',
          'true',
        );
        await expect(createRosaWizardPage.rosaLinkOcmTab()).toHaveAttribute(
          'aria-pressed',
          'false',
        );

        // Switch to Link tab
        await createRosaWizardPage.rosaLinkOcmTab().click();

        // Check tab states after switch
        await expect(createRosaWizardPage.rosaCreateOcmTab()).toHaveAttribute(
          'aria-pressed',
          'false',
        );
        await expect(createRosaWizardPage.rosaLinkOcmTab()).toHaveAttribute('aria-pressed', 'true');

        // Switch back to Create tab
        await createRosaWizardPage.rosaCreateOcmTab().click();

        // Check field values in Create tab
        await expect(createRosaWizardPage.rosaCreateOcmField()).toHaveValue('rosa create ocm-role');
        await expect(createRosaWizardPage.rosaCreateOcmAdminField()).toHaveValue(
          'rosa create ocm-role --admin',
        );

        // Test help me decide functionality
        await createRosaWizardPage.rosaHelpMeDecideButton().click();
        await expect(
          page.getByText('Operator roles and OpenID Connect (OIDC) provider'),
        ).toBeVisible();
        await createRosaWizardPage.rosaHelpMeDecideButton().click();

        // Test Link tab field value
        await createRosaWizardPage.rosaLinkOcmTab().click();
        await expect(createRosaWizardPage.rosaLinkOcmField()).toHaveValue(
          'rosa link ocm-role <arn>',
        );

        // Navigate to Step 2
        await createRosaWizardPage.rosaAssociateDrawerFirstStepButton().click();
        await createRosaWizardPage.rosaAssociateDrawerSecondStepButton().click();

        // Test User role fields and tabs (Step 2)
        await expect(createRosaWizardPage.rosaListUserField()).toHaveValue('rosa list user-role');

        // Check initial tab states for user roles
        await expect(createRosaWizardPage.rosaCreateUserTab()).toHaveAttribute(
          'aria-pressed',
          'true',
        );
        await expect(createRosaWizardPage.rosaLinkUserTab()).toHaveAttribute(
          'aria-pressed',
          'false',
        );

        // Switch to Link tab
        await createRosaWizardPage.rosaLinkUserTab().click();

        // Check tab states after switch
        await expect(createRosaWizardPage.rosaCreateUserTab()).toHaveAttribute(
          'aria-pressed',
          'false',
        );
        await expect(createRosaWizardPage.rosaLinkUserTab()).toHaveAttribute(
          'aria-pressed',
          'true',
        );

        // Switch back to Create tab
        await createRosaWizardPage.rosaCreateUserTab().click();

        // Check field value in Create tab
        await expect(createRosaWizardPage.rosaCreateUserField()).toHaveValue(
          'rosa create user-role',
        );

        // Test Link tab field value
        await createRosaWizardPage.rosaLinkUserTab().click();
        await expect(createRosaWizardPage.rosaLinkUserField()).toHaveValue(
          'rosa link user-role <arn>',
        );

        // Navigate to Step 3
        await createRosaWizardPage.rosaAssociateDrawerSecondStepButton().click();
        await createRosaWizardPage.rosaAssociateDrawerThirdStepButton().click();

        // Test Account roles field (Step 3)
        const mode = controlPlane === 'Hosted' ? '--hosted-cp ' : '';
        await expect(createRosaWizardPage.rosaCreateAccountRolesField()).toHaveValue(
          `rosa create account-roles ${mode}--mode auto`,
        );

        // Check external link
        await expect(page.locator('a').filter({ hasText: 'these instructions' })).toHaveAttribute(
          'href',
          instructionsLink,
        );

        // Close drawer
        await createRosaWizardPage.rosaAssociateDrawerThirdStepButton().click();
        await createRosaWizardPage.howToAssociateNewAWSAccountDrawerCloseButton().click();
      });
    });
  },
);
