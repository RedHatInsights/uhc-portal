import React from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  Label,
  LabelGroup,
  MenuToggle,
  Spinner,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import EllipsisVIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';
import OutlinedClockIcon from '@patternfly/react-icons/dist/esm/icons/outlined-clock-icon';

import type { LogForwardingDestinationKind } from '~/components/clusters/wizards/rosa/LogForwarding/buildClusterLogForwarders';
import type { LogForwardingGroupTreeNode } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import {
  expandLogForwarderSelectionToLeafIds,
  groupSelectedLogForwardingItems,
} from '~/components/common/GroupsApplicationsSelector/logForwardingReviewHelpers';
import type { LogForwarder, LogForwarderStatus } from '~/types/clusters_mgmt.v1';

/** PatternFly LabelGroup replaces `${remaining}` when collapsing overflow labels. */
const LABEL_GROUP_OVERFLOW_PLACEHOLDER = '{remaining}';
const LABEL_GROUP_OVERFLOW_TEXT = `$${LABEL_GROUP_OVERFLOW_PLACEHOLDER} more`;

export const logForwardingNoneLabel = <span className="pf-v6-u-disabled-color-100">None</span>;

export type LogForwardingConfigColumn = { term: string; description: React.ReactNode };

function formatForwarderStatus(status: LogForwarderStatus | undefined): {
  label: string;
  icon: React.ReactNode;
} {
  const raw = status?.state ?? '';
  const state = raw.toLowerCase();
  if (state.includes('ready')) {
    return {
      label: 'Ready',
      icon: (
        <Icon status="success">
          <CheckCircleIcon aria-hidden />
        </Icon>
      ),
    };
  }
  if (state.includes('pending') || state.includes('progress') || state.includes('waiting')) {
    return {
      label: raw ? raw.replace(/_/g, ' ') : 'Pending',
      icon: <OutlinedClockIcon className="pf-v6-u-color-text-subtle" aria-hidden />,
    };
  }
  return {
    label: raw || 'Unknown',
    icon: <OutlinedClockIcon className="pf-v6-u-color-text-subtle" aria-hidden />,
  };
}

function SelectedGroupsApplicationsLabels({
  forwarder,
  tree,
  treeLoading,
}: {
  forwarder: LogForwarder;
  tree: LogForwardingGroupTreeNode[];
  treeLoading: boolean;
}) {
  if (treeLoading) {
    return <Spinner size="sm" aria-label="Loading groups catalog" />;
  }
  const leafIds = expandLogForwarderSelectionToLeafIds(forwarder, tree);
  if (leafIds.length === 0) {
    return logForwardingNoneLabel;
  }
  const grouped = groupSelectedLogForwardingItems(tree, leafIds);
  if (!grouped.length) {
    return <>{leafIds.join(', ')}</>;
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

function ForwarderConfigColumns({
  columns,
  forwarder,
}: {
  columns: LogForwardingConfigColumn[];
  forwarder: LogForwarder;
}) {
  const statusDisplay = formatForwarderStatus(forwarder.status);

  return (
    <Flex
      direction={{ default: 'row' }}
      flexWrap={{ default: 'wrap' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      gap={{ default: 'gapXl' }}
    >
      {columns.map((col) => (
        <FlexItem key={col.term} flex={{ default: 'flex_1' }} className="pf-v6-u-min-width-0">
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
            <span className="pf-v6-u-font-weight-bold">{col.term}</span>
            <div>{col.description}</div>
          </Flex>
        </FlexItem>
      ))}
      <FlexItem flex={{ default: 'flex_1' }} className="pf-v6-u-min-width-0">
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
          <span className="pf-v6-u-font-weight-bold">Status</span>
          <div className="pf-v6-u-min-width-0">
            <Flex
              direction={{ default: 'row' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              {statusDisplay.icon}
              <span>{statusDisplay.label}</span>
            </Flex>
          </div>
        </Flex>
      </FlexItem>
    </Flex>
  );
}

export function LogDestinationCard({
  title,
  forwarder,
  tree,
  treeLoading,
  columns,
  canManage,
  onEdit,
  onDelete,
}: {
  title: string;
  forwarder: LogForwarder;
  tree: LogForwardingGroupTreeNode[];
  treeLoading: boolean;
  columns: LogForwardingConfigColumn[];
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);
  const kebabToggleRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Card isCompact>
      <CardTitle>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <Title headingLevel="h3" size="lg">
            {title}
          </Title>
          <Dropdown
            isOpen={isKebabOpen}
            onOpenChange={(open) => setIsKebabOpen(open)}
            popperProps={{ position: 'right', appendTo: () => document.body }}
            toggle={{
              toggleRef: kebabToggleRef,
              toggleNode: (
                <MenuToggle
                  ref={kebabToggleRef}
                  variant="plain"
                  aria-label={`${title} configuration actions`}
                  onClick={() => setIsKebabOpen(!isKebabOpen)}
                  isExpanded={isKebabOpen}
                  isDisabled={!canManage}
                >
                  <EllipsisVIcon />
                </MenuToggle>
              ),
            }}
          >
            <DropdownList>
              <DropdownItem
                key="edit"
                isDisabled={!canManage}
                onClick={() => {
                  setIsKebabOpen(false);
                  onEdit();
                }}
              >
                Edit configuration
              </DropdownItem>
              <DropdownItem
                key="delete"
                isDisabled={!canManage}
                onClick={() => {
                  setIsKebabOpen(false);
                  onDelete();
                }}
              >
                Delete configuration
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </Flex>
      </CardTitle>
      <CardBody>
        <Stack hasGutter>
          <ForwarderConfigColumns columns={columns} forwarder={forwarder} />
          <div>
            <Title headingLevel="h5" size="md" className="pf-v6-u-mb-sm">
              Selected groups and applications
            </Title>
            <SelectedGroupsApplicationsLabels
              forwarder={forwarder}
              tree={tree}
              treeLoading={treeLoading}
            />
          </div>
        </Stack>
      </CardBody>
    </Card>
  );
}

export function AddConfigurationDropdown({
  canAddS3,
  canAddCloudWatch,
  canManage,
  disableReason,
  onSelect,
}: {
  canAddS3: boolean;
  canAddCloudWatch: boolean;
  canManage: boolean;
  disableReason?: string;
  onSelect: (destinationType: LogForwardingDestinationKind) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isDisabled = !canManage || (!canAddS3 && !canAddCloudWatch);
  const addToggleRef = React.useRef<HTMLButtonElement>(null);

  const dropdown = (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      popperProps={{ appendTo: () => document.body }}
      toggle={{
        toggleRef: addToggleRef,
        toggleNode: (
          <MenuToggle
            ref={addToggleRef}
            variant="secondary"
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            isDisabled={isDisabled}
            aria-label="Add configuration"
          >
            Add configuration
          </MenuToggle>
        ),
      }}
    >
      <DropdownList>
        {canAddS3 ? (
          <DropdownItem
            key="s3"
            onClick={() => {
              setIsOpen(false);
              onSelect('s3');
            }}
          >
            Amazon S3
          </DropdownItem>
        ) : null}
        {canAddCloudWatch ? (
          <DropdownItem
            key="cloudwatch"
            onClick={() => {
              setIsOpen(false);
              onSelect('cloudwatch');
            }}
          >
            CloudWatch
          </DropdownItem>
        ) : null}
      </DropdownList>
    </Dropdown>
  );

  if (disableReason && isDisabled) {
    return <Tooltip content={disableReason}>{dropdown}</Tooltip>;
  }

  return dropdown;
}
