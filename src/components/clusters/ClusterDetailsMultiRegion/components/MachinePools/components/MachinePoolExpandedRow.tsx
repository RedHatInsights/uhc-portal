import React from 'react';
import isEmpty from 'lodash/isEmpty';

import { Grid, GridItem, Label, Title } from '@patternfly/react-core';

import { truncateTextWithEllipsis } from '~/common/helpers';
import { useAWSVPCFromCluster } from '~/components/clusters/common/useAWSVPCFromCluster';
import { MachinePool, NodePool, SecurityGroup } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { isHypershiftCluster, isMPoolAz } from '../../../clusterDetailsHelper';
import MachinePoolAutoRepairDetail from '../MachinePoolAutoRepairDetail';
import MachinePoolAutoScalingDetail from '../MachinePoolAutoscalingDetail';
import { getSubnetIds, hasSubnets } from '../machinePoolsHelper';

const LABEL_MAX_LENGTH = 50;

const taintsRenderer = (taints: MachinePool['taints']) =>
  (taints || []).map((taint) => `${taint.key} = ${taint.value}:${taint.effect}`);

const labelsRenderer = (labels: Record<string, string>) =>
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

    {items.map((item, index) => {
      const isTruncated = item.length > LABEL_MAX_LENGTH;
      const displayName = isTruncated ? truncateTextWithEllipsis(item, LABEL_MAX_LENGTH) : item;

      return (
        <Label
          color="blue"
          // eslint-disable-next-line react/no-array-index-key
          key={`${title}-${index}`}
          className="pf-v6-c-label--break-word pf-v6-u-m-sm pf-v6-u-ml-0"
          title={isTruncated ? item : ''}
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
  const { clusterVpc } = useAWSVPCFromCluster(cluster, region);
  const spotMarketOptions = machinePool?.aws?.spot_market_options;
  const securityGroupIds =
    machinePool?.aws?.additional_security_group_ids ||
    (machinePool as NodePool)?.aws_node_pool?.additional_security_group_ids ||
    [];
  const isMultiZoneMachinePool = isMPoolAz(cluster, machinePool.availability_zones?.length);
  const isHypershift = isHypershiftCluster(cluster);
  const isAutoRepairEnabled = (machinePool as NodePool)?.auto_repair;

  return (
    <Grid hasGutter>
      {!isEmpty(machinePool.labels) && (
        <GridItem md={6}>
          <MachinePoolItemList title="Labels" items={labelsRenderer(machinePool.labels || {})} />
        </GridItem>
      )}
      {machinePool.taints && (
        <GridItem md={6}>
          <MachinePoolItemList title="Taints" items={taintsRenderer(machinePool.taints)} />
        </GridItem>
      )}
      {securityGroupIds.length > 0 && (
        <GridItem md={6}>
          <MachinePoolItemList
            title="Security groups"
            items={securityGroupsRenderer(securityGroupIds, clusterVpc?.aws_security_groups || [])}
          />
        </GridItem>
      )}
      {hasSubnets(machinePool) && (
        <GridItem md={6}>
          <MachinePoolItemList title="Subnets" items={getSubnetIds(machinePool)} />
        </GridItem>
      )}
      {machinePool.autoscaling && (
        <GridItem md={6}>
          <MachinePoolAutoScalingDetail
            isMultiZoneMachinePool={isMultiZoneMachinePool}
            isMultiZoneCluster={isMultiZoneCluster}
            autoscaling={machinePool.autoscaling}
          />
        </GridItem>
      )}
      {isHypershift && (
        <GridItem md={6}>
          <MachinePoolAutoRepairDetail isAutoRepairEnabled={isAutoRepairEnabled} />
        </GridItem>
      )}
      {spotMarketOptions && (
        <GridItem md={6}>
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
