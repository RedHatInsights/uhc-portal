import ClusterTypesPage from '../../pageobjects/ClusterTypes.page';

describe(
  'OCP-56051-User interface layout checks for create cluster installation types',
  { tags: ['smoke'] },
  () => {
    beforeEach(() => {
      cy.visit('/install');
      ClusterTypesPage.isClusterTypesScreen();
    });

    it('Checks cluster installation types for cloud provider Alibaba Cloud', () => {
      ClusterTypesPage.clickCloudProvider('Alibaba Cloud', true);
      ClusterTypesPage.isClusterTypesUrl('/install/alibaba');
      ClusterTypesPage.isClusterTypesHeader('Alibaba Cloud');
      ClusterTypesPage.isInteractive(true, true);
      ClusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
    });

    it('Checks cluster installation types for cloud provider AWS (x86_64)', () => {
      ClusterTypesPage.clickCloudProvider('AWS (x86_64)');
      ClusterTypesPage.isClusterTypesUrl('/install/aws');
      ClusterTypesPage.isClusterTypesHeader('AWS');
      ClusterTypesPage.isAutomated('aws', 'aws', '');
      ClusterTypesPage.isFullControl('aws', 'aws', '');
    });

    it('Checks cluster installation types for cloud provider AWS (ARM)', () => {
      ClusterTypesPage.clickCloudProvider('AWS (ARM)');
      ClusterTypesPage.isClusterTypesUrl('/install/aws/arm');
      ClusterTypesPage.isClusterTypesHeader('AWS (ARM)');
      ClusterTypesPage.isAutomated('aws', 'aws', 'arm');
      ClusterTypesPage.isFullControl('aws', 'aws', 'arm');
    });

    it('Checks cluster installation types for cloud provider AWS (multi-architecture)', () => {
      ClusterTypesPage.clickCloudProvider('AWS (multi-architecture');
      ClusterTypesPage.isClusterTypesUrl('/install/aws/multi/installer-provisioned');
      cy.get(
        'h1:contains(Install OpenShift on AWS with multi-architecture compute machines)',
      ).should('be.visible');
    });

    it('Checks cluster installation types for cloud provider Azure (x86_64)', () => {
      ClusterTypesPage.clickCloudProvider('Azure (x86_64)');
      ClusterTypesPage.isClusterTypesUrl('/install/azure');
      ClusterTypesPage.isClusterTypesHeader('Azure');
      ClusterTypesPage.isAutomated('azure', 'azure', '');
      ClusterTypesPage.isFullControl('azure', 'azure', '');
    });

    it('Checks cluster installation types for cloud provider Azure (ARM)', () => {
      ClusterTypesPage.clickCloudProvider('Azure (ARM)');
      ClusterTypesPage.isClusterTypesUrl('/install/azure/arm/installer-provisioned');
      cy.get(
        'h1:contains(Install OpenShift on Azure with installer-provisioned ARM infrastructure)',
      ).should('be.visible');
    });

    it('Checks cluster installation types for cloud provider Azure (multi-architecture)', () => {
      ClusterTypesPage.clickCloudProvider('Azure (multi-architecture)');
      ClusterTypesPage.isClusterTypesUrl('/install/azure/multi/installer-provisioned');
      cy.get(
        'h1:contains(Install OpenShift on Azure with multi-architecture compute machines)',
      ).should('be.visible');
    });

    it('Checks cluster installation types for cloud provider Google Cloud', () => {
      ClusterTypesPage.clickCloudProvider('Google Cloud');
      ClusterTypesPage.isClusterTypesUrl('/install/gcp');
      ClusterTypesPage.isClusterTypesHeader('Google Cloud');
      ClusterTypesPage.isAutomated('gcp', 'Google Cloud', '');
      ClusterTypesPage.isFullControl('gcp', 'Google Cloud', '');
    });

    it('Checks cluster installation types for cloud provider IBM Cloud', () => {
      ClusterTypesPage.clickCloudProvider('IBM Cloud');
      ClusterTypesPage.isClusterTypesUrl('/install/ibm-cloud');
      cy.get(
        'h1:contains(Install OpenShift on IBM Cloud with installer-provisioned infrastructure)',
      ).should('be.visible');
    });

    it('Checks cluster installation types for cloud provider Baremetal (multi-architecture)', () => {
      ClusterTypesPage.clickCloudProvider('Baremetal (multi-architecture)');
      ClusterTypesPage.isClusterTypesUrl('/install/metal/multi');
      cy.get(
        'h1:contains(Install OpenShift on bare metal with multi-architecture compute machines)',
      ).should('be.visible');
    });

    it('Checks cluster installation types for cloud provider IBM PowerVS (ppc64le)', () => {
      ClusterTypesPage.clickCloudProvider('IBM PowerVS (ppc64le)');
      ClusterTypesPage.isClusterTypesUrl('/install/powervs/installer-provisioned');
      cy.get(
        'h1:contains(Install OpenShift on IBM Power Systems Virtual Server with installer-provisioned infrastructure)',
      ).should('be.visible');
    });

    it('Checks cluster installation types for cloud provider Platform Agnostic', () => {
      ClusterTypesPage.clickCloudProvider('Platform agnostic (x86_64)');
      ClusterTypesPage.isClusterTypesUrl('/install/platform-agnostic');
      ClusterTypesPage.isClusterTypesHeader('Platform agnostic (x86_64)');
      ClusterTypesPage.isInteractive(true, true);
      ClusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
      ClusterTypesPage.isFullControl('platform-agnostic', 'any x86_64 platform', '', true);
    });

    it('Checks cluster installation types for cloud provider Oracle Cloud Infrastructure', () => {
      ClusterTypesPage.clickCloudProvider('Oracle Cloud Infrastructure');
      ClusterTypesPage.isClusterTypesUrl('/install/oracle-cloud');
      ClusterTypesPage.isClusterTypesHeader('Oracle Cloud Infrastructure');
      ClusterTypesPage.isInteractive(true, true);
      ClusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
    });

    it('Checks cluster installation types for infrastructure provider Bare Metal (X86_64)', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('Bare Metal (x86_64)');
      ClusterTypesPage.isClusterTypesUrl('/install/metal');
      ClusterTypesPage.isClusterTypesHeader('Bare Metal');
      ClusterTypesPage.isInteractive(false, true);
      ClusterTypesPage.isLocalAgentBased('bare metal', '', true);
      ClusterTypesPage.isAutomated('bare_metal', 'bare metal', '', true);
      ClusterTypesPage.isFullControl('bare-metal', 'bare metal', '', true);
    });

    it('Checks cluster installation types for infrastructure provider Bare Metal (ARM)', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('Bare Metal (ARM)');
      ClusterTypesPage.isClusterTypesUrl('/install/arm');
      ClusterTypesPage.isClusterTypesHeader('ARM Bare Metal');
      ClusterTypesPage.isInteractive(false, true);
      ClusterTypesPage.isLocalAgentBased('ARM Bare Metal', '', '');
      ClusterTypesPage.isAutomated('bare_metal', 'ARM bare metal', '', '');
      ClusterTypesPage.isFullControl('bare-metal', 'ARM bare metal', '', '');
    });

    it('Checks cluster installation types for infrastructure provider Azure stack hub', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('Azure Stack Hub');
      ClusterTypesPage.isClusterTypesUrl('/install/azure-stack-hub');
      ClusterTypesPage.isClusterTypesHeader('Azure Stack Hub');
      ClusterTypesPage.isAutomated('azure_stack_hub', 'Azure Stack Hub', '');
      ClusterTypesPage.isFullControl('azure_stack_hub', 'Azure Stack Hub', '', '');
    });

    it('Checks cluster installation types for infrastructure provider IBM Z (s390x)', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('IBM Z (s390x)');
      ClusterTypesPage.isClusterTypesUrl('/install/ibmz');
      ClusterTypesPage.isClusterTypesHeader('IBM Z (s390x)');
      ClusterTypesPage.isInteractive(false, true);
      ClusterTypesPage.isLocalAgentBased('IBM Z (s390x)', '', '');
      ClusterTypesPage.isFullControl('ibm-z', 'IBM Z (s390x)', '', '');
    });

    it('Checks cluster installation types for infrastructure provider IBM Power (ppc64le)', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('IBM Power (ppc64le)');
      ClusterTypesPage.isClusterTypesUrl('/install/power');
      ClusterTypesPage.isClusterTypesHeader('IBM Power (ppc64le)');
      ClusterTypesPage.isInteractive(false, true);
      ClusterTypesPage.isLocalAgentBased('IBM Power (ppc64le)', '', '');
      ClusterTypesPage.isFullControl('ibm-power', 'IBM Power (ppc64le)', '', '');
    });

    it('Checks cluster installation types for infrastructure provider Nutanix AOS', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('Nutanix AOS');
      ClusterTypesPage.isClusterTypesUrl('/install/nutanix');
      ClusterTypesPage.isClusterTypesHeader('Nutanix AOS');
      ClusterTypesPage.isInteractive();
      ClusterTypesPage.isAutomated('nutanix', 'Nutanix AOS', '', true);
    });

    it('Checks cluster installation types for infrastructure provider Red Hat OpenStack', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('Red Hat OpenStack');
      ClusterTypesPage.isClusterTypesUrl('/install/openstack');
      ClusterTypesPage.isClusterTypesHeader('OpenStack');
      ClusterTypesPage.isAutomated(
        'openstack-installer-custom',
        'Red Hat OpenStack Platform',
        '',
        '',
      );
      ClusterTypesPage.isFullControl('openstack-user', 'Red Hat OpenStack Platform', '', '');
    });

    it('Checks cluster installation types for infrastructure provider vSphere', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('vSphere');
      ClusterTypesPage.isClusterTypesUrl('/install/vsphere');
      ClusterTypesPage.isClusterTypesHeader('VMware vSphere');
      ClusterTypesPage.isInteractive(false, true);
      ClusterTypesPage.isLocalAgentBased('vSphere', '', '');
      ClusterTypesPage.isAutomated('vsphere-installer-provisioned', 'vSphere', '', '');
      ClusterTypesPage.isFullControl('vsphere', 'vSphere', '', '');
    });

    it('Checks cluster installation types for infrastructure provider Platform agnostic (x86_64)', () => {
      ClusterTypesPage.clickDatacenter();
      ClusterTypesPage.clickInfrastructureProvider('Platform agnostic (x86_64)');
      ClusterTypesPage.isClusterTypesUrl('/install/platform-agnostic');
      ClusterTypesPage.isClusterTypesHeader('Platform agnostic (x86_64)');
      ClusterTypesPage.isInteractive(true, true);
      ClusterTypesPage.isLocalAgentBased('any x86_64 platform', '', true);
      ClusterTypesPage.isFullControl('platform-agnostic', 'any x86_64 platform', '', true);
    });
  },
);
