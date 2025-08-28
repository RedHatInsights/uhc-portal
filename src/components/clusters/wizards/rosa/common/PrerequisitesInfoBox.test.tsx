import React from 'react';

import { ROSA_HOSTED_CLI_MIN_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';
import { checkAccessibility, render, screen, within } from '~/testUtils';

import { PrerequisitesInfoBox } from './PrerequisitesInfoBox';

const rosaCLIMessage = new RegExp(
  `Make sure you are using ROSA CLI version ${ROSA_HOSTED_CLI_MIN_VERSION} or above for hosted control plane architecture.`,
);

describe('<PrerequisitesInfoBox} />', () => {
  it('is accessible', async () => {
    const { container } = render(<PrerequisitesInfoBox />);
    await checkAccessibility(container);
  });

  it('provides info and link to ROSA prerequisites page', () => {
    render(<PrerequisitesInfoBox />);

    expect(screen.getByText('Did you complete your prerequisites?')).toBeInTheDocument();
    expect(within(screen.getByRole('link')).getByText(/Set up ROSA page/)).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toEqual(
      '/openshift/create/rosa/getstarted',
    );
  });

  it('shows the ROSA CLI version message by default', () => {
    render(<PrerequisitesInfoBox />);

    expect(screen.getByText(rosaCLIMessage)).toBeInTheDocument();
  });

  it('does not show the ROSA CLI version message when "showRosaCliRequirement" is false', () => {
    render(<PrerequisitesInfoBox showRosaCliRequirement={false} />);

    expect(screen.queryByText(rosaCLIMessage)).not.toBeInTheDocument();
  });
});
