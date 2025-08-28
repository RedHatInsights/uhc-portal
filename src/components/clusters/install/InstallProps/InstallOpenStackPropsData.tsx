import links from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const OpenStackProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | OpenStack',
  providerTitle: 'OpenStack',
  ipiPageLink: '/install/openstack/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_OSPIPI_GETTING_STARTED,
  upiPageLink: '/install/openstack/user-provisioned',
  upiLearnMoreLink: links.INSTALL_OSPUPI_GETTING_STARTED,
  providerSpecificFeatures: {
    ipi: ['Hosts controlled with OpenStack Provider'],
  },
  name: 'openstack',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Red Hat OpenStack Platform' },
  ],
};

export const OpenStackUPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | OpenStack User-Provisioned Infrastructure',
  providerTitle: instructionsMapping.openstack.upi.title,
  cloudProviderId: 'openstack',
  isUPI: true,
  instructionsMapping: instructionsMapping.openstack.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Red Hat OpenStack Platform', path: '/install/openstack' },
    { label: 'User-provisioned infrastructure' },
  ],
};

export const OpenStackIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | OpenStack Installer-Provisioned Infrastructure',
  providerTitle: instructionsMapping.openstack.ipi.title,
  cloudProviderId: 'openstack',
  instructionsMapping: instructionsMapping.openstack.ipi,
  customizations: instructionsMapping.openstack.customizations,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Red Hat OpenStack Platform', path: '/install/openstack' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};
