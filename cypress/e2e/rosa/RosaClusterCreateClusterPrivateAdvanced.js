import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateRosaWizardPage from '../../pageobjects/CreateRosaWizard.page';
import CreateClusterPage from '../../pageobjects/CreateCluster.page';
import OverviewPage from '../../pageobjects/Overview.page';

const clusterProfiles = require('../../fixtures/rosa/RosaClusterClassicCreatePrivate.json');
const clusterProperties = clusterProfiles['rosa-classic-private-advanced']['day1-profile'];

const region = clusterProperties.Region.split(',')[0];
const awsAccountID = Cypress.env('QE_AWS_ID');
const rolePrefix = Cypress.env('QE_ACCOUNT_ROLE_PREFIX');
const qeInfrastructure = Cypress.env('QE_INFRA_REGIONS')[region][0];
const securityGroups = qeInfrastructure.SECURITY_GROUPS_NAME;
const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-Installer-Role`;
const clusterName = clusterProperties.ClusterName;

describe(
  'Rosa cluster Creation multizone public advanced settings',
  { tags: ['day1', 'rosa', 'public', 'multi-zone', 'advanced', 'classic'] },
  () => {
    before(() => {
      OverviewPage.viewAllOpenshiftClusterTypesLink().click();
      CreateClusterPage.isCreateClusterPageHeaderVisible();
    });

    it('Open Rosa cluster wizard with advanced settings', () => {
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

    it('Step - Cluster Settings - Select advanced options', () => {
      CreateRosaWizardPage.isClusterDetailsScreen();
      CreateRosaWizardPage.setClusterName(clusterName);
      CreateRosaWizardPage.closePopoverDialogs();
      CreateRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      CreateRosaWizardPage.setDomainPrefix(clusterProperties.DomainPrefix);
      CreateRosaWizardPage.closePopoverDialogs();
      CreateRosaWizardPage.selectRegion(clusterProperties.Region);
      CreateRosaWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      CreateRosaWizardPage.advancedEncryptionLink().click();
      CreateRosaWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
      CreateRosaWizardPage.enableFIPSCryptographyCheckbox().check();
      CreateRosaWizardPage.advancedEncryptionLink().click();
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster Settings - machine pool- Select advanced options', () => {
      CreateRosaWizardPage.isClusterMachinepoolsScreen();
      CreateRosaWizardPage.selectComputeNodeType(clusterProperties.MachinePools[0].InstanceType);
      CreateRosaWizardPage.enableAutoScaling();
      CreateRosaWizardPage.setMinimumNodeCount(clusterProperties.MachinePools[0].MinimumNodeCount);
      cy.get('span').contains('x 3 zones = 6').should('be.visible');
      CreateRosaWizardPage.setMaximumNodeCount(clusterProperties.MachinePools[0].MaximumNodeCount);
      cy.get('span').contains('x 3 zones = 9').should('be.visible');
      CreateRosaWizardPage.useIMDSv2Radio().check();
      CreateRosaWizardPage.rootDiskSizeInput()
        .clear()
        .type('{selectAll}')
        .type(clusterProperties.RootDiskSize);
      CreateRosaWizardPage.editNodeLabelLink().click();
      CreateRosaWizardPage.addNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].NodeLabels[0].Key,
        clusterProperties.MachinePools[0].NodeLabels[0].Value,
        0,
      );
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Networking - Configuration settings', () => {
      CreateRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      CreateRosaWizardPage.installIntoExistingVpcCheckbox().should('be.checked');
      CreateRosaWizardPage.usePrivateLinkCheckbox().should('be.checked');
      if (clusterProperties.ApplicationIngress.includes('Custom settings')) {
        CreateRosaWizardPage.applicationIngressCustomSettingsRadio().check();
        CreateRosaWizardPage.applicationIngressExcludedNamespacesInput().type(
          clusterProperties.ExcludedNamespaces,
        );
        CreateRosaWizardPage.applicationIngressRouterSelectorsInput().type(
          clusterProperties.RouteSelector,
        );
      } else {
        CreateRosaWizardPage.applicationIngressDefaultSettingsRadio().check();
      }
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Networking - VPC Settings', () => {
      CreateRosaWizardPage.isVPCSettingsScreen();
      cy.contains(`Select a VPC to install your cluster into your selected region: ${region}`)
        .scrollIntoView()
        .should('be.visible');
      CreateRosaWizardPage.waitForVPCList();
      CreateRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);
      let i = 0;
      clusterProperties.MachinePools[0].AvailabilityZones.forEach((zone) => {
        CreateRosaWizardPage.selectSubnetAvailabilityZone(zone);
        CreateRosaWizardPage.selectPrivateSubnet(
          i,
          qeInfrastructure.SUBNETS.ZONES[zone].PRIVATE_SUBNET_NAME,
        );
        i = i + 1;
      });

      CreateRosaWizardPage.additionalSecurityGroupsLink().click();
      CreateRosaWizardPage.applySameSecurityGroupsToAllNodeTypes().check();
      securityGroups.forEach((value) => {
        CreateRosaWizardPage.selectAdditionalSecurityGroups(value);
      });
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Networking - CIDR Ranges - advanced options', () => {
      CreateRosaWizardPage.useCIDRDefaultValues(false);
      CreateRosaWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateRosaWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateRosaWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateRosaWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster roles and policies - advanced  options', () => {
      CreateRosaWizardPage.selectRoleProviderMode('Auto');
      CreateRosaWizardPage.customOperatorPrefixInput().scrollIntoView().should('be.visible');
      CreateRosaWizardPage.customOperatorPrefixInput()
        .invoke('val')
        .should('include', clusterName.substring(0, 27));
      CreateRosaWizardPage.customOperatorPrefixInput()
        .type('{selectAll}')
        .type(clusterName.substring(0, 27));
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster update - update strategies - advanced options', () => {
      CreateRosaWizardPage.selectUpdateStratergy(clusterProperties.UpdateStrategy);
      CreateRosaWizardPage.selectGracePeriod(clusterProperties.NodeDrainingGracePeriod);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Review and create step -its definitions', () => {
      CreateRosaWizardPage.waitForARNList();

      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Control plane',
        clusterProperties.ControlPlaneType,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'AWS infrastructure account ID',
        awsAccountID,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Installer role', installerARN);

      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Availability',
        clusterProperties.Availability,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue('Cluster name', clusterName);

      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'User workload monitoring',
        clusterProperties.UserWorkloadMonitoring,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Encrypt volumes with customer keys',
        'Disabled',
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Additional etcd encryption',
        clusterProperties.AdditionalEncryption,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'FIPS cryptography',
        clusterProperties.FIPSCryptography,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Additional etcd encryption',
        clusterProperties.AdditionalEncryption,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Node instance type',
        clusterProperties.MachinePools[0].InstanceType,
      );
      CreateRosaWizardPage.computeNodeRangeValue().contains(
        `Minimum nodes per zone: ${clusterProperties.MachinePools[0].MinimumNodeCount}`,
      );
      CreateRosaWizardPage.computeNodeRangeValue().contains(
        `Maximum nodes per zone: ${clusterProperties.MachinePools[0].MaximumNodeCount}`,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Autoscaling',
        clusterProperties.MachinePools[0].Autoscaling,
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
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Application ingress',
        clusterProperties.ApplicationIngress,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Route selectors',
        clusterProperties.RouteSelector,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Excluded namespaces',
        clusterProperties.ExcludedNamespaces,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Wildcard policy',
        clusterProperties.WildcardPolicy,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Namespace ownership policy',
        `${clusterProperties.NamespaceOwnershipPolicy} namespace ownership`,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Operator roles and OIDC provider mode',
        clusterProperties.OidcProviderMode,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Update strategy',
        clusterProperties.UpdateStrategy,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Node draining',
        clusterProperties.NodeDrainingGracePeriod,
      );
      CreateRosaWizardPage.reviewAndCreateTree().click();
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
      ClusterDetailsPage.checkInstallationStepStatus('DNS setup');
      ClusterDetailsPage.checkInstallationStepStatus('Cluster installation');
    });
  },
);
