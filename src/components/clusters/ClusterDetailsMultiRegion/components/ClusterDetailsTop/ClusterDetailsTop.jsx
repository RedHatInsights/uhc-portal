import React, { useState } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Alert,
  Badge,
  Button,
  ExpandableSection,
  Flex,
  FlexItem,
  Skeleton,
  Spinner,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import { getOCMResourceType, trackEvents } from '~/common/analytics';
import getClusterName from '~/common/getClusterName';
import { goZeroTime2Null } from '~/common/helpers';
import isAssistedInstallSubscription, {
  isAvailableAssistedInstallCluster,
  isUninstalledAICluster,
} from '~/common/isAssistedInstallerCluster';
import { HAS_USER_DISMISSED_RECOMMENDED_OPERATORS_ALERT } from '~/common/localStorageConstants';
import { useNavigate } from '~/common/routing';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { PreviewLabel } from '~/components/clusters/common/PreviewLabel';
import Breadcrumbs from '~/components/common/Breadcrumbs';
import ButtonWithTooltip from '~/components/common/ButtonWithTooltip';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import RefreshButton from '~/components/common/RefreshButton/RefreshButton';
import useAnalytics from '~/hooks/useAnalytics';
import { usePreviousProps } from '~/hooks/usePreviousProps';
import { refreshClusterDetails } from '~/queries/refreshEntireCache';
import {
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
  SubscriptionCommonFieldsStatus,
  SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel,
} from '~/types/accounts_mgmt.v1';

import ClusterActionsDropdown from '../../../common/ClusterActionsDropdown';
import clusterStates, {
  hasInflightEgressErrors,
  isHibernating,
  isOffline,
} from '../../../common/clusterStates';
import ErrorTriangle from '../../../common/ErrorTriangle';
import HibernatingClusterCard from '../../../common/HibernatingClusterCard/HibernatingClusterCard';
import InstallationLogView, { shouldShowLogs } from '../Overview/InstallationLogView';

import ClusterNonEditableAlert from './components/ClusterNonEditableAlert';
import ClusterProgressCard from './components/ClusterProgressCard';
import ClusterStatusMonitor from './components/ClusterStatusMonitor';
import ExpirationAlert from './components/ExpirationAlert';
import GcpOrgPolicyAlert from './components/GcpOrgPolicyAlert';
import LimitedSupportAlert from './components/LimitedSupportAlert';
import { RecommendedOperatorsAlert } from './components/RecommendedOperatorsAlert/RecommendedOperatorsAlert';
import SubscriptionCompliancy from './components/SubscriptionCompliancy';
import TermsAlert from './components/TermsAlert';
import TransferClusterOwnershipInfo from './components/TransferClusterOwnershipInfo';

const IdentityProvidersHint = () => {
  const navigate = useNavigate();
  return (
    <Alert
      id="idpHint"
      className="pf-v6-u-mt-md"
      isInline
      title="Create an identity provider to access cluster"
    >
      Identity providers determine how you can log into the cluster. You&apos;ll need to set this up
      so you can access your cluster{' '}
      <p>
        <Button
          variant="link"
          isInline
          onClick={() =>
            navigate({
              hash: '#accessControl',
            })
          }
        >
          Create identity provider
        </Button>{' '}
      </p>
    </Alert>
  );
};

function ClusterDetailsTop(props) {
  const {
    cluster,
    pending,
    clusterIdentityProviders,
    organization,
    error,
    errorMessage,
    children,
    canSubscribeOCP,
    canTransferClusterOwnership,
    isAutoClusterTransferOwnershipEnabled,
    canHibernateCluster,
    autoRefreshEnabled,
    toggleSubscriptionReleased,
    showPreviewLabel,
    isClusterIdentityProvidersLoading,
    clusterIdentityProvidersError,
    isRefetching,
    gcpOrgPolicyWarning,
    regionalInstance,
    openDrawer,
    closeDrawer,
    selectedCardTitle,
    refreshFunc,
    region,
  } = props;

  const track = useAnalytics();

  const hasAlertBeenDismissed = localStorage.getItem(
    HAS_USER_DISMISSED_RECOMMENDED_OPERATORS_ALERT,
  );
  const isArchived =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Archived;
  const isDeprovisioned =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Deprovisioned;

  const [showRecommendedOperatorsAlert, setShowRecommendedOperatorsAlert] = useState(
    !hasAlertBeenDismissed && !isArchived && !isDeprovisioned,
  );

  let topCard = null;
  // Temporary solution needs update inside the component. (class based into functional) - OCMUI-2357
  const { openModal } = modalActions;
  const isUninstalling = cluster.state === clusterStates.uninstalling;

  if (isHibernating(cluster)) {
    topCard = <HibernatingClusterCard cluster={cluster} openModal={openModal} />;
  } else if (
    cluster &&
    !isAssistedInstallSubscription(cluster.subscription) &&
    (shouldShowLogs(cluster) || hasInflightEgressErrors(cluster))
  ) {
    topCard =
      cluster.state === clusterStates.error ? (
        <Alert
          variant="danger"
          isInline
          title="Cluster is in an error state."
          className="pf-v6-u-mt-md"
        >
          <p>You can use the logs and network validation to diagnose the problem:</p>
          <InstallationLogView isExpandable={!isUninstalling} cluster={cluster} />
        </Alert>
      ) : (
        <ClusterProgressCard cluster={cluster} regionalInstance={regionalInstance} />
      );
  }

  const dispatch = useDispatch();

  const addNotification = useAddNotification();
  const isProductOSDTrial =
    get(cluster, 'subscription.plan.type', '') === normalizedProducts.OSDTrial;
  const isProductOSDRHM =
    get(cluster, 'subscription.plan.type', '') === normalizedProducts.OSD &&
    get(cluster, 'subscription.cluster_billing_model', '') ===
      SubscriptionCommonFieldsClusterBillingModel.marketplace;
  const isOSD = get(cluster, 'subscription.plan.type') === normalizedProducts.OSD;
  const isROSA = get(cluster, 'subscription.plan.type') === normalizedProducts.ROSA;
  const isOCP = get(cluster, 'subscription.plan.type') === normalizedProducts.OCP;
  const supportLevel = get(cluster, 'subscription.support_level');
  const clusterName = getClusterName(cluster);
  const consoleURL = cluster.console ? cluster.console.url : false;
  const creationDateStr = get(cluster, 'creation_timestamp', '');

  const hasIdentityProviders = clusterIdentityProviders?.items?.length > 0;
  const showIDPMessage =
    cluster.managed &&
    cluster.idpActions?.create &&
    cluster.state === clusterStates.ready &&
    !isClusterIdentityProvidersLoading &&
    !clusterIdentityProvidersError &&
    !hasIdentityProviders;

  const canUpgradeTrial = cluster.state === clusterStates.ready && cluster.canEdit;
  const trialExpirationUpgradeProps = canUpgradeTrial
    ? {
        trialExpiration: true,
        openModal,
        cluster,
      }
    : {};

  const addConsoleURLModal = () => {
    dispatch(modalActions.openModal(modals.EDIT_CONSOLE_URL, cluster));
  };

  let launchConsole;
  if (consoleURL && !isOffline(cluster)) {
    launchConsole = (
      <a
        href={consoleURL}
        target="_blank"
        rel="noopener noreferrer"
        className="pull-left"
        data-testid="console-url-link"
      >
        <Button variant="primary">Open console</Button>
      </a>
    );
  } else if (cluster.managed) {
    launchConsole = (
      <Button
        variant="primary"
        isDisabled
        title={
          cluster.state === clusterStates.uninstalling
            ? 'The cluster is being uninstalled'
            : 'Admin console is not yet available for this cluster'
        }
      >
        Open console
      </Button>
    );
  } else if (cluster.canEdit && !isUninstalledAICluster(cluster)) {
    launchConsole = (
      <Button variant="primary" onClick={() => addConsoleURLModal()}>
        Add console URL
      </Button>
    );
  }

  // TODO: Required until actions menu story is done
  // eslint-disable-next-line no-unused-vars
  const actions = !isUninstalledAICluster(cluster) && (
    <ClusterActionsDropdown
      disabled={!cluster.canEdit && !cluster.canDelete}
      cluster={cluster}
      organization={organization.details}
      showConsoleButton={false}
      canSubscribeOCP={canSubscribeOCP}
      canTransferClusterOwnership={canTransferClusterOwnership}
      isAutoClusterTransferOwnershipEnabled={isAutoClusterTransferOwnershipEnabled}
      toggleSubscriptionReleased={toggleSubscriptionReleased}
      canHibernateCluster={canHibernateCluster}
      refreshFunc={refreshClusterDetails}
    />
  );

  const breadcrumbs = (
    <Breadcrumbs
      path={[
        { label: 'Cluster List' },
        (isArchived || isDeprovisioned) && { label: 'Cluster Archives', path: '/archived' },
        { label: clusterName },
      ].filter(Boolean)}
    />
  );

  const isRefreshing =
    pending || organization.pending || isClusterIdentityProvidersLoading || isRefetching;

  const trialEndDate = isProductOSDTrial && get(cluster, 'subscription.trial_end_date');
  const OSDRHMEndDate =
    isProductOSDRHM && goZeroTime2Null(get(cluster, 'subscription.billing_expiration_date'));

  const canNotEditReason =
    !cluster.canEdit && 'You do not have permissions to unarchive this cluster';

  const unarchiveBtn = (
    <ButtonWithTooltip
      variant="secondary"
      onClick={() => {
        dispatch(
          openModal(modals.UNARCHIVE_CLUSTER, {
            subscriptionID: cluster.subscription ? cluster.subscription.id : '',
            name: clusterName,
          }),
        );
      }}
      disableReason={canNotEditReason}
    >
      Unarchive
    </ButtonWithTooltip>
  );

  const showGcpOrgPolicyWarning =
    gcpOrgPolicyWarning &&
    !isDeprovisioned &&
    cluster.state !== clusterStates.ready &&
    cluster.state !== clusterStates.uninstalling;

  // TODO: Part of ClusterStatusMonitor story (installation)
  // eslint-disable-next-line no-unused-vars
  const shouldShowStatusMonitor =
    [
      clusterStates.waiting,
      clusterStates.pending,
      clusterStates.installing,
      clusterStates.error,
      clusterStates.uninstalling,
    ].includes(cluster.state) || hasInflightEgressErrors(cluster);

  // If cluster is uninstalling - navigate away once the
  // status monitor is no longer needed
  const prevClusterState = usePreviousProps(cluster)?.state;
  const navigate = useNavigate();
  React.useEffect(() => {
    if (
      prevClusterState === clusterStates.uninstalling &&
      cluster.state !== clusterStates.uninstalling &&
      !shouldShowStatusMonitor
    ) {
      addNotification({
        title: `Successfully uninstalled cluster ${getClusterName(cluster)}`,
        variant: 'success',
      });

      navigate('/cluster-list');
    }
  }, [
    addNotification,
    cluster,
    cluster.state,
    dispatch,
    navigate,
    prevClusterState,
    shouldShowStatusMonitor,
  ]);

  // Alerts
  const [isExpanded, setIsExpanded] = useState(false);

  const [hasLimitedSupportAlert, setHasLimitedSupportAlert] = React.useState(false);
  const [hasStatusMonitorAlert, setHasStatusMonitorAlert] = React.useState(false);
  const hasIDPAlert = showIDPMessage;
  const hasExpirationAlert = !!cluster.expiration_timestamp;
  const hasTrialExpirationAlert = !!trialEndDate && !isDeprovisioned;
  const hasOsdRHMEEndDateAlert = OSDRHMEndDate && !isDeprovisioned;
  const hasGCPOrgPolicyAlert = !!showGcpOrgPolicyWarning;
  const hasSubscriptionCompliancyAlert =
    isOCP &&
    !isArchived &&
    !isDeprovisioned &&
    (supportLevel === SubscriptionCommonFieldsSupportLevel.Eval ||
      supportLevel === SubscriptionCommonFieldsSupportLevel.None);
  const hasClusterNonEditableAlert = !cluster.canEdit && isAvailableAssistedInstallCluster(cluster);
  const hasReccomendedOperatorsAlert = showRecommendedOperatorsAlert;
  const [hasTermsAlert, setHasTermsAlert] = React.useState(false);
  const [hasTransferClusterOwnershipAlert, setHasTransferClusterOwnershipAlert] =
    React.useState(false);

  const alerts = [
    hasLimitedSupportAlert,
    hasStatusMonitorAlert,
    hasIDPAlert,
    hasExpirationAlert,
    hasTrialExpirationAlert,
    hasOsdRHMEEndDateAlert,
    hasGCPOrgPolicyAlert,
    hasSubscriptionCompliancyAlert,
    hasClusterNonEditableAlert,
    hasReccomendedOperatorsAlert,
    hasTermsAlert,
    hasTransferClusterOwnershipAlert,
  ];

  const alertsCount = alerts.filter((alert) => alert === true).length || null;

  const updateIsExpanded = () => {
    if (!isExpanded) {
      const clusterProductType = get(cluster, 'subscription.plan.type', '');
      const resourceType = getOCMResourceType(clusterProductType);

      track(trackEvents.ClusterAlerts, {
        resourceType,
        customProperties: { numberAlerts: alertsCount },
      });
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div id="cl-details-top" className="top-row">
      <Split>
        <SplitItem className="pf-v6-u-pb-md">{breadcrumbs}</SplitItem>
      </Split>
      <Split id="cl-details-top-row">
        <SplitItem>
          <Title size="2xl" headingLevel="h1" className="cl-details-page-title">
            {clusterName}
            {showPreviewLabel && (
              <PreviewLabel creationDateStr={creationDateStr} className="pf-v6-u-ml-sm" />
            )}
          </Title>
        </SplitItem>
        <SplitItem>
          {isRefreshing && <Spinner size="lg" aria-label="Loading..." className="pf-v6-u-mx-md" />}
          {error && (
            <ErrorTriangle errorMessage={errorMessage} className="cluster-details-warning" />
          )}
        </SplitItem>
        <SplitItem isFilled />
        <SplitItem>
          <Flex
            flexWrap={{ default: 'nowrap' }}
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            id="cl-details-btns"
          >
            {!isArchived && !isDeprovisioned ? (
              <>
                {launchConsole}
                {actions}
              </>
            ) : (
              !isDeprovisioned && unarchiveBtn
            )}
            {!isDeprovisioned && !isArchived && (
              <RefreshButton
                id="refresh"
                autoRefresh={autoRefreshEnabled}
                refreshFunc={refreshClusterDetails}
                clickRefreshFunc={refreshClusterDetails}
                useShortTimer={!Object.values(clusterStates).includes(cluster.state)}
              />
            )}
          </Flex>
        </SplitItem>
      </Split>

      {topCard}

      {pending ? (
        <Skeleton />
      ) : (
        alertsCount && (
          <ExpandableSection
            id="alerts-expandable-section"
            displaySize="lg"
            className="pf-v6-u-mt-md"
            onToggle={updateIsExpanded}
            toggleContent={
              <Flex>
                <FlexItem>Alerts and recommendations</FlexItem>

                <FlexItem>
                  <Badge data-testid="alerts-badge">{alertsCount}</Badge>
                </FlexItem>
              </Flex>
            }
          >
            <LimitedSupportAlert
              limitedSupportReasons={cluster.limitedSupportReasons}
              isOSD={isOSD}
              isROSA={isROSA}
              setHasLimitedSupportAlert={setHasLimitedSupportAlert}
            />

            {shouldShowStatusMonitor ? (
              <ClusterStatusMonitor
                region={region}
                refresh={refreshFunc}
                cluster={cluster}
                setHasStatusMonitorAlert={setHasStatusMonitorAlert}
              />
            ) : null}

            {showIDPMessage && (
              <Split>
                <SplitItem isFilled>
                  <IdentityProvidersHint />
                </SplitItem>
              </Split>
            )}
            {cluster.expiration_timestamp && (
              <ExpirationAlert expirationTimestamp={cluster.expiration_timestamp} />
            )}
            {trialEndDate && !isDeprovisioned && (
              <ExpirationAlert
                expirationTimestamp={trialEndDate}
                {...trialExpirationUpgradeProps}
              />
            )}
            {OSDRHMEndDate && !isDeprovisioned && (
              <ExpirationAlert expirationTimestamp={OSDRHMEndDate} OSDRHMExpiration />
            )}
            {showGcpOrgPolicyWarning && <GcpOrgPolicyAlert summary={gcpOrgPolicyWarning} />}

            <SubscriptionCompliancy
              cluster={cluster}
              openModal={openModal}
              canSubscribeOCP={canSubscribeOCP}
            />
            {!cluster.canEdit && isAvailableAssistedInstallCluster(cluster) && (
              <ClusterNonEditableAlert />
            )}
            <TransferClusterOwnershipInfo
              subscription={cluster.subscription}
              setHasTransferClusterOwnershipAlert={setHasTransferClusterOwnershipAlert}
            />
            <TermsAlert subscription={cluster.subscription} setHasTermsAlert={setHasTermsAlert} />
            {showRecommendedOperatorsAlert ? (
              <RecommendedOperatorsAlert
                openLearnMore={openDrawer}
                selectedCardTitle={selectedCardTitle}
                closeDrawer={closeDrawer}
                onDismissAlertCallback={() => setShowRecommendedOperatorsAlert(false)}
                clusterState={cluster.state}
                consoleURL={consoleURL}
                cluster={cluster}
                planType={cluster?.subscription?.plan?.id ?? normalizedProducts.UNKNOWN}
              />
            ) : null}
          </ExpandableSection>
        )
      )}

      {children}
    </div>
  );
}

ClusterDetailsTop.propTypes = {
  cluster: PropTypes.object,
  pending: PropTypes.bool.isRequired,
  clusterIdentityProviders: PropTypes.object,
  organization: PropTypes.object.isRequired,
  error: PropTypes.bool,
  errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.element]),
  children: PropTypes.any,
  canSubscribeOCP: PropTypes.bool.isRequired,
  canHibernateCluster: PropTypes.bool.isRequired,
  canTransferClusterOwnership: PropTypes.bool.isRequired,
  isAutoClusterTransferOwnershipEnabled: PropTypes.bool.isRequired,
  autoRefreshEnabled: PropTypes.bool,
  toggleSubscriptionReleased: PropTypes.func.isRequired,
  showPreviewLabel: PropTypes.bool.isRequired,
  isClusterIdentityProvidersLoading: PropTypes.bool.isRequired,
  clusterIdentityProvidersError: PropTypes.bool,
  isRefetching: PropTypes.bool.isRequired,
  gcpOrgPolicyWarning: PropTypes.string,
  regionalInstance: PropTypes.shape({
    environment: PropTypes.string,
    id: PropTypes.string,
    isDefault: PropTypes.bool,
    url: PropTypes.string,
  }),
  openDrawer: PropTypes.func,
  closeDrawer: PropTypes.func,
  selectedCardTitle: PropTypes.string,
  refreshFunc: PropTypes.func,
  region: PropTypes.string,
};

export default ClusterDetailsTop;
