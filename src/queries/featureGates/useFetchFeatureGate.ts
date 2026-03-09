import { useQuery } from '@tanstack/react-query';

import { FEATURE_GATE_OVERRIDES_KEY } from '~/common/localStorageConstants';
import { queryClient } from '~/components/App/queryClient';
import authorizationsService from '~/services/authorizationsService';

import Features from './featureConstants';

const queryKey = 'featureGate';

const getFeatureGateOverride = (feature: string): boolean | null => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  const overrides = localStorage.getItem(FEATURE_GATE_OVERRIDES_KEY);
  if (overrides) {
    const parsed = JSON.parse(overrides) as Record<string, boolean>;
    if (feature in parsed) {
      return parsed[feature];
    }
  }
  return null;
};

const featureGateQueryObj = (feature: (typeof Features)[keyof typeof Features]) => ({
  queryKey: [queryKey, feature],
  queryFn: async () => {
    const override = getFeatureGateOverride(feature);
    if (override !== null) {
      return { data: { enabled: override } };
    }

    if (!feature) {
      return { data: { enabled: false } };
    }

    const result = await authorizationsService.selfFeatureReview(feature);

    return result;
  },
  staleTime: Infinity,
  refetchOnMount: false,
});

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
