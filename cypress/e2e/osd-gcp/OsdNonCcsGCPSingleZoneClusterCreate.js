import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';

const clusterProfiles = require('../../fixtures/osd-gcp/OsdNonCcsGCPClusterCreate.json');
const clusterProperties = clusterProfiles['osd-nonccs-gcp-singlezone']['day1-profile'];

describe(
  'OSD NonCCS GCP singlezone cluster creation profile',
  { tags: ['day1', 'gcp', 'public', 'singlezone', 'osd', 'nonccs'] },
  () => {
    before(() => {
      cy.visit('/create');
    });

    it(`Launch OSD(nonccs) - ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} cluster wizard`, () => {
      CreateOSDWizardPage.osdCreateClusterButton().click();
      CreateOSDWizardPage.isCreateOSDPage();
    });

    it(`OSD(nonccs)-  ${clusterProperties.CloudProvider} -${clusterProperties.Availability} - wizard - Billing model`, () => {
      CreateOSDWizardPage.isBillingModelScreen();
      CreateOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio().should('be.checked');
      CreateOSDWizardPage.infrastructureTypeRedHatCloudAccountRadio().check();
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs)-  ${clusterProperties.CloudProvider} -${clusterProperties.Availability}- Cluster Settings - Cloud provider`, () => {
      CreateOSDWizardPage.isCloudProviderSelectionScreen();
      CreateOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs)-  ${clusterProperties.CloudProvider} -${clusterProperties.Availability} - Cluster Settings - Cluster details`, () => {
      CreateOSDWizardPage.isClusterDetailsScreen();
      CreateOSDWizardPage.setClusterName(clusterProperties.ClusterName);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      CreateOSDWizardPage.setDomainPrefix(clusterProperties.DomainPrefix);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.enableUserWorkloadMonitoringCheckbox().should('be.checked');
      if (clusterProperties.EnableSecureBootSupportForSchieldedVMs.includes('Enabled')) {
        CreateOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      } else {
        CreateOSDWizardPage.enableSecureBootSupportForSchieldedVMsCheckbox().should(
          'not.be.checked',
        );
      }
      CreateOSDWizardPage.advancedEncryptionLink().click();
      if (clusterProperties.AdditionalEncryption.includes('Enabled')) {
        CreateOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
        if (clusterProperties.FIPSCryptography.includes('Enabled')) {
          CreateOSDWizardPage.enableFIPSCryptographyCheckbox().check();
        } else {
          CreateOSDWizardPage.enableFIPSCryptographyCheckbox().should('not.be.checked');
        }
      } else {
        CreateOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().should('not.be.checked');
      }
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs) ${clusterProperties.CloudProvider}-${clusterProperties.Availability} - Cluster Settings - Default machinepool`, () => {
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

    it(`OSD(nonccs) ${clusterProperties.CloudProvider}-${clusterProperties.Availability} - Networking configuration - CIDR `, () => {
      CreateOSDWizardPage.isCIDRScreen();
      CreateOSDWizardPage.cidrDefaultValuesCheckBox().should('be.checked');
      CreateOSDWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs) ${clusterProperties.CloudProvider} - ${clusterProperties.Availability}  wizard - Cluster updates `, () => {
      CreateOSDWizardPage.isUpdatesScreen();
      CreateOSDWizardPage.updateStrategyIndividualRadio().should('be.checked');
      CreateOSDWizardPage.updateStrategyRecurringRadio().should('not.be.checked');
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs) ${clusterProperties.CloudProvider} - ${clusterProperties.Availability}  - Review and create page`, () => {
      CreateOSDWizardPage.isReviewScreen();
      CreateOSDWizardPage.subscriptionTypeValue().contains(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.infrastructureTypeValue().contains(clusterProperties.InfrastructureType);
      CreateOSDWizardPage.cloudProviderValue().contains(clusterProperties.CloudProvider);
    });

    it(`OSD(nonccs) ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Cluster submissions`, () => {
      CreateOSDWizardPage.createClusterButton().click();
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterProperties.ClusterName);
      ClusterDetailsPage.clusterInstallationHeader()
        .contains('Installing cluster')
        .should('be.visible');
    });
  },
);
