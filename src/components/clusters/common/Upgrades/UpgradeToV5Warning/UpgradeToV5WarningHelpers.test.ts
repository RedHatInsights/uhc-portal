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

const rosaHcpV4Cluster = {
  product: { id: 'ROSA' },
  subscription: { plan: { type: 'ROSA' } },
  hypershift: { enabled: true },
  version: { raw_id: '4.19.0' },
} as AugmentedCluster;

const rosaHcpV5Cluster = {
  product: { id: 'ROSA' },
  subscription: { plan: { type: 'ROSA' } },
  hypershift: { enabled: true },
  version: { raw_id: '5.0.0' },
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

  it('returns true for a ROSA HCP v4 cluster', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaHcpV4Cluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns false for a ROSA HCP v5 cluster', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaHcpV5Cluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns true for ROSA HCP v4 even when the org has rosa_osd_allow_ocp_5', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaHcpV4Cluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5Capability,
      }),
    ).toBe(true);
  });

  it('returns false when the org has the rosa_osd_allow_ocp_5 capability set to "true" on Classic', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5Capability,
      }),
    ).toBe(false);
  });
});
