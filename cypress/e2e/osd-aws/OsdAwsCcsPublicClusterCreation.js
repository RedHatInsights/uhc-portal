import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';
import CreateClusterPage from '../../pageobjects/CreateCluster.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';

const clusterProfiles = require('../../fixtures/osd-aws/OsdAwsCcsCreatePublicCluster.json');
const clusterProperties = clusterProfiles['osdccs-aws-public']['day1-profile'];

const clusterName = clusterProperties.ClusterName;
const awsAccountID = Cypress.env('QE_AWS_ID');
const awsAccessKey = Cypress.env('QE_AWS_ACCESS_KEY_ID');
const awsSecretKey = Cypress.env('QE_AWS_ACCESS_KEY_SECRET');

describe(
  'OSD AWS CCS Cluster - Create default public cluster with properties OCP-21086, OCP-21090)',
  { tags: ['day1', 'osd', 'aws', 'public'] },
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

      CreateOSDWizardPage.wizardNextButton().click();
    });

    it('Step OSD - AWS CCS wizard - Cluster Settings - Select Cluster details definitions', () => {
      CreateOSDWizardPage.isClusterDetailsScreen();
      CreateOSDWizardPage.setClusterName(clusterName);
      CreateOSDWizardPage.closePopoverDialogs();
      if (clusterProperties.Availability.includes('Single zone')) {
        CreateOSDWizardPage.singleZoneAvilabilityRadio().check();
      } else {
        CreateOSDWizardPage.multiZoneAvilabilityRadio().check();
      }
      CreateOSDWizardPage.selectRegion(clusterProperties.Region);

      CreateOSDWizardPage.enableUserWorkloadMonitoringCheckbox().should('be.checked');

      CreateOSDWizardPage.wizardNextButton().click();
    });

    it('Step OSD - AWS CCS wizard - Cluster Settings - Select default machinepool definitions', () => {
      CreateOSDWizardPage.isMachinePoolScreen();
      CreateOSDWizardPage.selectComputeNodeType(clusterProperties.MachinePools[0].InstanceType);
      CreateOSDWizardPage.useBothIMDSv1AndIMDSv2Radio().should('be.checked');
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it('Step OSD - AWS CCS wizard - Networking configuration - Select cluster privacy definitions', () => {
      CreateOSDWizardPage.isNetworkingScreen();
      CreateOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it('Step OSD - AWS CCS wizard CIDR Ranges - Select CIDR default values', () => {
      CreateOSDWizardPage.cidrDefaultValuesCheckBox().should('be.checked');
      CreateOSDWizardPage.useCIDRDefaultValues(false);
      CreateOSDWizardPage.useCIDRDefaultValues(true);
      CreateOSDWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it('Step OSD - AWS CCS wizard Cluster update - Select update strategies and its definitions', () => {
      CreateOSDWizardPage.isUpdatesScreen();
      CreateOSDWizardPage.updateStrategyIndividualRadio().should('be.checked');
      CreateOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
      CreateOSDWizardPage.wizardNextButton().click();
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
      CreateOSDWizardPage.computeNodeCountValue().contains(
        clusterProperties.MachinePools[0].NodeCount,
      );
    });

    it('Step OSD - AWS CCS wizard - Review and create : Networking definitions', () => {
      CreateOSDWizardPage.clusterPrivacyValue().contains(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.installIntoExistingVpcValue().contains(
        clusterProperties.InstallIntoExistingVPC,
      );
      CreateOSDWizardPage.applicationIngressValue().contains(clusterProperties.ApplicationIngress);
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
