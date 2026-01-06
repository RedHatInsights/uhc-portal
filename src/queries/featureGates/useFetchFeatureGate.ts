import { useQuery } from '@tanstack/react-query';

import { RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';
import { queryClient } from '~/components/App/queryClient';
import authorizationsService from '~/services/authorizationsService';

import Features, {
  AWS_BILLING_IN_BOUNDARY,
  EDIT_BILLING_ACCOUNT,
  HYPERSHIFT_WIZARD_FEATURE,
} from './featureConstants';

const queryKey = 'featureGate';

const featureGateQueryObj = (feature: (typeof Features)[keyof typeof Features]) => {
  const simulatedRestrictedEnv = !!localStorage.getItem(RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY);

  // When mocking a restricted environment by using the url flag
  // All feature gates in the array will use the value from the
  // api call.  All others will not be fetched and useFeatureGate will return false
  const featureGatesAllowedWhenMockingRestrictedEnvironment: string[] = [
    HYPERSHIFT_WIZARD_FEATURE,
    AWS_BILLING_IN_BOUNDARY,
    EDIT_BILLING_ACCOUNT,
  ];

  const getData =
    !simulatedRestrictedEnv ||
    (simulatedRestrictedEnv &&
      featureGatesAllowedWhenMockingRestrictedEnvironment.includes(feature));

  return {
    queryKey: [queryKey, feature],
    queryFn: async () => {
      if (!feature || !getData) {
        return { data: { enabled: false } };
      }

      const result = await authorizationsService.selfFeatureReview(feature);

      return result;
    },
    staleTime: Infinity,
    refetchOnMount: false,
  };
};

export const preFetchAllFeatureGates = async () => {
  await Promise.all(
    Object.values(Features).map((feature) =>
      queryClient.prefetchQuery(featureGateQueryObj(feature)),
    ),
  );
};

// Because stale time is set to infinity
// the stored data will be returned if known
export const useFeatureGate = (feature: (typeof Features)[keyof typeof Features]) => {
  const { data } = useQuery(featureGateQueryObj(feature));
  return data?.data ? data.data.enabled : false; // default to false while fetching value
};

// This should not normally be used
// It is included to accommodate code that cannot use hooks
export const getFeatureGate = async (feature: (typeof Features)[keyof typeof Features]) => {
  const { data } = await queryClient.fetchQuery(featureGateQueryObj(feature));
  return data?.enabled ? data.enabled : false; // default to false while fetching value
};
