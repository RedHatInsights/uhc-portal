import { useMutation } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import accessRequestService from '~/services/accessTransparency/accessRequestService';
import { AccessRequestPostRequest } from '~/types/access_transparency.v1';

export const usePostAccessRequest = () => {
  const { data, isPending, isError, error, mutate, mutateAsync, isSuccess } = useMutation({
    mutationKey: ['postAccessRequest'],
    mutationFn: async (request: AccessRequestPostRequest) => {
      const response = await accessRequestService.postAccessRequest(request);
      return response;
    },
    onSuccess: () => {
      // Invalidate access requests query to trigger refetch
      queryClient.invalidateQueries({
        queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'fetchAccessRequests'],
      });
    },
  });

  return {
    data: data?.data,
    isPending,
    isError,
    error: isError ? formatErrorData(isPending, isError, error) : error,
    mutate,
    mutateAsync,
    isSuccess,
  };
};
