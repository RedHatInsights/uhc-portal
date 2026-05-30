import { useQuery } from '@tanstack/react-query';

import accessRequestService from '~/services/accessTransparency/accessRequestService';

import { queryConstants } from '../queriesConstants';

export const useGetOrganizationalPendingRequests = (
  organizationId: string,
  isOrganizationAccessProtectionEnabled?: boolean,
  params?: { page: number; size: number },
) => {
  const queryKey = [
    queryConstants.FETCH_ACCESS_TRANSPARENCY,
    'access request',
    'pending requests',
    organizationId,
  ];
  if (params?.page) {
    queryKey.push(`${params.page}`);
  }

  if (params?.size) {
    queryKey.push(`${params.size}`);
  }

  const apiParams = {
    page: params?.page ?? 0,
    size: params?.size || 10,
    search: `organization_id='${organizationId}' and status.state='Pending'`,
  };

  const { isLoading, isPending, isFetched, refetch, data } = useQuery({
    queryKey,
    enabled: !!isOrganizationAccessProtectionEnabled && !!organizationId,
    queryFn: () => accessRequestService.getAccessRequests(apiParams),
  });

  return {
    isLoading,
    isPending,
    isFetched,
    refetch,
    total: data?.data.total,
    items: data?.data.items,
  };
};
