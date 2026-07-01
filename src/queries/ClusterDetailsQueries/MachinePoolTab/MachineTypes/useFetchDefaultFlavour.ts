import { useQuery } from '@tanstack/react-query';

import { queryConstants } from '~/queries/queriesConstants';
import { DEFAULT_FLAVOUR_ID } from '~/redux/actions/flavourActions';
import clusterService from '~/services/clusterService';
import { Flavour } from '~/types/clusters_mgmt.v1';

/**
 * Fetches the default OSD flavour (OCMUI-3323 — replaces Redux getDefaultFlavour for consumers that opt in).
 */
export const useFetchDefaultFlavour = () =>
  useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'defaultFlavour',
      DEFAULT_FLAVOUR_ID,
    ],
    queryFn: async (): Promise<Flavour> => {
      const res = await clusterService.getFlavour(DEFAULT_FLAVOUR_ID);
      return res.data;
    },
    staleTime: queryConstants.STALE_TIME_60_SEC,
    refetchOnMount: false,
    retry: false,
  });
