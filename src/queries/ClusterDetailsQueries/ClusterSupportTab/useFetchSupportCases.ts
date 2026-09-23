import { useQuery } from '@tanstack/react-query';

import { queryConstants } from '~/queries/queriesConstants';
import { accountsService } from '~/services';

export const useFetchSupportCases = (subscriptionID: string, isRestricted: boolean) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'supportCases',
      'accountService',
      subscriptionID,
    ],
    queryFn: async () => {
      const response = await accountsService.getSupportCases(subscriptionID);
      return response;
    },
    enabled: !isRestricted,
    retry: false,
  });
  // TODO: not matching with SupportCasesCreatedResponse object
  const cases = (data?.data as any)?.response?.docs || [];
  return {
    supportCases: {
      subscriptionID,
      cases: cases.map((supportCase: any) => ({
        summary: supportCase.case_summary,
        caseID: supportCase.case_number,
        ownerID: supportCase.case_owner,
        severity: supportCase.case_severity,
        status: supportCase.case_status,
        lastModifiedBy: supportCase.case_lastModifiedByName,
        lastModifiedDate: supportCase.case_lastModifiedDate,
      })),
    },
    isLoading,
    isError,
    error,
    refetch,
  };
};
