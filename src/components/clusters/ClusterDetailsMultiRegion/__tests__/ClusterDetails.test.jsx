import React from 'react';
import * as reactRedux from 'react-redux';
import { useParams } from 'react-router-dom';

import { MULTIREGION_PREVIEW_ENABLED } from '~/queries/featureGates/featureConstants';

import { useFetchClusterDetails } from '../../../../queries/ClusterDetailsQueries/useFetchClusterDetails';
import { useFetchClusterIdentityProviders } from '../../../../queries/ClusterDetailsQueries/useFetchClusterIdentityProviders';
import { useFetchCloudProviders } from '../../../../queries/common/useFetchCloudProviders';
import { clearGlobalError, setGlobalError } from '../../../../redux/actions/globalErrorActions';
import * as userActions from '../../../../redux/actions/userActions';
import {
  mockUseChrome,
  mockUseFeatureGate,
  render,
  screen,
  waitFor,
  withState,
} from '../../../../testUtils';
import { SubscriptionCommonFieldsStatus } from '../../../../types/accounts_mgmt.v1';
import clusterStates from '../../common/clusterStates';
import ClusterDetails from '../ClusterDetails';

import fixtures, { funcs } from './ClusterDetails.fixtures';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../../../redux/actions/userActions');

// Mock the setGlobalError action
jest.mock('../../../../redux/actions/globalErrorActions', () => ({
  setGlobalError: jest.fn(),
  clearGlobalError: jest.fn(),
}));

jest.mock('../components/Overview/ClusterVersionInfo');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Preserve other exports from react-router-dom
  useParams: jest.fn(), // Mock useParams
}));

// Mocking queries hooks, each has own unit test
jest.mock('../../../../queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  useFetchClusterDetails: jest.fn(),
  invalidateClusterDetailsQueries: jest.fn(),
}));
jest.mock('../../../../queries/common/useFetchCloudProviders', () => ({
  useFetchCloudProviders: jest.fn(),
}));
jest.mock('../../../../queries/ClusterDetailsQueries/useFetchClusterIdentityProviders', () => ({
  useFetchClusterIdentityProviders: jest.fn(),
  refetchClusterIdentityProviders: jest.fn(),
}));
mockUseChrome({ analytics: { track: () => {} } });

const initialState = {
  clusterLogs: {
    logs: {
      len: 0,
      fullfilled: true,
      error: false,
      pending: false,
      lines: '',
    },
  },
  userProfile: {
    organization: fixtures.organization,
  },
  insightsData: fixtures.insightsData,
  clusterRouters: fixtures.clusterRouters,
  modal: {
    modalName: '',
  },
  clusterSupport: {
    notificationContacts: {
      pending: false,
    },
  },
  monitoring: {},
  features: {},
  cost: {
    userAccess: {},
  },
};

const waitForRender = async () => {
  await screen.findByText('Open console');
};

const props = {
  location: {
    hash: '',
  },
  toggleSubscriptionReleased: jest.fn(),
};

describe('<ClusterDetailsMultiRegion />', () => {
  // afterEach(() => {
  //   jest.clearAllMocks();
  // });

  // TODO: By testing presentation half ClusterDetails.jsx without index.js redux connect(),
  //   we mostly got away with passing fixtures by props without setting up redux state.
  //   However many sub-components mounted by mount() and render() do connect() to redux,
  //   and will see a different picture from what the top ClusterDetails sees...

  // Fixing this would mean that initialState (defined above) would need to match what is set
  // in the fixtures file
  describe('Cluster Details', () => {
    mockUseFeatureGate([[MULTIREGION_PREVIEW_ENABLED, true]]);
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const mockedDispatch = jest.fn();
    useDispatchMock.mockReturnValue(mockedDispatch);
    const mockedUseFetchClusterDetails = useFetchClusterDetails;

    const mockedUseFetchClusterIdentityProviders = useFetchClusterIdentityProviders;
    const mockedUseFetchCloudProviders = useFetchCloudProviders;

    it('should call clearGlobalError on mount', async () => {
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });
      mockedUseFetchClusterDetails.mockReturnValue({
        isLoading: true,
        isError: false,
        cluster: undefined,
        error: null,
        isFetching: false,
      });
      mockedUseFetchClusterIdentityProviders.mockReturnValue({
        clusterIdentityProviders: undefined,
        isLoading: true,
        isError: false,
      });
      mockedUseFetchCloudProviders.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      withState(initialState, true).render(<ClusterDetails {...props} hasIssues />);

      expect(mockedDispatch).toHaveBeenCalledWith(clearGlobalError('clusterDetails'));
    });

    it('should display correct cluster info', async () => {
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });
      mockedUseFetchClusterDetails.mockReturnValue({
        cluster: fixtures.clusterDetails.cluster,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      });
      mockedUseFetchClusterIdentityProviders.mockReturnValue({
        clusterIdentityProviders: fixtures.clusterIdentityProviders,
        isLoading: false,
        isError: false,
      });
      mockedUseFetchCloudProviders.mockReturnValue({
        data: fixtures.cloudProviders.providers,
        isLoading: false,
        isError: false,
      });

      withState(initialState, true).render(<ClusterDetails {...props} />);

      userActions.getOrganizationAndQuota.mockReturnValue(fixtures.organization);

      expect(screen.getByRole('heading', { name: 'test-liza' })).toBeInTheDocument();
    });

    describe('Loading', () => {
      it('should render loading modal when pending', async () => {
        mockedUseFetchClusterDetails.mockReturnValue({
          cluster: undefined,
          isLoading: true,
          isError: false,
          error: null,
          isFetching: false,
        });
        mockedUseFetchCloudProviders.mockReturnValue({
          data: undefined,
          isLoading: true,
          isError: false,
        });
        mockedUseFetchClusterIdentityProviders.mockReturnValue({
          clusterIdentityProviders: undefined,
          isLoading: true,
          isError: false,
        });
        useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

        withState(initialState, true).render(<ClusterDetails {...props} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    describe('Error', () => {
      it('should render error message', async () => {
        mockedUseFetchClusterDetails.mockReturnValue({
          cluster: undefined,
          isLoading: false,
          isError: true,
          error: { errorCode: 500, errorMessage: 'Unavailable' },
          isFetching: false,
        });
        mockedUseFetchCloudProviders.mockReturnValue({
          data: undefined,
          isLoading: false,
          isError: true,
        });
        mockedUseFetchClusterIdentityProviders.mockReturnValue({
          clusterIdentityProviders: undefined,
          isLoading: false,
          isError: true,
        });

        render(<ClusterDetails {...props} />);

        expect(screen.getByText('This page is temporarily unavailable')).toBeInTheDocument();
      });

      it('should redirect back to cluster list and set global error on 404 error', async () => {
        const clusterErrorMock = mockedUseFetchClusterDetails.mockReturnValue({
          cluster: undefined,
          isLoading: false,
          isError: true,
          error: { errorCode: 404, errorMessage: 'This is an error message' },
          isFetching: false,
        });
        mockedUseFetchCloudProviders.mockReturnValue({
          data: undefined,
          isLoading: false,
          isError: true,
        });
        mockedUseFetchClusterIdentityProviders.mockReturnValue({
          clusterIdentityProviders: undefined,
          isLoading: false,
          isError: true,
        });

        render(<ClusterDetails {...props} />);

        expect(mockedDispatch).toHaveBeenCalledWith(
          setGlobalError(
            <>
              Cluster with subscription ID <b>1i4counta3holamvo1g5tp6n8p3a03bq</b> was not found, it
              might have been deleted or you don&apos;t have permission to see it.
            </>,
            'clusterDetails',
            `${clusterErrorMock?.errorMessage}`,
          ),
        );
      });
    });

    describe.skip('fetches all relevant resources', () => {
      const functions = funcs();
      it('should call get grants for aws cluster', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();
        expect(functions.getGrants).toHaveBeenCalledWith(fixtures.clusterDetails.cluster.id);
      });

      it('should get IDPs', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();
        expect(functions.getClusterIdentityProviders).toHaveBeenCalledWith(
          fixtures.clusterDetails.cluster.id,
        );
      });

      it('should get users', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();
        expect(functions.getUsers).toHaveBeenCalledWith(fixtures.clusterDetails.cluster.id);
      });

      it('should get cluster routers', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();

        expect(functions.getClusterRouters).toHaveBeenCalledWith(
          fixtures.clusterDetails.cluster.id,
        );
      });

      it('should get cluster addons', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();
        expect(functions.getClusterAddOns).toHaveBeenCalledWith(fixtures.clusterDetails.cluster.id);
      });

      it('should get machine pools', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();

        expect(functions.getMachineOrNodePools).toHaveBeenCalledWith(
          fixtures.clusterDetails.cluster.id,
          false,
          'openshift-v4.6.8',
          undefined,
        );
      });

      it('should get schedules', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();
        expect(functions.getSchedules).toHaveBeenCalledWith(
          fixtures.clusterDetails.cluster.id,
          false,
        );
      });

      it('should not get on-demand metrics', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();
        expect(functions.getOnDemandMetrics).toHaveBeenCalledTimes(0);
      });
    });

    it.skip('should not consider issues when cluster is installing', async () => {
      // This fails because the text "monitoring" is shown but as part of the UpgradeSettingsTab
      // What I think is the intention of this test is that the monitoring tab is not shown
      // but the actual intent is not known
      // skipping until further investigation is known
      const functions = funcs();
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });
      const installingClusterWithIssuesProps = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.clusterDetails,
          cluster: { ...fixtures.clusterDetails.cluster, state: clusterStates.installing },
        },
        hasIssues: true,
      };

      withState(initialState, true).render(
        <ClusterDetails
          {...fixtures}
          {...functions}
          hasIssues
          {...installingClusterWithIssuesProps}
        />,
      );

      await waitForRender();
      expect(screen.queryByText('Monitoring')).not.toBeInTheDocument();
    });
  });

  // TODO: Part of the Support tab work
  describe.skip('OSD cluster support tab', () => {
    const functions = funcs();

    it('should present', async () => {
      withState(initialState, true).render(<ClusterDetails {...fixtures} {...functions} />);

      await waitForRender();
      expect(screen.getByRole('tab', { name: 'Support' })).toBeInTheDocument();
    });

    it('should be hidden when the (managed) cluster has not yet reported its cluster ID to AMS', async () => {
      const props = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.clusterDetails,
          cluster: {
            ...fixtures.clusterDetails.cluster,
            managed: true,
            subscription: {
              ...fixtures.clusterDetails.cluster.subscription,
              external_cluster_id: undefined,
            },
          },
        },
      };

      withState(initialState, true).render(<ClusterDetails {...props} />);

      await waitForRender();
      expect(screen.queryByRole('tab', { name: 'Support' })).not.toBeInTheDocument();
    });
  });

  describe.skip('ARO cluster', () => {
    const functions = funcs();
    const props = {
      ...fixtures,
      ...functions,
      clusterDetails: { ...fixtures.AROClusterDetails },
    };

    it('should get on-demand metrics', async () => {
      withState(initialState, true).render(<ClusterDetails {...props} />);

      await waitForRender();

      expect(functions.getOnDemandMetrics).toHaveBeenCalledWith(
        fixtures.AROClusterDetails.cluster.subscription.id,
      );
    });

    it('it should hide 2 tabs', async () => {
      withState(initialState, true).render(<ClusterDetails {...props} />);

      await waitForRender();
      expect(screen.queryByRole('tab', { name: 'Monitoring' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });

  describe.skip('hypershift cluster', () => {
    it('should get node pools', async () => {
      const functions = funcs();
      const props = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.ROSAClusterDetails,
          cluster: {
            ...fixtures.ROSAClusterDetails.cluster,
            hypershift: { enabled: true },
          },
        },
      };
      const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
      const mockedDispatch = jest.fn();
      useDispatchMock.mockReturnValue(mockedDispatch);
      withState(initialState, true).render(<ClusterDetails {...props} />);

      await waitForRender();
      // Assuming `getMachineOrNodePools` is a function that should have been called on render
      expect(mockedDispatch).toHaveBeenCalledWith(
        fixtures.ROSAClusterDetails.cluster.id,
        true,
        'openshift-v4.6.8',
        undefined,
      );
    });

    const displayNetworkTabCases = [
      { privateLink: true, description: 'displays the network tab if private link is true' },
      { privateLink: false, description: 'displays the network tab if private link is false' },
    ];

    displayNetworkTabCases.forEach(({ privateLink, description }) => {
      it(description, async () => {
        const cluster = {
          state: clusterStates.ready,
          managed: true,
          cloud_provider: { id: 'aws' },
          ccs: { enabled: true },
          hypershift: { enabled: true },
          aws: { private_link: privateLink },
        };

        const functions = funcs();
        const props = {
          ...fixtures,
          ...functions,
          resetFiltersAndFlags: () => {},
          clusterDetails: {
            ...fixtures.ROSAClusterDetails,
            cluster: { ...fixtures.ROSAClusterDetails.cluster, cluster },
          },
        };

        withState(initialState, true).render(<ClusterDetails {...props} />);

        await waitForRender();

        expect(screen.getByRole('tab', { name: /Networking/i })).toBeInTheDocument();
      });
    });
  });

  describe.skip('gcp cluster details', () => {
    const functions = funcs();
    const props = {
      ...fixtures,
      ...functions,
      clusterDetails: {
        ...fixtures.clusterDetails,
        cluster: {
          ...fixtures.clusterDetails.cluster,
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'gcp',
            href: '/api/clusters_mgmt/v1/cloud_providers/gcp',
          },
        },
      },
    };

    it('should not call get grants for gcp cluster', () => {
      withState(initialState, true).render(<ClusterDetails {...props} />);

      expect(functions.getGrants).not.toHaveBeenCalled();
    });
  });

  describe.skip('tabs for OSDTrial clusters', () => {
    const functions = funcs();
    const props = {
      ...fixtures,
      ...functions,
      clusterDetails: {
        ...fixtures.clusterDetails,
        cluster: {
          ...fixtures.clusterDetails.cluster,
          canEdit: true,
          subscription: {
            ...fixtures.clusterDetails.cluster.subscription,
            status: SubscriptionCommonFieldsStatus.Active,
            plan: {
              id: 'OSDTrial',
              kind: 'Plan',
              href: '/api/accounts_mgmt/v1/plans/OSD',
              type: 'OSDTrial',
            },
          },
        },
      },
    };
    // hide support tab for OSDTrial clusters regardless Deprovisioned/Archived or not

    it('should hide the support tab for OSDTrial cluster', () => {
      withState(initialState, true).render(<ClusterDetails {...props} />);

      expect(screen.queryByRole('tab', { name: 'Support' })).not.toBeInTheDocument();
    });
  });

  describe.skip('tabs for Deprovisioned/Archived clusters', () => {
    const functions = funcs();
    const tabs = [
      'Monitoring',
      'Access Control',
      'Add-ons',
      'Networking',
      'Machine pools',
      'Settings',
    ];

    it('should show support tab for Deprovisioned clusters', async () => {
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });
      const functions = funcs();
      const osdProps = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.clusterDetails,
          cluster: {
            ...fixtures.clusterDetails.cluster,
            canEdit: true,
            subscription: {
              ...fixtures.clusterDetails.cluster.subscription,
              status: SubscriptionCommonFieldsStatus.Deprovisioned,
            },
          },
        },
      };
      withState(initialState, true).render(<ClusterDetails {...osdProps} />);

      expect(await screen.findByRole('tab', { name: 'Support' })).toBeInTheDocument();
    });

    it.skip('should hide tabs for Deprovisioned clusters', () => {
      // TODO need to add render for this test
      tabs.forEach((tab) => expect(screen.queryByText(tab)).toBe(null));
    });

    const ocpProps = {
      ...fixtures,
      ...functions,
      clusterDetails: {
        ...fixtures.OCPClusterDetails,
        cluster: {
          ...fixtures.OCPClusterDetails.cluster,
          canEdit: true,
          subscription: {
            ...fixtures.OCPClusterDetails.cluster.subscription,
            status: SubscriptionCommonFieldsStatus.Archived,
          },
          // together with assistedInstallerEnabled: true,
          // this set displayAddAssistedHosts to true if not Archived
          cloud_provider: {
            kind: 'CloudProvider',
            id: 'baremetal',
            href: '/api/clusters_mgmt/v1/cloud_providers/baremetal',
          },
        },
      },
    };

    it('should show support tab for Archived clusters', async () => {
      withState(initialState, true).render(<ClusterDetails {...ocpProps} />);
      // show support tab with disabled buttons (refer to Support/Support.text.jsx)
      const supportTab = await screen.findByRole('tab', { name: 'Support' });
      expect(supportTab).toBeInTheDocument();
      expect(supportTab).toHaveAttribute('aria-disabled', 'false');
    });

    it('should hide tabs for Archived clusters', async () => {
      withState(initialState, true).render(<ClusterDetails {...ocpProps} />);

      tabs.forEach(async (tab) => {
        await waitFor(() => {
          expect(screen.queryByText(tab)).not.toBeInTheDocument();
        });
      });
    });
  });
});
