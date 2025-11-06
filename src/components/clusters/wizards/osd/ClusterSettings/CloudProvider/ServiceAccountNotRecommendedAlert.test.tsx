import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { ServiceAccountNotRecommendedAlert } from './ServiceAccountNotRecommendedAlert';

describe('<ServiceAccountNotRecommendedAlert />', () => {
  it('is accessible', async () => {
    const { container } = render(<ServiceAccountNotRecommendedAlert />);

    await checkAccessibility(container);
  });

  it('displays the correct recommendation title', () => {
    render(<ServiceAccountNotRecommendedAlert />);

    expect(
      screen.getByText(
        /Red Hat recommends using WIF as the authentication type because it provides enhanced security/i,
      ),
    ).toBeInTheDocument();
  });
});
