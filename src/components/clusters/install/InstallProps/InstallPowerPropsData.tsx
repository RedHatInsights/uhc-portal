import links, { tools } from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const PowerProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Power (ppc64le)',
  providerTitle: 'IBM Power (ppc64le)',
  aiPageLink: '/assisted-installer/clusters/~new',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  upiPageLink: '/install/power/user-provisioned',
  upiLearnMoreLink: links.INSTALL_POWER_UPI_GETTING_STARTED,
  agentBasedPageLink: '/install/power/agent-based',
  agentBasedLearnMoreLink: links.INSTALL_AGENT_LEARN_MORE,
  hideIPI: true,
  providerSpecificFeatures: {
    abi: ['For connected or air-gapped/restricted networks'],
    ipi: [
      'Hosts controlled with IBM Power (ppc64le) Cloud Provider',
      'For connected or air-gapped/restricted networks',
    ],
    upi: ['For connected or air-gapped/restricted networks'],
  },
  name: 'Power',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Power (ppc64le)' },
  ],
};

export const PowerABIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Power (ppc64le) Agent-based installer',
  providerTitle: instructionsMapping.baremetal.ppc.abi.title,
  cloudProviderId: 'baremetal',
  isUPI: true,
  installationTypeId: 'local-agent-based',
  instructionsMapping: instructionsMapping.baremetal.ppc.abi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Power (ppc64le)', path: '/install/power' },
    { label: 'Local Agent-based' },
  ],
};

export const PowerPreReleaseProps = {
  appPageTitle: 'Install OpenShift 4 | IBM Power (ppc64le) | Experimental Developer Preview Builds',
  providerTitle: 'Install OpenShift on IBM Power (ppc64le) with user-provisioned infrastructure',
  installer: tools.PPCINSTALLER,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Power (ppc64le)', path: '/install/power/user-provisioned' },
    { label: 'Pre-Release Builds' },
  ],
};

export const PowerUPIProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Power (ppc64le)',
  providerTitle: instructionsMapping.baremetal.ppc.upi.title,
  cloudProviderId: 'baremetal',
  isUPI: true,
  instructionsMapping: instructionsMapping.baremetal.ppc.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Power (ppc64le)', path: '/install/power' },
    { label: 'User-provisioned infrastructure' },
  ],
};

export const PowerVirtualServerIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Power Systems Virtual Server Installer-Provisioned Infrastructure',
  providerTitle: instructionsMapping.ibmCloud.powervs.ipi.title,
  cloudProviderId: 'ibmCloud',
  showPreReleaseDocs: true,
  instructionsMapping: instructionsMapping.ibmCloud.powervs.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM PowerVS (ppc64le)' },
  ],
};
