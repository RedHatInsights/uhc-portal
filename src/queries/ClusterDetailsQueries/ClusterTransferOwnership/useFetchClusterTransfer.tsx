import { useDispatch } from 'react-redux';

import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import { onSetTotal } from '~/redux/actions/viewOptionsActions';
import { viewConstants } from '~/redux/constants';
import { useGlobalState } from '~/redux/hooks';
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
  const viewType = viewConstants.CLUSTER_TRANSFER_VIEW;
  const viewOptions = useGlobalState((state) => state.viewOptions[viewType]);

  const dispatch = useDispatch();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'fetchClusterTransfer',
      filter || clusterExternalID || transferID,
      viewOptions,
    ],
    queryFn: async () => {
      if (clusterExternalID) {
        return accountsService.getClusterTransferByExternalID(clusterExternalID);
      }

      const response = await accountsService.searchClusterTransfers({
        filter: filter || `id='${transferID}'`,
        page: viewOptions.currentPage || 1,
        size: viewOptions.pageSize || 20,
        orderBy: viewOptions.sorting.sortField
          ? `${viewOptions.sorting.sortField} ${viewOptions.sorting.isAscending ? 'asc' : 'desc'}`
          : 'updated_at desc',
      });

      if (response?.data?.total !== viewOptions.totalCount) {
        dispatch(onSetTotal(response.data.total, viewType));
      }

      return response;
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
