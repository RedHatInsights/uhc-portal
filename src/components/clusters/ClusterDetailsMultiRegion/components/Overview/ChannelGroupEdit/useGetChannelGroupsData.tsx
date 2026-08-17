import { isGcpMarketplaceBilling } from '~/components/clusters/common/billingModelMapper';
import { isHypershiftCluster, isROSA } from '~/components/clusters/common/clusterStates';
import {
  createChannelGroupLabel,
  hasUnstableVersionsCapability,
} from '~/components/clusters/wizards/common/ClusterSettings/Details/versionSelectHelper';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { useFetchInstallableVersions } from '~/queries/ClusterDetailsQueries/useFetchInstallableVersions';
import { useGlobalState } from '~/redux/hooks';
import type { AugmentedCluster } from '~/types/types';

export const useGetChannelGroupsData = (cluster: AugmentedCluster) => {
  const canUpdateClusterResource = !!cluster.canUpdateClusterResource;
  const isRosa = isROSA(cluster);
  const isHCP = isHypershiftCluster(cluster);
  const isMarketplaceGcp = isGcpMarketplaceBilling(cluster.billing_model);
  const isWIF = cluster.gcp?.authentication?.id === GCPAuthType.WorkloadIdentityFederation;
  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const unstableOCPVersionsEnabled = hasUnstableVersionsCapability(organization);

  const { data, isLoading } = useFetchInstallableVersions({
    isRosa,
    isMarketplaceGcp,
    isWIF,
    isHCP,
    includeUnstableVersions: unstableOCPVersionsEnabled,
    canEdit: canUpdateClusterResource,
  });
  const clusterRawId = cluster.version?.raw_id;

  const availableChannelGroups = (data: any, clusterRawId?: string) => {
    const filteredClusterVersions = data?.items.filter((el: any) => el.raw_id === clusterRawId);
    const availableChannelGroups = filteredClusterVersions?.map((el: any) => el.channel_group);
    const buildChannelGroupDropdownOptions = availableChannelGroups?.map((el: string) => ({
      value: el,
      label: createChannelGroupLabel(el),
    }));
    return buildChannelGroupDropdownOptions;
  };

  const availableDropdownChannelGroups = availableChannelGroups(data, clusterRawId);
  return { availableDropdownChannelGroups, isLoading };
};
