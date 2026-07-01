import { renderHook, waitFor } from '~/testUtils';
import { MachineType } from '~/types/clusters_mgmt.v1';

import {
  useFetchMachineTypesByRegionArn,
  type UseFetchMachineTypesByRegionArnParams,
} from './useFetchMachineTypesByRegionArn';
import { mapMachineTypesItemsToResponse } from './utils';

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    getMachineTypesByRegionARN: jest.fn(),
  },
}));

type MachineTypesByRegionArnMock = jest.Mock<
  Promise<{ data: { items?: MachineType[] } }>,
  [string, string, string[] | undefined]
>;

const mockGetMachineTypesByRegionARN = jest.requireMock<{
  default: { getMachineTypesByRegionARN: MachineTypesByRegionArnMock };
}>('~/services/clusterService').default.getMachineTypesByRegionARN;

const machineTypeItems = [
  { id: 'm5.xlarge', cloud_provider: { id: 'aws' } },
] satisfies MachineType[];

const validParams: UseFetchMachineTypesByRegionArnParams = {
  installerRoleArn: 'arn:aws:iam::123456789012:role/Installer',
  region: 'us-east-1',
  availabilityZones: ['us-east-1b', 'us-east-1a'],
  enabled: true,
};

const missingParamCases: [string, Partial<UseFetchMachineTypesByRegionArnParams>][] = [
  ['installerRoleArn', { installerRoleArn: undefined }],
  ['region', { region: undefined }],
];

describe('useFetchMachineTypesByRegionArn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches region machine types when all parameters are present and enabled', async () => {
    mockGetMachineTypesByRegionARN.mockResolvedValueOnce({ data: { items: machineTypeItems } });

    const { result } = renderHook(() => useFetchMachineTypesByRegionArn(validParams));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMachineTypesByRegionARN).toHaveBeenCalledWith(
      validParams.installerRoleArn,
      validParams.region,
      validParams.availabilityZones,
    );
    expect(result.current.data).toEqual(mapMachineTypesItemsToResponse(machineTypeItems));
  });

  it('passes undefined availability zones to the API when availabilityZones is undefined', async () => {
    mockGetMachineTypesByRegionARN.mockResolvedValueOnce({ data: { items: machineTypeItems } });

    const { result } = renderHook(() =>
      useFetchMachineTypesByRegionArn({
        ...validParams,
        availabilityZones: undefined,
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMachineTypesByRegionARN).toHaveBeenCalledWith(
      validParams.installerRoleArn,
      validParams.region,
      undefined,
    );
  });

  it('does not fetch when enabled is false', async () => {
    const { result } = renderHook(() =>
      useFetchMachineTypesByRegionArn({ ...validParams, enabled: false }),
    );

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockGetMachineTypesByRegionARN).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it.each(missingParamCases)(
    'does not fetch when %s is missing',
    async (_missingParam, overrides) => {
      const { result } = renderHook(() =>
        useFetchMachineTypesByRegionArn({ ...validParams, ...overrides, enabled: true }),
      );

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      expect(mockGetMachineTypesByRegionARN).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    },
  );

  it('returns error state when the API call fails', async () => {
    mockGetMachineTypesByRegionARN.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useFetchMachineTypesByRegionArn(validParams));

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
