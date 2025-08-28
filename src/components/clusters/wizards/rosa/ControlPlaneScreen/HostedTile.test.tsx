import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { hypershiftValue } from './ControlPlaneCommon';
import { HostedTile } from './HostedTile';

// fixtures
const handleChange = jest.fn((value: hypershiftValue) => {});

const defaultProps = {
  handleChange,
  isHostedDisabled: false,
  isSelected: false,
};

const defaultDisabledProps = {
  ...defaultProps,
  isHostedDisabled: true,
};

describe('<HostedTile />', () => {
  describe('when the host is enabled', () => {
    it('calls handleChange on click', async () => {
      // Arrange
      const { user } = render(<HostedTile {...defaultProps} />);

      // Act
      const tile = screen.getByText('ROSA hosted architecture');
      expect(tile).toBeInTheDocument();
      await user.click(tile);

      // Assert
      expect(defaultProps.handleChange).toHaveBeenCalledWith('true');
    });

    it('does not render the "need to enable ROSA hosted control plane" Alert', () => {
      // Arrange
      render(<HostedTile {...defaultProps} />);

      // Assert
      expect(screen.queryByText('enable ROSA hosted control plane')).not.toBeInTheDocument();
    });
  });

  describe('when the host is disabled', () => {
    beforeAll(() => {
      jest.clearAllMocks();
    });

    it('does not call handleChange', async () => {
      // Arrange
      const { user } = render(<HostedTile {...defaultDisabledProps} />);

      // Act
      const tile = screen.getByText('ROSA hosted architecture');
      expect(tile).toBeInTheDocument();
      await user.click(tile);

      // Assert
      expect(defaultProps.handleChange).not.toHaveBeenCalled();
    });

    it('renders the "need to enable ROSA hosted control plane" Alert', () => {
      // Arrange
      render(<HostedTile {...defaultDisabledProps} />);

      // Assert
      expect(screen.getByText('enable ROSA hosted control plane')).toBeInTheDocument();
    });
  });

  // TODO: Skipping accessibility test for now as it is failing and requires PF intervention.
  // "Element has focusable descendants"
  // We have an External Link inside the Tile component which is causing this issue entitled: "Learn more about Virtual Private Cloud"
  it.skip('is accessible', async () => {
    // Arrange & Act
    const { container } = render(
      <div role="listbox" aria-label="dummy-just-for-accessibility-requirements-of-PF">
        <HostedTile {...defaultProps} />
      </div>,
    );

    // Assert
    expect(screen.getByText('ROSA hosted architecture')).toBeInTheDocument();
    await checkAccessibility(container);
  });
});
