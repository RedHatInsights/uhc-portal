import React from 'react';
import { FieldInputProps, FieldMetaProps } from 'formik';

import { checkAccessibility, render, screen, waitFor } from '~/testUtils';

import NodeCountInput from './NodeCountInput';

import '@testing-library/jest-dom';

type MockFormikFieldProps = {
  input: FieldInputProps<string>;
  meta: FieldMetaProps<string>;
};

const createMockFormikProps = (
  value: string = '3',
  error: string | undefined = undefined,
  touched: boolean = false,
) => ({
  input: {
    name: 'nodeCount',
    value,
    onChange: jest.fn(),
    onBlur: jest.fn(),
  },
  meta: {
    value,
    error,
    touched,
    initialTouched: false,
    initialValue: '',
    initialError: undefined,
  },
});

let mockFormikProps: MockFormikFieldProps;

const props = {
  minNodes: 2,
  maxNodes: 249,
  isDisabled: false,
  displayError: jest.fn(),
  hideError: jest.fn(),
};

describe('NodeCountInput', () => {
  beforeEach(() => {
    mockFormikProps = createMockFormikProps();
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(
      <NodeCountInput {...props} input={mockFormikProps.input} meta={mockFormikProps.meta} />,
    );

    await checkAccessibility(container);
  });

  it('renders correctly', async () => {
    render(<NodeCountInput {...props} input={mockFormikProps.input} meta={mockFormikProps.meta} />);
    expect(screen.getByRole('spinbutton', { name: /compute nodes/i })).toHaveValue(3);
  });

  it('increments the value when plus button is clicked', async () => {
    const { user } = render(
      <NodeCountInput {...props} input={mockFormikProps.input} meta={mockFormikProps.meta} />,
    );
    const plusButton = screen.getByRole('button', { name: /increment compute nodes/i });
    await user.click(plusButton);
    expect(mockFormikProps.input.onChange).toHaveBeenCalledWith(4);
  });

  it('decrements the value when minus button is clicked', async () => {
    const { user } = render(
      <NodeCountInput {...props} input={mockFormikProps.input} meta={mockFormikProps.meta} />,
    );
    const minusButton = screen.getByRole('button', { name: /decrement compute nodes/i });
    await user.click(minusButton);
    expect(mockFormikProps.input.onChange).toHaveBeenCalledWith(2);
  });

  it('calls displayError when meta.error exists', async () => {
    mockFormikProps = createMockFormikProps('1', 'Input cannot be less than 2.');
    render(<NodeCountInput {...props} input={mockFormikProps.input} meta={mockFormikProps.meta} />);
    await waitFor(() => {
      expect(props.displayError).toHaveBeenCalledWith('nodes', 'Input cannot be less than 2.');
    });
  });

  it('calls hideError when meta.error is cleared', async () => {
    // Initial render with an error
    const { rerender } = render(
      <NodeCountInput
        {...props}
        input={createMockFormikProps('3', 'Some initial error').input}
        meta={createMockFormikProps('3', 'Some initial error').meta}
      />,
    );

    // Ensure displayError was called initially
    await waitFor(() => {
      expect(props.displayError).toHaveBeenCalledTimes(1);
    });

    // Rerender with no error
    rerender(
      <NodeCountInput
        {...props}
        input={createMockFormikProps('3', undefined).input}
        meta={createMockFormikProps('3', undefined).meta}
      />,
    );

    // Expect hideError to be called
    await waitFor(() => {
      expect(props.hideError).toHaveBeenCalledWith('nodes');
    });
    await waitFor(() => {
      expect(props.displayError).toHaveBeenCalledTimes(1);
    });
  });

  it('disables input when isDisabled is true', () => {
    render(
      <NodeCountInput
        {...props}
        input={mockFormikProps.input}
        meta={mockFormikProps.meta}
        isDisabled
      />,
    );
    const inputElement = screen.getByRole('spinbutton', { name: /compute nodes/i });
    expect(inputElement).toBeDisabled();
  });
});
