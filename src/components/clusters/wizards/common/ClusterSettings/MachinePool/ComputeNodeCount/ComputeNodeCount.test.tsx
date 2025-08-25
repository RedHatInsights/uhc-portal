import React from 'react';
import { Formik } from 'formik';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as useFormStateModule from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import ComputeNodeCount, { TotalNodesDescription } from './ComputeNodeCount';

import '@testing-library/jest-dom';

jest.mock('~/components/clusters/wizards/hooks');
jest.mock('~/redux/hooks');
jest.mock('~/queries/featureGates/useFetchFeatureGate');

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
  beforeEach(() => {
    jest.clearAllMocks();
    (useFormStateModule.useFormState as jest.Mock).mockReturnValue({
      values: {},
      getFieldProps: () => ({ value: 2, onChange: jest.fn() }),
      getFieldMeta: () => ({ touched: true, error: undefined }),
      setFieldValue: jest.fn(),
      validateField: jest.fn(),
    });
  });

  it('renders with default props and shows label', () => {
    renderWithFormik();

    expect(screen.getByLabelText(/Compute node count/)).toBeInTheDocument();
  });

  it('shows hypershift label when isHypershift is true', () => {
    (useFormStateModule.useFormState as jest.Mock).mockReturnValue({
      ...useFormStateModule.useFormState(),
      values: { [FieldId.Hypershift]: 'true' },
      getFieldProps: () => ({ value: 2, onChange: jest.fn() }),
    });

    renderWithFormik();

    expect(screen.getByLabelText(/Compute node count \(per machine pool\)/)).toBeInTheDocument();
  });

  it('sets value when user changes input', async () => {
    const mockSetFieldValue = jest.fn();

    (useFormStateModule.useFormState as jest.Mock).mockReturnValue({
      ...useFormStateModule.useFormState(),

      setFieldValue: mockSetFieldValue,
    });

    renderWithFormik();

    const input = screen.getByTestId('mock-node-input');
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(input, { target: { value: '4' } });

    await waitFor(() => {
      expect(mockSetFieldValue).toHaveBeenCalledWith(FieldId.NodesCompute, 4, true);
    });
  });

  it('converts per-zone values to total values for multi-zone deployments', async () => {
    const mockSetFieldValue = jest.fn();

    (useFormStateModule.useFormState as jest.Mock).mockReturnValue({
      values: {
        [FieldId.MultiAz]: 'true',
        [FieldId.NodesCompute]: 3,
      },
      getFieldProps: () => ({ value: 3, onChange: jest.fn() }),
      getFieldMeta: () => ({ touched: true, error: undefined }),
      setFieldValue: mockSetFieldValue,
      validateField: jest.fn(),
    });

    renderWithFormik();

    const input = screen.getByTestId('mock-node-input');
    // User sees 1 (per zone) but form stores 3 (total)
    expect(input).toHaveValue(1); // 3 / 3 = 1 per zone

    // When user changes to 2 per zone, it should store 6 total
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(input, { target: { value: '2' } });

    await waitFor(() => {
      expect(mockSetFieldValue).toHaveBeenCalledWith(FieldId.NodesCompute, 6, true); // 2 * 3 = 6
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
