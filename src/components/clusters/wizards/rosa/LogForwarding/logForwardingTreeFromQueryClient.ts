import { queryClient } from '~/components/App/queryClient';
import { FieldId as RosaFieldId } from '~/components/clusters/wizards/rosa/constants';
import type { LogForwardingGroupTreeNode } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { buildLogForwardingTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';
import { queryConstants } from '~/queries/queriesConstants';
import type { LogForwarderApplication } from '~/types/clusters_mgmt.v1';

type ClusterRequestContext = {
  cloudProviderID?: string;
  product?: string;
};

/** Matches the guard in createClusterRequest before log_forwarders are attached. */
export function isRosaHcpLogForwardingSubmitContext(
  { cloudProviderID, product }: ClusterRequestContext,
  formData: Record<string, unknown>,
): boolean {
  const logForwardingEnabled =
    formData[RosaFieldId.LogForwardingS3Enabled] ||
    formData[RosaFieldId.LogForwardingCloudWatchEnabled];

  return (
    !!logForwardingEnabled &&
    formData.hypershift === 'true' &&
    (formData.product ?? product) === 'ROSA' &&
    (formData.cloud_provider ?? cloudProviderID) === 'aws'
  );
}

/** Reads cached log forwarding catalog data and returns the merged selector tree. */
export function getLogForwardingTreeFromQueryClient(): LogForwardingGroupTreeNode[] {
  const groupsTree =
    queryClient.getQueryData<LogForwardingGroupTreeNode[]>([
      queryConstants.FETCH_LOG_FORWARDING_GROUPS,
    ]) ?? [];
  const applications =
    queryClient.getQueryData<LogForwarderApplication[]>([
      queryConstants.FETCH_LOG_FORWARDING_APPLICATIONS,
    ]) ?? [];

  return buildLogForwardingTree(groupsTree, applications);
}

/** Reads the log forwarding tree from cache only when submit will use it. */
export function getLogForwardingTreeForClusterRequest(
  params: ClusterRequestContext,
  formData: Record<string, unknown>,
): LogForwardingGroupTreeNode[] | undefined {
  if (!isRosaHcpLogForwardingSubmitContext(params, formData)) {
    return undefined;
  }

  return getLogForwardingTreeFromQueryClient();
}
