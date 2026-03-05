import React from 'react';

import docLinks from '~/common/docLinks.mjs';
import { render, screen } from '~/testUtils';

import WithTerraform from './WithTerraformCard';

describe('<WithTerraform />', () => {
  it('has correct link to deploy ROSA HCP cluster documentation', () => {
    render(<WithTerraform />);

    const deployLink = screen.getByRole('link', {
      name: 'deploy a ROSA HCP cluster (new window or tab)',
    });

    expect(deployLink).toHaveAttribute('href', docLinks.TERRAFORM_ROSA_HCP_URL);
  });

  it('has correct link to Terraform registry', () => {
    render(<WithTerraform />);

    const registryLink = screen.getByRole('link', {
      name: 'visit the Terraform registry (new window or tab)',
    });

    expect(registryLink).toHaveAttribute('href', docLinks.TERRAFORM_REGISTRY_ROSA_HCP);
  });
});
