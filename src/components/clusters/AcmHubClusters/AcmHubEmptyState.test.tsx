import React from 'react';

import { checkAccessibility, screen, withState } from '~/testUtils';

import AcmHubEmptyState from './AcmHubEmptyState';

describe('<AcmHubEmptyState />', () => {
  it('calls onStartTagging when Start tagging is clicked', async () => {
    const onStartTagging = jest.fn();

    const { user } = withState().render(<AcmHubEmptyState onStartTagging={onStartTagging} />);

    await user.click(screen.getByRole('button', { name: 'Start tagging' }));

    expect(onStartTagging).toHaveBeenCalledTimes(1);
  });

  it('is accessible', async () => {
    const { container } = withState().render(<AcmHubEmptyState onStartTagging={() => {}} />);

    await checkAccessibility(container);
  });
});
