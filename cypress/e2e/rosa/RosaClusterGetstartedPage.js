import RosaGetstartedPage from '../../pageobjects/RosaGetstarted.page';

describe('Rosa cluster Get Started page(OCP-56363)', { tags: ['smoke'] }, () => {
  before(() => {
    cy.visit('/create/rosa/getstarted');
  });
  it(`Launch ROSA Getstarted page`, () => {
    RosaGetstartedPage.isRosaGetStartedPage();
  });

  it(`ROSA Getstarted page - check for FedRAMP sections`, () => {
    RosaGetstartedPage.isRosaFedRAMPInfoAlertShown();
    RosaGetstartedPage.checkAnchorProperties(
      RosaGetstartedPage.rosaFedRampDoclink(),
      'Learn more about ROSA with hosted control planes in AWS GovCloud',
      'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/getting_started_with_red_hat_openshift_service_on_aws_in_aws_govcloud/index',
      true,
    );
    RosaGetstartedPage.checkAnchorProperties(
      RosaGetstartedPage.rosaFedRampRequestFormlink(),
      'FedRAMP access request form',
      'https://console.redhat.com/openshift/create/rosa/govcloud',
      true,
    );
  });

  it(`ROSA Getstarted page - check for "Complete AWS prerequisites" section`, () => {
    RosaGetstartedPage.isCompleteAWSPrerequisitesHeaderShown();
    cy.contains('h3', 'Have you prepared your AWS account?')
      .should('be.exist')
      .should('be.visible')
      .parent()
      .scrollIntoView()
      .within(() => {
        cy.contains('Enable AWS').should('be.exist').should('be.visible');
        cy.contains(
          'Set up a VPC for ROSA hosted control plane architecture (HCP) clusters (optional for ROSA classic architecture clusters)',
        )
          .should('be.exist')
          .should('be.visible');
        cy.contains('Configure Elastic Load Balancer (ELB)')
          .should('be.exist')
          .should('be.visible');
        cy.contains('Verify your quotas on AWS console').should('be.exist').should('be.visible');
        cy.contains(
          'a[href="https://console.aws.amazon.com/rosa/home#/get-started"]',
          'Open AWS Console',
        )
          .should('be.exist')
          .should('be.visible');
      });
  });
  it(`ROSA Getstarted page - check for "Complete ROSA prerequisites" section`, () => {
    RosaGetstartedPage.isCompleteROSAPrerequisitesHeaderShown();
    RosaGetstartedPage.checkAnchorProperties(
      cy.get('a'),
      'More information on ROSA setup',
      'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started.html',
      true,
    );
  });

  it(`ROSA Getstarted page - check for "Complete ROSA prerequisites - Step 1" section`, () => {
    RosaGetstartedPage.rosaPrerequisitesStep1Items().should('have.length', 2);
    RosaGetstartedPage.rosaPrerequisitesStep1Section().within(() => {
      cy.get('h3')
        .contains(
          'Download and install the ROSA and AWS command line tools (CLI) and add it to your',
        )
        .should('be.visible');
    });

    RosaGetstartedPage.rosaPrerequisitesStep11Content()
      .contains('Download the latest version of the ROSA CLI')
      .should('be.exist')
      .should('be.visible');
    RosaGetstartedPage.checkAnchorProperties(
      RosaGetstartedPage.rosaPrerequisitesStep11Content().parent().find('a'),
      'Help with ROSA CLI setup',
      'https://access.redhat.com/documentation/en-us/red_hat_openshift_service_on_aws/4/html/rosa_cli/rosa-get-started-cli',
      true,
    );
    const rosaClientOptions = {
      MacOS: 'https://mirror.openshift.com/pub/cgw/rosa/latest/rosa-macosx.tar.gz',
      Windows: 'https://mirror.openshift.com/pub/cgw/rosa/latest/rosa-windows.zip',
      Linux: 'https://mirror.openshift.com/pub/cgw/rosa/latest/rosa-linux.tar.gz',
    };
    Object.entries(rosaClientOptions).forEach(([key, value]) => {
      RosaGetstartedPage.rosaClientDropdown().select(key);
      RosaGetstartedPage.rosaClientButton({ timeout: 20000 }).should(
        'have.attr',
        'href',
        `${value}`,
      );
    });

    RosaGetstartedPage.rosaPrerequisitesStep12Content()
      .parent()
      .within(() => {
        cy.contains('Download, setup and configure the AWS CLI version 2')
          .should('be.exist')
          .should('be.visible');
        RosaGetstartedPage.checkAnchorProperties(
          cy.get('a'),
          'installing',
          'https://aws.amazon.com/cli/',
          true,
        );
        RosaGetstartedPage.checkAnchorProperties(
          cy.get('a'),
          'configuring',
          'https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html',
          true,
        );
      });
  });

  it(`ROSA Getstarted page - check for "Complete ROSA prerequisites - Step 2" section`, () => {
    RosaGetstartedPage.rosaPrerequisitesStep2Items().should('have.length', 2);
    RosaGetstartedPage.rosaPrerequisitesStep2Section()
      .scrollIntoView()
      .contains(
        'Log in to the ROSA CLI with your Red Hat account and create AWS account roles and policies.',
      )
      .should('be.visible');
    RosaGetstartedPage.rosaPrerequisitesStep21Content().within(() => {
      cy.contains(
        'To authenticate, run this command and enter your Red Hat login credentials via SSO',
      )
        .should('be.exist')
        .should('be.visible');
      cy.get('input').should('have.value', 'rosa login --use-auth-code');
      RosaGetstartedPage.checkAnchorProperties(
        cy.get('a'),
        'logging into OpenShift Cluster Manager ROSA CLI with Red Hat single sign-on',
        'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/cli_tools/rosa-cli#rosa-login-sso_rosa-getting-started-cli',
        true,
      );
    });

    RosaGetstartedPage.rosaPrerequisitesStep22Content().within(() => {
      cy.contains(
        "To create the necessary account-wide roles and policies quickly, use the default auto method that's provided in the ROSA CLI",
      )
        .should('be.exist')
        .should('be.visible');
      cy.get('input').should('have.value', 'rosa create account-roles --mode auto');
      RosaGetstartedPage.checkAnchorProperties(
        cy.get('a'),
        'these instructions',
        'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-manual.html',
        true,
      );
    });
  });

  it(`ROSA Getstarted page - check for "Complete ROSA prerequisites - Step 3" section`, () => {
    RosaGetstartedPage.rosaPrerequisitesStep3Items().should('have.length', 1);
    RosaGetstartedPage.rosaHpcCreateVpcLabel()
      .contains('Only for ROSA HCP clusters')
      .should('be.exist');
    RosaGetstartedPage.rosaPrerequisitesStep31Content()
      .scrollIntoView()
      .within(() => {
        cy.contains(
          'To create a Virtual Private Network (VPC) and all the neccesary components, run this command',
        )
          .should('be.exist')
          .should('be.visible');
        cy.get('input').should('have.value', 'rosa create network');
      });
    RosaGetstartedPage.checkAnchorProperties(
      cy.get('a'),
      'create network command',
      'https://access.redhat.com/articles/7096266',
      true,
    );

    RosaGetstartedPage.checkAnchorProperties(
      cy.get('a'),
      'create a VPC',
      'https://docs.aws.amazon.com/rosa/latest/userguide/getting-started-hcp.html#create-vpc-hcp',
      true,
    );
  });
  it(`ROSA Getstarted page - check for "Deploy the cluster and set up access" section`, () => {
    RosaGetstartedPage.isDeployClusterAndSetupAccessHeaderShown();
    RosaGetstartedPage.deployWithCliCard().scrollIntoView().should('be.visible');
    RosaGetstartedPage.deployWithCliCard().within(() => {
      cy.get('h3').contains('Deploy with CLI').should('be.exist').should('be.visible');
      cy.get('p')
        .contains('Run the create command in your terminal to begin setup in interactive mode')
        .should('be.exist')
        .should('be.visible');
      cy.get('input').should('have.value', 'rosa create cluster');
      RosaGetstartedPage.checkAnchorProperties(
        cy.get('a'),
        'deploy ROSA clusters with the ROSA CLI',
        'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/install_clusters/rosa-hcp-sts-creating-a-cluster-quickly',
        true,
      );
    });
    RosaGetstartedPage.deployWithWebInterfaceCard().scrollIntoView().should('be.visible');
    RosaGetstartedPage.deployWithWebInterfaceCard().within(() => {
      cy.get('h3').contains('Deploy with web interface').should('be.exist').should('be.visible');
      cy.get('p')
        .contains('You can deploy your cluster with the web interface')
        .should('be.exist')
        .should('be.visible');
      cy.get('h4')
        .contains('Your AWS account will need to be associated with your Red Hat account')
        .should('be.visible');
      cy.get('a').contains('Create with web interface').click();
      cy.url({ timeout: 20000 }).should('include', '/create/rosa/wizard');
      cy.go('back');
    });
    RosaGetstartedPage.deployWithTerraformCard().scrollIntoView().should('be.visible');
    RosaGetstartedPage.deployWithTerraformCard().within(() => {
      cy.get('h3').contains('Deploy with Terraform').should('be.exist').should('be.visible');
      cy.get('p')
        .contains('Create a ROSA HCP cluster using Terraform')
        .should('be.exist')
        .should('be.visible');
      RosaGetstartedPage.checkAnchorProperties(
        cy.get('a'),
        'deploy a ROSA HCP cluster',
        'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/install_clusters/creating-a-red-hat-openshift-service-on-aws-cluster-with-terraform',
        true,
      );
      RosaGetstartedPage.checkAnchorProperties(
        cy.get('a'),
        'visit the Terraform registry',
        'https://registry.terraform.io/providers/terraform-redhat/rhcs/latest/docs/guides/hosted-control-planes',
        true,
      );
    });
  });
});
