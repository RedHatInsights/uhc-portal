import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Spinner,
} from '@patternfly/react-core';

import { createOverviewQueryObject } from '../../common/queryHelpers';
import { AppPage } from '../App/AppPage';
import ClusterListActions from '../clusters/ClusterListMultiRegion/components/ClusterListActions/ClusterListActions';
import ArchiveClusterDialog from '../clusters/common/ArchiveClusterDialog';
import EditSubscriptionSettingsDialog from '../clusters/common/EditSubscriptionSettingsDialog/EditSubscriptionSettingsDialog';
import SmallClusterChart from '../clusters/common/ResourceUsage/SmallClusterChart';
import ConnectedModal from '../common/Modal/ConnectedModal';
import Unavailable from '../common/Unavailable';

import DashboardEmptyState from './EmptyState/DashboardEmptyState';
import InsightsAdvisorCard from './InsightsAdvisorCard/InsightsAdvisorCard';
import ClustersWithIssuesTableCard from './ClustersWithIssuesTableCard';
import CostCard from './CostCard';
import ExpiredTrialsCard from './ExpiredTrialsCard';
import TopOverviewSection from './TopOverviewSection';

import './Dashboard.scss';

const PAGE_TITLE = 'Overview | Red Hat OpenShift Cluster Manager';

const Dashboard = (props) => {
  const {
    summaryDashboard,
    unhealthyClusters,
    viewOptions,
    invalidateSubscriptions,
    totalClusters,
    totalConnectedClusters,
    totalUnhealthyClusters,
    totalCPU,
    usedCPU,
    totalMem,
    usedMem,
    upToDate,
    upgradeAvailable,
    userAccess,
    getSummaryDashboard,
    getUnhealthyClusters,
    getUserAccess,
    getOrganizationAndQuota,
    organization,
    insightsOverview,
    fetchOrganizationInsights,
  } = props;
  React.useEffect(() => {
    if (!summaryDashboard.fulfilled && !summaryDashboard.pending) {
      getSummaryDashboard();
    }

    if (!unhealthyClusters.fulfilled && !unhealthyClusters.pending) {
      getUnhealthyClusters(createOverviewQueryObject(viewOptions));
    }

    if (!organization.pending && !organization.fulfilled) {
      getOrganizationAndQuota();
    }

    if (!insightsOverview.pending && !insightsOverview.fulfilled) {
      fetchOrganizationInsights();
    }

    getUserAccess({ type: 'OCP' });
  }, [
    fetchOrganizationInsights,
    getOrganizationAndQuota,
    getSummaryDashboard,
    getUnhealthyClusters,
    getUserAccess,
    insightsOverview,
    organization,
    summaryDashboard,
    unhealthyClusters,
    viewOptions,
  ]);

  const isError = summaryDashboard.error || unhealthyClusters.error;
  const isPending =
    !summaryDashboard.fulfilled ||
    summaryDashboard.pending ||
    !unhealthyClusters.fulfilled ||
    unhealthyClusters.pending;
  // TODO: should show only when at least one cluster is connected and sends Insights
  const showInsightsAdvisorWidget = insightsOverview.fulfilled && insightsOverview.overview;

  if (isError) {
    let errorSource;
    if (summaryDashboard.error) {
      errorSource = summaryDashboard;
    } else {
      errorSource = unhealthyClusters;
    }
    const { errorMessage, errorCode, operationID } = errorSource;
    const response = { errorMessage, errorCode, operationID };
    return <Unavailable response={response} />;
  }

  // Show spinner if while waiting for responses.
  if (isPending && !isError) {
    return (
      <AppPage title={PAGE_TITLE}>
        <EmptyState>
          <EmptyStateBody>
            <div className="pf-v6-u-text-align-center">
              <Spinner size="lg" aria-label="Loading..." />
            </div>
          </EmptyStateBody>
        </EmptyState>
      </AppPage>
    );
  }

  // Revert to an "empty" state if there are no clusters to show.
  if (summaryDashboard.fulfilled && !totalClusters) {
    return (
      <AppPage title={PAGE_TITLE}>
        <DashboardEmptyState />
      </AppPage>
    );
  }

  return (
    <AppPage title={PAGE_TITLE}>
      <Flex hasGutter className="pf-v6-u-mt-xl">
        <FlexItem>
          <PageHeader title="Dashboard" />
        </FlexItem>
        <FlexItem isFilled align={{ default: 'alignRight' }} />
        <FlexItem>
          <ClusterListActions isDashboardView />
        </FlexItem>
      </Flex>
      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter className="ocm-c-overview">
          <TopOverviewSection
            isError={summaryDashboard.error}
            totalClusters={totalClusters}
            totalUnhealthyClusters={totalUnhealthyClusters}
            totalConnectedClusters={totalConnectedClusters}
            totalCPU={totalCPU}
            usedCPU={usedCPU}
            totalMem={totalMem}
            usedMem={usedMem}
          />
          {totalConnectedClusters > 0 && (
            <GridItem md={6}>
              <ClustersWithIssuesTableCard
                unhealthyClusters={unhealthyClusters}
                viewOptions={viewOptions}
              />
            </GridItem>
          )}
          {showInsightsAdvisorWidget && (
            <GridItem md={6}>
              <InsightsAdvisorCard overview={insightsOverview.overview} />
            </GridItem>
          )}
          <GridItem md={6}>
            <Card className="ocm-overview-clusters__card">
              <CardTitle>Telemetry</CardTitle>
              <CardBody>
                {!totalConnectedClusters && !totalClusters ? (
                  <EmptyState>
                    <EmptyStateBody>No data available</EmptyStateBody>
                  </EmptyState>
                ) : (
                  <SmallClusterChart
                    donutId="connected_clusters_donut"
                    used={totalConnectedClusters}
                    total={totalClusters}
                    availableTitle="Not checking in"
                    usedTitle="Connected"
                    unit="clusters"
                  />
                )}
              </CardBody>
            </Card>
          </GridItem>
          {userAccess.fulfilled && userAccess.data !== undefined && userAccess.data === true && (
            <GridItem md={6}>
              <CostCard />
            </GridItem>
          )}
          <GridItem md={6}>
            <Card className="ocm-overview-clusters__card">
              <CardTitle>Update status</CardTitle>
              <CardBody>
                {!upgradeAvailable.value && !upToDate.value ? (
                  <EmptyState>
                    <EmptyStateBody>No data available</EmptyStateBody>
                  </EmptyState>
                ) : (
                  <SmallClusterChart
                    donutId="update_available_donut"
                    used={upToDate.value}
                    total={upgradeAvailable.value + upToDate.value}
                    unit="clusters"
                    availableTitle="Update available"
                    usedTitle="Up-to-date"
                  />
                )}
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <ExpiredTrialsCard />
          </GridItem>
        </Grid>
        <ConnectedModal
          ModalComponent={EditSubscriptionSettingsDialog}
          onClose={invalidateSubscriptions}
        />
        <ConnectedModal ModalComponent={ArchiveClusterDialog} onClose={invalidateSubscriptions} />
      </PageSection>
    </AppPage>
  );
};

Dashboard.propTypes = {
  getSummaryDashboard: PropTypes.func.isRequired,
  getUserAccess: PropTypes.func.isRequired,
  invalidateSubscriptions: PropTypes.func.isRequired,
  summaryDashboard: PropTypes.object.isRequired,
  getUnhealthyClusters: PropTypes.func.isRequired,
  unhealthyClusters: PropTypes.shape({
    clusters: PropTypes.array,
    error: PropTypes.bool,
    pending: PropTypes.bool,
    fulfilled: PropTypes.bool,
  }).isRequired,
  viewOptions: PropTypes.shape({
    currentPage: PropTypes.number,
    pageSize: PropTypes.number,
    totalCount: PropTypes.number,
    totalPages: PropTypes.number,
  }).isRequired,
  totalClusters: PropTypes.number.isRequired,
  totalConnectedClusters: PropTypes.number.isRequired,
  totalUnhealthyClusters: PropTypes.number.isRequired,
  totalCPU: PropTypes.object.isRequired,
  usedCPU: PropTypes.object.isRequired,
  totalMem: PropTypes.object.isRequired,
  usedMem: PropTypes.object.isRequired,
  upToDate: PropTypes.object.isRequired,
  upgradeAvailable: PropTypes.object.isRequired,
  fetchOrganizationInsights: PropTypes.func.isRequired,
  insightsOverview: PropTypes.object.isRequired,
  userAccess: PropTypes.shape({
    data: PropTypes.bool,
    pending: PropTypes.bool,
    fulfilled: PropTypes.bool,
  }).isRequired,
  getOrganizationAndQuota: PropTypes.func.isRequired,
  organization: PropTypes.object.isRequired,
};

export default Dashboard;
