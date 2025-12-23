import React from 'react';

import links from '~/common/installLinks.mjs';
import { checkAccessibility, mockUseChrome, render, screen } from '~/testUtils';

import CreateRosaGetStarted from './CreateRosaGetStarted';

mockUseChrome();

describe('<CreateRosaGetStarted />', () => {
  afterAll(() => jest.resetAllMocks());
  it('is accessible', async () => {
    const { container } = render(<CreateRosaGetStarted />);
    await checkAccessibility(container);
  });

  it('FedRAMP alert is visible and has correct urls', () => {
    render(<CreateRosaGetStarted />);

    expect(
      screen.getByRole('link', {
        name: 'Learn more about ROSA with hosted control planes in AWS GovCloud (new window or tab)',
      }),
    ).toHaveAttribute('href', links.ROSA_AWS_FEDRAMP);
    expect(
      screen.getByRole('link', { name: 'FedRAMP access request form (new window or tab)' }),
    ).toHaveAttribute('href', 'https://console.redhat.com/openshift/create/rosa/govcloud');
  });

  it('Create VPC command is present', () => {
    render(<CreateRosaGetStarted />);
    expect(
      screen.getByText(
        'Create a Virtual Private Network (VPC) and necessary networking components.',
      ),
    ).toBeInTheDocument();
  });

  it('Terraform card is present', () => {
    render(<CreateRosaGetStarted />);
    expect(screen.getByText('Deploy with Terraform')).toBeInTheDocument();
  });
});
