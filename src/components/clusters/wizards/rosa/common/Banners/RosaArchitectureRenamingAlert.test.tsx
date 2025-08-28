import React from 'react';

import links from '~/common/installLinks.mjs';
import { ROSA_ARCHITECTURE_RENAMING_ALERT } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import { RosaArchitectureRenamingAlert } from './RosaArchitectureRenamingAlert';

const learnMoreLinkAddress = links.ROSA_ARCHITECTURE_RENAMING_KNOWLEDGE_BASE_ARTICLE;

describe('<RosaArchitectureRenamingAlert />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when feature flag is enabled', () => {
    // Arrange
    beforeEach(() => {
      mockUseFeatureGate([[ROSA_ARCHITECTURE_RENAMING_ALERT, true]]);
    });

    it('displays Alert title', () => {
      // Act
      render(<RosaArchitectureRenamingAlert />);

      // Assert
      expect(
        screen.getByText('Red Hat OpenShift Service on AWS (ROSA) architectures are being renamed'),
      ).toBeInTheDocument();
    });

    it('displays Alert description', () => {
      // Act
      render(<RosaArchitectureRenamingAlert />);

      // Assert
      expect(
        screen.getByText(
          'ROSA Classic architecture will be renamed to "Red Hat OpenShift Service on AWS (classic architecture)".',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'ROSA architecture with hosted control planes will be renamed to "Red Hat OpenShift Service on AWS".',
        ),
      ).toBeInTheDocument();
    });

    it('verifies learn more link', () => {
      // Act
      render(<RosaArchitectureRenamingAlert />);

      // Assert
      const learnMoreLink = screen.getByText('Learn more');

      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink).toHaveAttribute('href', learnMoreLinkAddress);
    });
  });

  describe('when feature flag is disabled', () => {
    it('is not visible', () => {
      // Arrange
      mockUseFeatureGate([[ROSA_ARCHITECTURE_RENAMING_ALERT, false]]);

      // Act
      render(<RosaArchitectureRenamingAlert />);

      // Assert
      expect(
        screen.queryByText(
          'Red Hat OpenShift Service on AWS (ROSA) architectures are being renamed',
        ),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText(
          'ROSA Classic architecture will be renamed to "Red Hat OpenShift Service on AWS (classic architecture)".',
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          'ROSA architecture with hosted control planes will be renamed to "Red Hat OpenShift Service on AWS".',
        ),
      ).not.toBeInTheDocument();

      expect(screen.queryByRole('link', { name: 'Learn more' })).not.toBeInTheDocument();
    });
  });
});
