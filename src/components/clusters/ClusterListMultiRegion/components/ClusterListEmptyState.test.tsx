import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import ClusterListEmptyState from './ClusterListEmptyState';

describe('<ClusterListEmptyState />', () => {
  it('is accessible', async () => {
    const { container } = render(<ClusterListEmptyState />);
    expect(
      screen.getByText(
        "You don't have any clusters yet, but you can easily create or register your first OpenShift cluster.",
        { exact: false },
      ),
    ).toBeInTheDocument();
    await checkAccessibility(container);
  });
});
