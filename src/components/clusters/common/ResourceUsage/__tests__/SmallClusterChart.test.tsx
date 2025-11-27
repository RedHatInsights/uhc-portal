import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { parseValueWithUnit, Unit, ValueWithUnits } from '../../../../../common/units';
import SmallClusterChart from '../SmallClusterChart';

const getValue = ({ value, unit }: ValueWithUnits) => parseValueWithUnit(value, unit);
const memory: { used: ValueWithUnits; total: ValueWithUnits } = {
  used: {
    value: 16546058240,
    unit: 'B',
  },
  total: {
    value: 82293346304,
    unit: 'B',
  },
};
// TODO: This component is not fully testable because a large portion of the data is only displayed in SVGs
// and is not accessible.  Besides not easily testable this is a large accessibility concern.

describe('<SmallClusterChart />', () => {
  const defaultProps = {
    title: 'Memory',
    total: getValue(memory.total),
    used: getValue(memory.used),
    unit: 'B' as Unit,
    humanize: true,
    donutId: 'memory_donut',
    availableTitle: 'Available',
    usedTitle: 'Used',
  };

  it('is accessible', async () => {
    const { container } = render(<SmallClusterChart {...defaultProps} />);

    await checkAccessibility(container);
  });

  it('should render', () => {
    render(<SmallClusterChart {...defaultProps} />);

    expect(screen.getByText('Used: 15.41 GiB')).toBeInTheDocument();
    expect(screen.getByText('Available: 61.23 GiB')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render when humanize false', () => {
    render(<SmallClusterChart {...defaultProps} humanize={false} />);

    expect(screen.getByText('Used: 16546058240 B')).toBeInTheDocument();
    expect(screen.getByText('Available: 65747288064 B')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render when any value is undefined', () => {
    render(<SmallClusterChart {...defaultProps} used={undefined} />);

    expect(screen.getByText('Used: 0 B')).toBeInTheDocument();
    expect(screen.getByText('Available: 0 B')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render when Unit is defined', () => {
    render(<SmallClusterChart {...defaultProps} unit={'MiB' as Unit} />);

    expect(screen.getByText('Used: 15.41 PiB')).toBeInTheDocument();
    expect(screen.getByText('Available: 61.23 PiB')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render when Unit is undefined', () => {
    render(<SmallClusterChart {...defaultProps} unit={undefined} />);

    expect(screen.getByText('Used: 15.41 GiB')).toBeInTheDocument();
    expect(screen.getByText('Available: 61.23 GiB')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
});
