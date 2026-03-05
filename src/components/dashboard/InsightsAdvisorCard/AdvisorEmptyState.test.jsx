import React from 'react';

import { PLATFORM_LIGHTSPEED_REBRAND } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';

import links from '../../../common/installLinks.mjs';

import AdvisorEmptyState from './AdvisorEmptyState';

describe('<AdvisorEmptyState />', () => {
  it('Displays link with correct href', () => {
    render(<AdvisorEmptyState />);

    expect(screen.getByText('OpenShift documentation')).toHaveAttribute(
      'href',
      links.REMOTE_HEALTH_INSIGHTS,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('"platform.lightspeed-rebrand" feature flag', () => {
    it('Should show "Red Hat Lightspeed" when feature flag is enabled', () => {
      // Arrange
      mockUseFeatureGate([[PLATFORM_LIGHTSPEED_REBRAND, true]]);

      render(<AdvisorEmptyState />);

      // Act
      // Assert
      expect(screen.getByText(/Red Hat Lightspeed/)).toBeInTheDocument();
    });

    it('Should show "Red Hat Insights" when feature flag is disabled', () => {
      // Arrange
      mockUseFeatureGate([[PLATFORM_LIGHTSPEED_REBRAND, false]]);

      render(<AdvisorEmptyState />);

      // Act
      // Assert
      expect(screen.getByText(/Red Hat Insights/)).toBeInTheDocument();
    });
  });

  it('Passes accessibility check', async () => {
    const { container } = render(<AdvisorEmptyState />);
    await checkAccessibility(container);
  });
});
