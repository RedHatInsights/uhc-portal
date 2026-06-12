import React from 'react';

import { useDeleteLogForwarder } from '~/queries/ClusterDetailsQueries/useDeleteLogForwarder';
import { render, screen } from '~/testUtils';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

import { DeleteLogForwardingModal } from './DeleteLogForwardingModal';

const mockTrack = jest.fn();
const mockMutate = jest.fn();
const mockReset = jest.fn();
const mockOnClose = jest.fn();

jest.mock('~/hooks/useAnalytics', () => ({
  __esModule: true,
  default: () => mockTrack,
}));

jest.mock('~/queries/ClusterDetailsQueries/useDeleteLogForwarder');

const s3Forwarder: LogForwarder = {
  id: 'lf-s3-1',
  s3: { bucket_name: 'zac-test-12', bucket_prefix: 'test' },
  applications: ['api-audit'],
};

const cloudWatchForwarder: LogForwarder = {
  id: 'lf-cw-1',
  cloudwatch: {
    log_group_name: 'my-cluster-abc1',
    log_distribution_role_arn: 'arn:aws:iam::123456789012:role/forward',
  },
  applications: ['api-audit'],
};

describe('DeleteLogForwardingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDeleteLogForwarder as jest.Mock).mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: mockMutate,
      reset: mockReset,
    });
  });

  it('shows Amazon S3 delete title and body text', () => {
    render(
      <DeleteLogForwardingModal
        clusterId="cluster-1"
        destinationType="s3"
        forwarder={s3Forwarder}
        isOpen
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText('Delete Amazon S3 configuration')).toBeInTheDocument();
    expect(screen.getByText('zac-test-12', { selector: 'strong' })).toBeInTheDocument();
    expect(
      screen.getByText(/will stop the stream of cluster logs to Amazon S3/i),
    ).toBeInTheDocument();
  });

  it('shows CloudWatch delete title and body text', () => {
    render(
      <DeleteLogForwardingModal
        clusterId="cluster-1"
        destinationType="cloudwatch"
        forwarder={cloudWatchForwarder}
        isOpen
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText('Delete CloudWatch configuration')).toBeInTheDocument();
    expect(screen.getByText('my-cluster-abc1', { selector: 'strong' })).toBeInTheDocument();
    expect(
      screen.getByText(/will stop the stream of cluster logs to CloudWatch/i),
    ).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <DeleteLogForwardingModal
        clusterId="cluster-1"
        destinationType="s3"
        forwarder={s3Forwarder}
        isOpen={false}
        onClose={mockOnClose}
      />,
    );

    expect(screen.queryByText('Delete Amazon S3 configuration')).not.toBeInTheDocument();
  });

  it('closes on cancel', async () => {
    const { user } = render(
      <DeleteLogForwardingModal
        clusterId="cluster-1"
        destinationType="s3"
        forwarder={s3Forwarder}
        isOpen
        onClose={mockOnClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockReset).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls delete mutation when Delete configuration is clicked', async () => {
    const { user } = render(
      <DeleteLogForwardingModal
        clusterId="cluster-1"
        destinationType="s3"
        forwarder={s3Forwarder}
        isOpen
        onClose={mockOnClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete configuration' }));

    expect(mockMutate).toHaveBeenCalledWith(
      'lf-s3-1',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('tracks modal opened analytics event', () => {
    render(
      <DeleteLogForwardingModal
        clusterId="cluster-1"
        destinationType="s3"
        forwarder={s3Forwarder}
        isOpen
        onClose={mockOnClose}
      />,
    );

    expect(mockTrack).toHaveBeenCalledWith('Log Forwarding Delete Modal Opened', {
      destination: 's3',
    });
  });

  it('shows error message when delete fails', () => {
    (useDeleteLogForwarder as jest.Mock).mockReturnValue({
      isPending: false,
      isError: true,
      error: {
        error: {
          errorMessage: 'CLUSTERS-MGMT-400: Bad request',
          operationID: 'op-123',
        },
      },
      mutate: mockMutate,
      reset: mockReset,
    });

    render(
      <DeleteLogForwardingModal
        clusterId="cluster-1"
        destinationType="s3"
        forwarder={s3Forwarder}
        isOpen
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText(/Failed to delete Amazon S3 configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/CLUSTERS-MGMT-400: Bad request/i)).toBeInTheDocument();
  });
});
