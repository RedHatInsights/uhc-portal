import { normalizeProductID } from '~/common/normalize';
import { queryClient } from '~/components/App/queryClient';
// import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import {
  ClusterTransfer,
  Subscription,
  SubscriptionCommonFieldsStatus,
} from '~/types/accounts_mgmt.v1';
import { ClusterState } from '~/types/clusters_mgmt.v1/enums';
import { ClusterFromSubscription } from '~/types/types';

import { useFetchSubscriptionsByExternalId } from '../useFetchSubscriptionsByExternalId';

import { useFetchClusterTransfer } from './useFetchClusterTransfer';

export const refetchClusterTransferDetail = () => {
  queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'fetchClusterTransfer'],
  });
};

export type ClusterTransferDetail = ClusterTransfer & Partial<ClusterFromSubscription>;

export const useFetchClusterTransferDetail = ({
  filter,
  username,
}: {
  filter?: string;
  username?: string;
}) => {
  const generatedFilter = username ? `recipient='${username}' OR owner='${username}'` : filter;

  const {
    data: dataTransfers,
    isLoading: isLoadingTransfers,
    isError: isErrorTransfers,
    error: errorTransfers,
  } = useFetchClusterTransfer({ filter: generatedFilter });

  const externalIds =
    dataTransfers?.items?.map((transfer) => `'${transfer.cluster_uuid}'`).join(',') || '';
  const {
    data: subscriptionData,
    isLoading: isLoadingSubscriptionData,
    isError: isErrorSubscriptionData,
    error: errorSubscriptionData,
  } = useFetchSubscriptionsByExternalId(externalIds);

  const clusterTransferDetails: ClusterTransferDetail[] =
    dataTransfers?.items?.map((transfer: ClusterTransferDetail) => {
      const subscription = subscriptionData?.items?.find(
        (sub: Subscription) => sub.external_cluster_id === transfer.cluster_uuid,
      );

      if (!subscription) {
        return {
          ...transfer,
          name: transfer.cluster_uuid,
          version: { raw_id: 'Unknown' },
          product: { id: 'Unknown' },
        };
      }

      const version =
        subscription.status === SubscriptionCommonFieldsStatus.Deprovisioned
          ? 'Deleted'
          : subscription.metrics?.[0]?.openshift_version || 'Unknown';

      return {
        ...transfer,
        name: subscription.display_name || transfer.cluster_uuid,
        state: ClusterState.unknown,
        subscription,
        product: {
          id: normalizeProductID(subscription.plan?.type ?? subscription.plan?.id),
        },
        version: {
          raw_id: version,
        },
      };
    }) ?? [];

  if (isErrorTransfers || isErrorSubscriptionData) {
    // const formattedError = formatErrorData(isLoadingTransfers, isErrorTransfers, errorTransfers);
    return {
      data: dataTransfers,
      isLoading: isLoadingTransfers || isLoadingSubscriptionData,
      isError: isErrorTransfers || isErrorSubscriptionData,
      error: errorTransfers || errorSubscriptionData,
    };
  }
  return {
    data: { items: clusterTransferDetails },
    isLoading: isLoadingTransfers || isLoadingSubscriptionData,
    isError: isErrorTransfers || isErrorSubscriptionData,
    error: errorTransfers || errorSubscriptionData,
  };
};
