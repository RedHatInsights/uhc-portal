import { produce } from 'immer';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { normalizedProducts } from '../../../../common/subscriptionTypes';
import clusterStates from '../../common/clusterStates';

const match = { params: { id: '1msoogsgTLQ4PePjrTOt3UqvMzX' } };
const funcs = () => ({
  history: {
    push: jest.fn(),
  },
  location: {
    hash: '',
  },
  fetchDetails: jest.fn(),
  fetchClusterInsights: jest.fn(),
  getCloudProviders: jest.fn(),
  invalidateClusters: jest.fn(),
  getOrganizationAndQuota: jest.fn(),
  refreshFunc: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  getLogs: jest.fn(),
  getUsers: jest.fn(),
  getDedicatedAdmins: jest.fn(),
  getClusterAdmins: jest.fn(),
  getClusterIdentityProviders: jest.fn(),
  resetIdentityProvidersState: jest.fn(),
  clearGlobalError: jest.fn(),
  setGlobalError: jest.fn(),
  getOnDemandMetrics: jest.fn(),
  getAddOns: jest.fn(),
  getClusterAddOns: jest.fn(),
  getAccessRequests: jest.fn(),
  getPendingAccessRequests: jest.fn(),
  getAccessProtection: jest.fn(),
  getGrants: jest.fn(),
  getClusterHistory: jest.fn(),
  getClusterRouters: jest.fn(),
  getMachineOrNodePools: jest.fn(),
  resetClusterHistory: jest.fn(),
  toggleSubscriptionReleased: jest.fn(),
  clearGetMachinePoolsResponse: jest.fn(),
  clearGetClusterAutoscalerResponse: jest.fn(),
  getNotificationContacts: jest.fn(),
  getSupportCases: jest.fn(),
  getSchedules: jest.fn(),
  getUserAccess: jest.fn(),
  fetchUpgradeGates: jest.fn(),
  clearListVpcs: jest.fn(),
  resetFiltersAndFlags: jest.fn(),
  getOrganizationPendingAccessRequests: jest.fn(),
  resetOrganizationPendingAccessRequests: jest.fn(),
});

const clusterDetails = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: true,
  cluster: {
    kind: 'Cluster',
    id: '1i4counta3holamvo1g5tp6n8p3a03bq',
    href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq',
    name: 'test-liza',
    domain_prefix: 'prefix-value-1',
    external_id: 'bae5b227-2472-4e71-be4d-a18fc60bb48a',
    infra_id: 'test-liza-d7vkd',
    display_name: 'test-liza',
    creation_timestamp: '2021-01-10T15:17:16.278663Z',
    activity_timestamp: '2021-01-11T11:55:29Z',
    expiration_timestamp: '',
    cloud_provider: {
      kind: 'CloudProviderLink',
      id: 'aws',
      href: '/api/clusters_mgmt/v1/cloud_providers/aws',
    },
    billing_model: 'standard',
    delete_protection: {
      enabled: false,
    },
    openshift_version: '4.6.8',
    region: {
      kind: 'CloudRegionLink',
      id: 'us-east-1',
      href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-east-1',
    },
    console: {
      url: 'https://console-openshift-console.apps.test-liza.wiex.s1.devshift.org',
    },
    api: {
      url: 'https://api.test-liza.wiex.s1.devshift.org:6443',
      listening: 'external',
    },
    nodes: {
      master: 3,
      infra: 2,
      compute: 4,
      availability_zones: ['us-east-1a'],
      master_machine_type: {
        kind: 'MachineTypeLink',
        id: 'm5.xlarge',
        href: '/api/clusters_mgmt/v1/machine_types/m5.xlarge',
      },
      compute_machine_type: {
        kind: 'MachineTypeLink',
        id: 'm5.xlarge',
        href: '/api/clusters_mgmt/v1/machine_types/m5.xlarge',
      },
    },
    state: 'ready',
    flavour: {
      kind: 'FlavourLink',
      id: 'osd-4',
      href: '/api/clusters_mgmt/v1/flavours/osd-4',
    },
    groups: {
      kind: 'GroupListLink',
      href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/groups',
    },
    dns: {
      base_domain: 'wiex.s1.devshift.org',
    },
    network: {
      machine_cidr: '10.0.0.0/16',
      service_cidr: '172.30.0.0/16',
      pod_cidr: '10.128.0.0/14',
      host_prefix: 23,
    },
    external_configuration: {
      kind: 'ExternalConfiguration',
      href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/external_configuration',
      syncsets: {
        kind: 'SyncsetListLink',
        href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/external_configuration/syncsets',
      },
      labels: {
        kind: 'LabelListLink',
        href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/external_configuration/labels',
      },
    },
    multi_az: false,
    managed: true,
    ccs: {
      enabled: false,
      disable_scp_checks: false,
    },
    version: {
      kind: 'Version',
      id: 'openshift-v4.6.8',
      href: '/api/clusters_mgmt/v1/versions/openshift-v4.6.8',
      channel_group: 'stable',
    },
    storage_quota: {
      value: 107374182400,
      unit: 'B',
    },
    load_balancer_quota: 0,
    identity_providers: {
      kind: 'IdentityProviderListLink',
      href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/identity_providers',
    },
    aws_infrastructure_access_role_grants: {
      kind: 'AWSInfrastructureAccessRoleGrantLink',
      href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/aws_infrastructure_access_role_grants',
      items: null,
    },
    metrics: {
      memory: {
        updated_timestamp: '2021-01-11T11:55:29Z',
        used: {
          value: 28802600960,
          unit: 'B',
        },
        total: {
          value: 147469647872,
          unit: 'B',
        },
      },
      cpu: {
        updated_timestamp: '2021-01-11T11:55:29Z',
        used: {
          value: 3.8904761904758463,
          unit: '',
        },
        total: {
          value: 36,
          unit: '',
        },
      },
      sockets: {
        used: {
          value: 0,
          unit: '',
        },
        total: {
          value: 0,
          unit: '',
        },
      },
      compute_nodes_memory: {
        total: {
          value: 65835802624,
          unit: 'B',
        },
      },
      compute_nodes_cpu: {
        total: {
          value: 16,
          unit: '',
        },
      },
      compute_nodes_sockets: {
        total: {
          value: 0,
          unit: '',
        },
      },
      storage: {
        used: {
          value: 0,
          unit: 'B',
        },
        total: {
          value: 0,
          unit: 'B',
        },
      },
      nodes: {
        total: 9,
        master: 3,
        infra: 2,
        compute: 4,
      },
      version_update_available: false,
      upgrade: {
        updated_timestamp: '2021-01-11T11:55:29Z',
        available: false,
      },
    },
    addons: {
      kind: 'AddOnInstallationListLink',
      href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/addons',
    },
    ingresses: {
      kind: 'IngressListLink',
      href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/ingresses',
      id: '1i4counta3holamvo1g5tp6n8p3a03bq',
    },
    machine_pools: {
      kind: 'MachinePoolListLink',
      href: '/api/clusters_mgmt/v1/clusters/1i4counta3holamvo1g5tp6n8p3a03bq/machine_pools',
    },
    health_state: 'healthy',
    product: {
      id: normalizedProducts.OSD,
    },
    status: {
      state: 'ready',
      dns_ready: true,
      provision_error_message: '',
      provision_error_code: '',
    },
    node_drain_grace_period: {
      value: 60,
      unit: 'minutes',
    },
    etcd_encryption: false,
    upgrade_channel_group: 'stable',
    subscription: {
      id: '1msoogsgTLQ4PePjrTOt3UqvMzX',
      kind: 'Subscription',
      href: '/api/accounts_mgmt/v1/subscriptions/1msoogsgTLQ4PePjrTOt3UqvMzX',
      plan: {
        id: 'OSD',
        kind: 'Plan',
        href: '/api/accounts_mgmt/v1/plans/OSD',
        type: 'OSD',
      },
      cluster_id: '1i4counta3holamvo1g5tp6n8p3a03bq',
      external_cluster_id: 'bae5b227-2472-4e71-be4d-a18fc60bb48a',
      organization_id: '1MKVU4otCIuogoLtgtyU6wajxjW',
      last_telemetry_date: '2021-01-11T03:59:48.224585Z',
      created_at: '2021-01-10T15:17:15.19112Z',
      updated_at: '2021-01-11T03:59:48.224622Z',
      support_level: 'Premium',
      cpu_total: 8,
      socket_total: 4,
      display_name: 'test-liza',
      creator: {
        id: '1MRilA9vHlOUX9ui3lx6IohSsaS',
        kind: 'Account',
        href: '/api/accounts_mgmt/v1/accounts/1MRilA9vHlOUX9ui3lx6IohSsaS',
        name: 'Liza Gilman',
        username: 'egilman.openshift',
        email: '***REMOVED***',
      },
      managed: true,
      status: 'Active',
      provenance: 'Provisioning',
      last_reconcile_date: '0001-01-01T00:00:00Z',
      console_url: 'https://console-openshift-console.apps.test-liza.wiex.s1.devshift.org',
      capabilities: [
        {
          name: subscriptionCapabilities.SUBSCRIBED_OCP,
          value: 'true',
          inherited: true,
        },
        {
          name: subscriptionCapabilities.MANAGE_CLUSTER_ADMIN,
          value: 'true',
          inherited: true,
        },
      ],
      last_released_at: '0001-01-01T00:00:00Z',
      metrics: [
        {
          HealthState: 'healthy',
          memory: {
            updated_timestamp: '2021-01-11T11:55:10.448Z',
            used: {
              value: 28802600960,
              unit: 'B',
            },
            total: {
              value: 147469647872,
              unit: 'B',
            },
          },
          cpu: {
            updated_timestamp: '2021-01-11T11:55:10.517Z',
            used: {
              value: 3.8904761904758463,
              unit: '',
            },
            total: {
              value: 36,
              unit: '',
            },
          },
          sockets: {
            updated_timestamp: '1970-01-01T00:00:00Z',
            used: {
              value: 0,
              unit: '',
            },
            total: {
              value: 0,
              unit: '',
            },
          },
          compute_nodes_memory: {
            updated_timestamp: '1970-01-01T00:00:00Z',
            used: {
              value: 0,
              unit: 'B',
            },
            total: {
              value: 98489344000,
              unit: 'B',
            },
          },
          compute_nodes_cpu: {
            updated_timestamp: '1970-01-01T00:00:00Z',
            used: {
              value: 0,
              unit: '',
            },
            total: {
              value: 24,
              unit: '',
            },
          },
          compute_nodes_sockets: {
            updated_timestamp: '1970-01-01T00:00:00Z',
            used: {
              value: 0,
              unit: '',
            },
            total: {
              value: 0,
              unit: '',
            },
          },
          storage: {
            updated_timestamp: '1970-01-01T00:00:00Z',
            used: {
              value: 0,
              unit: 'B',
            },
            total: {
              value: 0,
              unit: 'B',
            },
          },
          nodes: {
            total: 9,
            master: 3,
            infra: 2,
            compute: 4,
          },
          operating_system: '',
          upgrade: {
            updated_timestamp: '2021-01-11T11:55:10.206Z',
          },
          state: 'ready',
          state_description: '',
          open_shift_version: '4.6.8',
          cloud_provider: 'aws',
          region: 'us-east-1',
          console_url: 'https://console-openshift-console.apps.test-liza.wiex.s1.devshift.org',
          critical_alerts_firing: 0,
          operators_condition_failing: 0,
          subscription_cpu_total: 8,
          subscription_socket_total: 4,
        },
      ],
      cloud_provider_id: 'aws',
      region_id: 'us-east-1',
    },
    canEdit: true,
    idpActions: {
      get: false,
      list: false,
      create: false,
      update: false,
      delete: false,
    },
  },
};

const CCSClusterDetails = produce(clusterDetails, (draft) => {
  draft.cluster.ccs.enabled = true;
});

const OSDTrialClusterDetails = produce(CCSClusterDetails, (draft) => {
  draft.cluster.product = { id: normalizedProducts.OSDTrial };
  draft.cluster.subscription.plan = {
    id: normalizedProducts.OSDTrial,
    type: normalizedProducts.OSDTrial,
  };
});

const OSDRHMClusterDetails = produce(CCSClusterDetails, (draft) => {
  draft.cluster.product = { id: normalizedProducts.OSD };
  draft.cluster.subscription.plan = {
    id: normalizedProducts.OSD,
    type: normalizedProducts.OSD,
  };
  draft.cluster.subscription.cluster_billing_model =
    SubscriptionCommonFieldsClusterBillingModel.marketplace;
});

const OSDGCPClusterDetails = produce(CCSClusterDetails, (draft) => {
  draft.cluster.product = { id: normalizedProducts.OSD };
  draft.cluster.subscription.plan = {
    id: normalizedProducts.OSD,
    type: normalizedProducts.OSD,
  };
  draft.cluster.subscription.cluster_billing_model =
    SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp;
});

const ROSAClusterDetails = produce(CCSClusterDetails, (draft) => {
  draft.cluster.product = { id: normalizedProducts.ROSA };
  draft.cluster.subscription.plan = {
    id: normalizedProducts.ROSA,
    type: normalizedProducts.ROSA,
  };
  draft.cluster.properties = {
    rosa_creator_arn: 'arn:aws:iam::123456789012:user/richard',
  };
});

const ROSAHypershiftClusterDetails = produce(CCSClusterDetails, (draft) => {
  draft.cluster.product = { id: normalizedProducts.ROSA };
  draft.cluster.hypershift = { enabled: true };
  draft.cluster.subscription.plan = {
    id: normalizedProducts.ROSA_HyperShift,
    type: normalizedProducts.ROSA,
  };
});

const ROSAHypershiftWaitingClusterDetails = produce(ROSAClusterDetails, (draft) => {
  draft.cluster.product = { id: normalizedProducts.ROSA };
  draft.cluster.hypershift = { enabled: true };
  draft.cluster.subscription.plan = {
    id: normalizedProducts.ROSA_HyperShift,
    type: normalizedProducts.ROSA,
  };
  draft.cluster.aws = {
    sts: {
      auto_mode: false,
      oidc_endpoint_url:
        'https://rh-oidc.s3.us-east-1.amazonaws.com/1ricsv5bio0domn5gofgaar07aifjpr0',
      role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
      operator_iam_roles: [
        {
          name: 'myrole',
          namespace: 'openshift-machine-api',
          role_arn:
            'arn:aws:iam::123456789012:role/cluster-test-openshift-machine-api-aws-cloud-credentials',
        },
      ],
      oidc_config: {
        id: '22qa79chsq8mand8hvmnr',
      },
    },
  };
  draft.cluster.state = clusterStates.waiting;
});

const ROSAManualClusterDetails = produce(ROSAClusterDetails, (draft) => {
  draft.cluster.aws = {
    sts: {
      auto_mode: false,
      oidc_endpoint_url:
        'https://rh-oidc.s3.us-east-1.amazonaws.com/1ricsv5bio0domn5gofgaar07aifjpr0',
      role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
      operator_iam_roles: [
        {
          name: 'myrole',
          namespace: 'openshift-machine-api',
          role_arn:
            'arn:aws:iam::123456789012:role/cluster-test-openshift-machine-api-aws-cloud-credentials',
        },
      ],
    },
  };
  draft.cluster.state = clusterStates.waiting;
});

const RHMIClusterDetails = produce(CCSClusterDetails, (draft) => {
  draft.cluster.product = { id: normalizedProducts.RHMI };
  draft.cluster.subscription.plan = {
    id: normalizedProducts.RHMI,
    type: normalizedProducts.RHMI,
  };
});

const AIClusterDetails = produce(CCSClusterDetails, (draft) => {
  draft.cluster.aiCluster = { id: clusterDetails.cluster.id };
  draft.cluster.canEdit = false;
  draft.cluster.subscription.plan = {
    id: normalizedProducts.OCP_AssistedInstall,
    type: normalizedProducts.OCP,
  };
});

const insightsData = {
  meta: {
    count: 1,
    last_checked_at: '2020-01-23T16:15:59.478901889Z',
  },
  data: [
    {
      rule_id: 'ccx_rules_ocp.external.rules.nodes_kubelet_version_check.report',
      description: 'Some rule description',
      details:
        'Minimum resource requirements...\n\n[Knowledgebase Article](https://docs.openshift.com/container-platform/4.1/installing/installing_bare_metal/installing-bare-metal.html?test=qwerty#minimum-resource-requirements_installing-bare-metal). Anything else here... [Knowledgebase Article](https://docs.openshift.com/container-platform/4.1/installing/installing_bare_metal/installing-bare-metal.html?test=42), [Knowledge Article](https://access.redhat.com/solutions/4972291?test=qwerty#amazing), [not doc link](https://google.com/test)',
      reason: '',
      resolution: '',
      created_at: '2020-02-03T08:25:00Z',
      total_risk: 3,
      resolution_risk: 0,
      user_vote: 0,
      extra_data: {
        error_key: 'NODES_MINIMUM_REQUIREMENTS_NOT_MET',
        link: '',
        nodes: [
          {
            memory: 15.95,
            memory_req: 16,
            name: 'ip-10-0-131-206.eu-west-2.compute.internal',
            role: 'master',
          },
          {
            memory: 15.95,
            memory_req: 16,
            name: 'ip-10-0-175-135.eu-west-2.compute.internal',
            role: 'master',
          },
        ],
        type: 'rule',
      },
      tags: ['tag1'],
    },
  ],
  status: 200,
};

const OCPClusterDetails = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: true,
  cluster: {
    kind: 'Cluster',
    id: '1IztzhAGrbjtKkMbiPewJanhTXk',
    href: '/api/clusters_mgmt/v1/clusters/1IztzhAGrbjtKkMbiPewJanhTXk',
    name: 'test-liza',
    external_id: '9f50940b-fba8-4c59-9c6c-d64284b2026d',
    display_name: 'test-liza',
    cluster_admin_enabled: false,
    creation_timestamp: '2019-03-26T15:18:39.06783Z',
    cloud_provider: {
      kind: 'CloudProviderLink',
      id: 'aws',
      href: '/api/clusters_mgmt/v1/cloud_providers/aws',
    },
    region: {
      kind: 'CloudRegionLink',
      id: 'us-east-1',
      href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-east-1',
    },
    console: {
      url: 'https://console-openshift-console.apps.test-liza.sdev.devshift.net',
    },
    api: {
      url: 'https://api.test-liza.sdev.devshift.net:6443',
    },
    nodes: {
      total: 5,
      master: 3,
      compute: 2,
    },
    storage_quota: {
      value: 107374182400,
      unit: 'B',
    },
    load_balancer_quota: 0,
    metrics: {
      memory: {
        updated_timestamp: '2019-04-28T14:23:19Z',
        used: {
          value: 16546058240,
          unit: 'B',
        },
        total: {
          value: 82293346304,
          unit: 'B',
        },
      },
      cpu: {
        updated_timestamp: '2019-04-28T14:23:18Z',
        used: {
          value: 3.995410922987096,
          unit: '',
        },
        total: {
          value: 16,
          unit: '',
        },
      },
      sockets: {
        updated_timestamp: '0001-01-01T00:00:00Z',
        used: {
          value: 0,
          unit: '',
        },
        total: {
          value: 0,
          unit: '',
        },
      },
      storage: {
        updated_timestamp: '0001-01-01T00:00:00Z',
        used: {
          value: 0,
          unit: 'B',
        },
        total: {
          value: 0,
          unit: 'B',
        },
      },
      nodes: {
        total: 7,
        master: 3,
        compute: 4,
      },
      upgrade: {},
    },
    state: 'ready',
    flavour: {
      kind: 'FlavourLink',
      id: 'ocp-4',
      href: '/api/clusters_mgmt/v1/flavours/ocp-4',
    },
    dns: {
      base_domain: 'sdev.devshift.net',
    },
    network: {
      machine_cidr: '10.0.0.0/16',
      service_cidr: '172.30.0.0/16',
      pod_cidr: '10.128.0.0/14',
      router_shards: {
        kind: 'RouterShardListLink',
        href: '/api/clusters_mgmt/v1/clusters/1IztzhAGrbjtKkMbiPewJanhTXk/router_shards',
        id: '1IztzhAGrbjtKkMbiPewJanhTXk',
      },
    },
    multi_az: false,
    managed: false,
    version: {
      kind: 'VersionLink',
      id: 'openshift-v4.0-latest',
      href: '/api/clusters_mgmt/v1/versions/openshift-v4.0-latest',
    },
    canEdit: true,
    canDelete: true,
    subscription: {
      id: '1msoogsgTLQ4PePjrTOt3UqvMzX',
      kind: 'Subscription',
      href: '/api/accounts_mgmt/v1/subscriptions/1FDpnxsGxqFFFp2VNIWp5VajPc8',
      plan: {
        id: 'OCP',
        type: 'OCP',
        kind: 'Plan',
        href: '/api/accounts_mgmt/v1/plans/OCP',
      },
      registry_credential: {
        id: '1EaZd2cDHH6ibIb1FFqav2Mles6',
        kind: 'RegistryCredential',
        href: '/api/accounts_mgmt/v1/registry_credentials/1EaZd2cDHH6ibIb1FFqav2Mles6',
      },
      cluster_id: '1IztzhAGrbjtKkMbiPewJanhTXk',
      external_cluster_id: 'test-liza',
      last_telemetry_date: '0001-01-01T00:00:00Z',
      created_at: '2019-01-02T18:28:14.851121Z',
      updated_at: '2019-01-02T18:28:14.851121Z',
    },
    product: {
      id: normalizedProducts.OCP,
    },
    status: {
      state: 'ready',
      dns_ready: true,
    },
  },
};

const AROClusterDetails = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: true,
  cluster: {
    kind: 'Cluster',
    id: '1IztzhAGrbjtKkMbiPewHjImARo',
    name: 'test-aro',
    external_id: '9f50940b-fba8-4c59-9c6c-d64284a2beef',
    display_name: 'test-aro',
    cluster_admin_enabled: false,
    creation_timestamp: '2021-03-15T15:20:21.061111Z',
    cloud_provider: {
      kind: 'CloudProviderLink',
      id: 'azure',
      href: '/api/clusters_mgmt/v1/cloud_providers/azure',
    },
    region: {
      kind: 'CloudRegionLink',
      id: 'eastus2',
      href: '/api/clusters_mgmt/v1/cloud_providers/azure/regions/eastus2',
    },
    console: {
      url: 'https://console-openshift-console.apps.test-aro.sdev.devshift.net',
    },
    api: {
      url: 'https://api.test-aro.sdev.devshift.net:6443',
    },
    nodes: {
      total: 9,
      master: 3,
      compute: 6,
    },
    storage_quota: {
      value: 100000000,
      unit: 'B',
    },
    load_balancer_quota: 0,
    metrics: {
      memory: {
        updated_timestamp: '2021-03-15T15:20:20Z',
        used: {
          value: 16546058240,
          unit: 'B',
        },
        total: {
          value: 82293346304,
          unit: 'B',
        },
      },
      cpu: {
        updated_timestamp: '2021-03-15T15:20:20Z',
        used: {
          value: 3.995410922987096,
          unit: '',
        },
        total: {
          value: 16,
          unit: '',
        },
      },
      sockets: {
        updated_timestamp: '2021-03-15T15:20:20Z',
        used: {
          value: 0,
          unit: '',
        },
        total: {
          value: 0,
          unit: '',
        },
      },
      storage: {
        updated_timestamp: '2021-03-15T15:20:20Z',
        used: {
          value: 0,
          unit: 'B',
        },
        total: {
          value: 0,
          unit: 'B',
        },
      },
      nodes: {
        total: 7,
        master: 3,
        compute: 4,
      },
      upgrade: {
        state: '',
      },
    },
    state: 'ready',
    flavour: {
      kind: 'FlavourLink',
      id: 'ocp-4',
      href: '/api/clusters_mgmt/v1/flavours/ocp-4',
    },
    dns: {
      base_domain: 'sdev.devshift.net',
    },
    network: {
      machine_cidr: '10.0.0.0/16',
      service_cidr: '172.30.0.0/16',
      pod_cidr: '10.128.0.0/14',
      router_shards: {
        kind: 'RouterShardListLink',
        href: '/api/clusters_mgmt/v1/clusters/1IztzhAGrbjtKkMbiPewHjImARo/router_shards',
        id: '1IztzhAGrbjtKkMbiPewHjImARo',
      },
    },
    multi_az: false,
    managed: false,
    version: {
      kind: 'VersionLink',
      id: 'openshift-v4.0-latest',
      href: '/api/clusters_mgmt/v1/versions/openshift-v4.0-latest',
    },
    canEdit: true,
    canDelete: true,
    subscription: {
      id: '1msoogsgTLQ4PePjrTOt3UqvMzX',
      kind: 'Subscription',
      href: '/api/accounts_mgmt/v1/subscriptions/1msoogsgTLQ4PePjrTOt3UqvMzX',
      plan: {
        id: 'ARO',
        kind: 'Plan',
        href: '/api/accounts_mgmt/v1/plans/ARO',
        type: 'ARO',
      },
      registry_credential: {
        id: '1EaZd2cDHH6ibIb1FFqav2Mles6',
        kind: 'RegistryCredential',
        href: '/api/accounts_mgmt/v1/registry_credentials/1EaZd2cDHH6ibIb1FFqav2Maro6',
      },
      cluster_id: '1IztzhAGrbjtKkMbiPewHjImARo',
      external_cluster_id: 'test-aro',
      last_telemetry_date: '2021-03-15T15:20:20Z',
      created_at: '2021-03-10T15:20:20Z',
      updated_at: '2021-03-15T15:20:20Z',
    },
    product: {
      id: normalizedProducts.ARO,
    },
    status: {
      state: 'ready',
      dns_ready: true,
    },
    idpActions: {
      get: false,
      list: false,
      create: false,
      update: false,
      delete: false,
    },
  },
};

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

const clusterIdentityProviders = {
  clusterIDPList: [],
};

const organization = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: true,
  details: {
    id: '1MKVU4otCIuogoLtgtyU6wajxjW',
    kind: 'Organization',
    href: '/api/accounts_mgmt/v1/organizations/1MKVU4otCIuogoLtgtyU6wajxjW',
    created_at: '2025-01-02T18:28:14.851121Z',
    updated_at: '2025-01-02T18:28:14.851121Z',
    external_id: '9999999',
    name: 'Test Corp',
    capabilities: [],
  },
};

const clusterRouters = {
  getRouters: {
    routers: [],
  },
};

const userAccess = {
  data: true,
  fulfilled: true,
  pending: false,
};

const regionalInstance = {
  cloud_provider_id: 'aws',
  href: '/api/accounts_mgmt/v1/regions',
  id: 'stage',
  kind: 'Region',
  url: 'https://api.stage.openshift.com',
  environment: 'stage',
  isDefault: true,
};

const fixtures = {
  match,
  clusterDetails,
  CCSClusterDetails,
  OSDTrialClusterDetails,
  OSDRHMClusterDetails,
  OSDGCPClusterDetails,
  ROSAClusterDetails,
  ROSAManualClusterDetails,
  ROSAHypershiftClusterDetails,
  ROSAHypershiftWaitingClusterDetails,
  RHMIClusterDetails,
  insightsData,
  OCPClusterDetails,
  AIClusterDetails,
  AROClusterDetails,
  cloudProviders,
  gotRouters: false,
  clusterIdentityProviders,
  organization,
  clusterRouters,
  clusterLogsViewOptions: {},
  addOns: {},
  supportCases: {},
  notificationContacts: {},
  initTabOpen: '',
  displayClusterLogs: false,
  canTransferClusterOwnership: false,
  canHibernateCluster: true,
  canSubscribeOCP: false,
  hasIssues: false,
  userAccess,
  upgradeGates: [],
  regionalInstance,
};

export { funcs };
export default fixtures;
