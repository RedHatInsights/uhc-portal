import CreateRosaWizardPage from '../../pageobjects/CreateRosaWizard.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateClusterPage from '../../pageobjects/CreateCluster.page';
import OverviewPage from '../../pageobjects/Overview.page';

const clusterProfiles = require('../../fixtures/rosa-hosted/RosaHostedClusterCreatePrivate.json');
const clusterProperties = clusterProfiles['rosa-hosted-private']['day1-profile'];
const region = clusterProperties.Region.split(',')[0];
const qeInfrastructure = Cypress.env('QE_INFRA_REGIONS')[region][0];
const clusterName = clusterProperties.ClusterName;
const awsAccountID = Cypress.env('QE_AWS_ID');
const awsBillingAccountID = Cypress.env('QE_AWS_BILLING_ID');
const rolePrefix = Cypress.env('QE_ACCOUNT_ROLE_PREFIX');
const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-HCP-ROSA-Installer-Role`;

describe(
  'Rosa hosted cluster (hypershift) -create private cluster with properties',
  { tags: ['day1', 'hosted', 'rosa', 'private', 'hcp'] },
  () => {
    before(() => {
      // Setup for rosa command executions.
      cy.exec(`aws configure set aws_access_key_id ${Cypress.env('QE_AWS_ACCESS_KEY_ID')}`);
      cy.exec(`aws configure set aws_secret_access_key ${Cypress.env('QE_AWS_ACCESS_KEY_SECRET')}`);
      cy.exec(`aws configure set region ${Cypress.env('QE_AWS_REGION')}`);
      if (Cypress.env('QE_USE_OFFLINE_TOKEN')) {
        cy.rosaLoginViaOfflineToken(
          Cypress.env('QE_ORGADMIN_OFFLINE_TOKEN'),
          Cypress.env('QE_ENV_AUT'),
        );
      } else {
        cy.rosaLoginViaServiceAccount(
          Cypress.env('QE_ORGADMIN_CLIENT_ID'),
          Cypress.env('QE_ORGADMIN_CLIENT_SECRET'),
          Cypress.env('QE_ENV_AUT'),
        );
      }
      OverviewPage.viewAllOpenshiftClusterTypesLink().click();
      CreateClusterPage.isCreateClusterPageHeaderVisible();
    });
    it(`Open Rosa wizard for private cluster : ${clusterName}`, () => {
      CreateRosaWizardPage.rosaCreateClusterButton().click();
      CreateRosaWizardPage.rosaClusterWithWeb().should('be.visible').click();
      CreateRosaWizardPage.isCreateRosaPage();
      cy.get('.spinner-loading-text').should('not.exist');
    });

    it(`Step - Control plane - Select control plane type ${clusterName}`, () => {
      CreateRosaWizardPage.isControlPlaneTypeScreen();
      CreateRosaWizardPage.selectHostedControlPlaneTypeOption();
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it(`Step - Accounts and roles - Select Accounts and roles for ${clusterName}`, () => {
      CreateRosaWizardPage.isAccountsAndRolesScreen();
      CreateRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      CreateRosaWizardPage.waitForARNList();
      CreateRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      CreateRosaWizardPage.waitForARNList();
      CreateRosaWizardPage.selectAWSBillingAccount(awsBillingAccountID);
      CreateRosaWizardPage.selectInstallerRole(installerARN);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it(`Step - Cluster Settings - Set cluster details for ${clusterName}`, () => {
      CreateRosaWizardPage.isClusterDetailsScreen();
      CreateRosaWizardPage.setClusterName(clusterName);
      CreateRosaWizardPage.closePopoverDialogs();
      CreateRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      CreateRosaWizardPage.setDomainPrefix(clusterProperties.DomainPrefix);
      CreateRosaWizardPage.closePopoverDialogs();
      CreateRosaWizardPage.selectRegion(clusterProperties.Region);
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it(`Step - Cluster Settings - Set machine pools for ${clusterName}`, () => {
      CreateRosaWizardPage.isClusterMachinepoolsScreen(true);
      cy.contains(`Select a VPC to install your machine pools into your selected region: ${region}`)
        .scrollIntoView()
        .should('be.visible');
      CreateRosaWizardPage.waitForVPCList();
      CreateRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);

      let i = 1;
      for (; i <= clusterProperties.MachinePools.MachinePoolCount; i++) {
        CreateRosaWizardPage.selectMachinePoolPrivateSubnet(
          qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools.AvailabilityZones[i - 1]]
            .PRIVATE_SUBNET_NAME,
          i,
        );
        if (i < clusterProperties.MachinePools.MachinePoolCount) {
          CreateRosaWizardPage.addMachinePoolLink().click();
        }
      }
      CreateRosaWizardPage.selectComputeNodeType(clusterProperties.MachinePools.InstanceType);
      if (clusterProperties.ClusterAutoscaling.includes('Enabled')) {
        CreateRosaWizardPage.enableAutoScaling();
        CreateRosaWizardPage.setMinimumNodeCount(clusterProperties.MachinePools.MiniNodeCount);
        CreateRosaWizardPage.setMaximumNodeCount(clusterProperties.MachinePools.MaxNodeCount);
      } else {
        CreateRosaWizardPage.disabledAutoScaling();
        CreateRosaWizardPage.selectComputeNodeCount(clusterProperties.MachinePools.NodeCount);
      }
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it(`Step - Cluster Settings - configuration - cluster privacy for ${clusterName}`, () => {
      CreateRosaWizardPage.selectClusterPrivacy('Private');
      CreateRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      if (clusterProperties.ClusterPrivacy.includes('Public')) {
        CreateRosaWizardPage.selectMachinePoolPublicSubnet(
          qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools.PublicSubnetZone]
            .PUBLIC_SUBNET_NAME,
        );
      }
      if (clusterProperties.ClusterWideProxy.includes('Enabled')) {
        CreateRosaWizardPage.enableConfigureClusterWideProxy();
      }
      CreateRosaWizardPage.rosaNextButton().click();
    });

    if (clusterProperties.ClusterWideProxy.includes('Enabled')) {
      it(`Step - Cluster Settings - configuration - Cluster-wide Proxy for ${clusterName}`, () => {
        CreateRosaWizardPage.isClusterWideProxyScreen();
        CreateRosaWizardPage.httpProxyInput().type(clusterProperties.ClusterProxy.HttpProxy);
        CreateRosaWizardPage.httpsProxyInput().type(clusterProperties.ClusterProxy.HttpsProxy);
        CreateRosaWizardPage.noProxyDomainsInput().type(
          clusterProperties.ClusterProxy.NoProxyDomains,
        );
        CreateRosaWizardPage.rosaNextButton().click();
      });
    }
    it(`Step - Cluster Settings - CIDR Ranges - CIDR default valuesfor ${clusterName}`, () => {
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
      CreateRosaWizardPage.operatorRoleCommandInput()
        .invoke('val')
        .then((sometext) => cy.executeRosaCmd(`${sometext} --mode auto`));
      cy.executeRosaCmd(
        `rosa create oidc-provider --oidc-config-id "${clusterProperties.OidcConfigId}" --mode auto -y`,
      );
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it('Step - Cluster update - update statergies and its definitions', () => {
      CreateRosaWizardPage.isUpdatesScreen();
      if (clusterProperties.UpdateStrategy.includes('Recurring')) {
        CreateRosaWizardPage.recurringUpdateRadio().check({ force: true });
      } else {
        CreateRosaWizardPage.individualUpdateRadio().check({ force: true });
      }
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
        clusterProperties.MachinePools.InstanceType,
      );
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Autoscaling',
        clusterProperties.MachinePools.Autoscaling,
      );
      if (clusterProperties.ClusterAutoscaling.includes('Enabled')) {
        CreateRosaWizardPage.computeNodeRangeLabelValue().contains(
          `Minimum nodes per machine pool: ${clusterProperties.MachinePools.MiniNodeCount}`,
        );
        CreateRosaWizardPage.computeNodeRangeLabelValue().contains(
          `Maximum nodes per machine pool: ${clusterProperties.MachinePools.MaxNodeCount}`,
        );
      } else {
        CreateRosaWizardPage.isClusterPropertyMatchesValue(
          'Compute node count',
          parseInt(clusterProperties.MachinePools.NodeCount) *
            clusterProperties.MachinePools.MachinePoolCount,
        );
      }
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Install to selected VPC',
        qeInfrastructure.VPC_NAME,
      );
      let i = 1;
      for (; i <= clusterProperties.MachinePools.MachinePoolCount; i++) {
        CreateRosaWizardPage.machinePoolLabelValue()
          .contains(clusterProperties.MachinePools.AvailabilityZones[i - 1])
          .next()
          .contains(
            qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools.AvailabilityZones[i - 1]]
              .PRIVATE_SUBNET_NAME,
          );
      }
    });

    it('Step - Review and create : Networking definitions', () => {
      CreateRosaWizardPage.isClusterPropertyMatchesValue(
        'Cluster privacy',
        clusterProperties.ClusterPrivacy,
      );
      if (clusterProperties.ClusterPrivacy.includes('Public')) {
        CreateRosaWizardPage.isClusterPropertyMatchesValue(
          'Public subnet',
          qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools.AvailabilityZones[0]]
            .PUBLIC_SUBNET_NAME,
        );
      } else {
        CreateRosaWizardPage.isClusterPropertyMatchesValue('PrivateLink', 'Enabled');
      }
      if (clusterProperties.ClusterWideProxy.includes('Enabled')) {
        CreateRosaWizardPage.isClusterPropertyMatchesValue(
          'Cluster-wide proxy',
          clusterProperties.ClusterWideProxy,
        );
        CreateRosaWizardPage.isClusterPropertyMatchesValue(
          'HTTP proxy URL',
          clusterProperties.ClusterProxy.HttpProxy,
        );
        CreateRosaWizardPage.isClusterPropertyMatchesValue(
          'HTTPs proxy URL',
          clusterProperties.ClusterProxy.HttpsProxy,
        );
        CreateRosaWizardPage.isClusterPropertyMatchesValue(
          'No Proxy domains',
          clusterProperties.ClusterProxy.NoProxyDomains,
        );
      }
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
    });
  },
);
