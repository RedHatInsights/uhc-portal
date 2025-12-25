import React, { ReactNode } from 'react';

import installLinks from '~/common/installLinks.mjs';

import { AdvancedClusterManagementDrawerPanelBody } from './DrawerPanelContents/AdvancedClusterManagement/DrawerPanelBody';
import { AdvancedClusterSecurityDrawerPanelBody } from './DrawerPanelContents/AdvancedClusterSecurity/DrawerPanelBody';
import { GeneralDrawerPanelHead } from './DrawerPanelContents/GeneralDrawerPanelHead';
import { GitopsDrawerPanelBody } from './DrawerPanelContents/Gitops/DrawerPanelBody';
import { OpenShiftAiDrawerPanelBody } from './DrawerPanelContents/OpenshiftAi/DrawerPanelBody';
import { OpenShiftVirtualizationPanelBody } from './DrawerPanelContents/OpenShiftVirtualization/DrawerPanelBody';
import { PipelinesDrawerPanelBody } from './DrawerPanelContents/Pipelines/DrawerPanelBody';
import { ServiceMeshDrawerPanelBody } from './DrawerPanelContents/ServiceMesh/DrawerPanelBody';
import PRODUCT_CARD_LOGOS from './ProductCardLogos';

import './DrawerPanelContent.scss';

type DrawerPanelContentNode = {
  head?: ReactNode;
  body: ReactNode;
};

const DRAWER_PANEL_CONTENT = {
  gitops: {
    head: <GeneralDrawerPanelHead {...PRODUCT_CARD_LOGOS.gitops} />,
    body: GitopsDrawerPanelBody,
  },
  pipelines: {
    head: <GeneralDrawerPanelHead {...PRODUCT_CARD_LOGOS.pipelines} />,
    body: PipelinesDrawerPanelBody,
  },
  serviceMesh: {
    head: <GeneralDrawerPanelHead {...PRODUCT_CARD_LOGOS.serviceMesh} />,
    body: ServiceMeshDrawerPanelBody,
  },
  advancedClusterSecurity: {
    head: (
      <GeneralDrawerPanelHead
        {...PRODUCT_CARD_LOGOS.advancedClusterSecurity}
        trialButtonLink={installLinks.RH_ACS_TRIAL}
      />
    ),
    body: AdvancedClusterSecurityDrawerPanelBody,
  },
  OpenshiftAi: {
    head: (
      <GeneralDrawerPanelHead
        {...PRODUCT_CARD_LOGOS.openshiftAi}
        trialButtonLink={installLinks.RH_OPENSHIFT_AI_TRIAL}
      />
    ),
    body: OpenShiftAiDrawerPanelBody,
  },
  OpenshiftVirtualization: {
    head: <GeneralDrawerPanelHead {...PRODUCT_CARD_LOGOS.openshiftVirtualization} />,
    body: OpenShiftVirtualizationPanelBody,
  },
  AdvancedClusterManagement: {
    head: (
      <GeneralDrawerPanelHead
        {...PRODUCT_CARD_LOGOS.advancedClusterManagement}
        trialButtonLink={installLinks.RH_ACM_TRIAL}
      />
    ),
    body: AdvancedClusterManagementDrawerPanelBody,
  },
};

export { DRAWER_PANEL_CONTENT, DrawerPanelContentNode };
