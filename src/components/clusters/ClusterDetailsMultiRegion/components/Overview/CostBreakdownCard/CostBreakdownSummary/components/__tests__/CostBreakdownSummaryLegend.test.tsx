import React from 'react';

import { render, screen } from '~/testUtils';

import CostBreakdownSummaryLegend from '../CostBreakdownSummaryLegend';

// Mock the components and functions used
jest.mock('@patternfly/react-charts/victory', () => ({
  ChartLegend: jest.fn(({ gutter, itemsPerRow, labelComponent, rowGutter }) => (
    <div data-testid="chart-legend">
      <div data-testid="chart-legend-label">{labelComponent}</div>
    </div>
  )),
}));

jest.mock('../CostBreakdownSummaryLegendLabel', () => ({
  __esModule: true,
  default: jest.fn(
    ({ dy, lineHeight, values }: { dy: number; lineHeight: number; values: string[] }) => (
      <div data-testid="cost-breakdown-legend-label">{values.join(', ')}</div>
    ),
  ),
}));

describe('CostBreakdownSummaryLegend', () => {
  it('should render the ChartLegend with correct label component', () => {
    // Arrange
    const values = ['100.00 USD', '200.00 USD', '300.00 USD'];

    // Act
    render(<CostBreakdownSummaryLegend values={values} />);

    // Assert
    expect(screen.getByTestId('chart-legend')).toBeInTheDocument();
    expect(screen.getByTestId('cost-breakdown-legend-label')).toHaveTextContent(values.join(', '));
  });

  it('should handle empty values array gracefully', () => {
    // Act
    render(<CostBreakdownSummaryLegend values={[]} />);

    // Assert
    expect(screen.getByTestId('chart-legend')).toBeInTheDocument();
    expect(screen.getByTestId('cost-breakdown-legend-label')).toHaveTextContent('');
  });
});
