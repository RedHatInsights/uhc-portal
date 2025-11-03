import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import links from '../../../common/installLinks.mjs';

import AdvisorEmptyState from './AdvisorEmptyState';

describe('<AdvisorEmptyState />', () => {
  it('Displays link with correct href', () => {
    render(<AdvisorEmptyState />);

    expect(screen.getByText('OpenShift documentation')).toHaveAttribute(
      'href',
      links.REMOTE_HEALTH_INSIGHTS,
    );
  });

  it('Passes accessibility check', async () => {
    const { container } = render(<AdvisorEmptyState />);
    await checkAccessibility(container);
  });
});
