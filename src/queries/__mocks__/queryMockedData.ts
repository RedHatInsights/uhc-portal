import { Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import { SubscriptionResponseType } from '../types';

export const mockSubscriptionAxiosResponse = {
  plan: {
    id: 'ROSA',
    type: 'ROSA',
  },
  cluster_id: '123TEST',
};

export const mockSubscriptionData: Subscription = {
  plan: {
    id: 'ROSA',
    type: 'ROSA',
  },
  status: SubscriptionCommonFieldsStatus.Active,
  cluster_id: 'mockedClusterID',
  managed: true,
};

export const mockedSubscriptionWithClusterType: SubscriptionResponseType = {
  subscription: mockSubscriptionData,
  isROSACluster: true,
  isAROCluster: false,
  isOSDCluster: false,
};

export const mockedClusterResponse = {
  data: {
    kind: 'Cluster',
    id: 'mockedClusterID',
    display_name: 'Mocked Cluster',
    state: 'ready',
    product: {
      id: 'rosa',
    },
  },
};

export const mockedCluster = {
  kind: 'Cluster',
  id: 'mockedClusterID',
  display_name: 'Mocked Cluster',
  state: 'ready',
  product: {
    id: 'rosa',
  },
};

export const mockedInflightChecks = {
  kind: 'InflightCheckList',
  page: 1,
  size: 1,
  total: 1,
  items: [
    {
      kind: 'InflightCheck',
      id: 'mockedInflightCheckID',
      name: 'egress',
      state: 'passed',
      restarts: 0,
    },
  ],
};

export const mockedLimitedSupportReasons = {
  kind: 'LimitedSupportReasonList',
  page: 0,
  size: 0,
  total: 0,
};

export const mockedCloudProviders = {
  kind: 'CloudProviderList',
  page: 1,
  size: 1,
  total: 1,
  items: [
    {
      kind: 'CloudProvider',
      id: 'aws',
      name: 'aws',
      display_name: 'AWS',
      regions: [
        {
          kind: 'CloudRegion',
          id: 'af-south-1',
          display_name: 'Africa (Cape Town)',
          enabled: true,
        },
        {
          kind: 'CloudRegion',
          id: 'eu-central-2',
          display_name: 'Europe, ZUrich',
          enabled: true,
        },
      ],
    },
  ],
};

export const mockedCloudProvidersResult = {
  aws: {
    kind: 'CloudProvider',
    id: 'aws',
    name: 'aws',
    display_name: 'AWS',
    regions: {
      'af-south-1': {
        id: 'af-south-1',
        display_name: 'Africa (Cape Town)',
        enabled: true,
        supports_multi_az: undefined,
        kms_location_id: undefined,
        ccs_only: undefined,
        supports_hypershift: undefined,
      },

      'eu-central-2': {
        id: 'eu-central-2',
        display_name: 'Europe, ZUrich',
        enabled: true,
        supports_multi_az: undefined,
        kms_location_id: undefined,
        ccs_only: undefined,
        supports_hypershift: undefined,
      },
    },
  },
};

export const clusterIDP = {
  kind: 'IdentityProviderList',
  page: 1,
  size: 1,
  total: 1,
  items: [
    {
      kind: 'IdentityProvider',
      type: 'HTPasswdIdentityProvider',
      id: 'mockedIdentityProviderID',
      name: 'mockedIDPName',
      mapping_method: 'claim',
      htpasswd: {
        users: {
          kind: 'HTPasswdUserListLink',
        },
      },
    },
  ],
};

export const mockedClusterLogs = {
  kind: 'ClusterLogList',
  page: 1,
  size: 5,
  total: 5,
  items: [
    {
      cluster_id: '2a4tguaod170v2-mock',
      cluster_uuid: '7d72f3d1-17cc-495-mock',
      created_at: '2024-04-09T23:13:21.559092Z',
      created_by: 'service-account-ocm-cs-staging',
      description:
        'Cluster has a new upgrade version available, 4.15.6. Find more information about this version in the release notes: https://docs.openshift.com/container-platform/4.15/release_notes/ocp-4-15-release-notes.html#ocp-4-15-6.',
      id: '2ess14DHIPDNNrytmuLYPkmM3fx',
      kind: 'ClusterLog',
      log_type: 'Cluster Updates',
      service_name: 'ClusterService',
      severity: 'Low',
      summary: 'New upgrade version available',
      timestamp: '2024-04-09T23:13:19Z',
    },
    {
      cluster_id: '2a4tguaod170v2-mock',
      cluster_uuid: '7d72f3d1-17cc-495-mock',
      created_at: '2024-04-15T12:13:08.567392Z',
      created_by: 'service-account-ocm-cs-staging',
      description:
        'Cluster has a new upgrade version available, 4.15.8. Find more information about this version in the release notes: https://docs.openshift.com/container-platform/4.15/release_notes/ocp-4-15-release-notes.html#ocp-4-15-8.',
      id: '2f8WSyOjmkHUHSCpW1n6TU8N9Ub',
      kind: 'ClusterLog',
      log_type: 'Cluster Updates',
      service_name: 'ClusterService',
      severity: 'Low',
      summary: 'New upgrade version available',
      timestamp: '2024-04-15T12:13:07Z',
    },
    {
      cluster_id: '2a4tguaod170v2-mock',
      cluster_uuid: '7d72f3d1-17cc-495-mock',
      created_at: '2024-04-20T08:29:33.784039Z',
      created_by: 'service-account-ocm-cs-staging',
      description:
        'WaitingForAvailableMachines: Minimum availability requires 2 replicas, current 0 available',
      id: '2fMCtLggsJGzzcSmXrrVlOA0Uxt',
      kind: 'ClusterLog',
      log_type: 'Cluster Scaling',
      service_name: 'ClusterService',
      severity: 'Low',
      summary: "Node pool 'workers' in cluster '2a4tguaod170v2su3msth4v93mqqa68m' has been synced",
      timestamp: '2024-04-20T08:29:32Z',
    },
    {
      cluster_id: '2a4tguaod170v2-mock',
      cluster_uuid: '7d72f3d1-17cc-495-mock',
      created_at: '2024-04-23T19:16:38.008502Z',
      created_by: 'service-account-ocm-cs-staging',
      description:
        'Cluster has a new upgrade version available, 4.15.9. Find more information about this version in the release notes: https://docs.openshift.com/container-platform/4.15/release_notes/ocp-4-15-release-notes.html#ocp-4-15-9.',
      id: '2fVwxRWtheIv9vahpXx4jt3uevF',
      kind: 'ClusterLog',
      log_type: 'Cluster Updates',
      service_name: 'ClusterService',
      severity: 'Low',
      summary: 'New upgrade version available',
      timestamp: '2024-04-23T19:16:36Z',
    },
    {
      cluster_id: '2a4tguaod170v2-mock',
      cluster_uuid: '7d72f3d1-17cc-495-mock',
      created_at: '2024-05-02T19:24:28.634096Z',
      created_by: 'service-account-ocm-cs-staging',
      description:
        'Cluster has a new upgrade version available, 4.15.10. Find more information about this version in the release notes: https://docs.openshift.com/container-platform/4.15/release_notes/ocp-4-15-release-notes.html#ocp-4-15-10.',
      id: '2fvO1Mv0LvSCLRZEfruES8Q2B8V',
      kind: 'ClusterLog',
      log_type: 'Cluster Updates',
      service_name: 'ClusterService',
      severity: 'Low',
      summary: 'New upgrade version available',
      timestamp: '2024-05-02T19:24:27Z',
    },
  ],
};

export const mockedRegionalClustersApSouthEast = {
  kind: 'ClusterList',
  page: 1,
  size: 3,
  total: 3,
  items: [
    {
      kind: 'Cluster',
      id: '2a4tguaod1',
      name: 'testname1-ap-southeast-1',
      domain_prefix: 'pre1SE',
      external_id: '7d72f3d1-17cc',
      display_name: 'testdisplay1-ap-southeast-1',

      cloud_provider: {
        kind: 'CloudProviderLink',
        id: 'aws',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      },
      openshift_version: '4.15.2',
      region: {
        kind: 'CloudRegionLink',
        id: 'ap-southeast-1',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ap-southeast-1',
      },
    },
    {
      kind: 'Cluster',
      id: '2a4tguaod170',
      name: 'testname2-ap-southeast-1',
      domain_prefix: 'pre2SE',
      external_id: '7d72f3d1-17cc',
      display_name: 'testdisplay2-ap-southeast-1',
      cloud_provider: {
        kind: 'CloudProviderLink',
        id: 'aws',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      },
      openshift_version: '4.15.2',
      region: {
        kind: 'CloudRegionLink',
        id: 'ap-southeast-1',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ap-southeast-1',
      },
    },
    {
      kind: 'Cluster',
      id: '2a4tguaod1',
      name: 'testname3-ap-southeast-3',
      domain_prefix: 'pre3SE',
      external_id: '7d72f3d1-l',
      display_name: 'testdisplay3-ap-southeast-1',
      cloud_provider: {
        kind: 'CloudProviderLink',
        id: 'aws',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      },
      openshift_version: '4.15.2',
      region: {
        kind: 'CloudRegionLink',
        id: 'ap-southeast-1',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ap-southeast-1',
      },
    },
  ],
};

export const mockedExistingSearchedCluster = {
  items: [
    {
      name: 'existing-cluster-name',
      domain_prefix: 'domain-pre-1',
    },
  ],
};

export const mockedGetOCMRole = {
  data: {
    arn: 'arn:aws:iam::000000000006:role/ManagedOpenShiftMock-OCM-Role-1558',
    type: 'OCMRole',
    isAdmin: false,
    roleVersion: '',
    managedPolicies: true,
    hcpManagedPolicies: true,
  },
};

export const mockedOidcConfigurations = {
  data: {
    href: '/api/clusters_mgmt/v1/oidc_configs',
    items: [
      {
        href: '/api/clusters_mgmt/v1/oidc_configs/config1',
        id: 'test-config-id-1',
        organization_id: 'orgId1',
        managed: true,
        reusable: true,
      },
      {
        href: '/api/clusters_mgmt/v1/oidc_configs/config2',
        id: 'test-config-id-2',
        organization_id: 'orgId1',
        managed: true,
        reusable: true,
      },
      {
        href: '/api/clusters_mgmt/v1/oidc_configs/config3',
        id: 'test-config-id-3',
        organization_id: 'orgId1',
        managed: true,
        reusable: true,
      },
    ],
    page: 1,
    size: 3,
    total: 3,
  },
};
