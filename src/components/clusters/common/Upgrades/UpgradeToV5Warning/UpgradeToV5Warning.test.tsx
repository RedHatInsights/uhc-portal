import React from 'react';

import { trackEvents } from '~/common/analytics';
import { checkAccessibility, render, screen, within } from '~/testUtils';

import { UpgradeToV5Warning } from './UpgradeToV5Warning';

const useAnalyticsMock = jest.fn();
jest.mock('~/hooks/useAnalytics', () => jest.fn(() => useAnalyticsMock));

const rosaClassicWarningTitle =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for ROSA Classic (EUS Term 1).';
const rosaClassicWarningBody = 'To continue with OpenShift v5, create a new ROSA HCP cluster.';
const rosaHcpWarningText =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for ROSA (EUS Term 1).';
const osdClassicWarningText =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for OSD Classic (EUS Term 1).';

describe('<UpgradeToV5Warning />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(<UpgradeToV5Warning isRosa />);

    await checkAccessibility(container);
  });

  it('renders the ROSA Classic warning with a linked create HCP CTA in the alert body', async () => {
    const { user } = render(<UpgradeToV5Warning isRosa />);

    const alert = screen.getByTestId('classic-upgrade-to-v5-warning');
    expect(alert).toHaveTextContent(rosaClassicWarningTitle);
    expect(alert).toHaveTextContent(rosaClassicWarningBody);
    expect(within(within(alert).getByRole('heading')).queryByRole('link')).not.toBeInTheDocument();

    const link = within(alert).getByRole('link', { name: 'create a new ROSA HCP cluster' });
    expect(link).toHaveAttribute('href', '/openshift/create/rosa/getstarted');

    useAnalyticsMock.mockClear();
    await user.click(link);

    expect(useAnalyticsMock).toHaveBeenCalledWith(trackEvents.CreateClusterROSA, {
      url: '/create/rosa/getstarted',
      path: window.location.pathname,
    });
  });

  it('renders the ROSA HCP warning copy when isRosa and isHypershift are true', () => {
    render(<UpgradeToV5Warning isRosa isHypershift />);

    const alert = screen.getByTestId('classic-upgrade-to-v5-warning');
    expect(alert).toHaveTextContent(rosaHcpWarningText);
    expect(
      screen.queryByRole('link', { name: 'create a new ROSA HCP cluster' }),
    ).not.toBeInTheDocument();
  });

  it('renders the OSD Classic warning copy when isRosa is false', () => {
    render(<UpgradeToV5Warning isRosa={false} />);

    const alert = screen.getByTestId('classic-upgrade-to-v5-warning');
    expect(alert).toHaveTextContent(osdClassicWarningText);
    expect(
      screen.queryByRole('link', { name: 'create a new ROSA HCP cluster' }),
    ).not.toBeInTheDocument();
  });
});
