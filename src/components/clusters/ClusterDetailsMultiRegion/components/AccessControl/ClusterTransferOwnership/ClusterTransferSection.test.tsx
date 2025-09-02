import React from 'react';

import { AUTO_CLUSTER_TRANSFER_OWNERSHIP } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';
import { Subscription } from '~/types/accounts_mgmt.v1';

import fixtures from '../../../__tests__/ClusterDetails.fixtures';

import { ClusterTransferSection } from './ClusterTransferSection';

jest.mock(
  '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransfer',
  () => ({
    useFetchClusterTransfer: jest.fn(),
  }),
);

// eslint-disable-next-line camelcase
const testSubscription = {
  ...fixtures.clusterDetails.cluster.subscription,
  managed: true,
};
describe('Cluster Transfer Section Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureGate([[AUTO_CLUSTER_TRANSFER_OWNERSHIP, true]]);
  });

  it('Returns transfer details and cancel transfer button if transfer is in process', async () => {
    const useFetchClusterTransferMock = jest.requireMock(
      '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransfer',
    );
    useFetchClusterTransferMock.useFetchClusterTransfer.mockReturnValue({
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

    render(
      <ClusterTransferSection
        clusterExternalID="external-cluster-id"
        subscription={testSubscription as unknown as Subscription}
        canEdit
      />,
    );
    expect(await screen.findByText('Transfer details')).toBeInTheDocument();
    expect(await screen.findByText('Cancel transfer')).toBeInTheDocument();
  });

  it('Returns initiate transfer button if no transfer in progress', async () => {
    const useFetchClusterTransferMock = jest.requireMock(
      '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransfer',
    );
    useFetchClusterTransferMock.useFetchClusterTransfer.mockReturnValue({
      data: {
        items: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    render(
      <ClusterTransferSection
        clusterExternalID="external-cluster-id"
        subscription={testSubscription as unknown as Subscription}
        canEdit
      />,
    );
    expect(await screen.findByText('Initiate transfer')).toBeInTheDocument();
  });
});
