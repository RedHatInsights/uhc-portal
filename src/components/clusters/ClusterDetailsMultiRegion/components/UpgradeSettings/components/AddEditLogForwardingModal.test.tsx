import React from 'react';

import { mockLogForwardingGroupTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { useCreateLogForwarder } from '~/queries/ClusterDetailsQueries/useCreateLogForwarder';
import { useEditLogForwarder } from '~/queries/ClusterDetailsQueries/useEditLogForwarder';
import { render, screen } from '~/testUtils';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

import { AddEditLogForwardingModal } from './AddEditLogForwardingModal';

const mockTrack = jest.fn();
const mockPostMutate = jest.fn();
const mockPostReset = jest.fn();
const mockPatchMutate = jest.fn();
const mockPatchReset = jest.fn();
const mockOnClose = jest.fn();

jest.mock('~/hooks/useAnalytics', () => ({
  __esModule: true,
  default: () => mockTrack,
}));

jest.mock('~/queries/ClusterDetailsQueries/useCreateLogForwarder');
jest.mock('~/queries/ClusterDetailsQueries/useEditLogForwarder');

jest.mock('./ClusterLogForwardingGroupsApplicationsSelector', () => ({
  ClusterLogForwardingGroupsApplicationsSelector: () => null,
}));

jest.mock('./LogForwardingCloudWatchFormFields', () => ({
  LogForwardingCloudWatchFormFields: ({ showPrerequisites }: { showPrerequisites?: boolean }) => (
    <div
      data-testid="cloudwatch-form-fields"
      data-show-prerequisites={showPrerequisites ? 'true' : 'false'}
    />
  ),
}));

const s3Forwarder: LogForwarder = {
  id: 'lf-s3-1',
  s3: { bucket_name: 'my-bucket', bucket_prefix: 'logs/' },
  groups: [{ id: 'api' }],
};

const cloudWatchForwarder: LogForwarder = {
  id: 'lf-cw-1',
  cloudwatch: {
    log_group_name: '/aws/rosa/my-group',
    log_distribution_role_arn: 'arn:aws:iam::123456789012:role/forward',
  },
  groups: [{ id: 'api' }],
};

const defaultProps = {
  clusterId: 'cluster-1',
  region: 'us-east-1',
  catalogTree: mockLogForwardingGroupTree,
  clusterName: 'my-cluster',
  isOpen: true,
  onClose: mockOnClose,
};

describe('AddEditLogForwardingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateLogForwarder as jest.Mock).mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: mockPostMutate,
      reset: mockPostReset,
    });
    (useEditLogForwarder as jest.Mock).mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: mockPatchMutate,
      reset: mockPatchReset,
    });
  });

  it('renders add Amazon S3 modal with form fields', () => {
    render(<AddEditLogForwardingModal {...defaultProps} destinationType="s3" mode="add" />);

    expect(screen.getByText('Add Amazon S3 configuration')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /bucket name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('disables Add until the user changes the form', () => {
    render(<AddEditLogForwardingModal {...defaultProps} destinationType="s3" mode="add" />);

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('keeps Add disabled when the form has validation errors', async () => {
    const { user } = render(
      <AddEditLogForwardingModal {...defaultProps} destinationType="s3" mode="add" />,
    );

    await user.type(screen.getByRole('textbox', { name: /bucket name/i }), 'a');

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('shows validation errors as the user enters invalid data', async () => {
    const { user } = render(
      <AddEditLogForwardingModal {...defaultProps} destinationType="s3" mode="add" />,
    );

    await user.type(screen.getByRole('textbox', { name: /bucket name/i }), 'a');
    await user.tab();

    expect(
      screen.getByText('Bucket name must be between 3 and 63 characters.'),
    ).toBeInTheDocument();
    expect(mockPostMutate).not.toHaveBeenCalled();
  });

  it('disables Save when the edit form has not changed', () => {
    render(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="edit"
        forwarder={s3Forwarder}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renders add CloudWatch modal with prerequisites', () => {
    render(<AddEditLogForwardingModal {...defaultProps} destinationType="cloudwatch" mode="add" />);

    expect(screen.getByText('Add CloudWatch configuration')).toBeInTheDocument();
    expect(screen.getByTestId('cloudwatch-form-fields')).toHaveAttribute(
      'data-show-prerequisites',
      'true',
    );
  });

  it('renders edit CloudWatch modal without prerequisites', () => {
    render(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="cloudwatch"
        mode="edit"
        forwarder={cloudWatchForwarder}
      />,
    );

    expect(screen.getByText('Edit CloudWatch configuration')).toBeInTheDocument();
    expect(screen.getByTestId('cloudwatch-form-fields')).toHaveAttribute(
      'data-show-prerequisites',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="add"
        isOpen={false}
      />,
    );

    expect(screen.queryByText('Add Amazon S3 configuration')).not.toBeInTheDocument();
  });

  it('closes on cancel and resets mutations', async () => {
    const { user } = render(
      <AddEditLogForwardingModal {...defaultProps} destinationType="s3" mode="add" />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockPostReset).toHaveBeenCalled();
    expect(mockPatchReset).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('tracks modal opened analytics event', () => {
    render(<AddEditLogForwardingModal {...defaultProps} destinationType="cloudwatch" mode="add" />);

    expect(mockTrack).toHaveBeenCalledWith('Log Forwarding Edit Modal Opened', {
      destination: 'cloudwatch',
      mode: 'add',
    });
  });

  it('shows error message when save fails', async () => {
    const mutationError = {
      error: {
        errorMessage: 'CLUSTERS-MGMT-400: Invalid request',
        operationID: 'op-456',
      },
    };

    (useEditLogForwarder as jest.Mock).mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: (_body: unknown, { onError }: { onError: () => void }) => {
        onError();
        (useEditLogForwarder as jest.Mock).mockReturnValue({
          isPending: false,
          isError: true,
          error: mutationError,
          mutate: mockPatchMutate,
          reset: mockPatchReset,
        });
      },
      reset: mockPatchReset,
    });

    const { user, rerender } = render(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="edit"
        forwarder={s3Forwarder}
      />,
    );

    await user.clear(screen.getByRole('textbox', { name: /bucket name/i }));
    await user.type(screen.getByRole('textbox', { name: /bucket name/i }), 'updated-bucket');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    rerender(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="edit"
        forwarder={s3Forwarder}
      />,
    );

    expect(
      screen.getByText(/A problem occurred while updating the configuration/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/CLUSTERS-MGMT-400: Invalid request/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });

  it('allows retrying submit after an API error without changing form values', async () => {
    const mutationError = {
      error: {
        errorMessage: 'CLUSTERS-MGMT-400: Invalid request',
        operationID: 'op-456',
      },
    };

    const mutateWithError = jest.fn((_body: unknown, { onError }: { onError: () => void }) => {
      onError();
    });

    (useEditLogForwarder as jest.Mock).mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: mutateWithError,
      reset: mockPatchReset,
    });

    const { user, rerender } = render(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="edit"
        forwarder={s3Forwarder}
      />,
    );

    await user.clear(screen.getByRole('textbox', { name: /bucket name/i }));
    await user.type(screen.getByRole('textbox', { name: /bucket name/i }), 'updated-bucket');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    (useEditLogForwarder as jest.Mock).mockReturnValue({
      isPending: false,
      isError: true,
      error: mutationError,
      mutate: mutateWithError,
      reset: mockPatchReset,
    });
    rerender(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="edit"
        forwarder={s3Forwarder}
      />,
    );

    expect(mutateWithError).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(mutateWithError).toHaveBeenCalledTimes(2);
  });

  it('closes on cancel after a submit error', async () => {
    const mutationError = {
      error: {
        errorMessage: 'CLUSTERS-MGMT-400: Invalid request',
        operationID: 'op-456',
      },
    };

    (useEditLogForwarder as jest.Mock).mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: (_body: unknown, { onError }: { onError: () => void }) => {
        onError();
        (useEditLogForwarder as jest.Mock).mockReturnValue({
          isPending: false,
          isError: true,
          error: mutationError,
          mutate: mockPatchMutate,
          reset: mockPatchReset,
        });
      },
      reset: mockPatchReset,
    });

    const { user, rerender } = render(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="edit"
        forwarder={s3Forwarder}
      />,
    );

    await user.clear(screen.getByRole('textbox', { name: /bucket name/i }));
    await user.type(screen.getByRole('textbox', { name: /bucket name/i }), 'updated-bucket');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    rerender(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="edit"
        forwarder={s3Forwarder}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockPostReset).toHaveBeenCalled();
    expect(mockPatchReset).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls patch mutation when saving an edit', async () => {
    const { user } = render(
      <AddEditLogForwardingModal
        {...defaultProps}
        destinationType="s3"
        mode="edit"
        forwarder={s3Forwarder}
      />,
    );

    await user.clear(screen.getByRole('textbox', { name: /bucket name/i }));
    await user.type(screen.getByRole('textbox', { name: /bucket name/i }), 'updated-bucket');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockPatchMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        logForwarderID: 'lf-s3-1',
        body: expect.objectContaining({
          s3: expect.objectContaining({ bucket_name: 'updated-bucket' }),
        }),
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });
});
