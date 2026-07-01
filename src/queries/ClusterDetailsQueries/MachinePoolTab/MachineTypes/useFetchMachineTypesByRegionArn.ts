import { useQuery } from '@tanstack/react-query';

import { queryConstants } from '~/queries/queriesConstants';
import clusterService from '~/services/clusterService';

import { mapMachineTypesItemsToResponse } from './utils';

export type UseFetchMachineTypesByRegionArnParams = {
  installerRoleArn: string | undefined;
  region: string | undefined;
  availabilityZones: string[] | undefined;
  enabled: boolean;
};

/**
 * ROSA install wizard: POST machine types by installer role ARN + region + AZs (same API as Redux `getMachineTypesByRegionARN`).
 */
export const useFetchMachineTypesByRegionArn = ({
  installerRoleArn,
  region,
  availabilityZones,
  enabled,
}: UseFetchMachineTypesByRegionArnParams) => {
  const azKey = availabilityZones === undefined ? '' : [...availabilityZones].sort().join('|');

  const canFetch = Boolean(installerRoleArn && region && enabled);

  return useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'machineTypesByRegion',
      'arn',
      installerRoleArn,
      region,
      azKey,
    ],
    queryFn: async () => {
      if (!installerRoleArn || !region) {
        throw new Error('useFetchMachineTypesByRegionArn: missing required parameters');
      }
      const res = await clusterService.getMachineTypesByRegionARN(
        installerRoleArn,
        region,
        availabilityZones,
      );
      return mapMachineTypesItemsToResponse(res.data.items);
    },
    enabled: canFetch,
    staleTime: queryConstants.STALE_TIME_60_SEC,
    refetchOnMount: false,
    retry: false,
  });
};
