import { isHypershiftCluster, isROSA } from '~/components/clusters/common/clusterStates';
import { hasUnstableVersionsCapability } from '~/components/clusters/wizards/common/ClusterSettings/Details/versionSelectHelper';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { useFetchInstallableVersions } from '~/queries/ClusterDetailsQueries/useFetchInstallableVersions';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';
import { Cluster } from '~/types/clusters_mgmt.v1';

export const useGetChannelGroupsData = (cluster: Cluster, canEdit: boolean) => {
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
    canEdit,
  });
  const clusterRawId = cluster.version?.raw_id;

  const availableChannelGroups = (data: any, clusterRawId?: string) => {
    const filteredClusterVersions = data?.items.filter((el: any) => el.raw_id === clusterRawId);
    const availableChannelGroups = filteredClusterVersions?.map((el: any) => el.channel_group);
    const buildChannelGroupDropdownOptions = availableChannelGroups?.map((el: string) => ({
      value: el,
      label: el === 'eus' ? el.toUpperCase() : el.charAt(0).toUpperCase() + el.slice(1),
    }));
    return buildChannelGroupDropdownOptions;
  };

  const availableDropdownChannelGroups = availableChannelGroups(data, clusterRawId);
  return { availableDropdownChannelGroups, isLoading };
};
