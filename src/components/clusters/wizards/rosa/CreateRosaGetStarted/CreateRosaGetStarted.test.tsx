import React from 'react';

import installLinks from '~/common/installLinks.mjs';
import { checkAccessibility, mockUseChrome, render, screen } from '~/testUtils';

import CreateRosaGetStarted from './CreateRosaGetStarted';

mockUseChrome();

describe('<CreateRosaGetStarted />', () => {
  afterAll(() => jest.resetAllMocks());
  it('is accessible', async () => {
    const { container } = render(<CreateRosaGetStarted />);
    await checkAccessibility(container);
  });

  it('Platform Plus marketplace alert is visible and has correct urls', () => {
    render(<CreateRosaGetStarted />);

    expect(
      screen.getByText(
        'Red Hat OpenShift Platform Plus for Red Hat Openshift Service on AWS (ROSA) is now available on the AWS Marketplace',
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
