import { ENABLE_AWS_TAGS_EDITING } from '~/queries/featureGates/featureConstants';
import { AwsMachinePool, MachinePool, NodePool } from '~/types/clusters_mgmt.v1';
import { ImageType } from '~/types/clusters_mgmt.v1/enums';

import { EditMachinePoolValues } from './hooks/useMachinePoolFormik';

const getLabels = (labels: EditMachinePoolValues['labels']) =>
  labels.length === 1 && !labels[0].key
    ? {}
    : labels.reduce(
        (acc, { key, value }) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );

const getAWSTags = (awsTags: EditMachinePoolValues['awsTags']) =>
  awsTags.length === 1 && !awsTags[0].key
    ? {}
    : awsTags.reduce(
        (acc, { key, value }) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );

const getTaints = (taints: EditMachinePoolValues['taints']) =>
  taints.length === 1 && !taints[0].key ? [] : taints;

const getAutoscalingParams = (
  values: EditMachinePoolValues,
  isMultiAz: boolean,
  isHypershift: boolean,
) => {
  if (values.autoscaling) {
    const maxReplica = values.autoscaleMax * (isMultiAz ? 3 : 1);
    const minReplica = values.autoscaleMin * (isMultiAz ? 3 : 1);

    const autoscaling = isHypershift
      ? {
          max_replica: maxReplica,
          min_replica: minReplica,
        }
      : {
          max_replicas: maxReplica,
          min_replicas: minReplica,
        };
    return {
      autoscaling,
    };
  }
  return {
    replicas: values.replicas,
  };
};

export const buildMachinePoolRequest = (
  values: EditMachinePoolValues,
  {
    isEdit,
    isMultiZoneMachinePool,
    isROSACluster,
    isSecureBootUpdated,
  }: {
    isEdit: boolean;
    isMultiZoneMachinePool: boolean;
    isROSACluster: boolean;
    isSecureBootUpdated?: boolean;
  },
): MachinePool => {
  const machinePool: MachinePool = {
    id: values.name,
    labels: getLabels(values.labels),
    taints: getTaints(values.taints),
    ...getAutoscalingParams(values, isMultiZoneMachinePool, false),
  };

  if (!isEdit) {
    const awsConfig: AwsMachinePool = {};

    machinePool.instance_type = values.instanceType?.id;

    if (values.useSpotInstances) {
      awsConfig.spot_market_options =
        values.spotInstanceType === 'maximum'
          ? {
              max_price: values.maxPrice,
            }
          : {};
    }

    if (values.securityGroupIds.length > 0) {
      awsConfig.additional_security_group_ids = values.securityGroupIds;
    }
    if (isROSACluster) {
      machinePool.root_volume = {
        aws: {
          size: values.diskSize,
        },
      };
    }

    if (!isSecureBootUpdated) {
      machinePool.gcp = {
        secure_boot: values.secure_boot,
      };
    }

    if (Object.keys(awsConfig).length > 0) {
      machinePool.aws = awsConfig;
    }
  }

  return machinePool;
};

export const buildNodePoolRequest = (
  values: EditMachinePoolValues,
  {
    isEdit,
    isMultiZoneMachinePool,
  }: {
    isEdit: boolean;
    isMultiZoneMachinePool: boolean;
  },
): NodePool => {
  const nodePool: NodePool = {
    id: values.name,
    labels: getLabels(values.labels),
    taints: getTaints(values.taints),
    ...getAutoscalingParams(values, isMultiZoneMachinePool, true),
    auto_repair: values.auto_repair,
    management_upgrade: {
      max_surge: values.maxSurge?.toString(),
      max_unavailable: values.maxUnavailable?.toString(),
    },
    node_drain_grace_period: { value: values.nodeDrainTimeout },
  };

  if (!isEdit) {
    nodePool.subnet = values.privateSubnetId;
    nodePool.aws_node_pool = {
      instance_type: values.instanceType?.id,
      ec2_metadata_http_tokens: values.imds,
      additional_security_group_ids: values.securityGroupIds,
      root_volume: {
        size: values.diskSize,
      },
    };
  }

  if (ENABLE_AWS_TAGS_EDITING || !isEdit) {
    const awsTags = getAWSTags(values.awsTags);
    if (Object.keys(awsTags).length > 0) {
      if (nodePool.aws_node_pool) {
        nodePool.aws_node_pool.tags = awsTags;
      } else {
        nodePool.aws_node_pool = {
          tags: awsTags,
        };
      }
    }
  }

  if (values.isWindowsLicenseIncluded) {
    nodePool.image_type = ImageType.Windows;
  }

  return nodePool;
};
