import React, { ReactNode } from 'react';

import { BreadcrumbPath } from '~/components/common/Breadcrumbs';

export type ProviderSpecificType = {
  abi?: string[] | ReactNode[];
  ai?: string[] | ReactNode[];
  upi?: string[] | ReactNode[];
  ipi?: string[] | ReactNode[];
};

export type InstallProps = {
  appPageTitle: string;
  providerTitle: string;
  breadCrumbsPaths: BreadcrumbPath[];
  name?: string;
  aiPageLink?: string;
  aiLearnMoreLink?: string;
  hideIPI?: boolean;
  ipiPageLink?: string;
  ipiLearnMoreLink?: string;
  hideUPI?: boolean;
  upiPageLink?: string;
  upiLearnMoreLink?: string;
  agentBasedPageLink?: string;
  agentBasedLearnMoreLink?: string;
  providerSpecificFeatures?: ProviderSpecificType;
  recommend?: 'ai' | 'ipi';
  customizations?: string;
  cloudProviderId?: string;
  instructionsMapping?: any;
  isUPI?: boolean;
  installationTypeId?: string;
  showPreReleaseDocs?: boolean;
  installer?: string;
};

export type InstallComponentProps = { componentChooser: string; propsData: InstallProps };

export type Routes = {
  path: string;
  element: React.JSX.Element;
};
