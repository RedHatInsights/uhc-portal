import { test } from '../../fixtures/pages';

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
      const installPath = 'install/metal';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Bare Metal (x86_64)');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('Bare Metal');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isLocalAgentBased('Bare Metal', '');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isAutomated('bare_metal', 'Bare Metal', '');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isFullControl('bare-metal', 'Bare Metal', '');
    });

    test('Checks cluster installation types for infrastructure provider Bare Metal (ARM)', async ({
      clusterTypesPage,
    }) => {
      const installPath = 'install/arm';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Bare Metal (ARM)');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('ARM Bare Metal');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isLocalAgentBased('ARM Bare Metal');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isAutomated('bare_metal', 'ARM Bare Metal');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isFullControl('bare-metal', 'ARM Bare Metal');
    });

    test('Checks cluster installation types for infrastructure provider Azure stack hub', async ({
      clusterTypesPage,
    }) => {
      const installPath = 'install/azure-stack-hub';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Azure Stack Hub');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('Azure Stack Hub');
      await clusterTypesPage.isAutomated('azure_stack_hub', 'Azure Stack Hub', '');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isFullControl('azure_stack_hub', 'Azure Stack Hub');
    });

    test('Checks cluster installation types for infrastructure provider IBM Z (s390x)', async ({
      clusterTypesPage,
    }) => {
      const installPath = 'install/ibmz';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('IBM Z (s390x)');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('IBM Z (s390x)');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isLocalAgentBased('IBM Z (s390x)');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isFullControl('ibm-z', 'IBM Z (s390x)');
    });

    test('Checks cluster installation types for infrastructure provider IBM Power (ppc64le)', async ({
      clusterTypesPage,
    }) => {
      const installPath = 'install/power';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('IBM Power (ppc64le)');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('IBM Power (ppc64le)');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isLocalAgentBased('IBM Power (ppc64le)');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isFullControl('ibm-power', 'IBM Power (ppc64le)');
    });

    test('Checks cluster installation types for infrastructure provider Nutanix AOS', async ({
      clusterTypesPage,
    }) => {
      const installPath = 'install/nutanix';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Nutanix AOS');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('Nutanix AOS');
      await clusterTypesPage.isInteractive(false, false);
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isAutomated('nutanix', 'Nutanix AOS', '', true);
    });

    test('Checks cluster installation types for infrastructure provider Red Hat OpenStack', async ({
      clusterTypesPage,
    }) => {
      const installPath = 'install/openstack';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Red Hat OpenStack');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('OpenStack');
      await clusterTypesPage.isAutomated(
        'openstack-installer-custom',
        'Red Hat OpenStack Platform',
      );
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isFullControl('openstack-user', 'Red Hat OpenStack Platform');
    });

    test('Checks cluster installation types for infrastructure provider vSphere', async ({
      clusterTypesPage,
    }) => {
      const installPath = 'install/vsphere';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('vSphere');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('VMware vSphere');
      await clusterTypesPage.isInteractive(false, true);
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isLocalAgentBased('vSphere');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isAutomated('vsphere-installer-provisioned', 'vSphere');
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isFullControl('vsphere', 'vSphere');
    });

    test('Checks cluster installation types for infrastructure provider Platform agnostic (x86_64)', async ({
      clusterTypesPage,
    }) => {
      const installPath = 'install/platform-agnostic';

      await clusterTypesPage.clickDatacenter();
      await clusterTypesPage.clickInfrastructureProvider('Platform agnostic (x86_64)');
      await clusterTypesPage.isClusterTypesUrl(`/${installPath}`);
      await clusterTypesPage.isClusterTypesHeader('Platform agnostic (x86_64)');
      await clusterTypesPage.isInteractive(true, true);
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
      await clusterTypesPage.returnToProvider(installPath);
      await clusterTypesPage.isFullControl('platform-agnostic', 'any x86_64 platform', '', true);
    });
  },
);
