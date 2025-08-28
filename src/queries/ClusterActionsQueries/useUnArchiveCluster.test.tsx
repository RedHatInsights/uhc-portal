import * as notifications from '@redhat-cloud-services/frontend-components-notifications';

import * as clusterService from '~/services/clusterService';
import { renderHook, waitFor } from '~/testUtils';

import { useUnArchiveCluster } from './useUnArchiveCluster';

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('@redhat-cloud-services/frontend-components-notifications'),
  };
  return config;
});

// @ts-ignore
const mockGetClusterServiceForRegion = jest.spyOn(clusterService, 'getClusterServiceForRegion');
const mockedUnArchiveCluster = jest.fn();

describe('useArchiveCluster', () => {
  mockedUnArchiveCluster.mockResolvedValue('hello world');

  const useAddNotificationsMock = jest.spyOn(notifications, 'useAddNotification');
  const mockedAddNotification = jest.fn();
  useAddNotificationsMock.mockReturnValue(mockedAddNotification);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calling mutate calls archiveCluster', async () => {
    // @ts-ignore
    mockGetClusterServiceForRegion.mockReturnValue({ unarchiveCluster: mockedUnArchiveCluster });

    const { result } = renderHook(() => useUnArchiveCluster());

    result.current.mutate({
      displayName: 'myClusterName',
      subscriptionID: 'mySubscriptionId',
    });

    await waitFor(() => {
      expect(mockGetClusterServiceForRegion).toHaveBeenCalled();
    });

    expect(mockedUnArchiveCluster).toHaveBeenCalledWith('mySubscriptionId');

    expect(mockedAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'success',
        title: 'Cluster myClusterName has been unarchived',
        dismissDelay: 8000,
        dismissable: false,
      }),
    );
  });
});
