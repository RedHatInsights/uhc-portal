import {
  buildLogForwardingTree,
  buildOtherGroupTreeNode,
  compareLogForwarderVersionIds,
  LOG_FORWARDING_OTHER_GROUP_NAME,
  LOG_FORWARDING_OTHER_GROUP_ROOT_ID,
  logForwardingGroupRootId,
  logForwardingGroupVersionsListToTree,
  pickLatestLogForwarderGroupVersion,
} from './logForwardingGroupTreeFromApi';

describe('compareLogForwarderVersionIds', () => {
  it('orders numeric ids numerically', () => {
    expect(compareLogForwarderVersionIds('2', '10')).toBeLessThan(0);
    expect(compareLogForwarderVersionIds('10', '2')).toBeGreaterThan(0);
  });

  it('uses locale-aware compare for non-numeric', () => {
    expect(compareLogForwarderVersionIds('v1', 'v2')).toBeLessThan(0);
  });
});

describe('pickLatestLogForwarderGroupVersion', () => {
  it('returns the highest version by id', () => {
    const latest = pickLatestLogForwarderGroupVersion([
      { id: '1', applications: ['a'] },
      { id: '10', applications: ['b'] },
      { id: '2', applications: ['c'] },
    ]);
    expect(latest?.id).toBe('10');
    expect(latest?.applications).toEqual(['b']);
  });

  it('returns undefined when versions are missing or empty', () => {
    expect(pickLatestLogForwarderGroupVersion(undefined)).toBeUndefined();
    expect(pickLatestLogForwarderGroupVersion([])).toBeUndefined();
  });
});

describe('logForwardingGroupVersionsListToTree', () => {
  it('skips disabled groups and picks latest version only', () => {
    const tree = logForwardingGroupVersionsListToTree([
      {
        name: 'API',
        enabled: true,
        versions: [
          { id: '1', applications: ['old'] },
          { id: '2', applications: ['audit', 'apiserver'] },
        ],
      },
      { name: 'Off', enabled: false, versions: [{ id: '9', applications: ['x'] }] },
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0].text).toBe('API');
    expect(tree[0].id).toBe(logForwardingGroupRootId('API'));
    expect(tree[0].children?.map((c) => c.id)).toEqual(['audit', 'apiserver']);
  });

  it('keeps a single-app group as a parent node with the application name as the leaf', () => {
    const tree = logForwardingGroupVersionsListToTree([
      {
        name: 'scheduler',
        enabled: true,
        versions: [{ id: '1', applications: ['kube-scheduler'] }],
      },
    ]);
    expect(tree).toEqual([
      {
        id: logForwardingGroupRootId('scheduler'),
        text: 'scheduler',
        children: [{ id: 'kube-scheduler', text: 'kube-scheduler' }],
      },
    ]);
  });

  it('skips blank group names and versions without applications', () => {
    const tree = logForwardingGroupVersionsListToTree([
      { name: '   ', enabled: true, versions: [{ id: '1', applications: ['app'] }] },
      { name: 'Empty', enabled: true, versions: [{ id: '1', applications: [] }] },
      {
        name: 'API',
        enabled: true,
        versions: [{ id: '1', applications: ['audit'] }],
      },
    ]);

    expect(tree).toEqual([
      {
        id: logForwardingGroupRootId('API'),
        text: 'API',
        children: [{ id: 'audit', text: 'audit' }],
      },
    ]);
  });

  it('sorts root nodes alphabetically by display name', () => {
    const tree = logForwardingGroupVersionsListToTree([
      {
        name: 'Zulu',
        enabled: true,
        versions: [{ id: '1', applications: ['z-app'] }],
      },
      {
        name: 'Alpha',
        enabled: true,
        versions: [{ id: '1', applications: ['a-one', 'a-two'] }],
      },
    ]);

    expect(tree.map((node) => node.text)).toEqual(['Alpha', 'Zulu']);
    expect(tree[0].children?.map((child) => child.id)).toEqual(['a-one', 'a-two']);
  });
});

describe('buildOtherGroupTreeNode', () => {
  const groupsTree = [
    {
      id: logForwardingGroupRootId('API'),
      text: 'API',
      children: [
        { id: 'audit-webhook', text: 'audit-webhook' },
        { id: 'kube-apiserver', text: 'kube-apiserver' },
      ],
    },
    {
      id: logForwardingGroupRootId('scheduler'),
      text: 'scheduler',
      children: [{ id: 'kube-scheduler', text: 'kube-scheduler' }],
    },
  ];

  it('returns null when all applications are already covered by a group', () => {
    const apps = [
      { name: 'audit-webhook', enabled: true },
      { name: 'kube-apiserver', enabled: true },
      { name: 'kube-scheduler', enabled: true },
    ];
    expect(buildOtherGroupTreeNode(apps, groupsTree)).toBeNull();
  });

  it('builds an Other node for applications not in any group', () => {
    const apps = [
      { name: 'audit-webhook', enabled: true },
      { name: 'kube-apiserver', enabled: true },
      { name: 'etcd', enabled: true },
      { name: 'private-router', enabled: true },
    ];
    const result = buildOtherGroupTreeNode(apps, groupsTree);
    expect(result).toEqual({
      id: LOG_FORWARDING_OTHER_GROUP_ROOT_ID,
      text: LOG_FORWARDING_OTHER_GROUP_NAME,
      children: [
        { id: 'etcd', text: 'etcd' },
        { id: 'private-router', text: 'private-router' },
      ],
    });
  });

  it('excludes disabled applications from Other', () => {
    const apps = [
      { name: 'etcd', enabled: false },
      { name: 'private-router', enabled: true },
    ];
    const result = buildOtherGroupTreeNode(apps, groupsTree);
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0].id).toBe('private-router');
  });

  it('sorts Other children alphabetically', () => {
    const apps = [
      { name: 'zoo-app', enabled: true },
      { name: 'alpha-app', enabled: true },
      { name: 'mid-app', enabled: true },
    ];
    const result = buildOtherGroupTreeNode(apps, []);
    expect(result?.children?.map((c) => c.id)).toEqual(['alpha-app', 'mid-app', 'zoo-app']);
  });

  it('returns null when the applications list is empty', () => {
    expect(buildOtherGroupTreeNode([], groupsTree)).toBeNull();
  });

  it('buildLogForwardingTree returns groups only when no orphan applications exist', () => {
    expect(buildLogForwardingTree(groupsTree, [])).toEqual(groupsTree);
  });

  it('buildLogForwardingTree appends the Other group when orphan applications exist', () => {
    const tree = buildLogForwardingTree(groupsTree, [{ name: 'orphan-app', enabled: true }]);
    expect(tree).toHaveLength(groupsTree.length + 1);
    expect(tree.at(-1)?.text).toBe(LOG_FORWARDING_OTHER_GROUP_NAME);
    expect(tree.at(-1)?.children?.map((c) => c.id)).toEqual(['orphan-app']);
  });
});
