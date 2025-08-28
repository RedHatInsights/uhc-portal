import React from 'react';
import get from 'lodash/get';

import { DropdownItem, DropdownList } from '@patternfly/react-core';

import { isCompatibleFeature, SupportedFeature } from '~/common/featureCompatibility';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import getClusterName from '../../../../common/getClusterName';
import { isAssistedInstallCluster } from '../../../../common/isAssistedInstallerCluster';
import { normalizedProducts } from '../../../../common/subscriptionTypes';
import modals from '../../../common/Modal/modals';
import clusterStates, { isHibernating, isHypershiftCluster } from '../clusterStates';

/**
 * Helper using reason message why it's disabled as source-of-truth
 * for whether it should be disabled.
 * This allows easy chaining `disableIfTooltip(reason1 || reason2 || ...)`.
 *
 * @param tooltip - message to show.  If truthy, also returns `isAriaDisabled: true` prop.
 * @param [propsIfEnabled] - return value if `tooltip` was falsy (default {}).
 */
const disableIfTooltip = (tooltip, propsIfEnabled = {}) =>
  // isDisabled blocks mouse events, so tooltip doesn't show on hover.
  // isAriaDisabled solved this, https://github.com/patternfly/patternfly-react/pull/6038.
  tooltip
    ? { isAriaDisabled: true, tooltipProps: { position: 'left', content: tooltip } }
    : propsIfEnabled;

/**
 * This function is used by PF tables to determine which dropdown items are displayed
 * on each row of the table. It returns a list of objects, containing props for DropdownItem
 * PF table renders automatically.
 * @param {*} cluster             The cluster object corresponding to the current row
 * @param {*} showConsoleButton   true if 'Open Console' button should be displayed
 * @param {*} openModal           Action to open modal
 */
function actionResolver(
  cluster,
  showConsoleButton,
  openModal,
  canSubscribeOCP,
  canHibernateCluster,
  canTransferClusterOwnership,
  isAutoClusterTransferOwnershipEnabled,
  isClusterOwner,
  toggleSubscriptionReleased,
  refreshFunc,
  inClusterList,
  addNotification,
  // dispatch,
) {
  const baseProps = {};
  const isClusterUninstalling = cluster.state === clusterStates.uninstalling;
  const uninstallingMessage = isClusterUninstalling && (
    <span>The cluster is being uninstalled</span>
  );
  const isClusterReady = cluster.state === clusterStates.ready;
  // Superset of more specific uninstallingMessage.
  const notReadyMessage = !isClusterReady && <span>This cluster is not ready</span>;
  const isClusterInHibernatingProcess = isHibernating(cluster);
  const hibernatingMessage =
    isClusterInHibernatingProcess &&
    (cluster.state === clusterStates.resuming ? (
      <>This cluster is resuming; wait for it to be ready in order to perform actions</>
    ) : (
      <>This cluster is hibernating; resume cluster in order to perform actions</>
    ));

  const isClusterHibernatingOrPoweringDown =
    cluster.state === clusterStates.hibernating || cluster.state === clusterStates.powering_down;
  const isClusterPoweringDown = cluster.state === clusterStates.powering_down;
  const poweringDownMessage = isClusterPoweringDown && (
    <span>
      This cluster is powering down; you will be able to resume after it reaches hibernating state.
    </span>
  );

  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const readOnlyMessage = isReadOnly && (
    <span>This operation is not available during maintenance</span>
  );

  const deleteProtectionMessage = cluster.delete_protection?.enabled && (
    <span>
      Cluster is locked and cannot be deleted. To unlock, go to cluster details and disable deletion
      protection.
    </span>
  );

  const consoleURL = get(cluster, 'console.url', false);
  const consoleDisabledMessage = !consoleURL && (
    <span>Admin console is not yet available for this cluster</span>
  );
  const allowAutoTransferClusterOwnership =
    isAutoClusterTransferOwnershipEnabled &&
    isCompatibleFeature(SupportedFeature.AUTO_CLUSTER_TRANSFER_OWNERSHIP, cluster);
  const getKey = (item) => `${cluster.id}.menu.${item}`;
  const clusterName = getClusterName(cluster);
  const isProductOSDTrial = cluster.product && cluster.product.id === normalizedProducts.OSDTrial;

  const getAdminConsoleProps = () => ({
    ...baseProps,
    title: 'Open console',
    key: getKey('adminconsole'),
    ...disableIfTooltip(uninstallingMessage || hibernatingMessage || consoleDisabledMessage, {
      to: consoleURL,
      isExternalLink: true,
      rel: 'noopener noreferrer',
    }),
  });

  const getHibernateClusterProps = () => {
    const hibernateClusterBaseProps = {
      ...baseProps,
      key: getKey('hibernatecluster'),
    };
    const modalData = {
      clusterID: cluster.id,
      clusterName,
      subscriptionID: cluster.subscription ? cluster.subscription.id : '',
      shouldDisplayClusterName: inClusterList,
    };
    const hibernateClusterProps = {
      ...hibernateClusterBaseProps,
      title: 'Hibernate cluster',
      ...disableIfTooltip(uninstallingMessage || readOnlyMessage || notReadyMessage, {
        onClick: () => openModal(modals.HIBERNATE_CLUSTER, modalData),
      }),
    };
    const resumeHibernatingClusterProps = {
      ...hibernateClusterBaseProps,
      title: 'Resume from Hibernation',
      ...disableIfTooltip(poweringDownMessage || readOnlyMessage, {
        onClick: () => openModal(modals.RESUME_CLUSTER, modalData),
      }),
    };

    if (isClusterHibernatingOrPoweringDown) {
      return resumeHibernatingClusterProps;
    }
    return hibernateClusterProps;
  };

  const getScaleClusterProps = () => ({
    ...baseProps,
    title: 'Edit load balancers and persistent storage',
    key: getKey('scalecluster'),
    ...disableIfTooltip(
      uninstallingMessage || readOnlyMessage || hibernatingMessage || notReadyMessage,
      {
        onClick: () =>
          openModal(modals.SCALE_CLUSTER, { ...cluster, shouldDisplayClusterName: inClusterList }),
      },
    ),
  });

  const getEditMachinePoolProps = () => ({
    ...baseProps,
    title: 'Edit machine pool',
    key: getKey('editmachinepools'),
    ...disableIfTooltip(
      uninstallingMessage || readOnlyMessage || hibernatingMessage || notReadyMessage,
      {
        onClick: () =>
          openModal(modals.EDIT_MACHINE_POOL, {
            cluster,
            shouldDisplayClusterName: inClusterList,
          }),
      },
    ),
  });

  const getEditDisplayNameProps = () => ({
    ...baseProps,
    title: 'Edit display name',
    key: getKey('editdisplayname'),
    ...disableIfTooltip(uninstallingMessage, {
      onClick: () =>
        openModal(modals.EDIT_DISPLAY_NAME, {
          ...cluster,
          shouldDisplayClusterName: inClusterList,
        }),
    }),
  });
  const getArchiveClusterProps = () => {
    const baseArchiveProps = {
      ...baseProps,
      title: 'Archive cluster',
      key: getKey('archivecluster'),
    };
    const archiveModalData = {
      subscriptionID: cluster.subscription ? cluster.subscription.id : '',
      name: clusterName,
    };
    return {
      ...baseArchiveProps,
      ...disableIfTooltip(readOnlyMessage, {
        onClick: () =>
          openModal(modals.ARCHIVE_CLUSTER, {
            ...archiveModalData,
            shouldDisplayClusterName: inClusterList,
          }),
      }),
    };
  };

  const getUnarchiveClusterProps = () => {
    const baseArchiveProps = {
      ...baseProps,
      title: 'Unarchive cluster',
      key: getKey('unarchivecluster'),
    };
    const unarchiveModalData = {
      subscriptionID: cluster.subscription ? cluster.subscription.id : '',
      name: clusterName,
    };
    return {
      ...baseArchiveProps,
      ...disableIfTooltip(readOnlyMessage, {
        onClick: () =>
          openModal(modals.UNARCHIVE_CLUSTER, {
            ...unarchiveModalData,
            shouldDisplayClusterName: inClusterList,
          }),
      }),
    };
  };

  const getEditConsoleURLProps = () => ({
    ...baseProps,
    key: getKey('editconsoleurl'),
    ...disableIfTooltip(uninstallingMessage, {
      title: consoleURL ? 'Edit console URL' : 'Add console URL',
      onClick: () =>
        openModal(modals.EDIT_CONSOLE_URL, { ...cluster, shouldDisplayClusterName: inClusterList }),
    }),
  });

  const getDeleteItemProps = () => ({
    ...baseProps,
    title: 'Delete cluster',
    key: getKey('deletecluster'),
    ...disableIfTooltip(
      uninstallingMessage || readOnlyMessage || hibernatingMessage || deleteProtectionMessage,
      {
        onClick: () =>
          openModal(modals.DELETE_CLUSTER, {
            clusterID: cluster.id,
            clusterName,
            shouldDisplayClusterName: inClusterList,
            region: cluster?.subscription?.rh_region_id,
          }),
      },
    ),
  });

  const getEditSubscriptionSettingsProps = () => {
    const editSubscriptionSettingsProps = {
      ...baseProps,
      title: 'Edit subscription settings',
      key: getKey('editsubscriptionsettings'),
      onClick: () =>
        openModal(modals.EDIT_SUBSCRIPTION_SETTINGS, {
          subscription: cluster.subscription,
          shouldDisplayClusterName: inClusterList,
        }),
    };
    return editSubscriptionSettingsProps;
  };

  const getTransferClusterOwnershipProps = () => {
    const isReleased = get(cluster, 'subscription.released', false);
    const title = isReleased ? 'Cancel ownership transfer' : 'Transfer cluster ownership';
    const transferClusterOwnershipProps = {
      ...baseProps,
      title,
      key: getKey('transferclusterownership'),
      onClick: () => {
        if (isReleased) {
          toggleSubscriptionReleased(
            {
              subscriptionID: cluster.subscription.id,
              released: false,
            },
            {
              onSuccess: () => {
                addNotification({
                  variant: 'success',
                  title: 'Cluster ownership transfer canceled',
                  dismissable: false,
                });
                refreshFunc();
              },
            },
          );
        } else if (allowAutoTransferClusterOwnership) {
          openModal(modals.TRANSFER_CLUSTER_OWNERSHIP_AUTO, {
            subscription: cluster.subscription,
            shouldDisplayClusterName: inClusterList,
            region: cluster.subscription.rh_region_id,
          });
        } else {
          openModal(modals.TRANSFER_CLUSTER_OWNERSHIP, {
            subscription: cluster.subscription,
            shouldDisplayClusterName: inClusterList,
            region: cluster.subscription.rh_region_id,
          });
        }
      },
    };
    return transferClusterOwnershipProps;
  };

  const getUpgradeTrialClusterProps = () => {
    const upgradeTrialClusterData = {
      clusterID: cluster.id,
      cluster,
    };
    const upgradeTrialClusterProps = {
      ...baseProps,
      title: 'Upgrade cluster from Trial',
      key: getKey('upgradetrialcluster'),
    };
    return {
      ...upgradeTrialClusterProps,
      ...disableIfTooltip(readOnlyMessage, {
        onClick: () =>
          openModal(modals.UPGRADE_TRIAL_CLUSTER, {
            ...upgradeTrialClusterData,
            shouldDisplayClusterName: inClusterList,
          }),
      }),
    };
  };

  const showDelete = cluster.canDelete && cluster.managed;
  const showScale = cluster.canEdit && cluster.managed && !cluster.ccs?.enabled;
  const showHibernateCluster =
    cluster.canEdit &&
    cluster.managed &&
    canHibernateCluster &&
    !isProductOSDTrial &&
    !isHypershiftCluster(cluster);
  const showEditMachinePool = cluster.canEdit && cluster.managed;
  const isArchived =
    get(cluster, 'subscription.status', false) === SubscriptionCommonFieldsStatus.Archived;
  const showArchive = cluster.canEdit && !cluster.managed && cluster.subscription && !isArchived;
  const showUnarchive = cluster.canEdit && !cluster.managed && cluster.subscription && isArchived;
  const showEditURL =
    !cluster.managed &&
    cluster.canEdit &&
    (showConsoleButton || consoleURL) &&
    !isAssistedInstallCluster(cluster);
  const product = get(cluster, 'subscription.plan.type', '');
  const showEditSubscriptionSettings =
    product === normalizedProducts.OCP && cluster.canEdit && canSubscribeOCP;
  // const showEditSubscriptionSettings =
  //   product === normalizedProducts.OCP && cluster.canEdit && canSubscribeOCP;
  const isAllowedProducts = [
    normalizedProducts.OCP,
    normalizedProducts.ARO,
    normalizedProducts.RHOIC,
  ].includes(product);
  const showTransferClusterOwnership =
    cluster.canEdit &&
    canTransferClusterOwnership &&
    (isAllowedProducts ||
      (allowAutoTransferClusterOwnership && isClusterOwner && isClusterReady)) &&
    get(cluster, 'subscription.status') !== SubscriptionCommonFieldsStatus.Archived;
  const showUpgradeTrialCluster = isClusterReady && cluster.canEdit && isProductOSDTrial;

  return [
    showConsoleButton && getAdminConsoleProps(),
    cluster.canEdit && getEditDisplayNameProps(),
    showEditURL && getEditConsoleURLProps(),
    showScale && getScaleClusterProps(),
    showHibernateCluster && getHibernateClusterProps(),
    showEditMachinePool && getEditMachinePoolProps(),
    showUpgradeTrialCluster && getUpgradeTrialClusterProps(),
    showDelete && getDeleteItemProps(),
    showArchive && getArchiveClusterProps(),
    showEditSubscriptionSettings && getEditSubscriptionSettingsProps(),
    showTransferClusterOwnership && getTransferClusterOwnershipProps(),
    showUnarchive && getUnarchiveClusterProps(),
  ].filter(Boolean);
}

function dropDownItems({
  cluster,
  showConsoleButton,
  openModal,
  canSubscribeOCP,
  canTransferClusterOwnership,
  isAutoClusterTransferOwnershipEnabled,
  isClusterOwner,
  canHibernateCluster,
  refreshFunc,
  inClusterList,
  toggleSubscriptionReleased,
  addNotification,
}) {
  const actions = actionResolver(
    cluster,
    showConsoleButton,
    openModal,
    canSubscribeOCP,
    canHibernateCluster,
    canTransferClusterOwnership,
    isAutoClusterTransferOwnershipEnabled,
    isClusterOwner,
    toggleSubscriptionReleased,
    refreshFunc,
    inClusterList,
    addNotification,
  );

  const renderMenuItem = ({ title, ...restOfProps }) => (
    <DropdownItem {...restOfProps}>{title}</DropdownItem>
  );

  return <DropdownList>{actions.map(renderMenuItem)}</DropdownList>;
}

export { actionResolver, dropDownItems };
