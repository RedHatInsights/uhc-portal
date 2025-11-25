import React from 'react';
import { Formik } from 'formik';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as machinePoolsHelperModule from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper';
import * as machinePoolsUtilsModule from '~/components/clusters/common/machinePools/utils';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import * as usePreviousPropsModule from '~/hooks/usePreviousProps';
import * as useGlobalStateModule from '~/redux/hooks';
import { mockUseFeatureGate, mockUseFormState } from '~/testUtils';

import ComputeNodeCount, { TotalNodesDescription } from './ComputeNodeCount';

import '@testing-library/jest-dom';

jest.mock('~/redux/hooks');
jest.mock('~/hooks/usePreviousProps');
jest.mock(
  '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper',
  () => ({
    getMinNodesRequired: jest.fn(),
    getNodeIncrement: jest.fn(),
    getNodeIncrementHypershift: jest.fn(),
  }),
);
jest.mock('~/components/clusters/common/machinePools/utils', () => ({
  buildOptions: jest.fn(),
  getAvailableQuota: jest.fn(),
  getIncludedNodes: jest.fn(),
}));

jest.mock('./NodeCountInput', () => (props: any) => {
  const { label, input } = props;
  return (
    <div>
      <label htmlFor="node-count">{label}</label>
      <input
        id="node-count"
        data-testid="mock-node-input"
        type="number"
        value={input.value}
        onChange={(e) => input.onChange(Number(e.target.value))}
      />
    </div>
  );
});

const renderWithFormik = (props = {}) =>
  render(
    <Formik initialValues={{}} onSubmit={jest.fn()}>
      <ComputeNodeCount {...props} />
    </Formik>,
  );

describe('ComputeNodeCount', () => {
  const mockSetFieldValue = jest.fn();
  const mockValidateField = jest.fn();

  const createMockFormStateValues = (overrides = {}) => ({
    [FieldId.Hypershift]: 'true',
    [FieldId.MachinePoolsSubnets]: [],
    [FieldId.NodesCompute]: 2,
    [FieldId.MachineType]: 'm5.xlarge',
    [FieldId.CloudProviderId]: 'aws',
    [FieldId.Product]: 'ROSA',
    [FieldId.BillingModel]: 'marketplace',
    [FieldId.Byoc]: 'true',
    [FieldId.MultiAz]: 'false',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFormState({
      values: createMockFormStateValues(),
      getFieldProps: jest.fn().mockReturnValue({ value: 2, onChange: jest.fn() }),
      getFieldMeta: jest.fn().mockReturnValue({ touched: false, error: undefined }),
      setFieldValue: mockSetFieldValue,
      validateField: mockValidateField,
    });

    (useGlobalStateModule.useGlobalState as jest.Mock).mockImplementation((selector: any) => {
      const mockState = {
        machineTypes: { types: {} },
        userProfile: { organization: { quotaList: [] } },
      };
      return selector(mockState);
    });

    mockUseFeatureGate([]);

    (machinePoolsUtilsModule.getIncludedNodes as jest.Mock).mockReturnValue([]);
    (machinePoolsUtilsModule.getAvailableQuota as jest.Mock).mockReturnValue(1000);
    (machinePoolsUtilsModule.buildOptions as jest.Mock).mockReturnValue([0, 1, 2, 3, 4, 5]);
  });

  it('renders with default props and shows label', () => {
    renderWithFormik();

    expect(screen.getByLabelText(/Compute node count/)).toBeInTheDocument();
  });

  it('shows hypershift label when isHypershift is true', () => {
    mockUseFormState({
      values: { [FieldId.Hypershift]: 'true' },
      getFieldProps: jest.fn().mockReturnValue({ value: 2, onChange: jest.fn() }),
    });

    renderWithFormik();

    expect(screen.getByLabelText(/Compute node count \(per machine pool\)/)).toBeInTheDocument();
  });

  it('sets value when user changes input', async () => {
    const localMockSetFieldValue = jest.fn();

    mockUseFormState({
      values: createMockFormStateValues(),
      getFieldProps: jest.fn().mockReturnValue({ value: 2, onChange: jest.fn() }),
      setFieldValue: localMockSetFieldValue,
    });

    renderWithFormik();

    const input = screen.getByTestId('mock-node-input');
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(input, { target: { value: '4' } });

    await waitFor(() => {
      expect(localMockSetFieldValue).toHaveBeenCalledWith(FieldId.NodesCompute, 4, true);
    });
  });

  it('adjusts compute nodes to minimum when machine pools are removed and current value is below new minimum', async () => {
    const threePools = [
      { privateSubnetId: 'subnet1' },
      { privateSubnetId: 'subnet2' },
      { privateSubnetId: 'subnet3' },
    ];
    const onePool = [{ privateSubnetId: 'subnet1' }];

    // Initial: 3 pools, nodes=1 (valid: min=3/3=1)
    (machinePoolsHelperModule.getMinNodesRequired as jest.Mock).mockReturnValue(3);
    (machinePoolsHelperModule.getNodeIncrementHypershift as jest.Mock).mockReturnValue(3);
    (usePreviousPropsModule.usePreviousProps as jest.Mock).mockReturnValue(undefined);

    const formStateSpy = mockUseFormState({
      values: createMockFormStateValues({
        [FieldId.MachinePoolsSubnets]: threePools,
        [FieldId.NodesCompute]: 1,
      }),
      getFieldProps: jest.fn().mockReturnValue({ value: 1, onChange: jest.fn() }),
      setFieldValue: mockSetFieldValue,
      validateField: mockValidateField,
    });

    const { rerender } = renderWithFormik();

    // After removing pools: 1 pool, min=2/1=2, so nodes=1 is invalid → should adjust to 2
    (machinePoolsHelperModule.getMinNodesRequired as jest.Mock).mockReturnValue(2);
    (machinePoolsHelperModule.getNodeIncrementHypershift as jest.Mock).mockReturnValue(1);
    (usePreviousPropsModule.usePreviousProps as jest.Mock).mockReturnValue(threePools);

    formStateSpy.mockReturnValue({
      values: createMockFormStateValues({
        [FieldId.MachinePoolsSubnets]: onePool,
        [FieldId.NodesCompute]: 1,
      }),
      getFieldProps: jest.fn().mockReturnValue({ value: 1, onChange: jest.fn() }),
      getFieldMeta: jest.fn().mockReturnValue({ touched: false, error: undefined }),
      setFieldValue: mockSetFieldValue,
      validateField: mockValidateField,
    });

    rerender(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <ComputeNodeCount />
      </Formik>,
    );

    await waitFor(() => {
      expect(mockSetFieldValue).toHaveBeenCalledWith(FieldId.NodesCompute, 2, true);
    });
  });
});

describe('TotalNodesDescription', () => {
  it('displays total compute nodes for isMultiAz', () => {
    render(<TotalNodesDescription isMultiAz nodes={2} />);
    expect(screen.getByTestId('compute-node-multizone-details')).toHaveTextContent(
      '× 3 zones = 6 compute nodes',
    );
  });

  it('displays total compute nodes for isHypershift', () => {
    render(<TotalNodesDescription isHypershift poolsLength={2} sumOfTotalNodes={10} />);
    expect(screen.getByTestId('compute-node-hcp-multizone-details')).toHaveTextContent(
      'x 2 machine pools = 10 compute nodes',
    );
  });
});
