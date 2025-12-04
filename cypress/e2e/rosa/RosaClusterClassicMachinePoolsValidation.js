import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterMachinePoolDetails from '../../pageobjects/ClusterMachinePoolDetails.page';
import { Clusters } from '../../fixtures/rosa/RosaClusterClassicMachinePoolsValidation.json';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';

const workerName = `worker-` + (Math.random() + 1).toString(36).substring(4);

describe(
  'ROSA Cluster - Machine pools Public Single-zone and Multi-zone cluster(OCP-35970)',
  { tags: ['day2', 'rosa', 'create', 'multi-zone', 'single-zone'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Navigate to the ROSA .* Machine pools tab/)) {
        cy.visit(CLUSTER_LIST_PATH);
        ClusterListPage.waitForDataReady();
        ClusterListPage.isClusterListScreen();
        ClusterListPage.filterTxtField().should('be.visible').click();
      }
    });

    Clusters.forEach((clusterPropertiesFile) => {
      it(`Step - Navigate to the ROSA ${clusterPropertiesFile.Availability} Machine pools tab`, () => {
        ClusterListPage.filterTxtField().clear().type(clusterPropertiesFile.ClusterName);
        ClusterListPage.waitForDataReady();
        ClusterListPage.openClusterDefinition(clusterPropertiesFile.ClusterName);
        ClusterDetailsPage.waitForInstallerScreenToLoad();
        ClusterDetailsPage.machinePoolsTab().click();
      });

      it(`Step - Verify the elements of ROSA ${clusterPropertiesFile.Availability} Machine pools tab`, () => {
        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Machine pool');
        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Instance type');

        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Availability zones');

        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Node count');
        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Autoscaling');

        ClusterMachinePoolDetails.addMachinePoolDetailsButton().should('exist');
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

      it(`Step - Verify the default elements of ROSA ${clusterPropertiesFile.Availability} Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click();
        ClusterMachinePoolDetails.machinePoolNameInput().should('be.visible').click();
        ClusterMachinePoolDetails.selectComputeNodeType(
          clusterPropertiesFile.MachinePools[0].InstanceType,
        );
        ClusterMachinePoolDetails.enableMachinePoolAutoscalingCheckbox().should('not.be.checked');
        ClusterMachinePoolDetails.enableAmazonEC2SpotInstanceCheckbox().should('be.checked');
        ClusterMachinePoolDetails.editMachinePoolNodeLabelsandTaintsLink();
        ClusterMachinePoolDetails.closeMachinePoolDetailsButton().should('be.visible');
        ClusterMachinePoolDetails.cancelMachinePoolDetailsButton().click();
      });

      it(`Step - Verify the other elements of ROSA ${clusterPropertiesFile.Availability} Add machine pool modal window`, () => {
        ClusterDetailsPage.machinePoolsTab().click();
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click();
        ClusterMachinePoolDetails.selectMachinePoolComputeNodeCount(
          clusterPropertiesFile.ComputeNodeCount,
        );

        ClusterMachinePoolDetails.editMachinePoolNodeLabelsandTaintsLink();

        ClusterMachinePoolDetails.inputMachineRootDiskSize().type('125000');
        cy.get('div').contains(clusterPropertiesFile.RootDiskSize.LimitError).should('be.visible');
        ClusterMachinePoolDetails.inputMachineRootDiskSize().type('16385');
        cy.get('div').contains(clusterPropertiesFile.RootDiskSize.LimitError).should('be.visible');
        ClusterMachinePoolDetails.inputMachineRootDiskSize().type('555');
        ClusterMachinePoolDetails.addMachinePoolNodeLabelLink().should('be.enabled');
        ClusterMachinePoolDetails.addMachinePoolTaintLabelLink().should('be.enabled');
        ClusterMachinePoolDetails.enableAmazonEC2SpotInstanceCheckbox().check();
        ClusterMachinePoolDetails.useOnDemandInstancePriceRadio().should('be.checked');

        ClusterMachinePoolDetails.cancelMachinePoolDetailsButton().click();
      });

      it(`Step - Input Autoscaling, machinepool names for the ROSA ${clusterPropertiesFile.Availability} Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click();

        ClusterMachinePoolDetails.machinePoolNameInput().type(workerName);
        ClusterMachinePoolDetails.selectComputeNodeType(
          clusterPropertiesFile.MachinePools[0].InstanceType,
        );

        ClusterMachinePoolDetails.enableMachinePoolAutoscalingCheckbox().check();

        ClusterMachinePoolDetails.setMinimumNodeInputAutoScaling(
          clusterPropertiesFile.MachinePools[0].MinimumNodeCount,
        );

        ClusterMachinePoolDetails.setMaximumNodeInputAutoScaling(
          clusterPropertiesFile.MachinePools[0].MaximumNodeCount,
        );
      });

      it(`Step - Input Node labels and Taints for the ROSA ${clusterPropertiesFile.Availability} Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.editMachinePoolNodeLabelsandTaintsLink();
        ClusterMachinePoolDetails.addMachinePoolNodeLabelKey(
          clusterPropertiesFile.NodeLabel[0].Key,
          0,
        );
        ClusterMachinePoolDetails.addMachinePoolNodeLabelValue(
          clusterPropertiesFile.NodeLabel[0].Value,
          0,
        );

        ClusterMachinePoolDetails.addMachinePoolNodeLabelLink().click();

        ClusterMachinePoolDetails.addMachinePoolNodeLabelKey(
          clusterPropertiesFile.NodeLabel[1].Key,
          1,
        );
        ClusterMachinePoolDetails.addMachinePoolNodeLabelValue(
          clusterPropertiesFile.NodeLabel[1].Value,
          1,
        );

        ClusterMachinePoolDetails.addMachinePoolTaintsKey(clusterPropertiesFile.Taints[0].Key, 0);
        ClusterMachinePoolDetails.addMachinePoolTaintsValue(
          clusterPropertiesFile.Taints[0].Value,
          0,
        );
        ClusterMachinePoolDetails.selectMachinePoolTaintsEffectType(
          clusterPropertiesFile.Taints[0].Effect,
          0,
        );

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
      });

      it(`Step - Input the Amazon EC2 Spot Instance for the ROSA ${clusterPropertiesFile.Availability} Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.enableAmazonEC2SpotInstanceCheckbox();
        ClusterMachinePoolDetails.useSetMaxPriceRadio().check();
        ClusterMachinePoolDetails.setMaxPriceInput()
          .clear()
          .type(clusterPropertiesFile.SetMaximumPrice);
        ClusterMachinePoolDetails.addMachinePoolButtonFromModal().click();
      });

      it(`Step - Expand and verify the ROSA ${clusterPropertiesFile.Availability} machine pool details created in the previous step`, () => {
        ClusterMachinePoolDetails.clickMachinePoolExpandableCollapsible(0, 0);

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

      it(`Step - Verify the ROSA ${clusterPropertiesFile.Availability} details on the Overview page`, () => {
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

      it(`Step - Delete the ROSA ${clusterPropertiesFile.Availability} machine pool created in the above steps`, () => {
        ClusterDetailsPage.machinePoolsTab().click();
        ClusterMachinePoolDetails.deleteWorkerMachinePool(workerName);
      });
    });
  },
);
