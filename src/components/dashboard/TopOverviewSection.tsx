import React from 'react';

import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  GridItem,
  Title,
} from '@patternfly/react-core';

import { Link } from '~/common/routing';

import ResourceUsage from '../clusters/common/ResourceUsage/ResourceUsage';

import ClustersWithIssuesCard from './ClustersWithIssuesCard';

type UnitValue = {
  unit: string;
  value: number;
};

type TopOverviewSectionProps = {
  totalClusters: number;
  totalUnhealthyClusters: number;
  totalConnectedClusters: number;
  totalCPU: UnitValue;
  usedCPU: UnitValue;
  totalMem: UnitValue;
  usedMem: UnitValue;
  isError: boolean;
};

const TopOverviewSection = ({
  totalClusters,
  totalUnhealthyClusters,
  totalConnectedClusters,
  totalCPU,
  usedCPU,
  totalMem,
  usedMem,
  isError,
}: TopOverviewSectionProps) => {
  const errorBody = (
    <CardBody>
      <EmptyState headingLevel="h2" titleText="No data available">
        <EmptyStateBody>
          There was an error fetching the data. Try refreshing the page.
        </EmptyStateBody>
      </EmptyState>
    </CardBody>
  );

  if (isError) {
    return (
      <>
        <GridItem md={3}>
          <Card className="ocm-overview-clusters__card">
            <CardTitle>Clusters</CardTitle>
            {errorBody}
          </Card>
        </GridItem>
        <GridItem md={9} rowSpan={2}>
          <Card className="ocm-c-metrics-charts__card">
            <CardTitle>CPU and Memory utilization</CardTitle>
            {errorBody}
          </Card>
        </GridItem>
        <GridItem md={3}>
          <ClustersWithIssuesCard
            isError={isError}
            totalUnhealthyClusters={totalUnhealthyClusters}
            totalConnectedClusters={totalConnectedClusters}
          />
        </GridItem>
      </>
    );
  }

  const dataAvailable = totalConnectedClusters > 0 && (totalCPU?.value > 0 || totalMem.value > 0);

  const resourceUsageBody = dataAvailable ? (
    <CardBody>
      <ResourceUsage
        cpu={{
          total: totalCPU,
          used: usedCPU,
          updated_timestamp: '',
        }}
        memory={{
          total: {
            value: totalMem.value,
            unit: 'B',
          },
          used: {
            value: usedMem.value,
            unit: 'B',
          },
          updated_timestamp: '',
        }}
        metricsAvailable
        type="legend"
      />
    </CardBody>
  ) : (
    <CardBody>
      <EmptyState headingLevel="h2" titleText="No data available">
        <EmptyStateBody>
          Check individual clusters web console if you expect that they should be sending metrics.
          Note that data is not available for clusters that are installing.
        </EmptyStateBody>
      </EmptyState>
    </CardBody>
  );

  return (
    <>
      <GridItem md={3}>
        <Link to="/cluster-list" className="overview-clusters-link">
          <Card className="ocm-overview-clusters__card">
            <CardTitle>Clusters</CardTitle>
            <CardBody>
              <Bullseye>
                <Title headingLevel="h1" size="3xl">
                  {totalClusters}
                </Title>
              </Bullseye>
            </CardBody>
          </Card>
        </Link>
      </GridItem>
      <GridItem md={9} rowSpan={2}>
        <Card className="ocm-c-metrics-charts__card">
          <CardTitle>CPU and Memory utilization</CardTitle>
          {resourceUsageBody}
        </Card>
      </GridItem>
      <GridItem md={3}>
        <ClustersWithIssuesCard
          isError={isError}
          totalUnhealthyClusters={totalUnhealthyClusters}
          totalConnectedClusters={totalConnectedClusters}
        />
      </GridItem>
    </>
  );
};

export default TopOverviewSection;
