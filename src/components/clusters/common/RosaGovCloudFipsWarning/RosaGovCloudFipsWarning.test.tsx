import React from 'react';

import docLinks from '~/common/docLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import { checkAccessibility, render, screen, within } from '~/testUtils';

import { RosaGovCloudFipsWarning } from './RosaGovCloudFipsWarning';

describe('<RosaGovCloudFipsWarning />', () => {
  it('renders the CMVP warning with FIPS and KCS links', () => {
    render(<RosaGovCloudFipsWarning />);

    const alert = screen.getByTestId('rosa-govcloud-fips-warning');
    expect(alert).toHaveTextContent(
      'Currently, only OpenShift Container Platform version 4.18.x utilizes cryptographic modules with full CMVP approval.',
    );
    expect(alert).toHaveTextContent(
      'ROSA in AWS GovCloud additionally supports OpenShift Container Platform versions 4.19, 4.20, 4.21, 4.22.',
    );

    const fipsLink = within(alert).getByRole('link', { name: /FIPS mode/i });
    expect(fipsLink).toHaveAttribute('href', docLinks.OCP_INSTALLING_FIPS);

    const kcsLink = within(alert).getByRole('link', {
      name: /ROSA GovCloud and FIPS-validated Cryptography/i,
    });
    expect(kcsLink).toHaveAttribute('href', supportLinks.ROSA_GOVCLOUD_FIPS_KB);
  });

  it('is accessible', async () => {
    const { container } = render(<RosaGovCloudFipsWarning />);

    await checkAccessibility(container);
  });
});
