import React from 'react';
import { FieldInputProps, FieldMetaProps } from 'formik';

import { render, screen } from '~/testUtils';

import { NodesInput } from './NodesInput';

// Assisted-by: Cursor - gemini-2.5-pro

describe('NodesInput', () => {
  const onChange = jest.fn();
  const onBlur = jest.fn();
  const ariaLabel = 'nodes input';

  const mockInput: FieldInputProps<string> = {
    name: 'nodes',
    value: '3',
    onChange,
    onBlur,
  };

  const defaultProps = {
    min: 1,
    max: 10,
    input: mockInput,
    displayError: jest.fn(),
    meta: { error: '' } as unknown as FieldMetaProps<string>,
    hideError: jest.fn(),
    limit: 'testLimit',
    ariaLabel,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Plus/Minus Button Behavior (onButtonPress)', () => {
    describe('Increment/Decrement outside of min/max bounds', () => {
      it('sets value to min when PLUS button is pressed and current input value is explicitly less than min', async () => {
        const min = 2;
        const props = { ...defaultProps, min, input: { ...mockInput, value: '0' } };
        const { user } = render(<NodesInput {...props} />);
        await user.click(screen.getByRole('button', { name: `${ariaLabel} plus` }));
        expect(onChange).toHaveBeenCalledWith(2);
      });

      it('sets value to max when MINUS button is pressed and current input value is explicitly greater than max', async () => {
        const max = 10;
        const props = { ...defaultProps, max, input: { ...mockInput, value: '12' } };
        const { user } = render(<NodesInput {...props} />);
        await user.click(screen.getByRole('button', { name: `${ariaLabel} minus` }));
        expect(onChange).toHaveBeenCalledWith(10);
      });
    });

    describe('Normal Increment/Decrement within bounds', () => {
      it('increments the valid numeric value by 1 when PLUS button is pressed', async () => {
        const props = { ...defaultProps, input: { ...mockInput, value: '5' } };
        const { user } = render(<NodesInput {...props} />);
        await user.click(screen.getByRole('button', { name: `${ariaLabel} plus` }));
        expect(onChange).toHaveBeenCalledWith(6);
      });

      it('decrements the valid numeric value by 1 when MINUS button is pressed', async () => {
        const props = { ...defaultProps, input: { ...mockInput, value: '5' } };
        const { user } = render(<NodesInput {...props} />);
        await user.click(screen.getByRole('button', { name: `${ariaLabel} minus` }));
        expect(onChange).toHaveBeenCalledWith(4);
      });
    });
  });

  describe('Direct Input Change Behavior', () => {
    it('calls Formik input.onChange with the new string value when user types directly into the input', async () => {
      const props = { ...defaultProps, input: { ...mockInput, value: '' } };
      const { user } = render(<NodesInput {...props} />);
      const input = screen.getByRole('spinbutton', { name: ariaLabel });

      await user.type(input, '7');

      expect(onChange).toHaveBeenLastCalledWith(7);
    });
  });
});
