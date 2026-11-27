import { expect, test } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const machinePoolFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-machine-pool-security-groups.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const { MinimumNodeCount, MaximumNodeCount } = machinePoolFixture.Autoscaling;
const clusterName = process.env.CLUSTER_NAME || clusterProperties.ClusterName;
let infraRegions: Record<
  string,
  {
    SECURITY_GROUPS?: string[];
    SECURITY_GROUPS_NAME?: string[];
    SUBNETS?: { ZONES?: Record<string, { PRIVATE_SUBNET_NAME?: string }> };
  }[]
> = {};
try {
  infraRegions = JSON.parse(process.env.QE_INFRA_REGIONS || '{}');
} catch (error) {
  console.warn('Failed to parse QE_INFRA_REGIONS environment variable:', error);
}
const region = Object.keys(infraRegions)[0] || clusterProperties.Region.split(',')[0];
const qeInfrastructure = infraRegions[region]?.[0] || {};
const securityGroupNames = qeInfrastructure.SECURITY_GROUPS_NAME || [];
const securityGroupIds = qeInfrastructure.SECURITY_GROUPS || [];
const securityGroupName = securityGroupNames[0];
const securityGroupId = securityGroupIds[0];
const privateSubnetName = Object.values(qeInfrastructure.SUBNETS?.ZONES || {})[0]
  ?.PRIVATE_SUBNET_NAME;

test.describe.serial(
  'ROSA HCP Machine Pool - Security groups',
  {
    tag: [
      '@day2',
      '@advanced',
      '@rosa',
      '@rosa-hosted',
      '@machine-pool',
      '@hcp',
      '@security-groups',
    ],
  },
  () => {
    // HCP node pool names are limited to 15 characters.
    const machinePoolId = `mp-sg-${Math.random().toString(36).slice(2, 7)}`;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!securityGroupName || !securityGroupId) {
        throw new Error(
          `SECURITY_GROUPS_NAME/SECURITY_GROUPS is not defined in QE_INFRA_REGIONS for region "${region}"`,
        );
      }
      if (!privateSubnetName) {
        throw new Error(
          `SUBNETS.ZONES PRIVATE_SUBNET_NAME is not defined in QE_INFRA_REGIONS for region "${region}"`,
        );
      }
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to HCP cluster Machine pools tab', async ({
      clusterListPage,
      machinePoolsPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await machinePoolsPage.goToMachinePoolsTab();
    });

    test('Verify security group selection on the Add machine pool modal', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.goToSecurityGroupsTab();

      await expect(machinePoolsPage.securityGroupsDocsLink()).toBeVisible();
      await expect(machinePoolsPage.securityGroupsAwsConsoleLink()).toBeVisible();
      await expect(machinePoolsPage.securityGroupsToggle()).toBeVisible();
      await expect(machinePoolsPage.securityGroupsEmptyMessage()).toBeHidden();

      await machinePoolsPage.selectSecurityGroup(securityGroupName);
      await expect(machinePoolsPage.selectedSecurityGroup(securityGroupName)).toBeVisible();

      await machinePoolsPage.selectSecurityGroup(securityGroupName);
      await expect(machinePoolsPage.selectedSecurityGroup(securityGroupName)).toBeHidden();

      await machinePoolsPage.selectSecurityGroup(securityGroupName);
      await expect(machinePoolsPage.selectedSecurityGroup(securityGroupName)).toBeVisible();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Create a machine pool with an additional security group', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.fillHostedMachinePoolBasics(
        machinePoolId,
        privateSubnetName,
        MinimumNodeCount,
        MaximumNodeCount,
      );
      await machinePoolsPage.goToSecurityGroupsTab();
      await machinePoolsPage.selectSecurityGroup(securityGroupName);
      await expect(machinePoolsPage.selectedSecurityGroup(securityGroupName)).toBeVisible();

      const body = await machinePoolsPage.submitNewNodePool();
      expect(body.id).toBe(machinePoolId);
      expect(body.aws_node_pool?.additional_security_group_ids).toEqual([securityGroupId]);

      await expect(machinePoolsPage.getMachinePoolRow(machinePoolId)).toBeVisible({
        timeout: 60000,
      });
      await machinePoolsPage.expandMachinePoolRow(machinePoolId);
      await machinePoolsPage.verifySecurityGroup(machinePoolId, securityGroupName);
    });

    test('Verify security groups are immutable when editing the machine pool', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(machinePoolId);
      await machinePoolsPage.goToSecurityGroupsTab();

      await expect(machinePoolsPage.securityGroupsNoChangeAlert()).toBeVisible();
      await expect(machinePoolsPage.securityGroupsImmutableAlert()).toBeVisible();
      await expect(machinePoolsPage.securityGroupsToggle()).toBeHidden();
      await expect(machinePoolsPage.securityGroupsEmptyMessage()).toBeHidden();
      await expect(machinePoolsPage.selectedSecurityGroup(securityGroupName)).toBeVisible();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Delete the security group machine pool', async ({ machinePoolsPage }) => {
      await machinePoolsPage.deleteMachinePool(machinePoolId);
    });

    test.afterAll(async ({ machinePoolsPage }) => {
      try {
        await machinePoolsPage.dismissMachinePoolModalIfOpen();
      } catch (error) {
        console.error('afterAll: failed to dismiss machine pool modal', error);
      }
      try {
        await machinePoolsPage.goToMachinePoolsTab();
        await machinePoolsPage.deleteMachinePool(machinePoolId);
      } catch (error) {
        console.error(`Failed to delete machine pool ${machinePoolId} or already deleted`, error);
      }
    });
  },
);
