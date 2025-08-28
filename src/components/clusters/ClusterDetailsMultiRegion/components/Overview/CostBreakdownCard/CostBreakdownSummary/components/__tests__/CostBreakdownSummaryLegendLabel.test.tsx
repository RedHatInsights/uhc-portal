import React from 'react';

import { render, screen } from '~/testUtils';

import CostBreakdownSummaryLegendLabel from '../CostBreakdownSummaryLegendLabel';

// Mock the components and functions used
jest.mock('@patternfly/react-charts/victory', () => ({
  ChartLabel: jest.fn(({ text, style, ...props }) => (
    <div data-testid="chart-label" style={style}>
      {text.map((t: string, index: number) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} data-testid={`chart-label-text-${index}`}>
          {t}
        </div>
      ))}
    </div>
  )),
}));

describe('CostBreakdownSummaryLegendLabel', () => {
  it('should render the ChartLabel with correct text and style', () => {
    // Arrange
    const values = ['100.00 USD', '200.00 USD', '300.00 USD'];
    const index = 1;
    const text = 'Some additional text';

    // Act
    render(<CostBreakdownSummaryLegendLabel values={values} index={index} text={text} />);

    // Assert
    expect(screen.getByTestId('chart-label')).toBeInTheDocument();
    expect(screen.getByTestId('chart-label-text-0')).toHaveTextContent(values[index]);
    expect(screen.getByTestId('chart-label-text-1')).toHaveTextContent(text);
  });

  it('should handle empty values array gracefully', () => {
    // Arrange
    const values: string[] = [];
    const index = 0;
    const text = 'Some additional text';

    // Act
    render(<CostBreakdownSummaryLegendLabel values={values} index={index} text={text} />);

    // Assert
    expect(screen.getByTestId('chart-label')).toBeInTheDocument();
    expect(screen.getByTestId('chart-label-text-0')).toHaveTextContent('');
    expect(screen.getByTestId('chart-label-text-1')).toHaveTextContent(text);
  });
});
