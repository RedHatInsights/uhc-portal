import { test, expect } from '../../fixtures/pages';

test.describe(
  'OCP-56051-User interface layout checks for create cluster installation types in Cloud tab',
  { tag: ['@smoke', '@cluster-types'] },
  () => {
    test.beforeEach(async ({ navigateTo, clusterTypesPage }) => {
      // Navigate to install page
      await navigateTo('install');
      await clusterTypesPage.isClusterTypesScreen();
    });
    test('Checks cluster installation types for cloud provider Alibaba Cloud', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('Alibaba Cloud', true);
      await clusterTypesPage.isClusterTypesUrl('/install/alibaba');
      await clusterTypesPage.isClusterTypesHeader('Alibaba Cloud');
      await clusterTypesPage.isInteractive(true, true);
      await clusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
    });

    test('Checks cluster installation types for cloud provider AWS (x86_64)', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('AWS (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/aws');
      await clusterTypesPage.isClusterTypesHeader('AWS');
      await clusterTypesPage.isAutomated('aws', 'AWS', '');
      await clusterTypesPage.isFullControl('aws', 'AWS', '');
    });

    test('Checks cluster installation types for cloud provider AWS (ARM)', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('AWS (ARM)');
      await clusterTypesPage.isClusterTypesUrl('/install/aws/arm');
      await clusterTypesPage.isClusterTypesHeader('AWS (ARM)');
      await clusterTypesPage.isAutomated('aws', 'AWS', 'ARM');
      await clusterTypesPage.isFullControl('aws', 'AWS', 'ARM');
    });

    test('Checks cluster installation types for cloud provider AWS (multi-architecture)', async ({
      page,
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('AWS (multi-architecture');
      await clusterTypesPage.isClusterTypesUrl('/install/aws/multi/installer-provisioned');
      await expect(
        page
          .locator('h1')
          .filter({ hasText: 'Install OpenShift on AWS with multi-architecture compute machines' }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Azure (x86_64)', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('Azure (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/azure');
      await clusterTypesPage.isClusterTypesHeader('Azure');
      await clusterTypesPage.isAutomated('azure', 'Azure', '');
      await clusterTypesPage.isFullControl('azure', 'Azure', '');
    });

    test('Checks cluster installation types for cloud provider Azure (ARM)', async ({
      page,
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('Azure (ARM)');
      await clusterTypesPage.isClusterTypesUrl('/install/azure/arm/installer-provisioned');
      await expect(
        page.locator('h1').filter({
          hasText: 'Install OpenShift on Azure with installer-provisioned ARM infrastructure',
        }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Azure (multi-architecture)', async ({
      page,
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('Azure (multi-architecture)');
      await clusterTypesPage.isClusterTypesUrl('/install/azure/multi/installer-provisioned');
      await expect(
        page.locator('h1').filter({
          hasText: 'Install OpenShift on Azure with multi-architecture compute machines',
        }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Google Cloud', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('Google Cloud');
      await clusterTypesPage.isClusterTypesUrl('/install/gcp');
      await clusterTypesPage.isClusterTypesHeader('Google Cloud');
      await clusterTypesPage.isAutomated('gcp', 'Google Cloud', '');
      await clusterTypesPage.isFullControl('gcp', 'Google Cloud', '');
    });

    test('Checks cluster installation types for cloud provider IBM Cloud', async ({
      page,
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('IBM Cloud');
      await clusterTypesPage.isClusterTypesUrl('/install/ibm-cloud');
      await expect(
        page.locator('h1').filter({
          hasText: 'Install OpenShift on IBM Cloud with installer-provisioned infrastructure',
        }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Baremetal (multi-architecture)', async ({
      page,
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('Baremetal (multi-architecture)');
      await clusterTypesPage.isClusterTypesUrl('/install/metal/multi');
      await expect(
        page.locator('h1').filter({
          hasText: 'Install OpenShift on bare metal with multi-architecture compute machines',
        }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider IBM PowerVS (ppc64le)', async ({
      page,
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('IBM PowerVS (ppc64le)');
      await clusterTypesPage.isClusterTypesUrl('/install/powervs/installer-provisioned');
      await expect(
        page.locator('h1').filter({
          hasText:
            'Install OpenShift on IBM Power Systems Virtual Server with installer-provisioned infrastructure',
        }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Platform Agnostic', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('Platform agnostic (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/platform-agnostic');
      await clusterTypesPage.isClusterTypesHeader('Platform agnostic (x86_64)');
      await clusterTypesPage.isInteractive(true, true);
      await clusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
      await clusterTypesPage.isFullControl('platform-agnostic', 'any x86_64 platform', '', true);
    });

    test('Checks cluster installation types for cloud provider Oracle Cloud Infrastructure', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickCloudProvider('Oracle Cloud Infrastructure');
      await clusterTypesPage.isClusterTypesUrl('/install/oracle-cloud');
      await clusterTypesPage.isClusterTypesHeader('Oracle Cloud Infrastructure');
      await clusterTypesPage.isInteractive(true, true);
      await clusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
    });
  },
);
