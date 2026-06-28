import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { LogForwardingScreen } from './LogForwardingScreen';

jest.mock('./AmazonS3LogForwarding', () => ({
  AmazonS3LogForwarding: () => <div data-testid="amazon-s3-log-forwarding" />,
}));

jest.mock('./CloudWatchLogForwarding', () => ({
  CloudWatchLogForwarding: () => <div data-testid="cloudwatch-log-forwarding" />,
}));

describe('<LogForwardingScreen />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the step title, description, and child sections', () => {
    render(<LogForwardingScreen />);

    expect(
      screen.getByRole('heading', { name: 'Control plane log forwarding' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Configure log forwarding now to store and analyze your control plane logs/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Learn more/i })).toBeInTheDocument();
    expect(screen.getByTestId('amazon-s3-log-forwarding')).toBeInTheDocument();
    expect(screen.getByTestId('cloudwatch-log-forwarding')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<LogForwardingScreen />);

    await checkAccessibility(container);
  });
});
