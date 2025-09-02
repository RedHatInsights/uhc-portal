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
});
