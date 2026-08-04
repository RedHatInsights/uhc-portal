import React from 'react';

import { render, screen } from '~/testUtils';

import { ClusterTabsId } from '../../common/ClusterTabIds';

import LogForwardingConfiguration from './LogForwardingConfiguration';

describe('<LogForwardingConfiguration />', () => {
  it('shows Disabled when no forwarders are configured', () => {
    render(
      <LogForwardingConfiguration
        displayUpgradeSettingsTab
        isS3Enabled={false}
        isCloudWatchEnabled={false}
      />,
    );

    expect(screen.getByTestId('controlPlaneLogForwardingDescription')).toHaveTextContent(
      'Disabled',
    );
    expect(screen.getByTestId('controlPlaneLogForwardingDescription')).not.toHaveTextContent(
      'Amazon S3:',
    );
  });

  it('shows status when at least one forwarder is configured', () => {
    render(
      <LogForwardingConfiguration
        displayUpgradeSettingsTab
        isS3Enabled
        isCloudWatchEnabled={false}
      />,
    );

    const description = screen.getByTestId('controlPlaneLogForwardingDescription');
    expect(description).toHaveTextContent('Amazon S3:');
    expect(description).toHaveTextContent('Enabled');
    expect(description).toHaveTextContent('CloudWatch:');
    expect(description).toHaveTextContent('Disabled');
  });

  it('shows View details link when displayUpgradeSettingsTab is true', () => {
    render(
      <LogForwardingConfiguration
        displayUpgradeSettingsTab
        isS3Enabled={false}
        isCloudWatchEnabled={false}
      />,
    );

    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      expect.stringContaining(`#${ClusterTabsId.UPDATE_SETTINGS}`),
    );
  });

  it('hides View details link when displayUpgradeSettingsTab is false', () => {
    render(
      <LogForwardingConfiguration
        displayUpgradeSettingsTab={false}
        isS3Enabled={false}
        isCloudWatchEnabled={false}
      />,
    );

    expect(screen.getByText('Control plane log forwarding')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View details' })).not.toBeInTheDocument();
  });
});
