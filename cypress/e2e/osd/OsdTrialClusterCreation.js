import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';
import { Clusters } from '../../fixtures/osd/OsdTrialClusterProperties.json';

const QE_GCP = Cypress.env('QE_GCP_OSDCCSADMIN_JSON');
const awsAccountID = Cypress.env('QE_AWS_ID');
const awsAccessKey = Cypress.env('QE_AWS_ACCESS_KEY_ID');
const awsSecretKey = Cypress.env('QE_AWS_ACCESS_KEY_SECRET');

describe(`OSDTrial cluster creation tests(OCP-39415)`, { tags: ['smoke'] }, () => {
  beforeEach(() => {
    if (Cypress.currentTest.title.match(/Launch OSD.*cluster wizard/g)) {
      cy.visit('/create');
    }
  });

  Clusters.forEach((clusterProperties) => {
    it(`Launch OSD - ${clusterProperties.CloudProvider} cluster wizard`, () => {
      CreateOSDWizardPage.osdTrialCreateClusterButton().click();
      CreateOSDWizardPage.isCreateOSDPage();
    });

    it(`OSD - ${clusterProperties.CloudProvider} wizard - Billing model and its definitions`, () => {
      CreateOSDWizardPage.isBillingModelScreen();
      CreateOSDWizardPage.subscriptionTypeFreeTrialRadio().should('be.checked');
      CreateOSDWizardPage.infrastructureTypeClusterCloudSubscriptionRadio().should('be.checked');
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it(`OSD - ${clusterProperties.CloudProvider} wizard - Cluster Settings - Cloud provider definitions`, () => {
      CreateOSDWizardPage.isCloudProviderSelectionScreen();
      CreateOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      if (clusterProperties.CloudProvider.includes('GCP')) {
        CreateOSDWizardPage.serviceAccountButton().click();
        CreateOSDWizardPage.uploadGCPServiceAccountJSON(JSON.stringify(QE_GCP));
      } else {
        CreateOSDWizardPage.awsAccountIDInput().type(awsAccountID);
        CreateOSDWizardPage.awsAccessKeyInput().type(awsAccessKey);
        CreateOSDWizardPage.awsSecretKeyInput().type(awsSecretKey);
      }
      CreateOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD - ${clusterProperties.CloudProvider} wizard - Cluster Settings - Cluster details definitions`, () => {
      CreateOSDWizardPage.isClusterDetailsScreen();
      cy.get(CreateOSDWizardPage.clusterNameInput).type(clusterProperties.ClusterName).blur();
      CreateOSDWizardPage.selectRegion(clusterProperties.Region);
      CreateOSDWizardPage.singleZoneAvilabilityRadio().check();
      CreateOSDWizardPage.multiZoneAvilabilityRadio().check();
      CreateOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      if (clusterProperties.CloudProvider.includes('GCP')) {
        CreateOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      }
      CreateOSDWizardPage.enableAdditionalEtcdEncryption(true, true);
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD - ${clusterProperties.CloudProvider} wizard - Cluster Settings - Default machinepool definitions`, () => {
      CreateOSDWizardPage.isMachinePoolScreen();
      CreateOSDWizardPage.selectComputeNodeType(clusterProperties.MachinePools[0].InstanceType);
      CreateOSDWizardPage.selectComputeNodeCount(clusterProperties.MachinePools[0].NodeCount);
      CreateOSDWizardPage.addNodeLabelLink().click();
      CreateOSDWizardPage.addNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].Labels[0].Key,
        clusterProperties.MachinePools[0].Labels[0].Value,
      );
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD - ${clusterProperties.CloudProvider} wizard- cluster privacy definitions`, () => {
      CreateOSDWizardPage.isNetworkingScreen();
      CreateOSDWizardPage.selectClusterPrivacy('private');
      CreateOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD - ${clusterProperties.CloudProvider} wizard - Networking configuration - CIDR ranges definitions`, () => {
      CreateOSDWizardPage.isCIDRScreen();
      CreateOSDWizardPage.useCIDRDefaultValues(false);
      CreateOSDWizardPage.useCIDRDefaultValues(true);
      CreateOSDWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD - ${clusterProperties.CloudProvider} wizard - Cluster updates definitions`, () => {
      CreateOSDWizardPage.isUpdatesScreen();
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD - ${clusterProperties.CloudProvider} wizard - Review and create page and its definitions`, () => {
      CreateOSDWizardPage.isReviewScreen();
      CreateOSDWizardPage.subscriptionTypeValue().contains(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.infrastructureTypeValue().contains(clusterProperties.InfrastructureType);
      CreateOSDWizardPage.cloudProviderValue().contains(clusterProperties.CloudProvider);
      CreateOSDWizardPage.clusterNameValue().contains(clusterProperties.ClusterName);
      CreateOSDWizardPage.regionValue().contains(clusterProperties.Region.split(',')[0]);
      CreateOSDWizardPage.availabilityValue().contains(clusterProperties.Availability);
      if (clusterProperties.CloudProvider.includes('GCP')) {
        CreateOSDWizardPage.securebootSupportForShieldedVMsValue().contains(
          clusterProperties.SecureBootSupportForShieldedVMs,
        );
      }
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
      CreateOSDWizardPage.computeNodeCountValue().contains(
        clusterProperties.MachinePools[0].NodeCount,
      );
      CreateOSDWizardPage.computeNodeCountValue().contains(
        `${clusterProperties.MachinePools[0].NodeCount} (× 3 zones = ${clusterProperties.MachinePools[0].NodeCount * 3} compute nodes)`,
      );
      CreateOSDWizardPage.nodeLabelsValue().contains(
        `${clusterProperties.MachinePools[0].Labels[0].Key} = ${clusterProperties.MachinePools[0].Labels[0].Value}`,
      );
      CreateOSDWizardPage.clusterPrivacyValue().contains(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.installIntoExistingVpcValue().contains(
        clusterProperties.InstallIntoExistingVPC,
      );
      CreateOSDWizardPage.machineCIDRValue().contains(clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRValue().contains(clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRValue().contains(clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixValue().contains(clusterProperties.HostPrefix);
      CreateOSDWizardPage.applicationIngressValue().contains(clusterProperties.ApplicationIngress);
      CreateOSDWizardPage.updateStratergyValue().contains(clusterProperties.UpdateStrategy);
      CreateOSDWizardPage.nodeDrainingValue().contains(clusterProperties.NodeDraining);
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
      ClusterDetailsPage.clusterRegionLabelValue().contains(clusterProperties.Region.split(',')[0]);
      ClusterDetailsPage.clusterAvailabilityLabelValue().contains(clusterProperties.Availability);
      ClusterDetailsPage.clusterMachineCIDRLabelValue().contains(clusterProperties.MachineCIDR);
      ClusterDetailsPage.clusterServiceCIDRLabelValue().contains(clusterProperties.ServiceCIDR);
      ClusterDetailsPage.clusterPodCIDRLabelValue().contains(clusterProperties.PodCIDR);
      ClusterDetailsPage.clusterHostPrefixLabelValue().contains(
        clusterProperties.HostPrefix.replace('/', ''),
      );
      ClusterDetailsPage.clusterInfrastructureBillingModelValue().contains(
        clusterProperties.InfrastructureType,
      );
      ClusterDetailsPage.clusterSubscriptionBillingModelValue().contains(
        clusterProperties.SubscriptionType.replace(/.$/, '').replace(' (', ', '),
      );
      if (clusterProperties.CloudProvider.includes('GCP')) {
        ClusterDetailsPage.clusterSecureBootSupportForShieldedVMsValue().contains(
          clusterProperties.SecureBootSupportForShieldedVMs,
        );
      } else {
        ClusterDetailsPage.clusterIMDSValue().contains(clusterProperties.InstanceMetadataService);
        ClusterDetailsPage.clusterInfrastructureAWSaccountLabelValue().contains(awsAccountID);
      }
    });
    it(`Delete OSD ${clusterProperties.CloudProvider}  cluster`, () => {
      ClusterDetailsPage.actionsDropdownToggle().click();
      ClusterDetailsPage.deleteClusterDropdownItem().click();
      ClusterDetailsPage.deleteClusterNameInput().clear().type(clusterProperties.ClusterName);
      ClusterDetailsPage.deleteClusterConfirm().click();
      ClusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  });
});
