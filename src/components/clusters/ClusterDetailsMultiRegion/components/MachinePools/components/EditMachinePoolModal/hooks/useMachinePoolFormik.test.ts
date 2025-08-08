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

  describe('validation schema', () => {
    it('should validate AWS tag keys correctly', async () => {
      const { validationSchema } = renderHook(() =>
        useMachinePoolFormik({
          cluster: defaultCluster,
          machinePool: defaultMachinePool,
          machineTypes: defaultMachineTypes,
          machinePools: defaultMachinePools,
        }),
      ).result.current;

      // Valid AWS tag key
      await expect(
        validationSchema.validateAt('labels.0.key', {
          labels: [{ key: 'valid-aws-tag', value: 'value', isAwsTag: true }],
        }),
      ).resolves.toBe('valid-aws-tag');

      // Invalid AWS tag key (starts with aws)
      await expect(
        validationSchema.validateAt('labels.0.key', {
          labels: [{ key: 'aws:something', value: 'value', isAwsTag: true }],
        }),
      ).rejects.toThrow('AWS Tag keys cannot start with "aws"');

      // Invalid AWS tag key (invalid characters)
      await expect(
        validationSchema.validateAt('labels.0.key', {
          labels: [{ key: 'invalid@#$', value: 'value', isAwsTag: true }],
        }),
      ).rejects.toThrow(
        "A valid AWS Tag key must consist of alphanumeric characters or any of the following: '_', '.', ':', '/', '=', '+', '-', '@'",
      );
    });

    it('should validate AWS tag values correctly', async () => {
      const { validationSchema } = renderHook(() =>
        useMachinePoolFormik({
          cluster: defaultCluster,
          machinePool: defaultMachinePool,
          machineTypes: defaultMachineTypes,
          machinePools: defaultMachinePools,
        }),
      ).result.current;

      // Valid AWS tag value
      await expect(
        validationSchema.validateAt('labels.0.value', {
          labels: [{ key: 'tag-key', value: 'valid-aws-value', isAwsTag: true }],
        }),
      ).resolves.toBe('valid-aws-value');

      // Invalid AWS tag value (invalid characters)
      await expect(
        validationSchema.validateAt('labels.0.value', {
          labels: [{ key: 'tag-key', value: 'invalid@#$', isAwsTag: true }],
        }),
      ).rejects.toThrow(
        "A valid AWS Tag value must consist of alphanumeric characters or any of the following: '_', '.', ':', '/', '=', '+', '-', '@'",
      );
    });

    it('should validate regular label keys correctly', async () => {
      const { validationSchema } = renderHook(() =>
        useMachinePoolFormik({
          cluster: defaultCluster,
          machinePool: defaultMachinePool,
          machineTypes: defaultMachineTypes,
          machinePools: defaultMachinePools,
        }),
      ).result.current;

      // Valid label key
      await expect(
        validationSchema.validateAt('labels.0.key', {
          labels: [{ key: 'valid-label', value: 'value', isAwsTag: false }],
        }),
      ).resolves.toBe('valid-label');

      // Invalid label key (spaces not allowed in regular labels)
      await expect(
        validationSchema.validateAt('labels.0.key', {
          labels: [{ key: 'invalid key', value: 'value', isAwsTag: false }],
        }),
      ).rejects.toThrow();
    });

    it('should prevent duplicate AWS tag keys', async () => {
      const { validationSchema } = renderHook(() =>
        useMachinePoolFormik({
          cluster: defaultCluster,
          machinePool: defaultMachinePool,
          machineTypes: defaultMachineTypes,
          machinePools: defaultMachinePools,
        }),
      ).result.current;

      await expect(
        validationSchema.validateAt('labels.0.key', {
          labels: [
            { key: 'duplicate-tag', value: 'value1', isAwsTag: true },
            { key: 'duplicate-tag', value: 'value2', isAwsTag: true },
          ],
        }),
      ).rejects.toThrow('Each AWS Tag must have a different key.');
    });

    it('should prevent duplicate regular label keys', async () => {
      const { validationSchema } = renderHook(() =>
        useMachinePoolFormik({
          cluster: defaultCluster,
          machinePool: defaultMachinePool,
          machineTypes: defaultMachineTypes,
          machinePools: defaultMachinePools,
        }),
      ).result.current;

      await expect(
        validationSchema.validateAt('labels.0.key', {
          labels: [
            { key: 'duplicate-label', value: 'value1', isAwsTag: false },
            { key: 'duplicate-label', value: 'value2', isAwsTag: false },
          ],
        }),
      ).rejects.toThrow('Each label must have a different key.');
    });

    it('should allow same key for label and AWS tag', async () => {
      const { validationSchema } = renderHook(() =>
        useMachinePoolFormik({
          cluster: defaultCluster,
          machinePool: defaultMachinePool,
          machineTypes: defaultMachineTypes,
          machinePools: defaultMachinePools,
        }),
      ).result.current;

      // Should not throw error since same key can exist for both label and AWS tag
      await expect(
        validationSchema.validateAt('labels.0.key', {
          labels: [
            { key: 'environment', value: 'prod', isAwsTag: false },
            { key: 'environment', value: 'production', isAwsTag: true },
          ],
        }),
      ).resolves.toBe('environment');
    });

    it('should require key when value is provided for AWS tags', async () => {
      const { validationSchema } = renderHook(() =>
        useMachinePoolFormik({
          cluster: defaultCluster,
          machinePool: defaultMachinePool,
          machineTypes: defaultMachineTypes,
          machinePools: defaultMachinePools,
        }),
      ).result.current;

      await expect(
        validationSchema.validateAt('labels.0.value', {
          labels: [{ key: '', value: 'some-value', isAwsTag: true }],
        }),
      ).rejects.toThrow('AWS Tag key has to be defined');
    });

    it('should require key when value is provided for regular labels', async () => {
      const { validationSchema } = renderHook(() =>
        useMachinePoolFormik({
          cluster: defaultCluster,
          machinePool: defaultMachinePool,
          machineTypes: defaultMachineTypes,
          machinePools: defaultMachinePools,
        }),
      ).result.current;

      await expect(
        validationSchema.validateAt('labels.0.value', {
          labels: [{ key: '', value: 'some-value', isAwsTag: false }],
        }),
      ).rejects.toThrow('Label key has to be defined');
    });
  });
});
