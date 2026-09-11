import { Capability } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import { shouldShowUpgradeToV5Warning } from './UpgradeToV5WarningHelpers';

const rosaClassicCluster = {
  product: { id: 'ROSA' },
  subscription: { plan: { type: 'ROSA' } },
} as AugmentedCluster;

const osdAwsClassicCluster = {
  product: { id: 'OSD' },
  subscription: { plan: { type: 'OSD' }, cloud_provider_id: 'aws' },
} as AugmentedCluster;

const osdGcpClassicCluster = {
  product: { id: 'OSD' },
  cloud_provider: { id: 'gcp' },
  subscription: { plan: { type: 'OSD' } },
} as AugmentedCluster;

const rosaHcpV4Cluster = {
  product: { id: 'ROSA' },
  subscription: { plan: { type: 'ROSA' } },
  hypershift: { enabled: true },
  version: { raw_id: '4.19.0' },
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

  it('returns true for an OSD Classic AWS cluster when the feature flag is on', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: osdAwsClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns false for an OSD Classic GCP cluster', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: osdGcpClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns false for a ROSA HCP cluster', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaHcpV4Cluster,
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
