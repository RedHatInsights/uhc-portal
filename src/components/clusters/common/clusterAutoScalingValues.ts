import {
  AutoscalerResourceLimits,
  AutoscalerResourceLimitsGpuLimit,
  ClusterAutoscaler,
} from '~/types/clusters_mgmt.v1';

import { MAX_NODES as MAX_NODES_DEFAULT } from './machinePools/constants';

const MAX_CORES_DEFAULT = MAX_NODES_DEFAULT * 64;
const MAX_MEMORY_DEFAULT = MAX_NODES_DEFAULT * 64 * 20;

export type ClusterAutoScalingForm = Omit<
  Required<ClusterAutoscaler>,
  'id' | 'kind' | 'href' | 'balancing_ignored_labels' | 'resource_limits'
> & {
  balancing_ignored_labels: string;
  resource_limits: Omit<Required<AutoscalerResourceLimits>, 'gpus'> & {
    gpus: string;
  };
};

/**
 * Returns a ClusterAutoscaler object which has all the fields of the ClusterAutoscaler.
 * Every property has the appropriate default value as per the k8s documentation:
 * https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md#what-are-the-parameters-to-ca
 *
 * Notes:
 *
 * 1. Some fields from the API are named differently from the k8s setting.
 * The name change can be seen applied by the function "AutoscalerArgs" from:
 * https://github.com/openshift/cluster-autoscaler-operator/blob/master/pkg/controller/clusterautoscaler/clusterautoscaler.go

 * 2. The accepted format for each field can be found in:
 * https://github.com/openshift/cluster-autoscaler-operator/blob/master/pkg/apis/autoscaling/v1/clusterautoscaler_types.go
 *
 * @returns ClusterAutoscaler object with correct defaults
 */
const getDefaultClusterAutoScaling = (
  maxNodesTotal = MAX_NODES_DEFAULT,
): ClusterAutoScalingForm => ({
  // UI General settings (not grouped on the API object definition)
  balance_similar_node_groups: false,

  balancing_ignored_labels: '',
  skip_nodes_with_local_storage: true,
  log_verbosity: 1, // 1 to 6
  ignore_daemonsets_utilization: false,
  max_node_provision_time: '15m',

  // "max_pod_grace_period" in the API is mapped to "max-graceful-termination-sec" in k8s
  max_pod_grace_period: 600,

  // "pod_priority_threshold" in the API is mapped to "expendable-pods-priority-cutoff" in k8s
  pod_priority_threshold: -10,

  // UI Resource limits section
  resource_limits: {
    max_nodes_total: maxNodesTotal,
    cores: {
      min: 0,
      max: MAX_CORES_DEFAULT,
    },
    memory: {
      min: 0,
      max: MAX_MEMORY_DEFAULT,
    },
    gpus: '',
  },
  // UI Scale down section
  scale_down: {
    enabled: true,
    delay_after_add: '10m',
    delay_after_delete: '0s',
    delay_after_failure: '3m',
    utilization_threshold: '0.5', // 0 to 1
    unneeded_time: '10m',
  },
});

/**
 * Transforms the data in the form, to that which can be submitted
 *
 * @param formAutoscaler formData to submit
 */
const getClusterAutoScalingSubmitSettings = (
  formAutoscaler: ClusterAutoScalingForm & { isSelected?: boolean },
): ClusterAutoscaler => {
  let scaleDown;
  if (formAutoscaler.scale_down?.enabled) {
    scaleDown = { ...formAutoscaler.scale_down };
    scaleDown.utilization_threshold = `${scaleDown.utilization_threshold}`; // Is defined as a string in the API
  } else {
    scaleDown = { enabled: false };
  }

  let apiGpus: AutoscalerResourceLimitsGpuLimit[] = [];

  if (formAutoscaler.resource_limits.gpus) {
    const gpuStr = formAutoscaler.resource_limits.gpus || '';
    const gpuItems = gpuStr.split(',');
    apiGpus = gpuItems.map((gpuParam) => {
      const parts = gpuParam.split(':');
      return {
        type: parts[0],
        range: {
          min: Number(parts[1]),
          max: Number(parts[2]),
        },
      };
    });
  }

  const ignoredLabels = (formAutoscaler.balancing_ignored_labels || '').split(',').filter(Boolean);

  const settings = {
    ...formAutoscaler,
    scale_down: scaleDown,
    // TODO "balancing_ignored_labels" and "resource_limits.gpus" won't be cleared by the API if they had existing values
    // https://issues.redhat.com/browse/OCM-2927 needs to be implemented, then the UI can send the correct values
    balancing_ignored_labels: ignoredLabels,
    resource_limits: {
      ...formAutoscaler.resource_limits,
      gpus: apiGpus,
    },
  };

  // @ts-ignore
  delete settings.isSelected;
  return settings;
};

/**
 * Transforms the data from the API, to that which can be used in the forms
 * @param apiAutoscaler autoscaler from the API
 */
const getCompleteFormClusterAutoscaling = (apiAutoscaler: ClusterAutoscaler) => {
  const formAutoscaler = { ...apiAutoscaler };
  const defaultAutoscaler = getDefaultClusterAutoScaling();
  if (!formAutoscaler.scale_down) {
    formAutoscaler.scale_down = defaultAutoscaler.scale_down;
  }

  if (!formAutoscaler.scale_down.delay_after_add) {
    formAutoscaler.scale_down.delay_after_add = defaultAutoscaler.scale_down.delay_after_add;
  }
  if (!formAutoscaler.scale_down.delay_after_delete) {
    formAutoscaler.scale_down.delay_after_delete = defaultAutoscaler.scale_down.delay_after_delete;
  }
  if (!formAutoscaler.scale_down.delay_after_failure) {
    formAutoscaler.scale_down.delay_after_failure =
      defaultAutoscaler.scale_down.delay_after_failure;
  }
  if (!formAutoscaler.scale_down.unneeded_time) {
    formAutoscaler.scale_down.unneeded_time = defaultAutoscaler.scale_down.unneeded_time;
  }
  if (!formAutoscaler.scale_down.utilization_threshold) {
    formAutoscaler.scale_down.utilization_threshold =
      defaultAutoscaler.scale_down.utilization_threshold;
  }

  const apiGpus = formAutoscaler.resource_limits?.gpus || [];
  // @ts-ignore
  formAutoscaler.resource_limits.gpus = apiGpus
    .map((gpu) => `${gpu.type}:${gpu.range?.min || 0}:${gpu.range?.max || 0}`)
    .join(',');

  const apiIgnoredLabels = formAutoscaler.balancing_ignored_labels || [];
  // @ts-ignore
  formAutoscaler.balancing_ignored_labels = apiIgnoredLabels.join(',');

  return formAutoscaler;
};

export {
  getDefaultClusterAutoScaling,
  getClusterAutoScalingSubmitSettings,
  getCompleteFormClusterAutoscaling,
  MAX_NODES_DEFAULT,
};
