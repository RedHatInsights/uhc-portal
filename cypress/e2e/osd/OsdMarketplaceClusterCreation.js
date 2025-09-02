import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';
import { Clusters } from '../../fixtures/osd/OsdMarketplaceClusterProperties.json';

const QE_GCP = Cypress.env('QE_GCP_OSDCCSADMIN_JSON');

describe('OSD Marketplace cluster creation tests(OCP-67514)', { tags: ['smoke'] }, () => {
  beforeEach(() => {
    if (Cypress.currentTest.title.match(/Launch OSD.*cluster wizard/g)) {
      cy.visit('/create');
    }
  });
  Clusters.forEach((clusterProperties) => {
    let authType = clusterProperties.CloudProvider.includes('Google Cloud Platform')
      ? `-${clusterProperties.AuthenticationType}`
      : '';
    let isPscEnabled =
      clusterProperties.hasOwnProperty('UsePrivateServiceConnect') &&
      clusterProperties.UsePrivateServiceConnect.includes('Enabled')
        ? 'PrivateServiceConnect'
        : '';
    it(`Launch OSD - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} cluster wizard`, () => {
      CreateOSDWizardPage.osdCreateClusterButton().click();
      CreateOSDWizardPage.isCreateOSDPage();
    });

    it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Billing model and its definitions`, () => {
      CreateOSDWizardPage.isBillingModelScreen();
      CreateOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.selectMarketplaceSubscription(clusterProperties.Marketplace);
      CreateOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Cluster Settings - Cloud provider definitions`, () => {
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
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });

    it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Cluster Settings - Cluster details definitions`, () => {
      CreateOSDWizardPage.isClusterDetailsScreen();
      cy.get(CreateOSDWizardPage.clusterNameInput).type(clusterProperties.ClusterName);
      CreateOSDWizardPage.hideClusterNameValidation();
      CreateOSDWizardPage.selectRegion(clusterProperties.Region);
      if (clusterProperties.hasOwnProperty('Version')) {
        CreateOSDWizardPage.selectVersion(clusterProperties.Version);
      }
      CreateOSDWizardPage.singleZoneAvilabilityRadio().check();
      CreateOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      CreateOSDWizardPage.enableAdditionalEtcdEncryption(true, true);
      CreateOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : Cluster Settings - Default machinepool definitions`, () => {
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
    it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Networking configuration - cluster privacy definitions`, () => {
      CreateOSDWizardPage.isNetworkingScreen();
      CreateOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      if (
        clusterProperties.ClusterPrivacy.includes('Private') &&
        clusterProperties.CloudProvider.includes('GCP')
      ) {
        CreateOSDWizardPage.installIntoExistingVpcCheckBox().should('be.checked');
        CreateOSDWizardPage.usePrivateServiceConnectCheckBox().should('be.checked');
      }
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    if (
      clusterProperties.ClusterPrivacy.includes('Private') &&
      clusterProperties.UsePrivateServiceConnect.includes('Enabled')
    ) {
      it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : VPC Settings definitions`, () => {
        CreateOSDWizardPage.isVPCSubnetScreen();
        CreateOSDWizardPage.selectGcpVPC(Cypress.env('QE_INFRA_GCP')['PSC_INFRA']['VPC_NAME']);
        CreateOSDWizardPage.selectControlPlaneSubnetName(
          Cypress.env('QE_INFRA_GCP')['PSC_INFRA']['CONTROLPLANE_SUBNET'],
        );
        CreateOSDWizardPage.selectComputeSubnetName(
          Cypress.env('QE_INFRA_GCP')['PSC_INFRA']['COMPUTE_SUBNET'],
        );
        CreateOSDWizardPage.selectPrivateServiceConnectSubnetName(
          Cypress.env('QE_INFRA_GCP')['PSC_INFRA']['PRIVATE_SERVICE_CONNECT_SUBNET'],
        );
        CreateOSDWizardPage.wizardNextButton().click();
      });
    }
    it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : Networking configuration - CIDR ranges definitions`, () => {
      CreateOSDWizardPage.isCIDRScreen();
      CreateOSDWizardPage.useCIDRDefaultValues(false);
      CreateOSDWizardPage.useCIDRDefaultValues(true);
      CreateOSDWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Cluster updates definitions`, () => {
      CreateOSDWizardPage.isUpdatesScreen();
      cy.get(CreateOSDWizardPage.primaryButton).click();
    });
    it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : Review and create page definitions`, () => {
      CreateOSDWizardPage.isReviewScreen();
      CreateOSDWizardPage.subscriptionTypeValue().contains(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.infrastructureTypeValue().contains(clusterProperties.InfrastructureType);
      CreateOSDWizardPage.cloudProviderValue().contains(clusterProperties.CloudProvider);

      CreateOSDWizardPage.authenticationTypeValue().contains(clusterProperties.AuthenticationType);
      if (clusterProperties.AuthenticationType.includes('Workload Identity Federation')) {
        CreateOSDWizardPage.wifConfigurationValue().contains(Cypress.env('QE_GCP_WIF_CONFIG'));
      }
      CreateOSDWizardPage.clusterNameValue().contains(clusterProperties.ClusterName);
      CreateOSDWizardPage.regionValue().contains(clusterProperties.Region.split(',')[0]);
      CreateOSDWizardPage.availabilityValue().contains(clusterProperties.Availability);
      CreateOSDWizardPage.securebootSupportForShieldedVMsValue().contains(
        clusterProperties.SecureBootSupportForShieldedVMs,
      );
      CreateOSDWizardPage.userWorkloadMonitoringValue().contains(
        clusterProperties.UserWorkloadMonitoring,
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
        `${clusterProperties.MachinePools[0].NodeCount} (× 3 zones = ${clusterProperties.MachinePools[0].NodeCount * 3} compute nodes)`,
      );

      CreateOSDWizardPage.nodeLabelsValue().contains(
        `${clusterProperties.MachinePools[0].Labels[0].Key} = ${clusterProperties.MachinePools[0].Labels[0].Value}`,
      );
      CreateOSDWizardPage.clusterPrivacyValue().contains(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.installIntoExistingVpcValue().contains(
        clusterProperties.InstallIntoExistingVPC,
      );
      if (clusterProperties.hasOwnProperty('UsePrivateServiceConnect')) {
        CreateOSDWizardPage.privateServiceConnectValue().contains(
          clusterProperties.UsePrivateServiceConnect,
        );
      }
      CreateOSDWizardPage.machineCIDRValue().contains(clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRValue().contains(clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRValue().contains(clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixValue().contains(clusterProperties.HostPrefix);
      CreateOSDWizardPage.applicationIngressValue().contains(clusterProperties.ApplicationIngress);
      CreateOSDWizardPage.updateStratergyValue().contains(clusterProperties.UpdateStrategy);
      CreateOSDWizardPage.nodeDrainingValue().contains(clusterProperties.NodeDraining);
    });

    it(`OSD wizard -  ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : Cluster submission & overview definitions`, () => {
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
        `On-demand via ${clusterProperties.Marketplace}`,
      );
      ClusterDetailsPage.clusterInfrastructureBillingModelValue().contains(
        clusterProperties.InfrastructureType,
      );
      ClusterDetailsPage.clusterSecureBootSupportForShieldedVMsValue().contains(
        clusterProperties.SecureBootSupportForShieldedVMs,
      );
      ClusterDetailsPage.clusterAuthenticationTypeLabelValue().contains(
        clusterProperties.AuthenticationType,
      );
      if (clusterProperties.AuthenticationType.includes('Workload Identity Federation')) {
        ClusterDetailsPage.clusterWifConfigurationValue().contains(
          Cypress.env('QE_GCP_WIF_CONFIG'),
        );
      }
    });
    it('Delete OSD cluster', () => {
      ClusterDetailsPage.actionsDropdownToggle().click();
      ClusterDetailsPage.deleteClusterDropdownItem().click();
      ClusterDetailsPage.deleteClusterNameInput().clear().type(clusterProperties.ClusterName);
      ClusterDetailsPage.deleteClusterConfirm().click();
      ClusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  });
});
