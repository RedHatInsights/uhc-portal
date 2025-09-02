import links, { tools } from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const IBMCloudProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Cloud',
  providerTitle: instructionsMapping.ibmCloud.title,
  cloudProviderId: 'ibmCloud',
  instructionsMapping: instructionsMapping.ibmCloud,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Cloud' },
  ],
};

export const IBMZProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Z (s390x)',
  providerTitle: 'IBM Z (s390x)',
  aiPageLink: '/assisted-installer/clusters/~new',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  upiPageLink: '/install/ibmz/user-provisioned',
  upiLearnMoreLink: links.INSTALL_IBMZ_UPI_GETTING_STARTED,
  agentBasedPageLink: '/install/ibmz/agent-based',
  agentBasedLearnMoreLink: links.INSTALL_AGENT_LEARN_MORE,
  hideIPI: true,
  providerSpecificFeatures: {
    abi: ['For connected or air-gapped/restricted networks'],
    ipi: [
      'Hosts controlled with Ibmz Cloud Provider',
      'For connected or air-gapped/restricted networks',
    ],
    upi: ['For connected or air-gapped/restricted networks'],
  },
  name: 'Ibmz',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Z (s390x)' },
  ],
};

export const IBMZABIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Z (s390x) Agent-based installer',
  providerTitle: instructionsMapping.baremetal.s390x.abi.title,
  cloudProviderId: 'baremetal',
  instructionsMapping: instructionsMapping.baremetal.s390x.abi,
  installationTypeId: 'local-agent-based',
  customizations: instructionsMapping.baremetal.s390x.customizations,
  isUPI: true,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Z (s390x)', path: '/install/ibmz' },
    { label: 'Local Agent-based' },
  ],
};

export const IBMZUPIProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Z (s390x)',
  providerTitle: instructionsMapping.baremetal.s390x.upi.title,
  cloudProviderId: 'baremetal',
  isUPI: true,
  instructionsMapping: instructionsMapping.baremetal.s390x.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Z (s390x)', path: '/install/ibmz' },
    { label: 'User-provisioned infrastructure' },
  ],
};

export const IBMZPreReleaseProps = {
  appPageTitle: 'Install OpenShift 4 | IBM Z | Experimental Developer Preview Builds',
  providerTitle: 'Install OpenShift on IBM Z with user-provisioned infrastructure',
  installer: tools.IBMZINSTALLER,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'IBM Z', path: '/install/ibmz/user-provisioned' },
    { label: 'Pre-Release Builds' },
  ],
};
