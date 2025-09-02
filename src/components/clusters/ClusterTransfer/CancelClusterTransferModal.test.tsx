import React from 'react';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import { CancelClusterTransferModal } from './CancelClusterTransferModal';

jest.mock('~/queries/ClusterActionsQueries/useClusterTransfer', () => ({
  useEditClusterTransfer: jest.fn(),
}));
const useClusterTransferMock = jest.requireMock(
  '~/queries/ClusterActionsQueries/useClusterTransfer',
);
const useEditClusterTransferMock = useClusterTransferMock.useEditClusterTransfer;
const fakeError = {
  pending: false,
  fulfilled: false,
  error: { operationID: 'Test operation ID' },
  errorMessage: 'Test error',
  reason: 'Test reason',
  errorCode: 'Test code',
};

describe('<CancelTransferModal />', () => {
  const defaultProps = {
    transferId: 'test-id',
    onClose: () => {},
    isOpen: true,
  };
  const mutateEdit = jest.fn();
  const cancelClusterTransfer = jest.fn();

  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateEdit,
    });

    const { container } = render(<CancelClusterTransferModal {...defaultProps} />);
    await checkAccessibility(container);
  });
  it('has expected buttons when modal is closed', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateEdit,
    });

    render(<CancelClusterTransferModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
  it('has expected buttons when modal is open', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateEdit,
    });

    render(<CancelClusterTransferModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Cancel Transfer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
  it('Cancel transfer triggers error', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: fakeError,
      mutate: cancelClusterTransfer,
    });

    render(<CancelClusterTransferModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel Transfer' }));
    expect(cancelClusterTransfer).toHaveBeenCalled();
    expect(screen.getByText('Operation ID: Test operation ID')).toBeInTheDocument();
  });
});
