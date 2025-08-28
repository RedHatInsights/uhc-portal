import React from 'react';

import { render, screen } from '~/testUtils';

import CostBreakdownSummaryChart from '../CostBreakdownSummaryChart';

import { report } from './CostBreakdownSummaryChart.fixtures';

jest.mock('../../utils/CostBreakdownSummaryUtils', () => ({
  formatCurrency: (value: any, unit: any) => `${value} ${unit}`,
}));

jest.mock('@patternfly/react-charts/victory', () => ({
  ChartPie: jest.fn(({ ariaDesc, data, labels, legendComponent, legendData, ...props }) => (
    <div aria-label={ariaDesc} data-testid="chart-pie">
      {data.map((datum: any, index: number) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} data-testid={`chart-pie-datum-${index}`}>
          {labels({ datum })}
        </div>
      ))}
      {legendComponent}
    </div>
  )),
}));

jest.mock('../CostBreakdownSummaryLegend', () => ({
  __esModule: true,
  default: jest.fn(({ values }: { values: string[] }) => (
    <div data-testid="cost-breakdown-legend">{values.join(', ')}</div>
  )),
}));

describe('CostBreakdownSummaryChart', () => {
  it('should render the ChartPie with correct data and legend', () => {
    // Act
    render(<CostBreakdownSummaryChart report={report} height={300} width={500} />);

    // Assert
    expect(screen.getByLabelText('Cost breakdown')).toBeInTheDocument();

    expect(screen.getByTestId('chart-pie-datum-1')).toHaveTextContent('Markup: 100 USD');
    expect(screen.getByTestId('chart-pie-datum-0')).toHaveTextContent('Raw cost: 200 USD');
    expect(screen.getByTestId('chart-pie-datum-2')).toHaveTextContent('Usage cost: 300 USD');
    expect(screen.getByTestId('cost-breakdown-legend')).toHaveTextContent(
      '200 USD, 100 USD, 300 USD',
    );
  });

  it('should handle missing report data gracefully', () => {
    // Act
    render(<CostBreakdownSummaryChart report={{} as any} height={300} width={500} />);

    // Assert
    expect(screen.getByLabelText('Cost breakdown')).toBeInTheDocument();
    screen.getByText(/raw cost: 0 USD/i);
    screen.getByText(/markup: 0 USD/i);
    screen.getByText(/usage cost: 0 USD/i);
    screen.getByText(/0 USD, 0 USD, 0 USD/i);
  });
});
