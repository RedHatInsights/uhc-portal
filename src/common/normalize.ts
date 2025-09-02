import type { AxiosResponse } from 'axios';
import { Draft, produce } from 'immer';

import type { Cluster as AICluster } from '@openshift-assisted/types/assisted-installer-service';
import {
  getClusterMemoryAmount as getAIMemoryAmount,
  getClustervCPUCount as getAIClusterCPUCount,
  getMasterCount as getAICMasterCount,
  getWorkerCount as getAICWorkerCount,
} from '@openshift-assisted/ui-lib/ocm';

import {
  type ClusterMetricsNodes,
  type ClusterResource,
  type OneMetric,
  type QuotaCost,
  type Subscription,
  SubscriptionCommonFieldsStatus,
} from '../types/accounts_mgmt.v1';
import type { Cluster } from '../types/clusters_mgmt.v1';
import type { FakeCluster } from '../types/types';

import { isAISubscriptionWithoutMetrics } from './isAssistedInstallerCluster';
import { clustersServiceProducts, normalizedProducts } from './subscriptionTypes';
import { versionComparator } from './versionComparator';

/**
 * Erases the differences between clusters-service products and account-manager plans
 * which use related but different values (see https://issues.redhat.com/browse/SDB-1625).
 * @param {string} id - one of cluster.product.id, subscription.plan.type,
 *   subscription.plan.id, quota_cost.related_resources[].product (including "any").
 * @returns {string} one of subscriptionTypes.normalizedProducts consts.
 */
const normalizeProductID = (id: string | undefined): string => {
  const map: { [key: string]: string } = {
    OCP: normalizedProducts.OCP,
    OSD: normalizedProducts.OSD,
    OSDTRIAL: normalizedProducts.OSDTrial,
    RHMI: normalizedProducts.RHMI,
    MOA: normalizedProducts.ROSA,
    ROSA: normalizedProducts.ROSA,
    ROSA_HYPERSHIFT: normalizedProducts.ROSA_HyperShift,
    MOA_HOSTEDCONTROLPLANE: normalizedProducts.ROSA_HyperShift,
    ARO: normalizedProducts.ARO,
    OCP_ASSISTEDINSTALL: normalizedProducts.OCP_AssistedInstall,
    RHACS: normalizedProducts.RHACS,
    RHACSTRIAL: normalizedProducts.RHACSTrial,
    RHOSR: normalizedProducts.RHOSR,
    RHOSRTRIAL: normalizedProducts.RHOSRTrial,
    RHOSAK: normalizedProducts.RHOSAK,
    RHOSAKTRIAL: normalizedProducts.RHOSAKTrial,
    RHOSE: normalizedProducts.RHOSE,
    RHOSETRIAL: normalizedProducts.RHOSETrial,
    RHOIC: normalizedProducts.RHOIC,
    ANY: normalizedProducts.ANY, // used by account-manager in quota_cost
  };

  if (typeof id !== 'string') {
    return normalizedProducts.UNKNOWN;
  }

  return map[id.toUpperCase().replace('-', '_')] || normalizedProducts.UNKNOWN;
};

const emptyMetrics: OneMetric = {
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

  // additional required properties
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
};

const normalizeMetrics = (metrics: OneMetric | undefined): OneMetric => {
  const ret = metrics ? { ...emptyMetrics, ...metrics } : { ...emptyMetrics };
  const subFields: (keyof OneMetric)[] = ['memory', 'storage', 'cpu', 'nodes'];
  const consumptionFields = ['memory', 'storage', 'cpu']; // fields with total+used
  subFields.forEach((field) => {
    (ret[field] as unknown) = {
      ...(emptyMetrics[field] as ClusterResource | ClusterMetricsNodes),
      ...(ret[field] as ClusterResource | ClusterMetricsNodes),
    };
    if (consumptionFields.includes(field)) {
      const consumptionField = ret[field] as ClusterResource;
      const recievedTotal = consumptionField.total || {};
      const recievedUsed = consumptionField.used || {};
      const emptyConsumptionField = emptyMetrics[field] as ClusterResource;
      consumptionField.total = { ...emptyConsumptionField.total, ...recievedTotal };
      consumptionField.used = { ...emptyConsumptionField.used, ...recievedUsed };
    }
  });
  return ret;
};

const normalizeCluster = <C extends Cluster>(cluster: C): C => {
  const result = { ...cluster };

  result.product = {
    // Omit other properties like "href", we only use the id anyway.
    id: normalizeProductID(cluster.product?.id),
  };

  // make sure available_upgrades are sorted
  if (cluster.version && cluster.version.available_upgrades) {
    // There are rare situations where when a modal is opened on the cluster list and cluster details
    // pages the sort command below throws an error
    // the exact cause of this error is not known but this protects the UI from crashing
    try {
      result.version?.available_upgrades?.sort(versionComparator);
    } catch (error) {
      // code should continue with unsorted items

      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  return result;
};

// Normalize data from AMS for an unmanaged cluster.
const fakeClusterFromSubscription = (subscription: Subscription): FakeCluster => {
  const metric = subscription.metrics?.[0];
  const metrics = normalizeMetrics(metric);

  // Omitting some fields that real data from clusters-service does have, but we won't use.
  const cluster: FakeCluster = {
    subscription_id: subscription.id,
    id: subscription.cluster_id,
    external_id: subscription.external_cluster_id,
    console: {
      url: subscription.console_url,
    },
    creation_timestamp: subscription.created_at,
    activity_timestamp: metric ? metric.query_timestamp : subscription.last_telemetry_date,
    state: metrics.state,
    openshift_version: metrics.openshift_version,
    cpu_architecture: metrics.arch,
    product: {
      // Omit other properties like "href", we only use the id anyway.
      id: normalizeProductID(subscription.plan?.id),
      type: normalizeProductID(subscription.plan?.type),
    },
    managed: clustersServiceProducts.includes(normalizeProductID(subscription.plan?.type)),
    ccs: {
      // deprovisioned clusters do not have CCS info, so leaving it as 'undefined'
      enabled:
        subscription.status !== SubscriptionCommonFieldsStatus.Deprovisioned ? false : undefined,
    },
    metrics,
  };
  const cloudProvider = subscription.cloud_provider_id;
  if (cloudProvider) {
    cluster.cloud_provider = {
      id: cloudProvider.toLowerCase(),
    };
  }
  const regionId = subscription.region_id;
  if (regionId) {
    cluster.region = {
      id: regionId.toLowerCase(),
    };
  }

  return cluster;
};

const fakeClusterFromAISubscription = (
  subscription: Subscription,
  aiCluster?: AICluster,
): FakeCluster => {
  const cluster = fakeClusterFromSubscription(subscription);
  if (isAISubscriptionWithoutMetrics(subscription)) {
    // Enrich for AI Cluster data instead.
    const clusterWorkers = aiCluster ? getAICWorkerCount(aiCluster.hosts ?? []) : 0;
    const clusterMasters = aiCluster ? getAICMasterCount(aiCluster.hosts ?? []) : 0;

    cluster.metrics.memory.total.value = aiCluster ? getAIMemoryAmount(aiCluster) : 0;
    cluster.metrics.cpu.total.value = aiCluster ? getAIClusterCPUCount(aiCluster) : 0;
    cluster.metrics.nodes.total = clusterWorkers + clusterMasters;
    cluster.metrics.nodes.master = clusterMasters;
    cluster.metrics.nodes.compute = clusterWorkers;

    const openshiftVersion =
      cluster.metrics.openshift_version || aiCluster?.openshiftVersion || 'N/A';
    cluster.metrics.openshift_version = openshiftVersion;
    cluster.openshift_version = openshiftVersion;

    const status = aiCluster?.status || 'N/A';
    cluster.metrics.state = status;
    cluster.state = status;
    cluster.cpu_architecture = cluster.metrics.arch;
  }

  return cluster;
};

const normalizeSubscription = (subscription: Subscription): Subscription => ({
  ...subscription,
  plan: {
    // Omit other properties like "href", we only use the id and type
    id: normalizeProductID(subscription.plan?.id),
    type: normalizeProductID(subscription.plan?.type),
  },
});

/**
 * Normalize a single element of QuotaCostList (which may contain multiple related_resources).
 * @param {Object} quotaCost - a QuotaCost.
g */
const normalizeQuotaCost = (quotaCost: QuotaCost): QuotaCost => ({
  ...quotaCost,
  related_resources: (quotaCost?.related_resources ?? []).map((resource) => ({
    ...resource,
    product: normalizeProductID(resource.product),
  })),
});

/**
 * Applies a function to each item in .data.items.
 * @param response {Object} result of successful Axios promise containing a collection.
 *   .data is where Axios puts the parsed JSON body, and this function is applicable
 *   to responses like ClusterList that contain an .items array.
 */
const mapListResponse = <I extends any, T extends { items?: I[] }, D extends Draft<I>>(
  response: AxiosResponse<T>,
  itemFunc: (value: Draft<I>, index: number, array: Draft<I>[]) => D,
) =>
  produce(response, (draft) => {
    draft.data.items = draft.data.items?.map(itemFunc);
  });

export {
  fakeClusterFromAISubscription,
  fakeClusterFromSubscription,
  mapListResponse,
  normalizeCluster,
  normalizeMetrics,
  normalizeProductID,
  normalizeQuotaCost,
  normalizeSubscription,
};
