import { Capability } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import { shouldShowUpgradeToV5Warning } from './UpgradeToV5WarningHelpers';

const rosaClassicCluster = {
  product: { id: 'ROSA' },
  subscription: { plan: { type: 'ROSA' } },
} as AugmentedCluster;

const osdClassicCluster = {
  product: { id: 'OSD' },
  subscription: { plan: { type: 'OSD' } },
} as AugmentedCluster;

const rosaHcpCluster = {
  product: { id: 'ROSA' },
  subscription: { plan: { type: 'ROSA' } },
  hypershift: { enabled: true },
} as AugmentedCluster;

const allowOcp5Capability: Capability[] = [
  { name: 'capability.organization.rosa_osd_allow_ocp_5', value: 'true', inherited: false },
];

describe('shouldShowUpgradeToV5Warning', () => {
  it('returns false when the feature flag is off', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: false,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns true for a ROSA Classic cluster when the feature flag is on', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns true for an OSD Classic cluster when the feature flag is on', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: osdClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns false for Hypershift clusters', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaHcpCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns false when the org has the rosa_osd_allow_ocp_5 capability set to "true"', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5Capability,
      }),
    ).toBe(false);
  });
});
