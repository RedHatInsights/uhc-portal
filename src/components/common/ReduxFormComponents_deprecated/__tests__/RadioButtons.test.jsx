import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import RadioButtons from '../RadioButtons';

describe('<RadioButtons />', () => {
  const onChangeCallback = jest.fn();
  const onChange = jest.fn();
  const props = {
    defaultValue: 'test-default',
    onChangeCallback,
    input: {
      name: 'test-radio-buttons',
      onChange,
    },
    className: 'test-classname',
    options: [
      {
        label: 'Option 1',
        value: 'option-1',
      },
      {
        label: 'the default',
        value: 'test-default',
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible - basic', async () => {
    const { container } = render(<RadioButtons {...props} />);

    expect(screen.getAllByRole('radio')).toHaveLength(2);
    await checkAccessibility(container);
  });

  it('calls onChange to change to default value on initial render', () => {
    render(<RadioButtons {...props} />);
    expect(onChange).toHaveBeenCalledWith('test-default');
  });

  it('calls onChange properly when user clicks on a radio button', async () => {
    const { user } = render(<RadioButtons {...props} />);
    expect(onChange).toHaveBeenCalledWith('test-default');
    await user.click(screen.getByLabelText('Option 1'));

    expect(onChange).toHaveBeenLastCalledWith('option-1');
  });

  it('reverts to default when value is changed to empty string', () => {
    const { rerender } = render(<RadioButtons {...props} />);
    expect(onChange).toHaveBeenCalledTimes(1);

    const newProps = {
      ...props,
      input: { ...props.input, value: '' },
    };

    rerender(<RadioButtons {...newProps} />);

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('test-default');
  });
});
