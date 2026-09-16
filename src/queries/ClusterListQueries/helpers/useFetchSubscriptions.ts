import { useQuery } from '@tanstack/react-query';

import { createViewQueryObject } from '~/common/queryHelpers';
import { ROVS_REGISTRATION } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { getSubscriptionQueryType } from '~/services/accountsService';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';
import { ViewOptions } from '~/types/types';

import isAssistedInstallSubscription from '../../../common/isAssistedInstallerCluster';
import { mapListResponse, normalizeSubscription } from '../../../common/normalize';
import { accountsService } from '../../../services';

import { SubscriptionMapEntry } from './createResponseForFetchCluster';
import { createQueryKey } from './useFetchClustersHelpers';

const fetchGlobalSubscriptions = async (
  viewOptions: ViewOptions,
  userName?: string,
  isArchived?: boolean,
  includeRovs?: boolean,
) => {
  const modifiedViewOptions = {
    ...viewOptions,
    flags: { ...viewOptions.flags, showArchived: isArchived },
  };
  const params = createViewQueryObject(modifiedViewOptions, userName, { includeRovs });

  const response = await accountsService.getSubscriptions(params as getSubscriptionQueryType);
  const subscriptions = mapListResponse(response, normalizeSubscription);

  const items = subscriptions?.data?.items || [];

  const subscriptionMap = new Map<string, SubscriptionMapEntry>();

  items.forEach((item) => {
    if (item.cluster_id) {
      subscriptionMap.set(item.cluster_id, {
        subscription: item,
      });
    }
  });

  const subscriptionIds: string[] = [];

  subscriptionMap.forEach(({ subscription }) => {
    if (isAssistedInstallSubscription(subscription) && subscription.id) {
      subscriptionIds.push(subscription.id);
    }
  });

  const managedSubscriptions = items.filter(
    (subscription) =>
      subscription.managed && subscription.status !== SubscriptionCommonFieldsStatus.Deprovisioned,
  );

  return {
    subscriptionIds,
    subscriptionMap,
    managedSubscriptions,
    page: subscriptions?.data?.page || 0,
    total: subscriptions?.data?.total || items?.length || 0, // Setting total to items.length if total is 0 is temp fix until OCM-12366 is resolved
  };
};

export const useFetchSubscriptions = ({
  enabled = true,
  viewOptions,
  userName,
  isArchived,
}: {
  enabled?: boolean;
  viewOptions: ViewOptions;
  userName?: string;
  isArchived?: boolean;
}) => {
  const isRovsRegistrationEnabled = useFeatureGate(ROVS_REGISTRATION);
  const queryKey = createQueryKey({
    type: 'subscriptions',
    viewOptions,
    isArchived,
    other: isRovsRegistrationEnabled ? ['rovs'] : undefined,
  });

  const { data, isLoading, isFetching, isFetched, isError, error } = useQuery({
    queryKey,
    enabled,
    queryFn: () =>
      fetchGlobalSubscriptions(viewOptions, userName, isArchived, isRovsRegistrationEnabled),
  });

  return {
    data,
    isLoading,
    isFetching,
    isFetched,
    isError,
    error,
  };
};
