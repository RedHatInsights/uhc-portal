import React from 'react';

import { mockedClusterResponse } from '~/queries/__mocks__/queryMockedData';
import { BILLING_CONTRACT_NOTIFICATION } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen, within } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import fixtures from '../../../../__tests__/ClusterDetails.fixtures';
import { OverviewBillingAccountModal } from '../OverviewBillingAccountModal';

jest.mock('~/queries/ClusterDetailsQueries/useEditCluster', () => ({
  useEditCluster: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/useFetchOrganizationQuota', () => ({
  useFetchOrganizationQuota: jest.fn().mockReturnValue({
    isLoading: false,
    isFetching: false,
    data: { organizationQuota: { items: [] } },
    refetch: jest.fn(),
  }),
}));
jest.mock('~/redux/hooks/useGlobalState', () => ({
  useGlobalState: () => ({ details: { id: 'org-123' } }),
}));

const nonContractedAccountId = '111111111111';
const contractedAccountId = '222222222222';

const mockCloudAccounts = [
  { cloud_account_id: nonContractedAccountId, cloud_provider_id: 'aws' },
  {
    cloud_account_id: contractedAccountId,
    cloud_provider_id: 'aws',
    contracts: [
      {
        dimensions: [
          { name: 'four_vcpu_hour', value: '1' },
          { name: 'control_plane', value: '1' },
        ],
      },
    ],
  },
];

const setupEditClusterMock = () => {
  const useEditClusterMock = jest.requireMock('~/queries/ClusterDetailsQueries/useEditCluster');
  useEditClusterMock.useEditCluster.mockReturnValue({
    isLoading: false,
    data: mockedClusterResponse,
    mutation: jest.fn(),
    isError: false,
    error: null,
  });
};

const setupQuotaMock = (accounts = mockCloudAccounts) => {
  const quotaMock = jest.requireMock('~/queries/ClusterDetailsQueries/useFetchOrganizationQuota');
  quotaMock.useFetchOrganizationQuota = jest.fn().mockReturnValue({
    isLoading: false,
    isFetching: false,
    data: {
      organizationQuota: {
        items: [
          {
            quota_id: 'cluster|byoc|moa|marketplace',
            cloud_accounts: accounts,
          },
        ],
      },
    },
    refetch: jest.fn(),
  });
};

describe('Overview <BillingAccountModal> Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('show correct title and content', async () => {
    setupEditClusterMock();
    render(
      <OverviewBillingAccountModal
        onClose={() => {}}
        billingAccount="123456"
        cluster={fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription}
      />,
    );

    expect(screen.queryByText('Edit AWS billing account')).toBeInTheDocument();
    expect(screen.queryByText('Connect a new AWS billing account')).toBeInTheDocument();
  });
});

describe('contract warning in billing account modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupEditClusterMock();
    setupQuotaMock();
  });

  it('shows warning when non-contracted account is selected and another account has a contract', () => {
    mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);
    render(
      <OverviewBillingAccountModal
        onClose={() => {}}
        billingAccount={nonContractedAccountId}
        cluster={fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription}
      />,
    );

    expect(screen.getByText('No contract on selected billing account')).toBeInTheDocument();
  });

  it('does not show warning when contracted account is selected', () => {
    mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);
    render(
      <OverviewBillingAccountModal
        onClose={() => {}}
        billingAccount={contractedAccountId}
        cluster={fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription}
      />,
    );

    expect(screen.queryByText('No contract on selected billing account')).not.toBeInTheDocument();
  });

  it('does not show warning when feature gate is disabled', () => {
    mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, false]]);
    render(
      <OverviewBillingAccountModal
        onClose={() => {}}
        billingAccount={nonContractedAccountId}
        cluster={fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription}
      />,
    );

    expect(screen.queryByText('No contract on selected billing account')).not.toBeInTheDocument();
  });

  it('includes the selected account ID in the warning message', () => {
    mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);
    render(
      <OverviewBillingAccountModal
        onClose={() => {}}
        billingAccount={nonContractedAccountId}
        cluster={fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription}
      />,
    );

    const alertContainer = screen
      .getByText('No contract on selected billing account')
      .closest('.pf-v6-c-alert');
    expect(
      within(alertContainer as HTMLElement).getByText(nonContractedAccountId),
    ).toBeInTheDocument();
  });

  it('does not show warning when all accounts lack contracts', () => {
    const noContractAccounts = [
      { cloud_account_id: '333333333333', cloud_provider_id: 'aws' },
      { cloud_account_id: '444444444444', cloud_provider_id: 'aws' },
    ];
    setupQuotaMock(noContractAccounts);
    mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);

    render(
      <OverviewBillingAccountModal
        onClose={() => {}}
        billingAccount="333333333333"
        cluster={fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription}
      />,
    );

    expect(screen.queryByText('No contract on selected billing account')).not.toBeInTheDocument();
  });

  it('keeps Update and Cancel buttons functional when warning is shown', () => {
    mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);
    render(
      <OverviewBillingAccountModal
        onClose={() => {}}
        billingAccount={nonContractedAccountId}
        cluster={fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription}
      />,
    );

    expect(screen.getByText('No contract on selected billing account')).toBeInTheDocument();
    expect(screen.getByTestId('Update')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
