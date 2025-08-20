import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';
import { Clusters } from '../../fixtures/osd/OsdCcsClusterProperties.json';

const QE_GCP = Cypress.env('QE_GCP_OSDCCSADMIN_JSON');
const awsAccountID = Cypress.env('QE_AWS_ID');
const awsAccessKey = Cypress.env('QE_AWS_ACCESS_KEY_ID');
const awsSecretKey = Cypress.env('QE_AWS_ACCESS_KEY_SECRET');

describe(
  'OSD GCP and AWS CCS cluster creation tests(OCP-35992, OCP-26750)',
  { tags: ['smoke'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Launch OSD.*cluster wizard/g)) {
        cy.visit('/create');
      }
    });

    Clusters.forEach((clusterProperties) => {
      let authType = clusterProperties.CloudProvider.includes('Google Cloud Platform')
        ? `-${clusterProperties.AuthenticationType} `
        : '';
      let isPscEnabled =
        clusterProperties.hasOwnProperty('UsePrivateServiceConnect') &&
        clusterProperties.UsePrivateServiceConnect.includes('Enabled')
          ? 'PrivateServiceConnect'
          : '';

      it(`Launch OSD - ${clusterProperties.CloudProvider} cluster wizard`, () => {
        CreateOSDWizardPage.osdCreateClusterButton()
          .should('exist')
          .should('not.be.disabled')
          .scrollIntoView()
          .click();
        CreateOSDWizardPage.isCreateOSDPage();
      });

      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Billing model and its definitions`, () => {
        CreateOSDWizardPage.isBillingModelScreen();
        CreateOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio().should('be.checked');
        CreateOSDWizardPage.infrastructureTypeClusterCloudSubscriptionRadio().check({
          force: true,
        });
        cy.get(CreateOSDWizardPage.primaryButton).click();
      });

      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Cloud provider definitions`, () => {
        CreateOSDWizardPage.isCloudProviderSelectionScreen();
        CreateOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);

        if (clusterProperties.CloudProvider.includes('GCP')) {
          if (clusterProperties.AuthenticationType.includes('Service Account')) {
            CreateOSDWizardPage.serviceAccountButton().click();
            CreateOSDWizardPage.uploadGCPServiceAccountJSON(JSON.stringify(QE_GCP));
          } else {
            CreateOSDWizardPage.workloadIdentityFederationButton().click();
            CreateOSDWizardPage.selectWorkloadIdentityConfiguration(
              Cypress.env('QE_GCP_WIF_CONFIG'),
            );
          }
        } else {
          CreateOSDWizardPage.awsAccountIDInput().type(awsAccountID);
          CreateOSDWizardPage.awsAccessKeyInput().type(awsAccessKey);
          CreateOSDWizardPage.awsSecretKeyInput().type(awsSecretKey);
        }
        CreateOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
        cy.get(CreateOSDWizardPage.primaryButton).click();
      });

      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Cluster details definitions`, () => {
        CreateOSDWizardPage.isClusterDetailsScreen();
        CreateOSDWizardPage.createCustomDomainPrefixCheckbox().scrollIntoView().check();
        CreateOSDWizardPage.setClusterName(clusterProperties.ClusterName);
        CreateOSDWizardPage.closePopoverDialogs();
        CreateOSDWizardPage.setDomainPrefix(clusterProperties.ClusterDomainPrefix);
        CreateOSDWizardPage.closePopoverDialogs();
        CreateOSDWizardPage.singleZoneAvilabilityRadio().should('be.checked');
        CreateOSDWizardPage.selectRegion(clusterProperties.Region);
        if (clusterProperties.CloudProvider.includes('GCP')) {
          CreateOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
        }
        CreateOSDWizardPage.enableUserWorkloadMonitoringCheckbox().should('be.checked');
        cy.get(CreateOSDWizardPage.primaryButton).click();
      });

      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Default machinepool definitions`, () => {
        CreateOSDWizardPage.isMachinePoolScreen();
        CreateOSDWizardPage.selectComputeNodeType(clusterProperties.MachinePools[0].InstanceType);

        CreateOSDWizardPage.selectComputeNodeCount(clusterProperties.MachinePools[0].NodeCount);
        CreateOSDWizardPage.enableAutoscalingCheckbox().should('not.be.checked');
        if (clusterProperties.CloudProvider.includes('AWS')) {
          CreateOSDWizardPage.useBothIMDSv1AndIMDSv2Radio().should('be.checked');
        }
        cy.get(CreateOSDWizardPage.primaryButton).click();
      });

      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Networking configuration - cluster privacy definitions`, () => {
        CreateOSDWizardPage.isNetworkingScreen();
        CreateOSDWizardPage.clusterPrivacyPublicRadio().should('be.checked');
        CreateOSDWizardPage.applicationIngressDefaultSettingsRadio().should('be.checked');
        CreateOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
        if (
          clusterProperties.ClusterPrivacy.includes('Private') &&
          clusterProperties.CloudProvider.includes('GCP')
        ) {
          CreateOSDWizardPage.installIntoExistingVpcCheckBox().should('be.checked');
          CreateOSDWizardPage.usePrivateServiceConnectCheckBox().should('be.checked');
        } else {
          CreateOSDWizardPage.installIntoExistingVpcCheckBox().should('not.be.checked');
        }
        cy.get(CreateOSDWizardPage.primaryButton).click();
      });
      if (
        clusterProperties.ClusterPrivacy.includes('Private') &&
        clusterProperties.UsePrivateServiceConnect.includes('Enabled')
      ) {
        it(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} : VPC Settings definitions`, () => {
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
      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - CIDR configuration - cidr definitions`, () => {
        CreateOSDWizardPage.isCIDRScreen();
        CreateOSDWizardPage.cidrDefaultValuesCheckBox().should('be.checked');
        CreateOSDWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
        CreateOSDWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
        CreateOSDWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
        CreateOSDWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
        cy.get(CreateOSDWizardPage.primaryButton).click();
      });

      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster updates definitions`, () => {
        CreateOSDWizardPage.isUpdatesScreen();
        CreateOSDWizardPage.updateStrategyIndividualRadio().should('be.checked');
        CreateOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
        cy.get(CreateOSDWizardPage.primaryButton).click();
      });

      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Review and create page and its definitions`, () => {
        CreateOSDWizardPage.isReviewScreen();
        CreateOSDWizardPage.subscriptionTypeValue().contains(clusterProperties.SubscriptionType);
        CreateOSDWizardPage.infrastructureTypeValue().contains(
          clusterProperties.InfrastructureType,
        );
        CreateOSDWizardPage.cloudProviderValue().contains(clusterProperties.CloudProvider);
        if (clusterProperties.CloudProvider.includes('GCP')) {
          CreateOSDWizardPage.authenticationTypeValue().contains(
            clusterProperties.AuthenticationType,
          );
          if (clusterProperties.AuthenticationType.includes('Workload Identity Federation')) {
            CreateOSDWizardPage.wifConfigurationValue().contains(Cypress.env('QE_GCP_WIF_CONFIG'));
          }
        }
        CreateOSDWizardPage.clusterDomainPrefixLabelValue().contains(
          clusterProperties.ClusterDomainPrefix,
        );
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
        if (clusterProperties.hasOwnProperty('UsePrivateServiceConnect')) {
          CreateOSDWizardPage.privateServiceConnectValue().contains(
            clusterProperties.UsePrivateServiceConnect,
          );
        }
        CreateOSDWizardPage.applicationIngressValue().contains(
          clusterProperties.ApplicationIngress,
        );

        CreateOSDWizardPage.machineCIDRValue().contains(clusterProperties.MachineCIDR);
        CreateOSDWizardPage.serviceCIDRValue().contains(clusterProperties.ServiceCIDR);
        CreateOSDWizardPage.podCIDRValue().contains(clusterProperties.PodCIDR);
        CreateOSDWizardPage.hostPrefixValue().contains(clusterProperties.HostPrefix);
        CreateOSDWizardPage.applicationIngressValue().contains(
          clusterProperties.ApplicationIngress,
        );

        CreateOSDWizardPage.updateStratergyValue().contains(clusterProperties.UpdateStrategy);
        CreateOSDWizardPage.nodeDrainingValue(
          `${clusterProperties.NodeDraining} × 60 = ${clusterProperties.NodeDraining} minutes`,
        );
      });

      it(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster submission & overview definitions`, () => {
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
        ClusterDetailsPage.clusterRegionLabelValue().contains(
          clusterProperties.Region.split(',')[0],
        );
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
        if (clusterProperties.CloudProvider.includes('GCP')) {
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
        }
      });

      it(`Delete OSD ${clusterProperties.CloudProvider} ${authType}  ${isPscEnabled} cluster`, () => {
        ClusterDetailsPage.actionsDropdownToggle().click();
        ClusterDetailsPage.deleteClusterDropdownItem().click();
        ClusterDetailsPage.deleteClusterNameInput().clear().type(clusterProperties.ClusterName);
        ClusterDetailsPage.deleteClusterConfirm().click();
        ClusterDetailsPage.waitForDeleteClusterActionComplete();
      });
    });
  },
);
