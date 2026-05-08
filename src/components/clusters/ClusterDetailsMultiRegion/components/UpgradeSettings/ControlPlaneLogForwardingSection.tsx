import React from 'react';

import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import OutlinedClockIcon from '@patternfly/react-icons/dist/esm/icons/outlined-clock-icon';

import type { LogForwardingGroupTreeNode } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import {
  expandLogForwarderSelectionToLeafIds,
  groupSelectedLogForwardingItems,
} from '~/components/common/GroupsApplicationsSelector/logForwardingReviewHelpers';
import { useFetchClusterControlPlaneLogForwarders } from '~/queries/ClusterDetailsQueries/useFetchClusterControlPlaneLogForwarders';
import { useFetchLogForwardingGroupsCatalog } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroupsCatalog';
import type { LogForwarder, LogForwarderStatus } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import { isHypershiftCluster, isROSA } from '../../../common/clusterStates';

/** PatternFly LabelGroup replaces `${remaining}` when collapsing overflow labels. */
const LABEL_GROUP_OVERFLOW_PLACEHOLDER = '{remaining}';
const LABEL_GROUP_OVERFLOW_TEXT = `$${LABEL_GROUP_OVERFLOW_PLACEHOLDER} more`;

const noneLabel = <span className="pf-v6-u-disabled-color-100">None</span>;

function formatForwarderStatus(status: LogForwarderStatus | undefined): {
  label: string;
  icon: React.ReactNode;
} {
  const raw = status?.state ?? '';
  const state = raw.toLowerCase();
  if (state.includes('ready')) {
    return {
      label: 'Ready',
      icon: <CheckCircleIcon className="pf-v6-u-color-status-success" aria-hidden />,
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

function LogDestinationCard({
  title,
  forwarder,
  tree,
  treeLoading,
  children,
}: {
  title: string;
  forwarder: LogForwarder;
  tree: LogForwardingGroupTreeNode[];
  treeLoading: boolean;
  children: React.ReactNode;
}) {
  const statusDisplay = formatForwarderStatus(forwarder.status);

  return (
    <Card isCompact>
      <CardTitle>
        <Title headingLevel="h3" size="lg">
          {title}
        </Title>
      </CardTitle>
      <CardBody>
        <Stack hasGutter>
          <DescriptionList isHorizontal termWidth="12rem">
            {children}
            <DescriptionListGroup>
              <DescriptionListTerm>Status</DescriptionListTerm>
              <DescriptionListDescription>
                <Stack hasGutter>
                  <StackItem>
                    <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center pf-v6-u-gap-sm">
                      {statusDisplay.icon}
                      {statusDisplay.label}
                    </span>
                  </StackItem>
                  {forwarder.status?.message ? (
                    <StackItem>{forwarder.status.message}</StackItem>
                  ) : null}
                </Stack>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
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

const ControlPlaneLogForwardingSection = ({ cluster }: { cluster: AugmentedCluster }) => {
  const clusterID = cluster.id;
  const region = cluster.subscription?.rh_region_id;
  const isHypershift = isHypershiftCluster(cluster);
  const isRosa = isROSA(cluster);
  const showSection = isHypershift && isRosa;

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

  return (
    <Stack hasGutter>
      <Title headingLevel="h2" size="xl">
        Control plane log forwarding
      </Title>

      {isForwardersLoading ? <Spinner aria-label="Loading log forwarding configuration" /> : null}

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

      {!isForwardersLoading && !isForwardersError && forwarders.length === 0 ? (
        <span className="pf-v6-u-color-text-subtle">
          No control plane log forwarding is configured for this cluster.
        </span>
      ) : null}

      {!isForwardersLoading && !isForwardersError && s3Forwarder ? (
        <LogDestinationCard
          title="Amazon S3"
          forwarder={s3Forwarder}
          tree={catalogTree}
          treeLoading={treeLoading}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>Configuration</DescriptionListTerm>
            <DescriptionListDescription>Enabled</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Bucket name</DescriptionListTerm>
            <DescriptionListDescription>
              {s3Forwarder.s3?.bucket_name?.trim() || noneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Bucket prefix</DescriptionListTerm>
            <DescriptionListDescription>
              {s3Forwarder.s3?.bucket_prefix?.trim() || noneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </LogDestinationCard>
      ) : null}

      {!isForwardersLoading && !isForwardersError && cloudWatchForwarder ? (
        <LogDestinationCard
          title="CloudWatch"
          forwarder={cloudWatchForwarder}
          tree={catalogTree}
          treeLoading={treeLoading}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>Configuration</DescriptionListTerm>
            <DescriptionListDescription>Enabled</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Log group name</DescriptionListTerm>
            <DescriptionListDescription>
              {cloudWatchForwarder.cloudwatch?.log_group_name?.trim() || noneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Role ARN</DescriptionListTerm>
            <DescriptionListDescription>
              {cloudWatchForwarder.cloudwatch?.log_distribution_role_arn ? (
                <span
                  className="pf-v6-u-text-break-word"
                  title={cloudWatchForwarder.cloudwatch.log_distribution_role_arn}
                >
                  {cloudWatchForwarder.cloudwatch.log_distribution_role_arn}
                </span>
              ) : (
                noneLabel
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </LogDestinationCard>
      ) : null}
    </Stack>
  );
};

export default ControlPlaneLogForwardingSection;
