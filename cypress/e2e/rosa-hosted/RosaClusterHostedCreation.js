import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateRosaWizardPage from '../../pageobjects/CreateRosaWizard.page';
import CreateClusterPage from '../../pageobjects/CreateCluster.page';
import OverviewPage from '../../pageobjects/Overview.page';

const clusterProperties = require('../../fixtures/rosa-hosted/RosaClusterHostedCreation.json');
// awsAccountID,rolePrefix and installerARN are set by prerun script for smoke requirements.
const region = clusterProperties.Region.split(',')[0];
const awsAccountID = Cypress.env('QE_AWS_ID');
const awsBillingAccountID = Cypress.env('QE_AWS_BILLING_ID');
const qeInfrastructure = Cypress.env('QE_INFRA_REGIONS')[region][0];
const securityGroups = qeInfrastructure.SECURITY_GROUPS_NAME;
const rolePrefix = Cypress.env('QE_ACCOUNT_ROLE_PREFIX');
const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-HCP-ROSA-Installer-Role`;
const clusterName = `smoke-cypress-rosa-hypershift-${(Math.random() + 1).toString(36).substring(7)}`;

describe(
  'Rosa hosted cluster (hypershift) -wizard checks and cluster creation tests(OCP-57641)',
  { tags: ['smoke', 'hcp'] },
  () => {
    before(() => {
      OverviewPage.viewAllOpenshiftClusterTypesLink().click();
      CreateClusterPage.isCreateClusterPageHeaderVisible();
    });

    it('Open Rosa cluster wizard', () => {
      CreateRosaWizardPage.rosaCreateClusterButton().click();
      CreateRosaWizardPage.rosaClusterWithWeb().should('be.visible').click();
      CreateRosaWizardPage.isCreateRosaPage();
      cy.get('.spinner-loading-text').should('not.exist');
    });

    it('Step - Control plane - Select control plane type', () => {
      CreateRosaWizardPage.isControlPlaneTypeScreen();
      CreateRosaWizardPage.selectHostedControlPlaneTypeOption();
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Accounts and roles - Select Account roles, ARN definitions', () => {
      CreateRosaWizardPage.isAccountsAndRolesScreen();
      CreateRosaWizardPage.howToAssociateNewAWSAccountButton().click();
      CreateRosaWizardPage.isAssociateAccountsDrawer();
      CreateRosaWizardPage.howToAssociateNewAWSAccountDrawerCloseButton().click();
      CreateRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      CreateRosaWizardPage.waitForARNList();
      CreateRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      CreateRosaWizardPage.waitForARNList();
      CreateRosaWizardPage.selectAWSBillingAccount(awsBillingAccountID);
      CreateRosaWizardPage.selectInstallerRole(installerARN);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - Select Cluster name, version, regions', () => {
      CreateRosaWizardPage.isClusterDetailsScreen();
      CreateRosaWizardPage.selectRegion(clusterProperties.Region);
      CreateRosaWizardPage.setClusterName(clusterName);
      CreateRosaWizardPage.closePopoverDialogs();
      CreateRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      CreateRosaWizardPage.setDomainPrefix(clusterProperties.DomainPrefix);
      CreateRosaWizardPage.closePopoverDialogs();
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - Select machine pool node type and node count', () => {
      CreateRosaWizardPage.isClusterMachinepoolsScreen(true);
      cy.contains(`Select a VPC to install your machine pools into your selected region: ${region}`)
        .scrollIntoView()
        .should('be.visible');
      CreateRosaWizardPage.waitForVPCList();
      CreateRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);
      CreateRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools[0].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        1,
      );
      CreateRosaWizardPage.selectComputeNodeType(clusterProperties.MachinePools[0].InstanceType);
      CreateRosaWizardPage.enableAutoScaling();
      CreateRosaWizardPage.disabledAutoScaling();
      CreateRosaWizardPage.selectComputeNodeCount(clusterProperties.MachinePools[0].NodeCount);
      CreateRosaWizardPage.useBothIMDSv1AndIMDSv2Radio().should('be.checked');
      CreateRosaWizardPage.useIMDSv2Radio().check();
      CreateRosaWizardPage.rootDiskSizeInput().should('have.value', '300');
      CreateRosaWizardPage.rootDiskSizeInput()
        .clear()
        .type('{selectAll}')
        .type(clusterProperties.MachinePools[0].RootDiskSize);
      CreateRosaWizardPage.additionalSecurityGroupsLink().click();
      cy.contains('h4', clusterProperties.MachinePools[0].SecurityGroupsInfoNote).should(
        'be.visible',
      );
      securityGroups.forEach((value) => {
        CreateRosaWizardPage.selectAdditionalSecurityGroups(value);
      });
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - configuration - Select cluster privacy', () => {
      CreateRosaWizardPage.clusterPrivacyPublicRadio().should('be.checked');
      CreateRosaWizardPage.clusterPrivacyPrivateRadio().should('not.be.checked');
      CreateRosaWizardPage.selectClusterPrivacy('private');
      CreateRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      CreateRosaWizardPage.selectMachinePoolPublicSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools[0].AvailabilityZones]
          .PUBLIC_SUBNET_NAME,
      );
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - CIDR Ranges - CIDR default values', () => {
      CreateRosaWizardPage.cidrDefaultValuesCheckBox().should('be.checked');
      CreateRosaWizardPage.useCIDRDefaultValues(false);
      CreateRosaWizardPage.useCIDRDefaultValues(true);
      CreateRosaWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateRosaWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateRosaWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateRosaWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster roles and policies - role provider mode and its definitions', () => {
      CreateRosaWizardPage.selectOidcConfigId(clusterProperties.OidcConfigId);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster update - update statergies and its definitions', () => {
      CreateRosaWizardPage.individualUpdateRadio().should('not.be.checked');
      CreateRosaWizardPage.recurringUpdateRadio().should('be.checked');
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Review and create : Accounts and roles definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Control plane',
        clusterProperties.ControlPlaneType,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'AWS infrastructure account ID',
        awsAccountID,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'AWS billing account ID',
        awsBillingAccountID,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Installer role', installerARN);
    });

    it('Step - Review and create : Cluster Settings definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Cluster name', clusterName);
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Domain prefix',
        clusterProperties.DomainPrefix,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Region', region);
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Availability',
        clusterProperties.Availability,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Encrypt volumes with customer keys',
        clusterProperties.EncryptVolumesWithCustomerKeys,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Additional etcd encryption',
        clusterProperties.AdditionalEncryption,
      );
    });

    it('Step - Review and create : Machine pool definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Node instance type',
        clusterProperties.MachinePools[0].InstanceType,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Autoscaling',
        clusterProperties.MachinePools[0].Autoscaling,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Compute node count',
        clusterProperties.MachinePools[0].NodeCount,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Worker root disk size',
        `${clusterProperties.MachinePools[0].RootDiskSize} GiB`,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Install to selected VPC',
        qeInfrastructure.VPC_NAME,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Instance Metadata Service (IMDS)',
        clusterProperties.InstanceMetadataService,
      );
      securityGroups.forEach((value) => {
        cy.contains(value).scrollIntoView().should('be.visible').should('be.exist');
      });
    });

    it('Step - Review and create : Networking definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Cluster privacy', 'Public');
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Public subnet',
        qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools[0].AvailabilityZones]
          .PUBLIC_SUBNET_NAME,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Cluster-wide proxy',
        clusterProperties.ClusterWideProxy,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Machine CIDR',
        clusterProperties.MachineCIDR,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Service CIDR',
        clusterProperties.ServiceCIDR,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Pod CIDR', clusterProperties.PodCIDR);
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Host prefix',
        clusterProperties.HostPrefix,
      );
    });

    it('Step - Review and create : cluster roles and update definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'OIDC Configuration Type',
        clusterProperties.OidcConfigType,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'OIDC Configuration ID',
        clusterProperties.OidcConfigId,
      );
    });

    it('Create cluster and check the installation progress', () => {
      CreateRosaWizardPage.createClusterButton().click();
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterName);
      cy.get('h2').contains('Installing cluster').should('be.visible');
      cy.get('a').contains('Download OC CLI').should('be.visible');
      cy.contains('Cluster creation usually takes 10 minutes to complete')
        .scrollIntoView()
        .should('be.visible');
      ClusterDetailsPage.clusterDetailsPageRefresh();
      ClusterDetailsPage.checkInstallationStepStatus('Account setup');
      ClusterDetailsPage.checkInstallationStepStatus('OIDC and operator roles');
      ClusterDetailsPage.checkInstallationStepStatus('Network settings');
      ClusterDetailsPage.checkInstallationStepStatus('DNS setup');
      ClusterDetailsPage.checkInstallationStepStatus('Cluster installation');
      ClusterDetailsPage.clusterTypeLabelValue().scrollIntoView().contains(clusterProperties.Type);
      ClusterDetailsPage.clusterDomainPrefixLabelValue()
        .scrollIntoView()
        .contains(clusterProperties.DomainPrefix);
      ClusterDetailsPage.clusterControlPlaneTypeLabelValue()
        .scrollIntoView()
        .contains(clusterProperties.ControlPlaneType);
      ClusterDetailsPage.clusterRegionLabelValue().scrollIntoView().contains(region);
      ClusterDetailsPage.clusterAvailabilityLabelValue()
        .scrollIntoView()
        .contains(clusterProperties.Availability);
      ClusterDetailsPage.clusterInfrastructureAWSaccountLabelValue()
        .scrollIntoView()
        .contains(awsAccountID);
      ClusterDetailsPage.clusterBillingMarketplaceAccountLabelValue(awsBillingAccountID);
      ClusterDetailsPage.clusterMachineCIDRLabelValue()
        .scrollIntoView()
        .contains(clusterProperties.MachineCIDR);
      ClusterDetailsPage.clusterServiceCIDRLabelValue()
        .scrollIntoView()
        .contains(clusterProperties.ServiceCIDR);
      ClusterDetailsPage.clusterPodCIDRLabelValue()
        .scrollIntoView()
        .contains(clusterProperties.PodCIDR);
      ClusterDetailsPage.clusterHostPrefixLabelValue()
        .scrollIntoView()
        .contains(clusterProperties.HostPrefix.replace('/', ''));
    });
    it('Delete the cluster', () => {
      ClusterDetailsPage.actionsDropdownToggle().click();
      ClusterDetailsPage.deleteClusterDropdownItem().click();
      ClusterDetailsPage.deleteClusterNameInput().clear().type(clusterName);
      ClusterDetailsPage.deleteClusterConfirm().click();
      ClusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  },
);
