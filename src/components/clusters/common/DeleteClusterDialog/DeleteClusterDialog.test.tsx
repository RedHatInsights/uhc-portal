import React from 'react';
import * as reactRedux from 'react-redux';

import * as useDeleteCluster from '~/queries/ClusterActionsQueries/useDeleteCluster';
import { checkAccessibility, screen, withState } from '~/testUtils';

import DeleteClusterDialog from './DeleteClusterDialog';

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

const mockedUseDeleteCluster = jest.spyOn(useDeleteCluster, 'useDeleteCluster');

describe('<DeleteClusterDialog />', () => {
  const onClose = jest.fn();
  const reset = jest.fn();
  const mutate = jest.fn();
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const defaultProps = {
    onClose,
  };

  const defaultUseDeleteClusterResponse = {
    isSuccess: false,
    error: {},
    isError: false,
    isPending: false,
    mutate,
    reset,
  };

  const defaultReduxState = {
    modal: {
      data: {
        clusterID: 'mockedClusterID',
        clusterName: 'mockedClusterName',
        region: 'aws.ap-southeast-1.stage',
        shouldDisplayClusterName: false,
      },
    },
  };

  const checkForNoCalls = () => {
    expect(onClose).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    mockedUseDeleteCluster.mockReturnValue(defaultUseDeleteClusterResponse);

    const { container } = withState(defaultReduxState).render(
      <DeleteClusterDialog {...defaultProps} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('does not call onClose prop when cancelled (using cancel button)', async () => {
    mockedUseDeleteCluster.mockReturnValue(defaultUseDeleteClusterResponse);

    const { user } = withState(defaultReduxState).render(<DeleteClusterDialog {...defaultProps} />);

    checkForNoCalls();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(reset).toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not call onClose prop when cancelled (using X button)', async () => {
    mockedUseDeleteCluster.mockReturnValue(defaultUseDeleteClusterResponse);

    const { user } = withState(defaultReduxState).render(<DeleteClusterDialog {...defaultProps} />);

    checkForNoCalls();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(reset).toHaveBeenCalled();
  });

  it('enables delete button after inputting the cluster name', async () => {
    const { user } = withState(defaultReduxState).render(<DeleteClusterDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Delete' })).not.toBeEnabled();

    await user.type(screen.getByRole('textbox'), 'wrong_name');

    expect(screen.getByRole('button', { name: 'Delete' })).not.toBeEnabled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'mockedClusterName');

    expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveAttribute('aria-disabled');
  });

  it('closes the modal on success', () => {
    const newUseDeleteClusterResponse = { ...defaultUseDeleteClusterResponse, isSuccess: true };

    mockedUseDeleteCluster.mockReturnValue(newUseDeleteClusterResponse);

    checkForNoCalls();

    withState(defaultReduxState).render(<DeleteClusterDialog {...defaultProps} />);
    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(reset).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it('displays an error', () => {
    const newUseDeleteClusterResponse = {
      ...defaultUseDeleteClusterResponse,
      isError: true,
      error: { errorMessage: 'Mocked error message' },
    };

    mockedUseDeleteCluster.mockReturnValue(newUseDeleteClusterResponse);
    withState(defaultReduxState).render(<DeleteClusterDialog {...defaultProps} />);

    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByText('Mocked error message')).toBeInTheDocument();
  });

  it('displays error operation id', () => {
    const newUseDeleteClusterResponse = {
      ...defaultUseDeleteClusterResponse,
      isError: true,
      error: {
        errorMessage: 'Mocked error message',
        operationID: 'operation-id-123456789',
      },
    };

    mockedUseDeleteCluster.mockReturnValue(newUseDeleteClusterResponse);
    withState(defaultReduxState).render(<DeleteClusterDialog {...defaultProps} />);

    expect(screen.getByText(/operation-id-123456789/)).toBeInTheDocument();
  });
});
