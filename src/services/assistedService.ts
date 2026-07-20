import { getModule } from '@scalprum/core';

const getServices = () => getModule('assistedInstallerApp', './Services', 'default');

const assistedService = {
  async getAIClustersBySubscription(subscriptionIds: string[]) {
    const Services = await getServices();
    return Services.APIs.ClustersAPI.listBySubscriptionIds(subscriptionIds);
  },

  async getAICluster(clusterID: string) {
    const Services = await getServices();
    return Services.APIs.ClustersAPI.get(clusterID);
  },

  async getAIFeatureSupportLevels(openshiftVersion: string, cpuArchitecture?: string) {
    const Services = await getServices();
    return Services.NewFeatureSupportLevelsService.getFeaturesSupportLevel(
      openshiftVersion,
      cpuArchitecture,
    );
  },
};

export default assistedService;
