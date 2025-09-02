import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import ViewOnlyMyClustersToggle from '../ViewOnlyMyClustersToggle';

const mockOnShowClusters = jest.fn();

describe('ViewOnlyMyClustersToggle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is unchecked when "isChecked" is false', async () => {
    const { container } = render(<ViewOnlyMyClustersToggle onChange={mockOnShowClusters} />);
    expect(screen.getByRole('switch')).not.toBeChecked();
    await checkAccessibility(container);
  });

  it('is checked when "isChecked" is true', () => {
    render(<ViewOnlyMyClustersToggle isChecked onChange={mockOnShowClusters} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });
});
