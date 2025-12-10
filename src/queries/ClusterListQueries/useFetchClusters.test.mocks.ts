import { Subscription } from '~/types/accounts_mgmt.v1';
import { Cluster } from '~/types/clusters_mgmt.v1';

import { SubscriptionMapEntry } from './helpers/createResponseForFetchCluster';

export const viewOptions = {
  currentPage: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  filter: 'myCluster',
  sorting: {
    sortField: 'display_name',
    isAscending: false,
    sortIndex: 0,
  },
  flags: {
    showArchived: false,
    showMyClustersOnly: false,
    subscriptionFilter: {
      plan_id: ['ROSA'],
    },
  },
};

export const managedSubscriptions = [
  {
    cluster_id: 'myClusterId-managed-1',
    id: 'mySubscriptionId-managed-1',
    managed: true,
    status: 'Active',
    plan: { id: 'ROSA', type: 'ROSA' },
  },
  {
    cluster_id: 'myClusterId-managed-2',
    id: 'mySubscriptionId-managed-2',
    managed: true,
    status: 'Active',
    plan: { id: 'ROSA', type: 'ROSA' },
    rh_region_id: 'myRegion',
  },
] as Subscription[];

export const aiClusters = [
  {
    cluster_id: 'myClusterId-ai-1',
    id: 'mySubscriptionId-ai-1',
    plan: { id: 'OCP-AssistedInstall' },
  },
  {
    cluster_id: 'myClusterId-ai-2',
    id: 'mySubscriptionId-ai-2',
    plan: { id: 'OCP-AssistedInstall' },
  },
];

export const otherClusters = [
  {
    cluster_id: 'myCluster-other-1',
    id: 'myCluster-other-1',
    plan: { id: 'OCP' },
  },
];

export const allSubscriptions = [
  ...managedSubscriptions,
  ...aiClusters,
  ...otherClusters,
] as Subscription[];

export const subscriptionMap = allSubscriptions.reduce((map, subscription) => {
  // @ts-ignore
  map.set(subscription.cluster_id, {
    subscription,
  });
  return map;
}, new Map<string, SubscriptionMapEntry>());

export const mockedUseFetchSubscriptionsData = {
  subscriptionIds: ['mySubscriptionId-ai-1', 'mySubscriptionId-ai-2'],
  subscriptionMap,
  managedSubscriptions,
  total: 25,
  page: 1,
};

export const aiClustersValue = {
  aiClusters: [
    { id: 'myClusterId-ai-1', aiCluster: true },
    { id: 'myClusterId-ai-2', aiCluster: true },
  ] as unknown as Cluster[],
};

export const managedClustersValueGlobal = {
  managedClusters: [
    {
      id: 'myClusterId-managed-1',
      external_id: 'myClusterId-managed-external-id-1',
      product: {
        id: 'ROSA',
      },
    },
  ],
};

export const managedClustersValueRegional = {
  managedClusters: [
    {
      id: 'myClusterId-managed-2',
      external_id: 'myClusterId-managed-external-id-2',
      region: 'myRegion',
      product: {
        id: 'ROSA',
      },
    },
  ],
};
