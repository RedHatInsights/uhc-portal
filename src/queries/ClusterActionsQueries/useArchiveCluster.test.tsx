import * as notifications from '@redhat-cloud-services/frontend-components-notifications';

import * as clusterService from '~/services/clusterService';
import { renderHook, waitFor } from '~/testUtils';

import { useArchiveCluster } from './useArchiveCluster';

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('@redhat-cloud-services/frontend-components-notifications'),
  };
  return config;
});
// @ts-ignore
const mockGetClusterServiceForRegion = jest.spyOn(clusterService, 'getClusterServiceForRegion');
const mockedArchiveCluster = jest.fn();

describe('useArchiveCluster', () => {
  const useAddNotificationsMock = jest.spyOn(notifications, 'useAddNotification');
  const mockedAddNotification = jest.fn();
  useAddNotificationsMock.mockReturnValue(mockedAddNotification);

  mockedArchiveCluster.mockResolvedValue('hello world');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calling mutate calls archiveCluster', async () => {
    // @ts-ignore
    mockGetClusterServiceForRegion.mockReturnValue({ archiveCluster: mockedArchiveCluster });
    mockedArchiveCluster.mockResolvedValue('hello world');

    const { result } = renderHook(() => useArchiveCluster());

    result.current.mutate({
      displayName: 'myClusterName',
      subscriptionID: 'mySubscriptionId',
    });

    await waitFor(() => {
      expect(mockGetClusterServiceForRegion).toHaveBeenCalled();
    });

    expect(mockedArchiveCluster).toHaveBeenCalledWith('mySubscriptionId');
    expect(mockedAddNotification).toHaveBeenCalled();

    expect(mockedAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'success',
        title: 'Cluster myClusterName has been archived',
        dismissDelay: 8000,
        dismissable: false,
      }),
    );
  });
});
