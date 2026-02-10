import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ACM_HUB_PROPERTY_KEY, ACM_HUB_PROPERTY_VALUE } from '~/common/acmHubConstants';
import { getClusterServiceForRegion } from '~/services/clusterService';
import { queryConstants } from '../queriesConstants';
import { formatErrorData } from '../helpers';

type TagAcmHubParams = {
  clusterID: string;
  region?: string;
  tag: boolean;
};

export const useTagAcmHub = () => {
  const queryClient = useQueryClient();

  const { isSuccess, error, isError, isPending, mutate, mutateAsync, reset } = useMutation({
    mutationKey: ['clusterService', 'tagAcmHub'],
    mutationFn: ({ clusterID, region, tag }: TagAcmHubParams) => {
      const clusterService = getClusterServiceForRegion(region);

      const properties: { [key: string]: string } = {};
      if (tag) {
        properties[ACM_HUB_PROPERTY_KEY] = ACM_HUB_PROPERTY_VALUE;
      } else {
        // To remove a property, set it to empty string
        properties[ACM_HUB_PROPERTY_KEY] = '';
      }

      return clusterService.editCluster(clusterID, { properties });
    },
    onSuccess: () => {
      // Invalidate cluster queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [queryConstants.FETCH_CLUSTERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['clusterDetails'] });
    },
  });

  return {
    isSuccess,
    error: isError && error ? formatErrorData(isPending, isError, error)?.error : null,
    isError,
    isPending,
    mutate,
    mutateAsync,
    reset,
  };
};
