import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import authorizationsService from '~/services/authorizationsService';

import Features from './featureConstants';

const queryKey = 'featureGate';

const featureGateQueryObj = (feature: (typeof Features)[keyof typeof Features]) => ({
  queryKey: [queryKey, feature],
  queryFn: async () => {
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
