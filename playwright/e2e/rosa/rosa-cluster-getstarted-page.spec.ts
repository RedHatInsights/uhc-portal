import { test, expect } from '../../fixtures/pages';

// External links constants
const LINKS = {
  AWS_GOVCLOUD_ROSA:
    'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/getting_started_with_red_hat_openshift_service_on_aws_in_aws_govcloud/index',
  FEDRAMP_REQUEST_FORM: 'https://console.redhat.com/openshift/create/rosa/govcloud',
  AWS_CONSOLE_GET_STARTED: 'https://console.aws.amazon.com/rosa/home#/get-started',
  AWS_ROSA_GETTING_STARTED:
    'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started.html',
  ROSA_CLI_SETUP:
    'https://access.redhat.com/documentation/en-us/red_hat_openshift_service_on_aws/4/html/rosa_cli/rosa-get-started-cli',
  ROSA_CLIENT_MACOS: 'https://mirror.openshift.com/pub/cgw/rosa/latest/rosa-macosx.tar.gz',
  ROSA_CLIENT_WINDOWS: 'https://mirror.openshift.com/pub/cgw/rosa/latest/rosa-windows.zip',
  ROSA_CLIENT_LINUX: 'https://mirror.openshift.com/pub/cgw/rosa/latest/rosa-linux.tar.gz',
  AWS_CLI: 'https://aws.amazon.com/cli/',
  AWS_CLI_CONFIGURE: 'https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html',
  ROSA_LOGIN_SSO:
    'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/cli_tools/rosa-cli#rosa-login-sso_rosa-getting-started-cli',
  AWS_ROSA_STS_MANUAL:
    'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-manual.html',
  CREATE_NETWORK_COMMAND: 'https://access.redhat.com/articles/7096266',
  CREATE_VPC_HCP:
    'https://docs.aws.amazon.com/rosa/latest/userguide/getting-started-hcp.html#create-vpc-hcp',
  ROSA_HCP_CLI_DEPLOY:
    'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/install_clusters/rosa-hcp-sts-creating-a-cluster-quickly',
  ROSA_TERRAFORM:
    'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/install_clusters/creating-a-red-hat-openshift-service-on-aws-cluster-with-terraform',
  TERRAFORM_REGISTRY:
    'https://registry.terraform.io/providers/terraform-redhat/rhcs/latest/docs/guides/hosted-control-planes',
} as const;

test.describe.serial(
  'ROSA cluster Get Started page (OCP-56363)',
  { tag: ['@smoke', '@rosa', '@rosa-classic'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      // Navigate to create/rosa/getstarted
      await navigateTo('create/rosa/getstarted');
    });
    test('Launch ROSA Get Started page', async ({ rosaGetStartedPage }) => {
      await rosaGetStartedPage.isRosaGetStartedPage();
    });

    test('ROSA Get Started page - check for FedRAMP sections', async ({ rosaGetStartedPage }) => {
      await rosaGetStartedPage.isRosaFedRAMPInfoAlertShown();

      await rosaGetStartedPage.checkAnchorProperties(
        rosaGetStartedPage.rosaFedRampDoclink(),
        'Learn more about ROSA with hosted control planes in AWS GovCloud',
        LINKS.AWS_GOVCLOUD_ROSA,
        true,
      );

      await rosaGetStartedPage.checkAnchorProperties(
        rosaGetStartedPage.rosaFedRampRequestFormlink(),
        'FedRAMP access request form',
        LINKS.FEDRAMP_REQUEST_FORM,
        true,
      );
    });

    test('ROSA Get Started page - check for "Complete AWS prerequisites" section', async ({
      page,
      rosaGetStartedPage,
    }) => {
      await rosaGetStartedPage.isCompleteAWSPrerequisitesHeaderShown();

      const section = page
        .getByRole('heading', { name: 'Have you prepared your AWS account?', level: 3 })
        .locator('..');
      await section.scrollIntoViewIfNeeded();

      await expect(section).toBeVisible();
      await expect(section.getByText('Enable AWS')).toBeVisible();
      await expect(
        section.getByText(
          'Set up a VPC for ROSA hosted control plane architecture (HCP) clusters (optional for ROSA classic architecture clusters)',
        ),
      ).toBeVisible();
      await expect(section.getByText('Configure Elastic Load Balancer (ELB)')).toBeVisible();
      await expect(section.getByText('Verify your quotas on AWS console')).toBeVisible();

      const awsConsoleLink = section.getByRole('link', { name: 'Open AWS Console' });
      await expect(awsConsoleLink).toHaveAttribute('href', LINKS.AWS_CONSOLE_GET_STARTED);
      await expect(awsConsoleLink).toBeVisible();
    });

    test('ROSA Get Started page - check for "Complete ROSA prerequisites" section', async ({
      page,
      rosaGetStartedPage,
    }) => {
      await rosaGetStartedPage.isCompleteROSAPrerequisitesHeaderShown();

      await rosaGetStartedPage.checkAnchorProperties(
        page.getByRole('link', { name: 'More information on ROSA setup' }),
        'More information on ROSA setup',
        LINKS.AWS_ROSA_GETTING_STARTED,
        true,
      );
    });

    test('ROSA Get Started page - check for "Complete ROSA prerequisites - Step 1" section', async ({
      page,
      rosaGetStartedPage,
    }) => {
      await expect(rosaGetStartedPage.rosaPrerequisitesStep1Items()).toHaveCount(2);

      const step1Section = rosaGetStartedPage.rosaPrerequisitesStep1Section();
      const step1Header = step1Section.getByRole('heading', { level: 3 }).filter({
        hasText:
          'Download and install the ROSA and AWS command line tools (CLI) and add it to your',
      });
      await expect(step1Header).toBeVisible();

      const step11Content = rosaGetStartedPage.rosaPrerequisitesStep11Content();
      await expect(
        step11Content.getByText('Download the latest version of the ROSA CLI'),
      ).toBeVisible();

      await rosaGetStartedPage.checkAnchorProperties(
        step11Content.locator('..').getByRole('link', { name: 'Help with ROSA CLI setup' }),
        'Help with ROSA CLI setup',
        LINKS.ROSA_CLI_SETUP,
        true,
      );

      // Test ROSA client download options
      const rosaClientOptions = {
        MacOS: LINKS.ROSA_CLIENT_MACOS,
        Windows: LINKS.ROSA_CLIENT_WINDOWS,
        Linux: LINKS.ROSA_CLIENT_LINUX,
      };

      for (const [osName, downloadUrl] of Object.entries(rosaClientOptions)) {
        await rosaGetStartedPage.selectOption(rosaGetStartedPage.rosaClientDropdown(), osName);
        await expect(rosaGetStartedPage.rosaClientButton()).toHaveAttribute('href', downloadUrl, {
          timeout: 20000,
        });
      }

      const step12Content = rosaGetStartedPage.rosaPrerequisitesStep12Content();
      const step12Parent = step12Content.locator('..');

      await expect(
        step12Parent.getByText('Download, setup and configure the AWS CLI version 2'),
      ).toBeVisible();

      await rosaGetStartedPage.checkAnchorProperties(
        step12Parent.getByRole('link', { name: 'installing' }),
        'installing',
        LINKS.AWS_CLI,
        true,
      );

      await rosaGetStartedPage.checkAnchorProperties(
        step12Parent.getByRole('link', { name: 'configuring' }),
        'configuring',
        LINKS.AWS_CLI_CONFIGURE,
        true,
      );
    });

    test('ROSA Get Started page - check for "Complete ROSA prerequisites - Step 2" section', async ({
      page,
      rosaGetStartedPage,
    }) => {
      await expect(rosaGetStartedPage.rosaPrerequisitesStep2Items()).toHaveCount(2);

      const step2Section = rosaGetStartedPage.rosaPrerequisitesStep2Section();
      await step2Section.scrollIntoViewIfNeeded();
      await expect(
        step2Section.getByText(
          'Log in to the ROSA CLI with your Red Hat account and create AWS account roles and policies.',
        ),
      ).toBeVisible();

      const step21Content = rosaGetStartedPage.rosaPrerequisitesStep21Content();
      await expect(
        step21Content.getByText(
          'To authenticate, run this command and enter your Red Hat login credentials via SSO',
        ),
      ).toBeVisible();
      await expect(step21Content.locator('input')).toHaveValue('rosa login --use-auth-code');

      await rosaGetStartedPage.checkAnchorProperties(
        step21Content.getByRole('link', {
          name: 'logging into OpenShift Cluster Manager ROSA CLI with Red Hat single sign-on',
        }),
        'logging into OpenShift Cluster Manager ROSA CLI with Red Hat single sign-on',
        LINKS.ROSA_LOGIN_SSO,
        true,
      );

      const step22Content = rosaGetStartedPage.rosaPrerequisitesStep22Content();
      await expect(
        step22Content.getByText(
          "To create the necessary account-wide roles and policies quickly, use the default auto method that's provided in the ROSA CLI",
        ),
      ).toBeVisible();
      await expect(step22Content.locator('input')).toHaveValue(
        'rosa create account-roles --mode auto',
      );

      await rosaGetStartedPage.checkAnchorProperties(
        step22Content.getByRole('link', { name: 'these instructions' }),
        'these instructions',
        LINKS.AWS_ROSA_STS_MANUAL,
        true,
      );
    });

    test('ROSA Get Started page - check for "Complete ROSA prerequisites - Step 3" section', async ({
      page,
      rosaGetStartedPage,
    }) => {
      await expect(rosaGetStartedPage.rosaPrerequisitesStep3Items()).toHaveCount(1);

      const hcpLabel = rosaGetStartedPage.rosaHpcCreateVpcLabel();
      await expect(hcpLabel.getByText('Only for ROSA HCP clusters')).toBeVisible();

      const step31Content = rosaGetStartedPage.rosaPrerequisitesStep31Content();
      await step31Content.scrollIntoViewIfNeeded();
      await expect(
        step31Content.getByText(
          'To create a Virtual Private Network (VPC) and all the neccesary components, run this command',
        ),
      ).toBeVisible();
      await expect(step31Content.locator('input')).toHaveValue('rosa create network');

      await rosaGetStartedPage.checkAnchorProperties(
        page.getByRole('link', { name: 'create network command' }),
        'create network command',
        LINKS.CREATE_NETWORK_COMMAND,
        true,
      );

      await rosaGetStartedPage.checkAnchorProperties(
        page.getByRole('link', { name: 'create a VPC' }),
        'create a VPC',
        LINKS.CREATE_VPC_HCP,
        true,
      );
    });

    test('ROSA Get Started page - check for "Deploy the cluster and set up access" section', async ({
      page,
      rosaGetStartedPage,
    }) => {
      await rosaGetStartedPage.isDeployClusterAndSetupAccessHeaderShown();

      // Deploy with CLI card
      const cliCard = rosaGetStartedPage.deployWithCliCard();
      await cliCard.scrollIntoViewIfNeeded();
      await expect(cliCard).toBeVisible();

      await expect(
        cliCard.getByRole('heading', { name: 'Deploy with CLI', level: 3 }),
      ).toBeVisible();
      await expect(
        cliCard.getByText(
          'Run the create command in your terminal to begin setup in interactive mode',
        ),
      ).toBeVisible();
      await expect(cliCard.locator('input')).toHaveValue('rosa create cluster');

      await rosaGetStartedPage.checkAnchorProperties(
        cliCard.getByRole('link', { name: 'deploy ROSA clusters with the ROSA CLI' }),
        'deploy ROSA clusters with the ROSA CLI',
        LINKS.ROSA_HCP_CLI_DEPLOY,
        true,
      );

      // Deploy with web interface card
      const webInterfaceCard = rosaGetStartedPage.deployWithWebInterfaceCard();
      await webInterfaceCard.scrollIntoViewIfNeeded();
      await expect(webInterfaceCard).toBeVisible();

      await expect(
        webInterfaceCard.getByRole('heading', { name: 'Deploy with web interface', level: 3 }),
      ).toBeVisible();
      await expect(
        webInterfaceCard.getByText('You can deploy your cluster with the web interface'),
      ).toBeVisible();
      await expect(
        webInterfaceCard.getByRole('heading', {
          name: 'Your AWS account will need to be associated with your Red Hat account',
          level: 4,
        }),
      ).toBeVisible();

      const createWithWebButton = webInterfaceCard.getByRole('link', {
        name: 'Create with web interface',
      });
      await createWithWebButton.click();
      await expect(page).toHaveURL(/\/create\/rosa\/wizard/, { timeout: 20000 });
      await page.goBack();

      // Deploy with Terraform card
      const terraformCard = rosaGetStartedPage.deployWithTerraformCard();
      await terraformCard.scrollIntoViewIfNeeded();
      await expect(terraformCard).toBeVisible();

      await expect(
        terraformCard.getByRole('heading', { name: 'Deploy with Terraform', level: 3 }),
      ).toBeVisible();
      await expect(
        terraformCard.getByText('Create a ROSA HCP cluster using Terraform'),
      ).toBeVisible();

      await rosaGetStartedPage.checkAnchorProperties(
        terraformCard.getByRole('link', { name: 'deploy a ROSA HCP cluster' }),
        'deploy a ROSA HCP cluster',
        LINKS.ROSA_TERRAFORM,
        true,
      );

      await rosaGetStartedPage.checkAnchorProperties(
        terraformCard.getByRole('link', { name: 'visit the Terraform registry' }),
        'visit the Terraform registry',
        LINKS.TERRAFORM_REGISTRY,
        true,
      );
    });
  },
);
