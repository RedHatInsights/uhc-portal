import type { ClusterFromSubscription } from '~/types/types';

import { canShowOvnNetworkDetails } from './NetworkingHelpers';

describe('canShowOvnNetworkDetails', () => {
  const hypershift418 = {
    hypershift: { enabled: true },
    openshift_version: '4.18.0',
  } as ClusterFromSubscription;

  it('returns false when the HCP OVN feature gate is disabled', () => {
    expect(canShowOvnNetworkDetails(hypershift418, false)).toBe(false);
  });

  it('returns false for classic (non-Hypershift) clusters', () => {
    const cluster = {
      hypershift: { enabled: false },
      openshift_version: '4.18.0',
    } as ClusterFromSubscription;

    expect(canShowOvnNetworkDetails(cluster, true)).toBe(false);
  });

  it('returns false for Hypershift clusters below 4.18', () => {
    const cluster = {
      hypershift: { enabled: true },
      openshift_version: '4.17.5',
    } as ClusterFromSubscription;

    expect(canShowOvnNetworkDetails(cluster, true)).toBe(false);
  });

  it('returns true for Hypershift clusters on 4.18 or higher when the gate is enabled', () => {
    expect(canShowOvnNetworkDetails(hypershift418, true)).toBe(true);
  });

  it('uses version.raw_id when openshift_version is missing', () => {
    const cluster = {
      hypershift: { enabled: true },
      version: { raw_id: '4.19.1' },
    } as ClusterFromSubscription;

    expect(canShowOvnNetworkDetails(cluster, true)).toBe(true);
  });
});
