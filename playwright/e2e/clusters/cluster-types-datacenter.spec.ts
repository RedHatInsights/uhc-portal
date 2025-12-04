import { test, expect } from '../../fixtures/pages';

test.describe(
  'OCP-56051-User interface layout checks for create cluster installation types in Datacenter tab',
  { tag: ['@smoke', '@cluster-types'] },
  () => {
    test.beforeEach(async ({ navigateTo, clusterTypesPage }) => {
      // Navigate to install page
      await navigateTo('install');
      await clusterTypesPage.isClusterTypesScreen();
    });

    test('Checks cluster installation types for infrastructure provider Bare Metal (X86_64)', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Bare Metal (x86_64)');
      await clusterTypesPage.isClusterTypesUrl('/install/metal');
      await clusterTypesPage.isClusterTypesHeader('Bare Metal');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('Bare Metal', '');
      await clusterTypesPage.isAutomated('bare_metal', 'Bare Metal', '');
      await clusterTypesPage.isFullControl('bare-metal', 'Bare Metal', '');
    });

    test('Checks cluster installation types for infrastructure provider Bare Metal (ARM)', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Bare Metal (ARM)');
      await clusterTypesPage.isClusterTypesUrl('/install/arm');
      await clusterTypesPage.isClusterTypesHeader('ARM Bare Metal');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('ARM Bare Metal');
      await clusterTypesPage.isAutomated('bare_metal', 'ARM Bare Metal');
      await clusterTypesPage.isFullControl('bare-metal', 'ARM Bare Metal');
    });

    test('Checks cluster installation types for infrastructure provider Azure stack hub', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Azure Stack Hub');
      await clusterTypesPage.isClusterTypesUrl('/install/azure-stack-hub');
      await clusterTypesPage.isClusterTypesHeader('Azure Stack Hub');
      await clusterTypesPage.isAutomated('azure_stack_hub', 'Azure Stack Hub', '');
      await clusterTypesPage.isFullControl('azure_stack_hub', 'Azure Stack Hub');
    });

    test('Checks cluster installation types for infrastructure provider IBM Z (s390x)', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('IBM Z (s390x)');
      await clusterTypesPage.isClusterTypesUrl('/install/ibmz');
      await clusterTypesPage.isClusterTypesHeader('IBM Z (s390x)');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('IBM Z (s390x)');
      await clusterTypesPage.isFullControl('ibm-z', 'IBM Z (s390x)');
    });

    test('Checks cluster installation types for infrastructure provider IBM Power (ppc64le)', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('IBM Power (ppc64le)');
      await clusterTypesPage.isClusterTypesUrl('/install/power');
      await clusterTypesPage.isClusterTypesHeader('IBM Power (ppc64le)');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('IBM Power (ppc64le)');
      await clusterTypesPage.isFullControl('ibm-power', 'IBM Power (ppc64le)');
    });

    test('Checks cluster installation types for infrastructure provider Nutanix AOS', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Nutanix AOS');
      await clusterTypesPage.isClusterTypesUrl('/install/nutanix');
      await clusterTypesPage.isClusterTypesHeader('Nutanix AOS');
      await clusterTypesPage.isInteractive();
      await clusterTypesPage.isAutomated('nutanix', 'Nutanix AOS', '', true);
    });

    test('Checks cluster installation types for infrastructure provider Red Hat OpenStack', async ({
      clusterTypesPage,
    }) => {
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

    test('Checks cluster installation types for infrastructure provider vSphere', async ({
      clusterTypesPage,
    }) => {
      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('vSphere');
      await clusterTypesPage.isClusterTypesUrl('/install/vsphere');
      await clusterTypesPage.isClusterTypesHeader('VMware vSphere');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.isLocalAgentBased('vSphere');
      await clusterTypesPage.isAutomated('vsphere-installer-provisioned', 'vSphere');
      await clusterTypesPage.isFullControl('vsphere', 'vSphere');
    });

    test('Checks cluster installation types for infrastructure provider Platform agnostic (x86_64)', async ({
      clusterTypesPage,
    }) => {
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
