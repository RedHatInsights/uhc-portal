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
import axios, { AxiosResponse } from 'axios';
import { action, ActionType } from 'typesafe-actions';

import * as Sentry from '@sentry/browser';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { getClusterServiceForRegion } from '~/services/clusterService';
import {
  ClusterAuthorizationRequestProduct_id as ClusterAuthorizationRequestProductId,
  SelfAccessReviewAction,
  SelfAccessReviewResource_type as SelfAccessReviewResourceType,
  SubscriptionCommonFieldsStatus,
  SubscriptionCreateRequest,
  SubscriptionPatchRequest,
} from '~/types/accounts_mgmt.v1';
import type { Cluster, UpgradePolicy } from '~/types/clusters_mgmt.v1';
import type { AugmentedCluster, AugmentedClusterResponse } from '~/types/types';

import isAssistedInstallSubscription from '../../common/isAssistedInstallerCluster';
import {
  fakeClusterFromAISubscription,
  fakeClusterFromSubscription,
  normalizeCluster,
  normalizeMetrics,
  normalizeSubscription,
} from '../../common/normalize';
import { knownProducts } from '../../common/subscriptionTypes';
import { postSchedule } from '../../components/clusters/common/Upgrades/clusterUpgradeActions';
import {
  accountsService,
  assistedService,
  authorizationsService,
  clusterService,
} from '../../services';
import { clustersConstants } from '../constants';
import { INVALIDATE_ACTION } from '../reduxHelpers';
import type { AppThunk, AppThunkDispatch } from '../types';

import { editSubscriptionSettings } from './subscriptionSettingsActions';

const ROSA_PRODUCTS = [knownProducts.ROSA, knownProducts.ROSA_HyperShift];
const OSD_PRODUCTS = [knownProducts.OSD, knownProducts.OSDTrial];

const invalidateClusters = () => action(INVALIDATE_ACTION(clustersConstants.GET_CLUSTERS));

const createClusterAndUpgradeSchedule = async (
  cluster: Cluster,
  upgradeSchedule: UpgradePolicy,
  dispatch: AppThunkDispatch,
  regionalId?: string,
) => {
  const regionalClusterService = regionalId ? getClusterServiceForRegion(regionalId) : undefined;

  const clusterResponse = regionalClusterService
    ? await regionalClusterService.postNewCluster(cluster)
    : await clusterService.postNewCluster(cluster);

  if (upgradeSchedule) {
    const clusterID = clusterResponse.data.id;
    if (clusterID) {
      dispatch(postSchedule(clusterID, upgradeSchedule, isHypershiftCluster(cluster), regionalId));
    }
  }

  dispatch(invalidateClusters());
  return clusterResponse;
};

const createClusterAction = (clusterResponse: Promise<AxiosResponse<Cluster, any>>) =>
  action(clustersConstants.CREATE_CLUSTER, clusterResponse);

const createCluster =
  (params: Cluster, upgradeSchedule: UpgradePolicy, regionalId?: string): AppThunk =>
  (dispatch) =>
    dispatch(
      createClusterAction(
        createClusterAndUpgradeSchedule(params, upgradeSchedule, dispatch, regionalId),
      ),
    );

const registerClusterAndUpdateSubscription = async (
  registrationRequest: SubscriptionCreateRequest,
  subscriptionRequest: SubscriptionPatchRequest | null,
  dispatch: AppThunkDispatch,
) => {
  const registerClusterResponse = await accountsService.registerDisconnected(registrationRequest);

  if (
    subscriptionRequest &&
    registerClusterResponse.status === 201 &&
    registerClusterResponse.data.id
  ) {
    dispatch(editSubscriptionSettings(registerClusterResponse.data.id, subscriptionRequest));
  }
  dispatch(invalidateClusters());
  return registerClusterResponse;
};

const registerDisconnectedCluster =
  (
    registrationRequest: SubscriptionCreateRequest,
    subscriptionRequest: SubscriptionPatchRequest | null,
  ): AppThunk =>
  (dispatch) =>
    dispatch(
      // FIXME how can the payload be a subscription when creating a cluster?
      action(
        clustersConstants.CREATE_CLUSTER,
        registerClusterAndUpdateSubscription(registrationRequest, subscriptionRequest, dispatch),
      ),
    );

/**
 * Collect a list of object IDs and build a SQL-like query searching for these IDs.
 * For example, to collect subscription IDs from clusters, so we can query
 * for the subscription info.
 * @param {*} items A collection of items
 * @param {string} field The field containing the ID to collect for the search
 */

const fetchSingleClusterAndPermissions = async (
  subscriptionID: string,
): Promise<AugmentedClusterResponse> => {
  const actions = [
    SelfAccessReviewAction.create,
    SelfAccessReviewAction.update,
    SelfAccessReviewAction.get,
    SelfAccessReviewAction.list,
    SelfAccessReviewAction.delete,
  ];
  let canEdit = false;
  let canEditOCMRoles = false;
  let canEditClusterAutoscaler = false;
  let canViewOCMRoles = false;
  let canUpdateClusterResource = false;

  const buildPermissionsByActionObj = (obj: any, action: SelfAccessReviewAction) => {
    // eslint-disable-next-line no-param-reassign
    obj[action] = false;
    return obj;
  };

  const idpActions = actions.reduce(
    buildPermissionsByActionObj,
    {} as Record<SelfAccessReviewAction, boolean>,
  );
  const machinePoolsActions = actions.reduce(
    buildPermissionsByActionObj,
    {} as Record<SelfAccessReviewAction, boolean>,
  );
  const kubeletConfigActions = actions.reduce(
    buildPermissionsByActionObj,
    {} as Record<SelfAccessReviewAction, boolean>,
  );

  const subscription = await accountsService.getSubscription(subscriptionID);
  subscription.data = normalizeSubscription(subscription.data);
  const isAROCluster = subscription?.data?.plan?.type === knownProducts.ARO;
  const isROSACluster = ROSA_PRODUCTS.includes(subscription?.data?.plan?.type || '');
  const isOSDCluster = OSD_PRODUCTS.includes(
    (subscription?.data?.plan?.type || '') as ClusterAuthorizationRequestProductId,
  );

  if (subscription.data.status !== SubscriptionCommonFieldsStatus.Deprovisioned) {
    await authorizationsService
      .selfAccessReview({
        action: SelfAccessReviewAction.update,
        resource_type: SelfAccessReviewResourceType.Subscription,
        subscription_id: subscriptionID,
      })
      .then((response) => {
        canEdit = response.data.allowed;
      });
    actions.forEach(async (action) => {
      await authorizationsService
        .selfAccessReview({
          action,
          resource_type: SelfAccessReviewResourceType.Idp,
          subscription_id: subscriptionID,
        })
        .then((response) => {
          idpActions[action] = response.data.allowed;
        });
    });
    await authorizationsService
      .selfAccessReview({
        action: SelfAccessReviewAction.update,
        resource_type: SelfAccessReviewResourceType.ClusterAutoscaler,
        subscription_id: subscriptionID,
      })
      .then((response) => {
        canEditClusterAutoscaler = response.data.allowed;
      });
    await authorizationsService
      .selfAccessReview({
        action: SelfAccessReviewAction.create,
        resource_type: SelfAccessReviewResourceType.SubscriptionRoleBinding,
        subscription_id: subscriptionID,
      })
      .then((response) => {
        canEditOCMRoles = response.data.allowed;
      });
    await authorizationsService
      .selfAccessReview({
        action: SelfAccessReviewAction.get,
        resource_type: SelfAccessReviewResourceType.SubscriptionRoleBinding,
        subscription_id: subscriptionID,
      })
      .then((response) => {
        canViewOCMRoles = response.data.allowed;
      });
    await authorizationsService
      .selfAccessReview({
        action: SelfAccessReviewAction.update,
        resource_type: SelfAccessReviewResourceType.Cluster,
        subscription_id: subscriptionID,
      })
      .then((response) => {
        canUpdateClusterResource = response.data.allowed;
      });

    actions.forEach(async (action) => {
      await authorizationsService
        .selfAccessReview({
          action,
          resource_type: SelfAccessReviewResourceType.MachinePool,
          subscription_id: subscriptionID,
        })
        .then((response) => {
          machinePoolsActions[action] = response.data.allowed;
        });
    });

    actions.map(async (action) => {
      await authorizationsService
        .selfAccessReview({
          action,
          resource_type: SelfAccessReviewResourceType.ClusterKubeletConfig,
          subscription_id: subscriptionID,
        })
        .then((response) => {
          kubeletConfigActions[action] = response.data.allowed;
        });
    });
  }

  if (
    (subscription.data.managed || isAROCluster) &&
    subscription.data.status !== SubscriptionCommonFieldsStatus.Deprovisioned
  ) {
    // TODO cluster_id is optional in the schema, remove cast
    const clusterResponse = await clusterService.getClusterDetails(
      subscription.data.cluster_id as string,
    );

    const cluster: AugmentedClusterResponse = {
      data: {
        ...normalizeCluster(clusterResponse.data),
        subscription: subscription.data,
        // take metrics from AMS (even for OSD)
        metrics: normalizeMetrics(subscription.data.metrics?.[0]),
      },
    };

    const upgradeGates = await clusterService.getClusterGateAgreements(
      subscription.data.cluster_id as string,
    );

    cluster.data.upgradeGates = upgradeGates.data?.items || [];

    const canDeleteAccessReviewResponse = await authorizationsService.selfAccessReview({
      action: SelfAccessReviewAction.delete,
      resource_type: SelfAccessReviewResourceType.Cluster,
      cluster_id: subscription.data.cluster_id,
    });

    const limitedSupportReasons = await clusterService.getLimitedSupportReasons(
      // TODO cluster_id is optional in the schema, remove cast
      subscription.data.cluster_id as string,
    );
    cluster.data.limitedSupportReasons = limitedSupportReasons.data?.items || [];

    if (isROSACluster || isOSDCluster) {
      const inflightChecks = await clusterService.getInflightChecks(
        subscription.data.cluster_id as string,
      );
      cluster.data.inflight_checks = inflightChecks.data?.items || [];
    }

    cluster.data.canEdit = canEdit;
    cluster.data.idpActions = idpActions;
    cluster.data.canEditOCMRoles = canEditOCMRoles;
    cluster.data.canViewOCMRoles = canViewOCMRoles;
    cluster.data.canEditClusterAutoscaler = canEditClusterAutoscaler;
    cluster.data.machinePoolsActions = machinePoolsActions;
    cluster.data.kubeletConfigActions = kubeletConfigActions;
    cluster.data.canDelete = !!canDeleteAccessReviewResponse?.data?.allowed;
    cluster.data.canUpdateClusterResource = canUpdateClusterResource;

    return cluster;
  }

  let cluster: AugmentedCluster;
  if (isAssistedInstallSubscription(subscription.data) && subscription.data.cluster_id) {
    try {
      const aiCluster = await assistedService.getAICluster(subscription.data.cluster_id);
      cluster = fakeClusterFromAISubscription(subscription.data, aiCluster?.data || null);
      cluster.aiCluster = aiCluster.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        // The cluster is garbage collected or the user does not have privileges
        // eslint-disable-next-line no-console
        console.info(
          'Failed to query assisted-installer cluster id: ',
          subscription.data.cluster_id,
        );
        cluster = fakeClusterFromSubscription(subscription.data);
      } else {
        throw e;
      }
    }
    try {
      const featureSupportLevels = await assistedService.getAIFeatureSupportLevels(
        cluster.openshift_version || '',
        cluster.cpu_architecture,
      );
      cluster.aiSupportLevels = featureSupportLevels;
    } catch (e) {
      Sentry.captureException(
        new Error(
          `Failed to query feature support levels: ${
            axios.isAxiosError(e) ? JSON.stringify(e.response?.data) : ''
          }`,
        ),
      );
    }
  } else {
    cluster = fakeClusterFromSubscription(subscription.data);
  }

  cluster.canEdit = canEdit;
  cluster.canEditOCMRoles = canEditOCMRoles;
  cluster.canViewOCMRoles = canViewOCMRoles;
  cluster.canDelete = false; // OCP clusters can't be deleted
  cluster.subscription = subscription.data;
  return {
    data: cluster,
  };
};

const fetchClusterDetails = (subscriptionID: string) =>
  action(clustersConstants.GET_CLUSTER_DETAILS, fetchSingleClusterAndPermissions(subscriptionID));

const setClusterDetails = (cluster: AugmentedCluster, mergeDetails = false) =>
  action(clustersConstants.SET_CLUSTER_DETAILS, { cluster, mergeDetails });

const clearClusterDetails = () => action(clustersConstants.CLEAR_CLUSTER_DETAILS);

const resetCreatedClusterResponse = () => action(clustersConstants.RESET_CREATED_CLUSTER_RESPONSE);

const getInflightChecks = (clusterID: string) =>
  action(clustersConstants.GET_INFLIGHT_CHECKS, clusterService.getInflightChecks(clusterID));

const clearInstallableVersions = () => action(clustersConstants.CLEAR_CLUSTER_VERSIONS_RESPONSE);

const getInstallableVersions = (params: {
  isRosa?: boolean;
  isMarketplaceGcp?: boolean;
  isWIF?: boolean;
  isHCP?: boolean;
  includeUnstableVersions?: boolean;
}) => {
  const versions = clusterService.getInstallableVersions(params);
  return action(clustersConstants.GET_CLUSTER_VERSIONS, versions, params);
};

type ClusterAction = ActionType<
  | typeof fetchClusterDetails
  | typeof setClusterDetails
  | typeof invalidateClusters
  | typeof createClusterAction
  | typeof fetchClusterDetails
  | typeof clearClusterDetails
  | typeof resetCreatedClusterResponse
  | typeof getInflightChecks
  | typeof clearInstallableVersions
  | typeof getInstallableVersions
>;

const clustersActions = {
  createCluster,
  registerDisconnectedCluster,
  fetchClusterDetails,
  setClusterDetails,
  clearClusterDetails,
  invalidateClusters,
  resetCreatedClusterResponse,
  getInflightChecks,
  clearInstallableVersions,
  getInstallableVersions,
};

export {
  clearInstallableVersions,
  ClusterAction,
  clustersActions,
  createCluster,
  fetchClusterDetails,
  getInflightChecks,
  invalidateClusters,
  registerDisconnectedCluster,
  resetCreatedClusterResponse,
  setClusterDetails,
};
