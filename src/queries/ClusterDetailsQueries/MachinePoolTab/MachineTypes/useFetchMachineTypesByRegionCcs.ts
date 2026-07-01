import { useQuery } from '@tanstack/react-query';

import { secretFingerprint } from '~/common/queryHelpers';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService from '~/services/clusterService';

import { mapMachineTypesItemsToResponse } from './utils';

export type UseFetchMachineTypesByRegionCcsParams = {
  region: string | undefined;
  accessKeyId: string | undefined;
  accountId: string | undefined;
  secretAccessKey: string | undefined;
  enabled: boolean;
};

/**
 * CCS POST `/aws_inquiries/machine_types` — OSD wizard BYOC AWS region-filtered machine types.
 */
export const useFetchMachineTypesByRegionCcs = ({
  region,
  accessKeyId,
  accountId,
  secretAccessKey,
  enabled,
}: UseFetchMachineTypesByRegionCcsParams) => {
  const canFetch = Boolean(region && accessKeyId && accountId && secretAccessKey && enabled);

  return useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'machineTypesByRegion',
      'ccs',
      region,
      accountId,
      accessKeyId,
      secretFingerprint(secretAccessKey),
    ],
    queryFn: async () => {
      if (!region || !accessKeyId || !accountId || !secretAccessKey) {
        throw new Error('useFetchMachineTypesByRegionCcs: missing required parameters');
      }
      const res = await clusterService.getMachineTypesByRegion(
        accessKeyId,
        accountId,
        secretAccessKey,
        region,
      );
      return mapMachineTypesItemsToResponse(res.data.items);
    },
    enabled: canFetch,
    staleTime: queryConstants.STALE_TIME_60_SEC,
    refetchOnMount: false,
    retry: false,
  });
};
