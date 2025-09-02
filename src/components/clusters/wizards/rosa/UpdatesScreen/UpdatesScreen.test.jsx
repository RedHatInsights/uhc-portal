import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import UpgradeSettingsFields from '../common/Upgrades/UpgradeSettingsFields';

import UpdateScreen from './UpdatesScreen';

jest.mock('../common/Upgrades/UpgradeSettingsFields');
UpgradeSettingsFields.mockImplementation(() => <div>UpgradeSettingsFields</div>);

describe('<UpdateScreen />', () => {
  it('renders component with all expected text', async () => {
    // Arrange
    // Act
    render(<UpdateScreen />);

    // Assert
    expect(screen.getByText('Cluster update strategy')).toBeInTheDocument();
    expect(screen.getByText('UpgradeSettingsFields')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    // Arrange
    // Act
    const { container } = render(<UpdateScreen />);

    // Assert
    await checkAccessibility(container);
  });
});
