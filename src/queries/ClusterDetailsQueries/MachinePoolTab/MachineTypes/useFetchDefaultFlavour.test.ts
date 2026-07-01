import { waitFor } from '@testing-library/react';

import clusterService from '~/services/clusterService';
import { renderHook } from '~/testUtils';

import { useFetchDefaultFlavour } from './useFetchDefaultFlavour';

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    getFlavour: jest.fn(),
  },
}));

const getFlavourMock = jest.mocked(clusterService.getFlavour);

describe('useFetchDefaultFlavour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches osd-4 flavour and exposes data', async () => {
    getFlavourMock.mockResolvedValueOnce({
      data: { id: 'osd-4', aws: { compute_instance_type: 'm5.xlarge' } },
    } as Awaited<ReturnType<typeof clusterService.getFlavour>>);

    const { result } = renderHook(() => useFetchDefaultFlavour());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(getFlavourMock).toHaveBeenCalledWith('osd-4');
    expect(result.current.data?.aws?.compute_instance_type).toBe('m5.xlarge');
  });
});
