import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import BillingContractWarningAlert from './BillingContractWarningAlert';

describe('<BillingContractWarningAlert />', () => {
  it('is accessible', async () => {
    const { container } = render(<BillingContractWarningAlert selectedAccountId="123456789012" />);

    await checkAccessibility(container);
  });

  it('shows the warning with the selected account id', () => {
    render(<BillingContractWarningAlert selectedAccountId="123456789012" />);

    expect(screen.getByText('No contract on selected billing account')).toBeInTheDocument();
    expect(screen.getByText('123456789012')).toBeInTheDocument();
  });
});
