import { Capability } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import {
  isOcp5MigrationWarningEnabledForOrg,
  shouldShowGcpOcp5UnsupportedUpgradeWarning,
  shouldShowUpgradeToV5Warning,
} from './UpgradeToV5WarningHelpers';

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
  ccs: { enabled: false },
  subscription: { plan: { type: 'OSD' } },
} as AugmentedCluster;

const osdGcpServiceAccountCluster = {
  product: { id: 'OSD' },
  cloud_provider: { id: 'gcp' },
  ccs: { enabled: true },
  gcp: {},
  subscription: { plan: { type: 'OSD' }, cloud_provider_id: 'gcp' },
} as AugmentedCluster;

const osdGcpWifCluster = {
  product: { id: 'OSD' },
  cloud_provider: { id: 'gcp' },
  ccs: { enabled: true },
  gcp: { authentication: { kind: 'WifConfig', id: 'wif-config-id' } },
  subscription: { plan: { type: 'OSD' }, cloud_provider_id: 'gcp' },
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

const denyOcp5Capability: Capability[] = [
  { name: 'capability.organization.rosa_osd_allow_ocp_5', value: 'false', inherited: false },
];

describe('isOcp5MigrationWarningEnabledForOrg', () => {
  it('returns false when the feature flag is off', () => {
    expect(
      isOcp5MigrationWarningEnabledForOrg({
        isOcp5SupportEnabled: false,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns true when the feature flag is on and the org has no OCP 5 capability', () => {
    expect(
      isOcp5MigrationWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns true when the org has rosa_osd_allow_ocp_5 set to "false"', () => {
    expect(
      isOcp5MigrationWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: denyOcp5Capability,
      }),
    ).toBe(true);
  });

  it('returns false when the org has rosa_osd_allow_ocp_5 set to "true"', () => {
    expect(
      isOcp5MigrationWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5Capability,
      }),
    ).toBe(false);
  });
});

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

  it('returns true when the org has rosa_osd_allow_ocp_5 set to "false"', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: denyOcp5Capability,
      }),
    ).toBe(true);
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

describe('shouldShowGcpOcp5UnsupportedUpgradeWarning', () => {
  it('returns false when the feature flag is off', () => {
    expect(
      shouldShowGcpOcp5UnsupportedUpgradeWarning({
        cluster: osdGcpServiceAccountCluster,
        isOcp5SupportEnabled: false,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns true for an OSD GCP CCS cluster that uses a service account', () => {
    expect(
      shouldShowGcpOcp5UnsupportedUpgradeWarning({
        cluster: osdGcpServiceAccountCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns true for an OSD GCP Red Hat cloud account cluster', () => {
    expect(
      shouldShowGcpOcp5UnsupportedUpgradeWarning({
        cluster: osdGcpClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns false for an OSD GCP WIF cluster', () => {
    expect(
      shouldShowGcpOcp5UnsupportedUpgradeWarning({
        cluster: osdGcpWifCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns false for a ROSA Classic cluster', () => {
    expect(
      shouldShowGcpOcp5UnsupportedUpgradeWarning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns false when the org has rosa_osd_allow_ocp_5 set to "true"', () => {
    expect(
      shouldShowGcpOcp5UnsupportedUpgradeWarning({
        cluster: osdGcpServiceAccountCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5Capability,
      }),
    ).toBe(false);
  });
});
