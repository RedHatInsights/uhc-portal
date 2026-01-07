import { renderHook } from '@testing-library/react';

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

  describe('validationSchema', () => {
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
