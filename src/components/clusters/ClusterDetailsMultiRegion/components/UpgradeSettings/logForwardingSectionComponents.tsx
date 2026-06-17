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
  MenuToggle,
  Spinner,
  Stack,
  Title,
  Tooltip,
  Truncate,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import EllipsisVIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';
import OutlinedClockIcon from '@patternfly/react-icons/dist/esm/icons/outlined-clock-icon';

import type { LogForwardingDestinationKind } from '~/components/clusters/wizards/rosa/LogForwarding/buildClusterLogForwarders';
import type { LogForwardingGroupTreeNode } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { expandLogForwarderSelectionToLeafIds } from '~/components/common/GroupsApplicationsSelector/logForwardingReviewHelpers';
import {
  logForwardingNoneLabel,
  LogForwardingSelectedAppsDescription,
} from '~/components/common/GroupsApplicationsSelector/LogForwardingSelectedAppsDescription';
import type { LogForwarder, LogForwarderStatus } from '~/types/clusters_mgmt.v1';

export { logForwardingNoneLabel };

export type LogForwardingConfigColumn = { term: string; description: React.ReactNode };

/**
 * MenuToggle applies pointer-events: none when disabled, so Tooltip cannot target it directly.
 * Button avoids this via isAriaDisabled (see ButtonWithTooltip); MenuToggle has no equivalent.
 * Link the tooltip to a wrapper span via triggerRef instead (see Tooltips.tsx).
 */
function MenuToggleDisableTooltip({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactElement;
}) {
  const triggerRef = React.useRef<HTMLSpanElement>(null);

  return (
    <>
      <Tooltip content={content} triggerRef={triggerRef} />
      <span ref={triggerRef} className="pf-v6-u-display-inline-block">
        {children}
      </span>
    </>
  );
}

const LOG_FORWARDER_READY_STATES = ['ready'];
const LOG_FORWARDER_PENDING_STATES = ['pending', 'in_progress', 'progress', 'waiting'];

function formatForwarderStatus(status: LogForwarderStatus | undefined): {
  label: string;
  icon: React.ReactNode;
} {
  const raw = status?.state ?? '';
  const state = raw.toLowerCase();
  if (LOG_FORWARDER_READY_STATES.includes(state)) {
    return {
      label: 'Ready',
      icon: (
        <Icon status="success">
          <CheckCircleIcon aria-hidden />
        </Icon>
      ),
    };
  }
  if (LOG_FORWARDER_PENDING_STATES.includes(state)) {
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
  return (
    <LogForwardingSelectedAppsDescription selectedIds={leafIds} tree={tree} treeLoading={false} />
  );
}

function ForwarderConfigDescription({ description }: { description: React.ReactNode }) {
  if (typeof description === 'string' && description.length > 0) {
    return <Truncate content={description} position="middle" />;
  }

  return description;
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
            <div className="pf-v6-u-min-width-0">
              <ForwarderConfigDescription description={col.description} />
            </div>
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
  disableReason,
  onEdit,
  onDelete,
}: {
  title: string;
  forwarder: LogForwarder;
  tree: LogForwardingGroupTreeNode[];
  treeLoading: boolean;
  columns: LogForwardingConfigColumn[];
  canManage: boolean;
  disableReason?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);
  const kebabToggleRef = React.useRef<HTMLButtonElement>(null);

  const kebabToggle = (
    <MenuToggle
      ref={kebabToggleRef}
      variant="plain"
      aria-label={`${title} configuration actions`}
      onClick={() => {
        if (!canManage) {
          return;
        }
        setIsKebabOpen(!isKebabOpen);
      }}
      isExpanded={isKebabOpen}
      isDisabled={!canManage}
    >
      <EllipsisVIcon />
    </MenuToggle>
  );

  const kebabToggleNode =
    disableReason && !canManage ? (
      <MenuToggleDisableTooltip content={disableReason}>{kebabToggle}</MenuToggleDisableTooltip>
    ) : (
      kebabToggle
    );

  const kebabMenu = (
    <Dropdown
      isOpen={isKebabOpen}
      onOpenChange={(open) => {
        if (!canManage) {
          return;
        }
        setIsKebabOpen(open);
      }}
      popperProps={{ position: 'right', appendTo: () => document.body }}
      toggle={{
        toggleRef: kebabToggleRef,
        toggleNode: kebabToggleNode,
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
  );

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
          {kebabMenu}
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

  const menuToggle = (
    <MenuToggle
      ref={addToggleRef}
      variant="secondary"
      onClick={() => {
        if (isDisabled) {
          return;
        }
        setIsOpen(!isOpen);
      }}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      aria-label="Add configuration"
    >
      Add configuration
    </MenuToggle>
  );

  const toggleNode =
    disableReason && isDisabled ? (
      <MenuToggleDisableTooltip content={disableReason}>{menuToggle}</MenuToggleDisableTooltip>
    ) : (
      menuToggle
    );

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (isDisabled) {
          return;
        }
        setIsOpen(open);
      }}
      popperProps={{ appendTo: () => document.body }}
      toggle={{
        toggleRef: addToggleRef,
        toggleNode,
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
}
