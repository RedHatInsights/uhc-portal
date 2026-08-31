import { renderHook } from '@testing-library/react';

import { getClusterAutoscalerMax } from '~/components/clusters/common/machinePools/utils';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks/useFormState';

import { useResetMaxNodesTotal } from './useResetMaxNodesTotal';

jest.mock('~/components/clusters/wizards/hooks/useFormState', () => ({
  useFormState: jest.fn(),
}));

jest.mock('~/components/clusters/common/machinePools/utils', () => ({
  getClusterAutoscalerMax: jest.fn(),
}));

const getFieldPropsMock = jest.fn();
const setFieldValueMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useFormState as jest.Mock).mockReturnValue({
    getFieldProps: getFieldPropsMock,
    setFieldValue: setFieldValueMock,
  });
  (getClusterAutoscalerMax as jest.Mock).mockReturnValue(255);
});

describe('useResetMaxNodesTotal', () => {
  describe('version resolution', () => {
    it('uses clusterVersion param when provided', () => {
      getFieldPropsMock.mockReturnValue({ value: 'false' });
      const { result } = renderHook(() => useResetMaxNodesTotal());
      const clusterVersion = { raw_id: '4.16.0' };

      result.current.resetMaxNodesTotal({ clusterVersion } as any);

      expect(getClusterAutoscalerMax).toHaveBeenCalledWith('4.16.0', expect.anything());
      expect(getFieldPropsMock).not.toHaveBeenCalledWith(FieldId.ClusterVersion);
    });

    it('falls back to form state when clusterVersion is not provided', () => {
      getFieldPropsMock.mockImplementation((field: string) => {
        if (field === FieldId.ClusterVersion) return { value: { raw_id: '4.15.0' } };
        return { value: 'false' };
      });

      const { result } = renderHook(() => useResetMaxNodesTotal());
      result.current.resetMaxNodesTotal({});

      expect(getClusterAutoscalerMax).toHaveBeenCalledWith('4.15.0', expect.anything());
    });
  });

  describe('isMultiAz resolution', () => {
    it('uses isMultiAz param when provided as true', () => {
      const { result } = renderHook(() => useResetMaxNodesTotal());

      result.current.resetMaxNodesTotal({
        clusterVersion: { raw_id: '4.16.0' } as any,
        isMultiAz: true,
      });

      expect(getClusterAutoscalerMax).toHaveBeenCalledWith(expect.anything(), true);
      expect(getFieldPropsMock).not.toHaveBeenCalledWith(FieldId.MultiAz);
    });

    it('uses isMultiAz param when provided as false', () => {
      const { result } = renderHook(() => useResetMaxNodesTotal());

      result.current.resetMaxNodesTotal({
        clusterVersion: { raw_id: '4.16.0' } as any,
        isMultiAz: false,
      });

      expect(getClusterAutoscalerMax).toHaveBeenCalledWith(expect.anything(), false);
      expect(getFieldPropsMock).not.toHaveBeenCalledWith(FieldId.MultiAz);
    });

    it('reads form state and converts "true" string to boolean true', () => {
      getFieldPropsMock.mockImplementation((field: string) => {
        if (field === FieldId.MultiAz) return { value: 'true' };
        return { value: undefined };
      });

      const { result } = renderHook(() => useResetMaxNodesTotal());
      result.current.resetMaxNodesTotal({ clusterVersion: { raw_id: '4.16.0' } as any });

      expect(getClusterAutoscalerMax).toHaveBeenCalledWith(expect.anything(), true);
    });

    it('reads form state and converts "false" string to boolean false', () => {
      getFieldPropsMock.mockImplementation((field: string) => {
        if (field === FieldId.MultiAz) return { value: 'false' };
        return { value: undefined };
      });

      const { result } = renderHook(() => useResetMaxNodesTotal());
      result.current.resetMaxNodesTotal({ clusterVersion: { raw_id: '4.16.0' } as any });

      expect(getClusterAutoscalerMax).toHaveBeenCalledWith(expect.anything(), false);
    });
  });

  it('calls setFieldValue with the computed max nodes total', () => {
    (getClusterAutoscalerMax as jest.Mock).mockReturnValue(255);

    const { result } = renderHook(() => useResetMaxNodesTotal());
    result.current.resetMaxNodesTotal({
      clusterVersion: { raw_id: '4.16.0' } as any,
      isMultiAz: false,
    });

    expect(setFieldValueMock).toHaveBeenCalledWith(
      'cluster_autoscaling.resource_limits.max_nodes_total',
      255,
    );
  });
});
