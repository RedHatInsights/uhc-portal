import {
  AwsTags,
  buildAwsTagsPatch,
  getOwnAwsTags,
} from '~/components/clusters/common/awsTags/awsTagsHelpers';
import { AwsMachinePool, AwsNodePool, MachinePool, NodePool } from '~/types/clusters_mgmt.v1';
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

const getTaints = (taints: EditMachinePoolValues['taints']) =>
  taints.length === 1 && !taints[0].key ? [] : taints;

const getAutoscalingParams = (
  values: EditMachinePoolValues,
  isMultiAz: boolean,
  isHypershift: boolean,
) => {
  // All values (autoscaleMin, autoscaleMax, replicas) are stored as per-zone for multi-AZ
  // Convert back to total for the API request
  const multiplier = isMultiAz ? 3 : 1;

  if (values.autoscaling) {
    const maxReplica = values.autoscaleMax * multiplier;
    const minReplica = values.autoscaleMin * multiplier;

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
    replicas: values.replicas * multiplier,
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

/**
 * Builds the node pool create/update request. Creation-only fields are omitted on edit,
 * and AWS tags are sent as a diff of the node pool's own tags when they can be edited.
 */
export const buildNodePoolRequest = (
  values: EditMachinePoolValues,
  {
    isEdit,
    isMultiZoneMachinePool,
    canUseCapacityReservation,
    canEditAwsTags,
    initialAwsTags = {},
  }: {
    isEdit: boolean;
    isMultiZoneMachinePool: boolean;
    canUseCapacityReservation?: boolean;
    canEditAwsTags?: boolean;
    initialAwsTags?: AwsTags;
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
    const awsNodePool: AwsNodePool = {
      instance_type: values.instanceType?.id,
      ec2_metadata_http_tokens: values.imds,
      additional_security_group_ids: values.securityGroupIds,
      root_volume: {
        size: values.diskSize,
      },
      // Spot instances and Capacity Reservations are mutually exclusive on the API side
      // so omit `capacity_reservation` entirely when Spot is selected.
      ...(canUseCapacityReservation &&
        !values.useSpotInstances && {
          capacity_reservation: {
            id: values.capacityReservationId,
            preference: values.capacityReservationPreference,
          },
        }),
    };

    if (values.useSpotInstances) {
      awsNodePool.spot_market_options =
        values.spotInstanceType === 'maximum' ? { max_price: values.maxPrice.toString() } : {};
    }

    nodePool.aws_node_pool = awsNodePool;
  }

  if (!isEdit || canEditAwsTags) {
    // On edit the API merges tags, so only send changes to the node pool's own tags
    // (`null` removes a tag, which also removes an override of a cluster tag)
    const awsTags = isEdit
      ? buildAwsTagsPatch(initialAwsTags, getOwnAwsTags(values.awsTags))
      : getOwnAwsTags(values.awsTags);
    if (Object.keys(awsTags).length > 0) {
      // The generated type does not allow `null`, which the API uses to remove a tag
      const tags = awsTags as AwsTags;
      if (nodePool.aws_node_pool) {
        nodePool.aws_node_pool.tags = tags;
      } else {
        nodePool.aws_node_pool = {
          tags,
        };
      }
    }
  }

  if (values.isWindowsLicenseIncluded) {
    nodePool.image_type = ImageType.Windows;
  }

  return nodePool;
};
