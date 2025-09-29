import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterMachinePoolDetails from '../../pageobjects/ClusterMachinePoolDetails.page';
import { Clusters } from '../../fixtures/osd-aws/OsdAwsMachinePoolsValidation.json';

const workerName = `worker-` + (Math.random() + 1).toString(36).substring(4);

describe(
  'OSD AWS Cluster - Machine pools Public Single-zone and Multi-zone cluster(OCP-35970, OCP-35974)',
  { tags: ['day2', 'osd', 'aws', 'create', 'multi-zone', 'single-zone'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Navigate to the OSD .* Machine pools tab/)) {
        cy.visit('/cluster-list');
        ClusterListPage.waitForDataReady();
        ClusterListPage.isClusterListScreen();
        ClusterListPage.filterTxtField().should('be.visible').click();
      }
    });

    Clusters.forEach((clusterPropertiesFile) => {
      it(`Step - Navigate to the OSD ${clusterPropertiesFile.Availability} Machine pools tab`, () => {
        ClusterListPage.filterTxtField().clear().type(clusterPropertiesFile.ClusterName);
        ClusterListPage.waitForDataReady();
        ClusterListPage.openClusterDefinition(clusterPropertiesFile.ClusterName);
        ClusterDetailsPage.waitForInstallerScreenToLoad();
        ClusterDetailsPage.machinePoolsTab().click();
      });

      it(`Step - Verify the elements of OSD ${clusterPropertiesFile.Availability} Machine pools tab`, () => {
        ClusterMachinePoolDetails.verifyAllMachinePoolTableHeaders('Machine pool');
        ClusterMachinePoolDetails.verifyAllMachinePoolTableHeaders('Instance type');
        ClusterMachinePoolDetails.verifyAllMachinePoolTableHeaders('Availability zones');
        ClusterMachinePoolDetails.verifyAllMachinePoolTableHeaders('Node count');
        ClusterMachinePoolDetails.verifyAllMachinePoolTableHeaders('Autoscaling');

        ClusterMachinePoolDetails.addMachinePoolDetailsButton().should('be.visible');
        ClusterMachinePoolDetails.editMachinePoolClusterAutoScalingButton().should('exist');

        if (clusterPropertiesFile.Availability == 'Multi-zone') {
          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            clusterPropertiesFile.MachinePools[0].NodeCount * 3,
          );
          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            clusterPropertiesFile.MachinePools[0].AvailabilityZones,
          );

          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            clusterPropertiesFile.MachinePools[0].InstanceType,
          );
        } else {
          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            clusterPropertiesFile.MachinePools[0].NodeCount * 2,
          );
          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            clusterPropertiesFile.MachinePools[0].AvailabilityZones,
          );

          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            clusterPropertiesFile.MachinePools[0].InstanceType,
          );
        }
      });

      it(`Step - Verify the subtabs are present for OSD ${clusterPropertiesFile.Availability} Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click();
        ClusterMachinePoolDetails.verifyMachinePoolModalIsOpen();
        ClusterMachinePoolDetails.verifyMachinePoolModalTitle('Add machine pool');
        ClusterMachinePoolDetails.verifySubTabExists('Overview');
        ClusterMachinePoolDetails.verifySubTabExists('Labels');
        ClusterMachinePoolDetails.verifySubTabExists('Cost savings');
        ClusterMachinePoolDetails.cancelMachinePoolDetailsButton().click();
      });

      it(`Step - Verify tab navigation functionality for ${clusterPropertiesFile.ClusterName}`, () => {
        ClusterDetailsPage.machinePoolsTab().click();
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click();

        // Navigate back to Overview
        ClusterMachinePoolDetails.selectMachinePoolSubTab('Overview');
        ClusterMachinePoolDetails.verifyOverviewTabContent();

        // Test Labels, AWS Tags, and Taints tab
        ClusterMachinePoolDetails.selectMachinePoolSubTab('Labels, AWS Tags, and Taints');
        ClusterMachinePoolDetails.verifyLabelsTagsTaintsTabContent();

        // Test Cost Savings tab
        ClusterMachinePoolDetails.selectMachinePoolSubTab('Cost savings');
        ClusterMachinePoolDetails.verifyCostSavingsTabContent();

        ClusterMachinePoolDetails.cancelMachinePoolDetailsButton().click();
      });

      it(`Step - Verify the Overview tab functionality for ${clusterPropertiesFile.ClusterName}`, () => {
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click({ force: true });

        // Ensure Overview tab is selected
        ClusterMachinePoolDetails.clickTab('Overview');

        // Test machine pool name input
        ClusterMachinePoolDetails.machinePoolNameInput().should('be.visible').type(workerName);

        // Test instance type selection
        ClusterMachinePoolDetails.selectComputeNodeType(
          clusterPropertiesFile.MachinePools[0].InstanceType,
        );

        // Test node count configuration
        ClusterMachinePoolDetails.selectMachinePoolComputeNodeCount(
          clusterPropertiesFile.ComputeNodeCount,
        );

        // Test autoscaling toggle
        ClusterMachinePoolDetails.enableMachinePoolAutoscalingCheckbox().check();
        ClusterMachinePoolDetails.setMinimumNodeInputAutoScaling(
          clusterPropertiesFile.MachinePools[0].MinimumNodeCount,
        );
        ClusterMachinePoolDetails.setMaximumNodeInputAutoScaling(
          clusterPropertiesFile.MachinePools[0].MaximumNodeCount,
        );
      });

      it(`Step - Verify Cost Savings tab functionality for ${clusterPropertiesFile.ClusterName}`, () => {
        // Navigate to Cost Savings tab
        ClusterMachinePoolDetails.clickTab('Cost savings');
        // Test spot instances configuration
        ClusterMachinePoolDetails.enableAmazonEC2SpotInstanceCheckbox().should('be.visible');

        // Test on-demand pricing (default)
        if (ClusterMachinePoolDetails.enableAmazonEC2SpotInstanceCheckbox().check()) {
          ClusterMachinePoolDetails.useOnDemandInstancePriceRadio().should('be.checked');
        }

        // Test custom max price option
        ClusterMachinePoolDetails.useSetMaxPriceRadio().check();
        ClusterMachinePoolDetails.setMaxPriceInput()
          .clear()
          .type(clusterPropertiesFile.SetMaximumPrice);
        ClusterMachinePoolDetails.closeMachinePoolDetailsButton().should('be.visible');
      });

      if (clusterPropertiesFile.ClusterName == 'cyp-osd-ccs-aws-public-advanced') {
        it(`Step - Verify Security Groups tab for AWS clusters with subnets`, () => {
          // This test only applies to AWS clusters with subnets
          ClusterMachinePoolDetails.addMachinePoolDetailsButton().click({ force: true });

          ClusterMachinePoolDetails.clickTab('Security groups');

          ClusterMachinePoolDetails.selectSecurityGroups();
        });
      }

      it(`Step - Verify the Labels, AWS Tags, and Taints tab for ${clusterPropertiesFile.ClusterName}`, () => {
        // Navigate to Labels, AWS Tags, and Taints tab
        ClusterMachinePoolDetails.clickTab('Labels');

        // Test adding a label
        ClusterMachinePoolDetails.addMachinePoolNodeLabelKey(
          clusterPropertiesFile.NodeLabel[0].Key,
          0,
        );
        ClusterMachinePoolDetails.addMachinePoolNodeLabelValue(
          clusterPropertiesFile.NodeLabel[0].Value,
          0,
        );

        // Add another label
        ClusterMachinePoolDetails.addMachinePoolNodeLabelLink().click();
        ClusterMachinePoolDetails.addMachinePoolNodeLabelKey(
          clusterPropertiesFile.NodeLabel[1].Key,
          1,
        );
        ClusterMachinePoolDetails.addMachinePoolNodeLabelValue(
          clusterPropertiesFile.NodeLabel[1].Value,
          1,
        );

        // Test adding taints
        ClusterMachinePoolDetails.addMachinePoolTaintsKey(clusterPropertiesFile.Taints[0].Key, 0);
        ClusterMachinePoolDetails.addMachinePoolTaintsValue(
          clusterPropertiesFile.Taints[0].Value,
          0,
        );
        ClusterMachinePoolDetails.selectMachinePoolTaintsEffectType(
          clusterPropertiesFile.Taints[0].Effect,
          0,
        );

        // Add another taint
        ClusterMachinePoolDetails.addMachinePoolTaintLabelLink().click();
        ClusterMachinePoolDetails.addMachinePoolTaintsKey(clusterPropertiesFile.Taints[1].Key, 1);
        ClusterMachinePoolDetails.addMachinePoolTaintsValue(
          clusterPropertiesFile.Taints[1].Value,
          1,
        );
        ClusterMachinePoolDetails.selectMachinePoolTaintsEffectType(
          clusterPropertiesFile.Taints[1].Effect,
          1,
        );

        ClusterMachinePoolDetails.submitMachinePoolDetailsButton().click();
      });

      it(`Step - Expand and verify the OSD ${clusterPropertiesFile.Availability} machine pool details created in the previous step`, () => {
        ClusterDetailsPage.machinePoolsTab().click({ force: true });

        ClusterMachinePoolDetails.clickAWSMachinePoolExpandableCollapsible(workerName);

        ClusterMachinePoolDetails.validateTextforCreatedLabels(
          clusterPropertiesFile.NodeLabel[0].Key,
          clusterPropertiesFile.NodeLabel[0].Value,
        );

        ClusterMachinePoolDetails.validateTextforCreatedLabels(
          clusterPropertiesFile.NodeLabel[1].Key,
          clusterPropertiesFile.NodeLabel[1].Value,
        );

        ClusterMachinePoolDetails.validateTextforCreatedTaints(
          clusterPropertiesFile.Taints[0].Key,
          clusterPropertiesFile.Taints[0].Value,
          clusterPropertiesFile.Taints[0].Effect,
        );

        ClusterMachinePoolDetails.validateTextforCreatedTaints(
          clusterPropertiesFile.Taints[1].Key,
          clusterPropertiesFile.Taints[1].Value,
          clusterPropertiesFile.Taints[1].Effect,
        );
        ClusterMachinePoolDetails.validateTextforCreatedSpotInstances(
          clusterPropertiesFile.SetMaximumPrice,
        );
        if (clusterPropertiesFile.Availability == 'Multi-zone') {
          ClusterMachinePoolDetails.validateTextforMultiZoneAutoScaling(
            clusterPropertiesFile.MachinePools[0].MinimumNodeCount,
            clusterPropertiesFile.MachinePools[0].MaximumNodeCount,
          );
        } else {
          ClusterMachinePoolDetails.validateTextforSingleZoneAutoScaling(
            clusterPropertiesFile.MachinePools[0].MinimumNodeCount,
            clusterPropertiesFile.MachinePools[0].MaximumNodeCount,
          );
        }
      });

      it(`Step - Verify the OSD ${clusterPropertiesFile.Availability} details on the Overview page`, () => {
        ClusterDetailsPage.overviewTab().click();
        ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
          'Nodes',
          clusterPropertiesFile.Nodes['Control plane'],
        );
        ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
          'Nodes',
          clusterPropertiesFile.Nodes['Infra'],
        );
        ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
          'Nodes',
          clusterPropertiesFile.Nodes['Compute'],
        );

        ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
          'Autoscale',
          clusterPropertiesFile.MachinePools[0].Autoscaling,
        );

        if (clusterPropertiesFile.Availability == 'Multi-zone') {
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesMinAndMaxNodeCount(
            'Min:',
            clusterPropertiesFile.MachinePools[0].MinimumNodeCount * 3 +
              clusterPropertiesFile.MachinePools[0].NodeCount * 3,
          );
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesMinAndMaxNodeCount(
            'Max:',
            clusterPropertiesFile.MachinePools[0].MaximumNodeCount * 3 +
              clusterPropertiesFile.MachinePools[0].NodeCount * 3,
          );
        } else {
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesMinAndMaxNodeCount(
            'Min:',
            clusterPropertiesFile.MachinePools[0].MinimumNodeCount * 1 +
              clusterPropertiesFile.MachinePools[0].NodeCount * 2,
          );
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesMinAndMaxNodeCount(
            'Max:',
            clusterPropertiesFile.MachinePools[0].MaximumNodeCount * 1 +
              clusterPropertiesFile.MachinePools[0].NodeCount * 2,
          );
        }
      });

      it(`Step - Delete the OSD ${clusterPropertiesFile.Availability} machine pool created in the above steps`, () => {
        ClusterDetailsPage.machinePoolsTab().click();
        ClusterMachinePoolDetails.deleteWorkerMachinePool(workerName);
      });
    });
  },
);
