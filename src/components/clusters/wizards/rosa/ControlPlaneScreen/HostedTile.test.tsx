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
      await user.click(screen.getByLabelText('ROSA hosted architecture'));

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
      await user.click(screen.getByLabelText('ROSA hosted architecture'));

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

  it('is accessible', async () => {
    // Arrange & Act
    const { container } = render(<HostedTile {...defaultProps} />);

    // Assert
    expect(screen.getByText('ROSA hosted architecture')).toBeInTheDocument();
    await checkAccessibility(container);
  });
});
