/*
 Copyright (c) 2018 Red Hat, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { getAddHostsTabState } from '@openshift-assisted/ui-lib/ocm';
import { PageSection, Spinner, TabContent, Tooltip } from '@patternfly/react-core';

import { Navigate, useNavigate } from '~/common/routing';
import { knownProducts, normalizedProducts } from '~/common/subscriptionTypes';
import AIHostsClusterDetailTab from '~/components/AIComponents/AIHostsClusterDetailTab';
import { AppPage } from '~/components/App/AppPage';
import { modalActions } from '~/components/common/Modal/ModalActions';
import DrawerPanel from '~/components/overview/components/common/DrawerPanel';
import {
  refetchAccessProtection,
  useFetchAccessProtection,
} from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessProtection';
import { refetchAccessRequest } from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessRequest';
import { useFetchPendingAccessRequests } from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchPendingAccessRequests';
import { useAddNotificationContact } from '~/queries/ClusterDetailsQueries/ClusterSupportTab/useAddNotificationContact';
import {
  invalidateClusterDetailsQueries,
  useFetchClusterDetails,
} from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import {
  refetchClusterIdentityProviders,
  useFetchClusterIdentityProviders,
} from '~/queries/ClusterDetailsQueries/useFetchClusterIdentityProviders';
import { useFetchGCPWifConfig } from '~/queries/ClusterDetailsQueries/useFetchGCPWifConfig';
import { refetchOrganizationQuota } from '~/queries/ClusterDetailsQueries/useFetchOrganizationQuota';
import { refetchClusterLogsQueries } from '~/queries/ClusterLogsQueries/useFetchClusterLogs';
import {
  invalidateCloudProviders,
  useFetchCloudProviders,
} from '~/queries/common/useFetchCloudProviders';
import { AUTO_CLUSTER_TRANSFER_OWNERSHIP } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { findRegionalInstance } from '~/queries/helpers';
import { useFetchGetAvailableRegionalInstances } from '~/queries/RosaWizardQueries/useFetchGetAvailableRegionalInstances';
import { clearListVpcs } from '~/redux/actions/ccsInquiriesActions';
import { clusterAutoscalerActions } from '~/redux/actions/clusterAutoscalerActions';
import { onResetFiltersAndFlags } from '~/redux/actions/viewOptionsActions';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { isRestrictedEnv } from '~/restrictedEnv';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import getClusterName from '../../../common/getClusterName';
import { isValid, shouldRefetchQuota } from '../../../common/helpers';
import {
  isAssistedInstallCluster,
  isUninstalledAICluster,
} from '../../../common/isAssistedInstallerCluster';
import { hasCapability, subscriptionCapabilities } from '../../../common/subscriptionCapabilities';
import { userActions } from '../../../redux/actions';
import { getUserAccess } from '../../../redux/actions/costActions';
import { clearGlobalError, setGlobalError } from '../../../redux/actions/globalErrorActions';
import { getNotificationContacts } from '../../../redux/actions/supportActions';
import { fetchUpgradeGates } from '../../../redux/actions/upgradeGateActions';
import { viewConstants } from '../../../redux/constants';
import ErrorBoundary from '../../App/ErrorBoundary';
import Unavailable from '../../common/Unavailable';
import clusterStates, {
  canViewMachinePoolTab,
  isHibernating,
  isHypershiftCluster,
} from '../common/clusterStates';
import CommonClusterModals from '../common/CommonClusterModals';
import { canSubscribeOCPMultiRegion } from '../common/EditSubscriptionSettingsDialog/canSubscribeOCPSelector';
import { userCanHibernateClustersSelector } from '../common/HibernateClusterModal/HibernateClusterModalSelectors';
import ReadOnlyBanner from '../common/ReadOnlyBanner';
import { canTransferClusterOwnershipMultiRegion } from '../common/TransferClusterOwnershipDialog/utils/transferClusterOwnershipDialogSelectors';
import CancelUpgradeModal from '../common/Upgrades/CancelUpgradeModal/CancelUpgradeModal';
import { getSchedules } from '../common/Upgrades/clusterUpgradeActions';

import AccessControl from './components/AccessControl/AccessControl';
import usersActions from './components/AccessControl/UsersSection/UsersActions';
import { AccessRequest } from './components/AccessRequest/AccessRequest';
import AddOns from './components/AddOns';
import ClusterDetailsTop from './components/ClusterDetailsTop/ClusterDetailsTop';
import ClusterLogs from './components/ClusterLogs/ClusterLogs';
import { ClusterTabsId } from './components/common/ClusterTabIds';
import DeleteIDPDialog from './components/DeleteIDPDialog';
import { fetchClusterInsights } from './components/Insights/InsightsActions';
import MachinePools from './components/MachinePools';
import Monitoring from './components/Monitoring';
import { getOnDemandMetrics } from './components/Monitoring/MonitoringActions';
import { issuesAndWarningsSelector } from './components/Monitoring/monitoringSelectors';
import Networking from './components/Networking';
import { getClusterRouters } from './components/Networking/NetworkingActions';
import Overview from './components/Overview/Overview';
import Support from './components/Support';
import AddNotificationContactDialog from './components/Support/components/AddNotificationContactDialog';
import TabsRow from './components/TabsRow/TabsRow';
import UpgradeSettingsTab from './components/UpgradeSettings';
import { eventTypes } from './clusterDetailsHelper';

const PAGE_TITLE = 'Red Hat OpenShift Cluster Manager';

const ClusterDetails = (props) => {
  const location = useLocation();
  const { toggleSubscriptionReleased } = props;
  const [gcpOrgPolicyWarning, setGcpOrgPolicyWarning] = React.useState('');
  const monitoring = useGlobalState((state) => state.monitoring);

  const canHibernateCluster = useGlobalState((state) => userCanHibernateClustersSelector(state));
  const anyModalOpen = useGlobalState((state) => !!state.modal.modalName);
  const userAccess = useGlobalState((state) => state.cost.userAccess);

  const { organization } = useGlobalState((state) => state.userProfile);
  const { insightsData } = useGlobalState((state) => state.insightsData);
  const {
    notificationContacts = {
      pending: false,
    },
  } = useGlobalState((state) => state.clusterSupport);
  const { clusterRouters } = useGlobalState((state) => state.clusterRouters);

  const isSubscriptionSettingsRequestPending = useGlobalState((state) =>
    get(state, 'subscriptionSettings.requestState.pending', false),
  );
  const isAutoClusterTransferOwnershipEnabled = useFeatureGate(AUTO_CLUSTER_TRANSFER_OWNERSHIP);

  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const subscriptionID = params.id;

  const {
    isLoading: isClusterDetailsLoading,
    cluster,
    isError,
    error,
    isFetching,
  } = useFetchClusterDetails(subscriptionID);

  const {
    isLoading: isClusterIdentityProvidersLoading,
    clusterIdentityProviders,
    isError: clusterIdentityProvidersError,
  } = useFetchClusterIdentityProviders(cluster?.id, cluster?.subscription?.rh_region_id);

  const {
    isLoading: isCloudProvidersLoading,
    data: cloudProviders,
    isError: cloudProvidersError,
  } = useFetchCloudProviders();

  const {
    mutate: addNotificationMutation,
    isSuccess: isAddNotificationContactSuccess,
    isPending: isAddNotificationContactPending,
    error: addNotificationContactError,
    status: addNotificationStatus,
  } = useAddNotificationContact(subscriptionID);

  const { data: availableRegionalInstances } = useFetchGetAvailableRegionalInstances(true);

  const regionId = cluster?.region?.id;
  const regionalInstance = findRegionalInstance(regionId, availableRegionalInstances);

  const { data: accessProtection, isLoading: isAccessProtectionLoading } =
    useFetchAccessProtection(subscriptionID);

  const wifConfigId = cluster?.gcp?.authentication?.id;
  const {
    data: wifConfigData,
    isLoading: isWifLoading,
    isSuccess: isWifSuccess,
  } = useFetchGCPWifConfig(wifConfigId);

  const { data: pendingAccessRequests } = useFetchPendingAccessRequests(
    subscriptionID,
    isAccessProtectionLoading,
    accessProtection,
  );

  const externalClusterID = get(cluster, 'external_id');

  // Recreation of function, no cluster in the redux.
  const canSubscribeOCP = canSubscribeOCPMultiRegion(cluster);
  const canTransferClusterOwnership = canTransferClusterOwnershipMultiRegion(cluster);
  const hasIssues = issuesAndWarningsSelector(monitoring, cluster).issues.totalCount > 0;

  // eslint-disable-next-line no-unused-vars
  const displayClusterLogs = cluster && (!!cluster.external_id || !!cluster.id);

  const initTabOpen = location.hash.replace('#', '');
  const [selectedTab, setSelectedTab] = React.useState('');
  // eslint-disable-next-line no-unused-vars
  const [refreshEvent, setRefreshEvent] = React.useState({ type: eventTypes.NONE });

  const overviewTabRef = React.useRef();
  const monitoringTabRef = React.useRef();
  const accessControlTabRef = React.useRef();
  const addOnsTabRef = React.useRef();
  const clusterHistoryTabRef = React.useRef();
  const networkingTabRef = React.useRef();
  const supportTabRef = React.useRef();
  const machinePoolsTabRef = React.useRef();
  const upgradeSettingsTabRef = React.useRef();
  const addAssistedTabRef = React.useRef();
  const accessRequestsTabRef = React.useRef();

  // PrevProps replication using refs
  const prevClusterId = React.useRef(cluster?.id);

  const resetFiltersAndFlags = () => {
    dispatch(onResetFiltersAndFlags(viewConstants.CLUSTER_LOGS_VIEW));
  };
  const onDialogClose = () => {
    if (isValid(subscriptionID)) {
      invalidateClusterDetailsQueries();
    }
  };

  const fetchSupportData = () => {
    const subscriptionID = cluster?.subscription?.id;
    if (isValid(subscriptionID)) {
      if (!notificationContacts.pending) {
        dispatch(getNotificationContacts(subscriptionID));
      }
    }
  };

  const refreshIDP = () => {
    const clusterID = cluster?.id;
    if (
      isValid(clusterID) &&
      !isClusterIdentityProvidersLoading &&
      !clusterIdentityProvidersError
    ) {
      refetchClusterIdentityProviders(clusterID);
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [drawerInfo, setDrawerInfo] = React.useState();
  const [selectedCardTitle, setSelectedCardTitle] = React.useState('');

  const openDrawer = (title, content) => {
    setDrawerInfo({ title, content });
    setIsDrawerOpen(true);

    setSelectedCardTitle(title);
  };

  const closeDrawer = () => {
    setDrawerInfo(undefined);
    setIsDrawerOpen(false);

    setSelectedCardTitle('');
  };

  /**
   * Refresh the cluster's related resources.
   * Has to be refactored during tabs update for Data Sovereignty
   */
  const refreshRelatedResources = (clicked) => {
    /* TODO everything here has to be moved to the individual tabs that require this info
      ideally cluster details should dispatch an event on refresh,
      and leave sub-resource handling for sub-components.
  
      https://issues.redhat.com/browse/SDA-2249
      */
    const clusterID = get(cluster, 'id');
    const isManaged = get(cluster, 'managed', false);
    if (shouldRefetchQuota(organization)) {
      dispatch(userActions.getOrganizationAndQuota());
    }
    if (externalClusterID) {
      dispatch(fetchClusterInsights(externalClusterID));
      fetchSupportData();
    }
    if (externalClusterID || clusterID) {
      refetchClusterLogsQueries();
    }

    if (subscriptionID && !isAccessProtectionLoading && !isRestrictedEnv()) {
      refetchAccessProtection();
    }

    if (isManaged) {
      // All managed-cluster-specific requests
      dispatch(usersActions.getUsers(clusterID));
      dispatch(getClusterRouters(clusterID));
      refreshIDP();
      dispatch(getSchedules(clusterID, isHypershiftCluster(cluster)));
      dispatch(fetchUpgradeGates());
    } else {
      const subscriptionID = cluster?.subscription?.id;

      dispatch(getOnDemandMetrics(subscriptionID));
    }
    setRefreshEvent({ type: clicked || eventTypes.AUTO });
  };

  const refresh = (clicked) => {
    if (isValid(subscriptionID)) {
      invalidateClusterDetailsQueries();
    }
    const clusterID = get(cluster, 'id');
    const subscriptionStatus = get(cluster, 'subscription.status');
    if (isValid(clusterID) && subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned) {
      refreshRelatedResources(clicked);
    }
    refetchOrganizationQuota(organization?.details?.id);
  };

  React.useEffect(() => {
    dispatch(clearGlobalError('clusterDetails'));
    refresh();
    if (!isCloudProvidersLoading && !cloudProvidersError && !cloudProviders) {
      invalidateCloudProviders();
    }
    dispatch(getUserAccess({ type: 'OCP' }));

    return () => {
      refetchClusterIdentityProviders();
      dispatch(modalActions.closeModal());
      refetchClusterLogsQueries();
      dispatch(clusterAutoscalerActions.clearClusterAutoscalerResponse());
      resetFiltersAndFlags();
      dispatch(clearListVpcs());
    };
    // Should run only once on mount and once on unmount
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const subscriptionID = params.id;
    if (get(cluster, 'subscription.id') === subscriptionID) {
      const clusterName = getClusterName(cluster);
      document.title = `${clusterName} | Red Hat OpenShift Cluster Manager`;
    }

    if (!prevClusterId.current && !isClusterDetailsLoading && cluster && cluster?.id) {
      refreshRelatedResources();
      prevClusterId.current = cluster?.id;
    }
    // Eslint issue with dependency on refreshRelatedResources
    // has to be wrapped in useCallback
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [params, cluster, subscriptionID]);

  const requestedSubscriptionID = params.id;

  // If the ClusterDetails screen is loaded once for one cluster, and then again for another,
  // the redux state will have the data for the previous cluster. We want to ensure we only
  // show data for the requested cluster, so different data should be marked as pending.
  // Probbbably no longer needed with React Query
  // TODO: errorState spinner
  const isPending = get(cluster, 'subscription.id') !== requestedSubscriptionID;

  const errorState = () => (
    <AppPage title={PAGE_TITLE}>
      <Unavailable message="Error retrieving cluster details" response={error} />
      {isPending && <Spinner size="lg" aria-label="Loading..." />}
    </AppPage>
  );

  // organization.details is required by canCreateGCPNonCCSCluster below
  // and must be loaded so the Networking tab displays properly
  if (isClusterDetailsLoading || (!organization.fulfilled && !error && !isError)) {
    return (
      <AppPage title={PAGE_TITLE}>
        <div id="clusterdetails-content">
          <div className="cluster-loading-container">
            <div className="pf-v6-u-text-align-center">
              <Spinner size="lg" arial-label="Loading..." />
            </div>
          </div>
        </div>
      </AppPage>
    );
  }

  // show a full error state only if we don't have data at all,
  // or when we only have data for a different cluster
  if (isError && (!cluster || get(cluster, 'subscription.id') !== requestedSubscriptionID)) {
    if (error?.errorCode === 404 || error?.errorCode === 403) {
      refetchAccessProtection();
      refetchAccessRequest();
      dispatch(
        setGlobalError(
          <>
            Cluster with subscription ID <b>{requestedSubscriptionID}</b> was not found, it might
            have been deleted or you don&apos;t have permission to see it.
          </>,
          'clusterDetails',
          `${error?.errorMessage}`,
        ),
      );
      return <Navigate to="/cluster-list" />;
    }
    return errorState();
  }

  const onTabSelected = (tabId) => {
    setSelectedTab(tabId);
  };

  const clusterHibernating = isHibernating(cluster);
  const isArchived =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Archived ||
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Deprovisioned;
  const isAROCluster = get(cluster, 'subscription.plan.type', '') === knownProducts.ARO;
  const isOSDTrial = get(cluster, 'subscription.plan.type', '') === knownProducts.OSDTrial;
  const isRHOIC = get(cluster, 'subscription.plan.type', '') === knownProducts.RHOIC;
  const gotRouters = get(clusterRouters, 'getRouters.routers.length', 0) > 0;
  const isROSA = get(cluster, 'subscription.plan.type') === normalizedProducts.ROSA;

  // eslint-disable-next-line no-unused-vars
  const isManaged = cluster.managed;
  const isHypershift = isHypershiftCluster(cluster);
  const isClusterWaiting = cluster.state === clusterStates.waiting;
  const isClusterPending = cluster.state === clusterStates.pending;
  const isClusterInstalling = cluster.state === clusterStates.installing;
  const isClusterReady = cluster.state === clusterStates.ready;
  const isClusterUpdating = cluster.state === clusterStates.updating;
  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  // eslint-disable-next-line no-unused-vars
  const canCreateGCPNonCCSCluster = hasCapability(
    organization.details,
    subscriptionCapabilities.CREATE_GCP_NON_CCS_CLUSTER,
  );
  const displayAddOnsTab =
    !isClusterInstalling &&
    !isClusterPending &&
    !isClusterWaiting &&
    cluster.managed &&
    !isArchived &&
    !isRestrictedEnv();

  const displayMonitoringTab =
    !isArchived &&
    !cluster.managed &&
    !isAROCluster &&
    !isRHOIC &&
    !isUninstalledAICluster(cluster) &&
    !isRestrictedEnv();
  const displayAccessControlTab = !isArchived;
  const cloudProvider = get(cluster, 'cloud_provider.id');
  const displayNetworkingTab =
    (isClusterReady || isClusterUpdating || clusterHibernating) &&
    cluster.managed &&
    !!get(cluster, 'api.url') &&
    (cloudProvider === 'aws' ||
      (cloudProvider === 'gcp' && (get(cluster, 'ccs.enabled') || gotRouters))) &&
    !isArchived;
  const hideSupportTab = isRestrictedEnv()
    ? false
    : cluster.managed &&
      // The (managed) cluster has not yet reported its cluster ID to AMS
      // eslint-disable-next-line camelcase
      cluster.external_id === undefined;
  const displaySupportTab = !hideSupportTab && !isOSDTrial;
  const displayUpgradeSettingsTab =
    cluster.managed && !isAROCluster && cluster.canEdit && !isArchived;

  const accessRequestsTabVisible = accessProtection?.enabled;

  let addHostsTabState = { showTab: false, isDisabled: false, tabTooltip: '' };
  if (isAssistedInstallCluster(cluster) && !isArchived) {
    addHostsTabState = getAddHostsTabState(cluster);
  }

  const findGcpOrgPolicyWarning = (logs) => {
    let log = '';
    log = logs?.find(
      (obj) =>
        obj.summary?.includes('Please enable the Org Policy API for the Google Cloud project') ||
        obj.summary?.includes('Google Cloud Organization Policy Service'),
    );
    setGcpOrgPolicyWarning(log?.summary);
  };

  return (
    <DrawerPanel
      title={drawerInfo?.title}
      content={drawerInfo?.content}
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
    >
      <AppPage title={PAGE_TITLE}>
        <ReadOnlyBanner isReadOnly={isReadOnly} />
        <PageSection hasBodyWrapper={false} id="clusterdetails-content">
          <ClusterDetailsTop
            cluster={cluster}
            isRefetching={isFetching}
            pending={isClusterDetailsLoading}
            refreshFunc={refresh}
            clickRefreshFunc={() => refresh(eventTypes.CLICKED)}
            clusterIdentityProviders={clusterIdentityProviders}
            organization={organization}
            error={isError}
            errorMessage={error?.errorObj.response.data.reason}
            canSubscribeOCP={canSubscribeOCP}
            canTransferClusterOwnership={canTransferClusterOwnership}
            isAutoClusterTransferOwnershipEnabled={isAutoClusterTransferOwnershipEnabled}
            canHibernateCluster={canHibernateCluster}
            autoRefreshEnabled={!anyModalOpen}
            toggleSubscriptionReleased={toggleSubscriptionReleased}
            showPreviewLabel={isHypershift}
            isClusterIdentityProvidersLoading={isClusterIdentityProvidersLoading}
            clusterIdentityProvidersError={clusterIdentityProvidersError}
            gcpOrgPolicyWarning={gcpOrgPolicyWarning}
            regionalInstance={regionalInstance}
            openDrawer={openDrawer}
            closeDrawer={closeDrawer}
            selectedCardTitle={selectedCardTitle}
          >
            <TabsRow
              tabsInfo={{
                [ClusterTabsId.OVERVIEW]: { ref: overviewTabRef, hasIssues: false },
                [ClusterTabsId.MONITORING]: {
                  ref: monitoringTabRef,
                  show: displayMonitoringTab,
                  hasIssues: cluster.state !== clusterStates.installing && hasIssues,
                },
                [ClusterTabsId.ACCESS_CONTROL]: {
                  ref: accessControlTabRef,
                  show: displayAccessControlTab,
                },
                [ClusterTabsId.ADD_ONS]: { ref: addOnsTabRef, show: displayAddOnsTab },
                [ClusterTabsId.CLUSTER_HISTORY]: {
                  ref: clusterHistoryTabRef,
                  show: displayClusterLogs,
                },
                [ClusterTabsId.NETWORKING]: {
                  ref: networkingTabRef,
                  show: displayNetworkingTab,
                },
                [ClusterTabsId.MACHINE_POOLS]: {
                  ref: machinePoolsTabRef,
                  show: canViewMachinePoolTab(cluster),
                },
                [ClusterTabsId.SUPPORT]: {
                  ref: supportTabRef,
                  show: displaySupportTab,
                },
                [ClusterTabsId.UPDATE_SETTINGS]: {
                  ref: upgradeSettingsTabRef,
                  show: displayUpgradeSettingsTab,
                },
                [ClusterTabsId.ADD_ASSISTED_HOSTS]: {
                  ref: addAssistedTabRef,
                  show: addHostsTabState.showTab,
                  isDisabled: addHostsTabState.isDisabled,
                  tooltip: addHostsTabState.tabTooltip,
                },
                [ClusterTabsId.ACCESS_REQUEST]: {
                  ref: accessRequestsTabRef,
                  show: accessRequestsTabVisible,
                  tooltip: (
                    <Tooltip
                      content={
                        pendingAccessRequests?.total > 0
                          ? `${pendingAccessRequests.total} pending request${pendingAccessRequests.total > 1 ? 's' : ''}`
                          : 'No pending requests'
                      }
                    />
                  ),
                  hasIssues: pendingAccessRequests?.total > 0,
                  numberOfIssues: pendingAccessRequests?.total,
                  isLoading: pendingAccessRequests?.pending,
                },
              }}
              initTabOpen={initTabOpen}
              onTabSelected={onTabSelected}
            />
          </ClusterDetailsTop>
          <TabContent
            eventKey={ClusterTabsId.OVERVIEW}
            id="overviewTabContent"
            ref={overviewTabRef}
            aria-label="Overview"
            ouiaId="overviewTabContent"
          >
            <ErrorBoundary>
              <Overview
                cluster={cluster}
                region={cluster.subscription.rh_region_id}
                clusterDetailsLoading={isClusterDetailsLoading}
                clusterDetailsFetching={isFetching}
                subscription={cluster.subscription}
                cloudProviders={cloudProviders}
                refresh={refresh}
                insightsData={insightsData[cluster.external_id]}
                userAccess={userAccess}
                canSubscribeOCP={canSubscribeOCP}
                isSubscriptionSettingsRequestPending={isSubscriptionSettingsRequestPending}
                wifConfigData={{
                  displayName: wifConfigData?.display_name,
                  isLoading: isWifLoading,
                  isSuccess: isWifSuccess,
                }}
              />
            </ErrorBoundary>
          </TabContent>

          {displayMonitoringTab && (
            <TabContent
              eventKey={ClusterTabsId.MONITORING}
              id="monitoringTabContent"
              ref={monitoringTabRef}
              aria-label="Monitoring"
              hidden
            >
              <ErrorBoundary>
                <Monitoring cluster={cluster} />
              </ErrorBoundary>
            </TabContent>
          )}
          {displayAccessControlTab && (
            <TabContent
              eventKey={ClusterTabsId.ACCESS_CONTROL}
              id="accessControlTabContent"
              ref={accessControlTabRef}
              aria-label="Access Control"
              hidden
            >
              <ErrorBoundary>
                <AccessControl
                  cluster={cluster}
                  refreshEvent={refreshEvent}
                  region={cluster.subscription.rh_region_id}
                  isAutoClusterTransferOwnershipEnabled={isAutoClusterTransferOwnershipEnabled}
                  isROSA={isROSA}
                />
              </ErrorBoundary>
            </TabContent>
          )}
          {isManaged && (
            <TabContent
              eventKey={ClusterTabsId.ADD_ONS}
              id="addOnsTabContent"
              ref={addOnsTabRef}
              aria-label="Add-ons"
              hidden
            >
              <ErrorBoundary>
                <AddOns
                  clusterID={cluster.id}
                  isHypershift={isHypershift}
                  region={cluster.subscription.rh_region_id}
                  cluster={cluster}
                />
              </ErrorBoundary>
            </TabContent>
          )}
          {displayClusterLogs && (
            <TabContent
              eventKey={ClusterTabsId.CLUSTER_HISTORY}
              id="clusterHistoryTabContent"
              ref={clusterHistoryTabRef}
              aria-label="Cluster history"
              hidden
            >
              <ErrorBoundary>
                <ClusterLogs
                  externalClusterID={cluster.external_id}
                  clusterID={cluster.id}
                  region={cluster.subscription?.rh_region_id}
                  createdAt={cluster.creation_timestamp}
                  refreshEvent={{
                    type: refreshEvent.type,
                    reset: () => setRefreshEvent({ type: eventTypes.NONE }),
                  }}
                  isVisible={selectedTab === ClusterTabsId.CLUSTER_HISTORY}
                  findGcpOrgPolicyWarning={
                    cloudProvider === 'gcp' ? findGcpOrgPolicyWarning : undefined
                  }
                />
              </ErrorBoundary>
            </TabContent>
          )}
          {displayNetworkingTab && (
            <TabContent
              eventKey={ClusterTabsId.NETWORKING}
              id="networkingTabContent"
              ref={networkingTabRef}
              aria-label="Networking"
              hidden
            >
              <ErrorBoundary>
                <Networking
                  clusterID={cluster.id}
                  refreshCluster={refresh}
                  cluster={cluster}
                  isManaged={cluster.managed}
                  region={cluster.subscription.rh_region_id}
                />
              </ErrorBoundary>
            </TabContent>
          )}
          {canViewMachinePoolTab(cluster) && (
            <TabContent
              eventKey={ClusterTabsId.MACHINE_POOLS}
              id="machinePoolsContent"
              ref={machinePoolsTabRef}
              aria-label="Machine pools"
              hidden
            >
              <ErrorBoundary>
                <MachinePools cluster={cluster} />
              </ErrorBoundary>
            </TabContent>
          )}
          <TabContent
            eventKey={ClusterTabsId.SUPPORT}
            id="supportTabContent"
            ref={supportTabRef}
            aria-label="Support"
            hidden
          >
            <ErrorBoundary>
              {cluster ? (
                <Support
                  isDisabled={isArchived}
                  cluster={cluster}
                  addNotificationStatus={addNotificationStatus}
                  isAddNotificationContactSuccess={isAddNotificationContactSuccess}
                  isAddNotificationContactPending={isAddNotificationContactPending}
                />
              ) : null}
            </ErrorBoundary>
          </TabContent>
          {displayUpgradeSettingsTab && (
            <TabContent
              eventKey={ClusterTabsId.UPDATE_SETTINGS}
              id="upgradeSettingsContent"
              ref={upgradeSettingsTabRef}
              aria-label="Upgrade settings"
              hidden
            >
              <ErrorBoundary>
                <UpgradeSettingsTab cluster={cluster} />
              </ErrorBoundary>
            </TabContent>
          )}
          {/* If the tab is shown and disabled, it will have a tooltip and no content */}
          {addHostsTabState.showTab && !addHostsTabState.isDisabled && (
            <TabContent
              eventKey={ClusterTabsId.ADD_ASSISTED_HOSTS}
              id="addHostsContent"
              ref={addAssistedTabRef}
              aria-label="Add Hosts"
              hidden
            >
              <ErrorBoundary>
                <AIHostsClusterDetailTab
                  cluster={cluster}
                  isVisible={selectedTab === ClusterTabsId.ADD_ASSISTED_HOSTS}
                />
              </ErrorBoundary>
            </TabContent>
          )}
          {accessRequestsTabVisible ? (
            <TabContent
              eventKey={ClusterTabsId.ACCESS_REQUEST}
              id="accessRequestsContent"
              ref={accessRequestsTabRef}
              aria-label="Access Requests"
              hidden
            >
              <ErrorBoundary>
                <AccessRequest subscriptionId={subscriptionID} showClusterName={false} />
              </ErrorBoundary>
            </TabContent>
          ) : null}

          <CommonClusterModals
            onClose={onDialogClose}
            onClusterDeleted={() => {
              invalidateClusterDetailsQueries();
              navigate('/cluster-list');
            }}
          />
          <DeleteIDPDialog refreshParent={refreshIDP} />
          {cluster ? (
            <AddNotificationContactDialog
              cluster={cluster}
              addNotificationMutation={addNotificationMutation}
              isAddNotificationContactSuccess={isAddNotificationContactSuccess}
              isAddNotificationContactPending={isAddNotificationContactPending}
              addNotificationContactError={addNotificationContactError}
            />
          ) : null}
          <CancelUpgradeModal isHypershift={isHypershift} />
        </PageSection>
      </AppPage>
    </DrawerPanel>
  );
};

ClusterDetails.propTypes = {
  toggleSubscriptionReleased: PropTypes.func.isRequired,
};

export default ClusterDetails;
