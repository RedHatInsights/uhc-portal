import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import ClusterListActions from '../ClusterListActions';

jest.mock('~/redux/hooks/useGlobalState', () => ({
  useGlobalState: () => {},
}));

describe('<ClusterListActions />', () => {
  it('is accessible ', async () => {
    const { container } = render(<ClusterListActions />);

    expect(screen.getByRole('button', { name: 'Add cluster' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();

    await checkAccessibility(container);
  });
});
