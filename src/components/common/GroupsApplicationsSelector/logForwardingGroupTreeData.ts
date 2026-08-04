export type LogForwardingGroupTreeNode = {
  id: string;
  text: string;
  children?: LogForwardingGroupTreeNode[];
};

/** Prefix for synthetic group root ids so they do not collide with application ids from the API. */
export const LOG_FORWARDING_GROUP_ID_PREFIX = 'lfg:';

/** Returns the canonical root-node id for a log forwarding group (e.g. `'lfg:API'`). */
export function logForwardingGroupRootId(groupName: string): string {
  return `${LOG_FORWARDING_GROUP_ID_PREFIX}${groupName}`;
}

/**
 * Test and Storybook fixture; not from the API.
 *
 * Root node ids use `logForwardingGroupRootId()` so they match the shape produced by
 * `logForwardingGroupVersionsListToTree`. Leaf ids are intentionally unique across the mock
 * (unlike the real API where leaf ids equal the application name) to keep test cases distinct.
 */
export const mockLogForwardingGroupTree: LogForwardingGroupTreeNode[] = [
  {
    id: logForwardingGroupRootId('API'),
    text: 'API',
    children: [
      { id: 'api-audit', text: 'audit' },
      { id: 'api-server', text: 'apiserver' },
    ],
  },
  {
    id: logForwardingGroupRootId('Authentication'),
    text: 'Authentication',
    children: [
      { id: 'auth-kube-apiserver', text: 'kube-apiserver' },
      { id: 'auth-konnectivity-agent', text: 'konnectivity-agent' },
    ],
  },
  {
    id: logForwardingGroupRootId('Controller manager'),
    text: 'Controller manager',
    children: [{ id: 'controller-manager-child', text: 'controller manager' }],
  },
  {
    id: logForwardingGroupRootId('Ungrouped applications'),
    text: 'Ungrouped applications',
    children: [{ id: 'sample-app', text: 'sample-application' }],
  },
];

const LABEL_GROUP_OVERFLOW_LEAF_COUNT = 12;

/**
 * Storybook / manual testing: one root group with many leaves so the chosen pane LabelGroup shows
 * overflow (`numLabels={8}` → “$N more” in GroupsApplicationsSelector).
 */
export const mockLogForwardingGroupTreeLabelGroupOverflow: LogForwardingGroupTreeNode[] = [
  {
    id: 'overflow-demo-group',
    text: 'Many applications',
    children: Array.from({ length: LABEL_GROUP_OVERFLOW_LEAF_COUNT }, (_, index) => {
      const n = index + 1;
      return { id: `overflow-demo-app-${n}`, text: `App ${n}` };
    }),
  },
];

/** All leaf ids under {@link mockLogForwardingGroupTreeLabelGroupOverflow} (for story initial values). */
export const mockLogForwardingGroupTreeLabelGroupOverflowAllLeafIds: string[] =
  mockLogForwardingGroupTreeLabelGroupOverflow[0].children?.map((leaf) => leaf.id) ?? [];
