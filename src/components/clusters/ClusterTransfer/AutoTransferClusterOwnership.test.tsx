import React from 'react';
import * as reactRedux from 'react-redux';

import getClusterName from '~/common/getClusterName';
import { screen, withState } from '~/testUtils';

import AutoTransferClusterOwnershipForm from './AutoTransferClusterOwnershipForm';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

jest.mock('~/common/getClusterName', () => jest.fn());
jest.mock(
  '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransfer',
  () => ({ useFetchClusterTransfer: jest.fn() }),
);
jest.mock('~/queries/ClusterActionsQueries/useClusterTransfer', () => ({
  useCreateClusterTransfer: jest.fn(),
  useEditClusterTransfer: jest.fn(),
}));
const useClusterTransferMock = jest.requireMock(
  '~/queries/ClusterActionsQueries/useClusterTransfer',
);
const useFetchClusterTransferMock = jest.requireMock(
  '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransfer',
);
const useEditClusterTransferMock = useClusterTransferMock.useEditClusterTransfer;
const useCreateClusterTransferMock = useClusterTransferMock.useCreateClusterTransfer;
const useFetchTransferMock = useFetchClusterTransferMock.useFetchClusterTransfer;

const getClusterNameMock = getClusterName as jest.Mock;

const username = 'testuser';
const initialState = {
  userProfile: { keycloakProfile: { username } },
  modal: {
    data: {
      subscription: {
        display_name: 'my_cluster_name',
        cluster_billing_model: 'standard',
        plan: { id: 'OSD' },
        external_cluster_id: 'external-cluster-id',
        creator: { username },
      },
      id: 'test-id',
    },
  },
};
const noInitialState = {
  userProfile: { keycloakProfile: { username } },
  modal: {
    data: {},
  },
};

describe('<AutoTransferClusterOwnershipForm />', () => {
  const onClose = jest.fn();
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  const mutateCreate = jest.fn();
  const mutateEdit = jest.fn();
  const reset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatchMock.mockReturnValue(mockedDispatch);
    useCreateClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateCreate,
      isSuccess: true,
      data: undefined,
      reset,
    });
    useEditClusterTransferMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateEdit,
    });
  });

  it('should show modal for initiating transfer', async () => {
    useFetchTransferMock.mockReturnValue({
      data: {
        items: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    getClusterNameMock.mockReturnValue('test');

    withState(initialState).render(<AutoTransferClusterOwnershipForm onClose={onClose} />);

    expect(await screen.findByText('Transfer ownership of test')).toBeInTheDocument();
  });

  it('should show form for transferring cluster and initiate button should be disabled', async () => {
    useFetchTransferMock.mockReturnValue({
      data: {
        items: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    withState(initialState).render(<AutoTransferClusterOwnershipForm onClose={onClose} />);

    // Assert
    expect(await screen.findByText('Username')).toBeInTheDocument();
    expect(await screen.findByText('Account ID')).toBeInTheDocument();
    expect(await screen.findByText('Organization ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Initiate transfer' })).toBeDisabled();
  });

  it('should show waiting for cluster external id', async () => {
    useFetchTransferMock.mockReturnValue({
      data: {
        items: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    withState(noInitialState).render(<AutoTransferClusterOwnershipForm onClose={onClose} />);

    // Assert
    expect(await screen.findByText(/Transfer ownership will be available/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Initiate transfer' })).toBeDisabled();
  });

  it('should show transfer details and cancel button should be disabled', async () => {
    getClusterNameMock.mockReturnValue('test');

    useFetchTransferMock.mockReturnValue({
      data: {
        items: [
          {
            cluster_uuid: 'external-cluster-id',
            status: 'pending',
            id: '123',
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    withState(initialState).render(<AutoTransferClusterOwnershipForm onClose={onClose} />);

    // Assert
    expect(await screen.findByText('Transfer in progress for test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel transfer' })).toBeDisabled();
  });
});
