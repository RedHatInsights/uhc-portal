import { mockLogForwardingGroupTree } from './logForwardingGroupTreeData';
import { groupSelectedLogForwardingItems } from './logForwardingReviewHelpers';

describe('groupSelectedLogForwardingItems', () => {
  it('groups selected leaf ids under the correct top-level group', () => {
    const grouped = groupSelectedLogForwardingItems(mockLogForwardingGroupTree, [
      'api-audit',
      'api-server',
    ]);
    expect(grouped).toEqual([
      {
        groupLabel: 'API',
        applicationLabels: ['audit', 'apiserver'],
      },
    ]);
  });

  it('returns multiple groups when selections span roots', () => {
    const grouped = groupSelectedLogForwardingItems(mockLogForwardingGroupTree, [
      'controller-manager-child',
      'sample-app',
    ]);
    expect(grouped).toEqual([
      { groupLabel: 'Controller manager', applicationLabels: ['controller manager'] },
      { groupLabel: 'Ungrouped applications', applicationLabels: ['sample-application'] },
    ]);
  });

  it('returns empty array when nothing selected', () => {
    expect(groupSelectedLogForwardingItems(mockLogForwardingGroupTree, [])).toEqual([]);
  });
});
