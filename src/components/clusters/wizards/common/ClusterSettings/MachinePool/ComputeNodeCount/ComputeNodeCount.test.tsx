import React from 'react';
import { Formik } from 'formik';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as machinePoolsUtilsModule from '~/components/clusters/common/machinePools/utils';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import * as useGlobalStateModule from '~/redux/hooks';
import { mockUseFeatureGate } from '~/testUtils';

import ComputeNodeCount, { TotalNodesDescription } from './ComputeNodeCount';

import '@testing-library/jest-dom';

jest.mock('~/components/clusters/wizards/hooks');
jest.mock('~/redux/hooks');
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

const mockedUseFormState = useFormState as jest.MockedFunction<typeof useFormState>;

describe('ComputeNodeCount', () => {
  const mockSetFieldValue = jest.fn();
  const mockValidateField = jest.fn();

  const createMockFormState = (overrides = {}) => {
    const values: Record<string, any> = {
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
    };
    return {
      values,
      getFieldProps: (name: string) => ({
        value: values[name] ?? '',
        onChange: jest.fn(),
        onBlur: jest.fn(),
        name,
      }),
      getFieldMeta: () => ({ touched: false, error: undefined }),
      setFieldValue: mockSetFieldValue,
      validateField: mockValidateField,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetFieldValue.mockClear();
    mockValidateField.mockClear();

    mockedUseFormState.mockReturnValue(createMockFormState() as any);

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
    mockedUseFormState.mockReturnValue(
      createMockFormState({
        [FieldId.Hypershift]: 'true',
      }) as any,
    );

    renderWithFormik();

    expect(screen.getByLabelText(/Compute node count \(per machine pool\)/)).toBeInTheDocument();
  });

  it('sets value when user changes input', async () => {
    mockedUseFormState.mockReturnValue(createMockFormState() as any);

    renderWithFormik();

    const input = screen.getByTestId('mock-node-input');
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(input, { target: { value: '4' } });

    await waitFor(() => {
      expect(mockSetFieldValue).toHaveBeenCalledWith(FieldId.NodesCompute, 4, true);
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
