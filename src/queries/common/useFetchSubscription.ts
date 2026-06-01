import { useQuery } from '@tanstack/react-query';

import { normalizeSubscription } from '~/common/normalize';
import { knownProducts } from '~/common/subscriptionTypes';
import { accountsService } from '~/services';
import { ClusterAuthorizationRequestProduct_id as ClusterAuthorizationRequestProductId } from '~/types/accounts_mgmt.v1';

const ROSA_PRODUCTS = [knownProducts.ROSA, knownProducts.ROSA_HyperShift];
const OSD_PRODUCTS = [knownProducts.OSD, knownProducts.OSDTrial];

/**
 * Query for fetching limited support reasons based on region
 * @param subscriptionID this ID comes from router useLocation params.id
 * @param mainQueryKey used for refetch
 * @returns subscription details and type of the cluster
 */
export const useFetchSubscription = (subscriptionID: string, mainQueryKey: string) => {
  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [mainQueryKey, 'accountsService', subscriptionID],
    queryFn: async () => {
      const subscription = await accountsService.getSubscription(subscriptionID);
      subscription.data = normalizeSubscription(subscription.data);
      const isAROCluster = subscription?.data?.plan?.type === knownProducts.ARO;
      const isROSACluster = ROSA_PRODUCTS.includes(subscription?.data?.plan?.type || '');
      const isOSDCluster = OSD_PRODUCTS.includes(
        (subscription?.data?.plan?.type || '') as ClusterAuthorizationRequestProductId,
      );
      return {
        subscription: subscription.data,
        isAROCluster,
        isROSACluster,
        isOSDCluster,
      };
    },
  });

  return {
    isLoading,
    data,
    isError,
    error,
    isFetching,
  };
};
