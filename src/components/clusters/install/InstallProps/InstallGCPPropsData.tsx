import links from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const GCPProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Google Cloud',
  providerTitle: 'Google Cloud',
  ipiPageLink: '/install/gcp/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_GCPIPI_LEARN_MORE,
  upiPageLink: '/install/gcp/user-provisioned',
  upiLearnMoreLink: links.INSTALL_GCPUPI_GETTING_STARTED,
  providerSpecificFeatures: {
    ipi: ['Hosts controlled with Google Cloud'],
  },
  name: 'gcp',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Google Cloud' },
  ],
};

export const GCPIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Google Cloud Installer-Provisioned Infrastructure',
  providerTitle: instructionsMapping.gcp.ipi.title,
  cloudProviderId: 'gcp',
  instructionsMapping: instructionsMapping.gcp.ipi,
  customizations: instructionsMapping.gcp.customizations,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Google Cloud', path: '/install/gcp' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};

export const GCPUPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Google Cloud User-Provisioned Infrastructure',
  providerTitle: instructionsMapping.gcp.upi.title,
  cloudProviderId: 'gcp',
  isUPI: true,
  instructionsMapping: instructionsMapping.gcp.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Google Cloud', path: '/install/gcp' },
    { label: 'User-provisioned infrastructure' },
  ],
};
