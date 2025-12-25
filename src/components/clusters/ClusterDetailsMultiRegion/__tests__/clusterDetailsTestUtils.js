import { useFetchAccessProtection } from '../../../../queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessProtection';
import { useFetchPendingAccessRequests } from '../../../../queries/ClusterDetailsQueries/AccessRequestTab/useFetchPendingAccessRequests';
import { useAddNotificationContact } from '../../../../queries/ClusterDetailsQueries/ClusterSupportTab/useAddNotificationContact';
import { useFetchClusterDetails } from '../../../../queries/ClusterDetailsQueries/useFetchClusterDetails';
import { useFetchClusterIdentityProviders } from '../../../../queries/ClusterDetailsQueries/useFetchClusterIdentityProviders';
import { useFetchGCPWifConfig } from '../../../../queries/ClusterDetailsQueries/useFetchGCPWifConfig';
import { useFetchCloudProviders } from '../../../../queries/common/useFetchCloudProviders';
import { useFetchGetAvailableRegionalInstances } from '../../../../queries/RosaWizardQueries/useFetchGetAvailableRegionalInstances';

import fixtures from './ClusterDetails.fixtures';

/**
 * Sets up default hook mocks for ClusterDetails component tests.
 * This reduces duplication across multiple describe blocks by capturing
 * hook references internally rather than requiring them as parameters.
 *
 * @param {Object} cluster - Optional cluster object to use for the mock.
 *                           Defaults to fixtures.clusterDetails.cluster
 */
export const setupDefaultHookMocks = (cluster = fixtures.clusterDetails.cluster) => {
  useFetchClusterDetails.mockReturnValue({
    cluster,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
  });

  useFetchClusterIdentityProviders.mockReturnValue({
    clusterIdentityProviders: fixtures.clusterIdentityProviders,
    isLoading: false,
    isError: false,
  });

  useFetchCloudProviders.mockReturnValue({
    data: fixtures.cloudProviders.providers,
    isLoading: false,
    isError: false,
  });

  useFetchAccessProtection.mockReturnValue({
    data: { enabled: false },
    isLoading: false,
  });

  useFetchGCPWifConfig.mockReturnValue({
    data: undefined,
    isLoading: false,
    isSuccess: false,
  });

  useFetchPendingAccessRequests.mockReturnValue({
    data: undefined,
  });

  useFetchGetAvailableRegionalInstances.mockReturnValue({
    data: undefined,
  });

  useAddNotificationContact.mockReturnValue({
    mutate: jest.fn(),
    isSuccess: false,
    isPending: false,
    error: null,
    status: 'idle',
  });
};
