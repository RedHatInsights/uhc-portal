import { useMutation } from '@tanstack/react-query';

import { accountsService } from '~/services';

import { refetchFetchClusterTransfer } from '../ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransfer';
import { formatErrorData } from '../helpers';

export const useCreateClusterTransfer = () => {
  const { data, isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['createClusterTransfer'],
    mutationFn: ({
      clusterExternalID,
      currentOwner,
      recipient,
      recipientOrgId,
      recipientAccountId,
    }: {
      clusterExternalID: string;
      currentOwner: string;
      recipient: string;
      recipientOrgId: string | null;
      recipientAccountId: string | null;
    }) =>
      accountsService.createClusterTransfer(
        clusterExternalID,
        currentOwner,
        recipient,
        recipientOrgId,
        recipientAccountId,
      ),
    onSuccess: () => {
      refetchFetchClusterTransfer();
    },
  });

  return {
    data,
    isPending,
    isError,
    error: isError ? formatErrorData(isPending, isError, error) : error,
    mutate,
    reset,
    isSuccess,
  };
};

export const useEditClusterTransfer = () => {
  const { data, isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['editClusterTransfer'],
    mutationFn: ({ transferID, updatedStatus }: { transferID: string; updatedStatus: string }) =>
      accountsService.editClusterTransfer(transferID, { status: updatedStatus }),
    onSuccess: () => {
      refetchFetchClusterTransfer();
    },
  });

  return {
    data,
    isPending,
    isError,
    error: isError ? formatErrorData(isPending, isError, error) : error,
    mutate,
    reset,
    isSuccess,
  };
};
