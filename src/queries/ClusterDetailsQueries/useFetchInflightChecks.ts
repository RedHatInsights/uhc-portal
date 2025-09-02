import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import { formatErrorData } from '../helpers';
import { queryConstants } from '../queriesConstants';
import { SubscriptionResponseType } from '../types';

export const useInvalidateFetchInflightChecks = async () => {
  await queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY],
  });
};

export const useInvalidateFetchRerunInflightChecks = async () => {
  await queryClient.invalidateQueries({ queryKey: ['fetchRerunInflightChecks'] });
};

/**
 * Query for fetching inflight checks based on region
 * @param clusterID cluster ID to pass into api call
 * @param subscription Axios response from subscription (required this way for query enablement)
 * @param mainQueryKey used for refetch
 * @returns cluster IDPs list
 */
export const useFetchInflightChecks = (
  clusterID: string,
  subscription: SubscriptionResponseType | undefined,
  region?: string,
  refetchInterval?: boolean,
  isClusterStatusMonitor?: boolean,
  clusterStatusMonitorQueryKey?: string,
) => {
  const enabledStatus = isClusterStatusMonitor
    ? !!clusterID
    : !!subscription &&
      (subscription.isROSACluster || subscription.isOSDCluster) &&
      subscription.subscription.status !== SubscriptionCommonFieldsStatus.Deprovisioned &&
      (subscription.subscription.managed || subscription.isAROCluster);

  const { isLoading, data, isError, isFetching } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      clusterStatusMonitorQueryKey,
      'inflightChecks',
      'clusterService',
      clusterID,
      subscription,
    ],
    queryFn: async () => {
      if (region) {
        const clusterService = getClusterServiceForRegion(subscription?.subscription.rh_region_id);
        const response = await clusterService.getInflightChecks(clusterID);
        return response;
      }
      const response = await clusterService.getInflightChecks(clusterID);
      return response;
    },
    refetchInterval: refetchInterval ? 5000 : undefined,
    enabled: enabledStatus,
  });
  return {
    isLoading,
    data,
    isError,
    isFetching,
  };
};

const fetchRerunInflightChecks = async (subnetIds?: string[], region?: string) => {
  if (region) {
    const clusterService = getClusterServiceForRegion(region);
    const results = subnetIds?.map((subnetId: string) =>
      clusterService.getTriggeredInflightCheckState(subnetId),
    );
    // @ts-ignore  error due to using an older compiler
    const response = await Promise.allSettled(results);
    const items = response
      .filter((res: { status: string }) => res.status !== 'rejected')
      .map((item: any) => item?.value?.data);
    return {
      data: {
        items,
        page: 0,
        total: 0,
      },
    };
  }
  const results = subnetIds?.map((subnetId: string) =>
    clusterService.getTriggeredInflightCheckState(subnetId),
  );
  // @ts-ignore  error due to using an older compiler
  const response = await Promise.allSettled(results);

  const items = response
    .filter((res: { status: string }) => res.status !== 'rejected')
    .map((item: any) => item?.value?.data);
  return {
    data: {
      items,
      page: 0,
      total: 0,
    },
  };
};

export const useFetchRerunInflightChecks = (
  subnetIds?: string[],
  region?: string,
  refetchInterval?: boolean,
) => {
  const { isLoading, data } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'fetchRerunInflightChecks',
      'clusterService',
      subnetIds,
    ],
    queryFn: () => fetchRerunInflightChecks(subnetIds, region),
    refetchInterval: refetchInterval ? 5000 : undefined,
    enabled: subnetIds && subnetIds.length > 0,
  });

  return {
    isLoading,
    data,
  };
};

export const useMutateRerunInflightChecks = (clusterID: string, region?: string) => {
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync, reset } = useMutation({
    mutationKey: ['rerunInflightChecks', 'clusterService', clusterID],
    mutationFn: async () => {
      if (region) {
        const clusterService = getClusterServiceForRegion(region);
        const response = await clusterService.rerunInflightChecks(clusterID);
        return response;
      }
      const response = await clusterService.rerunInflightChecks(clusterID);
      return response;
    },
  });

  return {
    data,
    isPending,
    isError,
    error: formatErrorData(isPending, isError, error),
    isSuccess,
    mutate,
    mutateAsync,
    reset,
  };
};
