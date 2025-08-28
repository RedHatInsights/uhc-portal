import React from 'react';
import { FieldInputProps, FieldMetaProps } from 'formik';

import { render, screen } from '~/testUtils';

import FormNumberInput from './FormNumberInput';

import '@testing-library/jest-dom';

// Assisted-by: Cursor - gemini-2.5-pro

type CustomMetaProps = Omit<FieldMetaProps<number>, 'error'> & {
  error: string | undefined;
};

describe('FormNumberInput', () => {
  const onChange = jest.fn();

  const mockInput: FieldInputProps<number> = {
    name: 'test-input',
    value: 5,
    onChange,
    onBlur: jest.fn(),
  };

  const defaultProps = {
    input: mockInput,
    meta: { error: undefined } as CustomMetaProps,
    min: 1,
    max: 10,
    'aria-label': 'Test Number Input',
    validated: 'default' as const,
    helperTextInvalid: '',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Error message rendering', () => {
    it('displays an error message when meta.error is provided', () => {
      const errorMessage = 'Invalid input value';
      const props = {
        ...defaultProps,
        meta: { error: errorMessage },
        validated: 'error' as const,
        helperTextInvalid: errorMessage,
      };
      render(<FormNumberInput {...props} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not display an error message when meta.error is not provided', () => {
      render(<FormNumberInput {...defaultProps} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('onPlusOrMinus function outside of min/max boundary conditions', () => {
    it('if plus button clicked and input value < min, returns the min value', async () => {
      const min = 2;
      const props = { ...defaultProps, min, input: { ...mockInput, value: 0 } };
      const { user } = render(<FormNumberInput {...props} />);
      await user.click(screen.getByRole('button', { name: /plus/i }));
      expect(onChange).toHaveBeenCalledWith(min);
    });

    it('if minus button clicked and input value > max, return the max value', async () => {
      const max = 10;
      const props = { ...defaultProps, max, input: { ...mockInput, value: 12 } };
      const { user } = render(<FormNumberInput {...props} />);
      await user.click(screen.getByRole('button', { name: /minus/i }));
      expect(onChange).toHaveBeenCalledWith(max);
    });
  });
});
