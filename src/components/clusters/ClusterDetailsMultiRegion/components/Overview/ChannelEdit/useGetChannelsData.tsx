import { isHypershiftCluster, isROSA } from '~/components/clusters/common/clusterStates';
import { hasUnstableVersionsCapability } from '~/components/clusters/wizards/common/ClusterSettings/Details/versionSelectHelper';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { useFetchInstallableVersions } from '~/queries/ClusterDetailsQueries/useFetchInstallableVersions';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';
import type { Cluster, Version } from '~/types/clusters_mgmt.v1';
import type { AugmentedCluster } from '~/types/types';

type VersionsListResponse = {
  items?: Version[];
};

const toDropdownOptions = (channels: string[]): { value: string; label: string }[] =>
  channels.map((channel) => ({ value: channel, label: channel }));

const availableChannelsFromVersions = (
  versionsData: VersionsListResponse | undefined,
  rawId?: string,
): { value: string; label: string }[] => {
  const items = versionsData?.items ?? [];
  const matchingVersion = rawId ? items.find((el) => el.raw_id === rawId) : undefined;
  const channels = matchingVersion?.available_channels ?? [];
  return toDropdownOptions(channels);
};

export const useGetChannelsData = (
  cluster: AugmentedCluster & Partial<Pick<Cluster, 'billing_model'>>,
) => {
  const canUpdateClusterResource = !!cluster.canUpdateClusterResource;
  const isRosa = isROSA(cluster);
  const isHCP = isHypershiftCluster(cluster);
  const isMarketplaceGcp =
    cluster.billing_model === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp;
  const isWIF = cluster.gcp?.authentication?.id === GCPAuthType.WorkloadIdentityFederation;
  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const unstableOCPVersionsEnabled =
    useFeatureGate(UNSTABLE_CLUSTER_VERSIONS) && hasUnstableVersionsCapability(organization);

  const { data, isLoading } = useFetchInstallableVersions({
    isRosa,
    isMarketplaceGcp,
    isWIF,
    isHCP,
    includeUnstableVersions: unstableOCPVersionsEnabled,
    canEdit: canUpdateClusterResource,
  });
  const clusterRawId = cluster.version?.raw_id;

  const availableDropdownChannels = availableChannelsFromVersions(data, clusterRawId);
  return { availableDropdownChannels, isLoading };
};
