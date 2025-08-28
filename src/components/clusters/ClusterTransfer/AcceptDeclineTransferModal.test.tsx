import React from 'react';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import { AcceptDeclineClusterTransferModal } from './AcceptDeclineTransferModal';

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
describe('<AcceptDeclineTransferModal />', () => {
  const defaultProps = {
    transferId: 'test-id',
    onClose: () => {},
    isOpen: true,
  };
  const mutateEdit = jest.fn();
  const editClusterTransfer = jest.fn();
  const reset = jest.fn();

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

    const { container } = render(<AcceptDeclineClusterTransferModal {...defaultProps} />);
    await checkAccessibility(container);
  });
  it('has expected button when modal is closed', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateEdit,
    });

    render(<AcceptDeclineClusterTransferModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Accept/Decline' })).toBeInTheDocument();
  });
  it('has expected buttons when modal is open', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateEdit,
    });

    render(<AcceptDeclineClusterTransferModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Accept/Decline' })).toBeInTheDocument();
    // click on button with Accept/Decline text
    await userEvent.click(screen.getByRole('button', { name: 'Accept/Decline' }));
    expect(screen.getByRole('button', { name: 'Accept Transfer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline Transfer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Accept transfer triggers error', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: fakeError,
      mutate: editClusterTransfer,
    });

    render(<AcceptDeclineClusterTransferModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Accept/Decline' }));
    await userEvent.click(screen.getByRole('button', { name: 'Accept Transfer' }));
    expect(editClusterTransfer).toHaveBeenCalled();
    expect(screen.getByText('Operation ID: Test operation ID')).toBeInTheDocument();
  });

  it('Decline transfer triggers error', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: fakeError,
      mutate: editClusterTransfer,
    });

    render(<AcceptDeclineClusterTransferModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Accept/Decline' }));
    await userEvent.click(screen.getByRole('button', { name: 'Decline Transfer' }));
    expect(editClusterTransfer).toHaveBeenCalled();
    expect(screen.getByText('Operation ID: Test operation ID')).toBeInTheDocument();
  });
  it('Accept transfer click works properly', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: editClusterTransfer,
    });

    render(<AcceptDeclineClusterTransferModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Accept/Decline' }));
    await userEvent.click(screen.getByRole('button', { name: 'Accept Transfer' }));
    expect(editClusterTransfer).toHaveBeenCalled();
  });
  it('Decline transfer click works properly', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: editClusterTransfer,
    });

    render(<AcceptDeclineClusterTransferModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Accept/Decline' }));
    await userEvent.click(screen.getByRole('button', { name: 'Decline Transfer' }));
    expect(editClusterTransfer).toHaveBeenCalled();
  });
  it('should close modal on close button click', async () => {
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateEdit,
      reset,
    });

    render(<AcceptDeclineClusterTransferModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Accept/Decline' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(reset).toHaveBeenCalled();
  });
});
