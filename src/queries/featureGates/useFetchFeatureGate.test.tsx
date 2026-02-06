import type axios from 'axios';

import { queryClient } from '~/components/App/queryClient';
import apiRequest from '~/services/apiRequest';
import { renderHook, waitFor } from '~/testUtils';

import featureConstants from './featureConstants';
import { preFetchAllFeatureGates, useFeatureGate } from './useFetchFeatureGate';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('useFetchFeatureGate', () => {
  const sampleFeature = Object.values(featureConstants)[2];

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.removeQueries();
  });

  it('prefetches makes API calls for all features', async () => {
    apiRequestMock.post.mockResolvedValue({ data: { enabled: true } });
    expect(apiRequestMock.post).not.toHaveBeenCalled();
    preFetchAllFeatureGates();

    await waitFor(() => {
      expect(apiRequestMock.post).toHaveBeenCalledTimes(Object.keys(featureConstants).length);
    });
    Object.keys(featureConstants).forEach((key, index) => {
      expect(apiRequestMock.post.mock.calls[index]).toEqual([
        '/api/authorizations/v1/self_feature_review',
        // @ts-ignore
        { feature: featureConstants[key] },
      ]);
    });
  });

  describe('useFeatureGate', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns false and does not make an API call if no feature is passed', async () => {
      apiRequestMock.post.mockResolvedValue({ data: { enabled: true } });

      expect(apiRequestMock.post).not.toHaveBeenCalled();

      // @ts-ignore - Normally feature cannot be undefined
      const { result } = renderHook(() => useFeatureGate(undefined));
      await waitFor(() => {
        expect(result.current).toBeFalsy();
      });
    });

    it('returns true if enabled value of an API call is true', async () => {
      apiRequestMock.post.mockResolvedValue({ data: { enabled: true } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      const { result } = renderHook(() => useFeatureGate(sampleFeature));

      expect(apiRequestMock.post).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current).toBeTruthy();
      });
    });

    it('returns false if enabled value of an API call is false', async () => {
      apiRequestMock.post.mockResolvedValue({ data: { enabled: false } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      const { result } = renderHook(() => useFeatureGate(sampleFeature));

      expect(apiRequestMock.post).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current).toBeFalsy();
      });
    });

    it('returns false if data returned is not in expected value', async () => {
      apiRequestMock.post.mockResolvedValue({ data: { should_be_enabled: true } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      const { result } = renderHook(() => useFeatureGate(sampleFeature));

      expect(apiRequestMock.post).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current).toBeFalsy();
      });
    });
  });
});
