import {
  compareLogForwarderVersionIds,
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

  it('uses a single root leaf when only one application', () => {
    const tree = logForwardingGroupVersionsListToTree([
      {
        name: 'Controller manager',
        enabled: true,
        versions: [{ id: '1', applications: ['controller-manager'] }],
      },
    ]);
    expect(tree).toEqual([{ id: 'controller-manager', text: 'Controller manager' }]);
  });
});
