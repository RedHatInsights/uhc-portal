import React from 'react';

import { ROSA_ARCHITECTURE_RENAMING_ALERT } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseChrome, mockUseFeatureGate, render, screen } from '~/testUtils';

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
        name: 'Learn more about ROSA in AWS GovCloud (US) with FedRAMP (new window or tab)',
      }),
    ).toHaveAttribute(
      'href',
      'https://docs.aws.amazon.com/govcloud-us/latest/UserGuide/govcloud-rosa.html',
    );
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

  describe('<RosaArchitectureRenamingAlert />', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('is visible when feature gate is enabled', () => {
      // Arrange
      mockUseFeatureGate([[ROSA_ARCHITECTURE_RENAMING_ALERT, true]]);

      // Act
      render(<CreateRosaGetStarted />);

      // Assert
      expect(
        screen.getByText('Red Hat OpenShift Service on AWS (ROSA) architectures are being renamed'),
      ).toBeInTheDocument();
    });

    it('is not visible when feature gate is disabled', () => {
      // Arrange
      mockUseFeatureGate([[ROSA_ARCHITECTURE_RENAMING_ALERT, false]]);

      // Act
      render(<CreateRosaGetStarted />);

      // Assert
      expect(
        screen.queryByText(
          'Red Hat OpenShift Service on AWS (ROSA) architectures are being renamed',
        ),
      ).not.toBeInTheDocument();
    });
  });
});
