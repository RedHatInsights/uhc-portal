import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';
import { Clusters } from '../../fixtures/osd/OsdWizardValidation.json';
import { ClustersValidation } from '../../fixtures/osd/OsdWizardValidation.json';

const QE_GCP = Cypress.env('QE_GCP_OSDCCSADMIN_JSON');
const awsAccountID = Cypress.env('QE_AWS_ID');
const awsAccessKey = Cypress.env('QE_AWS_ACCESS_KEY_ID');
const awsSecretKey = Cypress.env('QE_AWS_ACCESS_KEY_SECRET');

describe('OSD Wizard validation tests(OCP-54134,OCP-73204)', { tags: ['smoke'] }, () => {
  beforeEach(() => {
    if (Cypress.currentTest.title.match(/Launch OSD.*cluster wizard/g)) {
      cy.visit('/create');
    }
  });
  Clusters.forEach((clusterProperties) => {
    let isCCSCluster = clusterProperties.InfrastructureType.includes('Red Hat') ? false : true;
    it(`Launch OSD - ${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} cluster wizard`, () => {
      CreateOSDWizardPage.osdCreateClusterButton().click();
      CreateOSDWizardPage.isCreateOSDPage();
    });

    it(`OSD wizard -  ${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} : Billing model`, () => {
      CreateOSDWizardPage.isBillingModelScreen();
      CreateOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD wizard - ${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} : Cluster Settings- Cloud provider -field validations`, () => {
      CreateOSDWizardPage.isCloudProviderSelectionScreen();
      CreateOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      if (isCCSCluster) {
        CreateOSDWizardPage.wizardNextButton().click();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.CloudProvider.Common.AcknowledgementUncheckedError,
        );
        CreateOSDWizardPage.acknowledgePrerequisitesCheckbox().check();

        if (clusterProperties.CloudProvider.includes('GCP')) {
          if (clusterProperties.AuthenticationType.includes('Service Account')) {
            CreateOSDWizardPage.serviceAccountButton().click();

            CreateOSDWizardPage.wizardNextButton().click();
            CreateOSDWizardPage.isTextContainsInPage(
              ClustersValidation.ClusterSettings.CloudProvider.GCP.EmptyGCPServiceJSONFieldError,
            );
            CreateOSDWizardPage.isTextContainsInPage(
              ClustersValidation.ClusterSettings.CloudProvider.Common.AcknowledgementUncheckedError,
            );
            CreateOSDWizardPage.acknowledgePrerequisitesCheckbox().check();

            CreateOSDWizardPage.uploadGCPServiceAccountJSON(
              ClustersValidation.ClusterSettings.CloudProvider.GCP
                .InvalidFormatGCPServiceJSONValues,
            );
            CreateOSDWizardPage.wizardNextButton().click();
            CreateOSDWizardPage.isTextContainsInPage(
              ClustersValidation.ClusterSettings.CloudProvider.GCP
                .InvalidFormatGCPServiceJSONFieldError,
            );
            CreateOSDWizardPage.uploadGCPServiceAccountJSON(
              ClustersValidation.ClusterSettings.CloudProvider.GCP.InvalidGCPServiceJSONValues,
            );
            CreateOSDWizardPage.wizardNextButton().click();
            CreateOSDWizardPage.isTextContainsInPage(
              ClustersValidation.ClusterSettings.CloudProvider.GCP.InvalidGCPServiceJSONFieldError,
            );
            CreateOSDWizardPage.uploadGCPServiceAccountJSON(JSON.stringify(QE_GCP));
          } else {
            CreateOSDWizardPage.wizardNextButton().click();
            CreateOSDWizardPage.isTextContainsInPage(
              ClustersValidation.ClusterSettings.CloudProvider.GCP.NoWIFConfigSelectionError,
            );
            CreateOSDWizardPage.gcpWIFCommandInput().should(
              'have.value',
              ClustersValidation.ClusterSettings.CloudProvider.GCP.WIFCommandValue,
            );
            CreateOSDWizardPage.selectWorkloadIdentityConfiguration(
              Cypress.env('QE_GCP_WIF_CONFIG'),
            );
          }
        } else {
          CreateOSDWizardPage.awsSecretKeyInput().type(awsSecretKey);
          CreateOSDWizardPage.wizardNextButton().click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.CloudProvider.AWS.EmptyAWSAccountIdError,
          );
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.CloudProvider.AWS.EmptyAWSAccessKeyError,
          );
          CreateOSDWizardPage.awsAccessKeyInput().type(awsAccessKey);
          CreateOSDWizardPage.awsAccessKeyInput().clear();
          CreateOSDWizardPage.wizardNextButton().click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.CloudProvider.AWS.EmptyAWSSecretKeyError,
          );
          CreateOSDWizardPage.awsAccountIDInput()
            .clear()
            .type(ClustersValidation.ClusterSettings.CloudProvider.AWS.InValidAWSAccountIdValues[0])
            .blur();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.CloudProvider.AWS.InValidAWSAccountIdError,
          );
          CreateOSDWizardPage.wizardNextButton().click();
          CreateOSDWizardPage.awsAccountIDInput()
            .clear()
            .type(ClustersValidation.ClusterSettings.CloudProvider.AWS.InValidAWSAccountIdValues[1])
            .blur();
          CreateOSDWizardPage.wizardNextButton().click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.CloudProvider.AWS.InValidAWSAccountIdError,
          );
          CreateOSDWizardPage.awsAccountIDInput().clear().type(awsAccountID);
          CreateOSDWizardPage.awsAccessKeyInput().clear().type(awsAccessKey);
          CreateOSDWizardPage.awsSecretKeyInput().clear().type(awsSecretKey);
        }
      }
      CreateOSDWizardPage.wizardNextButton().click();
    });
    it(`OSD wizard - ${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} : Cluster Settings - Cluster details- field validations`, () => {
      CreateOSDWizardPage.isClusterDetailsScreen();
      cy.get(CreateOSDWizardPage.clusterNameInput)
        .scrollIntoView()
        .type(ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[0]);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[0],
      );
      cy.get(CreateOSDWizardPage.clusterNameInput)
        .scrollIntoView()
        .type('{selectAll}')
        .type(ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[1]);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[1],
      );
      cy.get(CreateOSDWizardPage.clusterNameInput)
        .scrollIntoView()
        .type('{selectAll}')
        .type(ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[2]);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[2],
      );
      cy.get(CreateOSDWizardPage.clusterNameInput).clear().type('wizardvalid').blur();
      CreateOSDWizardPage.createCustomDomainPrefixCheckbox().scrollIntoView().check();
      CreateOSDWizardPage.domainPrefixInput()
        .scrollIntoView()
        .type('{selectAll}')
        .type(ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[0]);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[0],
      );
      CreateOSDWizardPage.domainPrefixInput()
        .scrollIntoView()
        .type('{selectAll}')
        .type(ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[1]);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[1],
      );
      CreateOSDWizardPage.domainPrefixInput()
        .scrollIntoView()
        .type('{selectAll}')
        .type(ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[2]);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[2],
      );
      CreateOSDWizardPage.createCustomDomainPrefixCheckbox().uncheck();
      CreateOSDWizardPage.selectAvailabilityZone('Single Zone');
      if (clusterProperties.CloudProvider.includes('GCP')) {
        CreateOSDWizardPage.enableSecureBootSupportForShieldedVMs(true);
      } else {
        if (isCCSCluster) {
          CreateOSDWizardPage.advancedEncryptionLink().click();
          CreateOSDWizardPage.useCustomKMSKeyRadio().check();
          CreateOSDWizardPage.wizardNextButton().click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Details.AWS.KeyARNs.EmptyValueError,
          );
          CreateOSDWizardPage.keyArnInput()
            .clear()
            .type(ClustersValidation.ClusterSettings.Details.AWS.KeyARNs.WrongFormatValue);
          CreateOSDWizardPage.wizardNextButton().click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Details.AWS.KeyARNs.WrongFormatError,
          );
          CreateOSDWizardPage.keyArnInput()
            .clear()
            .type(ClustersValidation.ClusterSettings.Details.AWS.KeyARNs.WrongFormatWithWhitespace);
          CreateOSDWizardPage.wizardNextButton().click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Details.AWS.KeyARNs.WrongFormatWithWhitespaceError,
          );
          CreateOSDWizardPage.useDefaultKMSKeyRadio().check();
        }
      }
      CreateOSDWizardPage.wizardNextButton().click();
    });
    it(`OSD wizard - ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} : Cluster Settings - Machinepool(nodes) field validations`, () => {
      CreateOSDWizardPage.isMachinePoolScreen();
      CreateOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
      CreateOSDWizardPage.computeNodeCountSelect().should(
        'have.value',
        isCCSCluster === true ? '2' : '4',
      );
      CreateOSDWizardPage.enableAutoScaling();
      CreateOSDWizardPage.setMinimumNodeCount('0');
      let machinePoolProperties =
        isCCSCluster === true
          ? ClustersValidation.ClusterSettings.Machinepool.NodeCount.CCS
          : ClustersValidation.ClusterSettings.Machinepool.NodeCount.NonCCS;
      CreateOSDWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.LowerLimitError);
      CreateOSDWizardPage.setMinimumNodeCount('500');
      CreateOSDWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.UpperLimitError);
      CreateOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
      );
      CreateOSDWizardPage.setMinimumNodeCount(isCCSCluster === true ? '2' : '4');
      CreateOSDWizardPage.setMaximumNodeCount('500');
      CreateOSDWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.UpperLimitError);
      CreateOSDWizardPage.setMaximumNodeCount('0');
      CreateOSDWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.LowerLimitError);
      CreateOSDWizardPage.setMaximumNodeCount(isCCSCluster === true ? '2' : '4');
      CreateOSDWizardPage.minimumNodeCountPlusButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
      );
      CreateOSDWizardPage.maximumNodeCountPlusButton().click();
      CreateOSDWizardPage.maximumNodeCountMinusButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
      );
      CreateOSDWizardPage.minimumNodeCountMinusButton().click();
      CreateOSDWizardPage.wizardBackButton().click();
      CreateOSDWizardPage.selectAvailabilityZone('Multi-zone');
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
      CreateOSDWizardPage.selectAutoScaling('disabled');
      CreateOSDWizardPage.computeNodeCountSelect().should('not.have.attr', 'disabled');
      CreateOSDWizardPage.computeNodeCountSelect().should(
        'have.value',
        isCCSCluster === true ? '1' : '3',
      );
      CreateOSDWizardPage.enableAutoScaling();
      CreateOSDWizardPage.setMinimumNodeCount('0');
      CreateOSDWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.LowerLimitError);
      CreateOSDWizardPage.setMinimumNodeCount('500');
      CreateOSDWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.UpperLimitError);
      CreateOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
      );
      CreateOSDWizardPage.setMinimumNodeCount(isCCSCluster === true ? '2' : '3');
      CreateOSDWizardPage.setMaximumNodeCount('500');
      CreateOSDWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.UpperLimitError);
      CreateOSDWizardPage.setMaximumNodeCount('0');
      CreateOSDWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.LowerLimitError);
      CreateOSDWizardPage.setMaximumNodeCount(isCCSCluster === true ? '2' : '3');
      CreateOSDWizardPage.minimumNodeCountPlusButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
      );
      CreateOSDWizardPage.maximumNodeCountPlusButton().click();
      CreateOSDWizardPage.maximumNodeCountMinusButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
      );
      CreateOSDWizardPage.minimumNodeCountMinusButton().click();
    });
    if (isCCSCluster) {
      it(`OSD wizard - ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} : Cluster Settings - Machinepool- Cluster autoscaling validations`, () => {
        CreateOSDWizardPage.editClusterAutoscalingSettingsButton().click();
        CreateOSDWizardPage.clusterAutoscalingLogVerbosityInput()
          .type('{selectAll}')
          .type('0')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .LogVerbosityLimitError,
        );
        CreateOSDWizardPage.clusterAutoscalingLogVerbosityInput()
          .type('{selectAll}')
          .type('7')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .LogVerbosityLimitError,
        );
        CreateOSDWizardPage.clusterAutoscalingLogVerbosityInput()
          .type('{selectAll}')
          .type('3')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .LogVerbosityLimitError,
          false,
        );
        CreateOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear().blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .RequiredFieldError,
        );
        CreateOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear().type('8H').blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput()
          .clear()
          .type('90k')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear().type('8s').blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
          false,
        );
        CreateOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput()
          .clear()
          .type('test with whitespace,test')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .WhitespaceLabelValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput()
          .clear()
          .type('test,test,')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .EmptyLabelValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput()
          .clear()
          .type('test@434$,123,&test_(t)35435')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage('Empty labels are not allowed', false);
        CreateOSDWizardPage.clusterAutoscalingCoresTotalMinInput()
          .type('{selectAll}')
          .type('10')
          .blur();
        CreateOSDWizardPage.clusterAutoscalingCoresTotalMaxInput()
          .type('{selectAll}')
          .type('9')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling.MinMaxLimitError,
        );
        CreateOSDWizardPage.clusterAutoscalingCoresTotalMinInput()
          .type('{selectAll}')
          .type('9')
          .blur();
        CreateOSDWizardPage.clusterAutoscalingCoresTotalMaxInput()
          .type('{selectAll}')
          .type('10')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling.MinMaxLimitError,
          false,
        );
        CreateOSDWizardPage.clusterAutoscalingMemoryTotalMinInput()
          .type('{selectAll}')
          .type('10')
          .blur();
        CreateOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput()
          .type('{selectAll}')
          .type('9')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling.MinMaxLimitError,
        );
        CreateOSDWizardPage.clusterAutoscalingMemoryTotalMinInput()
          .type('{selectAll}')
          .type('-1')
          .blur();

        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .NegativeValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput()
          .type('{selectAll}')
          .type('-1')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .NegativeValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingMemoryTotalMinInput()
          .type('{selectAll}')
          .type('9')
          .blur();
        CreateOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput()
          .type('{selectAll}')
          .type('10')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .NegativeValueError,
          false,
        );
        CreateOSDWizardPage.clusterAutoscalingMaxNodesTotalInput().should('have.value', '255');
        CreateOSDWizardPage.clusterAutoscalingMaxNodesTotalInput()
          .type('{selectAll}')
          .type('257')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .MaxNodesValueMultizoneLimitError,
        );
        CreateOSDWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
        CreateOSDWizardPage.clusterAutoscalingCloseButton().click();
        CreateOSDWizardPage.wizardBackButton().click();
        CreateOSDWizardPage.selectAvailabilityZone('Single Zone');
        CreateOSDWizardPage.wizardNextButton().click();
        CreateOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
        CreateOSDWizardPage.enableAutoscalingCheckbox().uncheck();
        CreateOSDWizardPage.enableAutoscalingCheckbox().check();
        CreateOSDWizardPage.editClusterAutoscalingSettingsButton().click();
        CreateOSDWizardPage.clusterAutoscalingMaxNodesTotalInput().should('have.value', '254');
        CreateOSDWizardPage.clusterAutoscalingMaxNodesTotalInput()
          .type('{selectAll}')
          .type('255')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .MaxNodesValueSinglezoneLimitError,
        );
        if (
          clusterProperties.CloudProvider.includes('AWS') ||
          clusterProperties.CloudProvider.includes('GCP')
        ) {
          CreateOSDWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
          CreateOSDWizardPage.clusterAutoscalingCloseButton().click();
          CreateOSDWizardPage.wizardBackButton().click();
          CreateOSDWizardPage.selectAvailabilityZone('Multi-zone');
          CreateOSDWizardPage.wizardNextButton().click();
          CreateOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
          CreateOSDWizardPage.enableAutoscalingCheckbox().uncheck();
          CreateOSDWizardPage.enableAutoscalingCheckbox().check();
          CreateOSDWizardPage.editClusterAutoscalingSettingsButton().click();
        }
        CreateOSDWizardPage.clusterAutoscalingGPUsInput().type('{selectAll}').type('test').blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidGPUValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingGPUsInput()
          .type('{selectAll}')
          .type('test:10:5')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidGPUValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingGPUsInput()
          .type('{selectAll}')
          .type('test:10:5,')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidGPUValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingGPUsInput()
          .type('{selectAll}')
          .type('test:10:12,test:1:5')
          .blur();
        cy.get('div')
          .contains(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
          )
          .should('not.exist');
        CreateOSDWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput()
          .type('{selectAll}')
          .type('1.5')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .ThreasholdLimitError,
        );
        CreateOSDWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput()
          .type('{selectAll}')
          .type('-1.5')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .NegativeValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput()
          .type('{selectAll}')
          .type('0.5')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .NegativeValueError,
          false,
        );
        CreateOSDWizardPage.clusterAutoscalingScaleDownUnneededTimeInput()
          .type('{selectAll}')
          .type('7H')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingScaleDownUnneededTimeInput()
          .type('{selectAll}')
          .type('7h')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
          false,
        );

        CreateOSDWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput()
          .type('{selectAll}')
          .type('8Sec')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
        );
        CreateOSDWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput()
          .type('{selectAll}')
          .type('8s')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
          false,
        );

        CreateOSDWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput()
          .type('{selectAll}')
          .type('10milli')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
        );

        CreateOSDWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput()
          .type('{selectAll}')
          .type('10s')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
          false,
        );

        CreateOSDWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput()
          .type('{selectAll}')
          .type('5M')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
        );

        CreateOSDWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput()
          .type('{selectAll}')
          .type('5m')
          .blur();
        CreateOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
            .InvalidTimeValueError,
          false,
        );

        CreateOSDWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
        CreateOSDWizardPage.clusterAutoscalingCloseButton().click();
      });
    }
    it(`OSD wizard - ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} : Cluster Settings - Machinepool(Labels) field validations`, () => {
      CreateOSDWizardPage.addNodeLabelLink().scrollIntoView().click();
      CreateOSDWizardPage.addNodeLabelKeyAndValue(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].UpperCharacterLimitValue,
        'test',
        0,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
        false,
      );
      CreateOSDWizardPage.addNodeLabelKeyAndValue(
        'test',
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].UpperCharacterLimitValue,
        0,
      );

      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
        false,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
      );

      CreateOSDWizardPage.addNodeLabelKeyAndValue('test-t_123.com', 'test-t_123.com', 0);
      cy.contains('Node labels (optional)').click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
        false,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
        false,
      );

      CreateOSDWizardPage.addNodeLabelKeyAndValue(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].InvalidValue,
        'test',
        0,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].KeyError,
      );
      CreateOSDWizardPage.addNodeLabelKeyAndValue(
        'testing',
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].InvalidValue,
        0,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].LabelError,
      );
      CreateOSDWizardPage.addNodeLabelKeyAndValue(
        'test',
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].InvalidValue,
        0,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].LabelError,
      );
      CreateOSDWizardPage.addNodeLabelKeyAndValue(
        'example12-ing.com/MyName',
        'test-ing_123.com',
        0,
      );
      cy.contains('Node labels (optional)').click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
        false,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].KeyError,
        false,
      );
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].KeyError,
        false,
      );
      CreateOSDWizardPage.wizardNextButton().click();
    });
    it(`OSD wizard - ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType}  : Networking configuration - field validations`, () => {
      if (clusterProperties.CloudProvider.includes('GCP') && !isCCSCluster) {
        cy.log(
          `Cloud provider : ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} with CCS cluster=${isCCSCluster} not supported Networking configuration > Cluster privacy`,
        );
      } else {
        CreateOSDWizardPage.isNetworkingScreen();
        if (isCCSCluster) {
          CreateOSDWizardPage.applicationIngressCustomSettingsRadio().check();
          CreateOSDWizardPage.applicationIngressRouterSelectorsInput()
            .clear()
            .type(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[0].UpperCharacterLimitValue,
            );
          cy.contains('Route selector').click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
              .RouteSelector[0].Error,
          );
          CreateOSDWizardPage.applicationIngressRouterSelectorsInput()
            .clear()
            .type(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[1].InvalidValue,
            );
          cy.contains('Route selector').click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
              .RouteSelector[1].Error,
          );
          CreateOSDWizardPage.applicationIngressRouterSelectorsInput()
            .clear()
            .type(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[2].InvalidValue,
            );
          cy.contains('Route selector').click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
              .RouteSelector[2].Error,
          );
          CreateOSDWizardPage.applicationIngressRouterSelectorsInput()
            .clear()
            .type(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[3].InvalidValue,
            );
          cy.contains('Route selector').click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
              .RouteSelector[3].Error,
          );
          CreateOSDWizardPage.applicationIngressRouterSelectorsInput()
            .clear()
            .type('valid123-k.com/Hello_world2');
          cy.contains('Route selector').click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
              .RouteSelector[0].Error,
            false,
          );
          CreateOSDWizardPage.applicationIngressExcludedNamespacesInput()
            .clear()
            .type(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .ExcludedNamespaces[0].UpperCharacterLimitValue,
            );
          cy.contains('Route selector').click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
              .ExcludedNamespaces[0].Error,
          );
          CreateOSDWizardPage.applicationIngressExcludedNamespacesInput()
            .clear()
            .type(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .ExcludedNamespaces[1].InvalidValue,
            );
          cy.contains('Route selector').click();
          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
              .ExcludedNamespaces[1].Error,
          );
          CreateOSDWizardPage.applicationIngressExcludedNamespacesInput().clear().type('abc-123');
          cy.contains('Route selector').click();

          CreateOSDWizardPage.isTextContainsInPage(
            ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
              .ExcludedNamespaces[1].Error,
            false,
          );
        }
        CreateOSDWizardPage.wizardNextButton().click();
      }
    });
    it(`OSD wizard - ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType}  : Networking configuration - CIDR field validations`, () => {
      CreateOSDWizardPage.isCIDRScreen();
      CreateOSDWizardPage.useCIDRDefaultValues(false);
      CreateOSDWizardPage.machineCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
      );
      CreateOSDWizardPage.machineCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
      );
      CreateOSDWizardPage.machineCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
      );
      CreateOSDWizardPage.machineCIDRInput().clear().type('10.0.0.0/16');
      cy.contains('Machine CIDR').click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        false,
      );
      CreateOSDWizardPage.serviceCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
      );
      CreateOSDWizardPage.serviceCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
      );
      CreateOSDWizardPage.serviceCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
      );
      CreateOSDWizardPage.serviceCIDRInput().clear().type('172.30.0.0/16');
      cy.contains('Service CIDR').click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        false,
      );
      CreateOSDWizardPage.podCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
      );
      CreateOSDWizardPage.podCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
      );
      CreateOSDWizardPage.podCIDRInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
      );
      CreateOSDWizardPage.podCIDRInput().clear().type('10.128.0.0/14');
      cy.contains('Pod CIDR').click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        false,
      );
      CreateOSDWizardPage.hostPrefixInput().clear();
      cy.contains('Pod CIDR').click();
      cy.get('div').contains('Field is required').should('be.visible');
      CreateOSDWizardPage.hostPrefixInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[0].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[0].Error,
      );
      CreateOSDWizardPage.hostPrefixInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[1].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[1].Error,
      );
      CreateOSDWizardPage.hostPrefixInput()
        .clear()
        .type(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Value);
      CreateOSDWizardPage.wizardNextButton().click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Error,
      );
      CreateOSDWizardPage.hostPrefixInput().clear().type('/23');
      cy.contains('Pod CIDR').click();
      CreateOSDWizardPage.isTextContainsInPage(
        ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Error,
        false,
      );
      CreateOSDWizardPage.useCIDRDefaultValues(true);
      CreateOSDWizardPage.wizardNextButton().click();
    });
  });
});
