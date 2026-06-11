import React from 'react';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import FormKeyLabelValue from '../FormKeyLabelValue';
import LabelKeyValueProps from '../LabelKeyValueProps';

describe('<FormKeyLabelValue />', () => {
  const onChangeFn = jest.fn();
  const props: LabelKeyValueProps = {
    index: 0,
    input: { onChange: onChangeFn, onBlur: () => {}, value: 'valueX', name: 'name' },
    meta: { value: 'valueY', touched: false, initialTouched: false },
  };

  afterEach(() => {
    onChangeFn.mockClear();
  });

  it('is accessible', async () => {
    // Act
    const { container } = render(<FormKeyLabelValue {...props} />);

    // Assert
    await checkAccessibility(container);
    const input = screen.getByRole('textbox', { name: /key-value list value/i });

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('value', 'valueX');
  });

  it('onChange triggered', async () => {
    // Arrange
    const inputText = 'whateverthevalue';
    render(<FormKeyLabelValue {...props} />);
    const input = screen.getByRole('textbox', { name: /key-value list value/i });

    // Act
    await userEvent.type(input, inputText);

    // Assert
    expect(onChangeFn).toHaveBeenCalledTimes(inputText.length);
  });

  it('uses valueAriaLabel for the value input when provided', () => {
    const customLabel = 'Exclude namespace selector values';
    render(<FormKeyLabelValue {...props} valueAriaLabel={customLabel} />);

    const input = screen.getByRole('textbox', { name: customLabel });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('value', 'valueX');
  });

  it('shows validation error via FormGroupHelperText when touched', () => {
    const errorMessage = 'Enter at least one value, separated by commas.';
    render(
      <FormKeyLabelValue {...props} meta={{ ...props.meta, touched: true, error: errorMessage }} />,
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
