import type axios from 'axios';

import { queryClient } from '~/components/App/queryClient';
import apiRequest from '~/services/apiRequest';
import { renderHook, waitFor } from '~/testUtils';

import featureConstants, { HYPERSHIFT_WIZARD_FEATURE } from './featureConstants';
import { getFeatureGate, preFetchAllFeatureGates, useFeatureGate } from './useFetchFeatureGate';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('useFetchFeatureGate', () => {
  Storage.prototype.getItem = jest.fn();

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

    it('does not make an API call in simulated restricted environment', async () => {
      // Is restrictedEnvironment
      // @ts-ignore
      Storage.prototype.getItem.mockReturnValue('true');

      expect(sampleFeature).not.toEqual(HYPERSHIFT_WIZARD_FEATURE);

      apiRequestMock.post.mockResolvedValue({ data: { enabled: true } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      const { result } = renderHook(() => useFeatureGate(sampleFeature));

      expect(apiRequestMock.post).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current).toBeFalsy();
      });
    });

    it('makes an API call in simulated restricted environment with feature gate on allow list', async () => {
      // Is restrictedEnvironment
      // @ts-ignore
      Storage.prototype.getItem.mockReturnValue('true');

      apiRequestMock.post.mockResolvedValue({ data: { enabled: true } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      const { result } = renderHook(() => useFeatureGate(HYPERSHIFT_WIZARD_FEATURE));

      expect(apiRequestMock.post).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current).toBeTruthy();
      });
    });
  });

  // Normally not used
  // All of these tests are skipped because the function
  // is looking at global queryClient and not the one set up in testUtils
  // This causes bleeding across tests

  describe('getFeatureGate', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it.skip('returns false and does not make an API call if no feature is passed', async () => {
      apiRequestMock.post.mockResolvedValueOnce({ data: { enabled: true } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      // @ts-ignore
      const result = await getFeatureGate(undefined);
      await waitFor(() => {
        expect(apiRequestMock.post).not.toHaveBeenCalled();
      });
      expect(result).toBeFalsy();
    });

    it.skip('returns true if enabled value of an API call is true', async () => {
      apiRequestMock.post.mockResolvedValueOnce({ data: { enabled: true } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      const result = await getFeatureGate(sampleFeature);

      expect(apiRequestMock.post).toHaveBeenCalled();
      await waitFor(() => {
        expect(result).toBeTruthy();
      });
    });

    it.skip('returns false if enabled value of an API call is false', async () => {
      apiRequestMock.post.mockResolvedValueOnce({ data: { enabled: false } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      const result = await getFeatureGate(sampleFeature);

      expect(apiRequestMock.post).toHaveBeenCalled();
      await waitFor(() => {
        expect(result).toBeFalsy();
      });
    });

    it.skip('returns false if data returned is not in expected value', async () => {
      apiRequestMock.post.mockResolvedValueOnce({ data: { should_be_enabled: true } });
      expect(apiRequestMock.post).not.toHaveBeenCalled();
      const result = await getFeatureGate(sampleFeature);

      expect(apiRequestMock.post).toHaveBeenCalled();
      await waitFor(() => {
        expect(result).toBeFalsy();
      });
    });
  });
});
