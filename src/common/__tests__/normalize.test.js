import get from 'lodash/get';

import { getModule } from '@scalprum/core';

import {
  dedicatedRhInfra,
  rhmiAddon,
  unlimitedROSA,
} from '../../components/clusters/common/__tests__/quota_cost.fixtures';
import {
  fakeClusterFromAISubscriptionWithHostsMetrics,
  normalizeCluster,
  normalizeMetrics,
  normalizeProductID,
  normalizeQuotaCost,
} from '../normalize';
import { normalizedProducts } from '../subscriptionTypes';

jest.mock('@scalprum/core', () => ({
  getModule: jest.fn(),
}));

const productOCP = {
  kind: 'ProductLink',
  id: 'ocp',
  href: '/api/clusters_mgmt/v1/products/ocp',
};
const productROSA = {
  kind: 'ProductLink',
  id: 'rosa',
  href: '/api/clusters_mgmt/v1/products/rosa',
};

const planOCP = {
  id: 'OCP',
  kind: 'Plan',
  href: '/api/accounts_mgmt/v1/plans/OCP',
};

// As of this writing account-manager returns "MOA", in future probably "ROSA".
const planMOA = {
  id: 'MOA',
  kind: 'Plan',
  href: '/api/accounts_mgmt/v1/plans/MOA',
};
const planROSA = {
  id: 'ROSA',
  kind: 'Plan',
  href: '/api/accounts_mgmt/v1/plans/ROSA',
};

const planARO = {
  id: 'ARO',
  kind: 'Plan',
  href: '/api/accounts_mgmt/v1/plans/ARO',
};

describe('normalizeProductID', () => {
  test('Normalizes clusters-service products', () => {
    expect(normalizeProductID(productOCP.id)).toEqual(normalizedProducts.OCP);
    expect(normalizeProductID(productROSA.id)).toEqual(normalizedProducts.ROSA);
  });

  test('Normalizes account-manager plans', () => {
    expect(normalizeProductID(planOCP.id)).toEqual(normalizedProducts.OCP);
    expect(normalizeProductID(planMOA.id)).toEqual(normalizedProducts.ROSA);
    expect(normalizeProductID(planROSA.id)).toEqual(normalizedProducts.ROSA);
    expect(normalizeProductID(planARO.id)).toEqual(normalizedProducts.ARO);
    // quota_cost may contain "product": "any".
    expect(normalizeProductID('any')).toEqual(normalizedProducts.ANY);
  });

  // It's convenient to call normalization in many places, a value may be normalized multiple times.
  test.each([...Object.values(normalizedProducts)])('is idempotent for %p', (product) =>
    expect(normalizeProductID(product)).toEqual(product),
  );
});

describe('normalizeQuotaCost', () => {
  test('Normalizes product ids', () => {
    const products = (quotaCost) => quotaCost.related_resources.map((r) => r.product);

    expect(products(normalizeQuotaCost(dedicatedRhInfra[0]))).toEqual([
      normalizedProducts.OSD,
      normalizedProducts.OSD,
    ]);
    expect(products(normalizeQuotaCost(unlimitedROSA[0]))).toEqual([normalizedProducts.ROSA]);
    expect(products(normalizeQuotaCost(rhmiAddon[0]))).toEqual([
      normalizedProducts.OSD,
      normalizedProducts.RHMI,
    ]);
  });
});

// Some data is fake.
const clusterWithMetrics = {
  kind: 'Cluster',
  id: 'd39bb4c2331c7dd4b4183075c8afc27c',
  href: '/api/clusters_mgmt/v1/clusters/d39bb4c2331c7dd4b4183075c8afc27c',
  name: 'fake-cluster-with-real-external_id',
  external_id: '0a5af75f-d5cc-4e73-a404-44db2c9fa235',
  display_name: 'Fake clusters with real external_id',
  creation_timestamp: '2019-01-19T19:19:19Z',
  cloud_provider: {
    kind: 'CloudProviderLink',
    id: 'aws',
    href: '/api/clusters_mgmt/v1/cloud_providers/aws',
  },
  openshift_version: '4.0.0-0.alpha-2019-04-10-154442',
  subscription: {
    kind: 'SubscriptionLink',
    id: 'subscription-id',
    href: '/api/accounts_mgmt/v1/subscriptions/subscription-id',
  },
  region: {
    kind: 'CloudRegionLink',
    id: 'us-west-1',
    href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-west-1',
  },
  console: {
    url: 'https://console.example.com',
  },
  api: {
    url: 'https://api.example.com',
  },
  nodes: {
    total: 5,
    master: 3,
    compute: 2,
  },
  state: 'error',
  flavour: {
    kind: 'FlavourLink',
    id: 'osd-4',
    href: '/api/clusters_mgmt/v1/flavours/osd-4',
  },
  groups: {
    kind: 'GroupListLink',
    href: '/api/clusters_mgmt/v1/clusters/d39bb4c2331c7dd4b4183075c8afc27c/groups',
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
      href: '/api/clusters_mgmt/v1/clusters/d39bb4c2331c7dd4b4183075c8afc27c/router_shards',
      id: 'd39bb4c2331c7dd4b4183075c8afc27c',
    },
  },
  multi_az: false,
  managed: true,
  version: {
    kind: 'VersionLink',
    id: 'openshift-v4.0-latest',
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.0-latest',
  },
  identity_providers: {
    kind: 'IdentityProviderListLink',
    href: '/api/clusters_mgmt/v1/clusters/d39bb4c2331c7dd4b4183075c8afc27c/identity_providers',
  },
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
  },
  product: {
    kind: 'ProductLink',
    id: 'osd',
    href: '/api/clusters_mgmt/v1/products/osd',
  },
};

// TODO: finalize when https://jira.coreos.com/browse/SDA-821 is completed.
const clusterWithMissingMetrics = {
  kind: 'Cluster',
  id: '8d6ad4b972ca06f7dd6b99ebd99087eb',
  href: '/api/clusters_mgmt/v1/clusters/8d6ad4b972ca06f7dd6b99ebd99087eb',
  name: 'fake-cluster-with-real-external_id',
  external_id: '00051f02-ba55-4262-a8d2-56de91434003',
  display_name: 'Fake clusters with real external_id',
  creation_timestamp: '2019-01-19T19:19:19Z',
  cloud_provider: {
    kind: 'CloudProviderLink',
    id: 'aws',
    href: '/api/clusters_mgmt/v1/cloud_providers/aws',
  },
  openshift_version: 'openshift ver',
  subscription: {
    kind: 'SubscriptionLink',
    id: 'subscription-id',
    href: '/api/accounts_mgmt/v1/subscriptions/subscription-id',
  },
  region: {
    kind: 'CloudRegionLink',
    id: 'us-west-1',
    href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-west-1',
  },
  console: {
    url: 'https://console.example.com',
  },
  api: {
    url: 'https://api.example.com',
  },
  nodes: {
    total: 5,
    master: 3,
    compute: 2,
  },
  state: 'error',
  flavour: {
    kind: 'FlavourLink',
    id: 'osd-4',
    href: '/api/clusters_mgmt/v1/flavours/osd-4',
  },
  groups: {
    kind: 'GroupListLink',
    href: '/api/clusters_mgmt/v1/clusters/8d6ad4b972ca06f7dd6b99ebd99087eb/groups',
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
      href: '/api/clusters_mgmt/v1/clusters/8d6ad4b972ca06f7dd6b99ebd99087eb/router_shards',
      id: '8d6ad4b972ca06f7dd6b99ebd99087eb',
    },
  },
  multi_az: false,
  managed: true,
  version: {
    kind: 'VersionLink',
    id: 'openshift-v4.0-latest',
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.0-latest',
  },
  identity_providers: {
    kind: 'IdentityProviderListLink',
    href: '/api/clusters_mgmt/v1/clusters/8d6ad4b972ca06f7dd6b99ebd99087eb/identity_providers',
  },
  metrics: {
    memory: {
      used: {
        unit: 'B',
      },
      total: {
        unit: 'B',
      },
    },
    cpu: {
      used: {
        unit: '',
      },
      total: {
        unit: '',
      },
    },
    storage: {
      used: {
        unit: 'B',
      },
      total: {
        unit: 'B',
      },
    },
    nodes: {},
  },
  product: {
    kind: 'ProductLink',
    id: 'osd',
    href: '/api/clusters_mgmt/v1/products/osd',
  },
};

test('Normalizes cluster from API with .metrics subobject', () => {
  const res = normalizeCluster(clusterWithMetrics);
  expect(res.metrics.cpu.total).toEqual({ value: 16, unit: '' });
  expect(res.metrics.nodes.master).toEqual(3);
});

test('Normalizes cluster whose metrics fields completely missing', () => {
  const res = normalizeCluster(clusterWithMissingMetrics);
  expect(get(res, 'metrics.cpu.total.value')).toBeUndefined();
  expect(get(res, 'metrics.nodes.master')).toBeUndefined();
});

describe('normalizeMetrics()', () => {
  const emptyMetrics = {
    memory: {
      used: {
        value: 0,
        unit: 'B',
      },
      total: {
        value: 0,
        unit: 'B',
      },
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
      total: 0,
      master: 0,
      compute: 0,
    },
    state: 'N/A',
    upgrade: {
      available: false,
    },
  };

  it('returns empty metrics structure when empty object is received', () => {
    const ret = normalizeMetrics({});
    expect(ret).toMatchObject(emptyMetrics);
  });

  it('returns empty metrics structure when undefined is received', () => {
    const ret = normalizeMetrics();
    expect(ret).toMatchObject(emptyMetrics);
  });

  it('fills in missing fields when partial metrics are recieved', () => {
    const ret = normalizeMetrics({
      memory: {
        used: {
          value: 1,
          unit: 'B',
        },
        total: {
          value: 1,
          unit: 'B',
        },
      },
    });
    expect(ret.storage).toMatchObject(emptyMetrics.storage);
  });

  it('fills in missing unit fields when partial metrics are recieved', () => {
    const ret = normalizeMetrics({
      memory: {
        used: {
          value: 1,
        },
        total: {},
      },
    });
    expect(ret.memory).toMatchObject({
      used: {
        value: 1,
        unit: 'B',
      },
      total: {
        value: 0,
        unit: 'B',
      },
    });
  });

  it('returns original metrics when everything is fine', () => {
    expect(normalizeMetrics(clusterWithMetrics.metrics)).toMatchObject(clusterWithMetrics.metrics);
  });
});

describe('fakeClusterFromAISubscriptionWithHostsMetrics', () => {
  const aiSubscriptionWithoutMetrics = {
    id: 'sub-id',
    cluster_id: 'cluster-id',
    plan: {
      id: normalizedProducts.OCP_AssistedInstall,
      type: normalizedProducts.OCP_AssistedInstall,
    },
    metrics: [],
  };

  const aiClusterWithHosts = {
    openshiftVersion: '4.14.0',
    status: 'installed',
    hosts: [{ id: 'host-1' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enriches cluster metrics from federated computeAIClusterMetrics', async () => {
    const computeAIClusterMetrics = jest.fn().mockReturnValue({
      memoryTotal: 100,
      cpuTotal: 8,
      workerCount: 2,
      masterCount: 3,
    });
    getModule.mockResolvedValue(computeAIClusterMetrics);

    const cluster = await fakeClusterFromAISubscriptionWithHostsMetrics(
      aiSubscriptionWithoutMetrics,
      aiClusterWithHosts,
    );

    expect(getModule).toHaveBeenCalledWith(
      'assistedInstallerApp',
      './computeAIClusterMetrics',
      'computeAIClusterMetrics',
    );
    expect(computeAIClusterMetrics).toHaveBeenCalledWith(aiClusterWithHosts);
    expect(cluster.metrics.memory.total.value).toBe(100);
    expect(cluster.metrics.cpu.total.value).toBe(8);
    expect(cluster.metrics.nodes.total).toBe(5);
    expect(cluster.metrics.nodes.master).toBe(3);
    expect(cluster.metrics.nodes.compute).toBe(2);
  });

  it('returns cluster when federated metrics module fails to load', async () => {
    getModule.mockRejectedValue(new Error('load failed'));

    const cluster = await fakeClusterFromAISubscriptionWithHostsMetrics(
      aiSubscriptionWithoutMetrics,
      aiClusterWithHosts,
    );

    expect(cluster.id).toBe('cluster-id');
  });
});
