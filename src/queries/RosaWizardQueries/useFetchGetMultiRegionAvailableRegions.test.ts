import { AxiosResponse } from 'axios';

import { accountsService } from '~/services';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { renderHook, waitFor } from '~/testUtils';
import { ErrorState } from '~/types/types';

import { AvailableRegionalInstance } from '../types';

import { useFetchGetMultiRegionAvailableRegions } from './useFetchGetMultiRegionAvailableRegions';

const mockAvailableRegions: AvailableRegionalInstance[] = [
  {
    id: 'foo.us-east-1.stage',
    cloud_provider_id: 'aws',
  },
  {
    id: 'foo.us-west-1.stage',
    cloud_provider_id: 'gcp',
  },
];

const mockRegions = [
  {
    id: 'us-east-1',
    display_name: 'US East 1',
    enabled: true,
    supports_multi_az: true,
    kms_location_id: 'kms-1',
    ccs_only: false,
    supports_hypershift: true,
  },
  {
    id: 'us-west-1',
    display_name: 'US West 1',
    enabled: true,
    supports_multi_az: true,
    kms_location_id: 'kms-2',
    ccs_only: false,
    supports_hypershift: false,
  },
  {
    id: 'us-central-1',
    display_name: 'US Central 1',
    enabled: true,
    supports_multi_az: true,
    kms_location_id: 'kms-3',
    ccs_only: false,
    supports_hypershift: true,
  },
];

const mockError = {
  code: 500,
  operation_id: '12345',
  message: 'Network Error',
};

const errorStateMock: ErrorState = {
  pending: false,
  fulfilled: false,
  error: true,
  errorCode: mockError.code,
  errorMessage: mockError.message,
  operationID: mockError.operation_id,
};

jest.mock('~/services/clusterService', () => ({
  getClusterServiceForRegion: jest.fn(),
  getCloudProviders: jest.fn(),
}));

const getClusterServiceForRegionMock = getClusterServiceForRegion as jest.Mock;

describe('useFetchGetMultiRegionAvailableRegions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', async () => {
    const { result } = renderHook(() => useFetchGetMultiRegionAvailableRegions());

    expect(result.current.isFetching).toBe(true);
    expect(result.current).toEqual({
      data: undefined,
      isFetching: true,
      isError: false,
      error: null,
      isSuccess: false,
      isPending: true,
      isFailedRegionalizedRegions: false,
      isFailedGlobalRegions: false,
      isFailedRegionalAndGlobal: false,
    });
  });

  it('should return error state when failed to get regional instances', async () => {
    jest.spyOn(accountsService, 'getRegionalInstances').mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetchGetMultiRegionAvailableRegions());
    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current).toEqual({
      data: undefined,
      isFetching: false,
      isError: true,
      error: errorStateMock,
      isSuccess: false,
      isPending: false,
      isFailedRegionalizedRegions: false,
      isFailedGlobalRegions: true,
      isFailedRegionalAndGlobal: false,
    });
  });

  it('should return data when successfully fetched cloud providers', async () => {
    jest.spyOn(clusterService, 'getCloudProviders').mockResolvedValue({
      data: {
        items: [
          {
            id: 'aws',
            regions: mockRegions,
          },
        ],
      },
    } as Partial<AxiosResponse> as AxiosResponse);

    jest.spyOn(accountsService, 'getRegionalInstances').mockResolvedValue({
      status: 200,
      data: {
        items: mockAvailableRegions,
      },
    } as AxiosResponse);

    getClusterServiceForRegionMock.mockImplementation((region) => ({
      getCloudProviders: jest.fn().mockResolvedValue({
        data: {
          items: [
            {
              id: 'aws',
              regions: mockRegions,
            },
          ],
        },
      } as Partial<AxiosResponse> as AxiosResponse),
    }));

    const { result } = renderHook(() => useFetchGetMultiRegionAvailableRegions());
    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current).toEqual({
      data: [
        { ...mockRegions[0], is_regionalized: true },
        { ...mockRegions[2], is_regionalized: false },
      ],
      isFetching: false,
      isError: false,
      error: null,
      isSuccess: true,
      isPending: false,
      isFailedRegionalizedRegions: false,
      isFailedGlobalRegions: true,
      isFailedRegionalAndGlobal: false,
    });
  });
});
