import React, { useEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import {
  Alert,
  AlertActionCloseButton,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';

import { getOCMResourceType, trackEvents } from '~/common/analytics';
import { HAD_INFLIGHT_ERROR_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';
import { normalizedProducts } from '~/common/subscriptionTypes';
import AIDetailCard from '~/components/AIComponents/AIDetailCard';
import useAnalytics from '~/hooks/useAnalytics';
import { isRestrictedEnv } from '~/restrictedEnv';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import isAssistedInstallSubscription, {
  isAvailableAssistedInstallCluster,
  isUninstalledAICluster,
} from '../../../../../common/isAssistedInstallerCluster';
import clusterStates, {
  hasInflightEgressErrors,
  isHibernating,
} from '../../../common/clusterStates';
import { metricsStatusMessages } from '../../../common/ResourceUsage/constants';
import ResourceUsage from '../../../common/ResourceUsage/ResourceUsage';
import { hasResourceUsageMetrics } from '../Monitoring/monitoringHelper';

import InsightsAdvisor from './InsightsAdvisor/InsightsAdvisor';
import CostBreakdownCard from './CostBreakdownCard';
import DetailsLeft from './DetailsLeft';
import DetailsRight from './DetailsRight';
import { shouldShowLogs } from './InstallationLogView';
import SubscriptionSettings from './SubscriptionSettings';

import './Overview.scss';

const Overview = (props) => {
  const {
    cluster,
    cloudProviders,
    refresh,
    insightsData,
    userAccess,
    subscription,
    canSubscribeOCP,
    clusterDetailsLoading,
    isSubscriptionSettingsRequestPending,
    clusterDetailsFetching,
    wifConfigData,
  } = props;

  const [showInstallSuccessAlert, setShowInstallSuccessAlert] = useState(false);
  const prevProps = useRef();
  const track = useAnalytics();

  useEffect(() => {
    if (
      prevProps.current &&
      [clusterStates.installing, clusterStates.pending, clusterStates.waiting].includes(
        prevProps.current.cluster.state,
      ) &&
      cluster.state === clusterStates.ready &&
      cluster.managed &&
      prevProps.current.cluster.id === cluster.id
    ) {
      // we only want to show this alert if the cluster transitioned from installing/pending
      // to Ready while the page was open.

      // eslint-disable-next-line react/no-did-update-set-state
      setShowInstallSuccessAlert(true);
    }

    // Update prevProps to the current props after each component update
    prevProps.current = props;
  }, [cluster.state, cluster.managed, cluster.id, props]);

  const isArchived =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Archived;
  const isDeprovisioned =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Deprovisioned;
  const isDisconnected =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Disconnected;
  const metricsAvailable =
    hasResourceUsageMetrics(cluster) &&
    (cluster.canEdit ||
      ![clusterStates.waiting, clusterStates.pending, clusterStates.installing].includes(
        cluster.state,
      ));
  const metricsStatusMessage = isArchived
    ? metricsStatusMessages.archived
    : metricsStatusMessages[cluster.state] || metricsStatusMessages.default;

  // TODO: Part of ClusterStatusMonitor story (installation)
  // eslint-disable-next-line no-unused-vars
  const shouldMonitorStatus =
    [
      clusterStates.waiting,
      clusterStates.pending,
      clusterStates.installing,
      clusterStates.error,
      clusterStates.uninstalling,
    ].includes(cluster.state) || hasInflightEgressErrors(cluster);

  const hadInflightErrorKey = `${HAD_INFLIGHT_ERROR_LOCALSTORAGE_KEY}_${cluster.id}`;
  const showInflightErrorIsFixed =
    !hasInflightEgressErrors(cluster) &&
    cluster.state !== clusterStates.error &&
    localStorage.getItem(hadInflightErrorKey) === 'true';

  const showInsightsAdvisor =
    !isRestrictedEnv() &&
    insightsData?.status === 200 &&
    insightsData?.data &&
    !isDeprovisioned &&
    !isArchived;
  const showResourceUsage =
    !isHibernating(cluster) &&
    !isAssistedInstallSubscription(cluster.subscription) &&
    !shouldShowLogs(cluster) &&
    !isDeprovisioned &&
    !isArchived &&
    !isRestrictedEnv() &&
    !hasInflightEgressErrors(cluster);
  const showCostBreakdown =
    !cluster.managed &&
    userAccess.fulfilled &&
    userAccess.data === true &&
    !isDeprovisioned &&
    !isArchived;
  const showSidePanel = showInsightsAdvisor || showCostBreakdown;
  const showAssistedInstallerDetailCard = isAvailableAssistedInstallCluster(cluster);
  const showDetailsCard = !cluster.aiCluster || !isUninstalledAICluster(cluster);
  const showSubscriptionSettings = !isDeprovisioned && !isArchived;

  const resourceUsage = (
    <Card className="ocm-c-overview-resource-usage__card" data-testid="resource-usage">
      <CardTitle className="ocm-c-overview-resource-usage__card--header">
        <Title headingLevel="h2" className="card-title">
          Resource usage
        </Title>
      </CardTitle>
      <CardBody className="ocm-c-overview-resource-usage__card--body">
        <ResourceUsage
          metricsAvailable={metricsAvailable}
          metricsStatusMessage={metricsStatusMessage}
          cpu={{
            used: cluster.metrics.cpu.used,
            total: cluster.metrics.cpu.total,
          }}
          memory={{
            used: cluster.metrics.memory.used,
            total: cluster.metrics.memory.total,
          }}
          type="threshold"
        />
      </CardBody>
    </Card>
  );

  return (
    <Grid hasGutter>
      <GridItem xl2={showSidePanel ? 9 : 12}>
        <Grid hasGutter>
          {showInstallSuccessAlert && (
            <Alert variant="success" isInline title="Cluster installed successfully" />
          )}
          {showInflightErrorIsFixed && (
            <Alert
              variant="success"
              isInline
              title="This cluster can now be fully-managed"
              actionClose={
                <AlertActionCloseButton
                  onClose={() => {
                    const planType = get(
                      cluster,
                      'subscription.plan.id',
                      normalizedProducts.UNKNOWN,
                    );
                    const resourceType = getOCMResourceType(planType);

                    track(trackEvents.AlertInteraction, {
                      resourceType,
                      customProperties: {
                        type: 'fully-managed-success',
                        action: 'dismiss',
                        severity: 'success',
                      },
                    });

                    localStorage.removeItem(hadInflightErrorKey);
                    refresh();
                  }}
                />
              }
            />
          )}
          {showAssistedInstallerDetailCard && <AIDetailCard cluster={cluster} />}
          {showResourceUsage && !showSidePanel && resourceUsage}
          {showDetailsCard && (
            <Card className="ocm-c-overview-details__card">
              <CardTitle className="ocm-c-overview-details__card--header">
                <Title headingLevel="h2" className="card-title">
                  Details
                </Title>
              </CardTitle>
              <CardBody className="ocm-c-overview-details__card--body">
                <Grid>
                  <GridItem sm={6}>
                    <DetailsLeft
                      cluster={cluster}
                      cloudProviders={cloudProviders}
                      showAssistedId={showAssistedInstallerDetailCard}
                      wifConfigData={wifConfigData}
                      isArchived={isArchived}
                      isDeprovisioned={isDeprovisioned}
                      isDisconnected={isDisconnected}
                    />
                  </GridItem>
                  <GridItem sm={6}>
                    <DetailsRight
                      clusterDetailsLoading={clusterDetailsLoading}
                      cluster={{ ...cluster }}
                      isDeprovisioned={isDeprovisioned}
                      hasAutoscaleCluster={!!cluster?.autoscaler}
                      clusterDetailsFetching={clusterDetailsFetching}
                    />
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
          )}
          {showSubscriptionSettings && (
            <SubscriptionSettings
              subscription={subscription}
              canEdit={cluster.canEdit}
              canSubscribeOCP={canSubscribeOCP}
              isLoading={isSubscriptionSettingsRequestPending || clusterDetailsLoading}
            />
          )}
        </Grid>
      </GridItem>
      {showSidePanel && (
        <GridItem xl2={3}>
          <Grid hasGutter>
            {showResourceUsage && (
              <GridItem sm={6} xl2={12}>
                {resourceUsage}
              </GridItem>
            )}
            {showInsightsAdvisor && (
              <GridItem sm={6} xl2={12}>
                <Card
                  className="ocm-c-overview-advisor--card"
                  ouiaId="insightsAdvisor"
                  data-testid="insights-advisor"
                >
                  <CardBody>
                    <InsightsAdvisor
                      insightsData={insightsData}
                      externalId={cluster?.external_id}
                    />
                  </CardBody>
                </Card>
              </GridItem>
            )}
            {showCostBreakdown && (
              <GridItem sm={6} xl2={12}>
                <CostBreakdownCard clusterId={cluster.external_id} />
              </GridItem>
            )}
          </Grid>
        </GridItem>
      )}
    </Grid>
  );
};

Overview.propTypes = {
  cluster: PropTypes.object,
  canSubscribeOCP: PropTypes.bool,
  subscription: PropTypes.object,
  cloudProviders: PropTypes.object.isRequired,
  refresh: PropTypes.func,
  insightsData: PropTypes.object,
  clusterDetailsLoading: PropTypes.bool,
  isSubscriptionSettingsRequestPending: PropTypes.bool,
  userAccess: PropTypes.shape({
    data: PropTypes.bool,
    pending: PropTypes.bool,
    fulfilled: PropTypes.bool,
  }).isRequired,
  clusterDetailsFetching: PropTypes.bool,
  wifConfigData: PropTypes.shape({
    displayName: PropTypes.string,
    isLoading: PropTypes.bool,
    isSuccess: PropTypes.bool,
  }),
};

export default Overview;
