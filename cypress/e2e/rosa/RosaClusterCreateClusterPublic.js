import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateRosaWizardPage from '../../pageobjects/CreateRosaWizard.page';
import CreateClusterPage from '../../pageobjects/CreateCluster.page';
import OverviewPage from '../../pageobjects/Overview.page';

const clusterProfiles = require('../../fixtures/rosa/RosaClusterClassicCreatePublic.json');
const clusterProperties = clusterProfiles['rosa-classic-public']['day1-profile'];
const awsAccountID = Cypress.env('QE_AWS_ID');
const rolePrefix = Cypress.env('QE_ACCOUNT_ROLE_PREFIX');
const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-Installer-Role`;
const clusterName = clusterProperties.ClusterName;

describe(
  'Rosa cluster Creation singlezone public default settings',
  { tags: ['day1', 'rosa', 'public', 'single-zone', 'default', 'classic'] },
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
      CreateRosaWizardPage.selectStandaloneControlPlaneTypeOption();
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Accounts and roles - Select Account roles, ARN definitions', () => {
      CreateRosaWizardPage.isAccountsAndRolesScreen();
      CreateRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      CreateRosaWizardPage.waitForARNList();
      CreateRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      CreateRosaWizardPage.waitForARNList();
      CreateRosaWizardPage.selectInstallerRole(installerARN);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - Select Cluster name, regions', () => {
      CreateRosaWizardPage.isClusterDetailsScreen();
      CreateRosaWizardPage.setClusterName(clusterName);
      CreateRosaWizardPage.closePopoverDialogs();
      CreateRosaWizardPage.selectRegion(clusterProperties.Region);
      CreateRosaWizardPage.selectChannelGroup(clusterProperties.EUSChannelGroup);
      CreateRosaWizardPage.getChannelGroupSelector()
        .should('have.value', 'eus');
      cy.log(`✅ EUS channel group selected`);

      CreateRosaWizardPage.selectVersion(clusterProperties.EUSVersion);
      cy.log(`✅ EUS version selected: ${clusterProperties.EUSVersion}`);
      
      CreateRosaWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - Select machine pool node type and node count', () => {
      CreateRosaWizardPage.isClusterMachinepoolsScreen();
      CreateRosaWizardPage.selectComputeNodeType(clusterProperties.MachinePools[0].InstanceType);
      CreateRosaWizardPage.enableAutoScaling();
      CreateRosaWizardPage.disabledAutoScaling();
      CreateRosaWizardPage.selectComputeNodeCount(clusterProperties.MachinePools[0].NodeCount);
      CreateRosaWizardPage.editNodeLabelLink().click();
      CreateRosaWizardPage.addNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].NodeLabels[0].Key,
        clusterProperties.MachinePools[0].NodeLabels[0].Value,
        0,
      );
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - configuration - Select cluster privacy', () => {
      CreateRosaWizardPage.selectClusterPrivacy('private');
      CreateRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - CIDR Ranges - CIDR default values', () => {
      CreateRosaWizardPage.useCIDRDefaultValues(false);
      CreateRosaWizardPage.useCIDRDefaultValues(true);
      CreateRosaWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateRosaWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateRosaWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateRosaWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster roles and policies - role provider mode and its definitions', () => {
      CreateRosaWizardPage.selectRoleProviderMode(clusterProperties.RoleProviderMode);
      CreateRosaWizardPage.customOperatorPrefixInput().scrollIntoView().should('be.visible');
      CreateRosaWizardPage.customOperatorPrefixInput()
        .scrollIntoView()
        .invoke('val')
        .should('include', clusterName.slice(0, 26));
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster update - update strategies and its definitions', () => {
      CreateRosaWizardPage.selectUpdateStratergy(clusterProperties.UpdateStrategy);
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
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Installer role', installerARN);
    });

    it('Step - Review and create : Cluster Settings definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Cluster name', clusterName);
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Region',
        clusterProperties.Region.split(',')[0],
      );
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
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'FIPS cryptography',
        clusterProperties.FIPSCryptography,
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
        'Install into existing VPC',
        clusterProperties.InstallIntoExistingVPC,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Instance Metadata Service (IMDS)',
        clusterProperties.InstanceMetadataService,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Worker root disk size',
        `${clusterProperties.RootDiskSize} GiB`,
      );
    });

    it('Step - Review and create : Networking definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Cluster privacy',
        clusterProperties.ClusterPrivacy,
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
        'Operator roles and OIDC provider mode',
        clusterProperties.RoleProviderMode.toLowerCase(),
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Update strategy',
        clusterProperties.UpdateStrategy,
      );
    });

    it('Create cluster and check the installation progress', () => {
      CreateRosaWizardPage.createClusterButton().click();
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterName);
      cy.get('h2').contains('Installing cluster').should('be.visible');
      cy.get('a').contains('Download OC CLI').should('be.visible');
      ClusterDetailsPage.clusterDetailsPageRefresh();
      ClusterDetailsPage.checkInstallationStepStatus('Account setup');
      ClusterDetailsPage.checkInstallationStepStatus('OIDC and operator roles');
      ClusterDetailsPage.checkInstallationStepStatus('Network settings');
      ClusterDetailsPage.checkInstallationStepStatus('DNS setup');
      ClusterDetailsPage.checkInstallationStepStatus('Cluster installation');
    });
  },
);
