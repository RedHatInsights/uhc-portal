import links from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const VSphereProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | vSphere',
  providerTitle: 'VMware vSphere',
  aiPageLink: '/assisted-installer/clusters/~new',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  ipiPageLink: '/install/vsphere/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_VSPHEREIPI_GETTING_STARTED,
  upiPageLink: '/install/vsphere/user-provisioned',
  upiLearnMoreLink: links.INSTALL_VSPHEREUPI_GETTING_STARTED,
  agentBasedPageLink: '/install/vsphere/agent-based',
  agentBasedLearnMoreLink: links.INSTALL_AGENT_LEARN_MORE,
  providerSpecificFeatures: {
    abi: ['For connected or air-gapped/restricted networks'],
    ipi: [
      'Hosts controlled with vSphere Cloud Provider',
      'For connected or air-gapped/restricted networks',
    ],
    upi: ['For connected or air-gapped/restricted networks'],
  },
  name: 'vsphere',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'VMware vSphere' },
  ],
};

export const VSpehereABIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | vSphere Agent-based installer',
  providerTitle: instructionsMapping.vsphere.abi.title,
  cloudProviderId: 'vsphere',
  installationTypeId: 'local-agent-based',
  isUPI: true,
  instructionsMapping: instructionsMapping.vsphere.abi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'VMware vSphere', path: '/install/vsphere' },
    { label: 'Local Agent-based' },
  ],
};

export const VSphereUPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | vSphere User-Provisioned Infrastructure',
  providerTitle: instructionsMapping.vsphere.upi.title,
  cloudProviderId: 'vsphere',
  isUPI: true,
  instructionsMapping: instructionsMapping.vsphere.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'VMware vSphere', path: '/install/vsphere' },
    { label: 'User-provisioned infrastructure' },
  ],
};

export const VSphereIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | vSphere Installer-Provisioned Infrastructure',
  providerTitle: instructionsMapping.vsphere.ipi.title,
  cloudProviderId: 'vsphere',
  customizations: instructionsMapping.vsphere.customizations,
  instructionsMapping: instructionsMapping.vsphere.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'VMware vSphere', path: '/install/vsphere' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};
