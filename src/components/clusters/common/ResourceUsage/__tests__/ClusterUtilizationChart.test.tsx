import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { parseValueWithUnit, Unit, ValueWithUnits } from '../../../../../common/units';
import ClusterUtilizationChart from '../ClusterUtilizationChart';

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

describe('<ClusterUtilizationChart />', () => {
  const defaultProps = {
    title: 'Memory',
    used: getValue(memory.used),
    total: getValue(memory.total),
    unit: 'B' as Unit,
    humanize: true,
    donutId: 'memory_donut',
    type: 'legend',
  };

  it('is accessible', async () => {
    const { container } = render(<ClusterUtilizationChart {...defaultProps} />);
    await checkAccessibility(container);
  });

  it('should render legend type', () => {
    render(<ClusterUtilizationChart {...defaultProps} />);

    expect(screen.getByText('Used: 15.41 GiB')).toBeInTheDocument();
    expect(screen.getByText('Available: 61.23 GiB')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render non-legend type', () => {
    render(<ClusterUtilizationChart {...defaultProps} type="whatever" />);

    expect(screen.queryByText('Used: 15.41 GiB')).not.toBeInTheDocument();
    expect(screen.queryByText('Available: 61.23 GiB')).not.toBeInTheDocument();
    expect(screen.getByText('of 76.64 GiB used')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render when humanize false', () => {
    render(<ClusterUtilizationChart {...defaultProps} humanize={false} />);

    expect(screen.getByText('Used: 16546058240 B')).toBeInTheDocument();
    expect(screen.getByText('Available: 65747288064 B')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render when any value is undefined', () => {
    render(<ClusterUtilizationChart {...defaultProps} used={undefined} />);

    expect(screen.getByText('Used: 0 B')).toBeInTheDocument();
    expect(screen.getByText('Available: 0 B')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render when Unit undefined', () => {
    render(<ClusterUtilizationChart {...defaultProps} unit={undefined} />);

    expect(screen.getByText('Used: 15.41 GiB')).toBeInTheDocument();
    expect(screen.getByText('Available: 61.23 GiB')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('should render when Unit is defined', () => {
    render(<ClusterUtilizationChart {...defaultProps} unit="MiB" />);

    expect(screen.getByText('Used: 15.41 PiB')).toBeInTheDocument();
    expect(screen.getByText('Available: 61.23 PiB')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
});
