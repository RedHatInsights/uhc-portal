import React, { ReactNode } from 'react';

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
        trialButtonLink="https://www.redhat.com/en/technologies/cloud-computing/openshift/advanced-cluster-security-kubernetes/trial"
      />
    ),
    body: AdvancedClusterSecurityDrawerPanelBody,
  },
  OpenshiftAi: {
    head: (
      <GeneralDrawerPanelHead
        {...PRODUCT_CARD_LOGOS.openshiftAi}
        trialButtonLink="https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai/trial"
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
        trialButtonLink="https://www.redhat.com/en/technologies/management/advanced-cluster-management/trial"
      />
    ),
    body: AdvancedClusterManagementDrawerPanelBody,
  },
};

export { DRAWER_PANEL_CONTENT, DrawerPanelContentNode };
