import * as React from 'react';
import semver from 'semver';

import { useOCPLifeCycleStatus } from '~/queries/useOCPLifeCycleStatus';
import getOCPReleaseChannel from '~/services/releaseChannelService';

/**
 * Returns OCP lifecycle versions and a loaded flag.
 * Backed by useOCPLifeCycleStatus (TanStack Query) so errors and retries
 * are handled consistently — no more infinite-request loops on API failure.
 */
export const useOCPLifeCycleStatusData = () => {
  const { versions, isLoading } = useOCPLifeCycleStatus();
  return [versions, !isLoading] as const;
};

export const useOCPLatestVersionInChannel = (releaseChannel: string | undefined) => {
  const [latestVersion, setLatestVersion] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    setLatestVersion(undefined);
    if (releaseChannel) {
      const fetchChannelData = async () => {
        const result = await getOCPReleaseChannel(releaseChannel);
        const sortedVersions = result?.data?.nodes?.sort(({ version: left }, { version: right }) =>
          semver.rcompare(left, right),
        );
        if (sortedVersions) setLatestVersion(sortedVersions[0]?.version);
      };
      fetchChannelData();
    }
  }, [releaseChannel]);
  const loaded = latestVersion !== undefined;
  return [latestVersion, loaded] as const;
};

export const useOCPLatestVersion = (releaseChannelPrefix = 'stable') => {
  const [versions, versionsLoaded] = useOCPLifeCycleStatusData();
  let latestReleaseChannel: string | undefined;
  if (versionsLoaded) {
    const filteredVersions = (versions ?? []).filter((version) => !version.name.includes('EUS'));
    const latestMinorVersion = filteredVersions.length > 0 ? filteredVersions[0]?.name : undefined;
    latestReleaseChannel = latestMinorVersion && `${releaseChannelPrefix}-${latestMinorVersion}`;
  }
  return useOCPLatestVersionInChannel(latestReleaseChannel);
};
