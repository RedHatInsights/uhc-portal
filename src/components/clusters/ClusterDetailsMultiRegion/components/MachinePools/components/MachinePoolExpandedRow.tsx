import React from 'react';
import isEmpty from 'lodash/isEmpty';

import {
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { truncateTextWithEllipsis } from '~/common/helpers';
import { useAWSVPCFromCluster } from '~/components/clusters/common/useAWSVPCFromCluster';
import {
  AWS_TAGS_NEW_MP,
  CAPACITY_RESERVATION_ID_FIELD,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MachinePool, NodePool, SecurityGroup } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { isHypershiftCluster, isMPoolAz } from '../../../clusterDetailsHelper';
import MachinePoolAutoRepairDetail from '../MachinePoolAutoRepairDetail';
import MachinePoolAutoScalingDetail from '../MachinePoolAutoscalingDetail';
import MachinePoolCapacityReservationDetail from '../MachinePoolCapacityReservationDetail';
import { getSubnetIds, hasAwsTags, hasSubnets } from '../machinePoolsHelper';

const LABEL_MAX_LENGTH = 50;

const taintsRenderer = (taints: MachinePool['taints']) =>
  (taints || []).map((taint) => `${taint.key} = ${taint.value}:${taint.effect}`);

const labelsTagsRenderer = (labels: Record<string, string>) =>
  Object.keys(labels || {}).map((labelKey) => {
    const value = labels[labelKey] || '';
    return `${labelKey}${value ? ' = ' : ''}${value}`;
  });

export const securityGroupsRenderer = (
  securityGroupIds: string[],
  securityGroups: SecurityGroup[],
) =>
  securityGroupIds.map((sgId) => {
    const securityGroupName = securityGroups.find((sg) => sg.id === sgId)?.name;
    return securityGroupName || sgId; // Name of a SecurityGroup is optional
  });

export const MachinePoolItemList = ({
  title,
  items,
  showSmallTitle = false,
}: {
  title: string;
  items: string[];
  showSmallTitle?: boolean;
}) => (
  <>
    {!showSmallTitle && <Title headingLevel="h4">{title}</Title>}
    {showSmallTitle && (
      <div className="pf-v6-u-font-size-sm pf-v6-u-font-weight-bold pf-v6-u-disabled-color-100">
        {title}
      </div>
    )}

    {items.map((item) => {
      const isTruncated = item.length > LABEL_MAX_LENGTH;
      const displayName = isTruncated ? truncateTextWithEllipsis(item, LABEL_MAX_LENGTH) : item;

      return (
        <Label
          color="blue"
          key={`${title}-${item}`}
          textMaxWidth="16ch"
          className="pf-v6-c-label--break-word pf-v6-u-m-sm pf-v6-u-ml-0"
        >
          {/* Use HTML tooltip, PF's won't show because the parent tab is initially hidden */}
          {displayName}
        </Label>
      );
    })}
  </>
);

const MachinePoolExpandedRow = ({
  cluster,
  isMultiZoneCluster,
  machinePool,
  region,
}: {
  cluster: ClusterFromSubscription;
  isMultiZoneCluster: boolean;
  machinePool: MachinePool;
  region?: string;
}) => {
  const awsTagsNewMP = useFeatureGate(AWS_TAGS_NEW_MP);
  const isCapacityReservationIdFieldEnabled = useFeatureGate(CAPACITY_RESERVATION_ID_FIELD);
  const { clusterVpc } = useAWSVPCFromCluster(cluster, region);
  const spotMarketOptions = machinePool?.aws?.spot_market_options;
  const securityGroupIds =
    machinePool?.aws?.additional_security_group_ids ||
    (machinePool as NodePool)?.aws_node_pool?.additional_security_group_ids ||
    [];
  const isMultiZoneMachinePool = isMPoolAz(cluster, machinePool.availability_zones?.length);
  const isHypershift = isHypershiftCluster(cluster);
  const isAutoRepairEnabled = (machinePool as NodePool)?.auto_repair;
  const capacityReservationId = (machinePool as NodePool)?.aws_node_pool?.capacity_reservation?.id;
  const capacityReservationPreference = (machinePool as NodePool)?.aws_node_pool
    ?.capacity_reservation?.preference;
  const awsTagsAvailable = hasAwsTags(machinePool);
  const labelsAvailable = !isEmpty(machinePool.labels);
  const nodePoolTags = (machinePool as NodePool).aws_node_pool?.tags;
  const awsTags = React.useMemo(() => labelsTagsRenderer(nodePoolTags || {}), [nodePoolTags]);

  const labels = React.useMemo(
    () => labelsTagsRenderer(machinePool.labels || {}),
    [machinePool.labels],
  );

  return (
    <Grid hasGutter>
      {(labelsAvailable || (awsTagsNewMP && awsTagsAvailable)) && (
        <GridItem key="labels-aws-tags" md={8}>
          <Stack hasGutter>
            {awsTagsNewMP && awsTagsAvailable ? (
              <StackItem key="labels-aws-tags-title">
                <Title headingLevel="h4">Labels and AWS tags</Title>
              </StackItem>
            ) : (
              <StackItem key="labels-title">
                <Title headingLevel="h4">Labels</Title>
              </StackItem>
            )}

            {labelsAvailable && (
              <StackItem key="labels-content">
                <Flex>
                  <FlexItem>
                    <div className="pf-v6-u-font-size-sm pf-v6-u-disabled-color-100">Labels</div>
                  </FlexItem>
                  <FlexItem>
                    <LabelGroup
                      numLabels={1}
                      collapsedText={`${labels.length - 1} remaining`}
                      title="Labels"
                    >
                      {labels.map((fullLabel) => (
                        <Label
                          key={`${fullLabel}`}
                          color="blue"
                          className="pf-v6-c-label__text-awstag"
                        >
                          {fullLabel}
                        </Label>
                      ))}
                    </LabelGroup>
                  </FlexItem>
                </Flex>
              </StackItem>
            )}

            {awsTagsNewMP && awsTagsAvailable && (
              <StackItem key="aws-tags-content">
                <Flex>
                  <FlexItem>
                    <div className="pf-v6-u-font-size-sm pf-v6-u-disabled-color-100">AWS tags</div>
                  </FlexItem>
                  <FlexItem>
                    <LabelGroup
                      numLabels={1}
                      collapsedText={`${awsTags.length - 1} remaining`}
                      isCompact
                    >
                      {awsTags &&
                        awsTags.map((fullTag) => (
                          <Label
                            key={`${fullTag}`}
                            color="orange"
                            className="pf-v6-c-label__text-awstag"
                          >
                            {fullTag}
                          </Label>
                        ))}
                    </LabelGroup>
                  </FlexItem>
                </Flex>
              </StackItem>
            )}
          </Stack>
        </GridItem>
      )}
      {machinePool.taints && (
        <GridItem key="taints" md={6}>
          <MachinePoolItemList title="Taints" items={taintsRenderer(machinePool.taints)} />
        </GridItem>
      )}
      {securityGroupIds.length > 0 && (
        <GridItem key="security-groups" md={6}>
          <MachinePoolItemList
            title="Security groups"
            items={securityGroupsRenderer(securityGroupIds, clusterVpc?.aws_security_groups || [])}
          />
        </GridItem>
      )}
      {hasSubnets(machinePool) && (
        <GridItem key="subnets" md={4}>
          <MachinePoolItemList title="Subnets" items={getSubnetIds(machinePool)} />
        </GridItem>
      )}
      {machinePool.autoscaling && (
        <GridItem key="autoscaling" md={6}>
          <MachinePoolAutoScalingDetail
            isMultiZoneMachinePool={isMultiZoneMachinePool}
            isMultiZoneCluster={isMultiZoneCluster}
            autoscaling={machinePool.autoscaling}
          />
        </GridItem>
      )}
      {isHypershift && (
        <GridItem key="auto-repair" md={6}>
          <MachinePoolAutoRepairDetail isAutoRepairEnabled={isAutoRepairEnabled} />
        </GridItem>
      )}
      {isHypershift && isCapacityReservationIdFieldEnabled && (
        <GridItem key="capacity-reservation" md={6}>
          <MachinePoolCapacityReservationDetail
            capacityReservationId={capacityReservationId}
            capacityReservationPreference={capacityReservationPreference}
          />
        </GridItem>
      )}
      {spotMarketOptions && (
        <GridItem key="spot-pricing" md={6}>
          <Title headingLevel="h4">Spot instance pricing</Title>
          {spotMarketOptions.max_price
            ? `Maximum hourly price: ${spotMarketOptions.max_price}`
            : 'On-Demand'}
        </GridItem>
      )}
    </Grid>
  );
};

export default MachinePoolExpandedRow;
