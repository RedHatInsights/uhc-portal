import { TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, renderHook } from '~/testUtils';

import { CLUSTER_LIST_PATH, TABBED_CLUSTER_LIST_PATH, useClusterListPath } from './routePaths';

describe('routePaths', () => {
  describe('constants', () => {
    it('CLUSTER_LIST_PATH has correct value', () => {
      expect(CLUSTER_LIST_PATH).toBe('/cluster-list');
    });

    it('TABBED_CLUSTER_LIST_PATH has correct value', () => {
      expect(TABBED_CLUSTER_LIST_PATH).toBe('/clusters/list');
    });
  });

  describe('useClusterListPath', () => {
    it('returns legacy path when TABBED_CLUSTERS feature is disabled', () => {
      mockUseFeatureGate([[TABBED_CLUSTERS, false]]);

      const { result } = renderHook(() => useClusterListPath());

      expect(result.current).toBe(CLUSTER_LIST_PATH);
    });

    it('returns tabbed path when TABBED_CLUSTERS feature is enabled', () => {
      mockUseFeatureGate([[TABBED_CLUSTERS, true]]);

      const { result } = renderHook(() => useClusterListPath());

      expect(result.current).toBe(TABBED_CLUSTER_LIST_PATH);
    });
  });
});
