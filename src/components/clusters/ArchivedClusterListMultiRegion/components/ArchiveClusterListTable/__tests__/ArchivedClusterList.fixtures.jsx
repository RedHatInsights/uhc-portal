import { normalizedProducts } from '../../../../../../common/subscriptionTypes';

const clusters = [
  {
    id: '1HAtguRKqqlQYCSFk14uwMl6g6p',
    kind: 'Subscription',
    href: '/api/accounts_mgmt/v1/subscriptions/1HAtguRKqqlQYCSFk14uwMl6g6p',
    plan: {
      id: normalizedProducts.OCP,
    },
    cluster_id: '1HAtdkNPWql68fuOI7KvuyM4OTp',
    organization_id: '1HAIjRf0KAoWykFD2gexUhfngd0',
    last_telemetry_date: '0001-01-01T00:00:00Z',
    created_at: '2019-02-14T15:07:24.640289Z',
    updated_at: '2019-09-24T01:37:42.930173Z',
    support_level: 'Eval',
    creator: {
      id: '1G1ikKt3haukUjrUDvRVLZyfEnY',
      kind: 'Account',
      href: '/api/accounts_mgmt/v1/accounts/1G1ikKt3haukUjrUDvRVLZyfEnY',
      name: 'Elad Tabak',
      username: 'etabak_privileged_uhc_20012019',
      email: '***REMOVED***',
    },
    subscription: {
      id: '1HAtdkNPWql68fuOI7Kvuyk4OTp',
      managed: false,
      status: 'Deprovisioned',
      provenance: 'Provisioning',
      last_reconcile_date: '0001-01-01T00:00:00Z',
      last_released_at: '0001-01-01T00:00:00Z',
    },
  },
];

const cloudProviders = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: true,
  providers: {
    aws: {
      kind: 'CloudProvider',
      id: 'aws',
      href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      name: 'aws',
      display_name: 'Amazon Web Services',
      regions: {
        'ap-northeast-1': {
          kind: 'CloudRegion',
          id: 'ap-northeast-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ap-northeast-1',
          display_name: 'Asia Pacific (Tokyo)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'ap-northeast-2': {
          kind: 'CloudRegion',
          id: 'ap-northeast-2',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ap-northeast-2',
          display_name: 'Asia Pacific (Seoul)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'ap-south-1': {
          kind: 'CloudRegion',
          id: 'ap-south-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ap-south-1',
          display_name: 'Asia Pacific (Mumbai)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'ap-southeast-1': {
          kind: 'CloudRegion',
          id: 'ap-southeast-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ap-southeast-1',
          display_name: 'Asia Pacific (Singapore)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'ap-southeast-2': {
          kind: 'CloudRegion',
          id: 'ap-southeast-2',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ap-southeast-2',
          display_name: 'Asia Pacific (Sydney)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'ca-central-1': {
          kind: 'CloudRegion',
          id: 'ca-central-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/ca-central-1',
          display_name: 'Canada (Central)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'eu-central-1': {
          kind: 'CloudRegion',
          id: 'eu-central-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/eu-central-1',
          display_name: 'EU (Frankfurt)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'eu-west-1': {
          kind: 'CloudRegion',
          id: 'eu-west-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/eu-west-1',
          display_name: 'EU (Ireland)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'eu-west-2': {
          kind: 'CloudRegion',
          id: 'eu-west-2',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/eu-west-2',
          display_name: 'EU (London)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'eu-west-3': {
          kind: 'CloudRegion',
          id: 'eu-west-3',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/eu-west-3',
          display_name: 'EU (Paris)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'sa-east-1': {
          kind: 'CloudRegion',
          id: 'sa-east-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/sa-east-1',
          display_name: 'South America (São Paulo)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'us-east-1': {
          kind: 'CloudRegion',
          id: 'us-east-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-east-1',
          display_name: 'US East (N. Virginia)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'us-east-2': {
          kind: 'CloudRegion',
          id: 'us-east-2',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-east-2',
          display_name: 'US East (Ohio)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'us-west-1': {
          kind: 'CloudRegion',
          id: 'us-west-1',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-west-1',
          display_name: 'US West (N. California)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
        'us-west-2': {
          kind: 'CloudRegion',
          id: 'us-west-2',
          href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-west-2',
          display_name: 'US West (Oregon)',
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'aws',
            href: '/api/clusters_mgmt/v1/cloud_providers/aws',
          },
        },
      },
    },
  },
};

export { clusters, cloudProviders };
