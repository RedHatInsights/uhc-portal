import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';

const clusterProfiles = require('../../fixtures/osd-gcp/OsdCcsGCPClusterCreate.json');
const clusterProperties =
  clusterProfiles['osd-ccs-gcp-public-multizone-serviceaccount']['day1-profile'];
const QE_GCP = Cypress.env('QE_GCP_OSDCCSADMIN_JSON');
const gcpKeyRingLocation = Cypress.env('QE_GCP_KEY_RING_LOCATION');
const gcpKeyRing = Cypress.env('QE_GCP_KEY_RING');
const gcpKeyName = Cypress.env('QE_GCP_KEY_NAME');
const gcpKMSServiceAccount = Cypress.env('QE_GCP_KMS_SERVICE_ACCOUNT');

describe(
  'OSD GCP (service account) public advanced cluster creation tests()',
  { tags: ['day1', 'osd', 'ccs', 'gcp', 'public', 'serviceaccount', 'multizone'] },
  () => {
    before(() => {
      cy.visit('/create');
    });

    it(`Launch OSD - ${clusterProperties.CloudProvider} cluster wizard`, () => {
      CreateOSDWizardPage.osdCreateClusterButton().click();
      CreateOSDWizardPage.isCreateOSDPage();
    });

    it(`OSD ${clusterProperties.CloudProvider} wizard - Billing model and its definitions`, () => {
      CreateOSDWizardPage.isBillingModelScreen();
      CreateOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio().should('be.checked');
      CreateOSDWizardPage.infrastructureTypeClusterCloudSubscriptionRadio().check({
        force: true,
      });
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider} wizard - Cluster Settings - Cloud provider definitions`, () => {
      CreateOSDWizardPage.isCloudProviderSelectionScreen();
      CreateOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      if (clusterProperties.AuthenticationType.includes('Service Account')) {
        CreateOSDWizardPage.serviceAccountButton().click();
        CreateOSDWizardPage.uploadGCPServiceAccountJSON(JSON.stringify(QE_GCP));
      } else {
        CreateOSDWizardPage.workloadIdentityFederationButton().click();
        CreateOSDWizardPage.selectWorkloadIdentityConfiguration(Cypress.env('QE_GCP_WIF_CONFIG'));
      }
      CreateOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider} wizard - Cluster Settings - Cluster details definitions`, () => {
      CreateOSDWizardPage.isClusterDetailsScreen();
      CreateOSDWizardPage.createCustomDomainPrefixCheckbox().scrollIntoView().check();
      CreateOSDWizardPage.setClusterName(clusterProperties.ClusterName);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.setDomainPrefix(clusterProperties.DomainPrefix);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      CreateOSDWizardPage.selectRegion(clusterProperties.Region);
      if (clusterProperties.CloudProvider.includes('GCP')) {
        CreateOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      }
      CreateOSDWizardPage.enableUserWorkloadMonitoringCheckbox().should('be.checked');
      if (clusterProperties.AdditionalEncryption.includes('Enabled')) {
        CreateOSDWizardPage.advancedEncryptionLink().click();
        CreateOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
        if (clusterProperties.FIPSCryptography.includes('Enabled')) {
          CreateOSDWizardPage.enableFIPSCryptographyCheckbox().check();
        }
        if (clusterProperties.EncryptVolumesWithCustomKeys.includes('Enabled')) {
          CreateOSDWizardPage.useCustomKMSKeyRadio().check();
          CreateOSDWizardPage.selectKeylocation(gcpKeyRingLocation);
          CreateOSDWizardPage.selectKeyRing(gcpKeyRing);
          CreateOSDWizardPage.selectKeyName(gcpKeyName);
          CreateOSDWizardPage.kmsServiceAccountInput().type(gcpKMSServiceAccount);
        }
      }
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider} wizard - Cluster Settings - Default machinepool definitions`, () => {
      CreateOSDWizardPage.isMachinePoolScreen();
      CreateOSDWizardPage.selectComputeNodeType(clusterProperties.MachinePools.InstanceType);
      if (clusterProperties.MachinePools.Autoscaling.includes('Enabled')) {
        CreateOSDWizardPage.enableAutoscalingCheckbox().check();
        CreateOSDWizardPage.setMinimumNodeCount(clusterProperties.MachinePools.MinimumNodeCount);
        CreateOSDWizardPage.setMaximumNodeCount(clusterProperties.MachinePools.MaximumNodeCount);
      } else {
        CreateOSDWizardPage.enableAutoscalingCheckbox().should('not.be.checked');
        CreateOSDWizardPage.selectComputeNodeCount(clusterProperties.MachinePools.NodeCount);
      }
      if (clusterProperties.MachinePools.hasOwnProperty('NodeLabel')) {
        CreateOSDWizardPage.addNodeLabelLink().click();
        CreateOSDWizardPage.addNodeLabelKeyAndValue(
          clusterProperties.MachinePools.NodeLabel[0].Key,
          clusterProperties.MachinePools.NodeLabel[0].Value,
          0,
        );
      }
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - Networking configuration - cluster privacy definitions`, () => {
      CreateOSDWizardPage.isNetworkingScreen();
      // CreateOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.installIntoExistingVpcCheckBox().check();
      if (clusterProperties.ApplicationIngress.includes('Custom settings')) {
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
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - Networking configuration- VPC and subnet definitions`, () => {
      CreateOSDWizardPage.isVPCSubnetScreen();
      CreateOSDWizardPage.selectGcpVPC(Cypress.env('QE_INFRA_GCP')['VPC_NAME']);
      CreateOSDWizardPage.selectControlPlaneSubnetName(
        Cypress.env('QE_INFRA_GCP')['CONTROLPLANE_SUBNET'],
      );
      CreateOSDWizardPage.selectComputeSubnetName(Cypress.env('QE_INFRA_GCP')['COMPUTE_SUBNET']);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - CIDR configuration - cidr definitions`, () => {
      CreateOSDWizardPage.isCIDRScreen();
      CreateOSDWizardPage.cidrDefaultValuesCheckBox().uncheck();
      CreateOSDWizardPage.machineCIDRInput().clear().type(clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - Cluster updates definitions`, () => {
      CreateOSDWizardPage.isUpdatesScreen();
      CreateOSDWizardPage.updateStrategyIndividualRadio().should('be.checked');
      CreateOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - Review and create page and its definitions`, () => {
      CreateOSDWizardPage.isReviewScreen();
      CreateOSDWizardPage.subscriptionTypeValue().contains(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.infrastructureTypeValue().contains(clusterProperties.InfrastructureType);
      CreateOSDWizardPage.cloudProviderValue().contains(clusterProperties.CloudProvider);
      CreateOSDWizardPage.authenticationTypeValue().contains(clusterProperties.AuthenticationType);
      CreateOSDWizardPage.clusterNameValue().contains(clusterProperties.ClusterName);
      CreateOSDWizardPage.regionValue().contains(clusterProperties.Region.split(',')[0]);
      CreateOSDWizardPage.availabilityValue().contains(clusterProperties.Availability);
      CreateOSDWizardPage.securebootSupportForShieldedVMsValue().contains(
        clusterProperties.SecureBootSupportForShieldedVMs,
      );

      CreateOSDWizardPage.userWorkloadMonitoringValue().contains(
        clusterProperties.UserWorkloadMonitoring,
      );
      CreateOSDWizardPage.encryptVolumesWithCustomerkeysValue().contains(
        clusterProperties.EncryptVolumesWithCustomKeys,
      );
      CreateOSDWizardPage.additionalEtcdEncryptionValue().contains(
        clusterProperties.AdditionalEncryption,
      );
      CreateOSDWizardPage.fipsCryptographyValue().contains(clusterProperties.FIPSCryptography);

      CreateOSDWizardPage.nodeInstanceTypeValue().contains(
        clusterProperties.MachinePools.InstanceType,
      );
      CreateOSDWizardPage.autoscalingValue().contains(clusterProperties.MachinePools.Autoscaling);

      CreateOSDWizardPage.computeNodeRangeValue().contains(
        `Minimum nodes per zone: ${clusterProperties.MachinePools.MinimumNodeCount}`,
      );
      CreateOSDWizardPage.computeNodeRangeValue().contains(
        `Maximum nodes per zone: ${clusterProperties.MachinePools.MaximumNodeCount}`,
      );

      CreateOSDWizardPage.clusterPrivacyValue().contains(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.installIntoExistingVpcValue().contains(
        clusterProperties.InstallIntoExistingVPC,
      );
      CreateOSDWizardPage.applicationIngressValue().contains(clusterProperties.ApplicationIngress);
      CreateOSDWizardPage.routeSelectorsValue().contains(clusterProperties.RouteSelector.KeyValue);
      CreateOSDWizardPage.excludedNamespacesValue().contains(
        clusterProperties.ExcludedNamespaces.Values,
      );
      CreateOSDWizardPage.wildcardPolicyValue().contains(clusterProperties.WildcardPolicy);
      CreateOSDWizardPage.namespaceOwnershipValue().contains(
        clusterProperties.NamespaceOwnershipPolicy,
      );
      CreateOSDWizardPage.machineCIDRValue().contains(clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRValue().contains(clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRValue().contains(clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixValue().contains(clusterProperties.HostPrefix);
      CreateOSDWizardPage.applicationIngressValue().contains(clusterProperties.ApplicationIngress);

      CreateOSDWizardPage.updateStratergyValue().contains(clusterProperties.UpdateStrategy);
      CreateOSDWizardPage.nodeDrainingValue(
        `${clusterProperties.NodeDraining} × 60 = ${clusterProperties.NodeDraining} minutes`,
      );
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - Cluster submission & overview definitions`, () => {
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
    });
  },
);
