import React from 'react';

import { render, screen } from '~/testUtils';

import { ChannelSelect } from './ChannelSelect';

const options = [
  { value: 'stable-4.16', label: 'stable-4.16' },
  { value: 'eus-4.16', label: 'eus-4.16' },
];

describe('ChannelSelect', () => {
  it('renders a select with options and aria-label', async () => {
    const { user } = render(
      <ChannelSelect
        optionsDropdownData={options}
        input={{
          value: 'stable-4.16',
          onChange: jest.fn(),
          name: 'channel',
        }}
      />,
    );

    const select = screen.getByRole('button', { name: 'Channel select input' });
    expect(select).toBeInTheDocument();
    expect(select).toHaveTextContent('stable-4.16');

    await user.click(select);

    expect(screen.getByRole('option', { name: 'stable-4.16' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'eus-4.16' })).toBeInTheDocument();
  });

  it('calls onChange with the selected channel value when the user changes selection', async () => {
    const onChange = jest.fn();
    const { user } = render(
      <ChannelSelect
        optionsDropdownData={options}
        input={{
          value: 'stable-4.16',
          onChange,
          name: 'channel',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Channel select input' }));
    await user.click(screen.getByRole('option', { name: 'eus-4.16' }));

    expect(onChange).toHaveBeenCalledWith('eus-4.16');
  });

  it('renders no options when optionsDropdownData is empty', async () => {
    const { user } = render(
      <ChannelSelect
        optionsDropdownData={[]}
        input={{
          value: '',
          onChange: jest.fn(),
          name: 'channel',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Channel select input' }));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});
