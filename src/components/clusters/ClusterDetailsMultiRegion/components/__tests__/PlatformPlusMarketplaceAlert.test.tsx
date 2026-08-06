import React from 'react';

import installLinks from '~/common/installLinks.mjs';
import { HAS_USER_DISMISSED_ROSA_OPP_MARKETPLACE_ALERT } from '~/common/localStorageConstants';
import { checkAccessibility, render, screen } from '~/testUtils';

import PlatformPlusMarketplaceAlert from '../ClusterDetailsTop/components/PlatformPlusMarketplaceAlert';

describe('<PlatformPlusMarketplaceAlert />', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is accessible', async () => {
    const { container } = render(<PlatformPlusMarketplaceAlert onDismiss={jest.fn()} />);
    await checkAccessibility(container);
  });

  it('renders the marketplace alert with correct links', () => {
    render(<PlatformPlusMarketplaceAlert onDismiss={jest.fn()} />);

    expect(
      screen.getByText(
        'Red Hat OpenShift Platform Plus for ROSA is now available on the AWS Marketplace',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'AWS Marketplace listing for EMEA (new window or tab)',
      }),
    ).toHaveAttribute('href', installLinks.ROSA_OPP_AWS_MARKETPLACE_EMEA);
    expect(
      screen.getByRole('link', {
        name: 'AWS Marketplace listing for NA, LATAM, and APAC (new window or tab)',
      }),
    ).toHaveAttribute('href', installLinks.ROSA_OPP_AWS_MARKETPLACE_NON_EMEA);
  });

  it('persists dismissal and calls onDismiss callback when closed', async () => {
    const onDismiss = jest.fn();
    const { user } = render(<PlatformPlusMarketplaceAlert onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(localStorage.getItem(HAS_USER_DISMISSED_ROSA_OPP_MARKETPLACE_ALERT)).toBe('true');
    expect(onDismiss).toHaveBeenCalled();
  });
});
