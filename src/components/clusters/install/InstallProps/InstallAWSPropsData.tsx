import links from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const AWSProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | AWS',
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
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | AWS Installer-Provisioned Infrastructure',
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
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | AWS User-Provisioned Infrastructure',
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
