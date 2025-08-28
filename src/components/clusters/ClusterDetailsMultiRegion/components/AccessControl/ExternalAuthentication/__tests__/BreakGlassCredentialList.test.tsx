import * as React from 'react';
import type axios from 'axios';

import { useCanUpdateBreakGlassCredentials } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { queryConstants } from '~/queries/queriesConstants';
import apiRequest from '~/services/apiRequest';
import { screen, withState } from '~/testUtils';

import { BreakGlassCredentialList } from '../BreakGlassCredentialList';

import { BreakGlassCreds } from './BreakGlassCredentialList.fixtures';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanUpdateBreakGlassCredentials: jest.fn(),
}));

const initialState = {
  clusters: {
    details: {
      cluster: {
        id: 'myCluster',
        subscription: {
          id: '1msoogsgTLQ4PePjrTOt3UqvMzX',
        },
      },
    },
  },
};
describe('<BreakGlassCredentialList />', () => {
  const useCanUpdateBreakGlassCredentialsMocked = useCanUpdateBreakGlassCredentials as MockedJest;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('With no permission to look at break glass credentials', () => {
    it('shows add new button as disabled', async () => {
      useCanUpdateBreakGlassCredentialsMocked.mockResolvedValue({
        isLoading: false,
        canUpdateBreakGlassCredentials: false,
        isError: false,
        error: undefined,
      });

      withState(initialState, true).render(
        <BreakGlassCredentialList
          clusterID="myCluster"
          subscriptionID="1msoogsgTLQ4PePjrTOt3UqvMzX"
        />,
      );

      expect(useCanUpdateBreakGlassCredentialsMocked).toHaveBeenCalledWith(
        initialState.clusters.details.cluster.subscription.id,
        queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      );
      expect(apiRequestMock.get).toHaveBeenCalledTimes(0);
      expect(await screen.findByRole('button', { name: /New Credentials/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
  });

  describe('With permission to look at break glass credentials, and a list of credentials available', () => {
    it('shows add new button as enabled', async () => {
      useCanUpdateBreakGlassCredentialsMocked.mockReturnValue({
        isLoading: false,
        canUpdateBreakGlassCredentials: true,
        isError: false,
        error: undefined,
      });
      apiRequestMock.get.mockResolvedValue(BreakGlassCreds);

      withState(initialState, true).render(
        <BreakGlassCredentialList
          clusterID="myCluster"
          subscriptionID="1msoogsgTLQ4PePjrTOt3UqvMzX"
        />,
      );

      expect(await screen.findByRole('button', { name: /New Credentials/i })).not.toHaveAttribute(
        'aria-disabled',
      );
      expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
      expect(apiRequestMock.get).toHaveBeenCalledWith(
        `/api/clusters_mgmt/v1/clusters/${initialState.clusters.details.cluster.id}/break_glass_credentials`,
      );
    });

    it('shows the list of the credentials', async () => {
      useCanUpdateBreakGlassCredentialsMocked.mockReturnValue({
        isLoading: false,
        canUpdateBreakGlassCredentials: true,
        isError: false,
        error: undefined,
      });
      apiRequestMock.get.mockResolvedValue(BreakGlassCreds);

      withState(initialState, true).render(
        <BreakGlassCredentialList
          clusterID="myCluster"
          subscriptionID="1msoogsgTLQ4PePjrTOt3UqvMzX"
        />,
      );

      expect(await screen.findByText('ID')).toBeInTheDocument();
      expect(await screen.findByText('Username')).toBeInTheDocument();
      expect(await screen.findByText('Expires')).toBeInTheDocument();
      expect(await screen.findByText('Status')).toBeInTheDocument();
      expect(await screen.findByText('user1')).toBeInTheDocument();
      expect(await screen.findByText('testname1')).toBeInTheDocument();
    });
  });
});
