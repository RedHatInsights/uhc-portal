import { tools } from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const MultiAWSIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | AWS with Multi-Architecture Compute Machines',
  providerTitle: instructionsMapping.aws.multi.ipi.title,
  cloudProviderId: 'aws',
  instructionsMapping: instructionsMapping.aws.multi.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'AWS (multi-architecture)' },
  ],
};

export const MultiAzureIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Azure with Multi-Architecture Compute Machines',
  providerTitle: instructionsMapping.azure.multi.ipi.title,
  cloudProviderId: 'azure',
  instructionsMapping: instructionsMapping.azure.multi.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Microsoft Azure (multi-architecture)' },
  ],
};

export const MultiBareMetalUPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Baremetal with Multi-Architecture Compute Machines',
  providerTitle: instructionsMapping.baremetal.multi.upi.title,
  cloudProviderId: 'baremetal',
  showPreReleaseDocs: true,
  isUPI: true,
  instructionsMapping: instructionsMapping.baremetal.multi.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Baremetal (multi-architecture)' },
  ],
};

export const MultiPreReleaseProps = {
  appPageTitle:
    'Install OpenShift 4 | Multi-architecture clusters | Experimental Developer Preview Builds',
  providerTitle: 'Install OpenShift with multi-architecture compute machines',
  installer: tools.MULTIINSTALLER,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    {
      label: 'Multi-architecture clusters' /* , path: '/install/multi/installer-provisioned' */,
    },
    { label: 'Pre-Release Builds' },
  ],
};
