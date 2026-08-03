// import React from 'react';
import get from 'lodash/get';

// import { PreviewLabel } from '~/components/clusters/common/PreviewLabel';
import { ClusterWithPermissions } from '~/types/types';

import { normalizedProducts } from '../../../common/subscriptionTypes';

export const clusterType = (cluster: ClusterWithPermissions) => {
  // const creationDateStr = get(cluster, 'creation_timestamp', '');
  const clusterTypes = {
    [normalizedProducts.OCP]: {
      name: 'OCP',
      tooltip: 'Self-managed OpenShift Container Platform (OCP) cluster',
    },
    [normalizedProducts.OCP_AssistedInstall]: {
      name: 'OCP',
      tooltip: 'Self-managed OpenShift Container Platform (OCP) cluster',
    },
    [normalizedProducts.OSD]: {
      name: 'OSD',
      tooltip: 'OpenShift Dedicated (OSD) cluster managed by Red Hat',
    },
    [normalizedProducts.OSDTrial]: {
      name: 'OSD Trial',
      tooltip: 'OpenShift Dedicated (OSD) cluster trial managed by Red Hat',
    },
    [normalizedProducts.RHMI]: {
      name: 'RHMI',
      tooltip: 'Red Hat Managed Integration',
    },
    [normalizedProducts.ROSA]: {
      name: 'ROSA',
      tooltip: 'Red Hat OpenShift Service on AWS',
    },
    [normalizedProducts.ROSA_HyperShift]: {
      name: 'ROSA',
      tooltip: 'Red Hat OpenShift Service on AWS',
      // PreviewLabel will return null if created after creationDate.
      // Shorten text to "Preview" to take less space in table.
      // Suppress default margin-left CSS class, since we render it on its own line.
      // NOTE HCP is no longer tech preview - so commenting out
      // keeping as an example for future work
      // label: <PreviewLabel creationDateStr={creationDateStr} text="Preview" className="" />,
    },
    [normalizedProducts.ARO]: {
      name: 'ARO',
      tooltip: 'Red Hat OpenShift Service on Azure',
    },
    [normalizedProducts.RHOIC]: {
      name: 'RHOIC',
      tooltip: 'Red Hat OpenShift Service on IBM Cloud',
    },
    [normalizedProducts.ROVS]: {
      name: 'ROVS',
      tooltip: 'Red Hat OpenShift Virtualization Service on IBM Cloud',
    },
    [normalizedProducts.UNKNOWN]: {
      name: 'N/A',
      tooltip: 'Not Available',
    },
  };

  const planType = get(cluster, 'subscription.plan.id', normalizedProducts.UNKNOWN);

  return clusterTypes[planType] || clusterTypes[normalizedProducts.UNKNOWN];
};
