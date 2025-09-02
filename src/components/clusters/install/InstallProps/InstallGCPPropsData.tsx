import links from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const GCPProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | GCP',
  providerTitle: 'GCP',
  ipiPageLink: '/install/gcp/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_GCPIPI_LEARN_MORE,
  upiPageLink: '/install/gcp/user-provisioned',
  upiLearnMoreLink: links.INSTALL_GCPUPI_GETTING_STARTED,
  providerSpecificFeatures: {
    ipi: ['Hosts controlled with Google Cloud Provider'],
  },
  name: 'gcp',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Google Cloud Platform' },
  ],
};

export const GCPIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | GCP Installer-Provisioned Infrastructure',
  providerTitle: instructionsMapping.gcp.ipi.title,
  cloudProviderId: 'gcp',
  instructionsMapping: instructionsMapping.gcp.ipi,
  customizations: instructionsMapping.gcp.customizations,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Google Cloud Platform', path: '/install/gcp' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};

export const GCPUPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | GCP User-Provisioned Infrastructure',
  providerTitle: instructionsMapping.gcp.upi.title,
  cloudProviderId: 'gcp',
  isUPI: true,
  instructionsMapping: instructionsMapping.gcp.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Google Cloud Platform', path: '/install/gcp' },
    { label: 'User-provisioned infrastructure' },
  ],
};
