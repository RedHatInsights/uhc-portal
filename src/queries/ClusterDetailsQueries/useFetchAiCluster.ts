import axios from 'axios';

import * as Sentry from '@sentry/browser';
import { useQuery } from '@tanstack/react-query';

import isAssistedInstallSubscription from '~/common/isAssistedInstallerCluster';
import { fakeClusterFromAISubscription, fakeClusterFromSubscription } from '~/common/normalize';
import { assistedService } from '~/services';
import { Subscription } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

/**
 * Function to get Assisted Installer cluster details or return fake cluster
 * @param clusterID subscription ID to pass into api call
 * @param subscription used for invalidation of the query (refetch)
 * @returns AI cluster details or fake cluster assembled from subscription
 */
const getAIClusterDetails = async (clusterID: string, subscription: Subscription) => {
  let cluster: AugmentedCluster;
  if (isAssistedInstallSubscription(subscription) && clusterID) {
    try {
      const aiCluster = await assistedService.getAICluster(clusterID);
      cluster = fakeClusterFromAISubscription(subscription, aiCluster?.data || null);
      cluster.aiCluster = aiCluster.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        // The cluster is garbage collected or the user does not have privileges
        // eslint-disable-next-line no-console
        console.info('Failed to query assisted-installer cluster id: ', clusterID);
        cluster = fakeClusterFromSubscription(subscription);
      } else {
        throw e;
      }
    }
    try {
      const featureSupportLevels = await assistedService.getAIFeatureSupportLevels(
        cluster.openshift_version || '',
        cluster.cpu_architecture,
      );
      cluster.aiSupportLevels = featureSupportLevels;
    } catch (e) {
      Sentry.captureException(
        new Error(
          `Failed to query feature support levels: ${
            axios.isAxiosError(e) ? JSON.stringify(e.response?.data) : ''
          }`,
        ),
      );
    }
  } else {
    cluster = fakeClusterFromSubscription(subscription);
  }
  return cluster;
};

/**
 * Query responsible for fetching actions and permissions
 * @param subscriptionID subscription ID to pass into api call
 * @param mainQueryKey used for invalidation of the query (refetch)
 * @param subscriptionStatus status of the subscription for query enablement
 * @returns cloud providers array
 */
export const useFetchAiCluster = (
  clusterID: string,
  mainQueryKey: string,
  subscription?: Subscription | undefined,
) => {
  const { isLoading, data, isError } = useQuery({
    queryKey: [mainQueryKey, 'aiClusterDetails', clusterID],
    queryFn: async () => {
      const response = await getAIClusterDetails(clusterID, subscription as Subscription);
      return response;
    },
    enabled: !!subscription,
  });

  return { isLoading, data, isError };
};
