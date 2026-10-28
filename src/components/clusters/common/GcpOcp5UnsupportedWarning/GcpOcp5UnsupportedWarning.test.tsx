import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import {
  GCP_OCP5_RED_HAT_ACCOUNT_CREATION_WARNING,
  GCP_OCP5_SERVICE_ACCOUNT_CREATION_WARNING,
  GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING,
  GcpOcp5UnsupportedWarning,
} from './GcpOcp5UnsupportedWarning';

const warnings = [
  {
    variant: 'serviceAccountCreation',
    title: GCP_OCP5_SERVICE_ACCOUNT_CREATION_WARNING,
  },
  {
    variant: 'redHatAccountCreation',
    title: GCP_OCP5_RED_HAT_ACCOUNT_CREATION_WARNING,
  },
  {
    variant: 'upgrade',
    title: GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING,
  },
] as const;

describe('<GcpOcp5UnsupportedWarning />', () => {
  it('is accessible', async () => {
    const { container } = render(<GcpOcp5UnsupportedWarning variant="serviceAccountCreation" />);

    await checkAccessibility(container);
  });

  it.each(warnings)('renders the $variant warning', ({ variant, title }) => {
    render(<GcpOcp5UnsupportedWarning variant={variant} />);

    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
