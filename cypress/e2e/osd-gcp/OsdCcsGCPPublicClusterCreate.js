import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';

const clusterProfiles = require('../../fixtures/osd-gcp/OsdCcsGCPClusterCreate.json');
const clusterProperties =
  clusterProfiles['osd-ccs-gcp-public-singlezone-serviceaccount']['day1-profile'];
const QE_GCP = Cypress.env('QE_GCP_OSDCCSADMIN_JSON');

describe(
  'OSD GCP (service account) public default cluster creation tests()',
  { tags: ['day1', 'osd', 'ccs', 'gcp', 'public', 'serviceaccount', 'singlezone'] },
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
      CreateOSDWizardPage.setClusterName(clusterProperties.ClusterName);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.singleZoneAvilabilityRadio().should('be.checked');
      CreateOSDWizardPage.selectRegion(clusterProperties.Region);
      if (clusterProperties.CloudProvider.includes('GCP')) {
        CreateOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      }
      CreateOSDWizardPage.enableUserWorkloadMonitoringCheckbox().should('be.checked');
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider} wizard - Cluster Settings - Default machinepool definitions`, () => {
      CreateOSDWizardPage.isMachinePoolScreen();
      CreateOSDWizardPage.selectComputeNodeType(clusterProperties.MachinePools[0].InstanceType);

      CreateOSDWizardPage.selectComputeNodeCount(clusterProperties.MachinePools[0].NodeCount);
      CreateOSDWizardPage.enableAutoscalingCheckbox().should('not.be.checked');
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - Networking configuration - cluster privacy definitions`, () => {
      CreateOSDWizardPage.isNetworkingScreen();
      CreateOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD ${clusterProperties.CloudProvider}  wizard - CIDR configuration - cidr definitions`, () => {
      CreateOSDWizardPage.isCIDRScreen();
      CreateOSDWizardPage.cidrDefaultValuesCheckBox().should('be.checked');
      CreateOSDWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
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
        clusterProperties.EncryptVolumesWithCustomerKeys,
      );
      CreateOSDWizardPage.additionalEtcdEncryptionValue().contains(
        clusterProperties.AdditionalEncryption,
      );
      CreateOSDWizardPage.fipsCryptographyValue().contains(clusterProperties.FIPSCryptography);
      CreateOSDWizardPage.nodeInstanceTypeValue().contains(
        clusterProperties.MachinePools[0].InstanceType,
      );
      CreateOSDWizardPage.autoscalingValue().contains(
        clusterProperties.MachinePools[0].Autoscaling,
      );
      CreateOSDWizardPage.computeNodeCountValue().contains(
        clusterProperties.MachinePools[0].NodeCount,
      );

      CreateOSDWizardPage.clusterPrivacyValue().contains(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.installIntoExistingVpcValue().contains(
        clusterProperties.InstallIntoExistingVPC,
      );
      CreateOSDWizardPage.applicationIngressValue().contains(clusterProperties.ApplicationIngress);

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
