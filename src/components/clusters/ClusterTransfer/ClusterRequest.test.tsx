import React from 'react';

import { render, screen } from '~/testUtils';

import ClusterRequest from './ClusterRequest';

describe('<ClusterRequest />', () => {
  it('renders correctly', () => {
    render(<ClusterRequest />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Cluster Requests/i }),
    ).toBeInTheDocument();
  });
});
