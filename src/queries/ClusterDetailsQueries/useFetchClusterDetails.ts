import { AugmentedClusterResponse } from '~/types/types';

import { normalizeCluster, normalizeMetrics } from '../../common/normalize';
import { queryClient } from '../../components/App/queryClient';
import { useFetchSubscription } from '../common/useFetchSubscription';
import { formatErrorData } from '../helpers';
import { queryConstants } from '../queriesConstants';

import { useCanDeleteAccessReview, useFetchActionsPermissions } from './useFetchActionsPermissions';
import { useFetchAiCluster } from './useFetchAiCluster';
import { useFetchCluster } from './useFetchCluster';
import { useFetchInflightChecks } from './useFetchInflightChecks';
import { useFetchLimitedSupportReasons } from './useFetchLimitedSupportReasons';
import { useFetchUpgradeGateAgreements } from './useFetchUpgradeGateAgreements';

/**
 * Function responsible for invalidation of cluster details (refetch)
 */
export const invalidateClusterDetailsQueries = () => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey.some((key) => key === queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY),
  });
};

/**
 * Hook responsible for assembling all the required data
 * for display on cluster details page (top and overview)
 * @param subscriptionID subscription ID to pass into api call
 * @returns cluster details / isLoading / error / fake cluster
 */
export const useFetchClusterDetails = (subscriptionID: string) => {
  const {
    isLoading: subscriptionLoading,
    data: subscription,
    isError: isSubscriptionError,
    error: subscriptionError,
    isFetching: isSubscriptionFetching,
  } = useFetchSubscription(subscriptionID, queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY);

  const {
    isActionQueriesLoading,
    isError: isActionsError,
    error: actionsError,
    canEdit,
    canEditClusterAutoscaler,
    canEditOCMRoles,
    canViewOCMRoles,
    canUpdateClusterResource,
    kubeletConfigActions,
    machinePoolsActions,
    idpActions,
    isFetching: isActionsPermissionsFetching,
  } = useFetchActionsPermissions(
    subscriptionID,
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
    subscription?.subscription.status,
    subscription?.subscription.cluster_id as string,
  );

  const {
    isLoading: isClusterDetailsLoading,
    data: clusterDetailsResponse,
    isError: isClusterDetailsError,
    error: clusterDetailsError,
    isFetching: isClusterFetching,
  } = useFetchCluster(
    subscription?.subscription.cluster_id as string,
    subscription?.subscription,
    subscription?.isAROCluster,
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
  );
  const { isLoading: isClusterGateAgreementsLoading, data: clusterUpgradeGatesResponse } =
    useFetchUpgradeGateAgreements(
      subscription?.subscription.cluster_id as string,
      subscription,
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
    );
  const {
    isLoading: isCanDeleteAccessReviewLoading,
    data: canDeleteAccessReviewResponse,
    isError: isCanDeleteAccessReviewError,
    error: canDeleteAccessReviewError,
    isFetching: isCanDeleteAccessReviewFetching,
  } = useCanDeleteAccessReview(
    subscription?.subscription.cluster_id as string,
    subscription,
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
  );
  const {
    isLoading: isLimitedSupportReasonsLoading,
    data: limitedSupportReasonsResponse,
    isFetching: isLimitedSupportReasonsfetching,
  } = useFetchLimitedSupportReasons(
    subscription?.subscription.cluster_id as string,
    subscription,
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
  );

  const {
    isLoading: isInflightChecksLoading,
    data: inflightChecksResponse,
    isFetching: isInflightChecksFetching,
  } = useFetchInflightChecks(
    subscription?.subscription.cluster_id as string,
    subscription,
    subscription?.subscription.rh_region_id,
  );

  const { isLoading: isAIClusterLoading, data: aiClusterResponse } = useFetchAiCluster(
    subscription?.subscription.cluster_id as string,
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
    subscription?.subscription,
  );

  const isFetching =
    isSubscriptionFetching ||
    isActionsPermissionsFetching ||
    isClusterFetching ||
    isInflightChecksFetching ||
    isCanDeleteAccessReviewFetching ||
    isLimitedSupportReasonsfetching;
  if (
    !subscriptionLoading &&
    !isClusterDetailsLoading &&
    !isCanDeleteAccessReviewLoading &&
    !isLimitedSupportReasonsLoading &&
    !isClusterGateAgreementsLoading &&
    !isInflightChecksLoading &&
    !isActionQueriesLoading &&
    !isAIClusterLoading
  ) {
    // Handles any query if it returns Axios Error
    if (
      isSubscriptionError ||
      isClusterDetailsError ||
      isActionsError ||
      isCanDeleteAccessReviewError
    ) {
      const isError =
        isSubscriptionError ||
        isClusterDetailsError ||
        isActionsError ||
        isCanDeleteAccessReviewError;
      const isLoading =
        subscriptionLoading ||
        isClusterDetailsLoading ||
        isActionQueriesLoading ||
        isCanDeleteAccessReviewLoading;
      const error =
        subscriptionError || clusterDetailsError || actionsError || canDeleteAccessReviewError;

      const errorData = formatErrorData(isLoading, isError, error);
      return {
        isLoading: errorData?.isLoading,
        isError: errorData?.isError,
        error: errorData?.error,
        data: subscription || clusterDetailsResponse || canDeleteAccessReviewResponse,
        isFetching,
      };
    }

    if (clusterDetailsResponse) {
      const cluster: AugmentedClusterResponse = {
        data: {
          ...normalizeCluster(clusterDetailsResponse.data),
          subscription: subscription?.subscription,
          metrics: normalizeMetrics(subscription?.subscription.metrics?.[0]),
        },
      };

      cluster.data.upgradeGates = clusterUpgradeGatesResponse?.data.items || [];
      cluster.data.limitedSupportReasons = limitedSupportReasonsResponse?.data.items || [];
      cluster.data.inflight_checks = inflightChecksResponse?.data.items || [];
      cluster.data.canEdit = canEdit;
      cluster.data.canEditOCMRoles = canEditOCMRoles;
      cluster.data.canViewOCMRoles = canViewOCMRoles;
      cluster.data.canUpdateClusterResource = canUpdateClusterResource;
      cluster.data.canEditClusterAutoscaler = canEditClusterAutoscaler;
      cluster.data.idpActions = idpActions;
      cluster.data.machinePoolsActions = machinePoolsActions;
      cluster.data.kubeletConfigActions = kubeletConfigActions;
      cluster.data.canDelete = !!canDeleteAccessReviewResponse?.data?.allowed;

      return {
        isLoading: false,
        cluster: cluster.data,
        isSuccess: true,
        isError: isClusterDetailsError,
        error: clusterDetailsError,
        isFetching,
      };
    }

    if (aiClusterResponse) {
      const aiCluster = { ...aiClusterResponse };
      aiCluster.canEdit = canEdit;
      aiCluster.canEditOCMRoles = canEditOCMRoles;
      aiCluster.canViewOCMRoles = canViewOCMRoles;
      aiCluster.canDelete = false; // OCP clusters can't be deleted
      aiCluster.subscription = subscription?.subscription;
      return {
        isLoading: false,
        cluster: aiCluster,
        isFetching,
      };
    }
  }
  return {
    isLoading: true,
    isFetching,
  };
};
