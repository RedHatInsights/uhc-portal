import React from 'react';

import { ALLOW_EUS_CHANNEL, EDIT_BILLING_ACCOUNT } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import fixtures from '../../../../__tests__/ClusterDetails.fixtures';
import { OverviewBillingAccount } from '../OverviewBillingAccount';

jest.mock('~/queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  useFetchClusterDetails: jest.fn(),
}));

describe('Overview BillingAccount Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureGate([[EDIT_BILLING_ACCOUNT, true]]);
  });

  it('Returns static billing account value', async () => {
    const useParamsMock = jest.requireMock('react-router-dom').useParams;
    useParamsMock.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

    const useFetchClusterDetailsMock = jest.requireMock(
      '~/queries/ClusterDetailsQueries/useFetchClusterDetails',
    );
    useFetchClusterDetailsMock.useFetchClusterDetails.mockReturnValue({
      cluster: {
        ...fixtures.clusterDetails.cluster,
        aws: {
          billing_account_id: '123456',
        },
        hypershift: {
          enabled: false,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    render(<OverviewBillingAccount />);
    expect(await screen.findByText('123456')).toBeInTheDocument();
  });

  it('Returns modal link to edit billing account', async () => {
    const useParamsMock = jest.requireMock('react-router-dom').useParams;
    useParamsMock.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });
    mockUseFeatureGate([
      [ALLOW_EUS_CHANNEL, true],
      [EDIT_BILLING_ACCOUNT, true],
    ]);

    const useFetchClusterDetailsMock = jest.requireMock(
      '~/queries/ClusterDetailsQueries/useFetchClusterDetails',
    );
    useFetchClusterDetailsMock.useFetchClusterDetails.mockReturnValue({
      cluster: {
        ...fixtures.clusterDetails.cluster,
        aws: {
          billing_account_id: '123456',
        },
        hypershift: {
          enabled: true,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    render(<OverviewBillingAccount />);
    expect(
      await screen.findByRole('button', { name: /Edit billing account/i }),
    ).toBeInTheDocument();
  });

  it('Returns billing account value when cluster not set but subscription is', async () => {
    const useParamsMock = jest.requireMock('react-router-dom').useParams;
    useParamsMock.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

    const useFetchClusterDetailsMock = jest.requireMock(
      '~/queries/ClusterDetailsQueries/useFetchClusterDetails',
    );
    useFetchClusterDetailsMock.useFetchClusterDetails.mockReturnValue({
      cluster: {
        ...fixtures.clusterDetails.cluster,
        subscription: {
          billing_marketplace_account: '123456',
        },
        hypershift: {
          enabled: false,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    render(<OverviewBillingAccount />);
    expect(await screen.findByText('123456')).toBeInTheDocument();
  });

  it('hides edit button when EDIT_BILLING_ACCOUNT feature flag is disabled (FedRAMP)', async () => {
    const useParamsMock = jest.requireMock('react-router-dom').useParams;
    useParamsMock.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });
    mockUseFeatureGate([[EDIT_BILLING_ACCOUNT, false]]);

    const useFetchClusterDetailsMock = jest.requireMock(
      '~/queries/ClusterDetailsQueries/useFetchClusterDetails',
    );
    useFetchClusterDetailsMock.useFetchClusterDetails.mockReturnValue({
      cluster: {
        ...fixtures.clusterDetails.cluster,
        canEdit: true,
        aws: {
          billing_account_id: '123456',
        },
        hypershift: {
          enabled: true,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    render(<OverviewBillingAccount />);
    expect(await screen.findByText('123456')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit billing account/i })).not.toBeInTheDocument();
  });
});
