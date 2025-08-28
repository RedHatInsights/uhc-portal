import Login from '../../pageobjects/login.page';
import ClusterListPage from '../../pageobjects/ClusterList.page';
import CreateRosaWizardPage from '../../pageobjects/CreateRosaWizard.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import * as path from 'path';

Cypress.config({
  defaultCommandTimeout: 180000,
  pageLoadTimeout: 120000,
  viewportWidth: 1600,
  viewportHeight: 1080,
});

Cypress.env(
  'installerARN',
  `arn:${Cypress.env('QE_AWS_ARN_PREFIX')}:iam::${Cypress.env('QE_AWS_ID')}:role/${Cypress.env(
    'ROLE_PREFIX',
  )}-${Cypress.env('QE_ENV_PREFIX')}-Installer-Role`,
);
Cypress.env(
  'clusterName',
  `${Cypress.env('QE_CLUSTER_NAME_PREFIX')}-${Math.random().toString(36).substring(2, 4)}`,
);
Cypress.env(
  'validationsResultFile',
  path.join(Cypress.config('downloadsFolder'), 'validations-deployment-result'),
);

export const workflowValidationTestTitles = [
  'Post Install: Tabs Validations',
  'Post Install: Overview Validations',
  'Post Install: Access Control Validations',
  'Post Installation: Add-ons Validations',
  'Post Installation: Cluster history Validations',
  'Post Installation: Networking Validations',
  'Post Installation: Machine pools Validations',
  'Post Installation: Support Validations',
  'Post Installation: Settings Validations',
  'Post Installation: Cluster List Validations',
];

describe('Create ROSA Cluster in FedRamp (OCP-TBD)', { tags: ['fedramp'] }, () => {
  after(() => {
    if (Cypress.env('TEARDOWN')) {
      ClusterDetailsPage.actionsDropdownToggle().click();
      ClusterDetailsPage.deleteClusterDropdownItem().click();
      ClusterDetailsPage.deleteClusterNameInput().clear().type(Cypress.env('clusterName'));
      ClusterDetailsPage.deleteClusterConfirm().click();
      ClusterDetailsPage.waitForDeleteClusterActionComplete();
    }
  });

  afterEach(function () {
    if (this.currentTest.state === 'failed') {
      if (workflowValidationTestTitles.includes(this.currentTest.title)) {
        cy.log(
          `Writing file - ${Cypress.env('validationsResultFile')} with Contents - ${
            this.currentTest.state
          } - ${this.currentTest.title}`,
        );
        cy.writeFile(
          Cypress.env('validationsResultFile'),
          `${this.currentTest.state}: ${this.currentTest.title}\n`,
          { flag: 'a+' },
        );
        return false;
      }
    }
  });

  describe('Launch ROSA Wizard ,Select default values,Create cluster', () => {
    it('Open Rosa cluster wizard', () => {
      CreateRosaWizardPage.clickCreateClusterBtn();
      CreateRosaWizardPage.isRosaCreateClusterDropDownVisible();
      CreateRosaWizardPage.clickRosaCreateClusterDropDownVisible();
      CreateRosaWizardPage.isRosaCreateWithWebUIVisible();
      CreateRosaWizardPage.clickRosaCreateWithWebUI();
      CreateRosaWizardPage.isCreateRosaPage();
      CreateRosaWizardPage.waitForSpinnerToNotExist();
    });

    it('Step - Accounts and roles - Select Account roles, ARN definitions', () => {
      CreateRosaWizardPage.isControlPlaneTypeScreen();
      CreateRosaWizardPage.selectStandaloneControlPlaneTypeOption();
      cy.get(CreateRosaWizardPage.primaryButton).click({ force: true });
      CreateRosaWizardPage.isAccountsAndRolesScreen();
      CreateRosaWizardPage.selectAWSInfrastructureAccount(Cypress.env('QE_AWS_ID'));
      CreateRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      CreateRosaWizardPage.waitForARNList();
      // duplicated steps because installer ARNs are not populated as per account selection for the first time.
      CreateRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      CreateRosaWizardPage.waitForARNList();
      CreateRosaWizardPage.selectInstallerRole(Cypress.env('installerARN'));
      CreateRosaWizardPage.clickButtonContainingText('Next');
    });

    it('Step - Cluster Settings - Select Cluster name, version, regions', () => {
      CreateRosaWizardPage.isClusterDetailsScreen();
      cy.get(CreateRosaWizardPage.clusterNameInput).type(Cypress.env('clusterName'));
      CreateRosaWizardPage.clusterDetailsTree().click();
      CreateRosaWizardPage.selectClusterVersionFedRamp(Cypress.env('CLUSTER_VERSION'));
      CreateRosaWizardPage.selectRegion(Cypress.env('QE_AWS_REGION_AND_LOCATION'));
      CreateRosaWizardPage.selectAvailabilityZone(Cypress.env('CLUSTER_AVAILABILITY'));
      CreateRosaWizardPage.clickButtonContainingText('Advanced Encryption');
      if (Cypress.env('ENCRYPT_VOLUMES_WITH_CUSTOMER_KEYS') == 'Enabled') {
        CreateRosaWizardPage.enableCustomerManageKeys();
        CreateRosaWizardPage.inputCustomerManageKeyARN(Cypress.env('KMS_CUSTOM_KEY_ARN'));
      }
      if (!Cypress.env('GOV_CLOUD') && Cypress.env('ADDITIONAL_ETCD_ENCRYPTION') == 'Enabled') {
        CreateRosaWizardPage.enableEtcEncryption();
      }
      if (!Cypress.env('GOV_CLOUD') && Cypress.env('ADDITIONAL_ETCD_ENCRYPTION') == 'Disabled') {
        CreateRosaWizardPage.isEtcEncryptionDisabled();
      }
      if (!Cypress.env('GOV_CLOUD') && Cypress.env('FIPS_CRYPTOGRAPHY') == 'Enabled') {
        CreateRosaWizardPage.enableFips();
      } else {
        CreateRosaWizardPage.isFipsDisabled();
      }
      CreateRosaWizardPage.clickButtonContainingText('Next');
    });

    it('Step - Cluster Settings - Select machine pool node type and node count', () => {
      CreateRosaWizardPage.isClusterMachinepoolsScreen();
      CreateRosaWizardPage.selectComputeNodeType(Cypress.env('COMPUTE_NODE_TYPE'));
      if (Cypress.env('AUTO_SCALING') == 'Enabled') {
        CreateRosaWizardPage.enableAutoScaling();
        CreateRosaWizardPage.inputMinNodeCount(Cypress.env('MIN_NODE_COUNT'));
        CreateRosaWizardPage.inputMaxNodeCount(Cypress.env('MAX_NODE_COUNT'));
      } else {
        CreateRosaWizardPage.selectComputeNodeCount(Cypress.env('COMPUTE_NODE_COUNT'));
      }
      CreateRosaWizardPage.inputRootDiskSize(Cypress.env('ROOT_DISK_SIZE'));
      if (Cypress.env('INSTANCE_METADATA_SERVICE') == 'IMDSv2 only') {
        CreateRosaWizardPage.enableIMDSOnly();
      } else {
        CreateRosaWizardPage.imdsOptionalIsEnabled();
      }
      if (Cypress.env('ADD_NODE_LABELS')) {
        CreateRosaWizardPage.clickButtonContainingText('Add node labels');
        if (Cypress.env('NODE_LABEL_KVS')) {
          CreateRosaWizardPage.inputNodeLabelKvs(Cypress.env('NODE_LABEL_KVS'));
        }
      }
      CreateRosaWizardPage.clickButtonContainingText('Next');
    });

    it('Step - Cluster Settings - configuration - Select cluster privacy', () => {
      if (Cypress.env('GOV_CLOUD')) {
        CreateRosaWizardPage.clusterPrivacyIsDisabled();
        CreateRosaWizardPage.clickButtonContainingText('Next');
        CreateRosaWizardPage.clickButtonContainingText('Select a VPC');
        CreateRosaWizardPage.selectFirstVPC();
        CreateRosaWizardPage.clickButtonContainingText('Select availability zone');
        CreateRosaWizardPage.selectFirstAvailabilityZone();
        CreateRosaWizardPage.clickButtonContainingText('Select private subnet');
        CreateRosaWizardPage.selectFirstPrivateSubnet();
        if (Cypress.env('INSTALL_INTO_AWS_SHARED_VPC')) {
          cy.get('#shared_vpc\\.is_selected').check().should('be.enabled');
          if (Cypress.env('SHARED_VPC_BASE_DNS_DOMAIN') == 'auto') {
            // TODO: Add steps to configure the aws hosted zone
            CreateRosaWizardPage.clickButtonContainingText('Select base DNS domain');
            CreateRosaWizardPage.clickButtonContainingText('Reserve new base DNS domain');
          } else {
            // TODO: Add steps to use a pre-configured shared vpc
            cy.get('sharedvpcdropdown')
              .type(Cypress.env('SHARED_VPC_BASE_DNS_DOMAIN'))
              .should('have.value', Cypress.env('SHARED_VPC_BASE_DNS_DOMAIN'));
          }
        }
        CreateRosaWizardPage.clickButtonContainingText('Next');
      }
    });

    it('Step - Cluster Settings - CIDR Ranges - CIDR default values', () => {
      // TODO: create logic to allow for non-default values
      if (Cypress.env('USE_NON_DEFAULT_CIDR')) {
        CreateRosaWizardPage.useCIDRDefaultValues(false);
        CreateRosaWizardPage.machineCIDRInput()
          .clear()
          .type(Cypress.env('MACHINE_CIDR'))
          .should('have.value', Cypress.env('MACHINE_CIDR'));
        CreateRosaWizardPage.serviceCIDRInput()
          .clear()
          .type(Cypress.env('SERVICE_CIDR'))
          .should('have.value', Cypress.env('SERVICE_CIDR'));
        CreateRosaWizardPage.podCIDRInput()
          .clear()
          .type(Cypress.env('POD_CIDR'))
          .should('have.value', Cypress.env('POD_CIDR'));
        CreateRosaWizardPage.hostPrefixInput()
          .clear()
          .type(Cypress.env('HOST_PREFIX'))
          .should('have.value', Cypress.env('HOST_PREFIX'));
      }
      CreateRosaWizardPage.machineCIDRInput().should('have.value', Cypress.env('MACHINE_CIDR'));
      CreateRosaWizardPage.serviceCIDRInput().should('have.value', Cypress.env('SERVICE_CIDR'));
      CreateRosaWizardPage.podCIDRInput().should('have.value', Cypress.env('POD_CIDR'));
      CreateRosaWizardPage.hostPrefixInput().should('have.value', Cypress.env('HOST_PREFIX'));
      CreateRosaWizardPage.clickButtonContainingText('Next');
    });

    it('Step - Cluster roles and policies - role provider mode and its definitions', () => {
      if (Cypress.env('ROLE_PROVIDER_MODE') == 'Manual') {
        CreateRosaWizardPage.enableRosaRolesProviderCreationModeManual();
      }
      if (Cypress.env('ROLE_PROVIDER_MODE') == 'Auto') {
        CreateRosaWizardPage.enableRosaRolesProviderCreationModeAuto();
      }
      CreateRosaWizardPage.customOperatorPrefixInput().should('be.visible');
      CreateRosaWizardPage.customOperatorPrefixInput().invoke('val').should('not.be.empty');
      CreateRosaWizardPage.clickButtonContainingText('Next');
    });

    it('Step - Cluster update - update strategies and its definitions', () => {
      if (Cypress.env('UPDATE_STRATEGY') == 'Individual updates') {
        CreateRosaWizardPage.enableUpgradePolicyManual();
      }
      if (Cypress.env('UPDATE_STRATEGY') == 'Recurring updates') {
        CreateRosaWizardPage.enableUpgradePolicyAutomatic();
      }
      CreateRosaWizardPage.clickButtonContainingText('Next');
    });

    it('Step - Review and create : Accounts and roles definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'AWS infrastructure account ID',
        Cypress.env('QE_AWS_ID'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Installer role',
        Cypress.env('installerARN'),
      );
    });

    it('Step - Review and create : Cluster Settings definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Cluster name',
        Cypress.env('clusterName'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Version', Cypress.env('CLUSTER_VERSION'));
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Region', Cypress.env('QE_AWS_REGION'));
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Availability',
        Cypress.env('CLUSTER_AVAILABILITY'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Encrypt volumes with customer keys',
        Cypress.env('ENCRYPT_VOLUMES_WITH_CUSTOMER_KEYS'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Additional etcd encryption',
        Cypress.env('ADDITIONAL_ETCD_ENCRYPTION'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'FIPS cryptography',
        Cypress.env('FIPS_CRYPTOGRAPHY'),
      );
    });

    it('Step - Review and create : Machine pool definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Node instance type',
        Cypress.env('COMPUTE_NODE_TYPE'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Autoscaling',
        Cypress.env('AUTO_SCALING'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Compute node count',
        Cypress.env('COMPUTE_NODE_COUNT'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Install into existing VPC',
        Cypress.env('INSTALL_INTO_EXISTING_VPC'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Instance Metadata Service (IMDS)',
        Cypress.env('INSTANCE_METADATA_SERVICE'),
      );
    });

    it('Step - Review and create : Networking definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Cluster privacy',
        Cypress.env('CLUSTER_PRIVACY_VALIDATION'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Machine CIDR',
        Cypress.env('MACHINE_CIDR'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Service CIDR',
        Cypress.env('SERVICE_CIDR'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Pod CIDR', Cypress.env('POD_CIDR'));
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Host prefix', Cypress.env('HOST_PREFIX'));
    });

    it('Step - Review and create : cluster roles and update definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Operator roles and OIDC provider mode',
        Cypress.env('ROLE_PROVIDER_MODE_VALIDATION'),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Update strategy',
        Cypress.env('UPDATE_STRATEGY'),
      );
    });

    it('Create cluster and check the installation progress', () => {
      CreateRosaWizardPage.createClusterButton().click();
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(Cypress.env('clusterName'));
      cy.get('h2').contains('Installing cluster').should('be.visible');
      cy.get('a').contains('Download OC CLI').should('be.visible');
      ClusterDetailsPage.clusterDetailsPageRefresh();
      ClusterDetailsPage.checkInstallationStepStatus('Account setup');
      ClusterDetailsPage.checkInstallationStepStatus('OIDC and operator roles');
      ClusterDetailsPage.checkInstallationStepStatus('DNS setup');
      ClusterDetailsPage.checkInstallationStepStatus('Cluster installation');
      ClusterDetailsPage.clusterTypeLabelValue().contains('ROSA');
      ClusterDetailsPage.clusterRegionLabelValue().contains(Cypress.env('QE_AWS_REGION'));
      ClusterDetailsPage.clusterAvailabilityLabelValue().contains(
        Cypress.env('CLUSTER_AVAILABILITY'),
      );
      ClusterDetailsPage.clusterInfrastructureAWSaccountLabelValue().contains(
        Cypress.env('QE_AWS_ID'),
      );
      ClusterDetailsPage.clusterMachineCIDRLabelValue(Cypress.env('MACHINE_CIDR'));
      ClusterDetailsPage.clusterServiceCIDRLabelValue(Cypress.env('SERVICE_CIDR'));
      ClusterDetailsPage.clusterPodCIDRLabelValue(Cypress.env('POD_CIDR'));
      ClusterDetailsPage.clusterHostPrefixLabelValue(Cypress.env('HOST_PREFIX'));
    });
  });
});
