import { queryClient } from '~/components/App/queryClient';
// import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import { ClusterTransfer } from '~/types/accounts_mgmt.v1';
import { ClusterState } from '~/types/clusters_mgmt.v1/enums';
import { ClusterFromSubscription } from '~/types/types';

import { useFetchClusterByExternalId } from '../useFetchClusterByExternalId';

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
    data: clusterData,
    isLoading: isLoadingClusterData,
    isError: isErrorClusterData,
    error: errorClusterData,
  } = useFetchClusterByExternalId(externalIds);

  const clusterTransferDetails: ClusterTransferDetail[] = [];
  dataTransfers?.items?.forEach((transfer: ClusterTransferDetail) => {
    const transferDetails: ClusterTransferDetail = {
      ...transfer,
      name: transfer.cluster_uuid,
      version: { raw_id: 'Unknown' },
      product: { id: 'Unknown' },
    };
    const cluster = clusterData?.find(
      (cluster: Partial<ClusterFromSubscription>) => cluster.external_id === transfer.cluster_uuid,
    );

    if (cluster) {
      transferDetails.name =
        cluster?.subscription?.display_name || cluster?.name || transfer.cluster_uuid;
      transferDetails.state = cluster?.state || ClusterState.unknown;
      transferDetails.subscription = cluster?.subscription;
      transferDetails.product = cluster?.product || { id: 'Unknown' };
      transferDetails.version = cluster?.version || { raw_id: 'Unknown' };

      clusterTransferDetails.push(transferDetails);
    } else if (transfer.recipient_external_org_id && username !== transfer.owner) {
      // This logic is to temporarily reduce the amount of deleted clusters shown on the list
      // We will not have to deal with this after OCM-14646 is fixed
      // but we will have to handle interOrg transfers
      clusterTransferDetails.push(transferDetails);
    }
  });

  if (isErrorTransfers || isErrorClusterData) {
    // const formattedError = formatErrorData(isLoadingTransfers, isErrorTransfers, errorTransfers);
    return {
      data: dataTransfers,
      isLoading: isLoadingTransfers || isLoadingClusterData,
      isError: isErrorTransfers || isErrorClusterData,
      error: errorTransfers || errorClusterData,
    };
  }
  return {
    data: { items: clusterTransferDetails },
    isLoading: isLoadingTransfers || isLoadingClusterData,
    isError: isErrorTransfers || isErrorClusterData,
    error: errorTransfers || errorClusterData,
  };
};
