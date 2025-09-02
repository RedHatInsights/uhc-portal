import React from 'react';

import links, { tools } from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

export const nonTestedPlatformsLink = (
  <>
    For&nbsp;
    <ExternalLink href={links.INSTALL_GENERIC_NON_TESTED_PLATFORMS} stopClickPropagation>
      non-tested platforms
    </ExternalLink>
  </>
);

// Example of props data for generic install component
export const AlibabaProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Alibaba Cloud',
  providerTitle: 'Alibaba Cloud',
  name: 'alibaba-cloud',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Alibaba Cloud' },
  ],
  aiPageLink: '/assisted-installer/clusters/~new',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  hideIPI: true,
  ipiPageLink: '',
  hideUPI: true,
  upiPageLink: '',
  agentBasedPageLink: '/install/platform-agnostic/agent-based',
  agentBasedLearnMoreLink: links.INSTALL_AGENT_LEARN_MORE,
  providerSpecificFeatures: {
    abi: [nonTestedPlatformsLink, 'For air-gapped/restricted networks'],
    ai: [nonTestedPlatformsLink],
    upi: [nonTestedPlatformsLink],
  },
};

export const PullSecretProps = {
  appPageTitle: 'Install OpenShift 4 | Pull Secret',
  providerTitle: 'Install OpenShift Container Platform 4',
  breadCrumbsPaths: [{ label: 'Downloads', path: '/downloads' }, { label: 'Pull secret' }],
};

export const PreReleaseProps = {
  appPageTitle: 'Install OpenShift 4 | Experimental Developer Preview Builds',
  providerTitle: 'Install OpenShift Container Platform 4',
  installer: tools.X86INSTALLER,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Pre-Release Builds' },
  ],
};

export const OracleCloudProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Oracle Cloud Infrastructure',
  providerTitle: 'Oracle Cloud Infrastructure',
  aiPageLink: '/assisted-installer/clusters/~new',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  hideIPI: true,
  ipiPageLink: '',
  hideUPI: true,
  upiPageLink: '',
  agentBasedPageLink: '/install/platform-agnostic/agent-based',
  agentBasedLearnMoreLink: links.INSTALL_AGENT_LEARN_MORE,
  providerSpecificFeatures: {
    abi: [nonTestedPlatformsLink, 'For air-gapped/restricted networks'],
    ai: [nonTestedPlatformsLink],
    upi: [nonTestedPlatformsLink],
  },
  name: 'oracle-cloud',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Oracle Cloud Infrastructure' },
  ],
};
