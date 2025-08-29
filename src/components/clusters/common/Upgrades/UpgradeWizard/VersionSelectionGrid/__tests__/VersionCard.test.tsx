import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import VersionCard from '../VersionCard';

describe('<VersionCard>', () => {
  const onKeyDown = jest.fn<void, [React.KeyboardEvent<HTMLInputElement>]>();
  const onClick = jest.fn<void, [React.MouseEvent<HTMLInputElement>]>();

  const defaultProps = {
    isRecommended: true,
    version: '4.5.20',
    onKeyDown,
    onClick,
    isUnMetClusterAcknowledgements: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const getCard = (version: string = '4.5.20'): HTMLElement | null =>
    document.getElementById(version);

  it('is accessible when recommended', async () => {
    const { container } = render(<VersionCard {...defaultProps} />);

    expect(screen.getByText('Recommended')).toBeInTheDocument();
    const card = getCard(defaultProps.version);

    expect(card).not.toHaveClass('pf-m-selected');

    await checkAccessibility(container);
  });

  it('should render correctly when selected & not recommended', () => {
    const newProps = {
      ...defaultProps,
      isSelected: true,
      version: '4.5.16',
      isRecommended: false,
    };
    render(<VersionCard {...newProps} />);

    expect(screen.queryByText('Recommended')).not.toBeInTheDocument();

    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('should not render a tooltip without any unmet cluster acknowledgements', () => {
    render(<VersionCard {...defaultProps} />);
    expect(screen.queryByRole('button', { name: 'more information' })).not.toBeInTheDocument();
  });

  it('should render tooltip when has unmet cluster acknowledgements', () => {
    const newProps = { ...defaultProps, isUnMetClusterAcknowledgements: true };

    render(<VersionCard {...newProps} />);
    expect(screen.getByRole('button', { name: 'more information' })).toBeInTheDocument();
  });
});
