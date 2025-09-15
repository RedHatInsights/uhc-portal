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
        CreateOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().check({ force: true });
        if (clusterProperties.FIPSCryptography.includes('Enabled')) {
          CreateOSDWizardPage.enableFIPSCryptographyCheckbox().check({ force: true });
        }
        if (clusterProperties.EncryptVolumesWithCustomKeys.includes('Enabled')) {
          if (gcpKeyRingLocation && gcpKeyRing && gcpKeyName && gcpKMSServiceAccount) {
            CreateOSDWizardPage.useCustomKMSKeyRadio().check({ force: true });
            CreateOSDWizardPage.selectKeylocation(gcpKeyRingLocation);
            CreateOSDWizardPage.selectKeyRing(gcpKeyRing);
            CreateOSDWizardPage.selectKeyName(gcpKeyName);
            CreateOSDWizardPage.kmsServiceAccountInput().type(gcpKMSServiceAccount);
          }
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
      CreateOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.installIntoExistingVpcCheckBox().check({ force: true });
      if (clusterProperties.ApplicationIngress.includes('Custom settings')) {
        CreateOSDWizardPage.applicationIngressCustomSettingsRadio().check({ force: true });
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
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - Cluster submission & overview definitions`, () => {
      CreateOSDWizardPage.createClusterButton().click();
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterProperties.ClusterName);
      ClusterDetailsPage.clusterInstallationHeader()
        .contains('Installing cluster')
        .should('be.visible');
    });
  },
);
