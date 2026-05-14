import { renderHook } from '@testing-library/react';

import * as machinePoolUtils from '~/components/clusters/common/machinePools/utils';
import { MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate } from '~/testUtils';

import useMachinePoolFormik from './useMachinePoolFormik';
import {
  defaultCluster,
  defaultExpectedInitialValues,
  defaultGCPCluster,
  defaultMachinePool,
  defaultMachinePools,
  defaultMachineTypes,
  gcpSecureBootExpectedInitialValues,
  hyperShiftCluster,
  hyperShiftExpectedInitialValues,
} from './useMachinePoolFormik.fixtures';
import * as useOrganization from './useOrganization';

const mockUseOrganization = () => {
  jest.spyOn(useOrganization, 'default').mockImplementation(() => ({
    pending: false,
    fulfilled: true,
    error: false,
    timestamp: -1,
    details: {},
    quotaList: undefined,
  }));
};

describe('useMachinePoolFormik', () => {
  beforeEach(() => {
    mockUseFeatureGate([[MAX_NODES_TOTAL_249, false]]);
    mockUseOrganization();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['should return default initial values', defaultCluster, defaultExpectedInitialValues],
    [
      'should return different autoscale min/max and replicas initial values on hypershift enabled cluster',
      hyperShiftCluster,
      hyperShiftExpectedInitialValues,
    ],
    [
      'should return default secure boot value for gcp cluster inherited from cluster',
      defaultGCPCluster,
      gcpSecureBootExpectedInitialValues,
    ],
  ])('%s', (_title, cluster, expected) => {
    const { initialValues } = renderHook(() =>
      useMachinePoolFormik({
        cluster,
        machinePool: defaultMachinePool,
        machineTypes: defaultMachineTypes,
        machinePools: defaultMachinePools,
      }),
    ).result.current;

    expect(initialValues).toEqual(expected);
  });

  describe('initialValues autoscaling', () => {
    describe('HCP clusters', () => {
      it('should set autoscaleMin to 2', () => {
        const machinePool = {
          kind: 'NodePool',
          id: 'other-pool',
          replicas: 3,
        };

        const otherPool = {
          kind: 'NodePool2',
          id: 'other-pool2',
          replicas: 3,
        };

        const { initialValues } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool,
            machineTypes: defaultMachineTypes,
            machinePools: [machinePool, otherPool],
          }),
        ).result.current;

        expect(initialValues.autoscaleMin).toBe(2);
        expect(initialValues.autoscaleMax).toBe(2);
      });

      it('should preserve existing autoscaling min_replicas of 0', () => {
        const machinePoolWithZeroMin = {
          kind: 'NodePool',
          id: 'test-pool',
          autoscaling: {
            min_replicas: 0,
            max_replicas: 10,
          },
        };

        const { initialValues } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool: machinePoolWithZeroMin,
            machineTypes: defaultMachineTypes,
            machinePools: [machinePoolWithZeroMin],
          }),
        ).result.current;

        expect(initialValues.autoscaleMin).toBe(0);
        expect(initialValues.autoscaleMax).toBe(10);
      });
    });

    describe('Non-HCP clusters', () => {
      it('should allow autoscaleMin of 0 when minNodesRequired is 0', () => {
        const machinePool = {
          kind: 'MachinePool',
          id: 'test-pool',
          replicas: 0,
        };

        const { initialValues } = renderHook(() =>
          useMachinePoolFormik({
            cluster: defaultCluster,
            machinePool: defaultMachinePool,
            machineTypes: defaultMachineTypes,
            machinePools: [machinePool],
          }),
        ).result.current;

        expect(initialValues.autoscaleMin).toBe(0);
      });
    });

    describe('new machine pool defaults (machinePool is undefined)', () => {
      it('should default autoscaleMin, autoscaleMax, and replicas to 2 for HCP clusters', () => {
        const otherPool = {
          kind: 'NodePool',
          id: 'other-pool',
          replicas: 3,
        };
        const { initialValues } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool: undefined,
            machineTypes: defaultMachineTypes,
            machinePools: [otherPool],
          }),
        ).result.current;
        expect(initialValues.autoscaleMin).toBe(2);
        expect(initialValues.autoscaleMax).toBe(2);
        expect(initialValues.replicas).toBe(2);
      });
      it('should default to 2 even when minNodesRequired is 0 for HCP clusters', () => {
        const otherPool = {
          kind: 'NodePool',
          id: 'other-pool',
          replicas: 5,
        };
        const anotherPool = {
          kind: 'NodePool',
          id: 'another-pool',
          replicas: 3,
        };
        const { initialValues } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool: undefined,
            machineTypes: defaultMachineTypes,
            machinePools: [otherPool, anotherPool],
          }),
        ).result.current;
        expect(initialValues.autoscaleMin).toBe(2);
        expect(initialValues.autoscaleMax).toBe(2);
        expect(initialValues.replicas).toBe(2);
      });
      it('should not apply defaults when editing an existing HCP machine pool', () => {
        const existingPool = {
          kind: 'NodePool',
          id: 'existing-pool',
          replicas: 1,
        };
        const otherPool = {
          kind: 'NodePool',
          id: 'other-pool',
          replicas: 3,
        };
        const { initialValues } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool: existingPool,
            machineTypes: defaultMachineTypes,
            machinePools: [existingPool, otherPool],
          }),
        ).result.current;
        expect(initialValues.replicas).toBe(1);
      });
    });
  });

  describe('validationSchema', () => {
    describe('autoscaleMin', () => {
      it('should allow 0 min nodes for HCP clusters with autoscaling enabled', async () => {
        const machinePool = {
          kind: 'NodePool',
          id: 'test-pool',
          autoscaling: {
            min_replicas: 0,
            max_replicas: 5,
          },
        };

        const otherPool = {
          kind: 'NodePool',
          id: 'other-pool',
          replicas: 3,
        };

        const { validationSchema } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool,
            machineTypes: defaultMachineTypes,
            machinePools: [machinePool, otherPool],
          }),
        ).result.current;

        const values = {
          ...hyperShiftExpectedInitialValues,
          autoscaling: true,
          autoscaleMin: 0,
          autoscaleMax: 5,
        };

        await expect(validationSchema.validateAt('autoscaleMin', values)).resolves.toBe(0);
      });

      it('should allow autoscaleMin of 0 when autoscaleMax meets minNodes for HCP', async () => {
        const machinePool = {
          kind: 'NodePool',
          id: 'test-pool',
          autoscaling: {
            min_replicas: 0,
            max_replicas: 1,
          },
        };

        const otherPool = {
          kind: 'NodePool',
          id: 'other-pool',
          autoscaling: {
            min_replicas: 1,
            max_replicas: 1,
          },
        };

        const { validationSchema } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool,
            machineTypes: defaultMachineTypes,
            machinePools: [machinePool, otherPool],
          }),
        ).result.current;

        const values = {
          ...hyperShiftExpectedInitialValues,
          autoscaling: true,
          autoscaleMin: 0,
          autoscaleMax: 1,
        };

        // autoscaleMin should allow 0 for HCP even though minNodes is 1
        await expect(validationSchema.validateAt('autoscaleMin', values)).resolves.toBe(0);
      });
    });

    describe('replicas', () => {
      it('should allow 0 replicas for HCP clusters with autoscaling disabled', async () => {
        const machinePool = {
          kind: 'NodePool',
          id: 'test-pool',
          replicas: 0,
        };

        const otherPool = {
          kind: 'NodePool',
          id: 'other-pool',
          replicas: 3,
        };

        const { validationSchema } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool,
            machineTypes: defaultMachineTypes,
            machinePools: [machinePool, otherPool],
          }),
        ).result.current;

        const values = {
          ...hyperShiftExpectedInitialValues,
          autoscaling: false,
          replicas: 0,
        };

        await expect(validationSchema.validateAt('replicas', values)).resolves.toBe(0);
      });
    });

    describe('autoscaleMax', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      it('should reject 0 max nodes for HCP clusters with autoscaling enabled', async () => {
        const machinePool = {
          kind: 'NodePool',
          id: 'test-pool',
          autoscaling: {
            min_replicas: 0,
            max_replicas: 0,
          },
        };

        const otherPool = {
          kind: 'NodePool',
          id: 'other-pool',
          replicas: 3,
        };

        const { validationSchema } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool,
            machineTypes: defaultMachineTypes,
            machinePools: [machinePool, otherPool],
          }),
        ).result.current;

        const values = {
          ...hyperShiftExpectedInitialValues,
          autoscaling: true,
          autoscaleMin: 0,
          autoscaleMax: 0,
        };

        await expect(validationSchema.validateAt('autoscaleMax', values)).rejects.toThrow(
          'Max nodes must be greater than 0.',
        );
      });

      it('should reject autoscaleMax below minNodes for HCP clusters', async () => {
        const machinePool = {
          kind: 'NodePool',
          id: 'test-pool',
          autoscaling: {
            min_replicas: 0,
            max_replicas: 1,
          },
        };

        const { validationSchema } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool,
            machineTypes: defaultMachineTypes,
            machinePools: [machinePool],
          }),
        ).result.current;

        const values = {
          ...hyperShiftExpectedInitialValues,
          autoscaling: true,
          autoscaleMin: 0,
          autoscaleMax: 1,
        };

        // minNodes = 2 (only one pool, no other untainted pools to cover the minimum)
        // autoscaleMax of 1 passes the > 0 check but fails the minNodes check
        await expect(validationSchema.validateAt('autoscaleMax', values)).rejects.toThrow(
          'Max nodes must be at least 2 to satisfy the cluster-wide untainted-node minimum.',
        );
      });

      it('should reject 0 max nodes for non-HCP clusters with autoscaling enabled', async () => {
        jest.spyOn(machinePoolUtils, 'getMaxNodeCountForMachinePool').mockReturnValue(50);
        const { validationSchema } = renderHook(() =>
          useMachinePoolFormik({
            cluster: defaultCluster,
            machinePool: defaultMachinePool,
            machineTypes: defaultMachineTypes,
            machinePools: defaultMachinePools,
          }),
        ).result.current;

        const values = {
          ...defaultExpectedInitialValues,
          autoscaling: true,
          autoscaleMin: 0,
          autoscaleMax: 0,
        };

        await expect(validationSchema.validateAt('autoscaleMax', values)).rejects.toThrow(
          'Max nodes must be greater than 0.',
        );
      });
    });

    describe('capacityReservationId', () => {
      it.each(['open', 'none', 'capacity-reservations-only'])(
        'should not require capacityReservationId when preference is %s',
        async (preference) => {
          const { validationSchema } = renderHook(() =>
            useMachinePoolFormik({
              cluster: hyperShiftCluster,
              machinePool: defaultMachinePool,
              machineTypes: defaultMachineTypes,
              machinePools: defaultMachinePools,
            }),
          ).result.current;

          const values = {
            ...hyperShiftExpectedInitialValues,
            capacityReservationPreference: preference,
            capacityReservationId: '',
          };

          // Use validateAt to check only the capacityReservationId field
          await expect(validationSchema.validateAt('capacityReservationId', values)).resolves.toBe(
            '',
          );
        },
      );

      it('should auto-trim leading and trailing whitespace from capacityReservationId', async () => {
        const { validationSchema } = renderHook(() =>
          useMachinePoolFormik({
            cluster: hyperShiftCluster,
            machinePool: defaultMachinePool,
            machineTypes: defaultMachineTypes,
            machinePools: defaultMachinePools,
          }),
        ).result.current;

        const values = {
          ...hyperShiftExpectedInitialValues,
          capacityReservationPreference: 'capacity-reservations-only',
          capacityReservationId: '  cr-12345678901234567  ',
        };

        // Yup's .trim() transform should return the trimmed value
        const result = await validationSchema.validateAt('capacityReservationId', values);
        expect(result).toBe('cr-12345678901234567');
      });
    });
  });
});
