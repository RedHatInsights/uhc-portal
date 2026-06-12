import React from 'react';

import {
  Alert,
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

import getClusterName from '~/common/getClusterName';
import type { LogForwardingDestinationKind } from '~/components/clusters/wizards/rosa/LogForwarding/buildClusterLogForwarders';
import type { LogForwardingGroupTreeNode } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import {
  expandLogForwarderSelectionToLeafIds,
  groupSelectedLogForwardingItems,
} from '~/components/common/GroupsApplicationsSelector/logForwardingReviewHelpers';
import { useFetchClusterControlPlaneLogForwarders } from '~/queries/ClusterDetailsQueries/useFetchClusterControlPlaneLogForwarders';
import { HCP_LOG_FORWARDING } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useFetchLogForwardingGroupsCatalog } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroupsCatalog';
import type { LogForwarder, LogForwarderStatus } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import { isHibernating, isHypershiftCluster, isROSA } from '../../../common/clusterStates';

import { AddEditLogForwardingModal } from './components/AddEditLogForwardingModal';
import { DeleteLogForwardingModal } from './components/DeleteLogForwardingModal';

/** PatternFly LabelGroup replaces `${remaining}` when collapsing overflow labels. */
const LABEL_GROUP_OVERFLOW_PLACEHOLDER = '{remaining}';
const LABEL_GROUP_OVERFLOW_TEXT = `$${LABEL_GROUP_OVERFLOW_PLACEHOLDER} more`;

const noneLabel = <span className="pf-v6-u-disabled-color-100">None</span>;

type ModalState =
  | {
      kind: 'add-edit';
      destinationType: LogForwardingDestinationKind;
      mode: 'add' | 'edit';
      forwarder?: LogForwarder;
    }
  | {
      kind: 'delete';
      destinationType: LogForwardingDestinationKind;
      forwarder: LogForwarder;
    }
  | null;

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
    return noneLabel;
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

type ConfigColumn = { term: string; description: React.ReactNode };

function ForwarderConfigColumns({
  columns,
  forwarder,
}: {
  columns: ConfigColumn[];
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

function LogDestinationCard({
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
  columns: ConfigColumn[];
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

function AddConfigurationDropdown({
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

const ControlPlaneLogForwardingSection = ({ cluster }: { cluster: AugmentedCluster }) => {
  const clusterID = cluster.id;
  const region = cluster.subscription?.rh_region_id;
  const isHypershift = isHypershiftCluster(cluster);
  const isRosa = isROSA(cluster);
  const isHcpLogForwardingEnabled = useFeatureGate(HCP_LOG_FORWARDING);
  const showSection = isHypershift && isRosa && isHcpLogForwardingEnabled;

  const [modalState, setModalState] = React.useState<ModalState>(null);

  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const clusterHibernating = isHibernating(cluster);
  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  const disableReason = readOnlyReason || hibernatingReason || undefined;
  const canManage = !!cluster.canEdit && !disableReason;

  const {
    data: forwarders = [],
    isLoading: isForwardersLoading,
    isError: isForwardersError,
    error: forwardersError,
  } = useFetchClusterControlPlaneLogForwarders(clusterID, region, {
    enabled: showSection,
  });

  const { data: catalogTree = [], isLoading: isCatalogLoading } =
    useFetchLogForwardingGroupsCatalog({ enabled: showSection });

  if (!showSection || !clusterID) {
    return null;
  }

  const treeLoading = isCatalogLoading;
  const s3Forwarder = forwarders.find((f) => f.s3);
  const cloudWatchForwarder = forwarders.find((f) => f.cloudwatch);
  const hasAnyForwarder = forwarders.length > 0;
  const clusterName = getClusterName(cluster);

  const openAddModal = (destinationType: LogForwardingDestinationKind) => {
    setModalState({ kind: 'add-edit', destinationType, mode: 'add' });
  };

  const openEditModal = (
    destinationType: LogForwardingDestinationKind,
    forwarder: LogForwarder,
  ) => {
    setModalState({ kind: 'add-edit', destinationType, mode: 'edit', forwarder });
  };

  const openDeleteModal = (
    destinationType: LogForwardingDestinationKind,
    forwarder: LogForwarder,
  ) => {
    setModalState({ kind: 'delete', destinationType, forwarder });
  };

  const closeModal = () => setModalState(null);

  return (
    <>
      <Card>
        <CardTitle>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
          >
            <Title headingLevel="h2" size="xl">
              Control plane log forwarding
            </Title>
            <AddConfigurationDropdown
              canAddS3={!s3Forwarder}
              canAddCloudWatch={!cloudWatchForwarder}
              canManage={canManage}
              disableReason={disableReason}
              onSelect={openAddModal}
            />
          </Flex>
        </CardTitle>
        <CardBody>
          <Stack hasGutter>
            {isForwardersLoading ? (
              <Spinner aria-label="Loading log forwarding configuration" />
            ) : null}

            {isForwardersError ? (
              <Alert variant="danger" isInline title="Could not load control plane log forwarding">
                {forwardersError &&
                typeof forwardersError === 'object' &&
                'errorMessage' in forwardersError &&
                forwardersError.errorMessage
                  ? String(forwardersError.errorMessage)
                  : 'Request failed'}
              </Alert>
            ) : null}

            {!isForwardersLoading && !isForwardersError && !hasAnyForwarder ? (
              <span className="pf-v6-u-color-text-subtle">No log forwarding configured.</span>
            ) : null}

            {!isForwardersLoading && !isForwardersError && s3Forwarder ? (
              <LogDestinationCard
                title="Amazon S3"
                forwarder={s3Forwarder}
                tree={catalogTree}
                treeLoading={treeLoading}
                canManage={canManage}
                onEdit={() => openEditModal('s3', s3Forwarder)}
                onDelete={() => openDeleteModal('s3', s3Forwarder)}
                columns={[
                  {
                    term: 'Configuration',
                    description: 'Enabled',
                  },
                  {
                    term: 'Bucket name',
                    description: s3Forwarder.s3?.bucket_name?.trim() || noneLabel,
                  },
                  {
                    term: 'Bucket prefix',
                    description: s3Forwarder.s3?.bucket_prefix?.trim() || noneLabel,
                  },
                ]}
              />
            ) : null}

            {!isForwardersLoading && !isForwardersError && cloudWatchForwarder ? (
              <LogDestinationCard
                title="CloudWatch"
                forwarder={cloudWatchForwarder}
                tree={catalogTree}
                treeLoading={treeLoading}
                canManage={canManage}
                onEdit={() => openEditModal('cloudwatch', cloudWatchForwarder)}
                onDelete={() => openDeleteModal('cloudwatch', cloudWatchForwarder)}
                columns={[
                  {
                    term: 'Configuration',
                    description: 'Enabled',
                  },
                  {
                    term: 'Log group name',
                    description:
                      cloudWatchForwarder.cloudwatch?.log_group_name?.trim() || noneLabel,
                  },
                  {
                    term: 'Role ARN',
                    description: cloudWatchForwarder.cloudwatch?.log_distribution_role_arn ? (
                      <span
                        className="pf-v6-u-text-break-word"
                        title={cloudWatchForwarder.cloudwatch.log_distribution_role_arn}
                      >
                        {cloudWatchForwarder.cloudwatch.log_distribution_role_arn}
                      </span>
                    ) : (
                      noneLabel
                    ),
                  },
                ]}
              />
            ) : null}
          </Stack>
        </CardBody>
      </Card>

      {modalState?.kind === 'add-edit' ? (
        <AddEditLogForwardingModal
          clusterId={clusterID}
          region={region}
          destinationType={modalState.destinationType}
          mode={modalState.mode}
          forwarder={modalState.forwarder}
          catalogTree={catalogTree}
          clusterName={clusterName}
          isOpen
          onClose={closeModal}
        />
      ) : null}

      {modalState?.kind === 'delete' ? (
        <DeleteLogForwardingModal
          clusterId={clusterID}
          region={region}
          destinationType={modalState.destinationType}
          forwarder={modalState.forwarder}
          isOpen
          onClose={closeModal}
        />
      ) : null}
    </>
  );
};

export default ControlPlaneLogForwardingSection;
