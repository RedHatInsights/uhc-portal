import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterTypesPage } from '../../page-objects/cluster-types-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterTypesPage: ClusterTypesPage;

test.describe(
  'OCP-56051-User interface layout checks for create cluster installation types',
  { tag: ['@smoke'] },
  () => {
    test.beforeEach(async ({ browser }) => {
      // Setup: auth + navigate to install page
      const setup = await setupTestSuite(browser, 'install');

      sharedContext = setup.context;
      sharedPage = setup.page;

      // Initialize page objects for this test suite
      clusterTypesPage = new ClusterTypesPage(sharedPage);

      await clusterTypesPage.isClusterTypesScreen();
    });

    test.afterEach(async () => {
      await cleanupTestSuite(sharedContext);
    });

    test('Checks cluster installation types for cloud provider Alibaba Cloud', async () => {
      await clusterTypesPage.clickCloudProvider('Alibaba Cloud', true);
      await clusterTypesPage.isClusterTypesUrl('/install/alibaba');
      await clusterTypesPage.isClusterTypesHeader('Alibaba Cloud');
      await clusterTypesPage.isInteractive(true, true);
      await clusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
    });

    test('Checks cluster installation types for cloud provider AWS (x86_64)', async () => {
      await clusterTypesPage.clickCloudProvider('AWS (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/aws');
      await clusterTypesPage.isClusterTypesHeader('AWS');
      await clusterTypesPage.isAutomated('aws', 'AWS', '');
      await clusterTypesPage.isFullControl('aws', 'AWS', '');
    });

    test('Checks cluster installation types for cloud provider AWS (ARM)', async () => {
      await clusterTypesPage.clickCloudProvider('AWS (ARM)');
      await clusterTypesPage.isClusterTypesUrl('/install/aws/arm');
      await clusterTypesPage.isClusterTypesHeader('AWS (ARM)');
      await clusterTypesPage.isAutomated('aws', 'AWS', 'ARM');
      await clusterTypesPage.isFullControl('aws', 'AWS', 'ARM');
    });

    test('Checks cluster installation types for cloud provider AWS (multi-architecture)', async () => {
      await clusterTypesPage.clickCloudProvider('AWS (multi-architecture');
      await clusterTypesPage.isClusterTypesUrl('/install/aws/multi/installer-provisioned');
      await expect(
        sharedPage
          .locator('h1')
          .filter({ hasText: 'Install OpenShift on AWS with multi-architecture compute machines' }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Azure (x86_64)', async () => {
      await clusterTypesPage.clickCloudProvider('Azure (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/azure');
      await clusterTypesPage.isClusterTypesHeader('Azure');
      await clusterTypesPage.isAutomated('azure', 'Azure', '');
      await clusterTypesPage.isFullControl('azure', 'Azure', '');
    });

    test('Checks cluster installation types for cloud provider Azure (ARM)', async () => {
      await clusterTypesPage.clickCloudProvider('Azure (ARM)');
      await clusterTypesPage.isClusterTypesUrl('/install/azure/arm/installer-provisioned');
      await expect(
        sharedPage
          .locator('h1')
          .filter({
            hasText: 'Install OpenShift on Azure with installer-provisioned ARM infrastructure',
          }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Azure (multi-architecture)', async () => {
      await clusterTypesPage.clickCloudProvider('Azure (multi-architecture)');
      await clusterTypesPage.isClusterTypesUrl('/install/azure/multi/installer-provisioned');
      await expect(
        sharedPage
          .locator('h1')
          .filter({
            hasText: 'Install OpenShift on Azure with multi-architecture compute machines',
          }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Google Cloud', async () => {
      await clusterTypesPage.clickCloudProvider('Google Cloud');
      await clusterTypesPage.isClusterTypesUrl('/install/gcp');
      await clusterTypesPage.isClusterTypesHeader('GCP');
      await clusterTypesPage.isAutomated('gcp', 'GCP', '');
      await clusterTypesPage.isFullControl('gcp', 'GCP', '');
    });

    test('Checks cluster installation types for cloud provider IBM Cloud', async () => {
      await clusterTypesPage.clickCloudProvider('IBM Cloud');
      await clusterTypesPage.isClusterTypesUrl('/install/ibm-cloud');
      await expect(
        sharedPage
          .locator('h1')
          .filter({
            hasText: 'Install OpenShift on IBM Cloud with installer-provisioned infrastructure',
          }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Baremetal (multi-architecture)', async () => {
      await clusterTypesPage.clickCloudProvider('Baremetal (multi-architecture)');
      await clusterTypesPage.isClusterTypesUrl('/install/metal/multi');
      await expect(
        sharedPage
          .locator('h1')
          .filter({
            hasText: 'Install OpenShift on bare metal with multi-architecture compute machines',
          }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider IBM PowerVS (ppc64le)', async () => {
      await clusterTypesPage.clickCloudProvider('IBM PowerVS (ppc64le)');
      await clusterTypesPage.isClusterTypesUrl('/install/powervs/installer-provisioned');
      await expect(
        sharedPage
          .locator('h1')
          .filter({
            hasText:
              'Install OpenShift on IBM Power Systems Virtual Server with installer-provisioned infrastructure',
          }),
      ).toBeVisible();
    });

    test('Checks cluster installation types for cloud provider Platform Agnostic', async () => {
      await clusterTypesPage.clickCloudProvider('Platform agnostic (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/platform-agnostic');
      await clusterTypesPage.isClusterTypesHeader('Platform agnostic (x86_64)');
      await clusterTypesPage.isInteractive(true, true);
      await clusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
      await clusterTypesPage.isFullControl('platform-agnostic', 'any x86_64 platform', '', true);
    });

    test('Checks cluster installation types for cloud provider Oracle Cloud Infrastructure', async () => {
      await clusterTypesPage.clickCloudProvider('Oracle Cloud Infrastructure');
      await clusterTypesPage.isClusterTypesUrl('/install/oracle-cloud');
      await clusterTypesPage.isClusterTypesHeader('Oracle Cloud Infrastructure');
      await clusterTypesPage.isInteractive(true, true);
      await clusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
    });

    test('Checks cluster installation types for infrastructure provider Bare Metal (X86_64)', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Bare Metal (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/metal');
      await clusterTypesPage.isClusterTypesHeader('Bare Metal');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('Bare Metal', '');
      await clusterTypesPage.isAutomated('bare_metal', 'Bare Metal', '');
      await clusterTypesPage.isFullControl('bare-metal', 'Bare Metal', '');
    });

    test('Checks cluster installation types for infrastructure provider Bare Metal (ARM)', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Bare Metal (ARM)');
      await clusterTypesPage.isClusterTypesUrl('/install/arm');
      await clusterTypesPage.isClusterTypesHeader('ARM Bare Metal');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('ARM Bare Metal');
      await clusterTypesPage.isAutomated('bare_metal', 'ARM Bare Metal');
      await clusterTypesPage.isFullControl('bare-metal', 'ARM Bare Metal');
    });

    test('Checks cluster installation types for infrastructure provider Azure stack hub', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Azure Stack Hub');
      await clusterTypesPage.isClusterTypesUrl('/install/azure-stack-hub');
      await clusterTypesPage.isClusterTypesHeader('Azure Stack Hub');
      await clusterTypesPage.isAutomated('azure_stack_hub', 'Azure Stack Hub', '');
      await clusterTypesPage.isFullControl('azure_stack_hub', 'Azure Stack Hub');
    });

    test('Checks cluster installation types for infrastructure provider IBM Z (s390x)', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('IBM Z (s390x)');
      await clusterTypesPage.isClusterTypesUrl('/install/ibmz');
      await clusterTypesPage.isClusterTypesHeader('IBM Z (s390x)');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('IBM Z (s390x)');
      await clusterTypesPage.isFullControl('ibm-z', 'IBM Z (s390x)');
    });

    test('Checks cluster installation types for infrastructure provider IBM Power (ppc64le)', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('IBM Power (ppc64le)');
      await clusterTypesPage.isClusterTypesUrl('/install/power');
      await clusterTypesPage.isClusterTypesHeader('IBM Power (ppc64le)');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('IBM Power (ppc64le)');
      await clusterTypesPage.isFullControl('ibm-power', 'IBM Power (ppc64le)');
    });

    test('Checks cluster installation types for infrastructure provider Nutanix AOS', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Nutanix AOS');
      await clusterTypesPage.isClusterTypesUrl('/install/nutanix');
      await clusterTypesPage.isClusterTypesHeader('Nutanix AOS');
      await clusterTypesPage.isInteractive();
      await clusterTypesPage.isAutomated('nutanix', 'Nutanix AOS', '', true);
    });

    test('Checks cluster installation types for infrastructure provider Red Hat OpenStack', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Red Hat OpenStack');
      await clusterTypesPage.isClusterTypesUrl('/install/openstack');
      await clusterTypesPage.isClusterTypesHeader('OpenStack');
      await clusterTypesPage.isAutomated(
        'openstack-installer-custom',
        'Red Hat OpenStack Platform',
      );
      await clusterTypesPage.isFullControl('openstack-user', 'Red Hat OpenStack Platform');
    });

    test('Checks cluster installation types for infrastructure provider vSphere', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('vSphere');
      await clusterTypesPage.isClusterTypesUrl('/install/vsphere');
      await clusterTypesPage.isClusterTypesHeader('VMware vSphere');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('vSphere');
      await clusterTypesPage.isAutomated('vsphere-installer-provisioned', 'vSphere');
      await clusterTypesPage.isFullControl('vsphere', 'vSphere');
    });

    test('Checks cluster installation types for infrastructure provider Platform agnostic (x86_64)', async () => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Platform agnostic (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/platform-agnostic');
      await clusterTypesPage.isClusterTypesHeader('Platform agnostic (x86_64)');
      await clusterTypesPage.isInteractive(true, true);
      await clusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
      await clusterTypesPage.isFullControl('platform-agnostic', 'any x86_64 platform', '', true);
    });
  },
);
