import links from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';
import { InstallProps } from '../models/types';

export const NutanixProps: InstallProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Nutanix AOS',
  providerTitle: 'Nutanix AOS',
  aiPageLink: '/assisted-installer/clusters/~new',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  ipiPageLink: '/install/nutanix/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_NUTANIXIPI_GETTING_STARTED,
  upiPageLink: '',
  agentBasedPageLink: '',
  hideUPI: true,
  recommend: 'ipi',
  providerSpecificFeatures: {
    ipi: [
      'Hosts controlled with Nutanix AOS Cloud Provider',
      'For connected or air-gapped/restricted networks',
    ],
  },
  name: 'nutanix',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Nutanix AOS' },
  ],
};

export const NutanixIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Nutanix AOS Installer-Provisioned Infrastructure',
  providerTitle: instructionsMapping.nutanix.ipi.title,
  cloudProviderId: 'nutanix',
  instructionsMapping: instructionsMapping.nutanix.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Nutanix AOS', path: '/install/nutanix' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};
