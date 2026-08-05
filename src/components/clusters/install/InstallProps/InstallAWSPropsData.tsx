import links from '~/common/installLinks.mjs';

import { INSTALL_PAGE_PREFIX } from '../installConstants';
import instructionsMapping from '../instructions/instructionsMapping';

export const AWSProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | AWS`,
  providerTitle: 'AWS',
  ipiPageLink: '/install/aws/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_AWSIPI_LEARN_MORE,
  upiPageLink: '/install/aws/user-provisioned',
  upiLearnMoreLink: links.INSTALL_AWSUPI_GETTING_STARTED,
  providerSpecificFeatures: {
    ipi: ['Hosts controlled with AWS Provider'],
  },
  name: 'aws',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Amazon Web Services' },
  ],
};

export const AWSIPIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | AWS Installer-Provisioned Infrastructure`,
  providerTitle: instructionsMapping.aws.x86.ipi.title,
  cloudProviderId: 'aws',
  customizations: instructionsMapping.aws.customizations,
  instructionsMapping: instructionsMapping.aws.x86.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Amazon Web Services', path: '/install/aws' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};

export const AWSUPIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | AWS User-Provisioned Infrastructure`,
  providerTitle: instructionsMapping.aws.x86.upi.title,
  cloudProviderId: 'aws',
  isUPI: true,
  instructionsMapping: instructionsMapping.aws.x86.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Amazon Web Services', path: '/install/aws' },
    { label: 'User-provisioned infrastructure' },
  ],
};
