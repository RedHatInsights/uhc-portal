import React from 'react';

import { PLATFORM_LIGHTSPEED_REBRAND } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import GovCloudForm from './GovCloudForm';

describe('<GovCloudForm />', () => {
  const props = {
    title: 'Test GovCloud Form',
    onSubmitSuccess: jest.fn(),
    hasGovEmail: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('"platform.lightspeed-rebrand" feature flag', () => {
    it('Should show "Red Hat Lightspeed" when feature flag is enabled', () => {
      // Arrange
      mockUseFeatureGate([[PLATFORM_LIGHTSPEED_REBRAND, true]]);

      render(<GovCloudForm {...props} />);

      // Act
      // Assert
      expect(screen.getByText(/Red Hat Lightspeed/)).toBeInTheDocument();
    });

    it('Should show "Red Hat Insights" when feature flag is disabled', () => {
      // Arrange
      mockUseFeatureGate([[PLATFORM_LIGHTSPEED_REBRAND, false]]);

      render(<GovCloudForm {...props} />);

      // Act
      // Assert
      expect(screen.getByText(/Red Hat Insights/)).toBeInTheDocument();
    });
  });
});
