import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { Version } from '~/types/clusters_mgmt.v1';

import {
  getVersionNameWithChannel,
  getVersionsData,
  hasUnstableVersionsCapability,
  supportStatuses,
} from './versionSelectHelper';

const supportMap = {
  '4.12': 'Extended Support',
  '4.13': 'Maintenance Support',
  '4.14': 'Maintenance Support',
  '4.15': 'Full Support',
  '4.16': 'Full Support',
  '4.20': 'Full Support',
};

const satbleVersions: Version[] = [
  {
    kind: 'Version',
    raw_id: '4.20.0',
    id: 'openshift-v4.20.0',
    enabled: true,
    default: false,
    channel_group: 'stable',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2026-10-21T00:00:00Z',
  },
  {
    kind: 'Version',
    raw_id: '4.16.8',
    id: 'openshift-v4.16.8',
    enabled: true,
    default: false,
    channel_group: 'stable',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2024-09-17T00:00:00Z',
  },
  {
    kind: 'Version',
    raw_id: '4.16.7',
    id: 'openshift-v4.16.7',
    enabled: true,
    default: true,
    channel_group: 'stable',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2024-09-17T00:00:00Z',
  },
  {
    kind: 'Version',
    raw_id: '4.14.35',
    id: 'openshift-v4.14.35',
    enabled: true,
    default: false,
    channel_group: 'stable',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2024-09-17T00:00:00Z',
  },
  {
    kind: 'Version',
    raw_id: '4.14.34',
    id: 'openshift-v4.14.34',
    enabled: true,
    default: false,
    channel_group: 'stable',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2024-09-17T00:00:00Z',
  },
];

const stableAndUnstableVersions = [
  ...satbleVersions,
  {
    kind: 'Version',
    raw_id: '4.14.34',
    id: 'openshift-v4.14.34-candidate',
    enabled: true,
    default: false,
    channel_group: 'candidate',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2025-02-28T00:00:00Z',
  },
  {
    kind: 'Version',
    raw_id: '4.18.0-0.nightly-2024-08-29-020346',
    id: 'openshift-v4.18.0-0.nightly-2024-08-29-020346-nightly',
    enabled: true,
    default: false,
    channel_group: 'nightly',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    gcp_marketplace_enabled: false,
    end_of_life_timestamp: '2024-09-17T00:00:00Z',
  },
  {
    kind: 'Version',
    raw_id: '4.15.28',
    id: 'openshift-v4.15.28-fast',
    enabled: true,
    default: false,
    channel_group: 'fast',
    rosa_enabled: true,
    hosted_control_plane_enabled: false,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2024-09-17T00:00:00Z',
  },
  {
    kind: 'Version',
    raw_id: '4.15.24',
    id: 'openshift-v4.15.24-eus',
    enabled: true,
    default: false,
    channel_group: 'eus',
    rosa_enabled: true,
    hosted_control_plane_enabled: false,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2024-09-17T00:00:00Z',
  },
];

const stableExpected = {
  'Full support': [
    { entryId: 'openshift-v4.20.0', label: '4.20.0', groupKey: supportStatuses.FULL },
    { entryId: 'openshift-v4.16.8', label: '4.16.8', groupKey: supportStatuses.FULL },
    { entryId: 'openshift-v4.16.7', label: '4.16.7', groupKey: supportStatuses.FULL },
  ],
  'Maintenance support': [
    { entryId: 'openshift-v4.14.35', label: '4.14.35', groupKey: supportStatuses.MAINTENANCE },
    { entryId: 'openshift-v4.14.34', label: '4.14.34', groupKey: supportStatuses.MAINTENANCE },
  ],
};

const stateWithNonStableChannelGroupCapability = {
  capabilities: [
    { name: subscriptionCapabilities.NON_STABLE_CHANNEL_GROUP, value: 'true', inherited: false },
    { name: subscriptionCapabilities.ALLOW_ETCD_ENCRYPTION, value: 'false', inherited: false },
    { name: subscriptionCapabilities.AUTOSCALE_CLUSTERS, value: 'true', inherited: false },
    { name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'false', inherited: false },
  ],
};

const stateWithoutNonStableChannelGroupCapability = {
  capabilities: [
    { name: subscriptionCapabilities.NON_STABLE_CHANNEL_GROUP, value: 'false', inherited: false },
    { name: subscriptionCapabilities.ALLOW_ETCD_ENCRYPTION, value: 'false', inherited: false },
    { name: subscriptionCapabilities.AUTOSCALE_CLUSTERS, value: 'true', inherited: false },
    { name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'false', inherited: false },
  ],
};

describe('VersionSelectHelper', () => {
  it('returns correct versions data for stable and unstable channels', () => {
    expect(getVersionsData(satbleVersions, false, supportMap)).toEqual(stableExpected);
  });

  it('returns correct versions data for stable and unstable channels', () => {
    const expected = {
      ...stableExpected,
      Fast: [{ entryId: 'openshift-v4.15.28-fast', label: '4.15.28 (fast)', groupKey: 'fast' }],
      EUS: [
        {
          entryId: 'openshift-v4.15.24-eus',
          groupKey: 'eus',
          label: '4.15.24 (eus)',
        },
      ],
      Candidate: [
        {
          entryId: 'openshift-v4.14.34-candidate',
          label: '4.14.34 (candidate)',
          groupKey: 'candidate',
        },
      ],
      Nightly: [
        {
          entryId: 'openshift-v4.18.0-0.nightly-2024-08-29-020346-nightly',
          label: '4.18.0-0.nightly-2024-08-29-020346 (nightly)',
          groupKey: 'nightly',
        },
      ],
    };
    expect(getVersionsData(stableAndUnstableVersions, true, supportMap)).toEqual(expected);
  });

  it('returns filtered fast versions by channel group', () => {
    const expected = [
      { entryId: 'openshift-v4.15.28-fast', label: '4.15.28 (fast)', groupKey: 'fast' },
    ];
    expect(getVersionsData(stableAndUnstableVersions, true, supportMap, 'fast')).toEqual(expected);
  });

  it('returns filtered eus versions by channel group', () => {
    const expected = [
      { entryId: 'openshift-v4.15.24-eus', label: '4.15.24 (eus)', groupKey: 'eus' },
    ];
    expect(getVersionsData(stableAndUnstableVersions, true, supportMap, 'eus')).toEqual(expected);
  });
});

describe('hasUnstableVersionsCapability', () => {
  it('should find the capbility to get non stable versions', () => {
    expect(hasUnstableVersionsCapability(stateWithNonStableChannelGroupCapability)).toBe(true);
  });

  it('should not find the capbility to get non stable versions', () => {
    expect(hasUnstableVersionsCapability(stateWithoutNonStableChannelGroupCapability)).toBe(false);
  });
});

describe('getVersionNameWithChannel', () => {
  it('should have the correct name with channel for select', () => {
    const version1 = {
      raw_id: '4.16.8',
      channel_group: 'candidate',
    };
    const version2 = {
      raw_id: '4.17.8',
      channel_group: 'stable',
    };
    expect(getVersionNameWithChannel(version1)).toBe('4.16.8 (candidate)');
    expect(getVersionNameWithChannel(version2)).toBe('4.17.8 ');
  });
});
