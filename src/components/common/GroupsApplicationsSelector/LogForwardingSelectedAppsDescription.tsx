import React from 'react';

import { Label, LabelGroup, Spinner, Stack, StackItem } from '@patternfly/react-core';

import type { LogForwardingGroupTreeNode } from './logForwardingGroupTreeData';
import { groupSelectedLogForwardingItems } from './logForwardingReviewHelpers';

export const logForwardingNoneLabel = <span className="pf-v6-u-disabled-color-100">None</span>;

/** PatternFly LabelGroup replaces `${remaining}` when collapsing overflow labels. */
const LABEL_GROUP_OVERFLOW_PLACEHOLDER = '{remaining}';
const LABEL_GROUP_OVERFLOW_TEXT = `$${LABEL_GROUP_OVERFLOW_PLACEHOLDER} more`;

export function LogForwardingSelectedAppsDescription({
  selectedIds,
  tree,
  treeLoading,
}: {
  selectedIds: string[];
  tree: LogForwardingGroupTreeNode[];
  treeLoading: boolean;
}) {
  if (selectedIds.length === 0) {
    return logForwardingNoneLabel;
  }
  if (treeLoading) {
    return <Spinner size="sm" aria-label="Loading selected applications" />;
  }
  const grouped = groupSelectedLogForwardingItems(tree, selectedIds);
  if (!grouped.length) {
    return <>{selectedIds.join(', ')}</>;
  }
  return (
    <Stack hasGutter>
      {grouped.map(({ groupLabel, applicationLabels }) => (
        <StackItem key={groupLabel}>
          <LabelGroup
            numLabels={3}
            collapsedText={LABEL_GROUP_OVERFLOW_TEXT}
            isCompact
            aria-label={`Applications for ${groupLabel}`}
            categoryName={groupLabel}
          >
            {applicationLabels.map((text) => (
              <Label key={`${groupLabel}-${text}`} variant="filled" isCompact>
                {text}
              </Label>
            ))}
          </LabelGroup>
        </StackItem>
      ))}
    </Stack>
  );
}
