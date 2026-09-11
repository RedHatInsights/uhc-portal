import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { accountsService } from '~/services';

import { formatErrorData } from '../helpers';
import { queryConstants } from '../queriesConstants';

export const refetchGetOCMRole = (awsAccountID: string) => {
  queryClient.invalidateQueries({ queryKey: [queryConstants.FETCH_GET_OCM_ROLE, awsAccountID] });
};

export const useFetchGetOCMRole = (awsAccountID: string) => {
  const { data, isError, error, isLoading, isPending, isSuccess, status } = useQuery({
    queryKey: [queryConstants.FETCH_GET_OCM_ROLE, awsAccountID],
    queryFn: async () => {
      const response = await accountsService.getOCMRole(awsAccountID);

      return response.data;
    },
    retry: false,
    enabled: !!awsAccountID,
  });

  const errorData = formatErrorData(isLoading, isError, error);

  return {
    data,
    isError,
    error: isError ? errorData.error : null,
    isPending,
    isSuccess,
    status,
  };
};
