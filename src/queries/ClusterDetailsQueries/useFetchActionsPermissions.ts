/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { useCallback } from 'react';

import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';

import { authorizationsService } from '~/services';
import {
  SelfAccessReview,
  SelfAccessReviewAction,
  SelfAccessReviewResource_type as SelfAccessReviewResourceType,
  SubscriptionCommonFieldsStatus,
} from '~/types/accounts_mgmt.v1';

import { queryConstants } from '../queriesConstants';
import { SubscriptionResponseType } from '../types';

const actions = [
  SelfAccessReviewAction.create,
  SelfAccessReviewAction.update,
  SelfAccessReviewAction.get,
  SelfAccessReviewAction.list,
  SelfAccessReviewAction.delete,
];
/**
 * Function assembling permissions
 * @param obj action receiver
 * @param action crud action
 * @returns
 */
const buildPermissionsByActionObj = (obj: any, action: SelfAccessReviewAction) => {
  // eslint-disable-next-line no-param-reassign
  obj[action] = false;
  return obj;
};

/**
 * Function fetching permissions
 * @param action action of the resource
 * @param resourceType which resource makes api call
 * @param subscriptionID
 * @returns boolean if action is permitted
 */
export const fetchPermissions = async (params: SelfAccessReview) => {
  const response = await authorizationsService.selfAccessReview(params);
  return response.data.allowed;
};

/**
 * Query responsible for fetching actions and permissions
 * @param subscriptionID subscription ID to pass into api call
 * @param mainQueryKey used for invalidation of the query (refetch)
 * @param subscriptionStatus status of the subscription for query enablement
 * @returns actions and permissions data
 */
export const useFetchActionsPermissions = (
  subscriptionID: string,
  mainQueryKey: string,
  subscriptionStatus?: string,
  clusterID?: string,
) => {
  const { isLoading, data, isError, error, isFetching } = useQueries({
    queries: [
      {
        queryKey: [
          mainQueryKey,
          'authorizationService',
          'selfResourceReview',
          SelfAccessReviewAction.update,
          SelfAccessReviewResourceType.Subscription,
        ],
        queryFn: async () => {
          const canEdit = fetchPermissions({
            action: SelfAccessReviewAction.update,
            resource_type: SelfAccessReviewResourceType.Subscription,
            subscription_id: subscriptionID,
          });
          return canEdit;
        },
        enabled: subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned,
      },
      {
        queryKey: [
          mainQueryKey,
          'authorizationService',
          'selfResourceReview',
          SelfAccessReviewAction.update,
          SelfAccessReviewResourceType.ClusterAutoscaler,
          subscriptionID,
        ],
        queryFn: async () => {
          const canEditClusterAutoscaler = fetchPermissions({
            action: SelfAccessReviewAction.update,
            resource_type: SelfAccessReviewResourceType.ClusterAutoscaler,
            subscription_id: subscriptionID,
          });
          return canEditClusterAutoscaler;
        },
        enabled: subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned,
      },
      {
        queryKey: [
          mainQueryKey,
          'authorizationService',
          'selfResourceReview',
          SelfAccessReviewAction.create,
          SelfAccessReviewResourceType.SubscriptionRoleBinding,
          subscriptionID,
        ],
        queryFn: async () => {
          const canEditOCMRoles = fetchPermissions({
            action: SelfAccessReviewAction.create,
            resource_type: SelfAccessReviewResourceType.SubscriptionRoleBinding,
            subscription_id: subscriptionID,
          });
          return canEditOCMRoles;
        },
        enabled: subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned,
      },
      {
        queryKey: [
          mainQueryKey,
          'authorizationService',
          'selfResourceReview',
          SelfAccessReviewAction.get,
          SelfAccessReviewResourceType.SubscriptionRoleBinding,
          subscriptionID,
        ],
        queryFn: async () => {
          const canViewOCMRoles = fetchPermissions({
            action: SelfAccessReviewAction.get,
            resource_type: SelfAccessReviewResourceType.SubscriptionRoleBinding,
            subscription_id: subscriptionID,
          });
          return canViewOCMRoles;
        },
        enabled: subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned,
      },
      {
        queryKey: [
          mainQueryKey,
          'authorizationService',
          'selfResourceReview',
          SelfAccessReviewAction.update,
          SelfAccessReviewResourceType.Cluster,
          subscriptionID,
        ],
        queryFn: async () => {
          const canUpdateClusterResource = fetchPermissions({
            action: SelfAccessReviewAction.update,
            resource_type: SelfAccessReviewResourceType.Cluster,
            cluster_id: clusterID,
          });
          return canUpdateClusterResource;
        },
        enabled: subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned,
      },
      {
        queryKey: [mainQueryKey, 'kubeletConfigPermissions', actions, subscriptionID],
        queryFn: async () => {
          const kubeletConfigActions: { [action: string]: boolean } = actions.reduce(
            buildPermissionsByActionObj,
            {} as Record<SelfAccessReviewAction, boolean>,
          );
          for (const action of actions) {
            kubeletConfigActions[action] = await fetchPermissions({
              action,
              resource_type: SelfAccessReviewResourceType.ClusterKubeletConfig,
              subscription_id: subscriptionID,
            });
          }
          return kubeletConfigActions;
        },
        enabled:
          !!subscriptionID && subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned,
      },
      {
        queryKey: [mainQueryKey, 'machinePoolPermissions', actions, subscriptionID],
        queryFn: async () => {
          const machinePoolsActions: { [action: string]: boolean } = actions.reduce(
            buildPermissionsByActionObj,
            {} as Record<SelfAccessReviewAction, boolean>,
          );
          for (const action of actions) {
            machinePoolsActions[action] = await fetchPermissions({
              action,
              resource_type: SelfAccessReviewResourceType.MachinePool,
              subscription_id: subscriptionID,
            });
          }
          return machinePoolsActions;
        },
        enabled:
          !!subscriptionID && subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned,
      },
      {
        queryKey: [mainQueryKey, 'idpPermissions', actions, subscriptionID],
        queryFn: async () => {
          const idpActions: { [action: string]: boolean } = actions.reduce(
            buildPermissionsByActionObj,
            {} as Record<SelfAccessReviewAction, boolean>,
          );
          for (const action of actions) {
            idpActions[action] = await fetchPermissions({
              action,
              resource_type: SelfAccessReviewResourceType.Idp,
              subscription_id: subscriptionID,
            });
          }
          return idpActions;
        },
        enabled:
          !!subscriptionID && subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned,
      },
    ],
    combine: useCallback((results: UseQueryResult[]) => {
      const [
        canEdit,
        canEditClusterAutoscaler,
        canEditOCMRoles,
        canViewOCMRoles,
        canUpdateClusterResource,
        kubeletConfigActions,
        machinePoolsActions,
        idpActions,
      ] = results;

      return {
        isLoading: results.some((result: UseQueryResult) => result.isLoading),
        isError: results.some((result: UseQueryResult) => result.isError),
        error: results.map((result: UseQueryResult) => result.error),
        isFetching: results.some((result: UseQueryResult) => result.isFetching),
        data: {
          canEdit,
          canEditClusterAutoscaler,
          canEditOCMRoles,
          canViewOCMRoles,
          canUpdateClusterResource,
          kubeletConfigActions,
          machinePoolsActions,
          idpActions,
        },
      };
    }, []),
  });

  return {
    isActionQueriesLoading: isLoading,
    isError,
    isFetching,
    error,
    canEdit: !!data?.canEdit.data,
    canEditClusterAutoscaler: !!data?.canEditClusterAutoscaler.data,
    canEditOCMRoles: !!data?.canEditOCMRoles.data,
    canViewOCMRoles: !!data?.canViewOCMRoles.data,
    canUpdateClusterResource: !!data?.canUpdateClusterResource.data,
    kubeletConfigActions: data?.kubeletConfigActions.data as { [action: string]: boolean },
    machinePoolsActions: data?.machinePoolsActions.data as { [action: string]: boolean },
    idpActions: data?.idpActions.data as { [action: string]: boolean },
  };
};

export const useCanDeleteAccessReview = (
  clusterID: string,
  subscription: SubscriptionResponseType | undefined,
  mainQueryKey: string,
) => {
  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [mainQueryKey, 'authorizationService', 'canDeleteAccessReview', actions, clusterID],
    queryFn: async () => {
      const response = await authorizationsService.selfAccessReview({
        action: SelfAccessReviewAction.delete,
        resource_type: SelfAccessReviewResourceType.Cluster,
        cluster_id: clusterID,
      });
      return response;
    },
    enabled:
      !!subscription &&
      subscription.subscription.status !== SubscriptionCommonFieldsStatus.Deprovisioned &&
      (subscription.subscription.managed || subscription.isAROCluster),
  });
  return {
    isLoading,
    data,
    isError,
    error,
    isFetching,
  };
};

export const useCanUpdateBreakGlassCredentials = (subscriptionID: string, mainQueryKey: string) => {
  const {
    isLoading,
    data: canUpdateBreakGlassCredentials,
    isError,
    error,
  } = useQuery({
    queryKey: [
      mainQueryKey,
      'authorizationService',
      'selfResourceReview',
      SelfAccessReviewAction.get,
      SelfAccessReviewResourceType.ClusterBreakGlassCredential,
      subscriptionID,
    ],
    queryFn: async () => {
      const response = fetchPermissions({
        action: SelfAccessReviewAction.get,
        resource_type: SelfAccessReviewResourceType.ClusterBreakGlassCredential,
        subscription_id: subscriptionID,
      });

      return response;
    },
    staleTime: queryConstants.STALE_TIME_60_SEC,
  });
  return {
    isLoading,
    canUpdateBreakGlassCredentials,
    isError,
    error,
  };
};

export const useCanCreateManagedCluster = () => {
  const {
    isLoading,
    data: canCreateManagedCluster,
    isError,
    error,
  } = useQuery({
    queryKey: [
      'authorizationService',
      'selfResourceReview',
      SelfAccessReviewAction.create,
      SelfAccessReviewResourceType.Cluster,
    ],
    queryFn: async () => {
      const response = fetchPermissions({
        action: SelfAccessReviewAction.create,
        resource_type: SelfAccessReviewResourceType.Cluster,
      });

      return response;
    },
    staleTime: queryConstants.STALE_TIME_60_SEC,
  });
  return {
    isLoading,
    canCreateManagedCluster,
    isError,
    error,
  };
};
