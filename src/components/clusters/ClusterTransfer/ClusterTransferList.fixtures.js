const transfers = [
  {
    cluster_uuid: '19a65d3e-0603-406b-9cc8-6fe9541bbe46',
    created_at: '2024-07-02T15:21:48.515965Z',
    expiration_date: '2024-07-07T15:21:48.515946Z',
    href: '/api/accounts_mgmt/v1/cluster_transfers',
    id: '2ihD2ZlJtZspfIfsdfdaVd2S55AMf',
    owner: 'dbuchana-ocm',
    recipient: 'dbuchana-ocm-nonadmin',
    status: 'Pending',
    updated_at: '2024-07-02T15:21:48.515965Z',
    name: 'daz-hcp3',
    subscription: {
      billing_expiration_date: '0001-01-01T00:00:00Z',
      billing_marketplace_account: '000000000005',
      capabilities: [
        {
          inherited: false,
          name: 'capability.cluster.manage_cluster_admin',
          value: 'true',
        },
        {
          inherited: true,
          name: 'capability.cluster.enable_access_protection',
          value: 'true',
        },
        {
          inherited: true,
          name: 'capability.cluster.subscribed_ocp',
          value: 'true',
        },
        {
          inherited: true,
          name: 'capability.cluster.autoscale_clusters',
          value: 'true',
        },
      ],
      cloud_account_id: '000000000006',
      cluster_billing_model: 'marketplace-aws',
      cluster_id: '2cis9vaqqe8r31apqi58heekg8a39dmg',
      console_url: 'https://console-openshift-console.apps.rosa.daz-hcp3.3ki9.s3.devshift.org',
      created_at: '2024-07-17T18:52:49.260038Z',
      creator: {
        email: '***REMOVED***',
        first_name: 'David',
        href: '/api/accounts_mgmt/v1/accounts/2ajdy5ULzU7GONuLqevjxoSrcGx',
        id: '2ajdy5ULzU7GONuLqevjxoSrcGx',
        kind: 'Account',
        last_name: 'Aznaurov',
        name: 'David Aznaurov',
        username: 'daznauro-ocm',
      },
      display_name: 'daz-hcp3',
      eval_expiration_date: '0001-01-01T00:00:00Z',
      external_cluster_id: '19a65d3e-0603-406b-9cc8-6fe9541bbe46',
      href: '/api/accounts_mgmt/v1/subscriptions/2jNzYV73asfGVu3KwpHNmyYl4gc',
      id: '2jNzYV73asfGVu3KwpHNmyYl4gc',
      kind: 'Subscription',
      last_reconcile_date: '0001-01-01T00:00:00Z',
      last_released_at: '0001-01-01T00:00:00Z',
      last_telemetry_date: '2024-07-17T19:20:43.446505Z',
      managed: true,
      metrics: [
        {
          arch: 'amd64',
          cloud_provider: '',
          cluster_type: '',
          compute_nodes_cpu: {
            total: {
              unit: '',
              value: 8,
            },
            updated_timestamp: '0001-01-01T00:00:00Z',
            used: {
              unit: '',
              value: 0,
            },
          },
          compute_nodes_memory: {
            total: {
              unit: 'B',
              value: 32919367680,
            },
            updated_timestamp: '0001-01-01T00:00:00Z',
            used: {
              unit: 'B',
              value: 0,
            },
          },
          compute_nodes_sockets: {
            total: {
              unit: '',
              value: 0,
            },
            updated_timestamp: '0001-01-01T00:00:00Z',
            used: {
              unit: '',
              value: 0,
            },
          },
          console_url: 'https://console-openshift-console.apps.rosa.daz-hcp3.3ki9.s3.devshift.org',
          cpu: {
            total: {
              unit: '',
              value: 8,
            },
            updated_timestamp: '2024-07-18T01:30:02.775Z',
            used: {
              unit: '',
              value: 0.4566666666666742,
            },
          },
          critical_alerts_firing: 0,
          health_state: 'healthy',
          memory: {
            total: {
              unit: 'B',
              value: 32919367680,
            },
            updated_timestamp: '2024-07-18T01:30:02.809Z',
            used: {
              unit: 'B',
              value: 7009325056,
            },
          },
          nodes: {
            compute: 2,
            infra: 0,
            master: 0,
            total: 2,
          },
          nodes_arch: [
            {
              arch: 'amd64',
              compute: 2,
              infra: 0,
              master: 0,
              total: 2,
            },
          ],
          non_virt_nodes: 0,
          openshift_version: '',
          operating_system: '',
          operators_condition_failing: 0,
          query_timestamp: '2024-07-18T01:30:02Z',
          region: '',
          sockets: {
            total: {
              unit: '',
              value: 0,
            },
            updated_timestamp: '0001-01-01T00:00:00Z',
            used: {
              unit: '',
              value: 0,
            },
          },
          state: '',
          state_description: '',
          storage: {
            total: {
              unit: 'B',
              value: 0,
            },
            updated_timestamp: '0001-01-01T00:00:00Z',
            used: {
              unit: 'B',
              value: 0,
            },
          },
          subscription_cpu_total: 4,
          subscription_obligation_exists: 1,
          subscription_socket_total: 2,
          upgrade: {
            available: false,
            state: '',
            updated_timestamp: '0001-01-01T00:00:00Z',
            version: '',
          },
        },
      ],
      organization: {
        id: '1wuVGGV6SCmD8ya6yRGEJzvmVuC',
      },
      organization_id: '1wuVGGV6SCmD8ya6yRGEJzvmVuC',
      plan: {
        id: 'ROSA-HyperShift',
        type: 'ROSA',
      },
      provenance: 'Provisioning',
      status: 'Active',
      support_level: 'Premium',
      trial_end_date: '0001-01-01T00:00:00Z',
      updated_at: '2024-07-17T19:20:43.448795Z',
    },
    version: {
      kind: 'Version',
      id: 'openshift-v4.16.2',
      href: '/api/clusters_mgmt/v1/versions/openshift-v4.16.2',
      raw_id: '4.16.2',
      channel_group: 'stable',
      end_of_life_timestamp: '2025-10-31T00:00:00Z',
    },
  },
];

export { transfers };
