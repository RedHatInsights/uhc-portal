import React from 'react';
import * as reactRedux from 'react-redux';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING } from '~/components/clusters/common/GcpOcp5UnsupportedWarning/GcpOcp5UnsupportedWarning';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import {
  checkAccessibility,
  mockUseFeatureGate,
  render,
  screen,
  waitFor,
  withState,
} from '~/testUtils';
import { Organization } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import { useFetchClusterDetails } from '../../../../../queries/ClusterDetailsQueries/useFetchClusterDetails';
import fixtures from '../../../ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';

import UpgradeWizard from './UpgradeWizard';

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

jest.mock('~/queries/featureGates/useFetchFeatureGate', () => ({
  useFeatureGate: jest.fn(() => false),
}));

jest.mock('../../../../../queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  useFetchClusterDetails: jest.fn(),
  invalidateClusterDetailsQueries: jest.fn(),
}));

interface InitialState {
  modal: {
    data: {
      clusterName: string;
      subscriptionID: string;
    };
  };
}

interface ClusterDetailsResponse {
  isLoading: boolean;
  isSuccess?: boolean;
  cluster?: AugmentedCluster;
  isError?: boolean;
  error?: Error | null;
  isFetching: boolean;
}

describe('<UpgradeWizard />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);
  const mockedUseFetchClusterDetails = useFetchClusterDetails as jest.Mock;

  const initialState: InitialState = {
    modal: {
      data: {
        clusterName: 'myClusterName',
        subscriptionID: 'mySubscriptionId',
      },
    },
  };

  const defaultClusterDetailsResponse: ClusterDetailsResponse = {
    isLoading: false,
    isSuccess: true,
    cluster: fixtures.clusterDetails.cluster as unknown as AugmentedCluster,
    isError: false,
    error: null,
    isFetching: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    mockedUseFetchClusterDetails.mockReturnValue(defaultClusterDetailsResponse);
    const { container } = render(<UpgradeWizard />);

    await checkAccessibility(container);
  });

  it('displays spinner when loading', async () => {
    mockedUseFetchClusterDetails.mockReturnValue({
      isLoading: true,
      isSuccess: undefined,
      cluster: undefined,
    });

    withState(initialState, true).render(<UpgradeWizard />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays the cluster name', async () => {
    mockedUseFetchClusterDetails.mockReturnValue(defaultClusterDetailsResponse);

    withState(initialState, true).render(<UpgradeWizard />);

    expect(screen.getByText('myClusterName')).toBeInTheDocument();
  });

  it('calls close modal when cancelling', async () => {
    mockedUseFetchClusterDetails.mockReturnValue(defaultClusterDetailsResponse);

    const { user } = withState(initialState, true).render(<UpgradeWizard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    expect(mockedDispatch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
  });

  it('Next is disabled when no version is selected', async () => {
    mockedUseFetchClusterDetails.mockReturnValue(defaultClusterDetailsResponse);

    withState(initialState, true).render(<UpgradeWizard />);

    const nextButton = screen.getByRole('button', { name: 'Next' });

    await waitFor(() => {
      expect(nextButton).toBeInTheDocument();
    });

    expect(nextButton).toBeDisabled();
  });

  it('displays the appropriate steps', async () => {
    mockedUseFetchClusterDetails.mockReturnValue(defaultClusterDetailsResponse);

    withState(initialState, true).render(<UpgradeWizard />);

    expect(screen.getByRole('button', { name: 'Select version' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Schedule update' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmation' })).toBeInTheDocument();
  });

  describe('UpgradeToV5Warning', () => {
    const osdAwsCluster = {
      ...fixtures.clusterDetails.cluster,
      subscription: {
        ...fixtures.clusterDetails.cluster.subscription,
        id: 'mySubscriptionId',
      },
    };

    it('does not render when the OCP5_SUPPORT feature flag is off', () => {
      mockUseFeatureGate([[OCP5_SUPPORT, false]]);
      mockedUseFetchClusterDetails.mockReturnValue({
        ...defaultClusterDetailsResponse,
        cluster: osdAwsCluster,
      });

      withState(initialState, true).render(<UpgradeWizard />);

      expect(screen.queryByTestId('classic-upgrade-to-v5-warning')).not.toBeInTheDocument();
    });

    it('renders in the Select version step when the OCP5_SUPPORT feature flag is on', () => {
      mockUseFeatureGate([[OCP5_SUPPORT, true]]);
      mockedUseFetchClusterDetails.mockReturnValue({
        ...defaultClusterDetailsResponse,
        cluster: osdAwsCluster,
      });

      withState(initialState, true).render(<UpgradeWizard />);

      expect(screen.getByTestId('classic-upgrade-to-v5-warning')).toBeInTheDocument();
      expect(screen.getByText('create a ROSA HCP cluster', { exact: false })).toBeInTheDocument();
    });
  });

  describe('GcpOcp5UnsupportedWarning', () => {
    const gcpSubscription = {
      ...fixtures.clusterDetails.cluster.subscription,
      id: 'mySubscriptionId',
      cloud_provider_id: 'gcp',
      plan: { type: 'OSD' },
    };

    const gcpServiceAccountCluster = {
      ...fixtures.clusterDetails.cluster,
      cloud_provider: { id: 'gcp' },
      product: { id: 'OSD' },
      ccs: { enabled: true },
      gcp: {},
      subscription: gcpSubscription,
    };

    const gcpRedHatAccountCluster = {
      ...fixtures.clusterDetails.cluster,
      cloud_provider: { id: 'gcp' },
      product: { id: 'OSD' },
      ccs: { enabled: false },
      subscription: gcpSubscription,
    };

    const gcpWifCluster = {
      ...fixtures.clusterDetails.cluster,
      cloud_provider: { id: 'gcp' },
      product: { id: 'OSD' },
      ccs: { enabled: true },
      gcp: { authentication: { kind: 'WifConfig', id: 'wif-config-id' } },
      subscription: gcpSubscription,
    };

    const renderWizard = (
      cluster:
        | typeof gcpServiceAccountCluster
        | typeof gcpRedHatAccountCluster
        | typeof gcpWifCluster,
      organization?: Organization,
    ) => {
      mockUseFeatureGate([[OCP5_SUPPORT, true]]);
      mockedUseFetchClusterDetails.mockReturnValue({
        ...defaultClusterDetailsResponse,
        cluster,
      });

      return withState({
        ...initialState,
        userProfile: {
          organization: {
            details: organization,
          },
        },
      }).render(<UpgradeWizard />);
    };

    it('renders in the Select version step for a GCP service account cluster when ocmui-ocp5-support is on', () => {
      renderWizard(gcpServiceAccountCluster);

      expect(screen.getByText(GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING)).toBeInTheDocument();
    });

    it('renders in the Select version step for a GCP Red Hat cloud account cluster when ocmui-ocp5-support is on', () => {
      renderWizard(gcpRedHatAccountCluster);

      expect(screen.getByText(GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING)).toBeInTheDocument();
    });

    it('does not render for a GCP Workload Identity Federation cluster', () => {
      renderWizard(gcpWifCluster);

      expect(screen.queryByText(GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING)).not.toBeInTheDocument();
    });

    it('does not render when ocmui-ocp5-support is off', () => {
      mockUseFeatureGate([[OCP5_SUPPORT, false]]);
      mockedUseFetchClusterDetails.mockReturnValue({
        ...defaultClusterDetailsResponse,
        cluster: gcpServiceAccountCluster,
      });

      withState(initialState, true).render(<UpgradeWizard />);

      expect(screen.queryByText(GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING)).not.toBeInTheDocument();
    });

    it('does not render when the organization has rosa_osd_allow_ocp_5 set to "true"', () => {
      renderWizard(gcpServiceAccountCluster, {
        capabilities: [
          { name: subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5, value: 'true', inherited: false },
        ],
      } as Organization);

      expect(screen.queryByText(GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING)).not.toBeInTheDocument();
    });
  });
});
