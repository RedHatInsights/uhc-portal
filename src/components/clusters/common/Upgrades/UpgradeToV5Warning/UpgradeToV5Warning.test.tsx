import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { UpgradeToV5Warning } from './UpgradeToV5Warning';

const rosaClassicWarningText =
  'OpenShift v4 reaches end of life on March 31, 2028. Classic clusters cannot be upgraded to v5. To continue with OpenShift v5, create a new ROSA HCP cluster.';
const osdClassicWarningText =
  'OpenShift v4 reaches end of life on March 31, 2028. OpenShift 4.23 is the last supported version for OSD Classic.';

describe('<UpgradeToV5Warning />', () => {
  it('is accessible', async () => {
    const { container } = render(<UpgradeToV5Warning isRosa />);

    await checkAccessibility(container);
  });

  it('renders the ROSA Classic warning copy when isRosa is true', () => {
    render(<UpgradeToV5Warning isRosa />);

    expect(screen.getByTestId('classic-upgrade-to-v5-warning')).toHaveTextContent(
      rosaClassicWarningText,
    );
  });

  it('renders the OSD Classic warning copy when isRosa is false', () => {
    render(<UpgradeToV5Warning isRosa={false} />);

    expect(screen.getByTestId('classic-upgrade-to-v5-warning')).toHaveTextContent(
      osdClassicWarningText,
    );
  });
});
