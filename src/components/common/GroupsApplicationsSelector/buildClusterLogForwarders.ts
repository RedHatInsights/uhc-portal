import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

import type { LogForwardingGroupTreeNode } from './logForwardingGroupTreeData';

/** Normalizes group display names from the API tree for LogForwarderGroup.id (e.g. API → api). */
export function normalizeLogForwarderGroupSubmitId(displayName: string): string {
  return displayName.trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Maps selected leaf application ids into group ids (full multi-app group selected) vs standalone
 * applications, using the same tree shape as the wizard selector.
 */
export function splitLogForwardingSelectionForSubmit(
  tree: LogForwardingGroupTreeNode[] | undefined,
  selectedLeafIds: string[] | undefined,
): { groupIds: string[]; applications: string[] } {
  const ids = new Set((selectedLeafIds ?? []).filter(Boolean));
  if (ids.size === 0) {
    return { groupIds: [], applications: [] };
  }

  if (!tree?.length) {
    return { groupIds: [], applications: Array.from(ids) };
  }

  const groupIds: string[] = [];
  const applications: string[] = [];

  const pushGroup = (displayName: string) => {
    const g = normalizeLogForwarderGroupSubmitId(displayName);
    if (!groupIds.includes(g)) {
      groupIds.push(g);
    }
  };
  const pushApp = (app: string) => {
    if (!applications.includes(app)) {
      applications.push(app);
    }
  };

  tree.forEach((root) => {
    if (!root.children?.length) {
      if (ids.has(root.id)) {
        pushApp(root.id);
      }
      return;
    }

    const leafIds = root.children.map((c) => c.id);
    const selectedInGroup = leafIds.filter((lid) => ids.has(lid));
    if (selectedInGroup.length === 0) {
      return;
    }

    if (selectedInGroup.length === leafIds.length) {
      pushGroup(root.text);
      return;
    }

    selectedInGroup.forEach(pushApp);
  });

  return { groupIds, applications };
}

/** Builds control plane log forwarders for ROSA HCP cluster create from wizard form values. */
export function getRosaLogForwardersForClusterRequest(
  formData: Record<string, unknown>,
  tree: LogForwardingGroupTreeNode[] | undefined,
): LogForwarder[] {
  const forwarders: LogForwarder[] = [];

  if (formData[FieldId.LogForwardingCloudWatchEnabled]) {
    const roleArn = String(formData[FieldId.LogForwardingCloudWatchRoleArn] ?? '').trim();
    const logGroup = String(formData[FieldId.LogForwardingCloudWatchLogGroupName] ?? '').trim();
    const selected = formData[FieldId.LogForwardingCloudWatchSelectedItems] as string[] | undefined;
    const { groupIds, applications } = splitLogForwardingSelectionForSubmit(tree, selected);

    if (roleArn && logGroup && (groupIds.length > 0 || applications.length > 0)) {
      forwarders.push({
        cloudwatch: {
          log_distribution_role_arn: roleArn,
          log_group_name: logGroup,
        },
        groups: groupIds.map((id) => ({ id })),
        applications,
      });
    }
  }

  if (formData[FieldId.LogForwardingS3Enabled]) {
    const bucket = String(formData[FieldId.LogForwardingS3BucketName] ?? '').trim();
    const prefixRaw = String(formData[FieldId.LogForwardingS3BucketPrefix] ?? '').trim();
    const selected = formData[FieldId.LogForwardingS3SelectedItems] as string[] | undefined;
    const { groupIds, applications } = splitLogForwardingSelectionForSubmit(tree, selected);

    if (bucket && (groupIds.length > 0 || applications.length > 0)) {
      forwarders.push({
        s3: {
          bucket_name: bucket,
          ...(prefixRaw ? { bucket_prefix: prefixRaw } : {}),
        },
        groups: groupIds.map((id) => ({ id })),
        applications,
      });
    }
  }

  return forwarders;
}
