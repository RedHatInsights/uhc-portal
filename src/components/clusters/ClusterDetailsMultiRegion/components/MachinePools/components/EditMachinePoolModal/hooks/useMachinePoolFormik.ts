import * as React from 'react';
import * as Yup from 'yup';

import {
  checkAwsTagKey,
  checkAwsTagValue,
  checkLabelKey,
  checkLabelValue,
  checkMachinePoolName,
  checkNodePoolName,
  checkTaintKey,
  checkTaintValue,
  validateSecurityGroups,
} from '~/common/validators';
import { isMPoolAz } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { isHypershiftCluster, isROSA } from '~/components/clusters/common/clusterStates';
import {
  defaultWorkerNodeVolumeSizeGiB,
  SPOT_MIN_PRICE,
} from '~/components/clusters/common/machinePools/constants';
import {
  getNodeOptions,
  getWorkerNodeVolumeSizeMaxGiB,
  getWorkerNodeVolumeSizeMinGiB,
} from '~/components/clusters/common/machinePools/utils';
import { CloudProviderType, IMDSType } from '~/components/clusters/wizards/common';
import { MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MachineTypesResponse } from '~/queries/types';
import { MachinePool, MachineType, NodePool } from '~/types/clusters_mgmt.v1';
import { ImageType } from '~/types/clusters_mgmt.v1/enums';
import { ClusterFromSubscription } from '~/types/types';

import { getClusterMinNodes } from '../../../machinePoolsHelper';
import { TaintEffect } from '../fields/TaintEffectField';

import useOrganization from './useOrganization';

export type EditMachinePoolValues = {
  name: string;
  autoscaling: boolean;
  auto_repair: boolean | undefined;
  autoscaleMin: number;
  autoscaleMax: number;
  replicas: number;
  labels: { key: string; value: string }[];
  awsTags: { key: string; value: string }[];
  taints: { key: string; value: string; effect: TaintEffect }[];
  useSpotInstances: boolean;
  spotInstanceType: 'onDemand' | 'maximum';
  maxPrice: number;
  diskSize: number;
  instanceType: MachineType | undefined;
  isWindowsLicenseIncluded?: boolean;
  privateSubnetId: string | undefined;
  securityGroupIds: string[];
  secure_boot?: boolean;
  imds: IMDSType;
  maxSurge?: number;
  maxUnavailable?: number;
  nodeDrainTimeout?: number;
};

type UseMachinePoolFormikArgs = {
  machinePool: MachinePool | NodePool | undefined;
  cluster: ClusterFromSubscription;
  machineTypes: MachineTypesResponse;
  machinePools: (MachinePool | NodePool)[];
};

const isMachinePool = (pool?: MachinePool | NodePool): pool is MachinePool =>
  pool?.kind === 'MachinePool';

const isNodePool = (pool?: MachinePool | NodePool): pool is NodePool => pool?.kind === 'NodePool';

const shieldedVmSecureBoot = (machinePool: MachinePool, cluster: ClusterFromSubscription) => {
  if (!(machinePool as MachinePool)?.gcp) {
    return cluster.gcp?.security?.secure_boot;
  }
  return (machinePool as MachinePool)?.gcp?.secure_boot !== false;
};

const useMachinePoolFormik = ({
  machinePool,
  cluster,
  machineTypes,
  machinePools,
}: UseMachinePoolFormikArgs) => {
  const isMachinePoolMz = isMPoolAz(
    cluster,
    (machinePool as MachinePool)?.availability_zones?.length,
  );
  const rosa = isROSA(cluster);
  const isGCP = cluster?.cloud_provider?.id === CloudProviderType.Gcp;
  const isHypershift = isHypershiftCluster(cluster);

  const minNodesRequired = getClusterMinNodes({
    cluster,
    machineTypesResponse: machineTypes,
    machinePool,
    machinePools: machinePools || [],
  });

  const initialValues = React.useMemo<EditMachinePoolValues>(() => {
    let autoscaleMin;
    let autoscaleMax;
    let useSpotInstances;
    let spotInstanceType: EditMachinePoolValues['spotInstanceType'] = 'onDemand';
    let maxPrice;
    let diskSize;
    let autoRepair = true;
    let maxSurge;
    let maxUnavailable;
    let nodeDrainTimeout;

    autoscaleMin = (machinePool as MachinePool)?.autoscaling?.min_replicas || minNodesRequired;
    autoscaleMax = (machinePool as MachinePool)?.autoscaling?.max_replicas || minNodesRequired;

    const instanceTypeId = (machinePool as MachinePool)?.instance_type;
    const instanceType = (
      instanceTypeId ? machineTypes.typesByID?.[instanceTypeId] : undefined
    ) as MachineType;

    if (isMachinePool(machinePool)) {
      useSpotInstances = !!machinePool.aws?.spot_market_options;
      spotInstanceType = machinePool.aws?.spot_market_options?.max_price ? 'maximum' : 'onDemand';

      maxPrice = machinePool.aws?.spot_market_options?.max_price;
      diskSize = machinePool.root_volume?.aws?.size || machinePool.root_volume?.gcp?.size;
    } else if (isNodePool(machinePool)) {
      diskSize = machinePool.aws_node_pool?.root_volume?.size;
      const autoRepairValue = (machinePool as NodePool)?.auto_repair;
      autoRepair = autoRepairValue ?? true;
      maxSurge = machinePool.management_upgrade?.max_surge;
      maxUnavailable = machinePool.management_upgrade?.max_unavailable;
      nodeDrainTimeout = machinePool.node_drain_grace_period?.value;
    }

    if (isMachinePoolMz) {
      autoscaleMin /= 3;
      autoscaleMax /= 3;
    }

    const machinePoolData: EditMachinePoolValues = {
      name: machinePool?.id || '',
      autoscaling: !!machinePool?.autoscaling,
      auto_repair: autoRepair,
      autoscaleMin,
      autoscaleMax: autoscaleMax || 1,
      replicas: machinePool?.replicas || minNodesRequired,
      labels: machinePool?.labels
        ? Object.keys(machinePool.labels).map((key) => ({
            key,
            value: machinePool.labels?.[key]!!,
          }))
        : [{ key: '', value: '' }],

      awsTags:
        isNodePool(machinePool) && machinePool.aws_node_pool?.tags
          ? Object.keys(machinePool.aws_node_pool.tags).map((key) => ({
              key,
              value: machinePool.aws_node_pool!.tags?.[key]!!,
            }))
          : [{ key: '', value: '' }],
      taints: machinePool?.taints?.map((taint) => ({
        key: taint.key || '',
        value: taint.value || '',
        effect: (taint.effect as TaintEffect) || 'NoSchedule',
      })) || [{ key: '', value: '', effect: 'NoSchedule' }],
      useSpotInstances: !!useSpotInstances,
      spotInstanceType,
      maxPrice: maxPrice || SPOT_MIN_PRICE,
      diskSize: diskSize || defaultWorkerNodeVolumeSizeGiB,
      instanceType,
      privateSubnetId: undefined,
      imds: IMDSType.V1AndV2,
      securityGroupIds:
        (machinePool as MachinePool)?.aws?.additional_security_group_ids ||
        (machinePool as NodePool)?.aws_node_pool?.additional_security_group_ids ||
        [],
      maxSurge: maxSurge ? parseInt(maxSurge, 10) : 1,
      maxUnavailable: maxUnavailable ? parseInt(maxUnavailable, 10) : 0,
      nodeDrainTimeout: nodeDrainTimeout || 0,
    };

    if (isGCP) {
      machinePoolData.secure_boot = shieldedVmSecureBoot(machinePool as MachinePool, cluster);
    }

    if (isHypershift) {
      machinePoolData.isWindowsLicenseIncluded =
        isNodePool(machinePool) && machinePool?.image_type === ImageType.Windows; // This involves extra costs, let's keep it false by default
    }

    return machinePoolData;
  }, [
    machinePool,
    isMachinePoolMz,
    minNodesRequired,
    cluster,
    isGCP,
    machineTypes.typesByID,
    isHypershift,
  ]);

  const minDiskSize = getWorkerNodeVolumeSizeMinGiB(isHypershift);
  const maxDiskSize = getWorkerNodeVolumeSizeMaxGiB(cluster.version?.raw_id || '');

  const hasMachinePool = !!machinePool;

  const organization = useOrganization();

  const allow249NodesOSDCCSROSA = useFeatureGate(MAX_NODES_TOTAL_249);

  const validationSchema = React.useMemo(
    () =>
      Yup.lazy((values) => {
        const minNodes = isMachinePoolMz ? minNodesRequired / 3 : minNodesRequired;
        const secGroupValidation = validateSecurityGroups(values.securityGroupIds, isHypershift);
        const nodeOptions = getNodeOptions({
          cluster,
          machinePools: machinePools || [],
          machinePool,
          machineTypes,
          quota: organization.quotaList,
          minNodes: minNodesRequired,
          machineTypeId: values.instanceType?.id,
          editMachinePoolId: values.name,
          allow249NodesOSDCCSROSA,
        });
        const maxNodes = nodeOptions.length ? nodeOptions[nodeOptions.length - 1] : 0;

        return Yup.object({
          name: Yup.string().test('mp-name', '', (value) => {
            const err = isHypershift ? checkNodePoolName(value) : checkMachinePoolName(value);
            if (err) {
              return new Yup.ValidationError(err, value, 'name');
            }

            if (!hasMachinePool && machinePools.some((mp) => mp.id === value)) {
              return new Yup.ValidationError('Name has to be unique.', value, 'name');
            }
            return true;
          }),
          labels: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().test('label-key', '', function test(value) {
                if (values.labels.length === 1 && (!value || value.length === 0)) {
                  return true;
                }
                const err = checkLabelKey(value);
                if (err) {
                  return new Yup.ValidationError(err, value, this.path);
                }

                if (values.labels.filter(({ key }: { key: any }) => key === value).length > 1) {
                  return new Yup.ValidationError(
                    'Each label must have a different key.',
                    value,
                    this.path,
                  );
                }
                return true;
              }),
              value: Yup.string().test('label-value', '', function test(value) {
                const err = checkLabelValue(value);
                if (err) {
                  return new Yup.ValidationError(err, value, this.path);
                }

                const labelKey = this.parent.key;
                if (value && !labelKey) {
                  return new Yup.ValidationError('Label key has to be defined', value, this.path);
                }
                return true;
              }),
            }),
          ),
          awsTags: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().test('awsTag-key', '', function test(value) {
                if (values.awsTags.length === 1 && (!value || value.length === 0)) {
                  return true;
                }
                const err = checkAwsTagKey(value);
                if (err) {
                  return new Yup.ValidationError(err, value, this.path);
                }

                if (values.awsTags.filter(({ key }: { key: any }) => key === value).length > 1) {
                  return new Yup.ValidationError(
                    'Each AWS Tag must have a different key.',
                    value,
                    this.path,
                  );
                }
                return true;
              }),
              value: Yup.string().test('awsTag-value', '', function test(value) {
                const err = checkAwsTagValue(value);
                if (err) {
                  return new Yup.ValidationError(err, value, this.path);
                }

                const awsTagKey = this.parent.key;
                if (value && !awsTagKey) {
                  return new Yup.ValidationError('AWS Tag key has to be defined', value, this.path);
                }
                return true;
              }),
            }),
          ),
          taints: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().test('taint-key', '', function test(value) {
                if (values.taints.length === 1 && (!value || value.length === 0)) {
                  return true;
                }
                const err = checkTaintKey(value);
                return err ? new Yup.ValidationError(err, value, this.path) : true;
              }),
              value: Yup.string().test('taint-value', '', function test(value) {
                const err = checkTaintValue(value);
                if (err) {
                  return new Yup.ValidationError(err, value, this.path);
                }

                const taintKey = this.parent.key;
                if (value && !taintKey) {
                  return new Yup.ValidationError('Taint key has to be defined', value, this.path);
                }
                return true;
              }),
            }) as any,
          ),
          autoscaleMin: values.autoscaling
            ? Yup.number()
                .test(
                  'whole-number',
                  'Decimals are not allowed. Enter a whole number.',
                  Number.isInteger,
                )
                .min(minNodes, `Input cannot be less than ${minNodes}.`)
                .max(values.autoscaleMax, 'Min nodes cannot be more than max nodes.')
            : Yup.number(),
          autoscaleMax: values.autoscaling
            ? Yup.number()
                .test('autoscale-max', '', (value) => {
                  if (!Number.isInteger(value)) {
                    return new Yup.ValidationError(
                      'Decimals are not allowed. Enter a whole number.',
                      value,
                      'autoscaleMax',
                    );
                  }
                  if (value !== undefined && value < 1) {
                    return new Yup.ValidationError(
                      'Max nodes must be greater than 0.',
                      value,
                      'autoscaleMax',
                    );
                  }
                  return true;
                })
                .min(values.autoscaleMin, 'Max nodes cannot be less than min nodes.')
                .max(
                  isMachinePoolMz ? maxNodes / 3 : maxNodes,
                  `Input cannot be more than ${isMachinePoolMz ? maxNodes / 3 : maxNodes}.`,
                )
            : Yup.number(),
          autoscaling: Yup.boolean(),
          auto_repair: Yup.boolean(),
          diskSize: rosa
            ? Yup.number()
                .min(minDiskSize, `Disk size must be at least ${minDiskSize} GiB`)
                .max(maxDiskSize, `Disk size can not be more than ${maxDiskSize} GiB`)
                .test(
                  'whole-number',
                  'Decimals are not allowed. Enter a whole number.',
                  Number.isInteger,
                )
            : Yup.number(),
          spotInstanceType: Yup.mixed(),
          maxPrice:
            values.spotInstanceType === 'maximum'
              ? Yup.number().min(SPOT_MIN_PRICE, `Price has to be at least ${SPOT_MIN_PRICE}`)
              : Yup.number(),
          instanceType: !hasMachinePool
            ? Yup.object()
                .shape({
                  id: Yup.string().required('Compute node instance type is a required field.'),
                })
                .required('Compute node instance type is a required field.')
            : Yup.object(),
          isWindowsLicenseIncluded: Yup.boolean(),
          replicas: Yup.number(),
          maxSurge: Yup.number()
            .typeError('Max surge must be a number. Please provide a valid numeric value.')
            .nullable()
            .min(0, 'Input cannot be less than 0')
            .test(
              'not-both-zero-surge',
              'Cannot be 0 if Max Unavailable is also 0.',
              function testZeroValues(value) {
                const { maxUnavailable } = this.parent;
                return !(value === 0 && maxUnavailable === 0);
              },
            ),
          maxUnavailable: Yup.number()
            .typeError('Max unavailable must be a number. Please provide a valid numeric value.')
            .nullable()
            .min(0, 'Input cannot be less than 0')
            .test(
              'not-both-zero-unavailable',
              'Cannot be 0 if Max Surge is also 0.',
              function testZeroValues(value) {
                const { maxSurge } = this.parent;
                return !(value === 0 && maxSurge === 0);
              },
            ),
          nodeDrainTimeout: Yup.number()
            .typeError('Node drain timeout must be a number. Please provide a valid numeric value.')
            .nullable()
            .min(0, 'Input cannot be less than 0')
            .max(10080, 'Input cannot be greater than 10080'),
          useSpotInstances: Yup.boolean(),
          privateSubnetId:
            !hasMachinePool && isHypershift
              ? Yup.string().required('Please select a subnet.')
              : Yup.string(),
          securityGroupIds: isHypershift
            ? Yup.mixed()
            : Yup.array()
                .of(Yup.string())
                .test(
                  'max-security-groups',
                  secGroupValidation || '',
                  () => secGroupValidation === undefined,
                ),
        });
      }),
    [
      isMachinePoolMz,
      minNodesRequired,
      cluster,
      machinePools,
      machinePool,
      machineTypes,
      organization.quotaList,
      rosa,
      minDiskSize,
      maxDiskSize,
      hasMachinePool,
      isHypershift,
      allow249NodesOSDCCSROSA,
    ],
  );

  return { initialValues, validationSchema };
};

export default useMachinePoolFormik;
