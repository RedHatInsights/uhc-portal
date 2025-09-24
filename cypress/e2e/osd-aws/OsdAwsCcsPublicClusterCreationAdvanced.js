import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';
import CreateClusterPage from '../../pageobjects/CreateCluster.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';

const clusterProfiles = require('../../fixtures/osd-aws/OsdAwsCcsCreatePublicCluster.json');
const clusterProperties = clusterProfiles['osdccs-aws-public-advanced']['day1-profile'];
const region = clusterProperties.Region.split(',')[0];
const qeInfrastructure = Cypress.env('QE_INFRA_REGIONS')[region][0];

const clusterName = clusterProperties.ClusterName;
const awsAccountID = Cypress.env('QE_AWS_ID');
const awsAccessKey = Cypress.env('QE_AWS_ACCESS_KEY_ID');
const awsSecretKey = Cypress.env('QE_AWS_ACCESS_KEY_SECRET');

const selectZones = clusterProperties.MachinePools[0].AvailabilityZones;
const securityGroups = qeInfrastructure.SECURITY_GROUPS_NAME;

describe(
  'OSD AWS CCS Cluster - Create public advanced AWS CCS cluster - OCP-21100, OCP-42745',
  { tags: ['day1', 'osd', 'aws', 'public', 'advanced'] },
  () => {
    before(() => {
      cy.visit('/create');
    });
    it('Launch OSD AWS CCS cluster wizard', () => {
      CreateClusterPage.isCreateClusterPage();
      CreateOSDWizardPage.osdCreateClusterButton().click();
      CreateOSDWizardPage.isCreateOSDPage();
    });

    it('Step OSD - AWS CCS wizard Billing model', () => {
      CreateOSDWizardPage.isBillingModelScreen();
      CreateOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it('Step OSD - AWS CCS wizard - Cluster Settings - Select cloud provider definitions', () => {
      CreateOSDWizardPage.isCloudProviderSelectionScreen();
      CreateOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      CreateOSDWizardPage.acknowlegePrerequisitesCheckbox().check();

      CreateOSDWizardPage.awsAccountIDInput().type(awsAccountID);
      CreateOSDWizardPage.awsAccessKeyInput().type(awsAccessKey);
      CreateOSDWizardPage.awsSecretKeyInput().type(awsSecretKey);

      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it('Step OSD - AWS CCS wizard - Cluster Settings - Select Cluster details definitions', () => {
      CreateOSDWizardPage.isClusterDetailsScreen();
      CreateOSDWizardPage.setClusterName(clusterName);
      CreateOSDWizardPage.closePopoverDialogs();

      CreateOSDWizardPage.multiZoneAvilabilityRadio().check();
      CreateOSDWizardPage.selectRegion(clusterProperties.Region);

      CreateOSDWizardPage.enableUserWorkloadMonitoringCheckbox().should('be.checked');
      CreateOSDWizardPage.advancedEncryptionLink().click();
      CreateOSDWizardPage.useDefaultKMSKeyRadio().click();

      CreateOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
      CreateOSDWizardPage.enableFIPSCryptographyCheckbox().check();
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it('Step OSD - AWS CCS wizard - Cluster Settings - Select machinepool definitions', () => {
      CreateOSDWizardPage.isMachinePoolScreen();
      CreateOSDWizardPage.selectComputeNodeType(clusterProperties.MachinePools[0].InstanceType);
      CreateOSDWizardPage.enableAutoscalingCheckbox().check({ force: true });
      CreateOSDWizardPage.setMinimumNodeCount(clusterProperties.MachinePools[0].MinimumNodeCount);
      CreateOSDWizardPage.setMaximumNodeCount(clusterProperties.MachinePools[0].MaximumNodeCount);
      CreateOSDWizardPage.useBothIMDSv1AndIMDSv2Radio().should('be.checked');
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it('Step OSD - AWS CCS wizard - Networking configuration - Select cluster privacy definitions', () => {
      CreateOSDWizardPage.isNetworkingScreen();
      CreateOSDWizardPage.clusterPrivacyPublicRadio().should('be.checked');
      CreateOSDWizardPage.installIntoExistingVpcCheckBox().check();
    });

    it('Step OSD - AWS CCS wizard - Networking configuration - Application ingress definitions', () => {
      if (clusterProperties.CustomApplicationIngress.includes('Custom settings')) {
        CreateOSDWizardPage.applicationIngressCustomSettingsRadio().check();
        CreateOSDWizardPage.applicationIngressRouterSelectorsInput().type(
          clusterProperties.RouteSelector.KeyValue,
        );
        CreateOSDWizardPage.applicationIngressExcludedNamespacesInput().type(
          clusterProperties.ExcludedNamespaces.Values,
        );

        CreateOSDWizardPage.applicationIngressNamespaceOwnershipPolicyRadio().should('be.checked');
        CreateOSDWizardPage.applicationIngressWildcardPolicyDisallowedRadio().should(
          'not.be.checked',
        );
      } else {
        CreateOSDWizardPage.applicationIngressDefaultSettingsRadio().should('be.checked');
      }
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it('Step OSD - AWS CCS wizard - Networking configuration - Select VPC and subnet definitions', () => {
      CreateOSDWizardPage.isVPCSubnetScreen();
      CreateOSDWizardPage.waitForVPCRefresh();
      CreateOSDWizardPage.selectVPC(qeInfrastructure.VPC_NAME);

      selectZones.forEach((value) => {
        CreateOSDWizardPage.selectSubnetAvailabilityZone(value);
      });

      let i = 1;

      for (; i <= clusterProperties.MachinePools[0].AvailabilityZonesCount; i++) {
        CreateOSDWizardPage.selectPrivateSubnet(
          i - 1,
          qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools[0].AvailabilityZones[i - 1]]
            .PRIVATE_SUBNET_NAME,
        );
        CreateOSDWizardPage.selectPublicSubnet(
          i - 1,
          qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools[0].AvailabilityZones[i - 1]]
            .PUBLIC_SUBNET_NAME,
        );
      }
    });

    it('Step OSD - AWS CCS wizard - Networking configuration - Select security group definitions', () => {
      CreateOSDWizardPage.additionalSecurityGroupsLink().click();
      // Always check the "Apply same security groups to all node types" checkbox
      cy.get('input[name="securityGroups.applyControlPlaneToAll"]').check({ force: true });

      if (true) {
        // Since we're checking the box, always use the simplified flow
        securityGroups.forEach((value) => {
          CreateOSDWizardPage.selectAdditionalSecurityGroups(value);
        });
      } else {
        cy.get('span')
          .contains('Control plane nodes')
          .parents('div[data-testtag="text-securitygroups"]')
          .within(() => {
            CreateOSDWizardPage.selectAdditionalSecurityGroups(
              qeInfrastructure.SECURITY_GROUPS_NAME[0],
            );
          });
        cy.get('span')
          .contains('Infrastructure nodes')
          .parents('div[data-testtag="text-securitygroups"]')
          .within(() => {
            CreateOSDWizardPage.selectAdditionalSecurityGroups(
              qeInfrastructure.SECURITY_GROUPS_NAME[1],
            );
          });
        securityGroups.forEach((value) => {
          cy.get('span')
            .contains('Worker nodes')
            .parents('div[data-testtag="text-securitygroups"]')
            .within(() => {
              CreateOSDWizardPage.selectAdditionalSecurityGroups(value);
            });
        });
      }

      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it(`Step OSD - AWS CCS wizard - CIDR Ranges - Select CIDR default values`, () => {
      CreateOSDWizardPage.cidrDefaultValuesCheckBox().should('be.checked');
      CreateOSDWizardPage.useCIDRDefaultValues(false);
      CreateOSDWizardPage.useCIDRDefaultValues(true);
      CreateOSDWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it('Step OSD - AWS CCS wizard - Cluster update - Select update strategies and its definitions', () => {
      CreateOSDWizardPage.isUpdatesScreen();
      if (clusterProperties.UpdateStrategy.includes('Recurring')) {
        CreateOSDWizardPage.updateStrategyRecurringRadio().check({ force: true });
      } else {
        CreateOSDWizardPage.updateStrategyIndividualRadio().check({ force: true });
      }
      CreateOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);

      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it('Step OSD - AWS CCS wizard - Review billing definitions', () => {
      CreateOSDWizardPage.isReviewScreen();
      CreateOSDWizardPage.subscriptionTypeValue().contains(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.infrastructureTypeValue().contains(clusterProperties.InfrastructureType);
    });

    it('Step OSD - AWS CCS wizard - Review and create : Cluster Settings definitions', () => {
      CreateOSDWizardPage.clusterNameValue().contains(clusterProperties.ClusterName);
      CreateOSDWizardPage.regionValue().contains(clusterProperties.Region.split(',')[0]);
      CreateOSDWizardPage.availabilityValue().contains(clusterProperties.Availability);
      CreateOSDWizardPage.userWorkloadMonitoringValue().contains(
        clusterProperties.UserWorkloadMonitoring,
      );
      CreateOSDWizardPage.encryptVolumesWithCustomerkeysValue().contains(
        clusterProperties.EncryptVolumesWithCustomerKeys,
      );
      CreateOSDWizardPage.additionalEtcdEncryptionValue().contains(
        clusterProperties.AdditionalEncryption,
      );
      CreateOSDWizardPage.fipsCryptographyValue().contains(clusterProperties.FIPSCryptography);
    });

    it('Step OSD - AWS CCS wizard - Review and create : Machine pool definitions', () => {
      CreateOSDWizardPage.nodeInstanceTypeValue().contains(
        clusterProperties.MachinePools[0].InstanceType,
      );
      CreateOSDWizardPage.autoscalingValue().contains(
        clusterProperties.MachinePools[0].Autoscaling,
      );

      CreateOSDWizardPage.computeNodeRangeValue().contains(
        `Minimum nodes per zone: ${clusterProperties.MachinePools[0].MinimumNodeCount}`,
      );
      CreateOSDWizardPage.computeNodeRangeValue().contains(
        `Maximum nodes per zone: ${clusterProperties.MachinePools[0].MaximumNodeCount}`,
      );
    });

    it('Step OSD - AWS CCS wizard - Review and create : Networking definitions', () => {
      CreateOSDWizardPage.clusterPrivacyValue().contains(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.installIntoExistingVpcValue().contains(
        clusterProperties.InstallIntoExistingVPC,
      );
    });

    it('Step OSD - AWS CCS wizard - Review and create : Application ingress definitions', () => {
      CreateOSDWizardPage.applicationIngressValue().contains(
        clusterProperties.CustomApplicationIngress,
      );
      CreateOSDWizardPage.routeSelectorsValue().contains(clusterProperties.RouteSelector.KeyValue);
      CreateOSDWizardPage.excludedNamespacesValue().contains(
        clusterProperties.ExcludedNamespaces.Values,
      );
      CreateOSDWizardPage.wildcardPolicyValue().contains(clusterProperties.WildcardPolicy);
      CreateOSDWizardPage.namespaceOwnershipValue().contains(
        clusterProperties.NamespaceOwnershipPolicy,
      );
    });

    it('Step OSD - AWS CCS wizard - Review and create : VPC and subnet definitions', () => {
      selectZones.forEach((value) => {
        CreateOSDWizardPage.vpcSubnetSettingsValue().next().contains(value);
      });
      let i = 1;
      for (; i <= clusterProperties.MachinePools[0].AvailabilityZonesCount; i++) {
        CreateOSDWizardPage.vpcSubnetSettingsValue()
          .next()
          .contains(
            qeInfrastructure.SUBNETS.ZONES[
              clusterProperties.MachinePools[0].AvailabilityZones[i - 1]
            ].PRIVATE_SUBNET_NAME,
          );
        CreateOSDWizardPage.vpcSubnetSettingsValue()
          .next()
          .contains(
            qeInfrastructure.SUBNETS.ZONES[
              clusterProperties.MachinePools[0].AvailabilityZones[i - 1]
            ].PUBLIC_SUBNET_NAME,
          );
      }
    });

    it('Step OSD - AWS CCS wizard - Review and create : Security group definitions', () => {
      // Since we checked "Apply same security groups to all node types" checkbox,
      // the review screen will show unified security groups, not separate sections
      securityGroups.forEach((value) => {
        CreateOSDWizardPage.securityGroupsValue().contains(value);
      });
    });

    it('Step OSD - AWS CCS wizard - Review and create : CIDR definitions', () => {
      CreateOSDWizardPage.machineCIDRValue().contains(clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRValue().contains(clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRValue().contains(clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixValue().contains(clusterProperties.HostPrefix);
    });

    it('Step OSD - AWS CCS wizard - Review and create : Update definitions', () => {
      CreateOSDWizardPage.updateStratergyValue().contains(clusterProperties.UpdateStrategy);
      CreateOSDWizardPage.nodeDrainingValue(
        `${clusterProperties.NodeDraining} × 60 = ${clusterProperties.NodeDraining} minutes`,
      );
    });

    it('Step OSD - AWS CCS wizard - Cluster submission & overview definitions', () => {
      CreateOSDWizardPage.createClusterButton().click();
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterProperties.ClusterName);
      ClusterDetailsPage.clusterInstallationHeader()
        .contains('Installing cluster')
        .should('be.visible');
      ClusterDetailsPage.clusterInstallationExpectedText()
        .contains('Cluster creation usually takes 30 to 60 minutes to complete')
        .should('be.visible');
      ClusterDetailsPage.downloadOcCliLink().contains('Download OC CLI').should('be.visible');
      ClusterDetailsPage.clusterDetailsPageRefresh();
      ClusterDetailsPage.checkInstallationStepStatus('Account setup');
      ClusterDetailsPage.checkInstallationStepStatus('Network settings');
      ClusterDetailsPage.checkInstallationStepStatus('DNS setup');
      ClusterDetailsPage.checkInstallationStepStatus('Cluster installation');
      ClusterDetailsPage.clusterTypeLabelValue().contains(clusterProperties.Type);
      ClusterDetailsPage.clusterRegionLabelValue().contains(clusterProperties.Region.split(',')[0]);
      ClusterDetailsPage.clusterAvailabilityLabelValue().contains(clusterProperties.Availability);
      ClusterDetailsPage.clusterMachineCIDRLabelValue().contains(clusterProperties.MachineCIDR);
      ClusterDetailsPage.clusterServiceCIDRLabelValue().contains(clusterProperties.ServiceCIDR);
      ClusterDetailsPage.clusterPodCIDRLabelValue().contains(clusterProperties.PodCIDR);
      ClusterDetailsPage.clusterHostPrefixLabelValue().contains(
        clusterProperties.HostPrefix.replace('/', ''),
      );
      ClusterDetailsPage.clusterSubscriptionBillingModelValue().contains(
        clusterProperties.SubscriptionBillingModel,
      );
      ClusterDetailsPage.clusterInfrastructureBillingModelValue().contains(
        clusterProperties.InfrastructureType,
      );
    });
  },
);
