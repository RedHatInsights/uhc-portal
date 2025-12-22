import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import CostSummary from '../CostSummary';

import { availableState, initialState } from './CostCard.fixtures';

describe('<CostSummary />', () => {
  it('is accessible', async () => {
    const { container } = render(<CostSummary report={initialState.report as any} />);

    await checkAccessibility(container);
  });

  it('is accessible. Empty Data', async () => {
    // Act
    const { container } = render(<CostSummary report={{} as any} />);

    // Assert
    await checkAccessibility(container);
  });

  it('is content as expected. Empty Promise Report', () => {
    // Act
    render(<CostSummary report={{} as any} />);

    // Assert
    expect(screen.queryByRole('heading', { name: /\$0\.00/i })).not.toBeInTheDocument();
  });

  it('is content as expected. Empty Report', () => {
    // Act
    render(<CostSummary report={initialState.report as any} />);

    // Assert
    expect(screen.getByRole('heading', { name: /\$0\.00/i })).toBeInTheDocument();
  });

  it('is content as expected. Information fullfiled and not empty', () => {
    // Act
    render(<CostSummary report={availableState.report as any} />);

    // Assert
    expect(screen.getByText(/ocp-onprem01/i)).toBeInTheDocument();
    expect(screen.getByText(/\$27,664\.77 \(13,832%\)/i)).toBeInTheDocument();

    expect(screen.getByText(/democluster4\.6-go/i)).toBeInTheDocument();
    expect(screen.getByText(/\$2,378\.24 \(1,189%\)/i)).toBeInTheDocument();

    expect(screen.getByText(/openshift on aws/i)).toBeInTheDocument();
    expect(screen.getByText(/\$537\.55 \(269%\)/i)).toBeInTheDocument();

    expect(screen.getByText(/openshift on azure/i)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.00 \(0%\)/i)).toBeInTheDocument();
  });

  it.each([
    ['100€', { value: 100, unit: 'EUR' }, /\$100\.00/i],
    ['200 no unit', { value: 200 }, /\$200\.00/i],
  ])(
    'is content as expected for different total cost values. %p',
    (title, total, expectedResult) => {
      render(
        <CostSummary
          report={
            {
              fulfilled: true,
              meta: { total: { cost: { total } } },
              data: [],
            } as any
          }
        />,
      );

      // Assert
      expect(screen.getByRole('heading', { name: expectedResult })).toBeInTheDocument();
    },
  );
});
