import links from '~/common/installLinks.mjs';

import { INSTALL_PAGE_PREFIX } from '../installConstants';
import instructionsMapping from '../instructions/instructionsMapping';

export const ASHIPIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Azure Stack Hub Installer-Provisioned Infrastructure`,
  providerTitle: instructionsMapping.ash.ipi.title,
  cloudProviderId: 'ash',
  customizations: instructionsMapping.ash.customizations,
  instructionsMapping: instructionsMapping.ash.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Microsoft Azure Stack Hub', path: '/install/azure-stack-hub' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};

export const ASHUPIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Azure Stack Hub User-Provisioned Infrastructure`,
  providerTitle: instructionsMapping.ash.upi.title,
  cloudProviderId: 'ash',
  isUPI: true,
  instructionsMapping: instructionsMapping.ash.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Microsoft Azure Stack Hub', path: '/install/azure-stack-hub' },
    { label: 'User-provisioned infrastructure' },
  ],
};

export const AzureProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Azure`,
  providerTitle: 'Azure',
  ipiPageLink: '/install/azure/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_AZUREIPI_GETTING_STARTED,
  upiPageLink: '/install/azure/user-provisioned',
  upiLearnMoreLink: links.INSTALL_AZUREUPI_GETTING_STARTED,
  providerSpecificFeatures: {
    ipi: ['Hosts controlled with Azure Provider'],
  },
  name: 'azure',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Microsoft Azure' },
  ],
};

export const AzureIPIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Azure Installer-Provisioned Infrastructure`,
  providerTitle: instructionsMapping.azure.x86.ipi.title,
  cloudProviderId: 'azure',
  customizations: instructionsMapping.azure.customizations,
  instructionsMapping: instructionsMapping.azure.x86.ipi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Microsoft Azure', path: '/install/azure' },
    { label: 'Installer-provisioned infrastructure' },
  ],
};

export const AzureUPIProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Azure User-Provisioned Infrastructure`,
  providerTitle: instructionsMapping.azure.x86.upi.title,
  cloudProviderId: 'azure',
  isUPI: true,
  instructionsMapping: instructionsMapping.azure.x86.upi,
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Microsoft Azure', path: '/install/azure' },
    { label: 'User-provisioned infrastructure' },
  ],
};

export const AzureStackHubProps = {
  appPageTitle: `${INSTALL_PAGE_PREFIX} | Azure Stack Hub`,
  providerTitle: 'Azure Stack Hub',
  ipiPageLink: '/install/azure-stack-hub/installer-provisioned',
  ipiLearnMoreLink: links.INSTALL_ASHIPI_GETTING_STARTED,
  upiPageLink: '/install/azure-stack-hub/user-provisioned',
  upiLearnMoreLink: links.INSTALL_ASHUPI_GETTING_STARTED,
  providerSpecificFeatures: {
    ipi: ['Hosts controlled with Azure Provider'],
  },
  name: 'azure-stack-hub',
  breadCrumbsPaths: [
    { label: 'Cluster List' },
    { label: 'Cluster Type', path: '/create' },
    { label: 'Microsoft Azure Stack Hub' },
  ],
};
