import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetails from '../../pageobjects/ClusterDetails.page';
import ClusterMachinePoolDetails from '../../pageobjects/ClusterMachinePoolDetails.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';

const workerName = `worker-` + (Math.random() + 1).toString(36).substring(4);

const clusterProfiles = require('../../fixtures/osd-aws/OsdAwsCcsCreatePublicCluster.json');
const profiles = ['osdccs-aws-public', 'osdccs-aws-public-advanced'];

describe(
  'OSD AWS CCS Public Cluster - Machine pools validation - Single and Multi Zone clusters (OCP-35970, OCP-35971, OCP-40585)',
  { tags: ['day2', 'osd', 'create', 'single-zone', 'multi-zone'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Navigate to the OSD Machine pools tab for .* cluster/)) {
        cy.visit(CLUSTER_LIST_PATH);
        ClusterListPage.waitForDataReady();
        ClusterListPage.isClusterListScreen();
        ClusterListPage.filterTxtField().should('be.visible').click();
      }
    });

    profiles.forEach((profileName) => {
      const day1Profile = clusterProfiles[profileName]['day1-profile'];
      const day2Profile = clusterProfiles[profileName]['day2-profile'];

      it(`Step - Navigate to the OSD Machine pools tab for ${day1Profile.ClusterName} cluster`, () => {
        ClusterListPage.filterTxtField().clear().type(day1Profile.ClusterName);
        ClusterListPage.waitForDataReady();
        ClusterListPage.openClusterDefinition(day1Profile.ClusterName);
        ClusterDetails.waitForInstallerScreenToLoad();
        ClusterDetails.machinePoolsTab().click();
      });

      it(`Step - Verify the elements of OSD ${day1Profile.ClusterName}  Machine pools tab`, () => {
        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Machine pool');
        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Instance type');

        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Availability zones');

        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Node count');
        ClusterMachinePoolDetails.verifyMachinePoolTableHeaderElements('Autoscaling');

        ClusterMachinePoolDetails.addMachinePoolDetailsButton().should('exist');
        ClusterMachinePoolDetails.editMachinePoolClusterAutoScalingButton().should('exist');

        if (day1Profile.Availability == 'Multi-zone') {
          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            day1Profile.MachinePools[0].AvailabilityZones[0],
          );
          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            1 * day1Profile.Nodes['Compute'],
          );
        } else {
          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            day1Profile.MachinePools[0].AvailabilityZones,
          );
          ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
            1 * day1Profile.Nodes['Compute'],
          );
        }

        ClusterMachinePoolDetails.verifyMachinePoolTableDefaultElementValues(
          day1Profile.MachinePools[0].InstanceType,
        );
      });

      it(`Step - Verify the default elements of OSD ${day1Profile.ClusterName} Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click();
        ClusterMachinePoolDetails.machinePoolNameInput().should('be.visible').click();
        ClusterMachinePoolDetails.selectComputeNodeType(day1Profile.MachinePools[0].InstanceType);
        ClusterMachinePoolDetails.enableMachinePoolAutoscalingCheckbox().should('not.be.checked');
        ClusterMachinePoolDetails.enableAmazonEC2SpotInstanceCheckbox().should('be.checked');

        ClusterMachinePoolDetails.editMachinePoolNodeLabelsandTaintsLink();
        ClusterMachinePoolDetails.closeMachinePoolDetailsButton().should('be.visible');
        ClusterMachinePoolDetails.cancelMachinePoolDetailsButton().click();
      });

      it(`Step - Verify the other elements of OSD ${day1Profile.ClusterName}  Add machine pool modal window`, () => {
        ClusterDetails.machinePoolsTab().click();
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click();
        ClusterMachinePoolDetails.machinePoolNameInput().type(workerName);
        ClusterMachinePoolDetails.selectMachinePoolComputeNodeCount(
          day1Profile.MachinePools[0].ComputeNodeCount,
        );

        ClusterMachinePoolDetails.editMachinePoolNodeLabelsandTaintsLink();

        ClusterMachinePoolDetails.addMachinePoolNodeLabelLink().should('be.enabled');
        ClusterMachinePoolDetails.addMachinePoolTaintLabelLink().should('be.enabled');
        ClusterMachinePoolDetails.enableAmazonEC2SpotInstanceCheckbox().check();
        ClusterMachinePoolDetails.useOnDemandInstancePriceRadio().should('be.checked');
        ClusterMachinePoolDetails.cancelMachinePoolDetailsButton().click();
      });

      it(`Step - Input Autoscaling, machinepool names for the OSD ${day1Profile.ClusterName} Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.addMachinePoolDetailsButton().click();
        ClusterMachinePoolDetails.machinePoolNameInput().type(workerName);

        ClusterMachinePoolDetails.selectComputeNodeType(day1Profile.MachinePools[0].InstanceType);

        ClusterMachinePoolDetails.enableMachinePoolAutoscalingCheckbox().check();

        ClusterMachinePoolDetails.setMinimumNodeInputAutoScaling(
          day1Profile.MachinePools[0].MinimumNodeCount,
        );

        ClusterMachinePoolDetails.setMaximumNodeInputAutoScaling(
          day1Profile.MachinePools[0].MaximumNodeCount,
        );
      });

      it(`Step - Input Node labels and Taints for the OSD ${day1Profile.ClusterName} Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.editMachinePoolNodeLabelsandTaintsLink();
        ClusterMachinePoolDetails.addMachinePoolNodeLabelKey(
          day1Profile.MachinePools[0].NodeLabel[0].Key,
          0,
        );
        ClusterMachinePoolDetails.addMachinePoolNodeLabelValue(
          day1Profile.MachinePools[0].NodeLabel[0].Value,
          0,
        );

        ClusterMachinePoolDetails.addMachinePoolNodeLabelLink().click();

        ClusterMachinePoolDetails.addMachinePoolNodeLabelKey(
          day1Profile.MachinePools[0].NodeLabel[1].Key,
          1,
        );
        ClusterMachinePoolDetails.addMachinePoolNodeLabelValue(
          day1Profile.MachinePools[0].NodeLabel[1].Value,
          1,
        );

        ClusterMachinePoolDetails.addMachinePoolTaintsKey(
          day1Profile.MachinePools[0].Taints[0].Key,
          0,
        );
        ClusterMachinePoolDetails.addMachinePoolTaintsValue(
          day1Profile.MachinePools[0].Taints[0].Value,
          0,
        );
        ClusterMachinePoolDetails.selectMachinePoolTaintsEffectType(
          day1Profile.MachinePools[0].Taints[0].Effect,
          0,
        );

        ClusterMachinePoolDetails.addMachinePoolTaintLabelLink().click();

        ClusterMachinePoolDetails.addMachinePoolTaintsKey(
          day1Profile.MachinePools[0].Taints[1].Key,
          1,
        );
        ClusterMachinePoolDetails.addMachinePoolTaintsValue(
          day1Profile.MachinePools[0].Taints[1].Value,
          1,
        );
        ClusterMachinePoolDetails.selectMachinePoolTaintsEffectType(
          day1Profile.MachinePools[0].Taints[1].Effect,
          1,
        );
      });

      it(`Step - Input the Amazon EC2 Spot Instance for the OSD ${day1Profile.ClusterName}  Add machine pool modal window`, () => {
        ClusterMachinePoolDetails.enableAmazonEC2SpotInstanceCheckbox();

        ClusterMachinePoolDetails.useSetMaxPriceRadio().check();
        ClusterMachinePoolDetails.setMaxPriceInput().clear().type(day2Profile.SetMaximumPrice);
      });

      it(`Step - Expand and verify the OSD  machine pool details created in the previous step`, () => {
        ClusterMachinePoolDetails.addMachinePoolButtonFromModal().click();
        ClusterMachinePoolDetails.clickMachinePoolExpandableCollapsible(0, 2);

        ClusterMachinePoolDetails.validateTextforCreatedLabels(
          day1Profile.MachinePools[0].NodeLabel[0].Key,
          day1Profile.MachinePools[0].NodeLabel[0].Value,
        );

        ClusterMachinePoolDetails.validateTextforCreatedLabels(
          day1Profile.MachinePools[0].NodeLabel[1].Key,
          day1Profile.MachinePools[0].NodeLabel[1].Value,
        );

        ClusterMachinePoolDetails.validateTextforCreatedTaints(
          day1Profile.MachinePools[0].Taints[0].Key,
          day1Profile.MachinePools[0].Taints[0].Value,
          day1Profile.MachinePools[0].Taints[0].Effect,
        );

        ClusterMachinePoolDetails.validateTextforCreatedTaints(
          day1Profile.MachinePools[0].Taints[1].Key,
          day1Profile.MachinePools[0].Taints[1].Value,
          day1Profile.MachinePools[0].Taints[1].Effect,
        );

        ClusterMachinePoolDetails.validateTextforCreatedSpotInstances(day2Profile.SetMaximumPrice);

        if (day1Profile.Availability == 'Multi-zone') {
          ClusterMachinePoolDetails.validateTextforMultiZoneAutoScaling(
            day1Profile.MachinePools[0].MinimumNodeCount,
            day1Profile.MachinePools[0].MaximumNodeCount,
          );
        } else {
          ClusterMachinePoolDetails.validateTextforSingleZoneAutoScaling(
            day1Profile.MachinePools[0].MinimumNodeCount,
            day1Profile.MachinePools[0].MaximumNodeCount,
          );
        }
      });

      it(`Step - Verify the OSD ${day1Profile.ClusterName} details on the Overview page`, () => {
        ClusterDetails.overviewTab().click();

        ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
          'Nodes',
          day1Profile.Nodes['Control plane'],
        );
        ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
          'Nodes',
          day1Profile.Nodes['Infra'],
        );
        ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
          'Nodes',
          day1Profile.Nodes['Compute'],
        );

        if (day1Profile.Availability == 'Multi-zone') {
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
            'Autoscale',
            day1Profile.MachinePools[0].Autoscaling,
          );
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesMinAndMaxNodeCount(
            'Min:',
            `${day1Profile.MachinePools[0].MinimumNodeCount * 3}` * 2,
          );
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesMinAndMaxNodeCount(
            'Max:',
            `${day1Profile.MachinePools[0].MaximumNodeCount * 3}` * 2,
          );
        } else {
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesValue(
            'Autoscale',
            day2Profile.Autoscaling,
          );

          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesMinAndMaxNodeCount(
            'Min:',
            day1Profile.MachinePools[0].MinimumNodeCount * 1 + 1 * day1Profile.Nodes['Compute'],
          );
          ClusterMachinePoolDetails.isOverviewClusterPropertyMatchesMinAndMaxNodeCount(
            'Max:',
            day1Profile.MachinePools[0].MaximumNodeCount * 1 + 1 * day1Profile.Nodes['Compute'],
          );
        }
      });

      it(`Step - Delete the OSD ${day1Profile.ClusterName} machine pool created in the above steps`, () => {
        ClusterDetails.machinePoolsTab().click();
        ClusterMachinePoolDetails.clickMachinePoolExpandableCollapsible(0, 2);
        ClusterMachinePoolDetails.deleteWorkerMachinePool(workerName);
      });
    });
  },
);
