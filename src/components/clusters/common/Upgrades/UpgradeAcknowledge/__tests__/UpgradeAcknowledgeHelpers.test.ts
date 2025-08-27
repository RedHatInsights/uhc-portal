import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import type { UpgradePolicy } from '~/types/clusters_mgmt.v1';
import type { AugmentedCluster } from '~/types/types';

import { getFromVersionFromHelper, getToVersionFromHelper } from '../UpgradeAcknowledgeHelpers';

const mockGCPCluster = {
  kind: 'Cluster',
  id: '2h9luc0gq0ndb59258q77lr1pmon1j4j',
  href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j',
  name: 'fake-gcp-wif',
  domain_prefix: 'fake-gcp-wif',
  external_id: 'fake-cluster-b5ceeb7c-1b14-4fe5-860e-d6a7d68ab04f',
  infra_id: 'fake-infra-id',
  display_name: 'fake-gcp-wif',
  creation_timestamp: '2025-03-03T13:23:09.271425Z',
  activity_timestamp: '2025-03-03T13:23:09.271425Z',
  expiration_timestamp: '2025-03-05T01:22:58.197216Z',
  cloud_provider: {
    kind: 'CloudProviderLink',
    id: 'gcp',
    href: '/api/clusters_mgmt/v1/cloud_providers/gcp',
  },
  subscription: {
    billing_expiration_date: '0001-01-01T00:00:00Z',
    capabilities: [
      {
        inherited: true,
        name: subscriptionCapabilities.ENABLE_ACCESS_PROTECTION,
        value: 'true',
      },
      {
        inherited: true,
        name: subscriptionCapabilities.SUBSCRIBED_OCP,
        value: 'true',
      },
      {
        inherited: true,
        name: subscriptionCapabilities.AUTOSCALE_CLUSTERS,
        value: 'true',
      },
    ],
    cloud_account_id: 'ocm-ui-dev',
    cloud_provider_id: 'gcp',
    cluster_billing_model: 'standard',
    cluster_id: '2h9luc0gq0ndb59258q77lr1pmon1j4j',
    created_at: '2025-03-03T13:23:08.853988Z',
    creator: {
      email: '***REMOVED***',
      first_name: 'Elizabeta',
      href: '/api/accounts_mgmt/v1/accounts/2K89szemF25dKqb0w16cdfucF92',
      id: '2K89szemF25dKqb0w16cdfucF92',
      kind: 'Account',
      last_name: 'Gilman',
      name: 'Elizabeta Gilman',
      username: 'egilman-ocm',
    },
    display_name: 'fake-gcp-wif',
    eval_expiration_date: '0001-01-01T00:00:00Z',
    href: '/api/accounts_mgmt/v1/subscriptions/2toAjUzoKUv8lkRy69yMfFiWn6y',
    id: '2toAjUzoKUv8lkRy69yMfFiWn6y',
    kind: 'Subscription',
    last_reconcile_date: '0001-01-01T00:00:00Z',
    last_released_at: '0001-01-01T00:00:00Z',
    last_telemetry_date: '0001-01-01T00:00:00Z',
    managed: true,
    organization: {
      created_at: '2021-08-18T17:39:22.305773Z',
      ebs_account_id: '7321618',
      external_id: '15212158',
      href: '/api/accounts_mgmt/v1/organizations/1wuVGGV6SCmD8ya6yRGEJzvmVuC',
      id: '1wuVGGV6SCmD8ya6yRGEJzvmVuC',
      kind: 'Organization',
      name: 'Red Hat, Inc.',
      updated_at: '2025-03-03T08:16:02.719324Z',
    },
    organization_id: '1wuVGGV6SCmD8ya6yRGEJzvmVuC',
    plan: {
      id: 'OSD',
      type: 'OSD',
    },
    provenance: 'Provisioning',
    status: 'Reserved',
    support_level: 'Premium',
    trial_end_date: '0001-01-01T00:00:00Z',
    updated_at: '2025-03-03T13:23:08.853988Z',
  },
  region: {
    kind: 'CloudRegionLink',
    id: 'us-east1',
    href: '/api/clusters_mgmt/v1/cloud_providers/gcp/regions/us-east1',
  },
  console: {
    url: 'https://https://example.com/veryfakewebconsole',
  },
  api: {
    url: 'https://example.com/veryfakeapi',
    listening: 'external',
  },
  nodes: {
    master: 3,
    infra: 2,
    compute: 2,
    availability_zones: ['us-east1-b'],
    compute_machine_type: {
      kind: 'MachineTypeLink',
      id: 'n2-standard-4',
      href: '/api/clusters_mgmt/v1/machine_types/n2-standard-4',
    },
    infra_machine_type: {
      kind: 'MachineTypeLink',
      id: 'n2-highmem-4',
      href: '/api/clusters_mgmt/v1/machine_types/n2-highmem-4',
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
    href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/groups',
  },
  properties: {
    fake_cluster: 'true',
  },
  gcp: {
    project_id: 'ocm-ui-dev',
    security: {
      secure_boot: false,
    },
    authentication: {
      kind: 'WifConfig',
      id: '2g6lbq1di4s9q3b6hoimg5p7auvk9crc',
      href: '/api/clusters_mgmt/v1/gcp/wif_configs/2g6lbq1di4s9q3b6hoimg5p7auvk9crc',
    },
  },
  dns: {
    base_domain: 'wgvm.s2.devshift.org',
  },
  network: {
    type: 'OVNKubernetes',
    machine_cidr: '10.0.0.0/16',
    service_cidr: '172.30.0.0/16',
    pod_cidr: '10.128.0.0/14',
    host_prefix: 23,
  },
  external_configuration: {
    kind: 'ExternalConfiguration',
    href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/external_configuration',
    syncsets: {
      kind: 'SyncsetListLink',
      href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/external_configuration/syncsets',
    },
    labels: {
      kind: 'LabelListLink',
      href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/external_configuration/labels',
    },
    manifests: {
      kind: 'ManifestListLink',
      href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/external_configuration/manifests',
    },
  },
  multi_az: false,
  managed: true,
  ccs: {
    enabled: true,
    disable_scp_checks: false,
  },
  version: {
    kind: 'Version',
    id: 'openshift-v4.17.19-candidate',
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.17.19-candidate',
    raw_id: '4.17.19',
    channel_group: 'candidate',
    available_upgrades: ['4.18.2', '4.19.0'],
    end_of_life_timestamp: '2026-02-14T00:00:00Z',
  },
  identity_providers: {
    kind: 'IdentityProviderListLink',
    href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/identity_providers',
  },
  ingresses: {
    kind: 'IngressListLink',
    href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/ingresses',
  },
  machine_pools: {
    kind: 'MachinePoolListLink',
    href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/machine_pools',
  },
  inflight_checks: [],
  product: {
    id: 'OSD',
  },
  status: {
    state: 'ready',
    dns_ready: true,
    oidc_ready: false,
    provision_error_message: '',
    provision_error_code: '',
    configuration_mode: 'full',
    limited_support_reason_count: 0,
  },
  node_drain_grace_period: {
    value: 60,
    unit: 'minutes',
  },
  etcd_encryption: false,
  billing_model: 'standard',
  disable_user_workload_monitoring: false,
  managed_service: {
    enabled: false,
    managed: false,
  },
  hypershift: {
    enabled: false,
  },
  byo_oidc: {
    enabled: false,
  },
  delete_protection: {
    href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/delete_protection',
    enabled: false,
  },
  external_auth_config: {
    kind: 'ExternalAuthConfig',
    href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/external_auth_config',
    enabled: false,
    external_auths: {
      href: '/api/clusters_mgmt/v1/clusters/2h9luc0gq0ndb59258q77lr1pmon1j4j/external_auth_config/external_auths',
    },
  },
  multi_arch_enabled: false,
  metrics: {
    memory: {
      used: {
        value: 0,
        unit: 'B',
      },
      total: {
        value: 0,
        unit: 'B',
      },
      updated_timestamp: '',
    },
    cpu: {
      used: {
        value: 0,
        unit: '',
      },
      total: {
        value: 0,
        unit: '',
      },
      updated_timestamp: '',
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
      updated_timestamp: '',
    },
    nodes: {
      total: 0,
      master: 0,
      compute: 0,
    },
    state: 'N/A',
    upgrade: {
      available: false,
    },
    cloud_provider: '',
    cluster_type: '',
    compute_nodes_cpu: {
      used: {
        value: 0,
        unit: '',
      },
      total: {
        value: 0,
        unit: '',
      },
      updated_timestamp: '',
    },
    compute_nodes_memory: {
      used: {
        value: 0,
        unit: '',
      },
      total: {
        value: 0,
        unit: '',
      },
      updated_timestamp: '',
    },
    compute_nodes_sockets: {
      used: {
        value: 0,
        unit: '',
      },
      total: {
        value: 0,
        unit: '',
      },
      updated_timestamp: '',
    },
    console_url: '',
    critical_alerts_firing: 0,
    non_virt_nodes: 0,
    openshift_version: '',
    operating_system: '',
    operators_condition_failing: 0,
    region: '',
    sockets: {
      used: {
        value: 0,
        unit: '',
      },
      total: {
        value: 0,
        unit: '',
      },
      updated_timestamp: '',
    },
    state_description: '',
    subscription_cpu_total: 0,
    subscription_obligation_exists: 0,
    subscription_socket_total: 0,
  },
  upgradeGates: [],
  limitedSupportReasons: [],
  canEdit: true,
  canEditOCMRoles: true,
  canViewOCMRoles: true,
  canUpdateClusterResource: true,
  canEditClusterAutoscaler: true,
  idpActions: {
    create: true,
    update: true,
    get: true,
    list: true,
    delete: true,
  },
  machinePoolsActions: {
    create: true,
    update: true,
    get: true,
    list: true,
    delete: true,
  },
  kubeletConfigActions: {
    create: true,
    update: true,
    get: true,
    list: true,
    delete: true,
  },
  canDelete: true,
  wifConfigName: 're-wif-13',
};

const mockSchedules = [
  {
    version: '4.18.2',
    schedule_type: 'automatic',
    schedule: 'daily',
  },
];
describe('UpgradeAcknowledgeHelpers', () => {
  describe('getFromVersionFromHelper', () => {
    it('Get the version from the schedules', () => {
      const result = getFromVersionFromHelper(mockGCPCluster as unknown as AugmentedCluster);
      expect(result).toEqual('4.17.19');
    });
  });
  describe('getToVersionFromHelper', () => {
    it('Should return the version from the schedules', () => {
      const result = getToVersionFromHelper(
        mockSchedules as unknown as UpgradePolicy[],
        mockGCPCluster as unknown as AugmentedCluster,
      );
      expect(result).toEqual('4.18.2');
    });
    it('Should return the highest available upgrade when no schedules set', () => {
      const result = getToVersionFromHelper([], mockGCPCluster as unknown as AugmentedCluster);
      expect(result).toEqual('4.19.0');
    });
  });
});
