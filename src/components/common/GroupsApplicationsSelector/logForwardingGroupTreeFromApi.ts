import type {
  LogForwarderApplication,
  LogForwarderGroupVersion,
  LogForwarderGroupVersions,
} from '~/types/clusters_mgmt.v1';

import {
  LOG_FORWARDING_GROUP_ID_PREFIX,
  logForwardingGroupRootId,
  type LogForwardingGroupTreeNode,
} from './logForwardingGroupTreeData';

// Re-export so existing imports from this module continue to work.
export { LOG_FORWARDING_GROUP_ID_PREFIX, logForwardingGroupRootId };

function isNonEmptyApplicationId(a: unknown): a is string {
  return typeof a === 'string' && a.trim().length > 0;
}

/** Compare version ids so the numerically highest / latest id sorts last. */
export function compareLogForwarderVersionIds(a?: string, b?: string): number {
  const sa = a ?? '';
  const sb = b ?? '';
  const an = Number(sa);
  const bn = Number(sb);
  if (sa !== '' && sb !== '' && Number.isFinite(an) && Number.isFinite(bn)) {
    return an - bn;
  }
  return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' });
}

export function pickLatestLogForwarderGroupVersion(
  versions: LogForwarderGroupVersion[] | undefined,
): LogForwarderGroupVersion | undefined {
  if (!versions?.length) {
    return undefined;
  }
  return versions.reduce((best, v) =>
    compareLogForwarderVersionIds(v.id, best.id) > 0 ? v : best,
  );
}

/**
 * Builds the tree for `GroupsApplicationsSelector` from GET /log_forwarding/groups.
 * For each enabled group, picks the single latest version (highest version id) and exposes its applications as leaves.
 */
export function logForwardingGroupVersionsListToTree(
  items: LogForwarderGroupVersions[] | undefined,
): LogForwardingGroupTreeNode[] {
  if (!items?.length) {
    return [];
  }

  const roots = items.flatMap((group): LogForwardingGroupTreeNode[] => {
    if (group.enabled === false) {
      return [];
    }
    const name = group.name?.trim();
    if (!name) {
      return [];
    }
    const latest = pickLatestLogForwarderGroupVersion(group.versions);
    const apps = latest?.applications?.filter(isNonEmptyApplicationId) ?? [];
    if (!apps.length) {
      return [];
    }
    return [
      {
        id: logForwardingGroupRootId(name),
        text: name,
        children: apps.map((app) => ({
          id: app,
          text: app,
        })),
      },
    ];
  });

  roots.sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }));

  return roots;
}

export const LOG_FORWARDING_OTHER_GROUP_NAME = 'Other';
export const LOG_FORWARDING_OTHER_GROUP_ROOT_ID = logForwardingGroupRootId(
  LOG_FORWARDING_OTHER_GROUP_NAME,
);

/**
 * Builds an "Other" tree node for enabled applications that are not already covered by any node in
 * `groupsTree`. Returns `null` when every application is already represented in a group.
 */
export function buildOtherGroupTreeNode(
  applications: LogForwarderApplication[],
  groupsTree: LogForwardingGroupTreeNode[],
): LogForwardingGroupTreeNode | null {
  const coveredIds = new Set<string>();
  groupsTree.forEach((root) => {
    (root.children ?? [root]).forEach((node) => coveredIds.add(node.id));
  });

  const others = applications
    .filter((app) => app.enabled !== false && app.name && !coveredIds.has(app.name))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' }))
    .map((app) => ({ id: app.name as string, text: app.name as string }));

  if (!others.length) {
    return null;
  }

  return {
    id: LOG_FORWARDING_OTHER_GROUP_ROOT_ID,
    text: LOG_FORWARDING_OTHER_GROUP_NAME,
    children: others,
  };
}

/** Merges API group tree nodes with a synthetic "Other" group when needed. */
export function buildLogForwardingTree(
  groupsTree: LogForwardingGroupTreeNode[],
  applications: LogForwarderApplication[],
): LogForwardingGroupTreeNode[] {
  const otherNode = buildOtherGroupTreeNode(applications, groupsTree);
  return otherNode ? [...groupsTree, otherNode] : groupsTree;
}
