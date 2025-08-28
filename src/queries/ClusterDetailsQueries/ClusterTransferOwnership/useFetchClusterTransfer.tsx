import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import { accountsService } from '~/services';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

export const refetchFetchClusterTransfer = () => {
  queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'fetchClusterTransfer'],
  });
};

export const useFetchClusterTransfer = ({
  transferID,
  clusterExternalID,
  filter,
  showPendingTransfer,
}: {
  transferID?: string;
  clusterExternalID?: string;
  filter?: string;
  showPendingTransfer?: boolean;
}) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'fetchClusterTransfer',
      filter || clusterExternalID || transferID,
    ],
    queryFn: async () => {
      if (filter) {
        return accountsService.searchClusterTransfers(filter);
      }
      if (clusterExternalID) {
        return accountsService.getClusterTransferByExternalID(clusterExternalID);
      }
      return accountsService.searchClusterTransfers(`id='${transferID}'`);
    },
    enabled: !!clusterExternalID || !!transferID || !!filter,
    refetchInterval: queryConstants.STALE_TIME_60_SEC,
  });

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: data?.data,
      isLoading,
      isError,
      error: formattedError,
    };
  }
  const pendingTransfer =
    data?.data?.items?.find(
      (transfer) =>
        transfer.cluster_uuid === clusterExternalID &&
        (transfer.status === ClusterTransferStatus.Pending.toLowerCase() ||
          transfer.status === ClusterTransferStatus.Accepted.toLowerCase()),
    ) || {};

  return {
    data: showPendingTransfer ? { items: [pendingTransfer] } : data?.data,
    isLoading,
    isError,
    error,
  };
};
