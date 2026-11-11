import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { rosaHandsOnLinks } from './constants';
import { RosaHandsOnCustomerSuccessLink } from './RosaHandsOnContactLinks';

describe('<RosaHandsOnCustomerSuccessLink />', () => {
  it('renders the provided link text as a mailto link to customer success', async () => {
    const { container } = render(<RosaHandsOnCustomerSuccessLink linkText="contact support" />);

    const link = screen.getByRole('link', { name: 'contact support' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', rosaHandsOnLinks.customerSuccess);
    expect(link).not.toHaveAttribute('target');

    await checkAccessibility(container);
  });
});
