import { Capability } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import {
  isOcp5InstallWarningEnabledForOrg,
  isOcp5UpgradeWarningEnabledForOrg,
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
  subscription: { plan: { type: 'OSD' } },
} as AugmentedCluster;

const rosaHcpV4Cluster = {
  product: { id: 'ROSA' },
  subscription: { plan: { type: 'ROSA' } },
  hypershift: { enabled: true },
  version: { raw_id: '4.19.0' },
} as AugmentedCluster;

const allowOcp5InstallCapability: Capability[] = [
  {
    name: 'capability.organization.rosa_osd_allow_ocp_5_install',
    value: 'true',
    inherited: false,
  },
];

const denyOcp5InstallCapability: Capability[] = [
  {
    name: 'capability.organization.rosa_osd_allow_ocp_5_install',
    value: 'false',
    inherited: false,
  },
];

const allowOcp5UpgradeCapability: Capability[] = [
  {
    name: 'capability.organization.rosa_osd_allow_ocp_5_upgrade',
    value: 'true',
    inherited: false,
  },
];

const denyOcp5UpgradeCapability: Capability[] = [
  {
    name: 'capability.organization.rosa_osd_allow_ocp_5_upgrade',
    value: 'false',
    inherited: false,
  },
];

const allowBothOcp5Capabilities: Capability[] = [
  ...allowOcp5InstallCapability,
  ...allowOcp5UpgradeCapability,
];

describe('isOcp5InstallWarningEnabledForOrg', () => {
  it('returns false when the feature flag is off', () => {
    expect(
      isOcp5InstallWarningEnabledForOrg({
        isOcp5SupportEnabled: false,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns true when the feature flag is on and the org has no OCP 5 install capability', () => {
    expect(
      isOcp5InstallWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns true when the org has rosa_osd_allow_ocp_5_install set to "false"', () => {
    expect(
      isOcp5InstallWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: denyOcp5InstallCapability,
      }),
    ).toBe(true);
  });

  it('returns false when the org has rosa_osd_allow_ocp_5_install set to "true"', () => {
    expect(
      isOcp5InstallWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5InstallCapability,
      }),
    ).toBe(false);
  });

  it('returns true when only the upgrade capability is enabled', () => {
    expect(
      isOcp5InstallWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5UpgradeCapability,
      }),
    ).toBe(true);
  });

  it('returns false when both install and upgrade capabilities are enabled', () => {
    expect(
      isOcp5InstallWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowBothOcp5Capabilities,
      }),
    ).toBe(false);
  });
});

describe('isOcp5UpgradeWarningEnabledForOrg', () => {
  it('returns false when the feature flag is off', () => {
    expect(
      isOcp5UpgradeWarningEnabledForOrg({
        isOcp5SupportEnabled: false,
        organizationCapabilities: undefined,
      }),
    ).toBe(false);
  });

  it('returns true when the feature flag is on and the org has no OCP 5 upgrade capability', () => {
    expect(
      isOcp5UpgradeWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: undefined,
      }),
    ).toBe(true);
  });

  it('returns true when the org has rosa_osd_allow_ocp_5_upgrade set to "false"', () => {
    expect(
      isOcp5UpgradeWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: denyOcp5UpgradeCapability,
      }),
    ).toBe(true);
  });

  it('returns false when the org has rosa_osd_allow_ocp_5_upgrade set to "true"', () => {
    expect(
      isOcp5UpgradeWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5UpgradeCapability,
      }),
    ).toBe(false);
  });

  it('returns true when only the install capability is enabled', () => {
    expect(
      isOcp5UpgradeWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5InstallCapability,
      }),
    ).toBe(true);
  });

  it('returns false when both install and upgrade capabilities are enabled', () => {
    expect(
      isOcp5UpgradeWarningEnabledForOrg({
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowBothOcp5Capabilities,
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

  it('returns true when the org has rosa_osd_allow_ocp_5_upgrade set to "false"', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: denyOcp5UpgradeCapability,
      }),
    ).toBe(true);
  });

  it('returns false when the org has rosa_osd_allow_ocp_5_upgrade set to "true"', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5UpgradeCapability,
      }),
    ).toBe(false);
  });

  it('returns true when only the install capability is enabled', () => {
    expect(
      shouldShowUpgradeToV5Warning({
        cluster: rosaClassicCluster,
        isOcp5SupportEnabled: true,
        organizationCapabilities: allowOcp5InstallCapability,
      }),
    ).toBe(true);
  });
});
