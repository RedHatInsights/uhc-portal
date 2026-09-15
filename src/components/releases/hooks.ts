import * as React from 'react';
import semver from 'semver';

import { useOCPLifeCycleStatus } from '~/queries/useOCPLifeCycleStatus';
import getOCPReleaseChannel from '~/services/releaseChannelService';

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
  const { versions, isLoading } = useOCPLifeCycleStatus();
  let latestReleaseChannel: string | undefined;
  if (!isLoading) {
    const filteredVersions = (versions ?? []).filter((version) => !version.name.includes('EUS'));
    const latestMinorVersion = filteredVersions.length > 0 ? filteredVersions[0]?.name : undefined;
    latestReleaseChannel = latestMinorVersion && `${releaseChannelPrefix}-${latestMinorVersion}`;
  }
  return useOCPLatestVersionInChannel(latestReleaseChannel);
};
