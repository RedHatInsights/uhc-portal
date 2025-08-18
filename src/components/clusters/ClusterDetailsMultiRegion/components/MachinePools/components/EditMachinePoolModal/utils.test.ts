import { IMDSType } from '~/components/clusters/wizards/common';
import { MachinePool, NodePool } from '~/types/clusters_mgmt.v1';

import { EditMachinePoolValues } from './hooks/useMachinePoolFormik';
import { buildMachinePoolRequest, buildNodePoolRequest } from './utils';

const defaultValues: EditMachinePoolValues = {
  name: 'my-mp',
  autoscaling: false,
  auto_repair: true,
  autoscaleMin: 2,
  autoscaleMax: 4,
  replicas: 0,
  labels: [],
  taints: [],
  awsTags: [],
  useSpotInstances: true,
  spotInstanceType: 'maximum',
  maxPrice: 0.04,
  diskSize: 333,
  instanceType: 'some-instance-type',
  privateSubnetId: 'subnet-id',
  securityGroupIds: ['sg-1'],
  imds: IMDSType.V1AndV2,
};

describe('buildMachinePoolRequest', () => {
  describe('when creating', () => {
    it('adds basic fields', () => {
      const machinePool = buildMachinePoolRequest(defaultValues, {
        isEdit: false,
        isMultiZoneMachinePool: false,
        isROSACluster: true,
      });

      expect(machinePool.id).toEqual('my-mp');
      expect(machinePool.labels).toEqual({});
      expect(machinePool.taints).toEqual([]);
      expect(machinePool.aws?.spot_market_options).toEqual({ max_price: 0.04 });
      expect(machinePool.aws?.additional_security_group_ids).toEqual(['sg-1']);
    });

    it('does not add diskSize for non-ROSA clusters', () => {
      const machinePool = buildMachinePoolRequest(defaultValues, {
        isEdit: false,
        isMultiZoneMachinePool: false,
        isROSACluster: false,
      });

      expect(machinePool.root_volume?.aws?.size).toBeUndefined();
    });

    it('add diskSize for ROSA clusters', () => {
      const machinePool = buildMachinePoolRequest(defaultValues, {
        isEdit: false,
        isMultiZoneMachinePool: false,
        isROSACluster: true,
      });

      expect(machinePool.root_volume?.aws?.size).toEqual(333);
    });

    it('does not add specific Hypershift fields', () => {
      const machinePool = buildMachinePoolRequest(defaultValues, {
        isEdit: false,
        isMultiZoneMachinePool: false,
        isROSACluster: true,
      });

      const badPool = machinePool as NodePool;
      expect(badPool.subnet).toBeUndefined();
      expect(badPool.aws_node_pool).toBeUndefined();
    });

    it('does not add spot price settings if it is not enabled', () => {
      const machinePool = buildMachinePoolRequest(
        {
          ...defaultValues,
          useSpotInstances: false,
        },
        { isEdit: false, isMultiZoneMachinePool: false, isROSACluster: true },
      );

      expect(machinePool.aws?.spot_market_options).toBeUndefined();
    });
  });

  describe('when editing', () => {
    it('adds basic fields', () => {
      const machinePool = buildMachinePoolRequest(defaultValues, {
        isEdit: true,
        isMultiZoneMachinePool: false,
        isROSACluster: true,
      });
      expect(machinePool.id).toEqual('my-mp');
      expect(machinePool.labels).toEqual({});
      expect(machinePool.taints).toEqual([]);
    });

    it('does not add values that can be only set at creation time', () => {
      const machinePool = buildMachinePoolRequest(defaultValues, {
        isEdit: true,
        isMultiZoneMachinePool: false,
        isROSACluster: true,
      });

      expect(machinePool.instance_type).toBeUndefined();
      expect(machinePool.root_volume?.aws?.size).toBeUndefined();
      expect(machinePool.aws?.spot_market_options).toBeUndefined();
      expect(machinePool.aws?.additional_security_group_ids).toBeUndefined();
    });

    it('does not add specific Hypershift fields', () => {
      const machinePool = buildMachinePoolRequest(defaultValues, {
        isEdit: true,
        isMultiZoneMachinePool: false,
        isROSACluster: true,
      });

      const badPool = machinePool as NodePool;
      expect(badPool.aws_node_pool).toBeUndefined();
      expect(badPool.subnet).toBeUndefined();
    });
  });
});

describe('buildNodePoolRequest', () => {
  describe('when creating', () => {
    it('adds basic Hypershift fields', () => {
      const nodePool = buildNodePoolRequest(defaultValues, {
        isEdit: false,
        isMultiZoneMachinePool: false,
      });

      expect(nodePool.id).toEqual('my-mp');
      expect(nodePool.labels).toEqual({});
      expect(nodePool.taints).toEqual([]);
      expect(nodePool.subnet).toEqual('subnet-id');
      expect(nodePool.aws_node_pool?.instance_type).toEqual('some-instance-type');
      expect(nodePool.aws_node_pool?.additional_security_group_ids).toStrictEqual(['sg-1']);
      expect(nodePool.auto_repair).toEqual(true);
    });

    it('add diskSize for ROSA Hypershift clusters', () => {
      const nodePool = buildNodePoolRequest(defaultValues, {
        isEdit: false,
        isMultiZoneMachinePool: false,
      });

      expect(nodePool.aws_node_pool?.root_volume?.size).toEqual(333);
    });

    it('does not add specific ROSA classic fields', () => {
      const nodePool = buildNodePoolRequest(defaultValues, {
        isEdit: false,
        isMultiZoneMachinePool: false,
      });

      const badPool = nodePool as MachinePool;
      expect(badPool.root_volume).toBeUndefined();
      expect(badPool.aws).toBeUndefined();
    });
  });
  describe('when editing', () => {
    it('adds basic Hypershift fields', () => {
      const nodePool = buildNodePoolRequest(defaultValues, {
        isEdit: true,
        isMultiZoneMachinePool: false,
      });

      expect(nodePool.id).toEqual('my-mp');
      expect(nodePool.labels).toEqual({});
      expect(nodePool.taints).toEqual([]);
      expect(nodePool.aws_node_pool?.additional_security_group_ids).toBe(undefined);
      expect(nodePool.auto_repair).toEqual(true);
    });

    it('does not add Hypershift values that can be only set at creation time', () => {
      const nodePool = buildNodePoolRequest(defaultValues, {
        isEdit: true,
        isMultiZoneMachinePool: false,
      });

      expect(nodePool.subnet).toBeUndefined();
      expect(nodePool.aws_node_pool?.instance_type).toBeUndefined();
    });

    it('does not add specific ROSA classic fields', () => {
      const nodePool = buildNodePoolRequest(defaultValues, {
        isEdit: true,
        isMultiZoneMachinePool: false,
      });

      const badPool = nodePool as MachinePool;
      expect(badPool.root_volume).toBeFalsy();
      expect(badPool.aws).toBeFalsy();
    });
  });
});
