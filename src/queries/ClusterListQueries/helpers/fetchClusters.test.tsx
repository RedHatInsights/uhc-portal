import assistedService from '~/services/assistedService';
import * as clusterService from '~/services/clusterService';
import { Subscription } from '~/types/accounts_mgmt.v1';

import { fetchAIClusters, fetchManagedClusters } from './fetchClusters';

describe('fetchGlobalClusters', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockedSubscription = { cluster_id: 'my_cluster_id_1' } as Subscription;

  describe('fetchManagedClusters', () => {
    const mockGetClusterServiceForRegion = jest.spyOn(clusterService, 'getClusterServiceForRegion');
    const mockedSearchClusters = jest.fn();

    it('calls getClusterServiceForRegion with undefined if region is global', () => {
      // @ts-ignore
      mockGetClusterServiceForRegion.mockReturnValue({ searchClusters: mockedSearchClusters });
      fetchManagedClusters([mockedSubscription], 'global');
      expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith(undefined);
    });

    it('calls getClusterServiceForRegion with undefined if region is not known', () => {
      // @ts-ignore
      mockGetClusterServiceForRegion.mockReturnValue({ searchClusters: mockedSearchClusters });
      fetchManagedClusters([mockedSubscription], undefined);
      expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith(undefined);
    });

    it('calls getClusterServiceForRegion with region if region is known', () => {
      // @ts-ignore
      mockGetClusterServiceForRegion.mockReturnValue({ searchClusters: mockedSearchClusters });
      fetchManagedClusters([mockedSubscription], 'myRegion');
      expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith('myRegion');
    });

    it('calls searchClusters service with expected search query ', () => {
      const mockedSubscriptions = [
        { ...mockedSubscription, cluster_id: 'my_cluster_id_1' },
        { ...mockedSubscription, cluster_id: 'my_cluster_id_2' },
        { ...mockedSubscription, cluster_id: 'my_cluster_id_3' },
      ];

      // @ts-ignore
      mockGetClusterServiceForRegion.mockReturnValue({ searchClusters: mockedSearchClusters });
      fetchManagedClusters(mockedSubscriptions, 'global');
      expect(mockedSearchClusters).toHaveBeenCalledWith(
        "id in ('my_cluster_id_1','my_cluster_id_2','my_cluster_id_3')",
      );
    });

    it('returns data is expected format', async () => {
      const mockedClusters = ['cluster_1', 'cluster_2', 'cluster_3'];

      mockedSearchClusters.mockReturnValue({
        data: { items: mockedClusters },
      });
      const mockedSubscriptions = [
        { ...mockedSubscription, cluster_id: 'my_cluster_id_1' },
        { ...mockedSubscription, cluster_id: 'my_cluster_id_2' },
        { ...mockedSubscription, cluster_id: 'my_cluster_id_3' },
      ];

      // @ts-ignore
      mockGetClusterServiceForRegion.mockReturnValue({ searchClusters: mockedSearchClusters });
      const result = await fetchManagedClusters(mockedSubscriptions, 'global');
      expect(result).toEqual({ managedClusters: mockedClusters });
    });

    it('returns empty array if no subscriptions are passed as props', async () => {
      const mockedClusters = ['cluster_1', 'cluster_2', 'cluster_3'];

      // NOTE - the code should not make the request, so this will not be returned
      mockedSearchClusters.mockReturnValue({
        data: { items: mockedClusters },
      });
      const mockedSubscriptions = [] as Subscription[];

      // @ts-ignore
      mockGetClusterServiceForRegion.mockReturnValue({ searchClusters: mockedSearchClusters });
      const result = await fetchManagedClusters(mockedSubscriptions, 'global');
      expect(result).toEqual({ managedClusters: [] });
    });

    it('returns an error if API call fails', async () => {
      const errorMessage = 'API call failed';
      const mockError = new Error(errorMessage);

      mockedSearchClusters.mockRejectedValueOnce(mockError);

      const mockedSubscriptions = [{ ...mockedSubscription, cluster_id: 'my_cluster_id_1' }];

      // @ts-ignore
      mockGetClusterServiceForRegion.mockReturnValue({ searchClusters: mockedSearchClusters });

      await expect(fetchManagedClusters(mockedSubscriptions, 'global')).rejects.toThrow(
        errorMessage,
      );
      expect(mockedSearchClusters).toHaveBeenCalled();
    });
  });

  describe('fetchAIClusters', () => {
    const mockedGetAIClustersBySubscription = jest.spyOn(
      assistedService,
      'getAIClustersBySubscription',
    );

    it('calls getAIClustersBySubscription service with expected params ', () => {
      const subscriptionIds = ['subscription_id_1', 'subscription_id_2', 'subscription_id_3'];

      // @ts-ignore
      mockedGetAIClustersBySubscription.mockResolvedValue({ data: [] });

      fetchAIClusters(subscriptionIds);
      expect(mockedGetAIClustersBySubscription).toHaveBeenCalledWith(subscriptionIds);
    });

    it('returns empty array if no subscriptions are passed as props', async () => {
      // The could should not make an API call so this is never returned
      // @ts-ignore
      mockedGetAIClustersBySubscription.mockResolvedValue({ data: ['hello_world'] });

      const result = await fetchAIClusters([]);
      expect(result).toEqual({ aiClusters: [] });
    });

    it('returns data is expected format', async () => {
      const subscriptionIds = ['subscription_id_1', 'subscription_id_2', 'subscription_id_3'];
      const mockedClusters = ['cluster_1', 'cluster_2', 'cluster_3'];

      // @ts-ignore
      mockedGetAIClustersBySubscription.mockResolvedValue({ data: mockedClusters });

      const result = await fetchAIClusters(subscriptionIds);
      expect(result).toEqual({ aiClusters: mockedClusters });
    });
  });
});
