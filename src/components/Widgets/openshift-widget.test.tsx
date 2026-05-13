import React from 'react';

import { render, screen } from '~/testUtils';

import OpenShiftWidget from './openshift-widget';

describe('OpenShiftWidget', () => {
  it('should render the OpenShift description text', () => {
    render(<OpenShiftWidget />);
    expect(
      screen.getByText(
        /Build, run, and scale container-based applications - now with developer tools, CI\/CD, and release management\./,
      ),
    ).toBeInTheDocument();
  });

  it('should render an internal link titled "OpenShift" pointing to /openshift', () => {
    render(<OpenShiftWidget />);
    const link = screen.getByRole('link', { name: /OpenShift/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/openshift'));
  });

  it('should render an internal link, not an external one', () => {
    render(<OpenShiftWidget />);
    const link = screen.getByRole('link', { name: /OpenShift/ });
    // OpenShiftWidget does not pass isExternal, so it should use the internal Link component
    expect(link).not.toHaveAttribute('target', '_blank');
    expect(link).not.toHaveAttribute('rel', 'noopener noreferrer');
  });
});
