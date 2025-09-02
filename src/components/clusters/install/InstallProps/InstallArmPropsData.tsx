import links, { tools } from '~/common/installLinks.mjs';

import instructionsMapping from '../instructions/instructionsMapping';

export const ArmAwsProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | AWS (ARM)',
  providerTitle: 'AWS (ARM)',
  providerSpecificFeatures: {
    ipi: ['Hosts controlled with AWS Provider'],
  },
  ipiPageLink: '/install/aws/arm/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_AWSIPI_LEARN_MORE,
  upiPageLink: '/install/aws/arm/user-provisioned',
  upiLearnMoreLink: links.INSTALL_AWSUPI_GETTING_STARTED,
  name: 'aws',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Amazon Web Services (ARM)' },
  ],
};

export const ArmAWSIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | AWS Installer-Provisioned ARM Infrastructure',
  providerTitle: instructionsMapping.aws.arm.ipi.title,
  customizations: instructionsMapping.aws.customizations,
  cloudProviderId: 'aws',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Amazon Web Services (ARM)', path: '/install/aws/arm' },
    { label: 'Installer-provisioned infrastructure' },
  ],
  instructionsMapping: instructionsMapping.aws.arm.ipi,
};

export const ArmAWSUPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | AWS User-Provisioned ARM Infrastructure',
  providerTitle: instructionsMapping.aws.arm.upi.title,
  cloudProviderId: 'aws',
  isUPI: true,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Amazon Web Services (ARM)', path: '/install/aws/arm' },
    { label: 'User-provisioned infrastructure' },
  ],
  instructionsMapping: instructionsMapping.aws.arm.upi,
};

export const ArmAzureIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Azure Installer-Provisioned ARM Infrastructure',
  providerTitle: instructionsMapping.azure.arm.ipi.title,
  customizations: instructionsMapping.azure.customizations,
  cloudProviderId: 'azure',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Microsoft Azure (ARM)' /* , path: '/install/azure' */ },
    /* { label: 'Installer-provisioned infrastructure' }, */
  ],
  instructionsMapping: instructionsMapping.azure.arm.ipi,
};

export const ArmBareMetalProps = {
  appPageTitle: 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | ARM Bare Metal',
  providerTitle: 'ARM Bare Metal',
  name: 'arm',
  ipiPageLink: '/install/arm/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_BAREMETAL_IPI_LEARN_MORE,
  upiPageLink: '/install/arm/user-provisioned',
  upiLearnMoreLink: links.INSTALL_BAREMETAL_UPI_GETTING_STARTED,
  aiPageLink: '/assisted-installer/clusters/~new?useArm=true',
  aiLearnMoreLink: links.INSTALL_ASSISTED_LEARN_MORE,
  agentBasedPageLink: '/install/arm/agent-based',
  agentBasedLearnMoreLink: links.INSTALL_AGENT_LEARN_MORE,
  providerSpecificFeatures: {
    abi: ['For air-gapped/restricted networks'],
    ipi: [
      'Hosts controlled with baseboard management controller (BMC)',
      'For air-gapped/restricted networks',
    ],
    upi: ['For air-gapped/restricted networks'],
  },
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'ARM Bare Metal' },
  ],
};

export const ArmBareMetalABIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Bare Metal Agent-based installer',
  providerTitle: instructionsMapping.baremetal.arm.abi.title,
  cloudProviderId: 'baremetal',
  installationTypeId: 'local-agent-based',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'ARM Bare Metal', path: '/install/arm' },
    { label: 'Local Agent-based' },
  ],
  isUPI: true,
  instructionsMapping: instructionsMapping.baremetal.arm.abi,
};

export const ArmBareMetalIPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | ARM Bare Metal Installer-Provisioned Infrastructure',
  providerTitle: instructionsMapping.baremetal.arm.ipi.title,
  cloudProviderId: 'baremetal',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'ARM Bare Metal', path: '/install/arm' },
    { label: 'Installer-provisioned infrastructure' },
  ],
  instructionsMapping: instructionsMapping.baremetal.arm.ipi,
};

export const ArmBareMetalUPIProps = {
  appPageTitle:
    'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | ARM Bare Metal User-Provisioned Infrastructure',
  providerTitle: instructionsMapping.baremetal.arm.upi.title,
  cloudProviderId: 'baremetal',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'ARM Bare Metal', path: '/install/arm' },
    { label: 'User-provisioned infrastructure' },
  ],
  isUPI: true,
  instructionsMapping: instructionsMapping.baremetal.arm.upi,
};

export const ArmPreReleaseProps = {
  appPageTitle: 'Install OpenShift 4 | ARM | Experimental Developer Preview Builds',
  providerTitle: 'Install OpenShift Container Platform 4 on ARM',
  installer: tools.ARMINSTALLER,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'ARM Pre-Release Builds' },
  ],
};
