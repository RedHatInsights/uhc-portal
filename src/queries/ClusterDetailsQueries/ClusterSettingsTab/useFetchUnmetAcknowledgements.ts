import { useMutation } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import { getClusterService, getClusterServiceForRegion } from '~/services/clusterService';
import { UpgradePolicy } from '~/types/clusters_mgmt.v1';

import { refetchSchedules } from './useGetSchedules';

/* ******************************************
  This hook is used to fetch the unmet acknowledgements for a cluster using the upgrade_policies API.
  This API call is different than anything else in the code base as we include the dryRun flag
  on a POST call and the results are different:  
  1) If there are no version gates, we get a 200 success response with no data.
  2) If there are version gates, we get a 400 error response with the version gates in the error details.
  We then need to get the VersionGates from the error details and return them in the data property.
  ****************************************** */
export const useFetchUnmetAcknowledgements = (
  clusterID: string,
  isHypershift: boolean,
  region?: string,
) => {
  let hasVersionGates = false;
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationKey: ['fetchUnmetAcknowledgements', clusterID],
    mutationFn: async (schedule: UpgradePolicy) => {
      const clusterService = region ? getClusterServiceForRegion(region) : getClusterService();
      const requestPost = isHypershift
        ? clusterService.postControlPlaneUpgradeSchedule
        : clusterService.postUpgradeSchedule;

      const response = requestPost(clusterID, schedule, true); // run with dryRun=true

      return response;
    },
    onSuccess: () => {
      refetchSchedules();
    },
  });
  if (isError) {
    const formattedError = formatErrorData(isPending, isError, error);
    if (formattedError?.error?.errorDetails?.some((detail) => detail?.kind === 'VersionGate')) {
      hasVersionGates = true;
    }

    if (hasVersionGates) {
      const versionGateItems =
        formattedError?.error?.errorDetails?.filter((detail) => detail?.kind === 'VersionGate') ||
        [];
      const remainingItems =
        formattedError?.error?.errorDetails?.filter((detail) => detail?.kind !== 'VersionGate') ||
        [];

      return {
        data: versionGateItems,
        hasVersionGates,
        isPending,
        isSuccess: true,
        isError: false,
        error:
          remainingItems.length > 0
            ? { ...formattedError.error, errorDetails: remainingItems }
            : null,
        mutate,
      };
    }

    return {
      data: [],
      hasVersionGates,
      isPending,
      isSuccess,
      isError,
      error: formattedError.error,
      mutate,
    };
  }

  return {
    data: hasVersionGates ? data : [],
    isPending,
    isSuccess: hasVersionGates ? true : isSuccess,
    isError: false,
    error: hasVersionGates ? undefined : error,
    mutate,
  };
};
