import React, { useEffect, useRef, useState } from 'react';
import get from 'lodash/get';

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
import { MissingOCMRoleAlert } from '~/components/clusters/ClusterDetailsMultiRegion/components/common/MissingOCMRoleAlert';
import useAnalytics from '~/hooks/useAnalytics';
import type { State as CloudProvidersState } from '~/redux/reducers/cloudProvidersReducer';
import { isRestrictedEnv } from '~/restrictedEnv';
import { Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import isAssistedInstallSubscription, {
  isAvailableAssistedInstallCluster,
  isUninstalledAICluster,
} from '../../../../../common/isAssistedInstallerCluster';
import clusterStates, {
  hasInflightEgressErrors,
  isHibernating,
  isROSA,
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

// DetailsRight and InsightsAdvisor are JS components with no TS prop declarations;
// cast to ComponentType<any> to avoid spurious inference errors during migration.
const DetailsRightAny = DetailsRight as unknown as React.ComponentType<Record<string, unknown>>;
const InsightsAdvisorAny = InsightsAdvisor as unknown as React.ComponentType<
  Record<string, unknown>
>;

import './Overview.scss';

interface WifConfigData {
  displayName?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
}

interface OverviewProps {
  // Callers pass a fully-augmented cluster object; AugmentedCluster includes
  // canEdit, aiCluster, and all permission flags. autoscaler is fetched
  // separately and attached at the call site, so we extend here.
  cluster: AugmentedCluster & { autoscaler?: unknown };
  cloudProviders: CloudProvidersState;
  refresh?: () => void;
  // Redux promise-reducer envelope from the insights API call
  insightsData?: { status?: number; data?: unknown };
  userAccess: { data?: boolean; pending?: boolean; fulfilled?: boolean };
  subscription?: Subscription;
  canSubscribeOCP?: boolean;
  clusterDetailsLoading?: boolean;
  isSubscriptionSettingsRequestPending?: boolean;
  clusterDetailsFetching?: boolean;
  displayUpgradeSettingsTab?: boolean;
  wifConfigData?: WifConfigData;
}

const Overview = (props: OverviewProps) => {
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
    displayUpgradeSettingsTab,
    wifConfigData,
  } = props;

  const [showInstallSuccessAlert, setShowInstallSuccessAlert] = useState(false);
  const prevProps = useRef<OverviewProps | undefined>(undefined);
  const track = useAnalytics();

  const clusterState = cluster.state as string;
  const prevClusterState = prevProps.current?.cluster.state as string | undefined;

  useEffect(() => {
    if (
      prevProps.current &&
      (
        [clusterStates.installing, clusterStates.pending, clusterStates.waiting] as string[]
      ).includes(prevClusterState ?? '') &&
      clusterState === clusterStates.ready &&
      cluster.managed &&
      prevProps.current.cluster.id === cluster.id
    ) {
      // we only want to show this alert if the cluster transitioned from installing/pending
      // to Ready while the page was open.
      setShowInstallSuccessAlert(true);
    }

    // Update prevProps to the current props after each component update
    prevProps.current = props;
  }, [clusterState, prevClusterState, cluster.managed, cluster.id, props]);

  const isArchived =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Archived;
  const isDeprovisioned =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Deprovisioned;
  const isDisconnected =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Disconnected;
  const metricsAvailable =
    hasResourceUsageMetrics(cluster) &&
    (cluster.canEdit ||
      !(
        [clusterStates.waiting, clusterStates.pending, clusterStates.installing] as string[]
      ).includes(clusterState));
  const metricsStatusMessagesByState = metricsStatusMessages as Record<string, string>;
  const metricsStatusMessage = isArchived
    ? metricsStatusMessages.archived
    : metricsStatusMessagesByState[clusterState] || metricsStatusMessages.default;

  // TODO: Part of ClusterStatusMonitor story (installation)
  // _shouldMonitorStatus: intentionally unused pending ClusterStatusMonitor implementation

  const hadInflightErrorKey = `${HAD_INFLIGHT_ERROR_LOCALSTORAGE_KEY}_${cluster.id}`;
  const showInflightErrorIsFixed =
    !hasInflightEgressErrors(cluster) &&
    clusterState !== clusterStates.error &&
    localStorage.getItem(hadInflightErrorKey) === 'true';

  const showInsightsAdvisor =
    !isRestrictedEnv() &&
    insightsData?.status === 200 &&
    !!insightsData?.data &&
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
  const awsAccountId = cluster.subscription?.cloud_account_id;
  const shouldCheckOCMRole =
    isROSA(cluster) && cluster.aws?.sts?.enabled === true && !!awsAccountId;

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
          cpu={cluster.metrics.cpu}
          memory={cluster.metrics.memory}
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
          {shouldCheckOCMRole && <MissingOCMRoleAlert awsAccountId={awsAccountId!} />}
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
                    refresh?.();
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
                      clusterDetailsFetching={clusterDetailsFetching}
                    />
                  </GridItem>
                  <GridItem sm={6}>
                    <DetailsRightAny
                      clusterDetailsLoading={clusterDetailsLoading}
                      cluster={{ ...cluster }}
                      isDeprovisioned={isDeprovisioned}
                      hasAutoscaleCluster={!!cluster?.autoscaler}
                      clusterDetailsFetching={clusterDetailsFetching}
                      displayUpgradeSettingsTab={displayUpgradeSettingsTab}
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
                    <InsightsAdvisorAny
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

export default Overview;
