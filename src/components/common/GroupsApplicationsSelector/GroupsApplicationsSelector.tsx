import React, { useMemo } from 'react';
import { useField } from 'formik';

import {
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  FormGroup,
  Label,
  LabelGroup,
  Stack,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

import type { LogForwardingGroupTreeNode } from './logForwardingGroupTreeData';
import {
  getLogForwardingGroupTreeLeavesById,
  groupSelectedLeavesByRoot,
} from './logForwardingReviewHelpers';

import './GroupsApplicationsSelector.scss';

export type GroupsApplicationsSelectorProps = {
  /** Formik field name; value is an array of selected leaf node ids. */
  name: string;
  /** Tree of groups and applications (e.g. from API or mocks). */
  treeData: LogForwardingGroupTreeNode[];
  availableTitle?: React.ReactNode;
  chosenTitle?: React.ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  availableTooltip?: React.ReactNode;
  chosenTooltip?: React.ReactNode;
  listMinHeight?: string;
  /** Caps the two-card row height; overflow scrolls vertically when content is taller. Pass `""` to disable. */
  containerMaxHeight?: string;
};

/** PatternFly LabelGroup replaces `${remaining}` in this string when collapsing overflow labels. */
const LABEL_GROUP_OVERFLOW_PLACEHOLDER = '{remaining}';
const LABEL_GROUP_OVERFLOW_TEXT = `$${LABEL_GROUP_OVERFLOW_PLACEHOLDER} more`;

export function GroupsApplicationsSelector({
  name,
  treeData,
  availableTitle = 'Select groups and applications',
  chosenTitle = 'Selected groups and applications',
  isRequired = false,
  isDisabled = false,
  availableTooltip,
  chosenTooltip,
  listMinHeight = '300px',
  containerMaxHeight = '800px',
}: GroupsApplicationsSelectorProps) {
  const [field, , helpers] = useField<string[]>(name);
  const chosenLeafIds = useMemo(() => field.value ?? [], [field.value]);

  const memoizedLeavesById = useMemo(() => {
    let leavesById: Record<string, string[]> = {};
    treeData.forEach((root) => {
      leavesById = { ...leavesById, ...getLogForwardingGroupTreeLeavesById(root) };
    });
    return leavesById;
  }, [treeData]);

  const chosenSet = useMemo(() => new Set(chosenLeafIds), [chosenLeafIds]);

  const treeViewData = useMemo(() => {
    const mapGroupTreeToTreeViewData = (nodes: LogForwardingGroupTreeNode[]): TreeViewDataItem[] =>
      nodes.flatMap((node) => {
        const descendentLeafIds = memoizedLeavesById[node.id];
        if (!descendentLeafIds?.length) {
          return [];
        }

        const selectedCount = descendentLeafIds.filter((id) => chosenSet.has(id)).length;
        const isParent = !!(node.children && node.children.length > 0);
        let checked: boolean | null = false;
        if (isParent) {
          if (selectedCount === descendentLeafIds.length) checked = true;
          else if (selectedCount > 0) checked = null;
          else checked = false;
        } else {
          checked = chosenSet.has(node.id);
        }

        const item: TreeViewDataItem = {
          id: node.id,
          name: node.text,
          hasBadge: isParent,
          customBadgeContent: isParent ? String(descendentLeafIds.length) : undefined,
          badgeProps: isParent ? { isRead: true } : undefined,
          checkProps: {
            'aria-label': `Select ${node.text}`,
            checked,
            disabled: isDisabled,
          },
          children: node.children ? mapGroupTreeToTreeViewData(node.children) : undefined,
        };
        return [item];
      });

    return mapGroupTreeToTreeViewData(treeData);
  }, [treeData, chosenSet, memoizedLeavesById, isDisabled]);

  const selectedByGroup = useMemo(
    () => groupSelectedLeavesByRoot(treeData, chosenLeafIds),
    [treeData, chosenLeafIds],
  );

  const onTreeCheck = (event: React.ChangeEvent<HTMLInputElement>, item: TreeViewDataItem) => {
    const nodeId = item.id;
    if (!nodeId) {
      return;
    }
    const leafIds = memoizedLeavesById[nodeId];
    if (!leafIds?.length) {
      return;
    }
    const { checked } = event.target;
    const next = new Set(chosenLeafIds);
    if (checked) {
      leafIds.forEach((id) => next.add(id));
    } else {
      leafIds.forEach((id) => next.delete(id));
    }
    helpers.setValue(Array.from(next));
    helpers.setTouched(true);
  };

  const removeLeaf = (leafId: string) => {
    helpers.setValue(chosenLeafIds.filter((id) => id !== leafId));
    helpers.setTouched(true);
  };

  const removeGroup = (groupRootId: string) => {
    const leafIds = memoizedLeavesById[groupRootId];
    if (!leafIds?.length) {
      return;
    }
    const drop = new Set(leafIds);
    helpers.setValue(chosenLeafIds.filter((id) => !drop.has(id)));
    helpers.setTouched(true);
  };

  const availableFieldId = `${name}-available`;
  const chosenFieldId = `${name}-chosen`;

  const isHeightConstrained = Boolean(containerMaxHeight);

  const flexRowStyle: React.CSSProperties | undefined = isHeightConstrained
    ? { maxHeight: containerMaxHeight, minHeight: 0, overflow: 'hidden' }
    : undefined;

  const flexItemColumnStyle: React.CSSProperties | undefined = isHeightConstrained
    ? { minHeight: 0, display: 'flex', flexDirection: 'column' }
    : undefined;

  const cardFillStyle: React.CSSProperties | undefined = isHeightConstrained
    ? {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }
    : undefined;

  const cardBodyFillStyle: React.CSSProperties | undefined = isHeightConstrained
    ? {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }
    : undefined;

  const availableListStyle: React.CSSProperties = isHeightConstrained
    ? { flex: 1, minHeight: 0, overflow: 'auto' }
    : { minHeight: listMinHeight, overflow: 'auto' };

  const chosenListStyle: React.CSSProperties | undefined = isHeightConstrained
    ? { flex: 1, minHeight: 0, overflow: 'auto' }
    : undefined;

  const formGroupFillClassName = isHeightConstrained
    ? 'groups-applications-selector__form-group--fill'
    : undefined;

  // Wrap with pf-v6-c-form so label font-weight vars apply (Formik <Form> is not PF Form).
  return (
    <div className="pf-v6-c-form" style={{ display: 'contents' }}>
      <Flex
        direction={{ default: 'row' }}
        flexWrap={{ default: 'nowrap' }}
        spaceItems={{ default: 'spaceItemsLg' }}
        alignItems={{ default: 'alignItemsStretch' }}
        style={flexRowStyle}
      >
        <FlexItem flex={{ default: 'flex_1' }} style={flexItemColumnStyle}>
          <Card isFullHeight style={cardFillStyle}>
            <CardBody style={cardBodyFillStyle}>
              <FormGroup
                className={formGroupFillClassName}
                fieldId={availableFieldId}
                label={availableTitle}
                labelHelp={availableTooltip ? <PopoverHint hint={availableTooltip} /> : undefined}
                isRequired={isRequired}
              >
                <div id={availableFieldId} className="pf-v6-u-mt-md" style={availableListStyle}>
                  <TreeView
                    data={treeViewData}
                    hasCheckboxes
                    isMultiSelectable
                    onCheck={onTreeCheck}
                    aria-label={
                      typeof availableTitle === 'string'
                        ? availableTitle
                        : 'Groups and applications'
                    }
                  />
                </div>
              </FormGroup>
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem flex={{ default: 'flex_1' }} style={flexItemColumnStyle}>
          <Card isFullHeight style={cardFillStyle}>
            <CardBody style={cardBodyFillStyle}>
              <FormGroup
                className={formGroupFillClassName}
                fieldId={chosenFieldId}
                label={chosenTitle}
                labelHelp={chosenTooltip ? <PopoverHint hint={chosenTooltip} /> : undefined}
                isRequired={isRequired}
              >
                <div id={chosenFieldId} className="pf-v6-u-mt-md" style={chosenListStyle}>
                  {chosenLeafIds.length === 0 ? (
                    <EmptyState
                      headingLevel="h4"
                      titleText="No groups or applications selected"
                      variant={EmptyStateVariant.sm}
                    >
                      <EmptyStateBody>Select items from the list on the left.</EmptyStateBody>
                    </EmptyState>
                  ) : (
                    <Stack hasGutter>
                      {selectedByGroup.map(({ groupRootId, groupLabel, leaves }) => (
                        <div key={groupRootId} style={{ minWidth: 0 }}>
                          <LabelGroup
                            categoryName={groupLabel}
                            numLabels={8}
                            collapsedText={LABEL_GROUP_OVERFLOW_TEXT}
                            isClosable={!isDisabled}
                            closeBtnAriaLabel={`Remove all applications in ${groupLabel}`}
                            onClick={() => removeGroup(groupRootId)}
                          >
                            {leaves.map(({ id, text }) => (
                              <Label
                                key={id}
                                variant="filled"
                                onClose={
                                  isDisabled
                                    ? undefined
                                    : (e) => {
                                        e.stopPropagation();
                                        removeLeaf(id);
                                      }
                                }
                                closeBtnAriaLabel={`Remove ${text}`}
                              >
                                {text}
                              </Label>
                            ))}
                          </LabelGroup>
                        </div>
                      ))}
                    </Stack>
                  )}
                </div>
              </FormGroup>
            </CardBody>
          </Card>
        </FlexItem>
      </Flex>
    </div>
  );
}
