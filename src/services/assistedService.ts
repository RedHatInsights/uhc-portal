import { Services } from '@openshift-assisted/ui-lib/ocm';

const {
  APIs: { ClustersAPI },
  NewFeatureSupportLevelsService,
} = Services;

const getAIClustersBySubscription = ClustersAPI.listBySubscriptionIds;

const getAICluster = ClustersAPI.get;
const getAIFeatureSupportLevels = NewFeatureSupportLevelsService.getFeaturesSupportLevel;

const assistedService = {
  getAIClustersBySubscription,
  getAICluster,
  getAIFeatureSupportLevels,
};

export default assistedService;
