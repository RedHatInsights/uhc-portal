import links from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

import { nonTestedPlatformsLink } from './InstallWrapperPropsData';

export const PlatformAgnosticProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | x86_64 User-Provisioned Infrastructure',
  providerTitle: 'Platform agnostic (x86_64)',
  aiPageLink: '/assisted-installer/clusters/~new',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  hideIPI: true,
  upiPageLink: '/install/platform-agnostic/user-provisioned',
  upiLearnMoreLink: links.INSTALL_GENERIC_GETTING_STARTED,
  agentBasedPageLink: '/install/platform-agnostic/agent-based',
  agentBasedLearnMoreLink: links.INSTALL_AGENT_LEARN_MORE,
  providerSpecificFeatures: {
    abi: [nonTestedPlatformsLink, 'For air-gapped/restricted networks'],
    ai: [nonTestedPlatformsLink],
    upi: [nonTestedPlatformsLink],
  },
  name: 'platform-agnostic',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Platform agnostic (x86_64)' },
  ],
};

export const PlatformAgnosticUPI = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | x86_64 User-Provisioned Infrastructure',
  providerTitle: instructionsMapping.generic.upi.title,
  cloudProviderId: 'generic',
  isUPI: true,
  instructionsMapping: instructionsMapping.generic.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Platform agnostic (x86_64)', path: '/install/platform-agnostic' },
    { label: 'x86_64 User-provisioned infrastructure' },
  ],
};

export const PlatformAgnosticABI = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | x86_64 Agent-based installer',
  providerTitle: instructionsMapping.generic.abi.title,
  cloudProviderId: 'generic',
  installationTypeId: 'local-agent-based',
  isUPI: true,
  instructionsMapping: instructionsMapping.generic.abi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Platform agnostic (x86_64)', path: '/install/platform-agnostic' },
    { label: 'Local Agent-based' },
  ],
};
