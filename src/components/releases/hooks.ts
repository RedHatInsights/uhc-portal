import * as React from 'react';
import semver from 'semver';

import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import getOCPLifeCycleStatus from '~/services/productLifeCycleService';
import getOCPReleaseChannel from '~/services/releaseChannelService';
import { ProductLifeCycle } from '~/types/product-life-cycles';

export const useOCPLifeCycleStatusData = () => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const [statusData, setStatusData] = React.useState<ProductLifeCycle[] | undefined>();
  React.useEffect(() => {
    const fetchStatusData = async () => {
      const result = await getOCPLifeCycleStatus(isOcp5SupportEnabled);
      setStatusData(result.data.data);
    };
    fetchStatusData();
  }, [isOcp5SupportEnabled]);
  const loaded = statusData !== undefined;
  return [statusData, loaded] as const;
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
  const [statusData, statusDataLoaded] = useOCPLifeCycleStatusData();
  let latestReleaseChannel: string | undefined;
  if (statusDataLoaded) {
    const allVersions = statusData?.[0]?.versions || [];
    const filteredVersions = allVersions.filter((version) => !version.name.includes('EUS'));
    const latestMinorVersion = filteredVersions.length > 0 ? filteredVersions[0]?.name : undefined;
    latestReleaseChannel = latestMinorVersion && `${releaseChannelPrefix}-${latestMinorVersion}`;
  }
  return useOCPLatestVersionInChannel(latestReleaseChannel);
};
