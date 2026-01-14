import React from 'react';
import * as reactRedux from 'react-redux';

import * as notifications from '@redhat-cloud-services/frontend-components-notifications';

import { normalizedProducts } from '~/common/subscriptionTypes';
import * as clusterService from '~/services/clusterService';
import { checkAccessibility, mockUseChrome, render, screen, within } from '~/testUtils';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import clusterStates from '../../../common/clusterStates';
import fixtures from '../../__tests__/ClusterDetails.fixtures';

import ClusterDetailsTop from './ClusterDetailsTop';

const mockGetClusterServiceForRegion = jest.spyOn(clusterService, 'getClusterServiceForRegion');
const mockedGetLogs = jest.fn();

const mockNavigate = jest.fn();

mockUseChrome({ analytics: { track: () => {} } });

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('@redhat-cloud-services/frontend-components-notifications'),
  };
  return config;
});

describe('<ClusterDetailsTop />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const useAddNotificationsMock = jest.spyOn(notifications, 'useAddNotification');
  const mockedAddNotification = jest.fn();
  useAddNotificationsMock.mockReturnValue(mockedAddNotification);

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  const defaultCluster = {
    console: { url: 'https:myConsoleURL.com' },
    subscription: { status: SubscriptionCommonFieldsStatus.Active },
    canEdit: true,
    managed: true,
  };

  const props = {
    cluster: defaultCluster,
    pending: false,
    clusterIdentityProviders: {},
    organization: {},
    error: false,
    errorMessage: '',
    children: null,
    canSubscribeOCP: true,
    canTransferClusterOwnership: true,
    canHibernateCluster: true,
    autoRefreshEnabled: true,
    toggleSubscriptionReleased: jest.fn(),
    showPreviewLabel: false,
    isClusterIdentityProvidersLoading: false,
    clusterIdentityProvidersError: false,
    isRefetching: false,
    gcpOrgPolicyWarning: '',
    regionalInstance: undefined,
    openDrawer: jest.fn(),
    closeDrawer: jest.fn(),
    selectedCardTitle: undefined,
    refreshFunc: jest.fn(),
    region: undefined,
    hasNetworkOndemand: false,
  };

  it('is accessible', async () => {
    const { container } = render(<ClusterDetailsTop {...props} />);

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('should show refresh button', async () => {
    render(<ClusterDetailsTop {...props} />);

    expect(await screen.findByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('should enable open console button when cluster has console url and cluster is not uninstalling', async () => {
    render(<ClusterDetailsTop {...props} />);
    expect(await screen.findByRole('button', { name: 'Open console' })).not.toHaveAttribute(
      'aria-disabled',
    );
  });

  it('should disable open console button when console url is missing', async () => {
    const newProps = {
      ...props,
      cluster: { ...defaultCluster, console: { url: '' } },
    };

    render(<ClusterDetailsTop {...newProps} />);
    expect(await screen.findByRole('button', { name: 'Open console' })).not.toBeEnabled();
  });

  it('should disable open console button when cluster is uninstalling', async () => {
    const cluster = { ...defaultCluster, state: clusterStates.uninstalling };
    mockedGetLogs.mockResolvedValue('hello world');
    mockGetClusterServiceForRegion.mockReturnValue({ getLogs: mockedGetLogs });

    const newProps = { ...props, cluster };

    render(<ClusterDetailsTop {...newProps} />);
    expect(await screen.findByRole('button', { name: 'Open console' })).not.toBeEnabled();
  });

  it('should show error icon if an error occurred', async () => {
    const newProps = { ...props, error: true, errorMessage: 'I am an error message' };

    render(<ClusterDetailsTop {...newProps} />);

    expect(await screen.findByLabelText('Warning')).toBeInTheDocument();
  });

  it('should show error card if install or uninstall fails', async () => {
    const newProps = { ...props, cluster: { ...defaultCluster, state: 'error' } };

    render(<ClusterDetailsTop {...newProps} />);

    expect(await screen.findByText('Cluster is in an error state.')).toBeInTheDocument();
  });

  it('should show only Unarchive button if the cluster is archived', async () => {
    const cluster = {
      ...fixtures.clusterDetails.cluster,
      subscription: { status: 'Archived', id: 'fake' },
    };

    const newProps = { ...props, cluster };

    render(<ClusterDetailsTop {...newProps} />);

    const unArchiveButton = await screen.findByRole('button', { name: 'Unarchive' });

    expect(unArchiveButton).toBeInTheDocument();
    expect(unArchiveButton).toHaveClass('pf-m-secondary');
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('clicking on unarchive button bring up unarchive modal', async () => {
    const cluster = {
      ...fixtures.clusterDetails.cluster,
      subscription: { status: 'Archived', id: 'fake' },
    };

    const newProps = { ...props, cluster };
    const { user } = render(<ClusterDetailsTop {...newProps} />);

    await user.click(screen.getByRole('button', { name: 'Unarchive' }));
    expect(mockedDispatch).toHaveBeenCalled();
    const mockedCalledWith = mockedDispatch.mock.calls[0][0];

    expect(mockedCalledWith.type).toEqual('OPEN_MODAL');
    expect(mockedCalledWith.payload.name).toEqual('unarchive-cluster');
  });

  it('forwards to cluster list when uninstallation is complete', async () => {
    mockedGetLogs.mockResolvedValue('hello world');
    mockGetClusterServiceForRegion.mockReturnValue({ getLogs: mockedGetLogs });
    const cluster = { ...defaultCluster, state: 'uninstalling' };

    const newProps = { ...props, cluster };
    const { rerender } = render(<ClusterDetailsTop {...newProps} />);

    // Cluster uninstallation
    expect(await screen.findByText('Cluster uninstallation')).toBeInTheDocument();

    const endCluster = { ...cluster };
    endCluster.state = '';
    endCluster.subscription.status = 'Deprovisioned';
    const endProps = { ...props, endCluster };

    rerender(<ClusterDetailsTop {...endProps} />);
    expect(mockNavigate).toHaveBeenCalledWith('/openshift/cluster-list', undefined);

    expect(mockedAddNotification).toHaveBeenCalledWith({
      title: 'Successfully uninstalled cluster Unnamed Cluster',
      variant: 'success',
    });
  });
  describe('alerts', () => {
    it('should show expiration alert based on expiration_time', async () => {
      const { cluster } = fixtures.OSDTrialClusterDetails;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() - (365 * 2 + 1)); // should have expired 2 years ago

      const expirationTimestamp = expDate.toISOString();
      cluster.subscription.trial_end_date = '';
      cluster.subscription.billing_expiration_date = '';
      cluster.expiration_timestamp = expirationTimestamp;

      const newProps = { ...props, cluster };

      const { user } = render(<ClusterDetailsTop {...newProps} />);

      const expandBtn = screen.getByText('Alerts and recommendations');
      await user.click(expandBtn);

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(
        within(screen.getByRole('alert')).getByText('Warning alert', {
          exact: false,
        }),
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole('alert')).getByText('This cluster should have been deleted', {
          exact: false,
        }),
      ).toBeInTheDocument();
    });

    it('should show expiration alert for OSDTrial', async () => {
      const { cluster } = fixtures.OSDTrialClusterDetails;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 1); // now + 1 day
      cluster.subscription.trial_end_date = expDate.toISOString();
      cluster.subscription.billing_expiration_date = '';
      cluster.expiration_timestamp = '';

      const newProps = { ...props, cluster };

      const { user } = render(<ClusterDetailsTop {...newProps} />);

      const expandBtn = screen.getByText('Alerts and recommendations');
      await user.click(expandBtn);

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(
        within(screen.getByRole('alert')).getByText('Danger alert', {
          exact: false,
        }),
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole('alert')).getByText('This cluster will be deleted in a day', {
          exact: false,
        }),
      ).toBeInTheDocument();
    });

    it.skip('should show expiration alert for OSD RHM', async () => {
      const { cluster } = fixtures.OSDRHMClusterDetails;

      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 1); // now + 1 day
      cluster.subscription.trial_end_date = '';
      cluster.subscription.billing_expiration_date = expDate.toISOString();
      cluster.expiration_timestamp = '';

      const newProps = { ...props, cluster };

      const { user } = render(<ClusterDetailsTop {...newProps} />);

      const expandBtn = screen.getByText('Alerts and recommendations');

      await user.click(expandBtn);

      expect(
        within(screen.getByRole('alert')).getByText('Danger alert', {
          exact: false,
        }),
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole('alert')).getByText('This cluster will be deleted in a day', {
          exact: false,
        }),
      ).toBeInTheDocument();
    });

    it('should show non-editable alert for AI clusters', async () => {
      const cluster = {
        ...defaultCluster,
        ccs: { enabled: true },
        aiCluster: { id: 'myClusterId' },
        canEdit: false,
        subscription: {
          ...defaultCluster.subscription,
          plan: { id: normalizedProducts.OCP_AssistedInstall, type: normalizedProducts.OCP },
        },
      };
      const newProps = { ...props, cluster };

      const { user } = render(<ClusterDetailsTop {...newProps} />);

      const expandBtn = screen.getByText('Alerts and recommendations');
      await user.click(expandBtn);

      expect(
        within(screen.getByRole('alert')).getByText('Info alert', {
          exact: false,
        }),
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole('alert')).getByText(
          'To get permission to edit, contact the Cluster Owner or Organization Admin',
          {
            exact: false,
          },
        ),
      ).toBeInTheDocument();
    });

    it('should not show non-editable alert for non-AI clusters', async () => {
      const newProps = { ...props };

      render(<ClusterDetailsTop {...newProps} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays skeleton while pending', async () => {
      const newProps = { ...props, pending: true };

      const { container } = render(<ClusterDetailsTop {...newProps} />);

      expect(screen.queryByText('Alerts and recommendations')).not.toBeInTheDocument();
      expect(container.querySelector('.pf-v6-c-skeleton')).toBeInTheDocument();
    });

    it('displays the correct count of alerts', async () => {
      // mock osdtrial expiration, gcpOrgPolicy and reccomendedOperators alerts
      const { cluster } = fixtures.OSDTrialClusterDetails;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 1); // now + 1 day
      cluster.subscription.trial_end_date = expDate.toISOString();
      cluster.state = 'active';
      const newProps = { ...props, gcpOrgPolicyWarning: 'gcp warning', cluster };

      render(<ClusterDetailsTop {...newProps} />);

      const alertsBadge = screen.getByTestId('alerts-badge');
      expect(alertsBadge).toHaveTextContent('3');
    });
  });
});
