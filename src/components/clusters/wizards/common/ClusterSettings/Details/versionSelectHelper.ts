import semver from 'semver';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { FuzzyEntryType } from '~/components/common/FuzzySelect/types';
import { Organization } from '~/types/accounts_mgmt.v1';
import { Version } from '~/types/clusters_mgmt.v1';

export const channelGroups = {
  STABLE: 'stable',
  CANDIDATE: 'candidate',
  FAST: 'fast',
  NIGHTLY: 'nightly',
  EUS: 'eus',
};

const supportStatuses = {
  FULL: 'Full Support',
  MAINTENANCE: 'Maintenance Support',
  EXTENDED: 'Extended Support',
};

type SupportStatus = (typeof supportStatuses)[keyof typeof supportStatuses];

type SupportMap = {
  [version: string]: SupportStatus;
};

type GetInstallableVersionsResponse = {
  error: boolean;
  fulfilled: boolean;
  pending: boolean;
  valid: boolean;
  versions: Version[];
  meta: {
    includeUnstableVersions: boolean;
    isMarketplaceGcp: boolean;
    isWIF: boolean;
  };
  errorMessage: string;
};

const getVersionsData = (
  versions: Version[],
  unstableVersionsIncluded: boolean,
  supportVersionMap?: SupportMap,
  channelGroupSelected?: string,
) => {
  const fullSupport: FuzzyEntryType[] = [];
  const maintenanceSupport: FuzzyEntryType[] = [];

  const candidate: FuzzyEntryType[] = [];
  const nightly: FuzzyEntryType[] = [];
  const fast: FuzzyEntryType[] = [];
  const eus: FuzzyEntryType[] = [];

  versions.forEach((version: Version) => {
    const { raw_id: versionRawId, id: versionId, channel_group: channelGroup } = version;
    if (versionRawId && versionId) {
      if (
        (!unstableVersionsIncluded && channelGroup !== channelGroups.EUS) ||
        channelGroup === channelGroups.STABLE
      ) {
        const createMajorMinorVersion = (rawId: string) => {
          const versionObject = semver.parse(rawId);

          return versionObject
            ? versionObject.major.toString().concat('.', versionObject.minor.toString())
            : '';
        };

        const majorMinorVersion = createMajorMinorVersion(versionRawId);

        const hasFullSupport = supportVersionMap?.[majorMinorVersion] === supportStatuses.FULL;

        const versionEntry = {
          entryId: versionId,
          label: versionRawId,
          groupKey: hasFullSupport ? supportStatuses.FULL : supportStatuses.MAINTENANCE,
        };

        if (hasFullSupport) {
          fullSupport.push(versionEntry);
        } else {
          maintenanceSupport.push(versionEntry);
        }
        return;
      }

      if (unstableVersionsIncluded) {
        const versionEntry = {
          entryId: versionId,
          label: `${versionRawId} (${channelGroup})`,
          groupKey: channelGroup,
        };

        switch (channelGroup) {
          case channelGroups.CANDIDATE:
            candidate.push(versionEntry);
            break;
          case channelGroups.NIGHTLY:
            nightly.push(versionEntry);
            break;
          case channelGroups.FAST:
            fast.push(versionEntry);
            break;
          case channelGroups.EUS:
            eus.push(versionEntry);
            break;
          default:
            break;
        }
      } else {
        const versionEntry = {
          entryId: versionId,
          label: `${versionRawId} (${channelGroup})`,
          groupKey: channelGroup,
        };

        switch (channelGroup) {
          case channelGroups.EUS:
            eus.push(versionEntry);
            break;
          default:
            break;
        }
      }
    }
  });

  const stableVersions = {
    'Full support': fullSupport,
    'Maintenance support': maintenanceSupport,
  };

  if (channelGroupSelected) {
    switch (channelGroupSelected) {
      case channelGroups.CANDIDATE:
        return candidate;

      case channelGroups.NIGHTLY:
        return nightly;

      case channelGroups.FAST:
        return fast;

      case channelGroups.EUS:
        return eus;

      default:
        return stableVersions;
    }
  }

  return unstableVersionsIncluded
    ? {
        ...stableVersions,
        Candidate: candidate,
        Nightly: nightly,
        Fast: fast,
        EUS: eus,
      }
    : stableVersions;
};

const hasUnstableVersionsCapability = (organization?: Organization) =>
  (organization?.capabilities ?? []).some(
    (capability) =>
      capability.name === subscriptionCapabilities.NON_STABLE_CHANNEL_GROUP &&
      capability.value === 'true',
  );

const getVersionNameWithChannel = (version: Version): string =>
  `${version?.raw_id} ${version?.channel_group !== channelGroups.STABLE ? `(${version?.channel_group})` : ''}`;

const createChannelGroupLabel = (channelGroup: string) => {
  if (channelGroup === 'eus') {
    return 'Extended Update Support (EUS)';
  }
  return channelGroup.charAt(0).toUpperCase() + channelGroup.slice(1);
};

export {
  getVersionsData,
  supportStatuses,
  hasUnstableVersionsCapability,
  getVersionNameWithChannel,
  createChannelGroupLabel,
  GetInstallableVersionsResponse,
};
