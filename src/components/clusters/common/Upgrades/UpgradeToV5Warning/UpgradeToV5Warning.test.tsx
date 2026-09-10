import React from 'react';

import { trackEvents } from '~/common/analytics';
import { checkAccessibility, render, screen, within } from '~/testUtils';

import { UpgradeToV5Warning } from './UpgradeToV5Warning';

const useAnalyticsMock = jest.fn();
jest.mock('~/hooks/useAnalytics', () => jest.fn(() => useAnalyticsMock));

const warningText = 'To use OpenShift v5, please create a ROSA HCP cluster.';

describe('<UpgradeToV5Warning />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(<UpgradeToV5Warning />);

    await checkAccessibility(container);
  });

  it('renders the warning with a tracked link to create a ROSA HCP cluster', async () => {
    const { user } = render(<UpgradeToV5Warning />);

    const alert = screen.getByTestId('classic-upgrade-to-v5-warning');
    expect(alert).toHaveTextContent(warningText);

    const link = within(alert).getByRole('link', { name: 'create a ROSA HCP cluster' });
    expect(link).toHaveAttribute('href', '/openshift/create/rosa/getstarted');

    useAnalyticsMock.mockClear();
    await user.click(link);

    expect(useAnalyticsMock).toHaveBeenCalledWith(trackEvents.CreateClusterROSA, {
      url: '/create/rosa/getstarted',
      path: window.location.pathname,
    });
  });
});
