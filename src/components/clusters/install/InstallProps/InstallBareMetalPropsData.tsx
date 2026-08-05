import links from '~/common/installLinks.mjs';

import { INSTALL_PAGE_PREFIX } from '../installConstants';
import instructionsMapping from '../instructions/instructionsMapping';

export const BareMetalABIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Bare Metal Agent-based installer`,
  providerTitle: instructionsMapping.baremetal.x86.abi.title,
  cloudProviderId: 'baremetal',
  installationTypeId: 'local-agent-based',
  instructionsMapping: instructionsMapping.baremetal.x86.abi,
  isUPI: true,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Bare Metal', path: '/install/metal' },
    { label: 'Local Agent-based' },
  ],
};

export const BareMetalIPIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Bare Metal Installer-Provisioned Infrastructure`,
  providerTitle: instructionsMapping.baremetal.x86.ipi.title,
  cloudProviderId: 'baremetal',
  instructionsMapping: instructionsMapping.baremetal.x86.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Bare Metal', path: '/install/metal' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};

export const BareMetalUPIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Bare Metal User-Provisioned Infrastructure`,
  providerTitle: instructionsMapping.baremetal.x86.upi.title,
  cloudProviderId: 'baremetal',
  isUPI: true,
  instructionsMapping: instructionsMapping.baremetal.x86.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Bare Metal', path: '/install/metal' },
    { label: 'User-provisioned infrastructure' },
  ],
};

export const BareMetalProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Bare Metal`,
  providerTitle: 'Bare Metal',
  aiPageLink: '/assisted-installer/clusters/~new',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  ipiPageLink: '/install/metal/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_BAREMETAL_IPI_LEARN_MORE,
  upiPageLink: '/install/metal/user-provisioned',
  upiLearnMoreLink: links.INSTALL_BAREMETAL_UPI_GETTING_STARTED,
  agentBasedPageLink: '/install/metal/agent-based',
  agentBasedLearnMoreLink: links.INSTALL_AGENT_LEARN_MORE,
  providerSpecificFeatures: {
    abi: ['For air-gapped/restricted networks'],
    ipi: [
      'Hosts controlled with baseboard management controller (BMC)',
      'For air-gapped/restricted networks',
    ],
    upi: ['For air-gapped/restricted networks'],
  },
  name: 'metal',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Bare Metal' },
  ],
};
