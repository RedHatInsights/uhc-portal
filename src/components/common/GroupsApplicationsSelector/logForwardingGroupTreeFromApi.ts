import type { LogForwarderGroupVersion, LogForwarderGroupVersions } from '~/types/clusters_mgmt.v1';

import type { LogForwardingGroupTreeNode } from './logForwardingGroupTreeData';

/** Prefix for synthetic group root ids so they do not collide with application ids from the API. */
export const LOG_FORWARDING_GROUP_ID_PREFIX = 'lfg:';

export function logForwardingGroupRootId(groupName: string): string {
  return `${LOG_FORWARDING_GROUP_ID_PREFIX}${groupName}`;
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
    const apps = latest?.applications?.filter((a) => a?.trim()) ?? [];
    if (!apps.length) {
      return [];
    }
    if (apps.length === 1) {
      return [{ id: apps[0], text: name }];
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
