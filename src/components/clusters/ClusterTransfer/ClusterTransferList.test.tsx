import React from 'react';

import { render, screen, userEvent, withState } from '~/testUtils';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

import fixtures from '../ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';

import ClusterTransferList from './ClusterTransferList';

jest.mock(
  '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails',
  () => ({
    useFetchClusterTransferDetail: jest.fn(),
  }),
);
const emptyStateText = 'No cluster transfers found.';
const testOwner = 'testOwner';
const testRecipient = 'testRecipient';
const useFetchClusterTransferDetailMock = jest.requireMock(
  '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails',
);

describe('<ClusterTransferList />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Data is loading', async () => {
    useFetchClusterTransferDetailMock.useFetchClusterTransferDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      errors: [],
      isError: false,
    });
    render(<ClusterTransferList />);
    expect(
      screen.getByRole('progressbar', { name: 'Loading cluster transfer list data' }),
    ).toBeInTheDocument();
  });

  it('shows empty state when done loading and no clusters returned', () => {
    useFetchClusterTransferDetailMock.useFetchClusterTransferDetail.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      errors: [],
      isError: false,
    });

    render(<ClusterTransferList />);

    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByText(emptyStateText)).toBeInTheDocument();
  });

  it('shows data when cluster available', () => {
    useFetchClusterTransferDetailMock.useFetchClusterTransferDetail.mockReturnValue({
      data: {
        items: [
          {
            ...fixtures.clusterDetails.cluster,
            status: ClusterTransferStatus.Pending.toLowerCase(),
            owner: testOwner,
            name: fixtures.clusterDetails.cluster.subscription.display_name,
            version: {
              raw_id: '4.17',
            },
            recipient: testRecipient,
          },
        ],
      },
      isLoading: false,
      errors: [],
      isError: false,
    });
    const state = {
      userProfile: { keycloakProfile: { testOwner } },
    };
    withState(state).render(<ClusterTransferList />);
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeInTheDocument();

    expect(
      screen.getByText(fixtures.clusterDetails.cluster.subscription.display_name),
    ).toBeInTheDocument();
  });

  it('Accept/Decline action button shown', async () => {
    const state = {
      userProfile: { keycloakProfile: { testRecipient } },
    };
    useFetchClusterTransferDetailMock.useFetchClusterTransferDetail.mockReturnValue({
      data: {
        items: [
          {
            ...fixtures.clusterDetails.cluster,
            status: ClusterTransferStatus.Pending.toLowerCase(),
            owner: testOwner,
            name: fixtures.clusterDetails.cluster.subscription.display_name,
            version: {
              raw_id: '4.17',
            },
            recipient: testRecipient,
          },
        ],
      },
      isLoading: false,
      errors: [],
      isError: false,
    });

    withState(state).render(<ClusterTransferList />);

    expect(screen.getByRole('button', { name: 'Accept/Decline' })).toBeInTheDocument();

    await userEvent.click(screen.getByText('Accept/Decline'));
    expect(screen.getByRole('heading', { name: 'Complete cluster transfer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept Transfer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline Transfer' })).toBeInTheDocument();
  });
});
