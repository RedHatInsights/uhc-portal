import React from 'react';

import { PLATFORM_LIGHTSPEED_REBRAND } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';

import links from '../../../common/installLinks.mjs';

import InfoPopover from './InfoPopover';

describe('<InfoPopover />', () => {
  it('Displays link with correct href', async () => {
    // Arrange
    mockUseFeatureGate([[PLATFORM_LIGHTSPEED_REBRAND, true]]);

    const { user } = render(<InfoPopover />);

    // Act
    const infoButton = screen.getByLabelText('Learn more about Red Hat Lightspeed');
    await user.click(infoButton);

    // Assert
    expect(screen.getByText('OpenShift documentation')).toHaveAttribute(
      'href',
      links.REMOTE_HEALTH_INSIGHTS,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('"platform.lightspeed-rebrand" feature flag', () => {
    it('Should show "Red Hat Lightspeed" when feature flag is enabled', async () => {
      // Arrange
      mockUseFeatureGate([[PLATFORM_LIGHTSPEED_REBRAND, true]]);

      const { user } = render(<InfoPopover />);

      // Act
      const infoButton = screen.getByLabelText('Learn more about Red Hat Lightspeed');
      await user.click(infoButton);

      // Assert
      const infoElement = screen.getByLabelText('What is Red Hat Lightspeed?');
      expect(infoElement).toBeInTheDocument();

      expect(
        screen.getByText(/Red Hat Lightspeed identifies and prioritizes risks to security/),
      ).toBeInTheDocument();

      expect(screen.getByText(/For further details about Red Hat Lightspeed/)).toBeInTheDocument();
    });

    it('Should show "Insights" when feature flag is disabled', async () => {
      // Arrange
      mockUseFeatureGate([[PLATFORM_LIGHTSPEED_REBRAND, false]]);

      const { user } = render(<InfoPopover />);

      // Act
      const infoButton = screen.getByLabelText('Learn more about Insights');
      await user.click(infoButton);

      // Assert
      const infoElement = screen.getByLabelText('What is Insights?');
      expect(infoElement).toBeInTheDocument();

      expect(
        screen.getByText(/Insights identifies and prioritizes risks to security/),
      ).toBeInTheDocument();
      expect(screen.getByText(/For further details about Insights/)).toBeInTheDocument();
    });
  });

  it('Passes accessibility check', async () => {
    const { container } = render(<InfoPopover />);
    await checkAccessibility(container);
  });
});
