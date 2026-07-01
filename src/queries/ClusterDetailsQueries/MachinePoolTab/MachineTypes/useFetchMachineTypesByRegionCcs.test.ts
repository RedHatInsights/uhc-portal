import { renderHook, waitFor } from '~/testUtils';
import { MachineType } from '~/types/clusters_mgmt.v1';

import {
  useFetchMachineTypesByRegionCcs,
  type UseFetchMachineTypesByRegionCcsParams,
} from './useFetchMachineTypesByRegionCcs';
import { mapMachineTypesItemsToResponse } from './utils';

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    getMachineTypesByRegion: jest.fn(),
  },
}));

type MachineTypesByRegionMock = jest.Mock<
  Promise<{ data: { items?: MachineType[] } }>,
  [string, string, string, string]
>;

const mockGetMachineTypesByRegion = jest.requireMock<{
  default: { getMachineTypesByRegion: MachineTypesByRegionMock };
}>('~/services/clusterService').default.getMachineTypesByRegion;

const machineTypeItems = [
  { id: 'm5.xlarge', cloud_provider: { id: 'aws' } },
] satisfies MachineType[];

const validParams: UseFetchMachineTypesByRegionCcsParams = {
  region: 'us-east-1',
  accessKeyId: 'AKIAEXAMPLE',
  accountId: '123456789012',
  secretAccessKey: 'secret-key',
  enabled: true,
};

const missingParamCases: [string, Partial<UseFetchMachineTypesByRegionCcsParams>][] = [
  ['region', { region: undefined }],
  ['accessKeyId', { accessKeyId: undefined }],
  ['accountId', { accountId: undefined }],
  ['secretAccessKey', { secretAccessKey: undefined }],
];

describe('useFetchMachineTypesByRegionCcs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches region machine types when all parameters are present and enabled', async () => {
    mockGetMachineTypesByRegion.mockResolvedValueOnce({ data: { items: machineTypeItems } });

    const { result } = renderHook(() => useFetchMachineTypesByRegionCcs(validParams));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMachineTypesByRegion).toHaveBeenCalledWith(
      validParams.accessKeyId,
      validParams.accountId,
      validParams.secretAccessKey,
      validParams.region,
    );
    expect(result.current.data).toEqual(mapMachineTypesItemsToResponse(machineTypeItems));
  });

  it('does not fetch when enabled is false', async () => {
    const { result } = renderHook(() =>
      useFetchMachineTypesByRegionCcs({ ...validParams, enabled: false }),
    );

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockGetMachineTypesByRegion).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it.each(missingParamCases)(
    'does not fetch when %s is missing',
    async (_missingParam, overrides) => {
      const { result } = renderHook(() =>
        useFetchMachineTypesByRegionCcs({ ...validParams, ...overrides, enabled: true }),
      );

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      expect(mockGetMachineTypesByRegion).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    },
  );

  it('returns error state when the API call fails', async () => {
    mockGetMachineTypesByRegion.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useFetchMachineTypesByRegionCcs(validParams));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    if (result.current.error instanceof Error) {
      expect(result.current.error.message).toBe('Network Error');
    }
    expect(result.current.data).toBeUndefined();
  });
});
