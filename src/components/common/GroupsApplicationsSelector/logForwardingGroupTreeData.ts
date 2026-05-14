export type LogForwardingGroupTreeNode = {
  id: string;
  text: string;
  children?: LogForwardingGroupTreeNode[];
};

/** Test and Storybook fixture; not from the API. */
export const mockLogForwardingGroupTree: LogForwardingGroupTreeNode[] = [
  {
    id: 'api',
    text: 'API',
    children: [
      { id: 'api-audit', text: 'audit' },
      { id: 'api-server', text: 'apiserver' },
    ],
  },
  {
    id: 'authentication',
    text: 'Authentication',
    children: [
      { id: 'auth-kube-apiserver', text: 'kube-apiserver' },
      { id: 'auth-konnectivity-agent', text: 'konnectivity-agent' },
    ],
  },
  {
    id: 'controller-manager',
    text: 'Controller manager',
    children: [{ id: 'controller-manager-child', text: 'controller manager' }],
  },
  {
    id: 'ungrouped-applications',
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
