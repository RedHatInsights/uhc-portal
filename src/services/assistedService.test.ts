import { getModule } from '@scalprum/core';

import assistedService from './assistedService';

jest.mock('@scalprum/core', () => ({
  getModule: jest.fn(),
}));

const getModuleMock = getModule as jest.Mock;

describe('assistedService', () => {
  const listBySubscriptionIdsMock = jest.fn();
  const getClusterMock = jest.fn();
  const getFeaturesSupportLevelMock = jest.fn();

  beforeEach(() => {
    getModuleMock.mockResolvedValue({
      APIs: {
        ClustersAPI: {
          listBySubscriptionIds: listBySubscriptionIdsMock,
          get: getClusterMock,
        },
      },
      NewFeatureSupportLevelsService: {
        getFeaturesSupportLevel: getFeaturesSupportLevelMock,
      },
    });
    jest.clearAllMocks();
  });

  it('loads Services and calls listBySubscriptionIds', async () => {
    const subscriptionIds = ['sub-1', 'sub-2'];
    const response = { data: [{ id: 'cluster-1' }] };
    listBySubscriptionIdsMock.mockResolvedValue(response);

    const result = await assistedService.getAIClustersBySubscription(subscriptionIds);

    expect(getModuleMock).toHaveBeenCalledWith('assistedInstallerApp', './Services', 'default');
    expect(listBySubscriptionIdsMock).toHaveBeenCalledWith(subscriptionIds);
    expect(result).toBe(response);
  });

  it('loads Services and calls get', async () => {
    const clusterID = 'cluster-1';
    const response = { data: { id: clusterID, status: 'installed' } };
    getClusterMock.mockResolvedValue(response);

    const result = await assistedService.getAICluster(clusterID);

    expect(getModuleMock).toHaveBeenCalledWith('assistedInstallerApp', './Services', 'default');
    expect(getClusterMock).toHaveBeenCalledWith(clusterID);
    expect(result).toBe(response);
  });

  it('loads Services and calls getFeaturesSupportLevel', async () => {
    const response = { features: { feature: 'enabled' } };
    getFeaturesSupportLevelMock.mockResolvedValue(response);

    const result = await assistedService.getAIFeatureSupportLevels('4.14', 'x86_64');

    expect(getModuleMock).toHaveBeenCalledWith('assistedInstallerApp', './Services', 'default');
    expect(getFeaturesSupportLevelMock).toHaveBeenCalledWith('4.14', 'x86_64');
    expect(result).toBe(response);
  });
});
