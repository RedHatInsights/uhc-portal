import { AWS_TAGS_NEW_MP } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, renderHook } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import { useCanEditAwsTags } from './useCanEditAwsTags';

const hcpCluster = (version: string) =>
  ({
    hypershift: { enabled: true },
    openshift_version: version,
  }) as ClusterFromSubscription;

describe('useCanEditAwsTags', () => {
  it('returns true for a ROSA HCP cluster on 4.20+ with the AWS tags section enabled', () => {
    mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
    const { result } = renderHook(() => useCanEditAwsTags(hcpCluster('4.20.1')));
    expect(result.current).toBe(true);
  });

  it('returns false below 4.20', () => {
    mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
    const { result } = renderHook(() => useCanEditAwsTags(hcpCluster('4.19.9')));
    expect(result.current).toBe(false);
  });

  it('returns false when the AWS tags section is disabled', () => {
    mockUseFeatureGate([[AWS_TAGS_NEW_MP, false]]);
    const { result } = renderHook(() => useCanEditAwsTags(hcpCluster('4.20.1')));
    expect(result.current).toBe(false);
  });

  it('falls back to version.raw_id when openshift_version is not set', () => {
    mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
    const { result } = renderHook(() =>
      useCanEditAwsTags({
        hypershift: { enabled: true },
        version: { raw_id: '4.21.0' },
      } as ClusterFromSubscription),
    );
    expect(result.current).toBe(true);
  });

  it('returns false when the cluster version is unknown', () => {
    mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
    const { result } = renderHook(() =>
      useCanEditAwsTags({ hypershift: { enabled: true } } as ClusterFromSubscription),
    );
    expect(result.current).toBe(false);
  });

  it('returns false for clusters without a hosted control plane', () => {
    mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
    const { result } = renderHook(() =>
      useCanEditAwsTags({ openshift_version: '4.20.1' } as ClusterFromSubscription),
    );
    expect(result.current).toBe(false);
  });
});
