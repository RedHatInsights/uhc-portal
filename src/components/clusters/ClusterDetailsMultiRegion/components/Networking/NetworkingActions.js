import has from 'lodash/has';
import isEqual from 'lodash/isEqual';

import { stringToArrayTrimmed, strToKeyValueObject } from '~/common/helpers';
import { parseFormExcludeNamespaceSelectorsToApi } from '~/components/clusters/wizards/common/excludeNamespaceSelectorsForm';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import {
  LoadBalancerFlavor,
  NamespaceOwnershipPolicy,
  WildcardPolicy,
} from '~/types/clusters_mgmt.v1/enums';

import { clusterService } from '../../../../../services';

import { networkingConstants } from './NetworkingConstants';

const getClusterRouters = (clusterID) => (dispatch) =>
  dispatch({
    type: networkingConstants.GET_CLUSTER_ROUTERS,
    payload: clusterService.getIngresses(clusterID),
  });

const editClusterRouters = (clusterID, data) => (dispatch) =>
  dispatch({
    type: networkingConstants.EDIT_CLUSTER_ROUTERS,
    payload: clusterService.editIngresses(clusterID, data),
  });

const resetEditRoutersResponse = () => (dispatch) =>
  dispatch({
    type: networkingConstants.RESET_EDIT_ROUTERS_RESPONSE,
  });

const resetClusterRouters = () => (dispatch) =>
  dispatch({
    type: networkingConstants.RESET_CLUSTER_ROUTERS,
  });

// Edit default router
const createDefaultRouterRequest = (newData, currentData) => {
  const requestDefaultRouter = {
    id: currentData.default.routerID,
  };

  if (
    newData.private_default_router !== undefined &&
    newData.private_default_router !== currentData.default.isPrivate
  ) {
    requestDefaultRouter.listening = newData.private_default_router ? 'internal' : 'external';
  }

  if (
    newData.defaultRouterSelectors !== undefined &&
    !isEqual(
      strToKeyValueObject(newData.defaultRouterSelectors, ''),
      currentData.default.routeSelectors || {},
    )
  ) {
    requestDefaultRouter.route_selectors = strToKeyValueObject(newData.defaultRouterSelectors, '');
  }

  if (
    newData.defaultRouterExcludedNamespacesFlag !== undefined &&
    !isEqual(
      stringToArrayTrimmed(newData.defaultRouterExcludedNamespacesFlag),
      currentData.default.excludedNamespaces || [],
    )
  ) {
    requestDefaultRouter.excluded_namespaces = stringToArrayTrimmed(
      newData.defaultRouterExcludedNamespacesFlag,
    );
  }

  if (newData.defaultRouterExcludeNamespaceSelectors !== undefined) {
    const parsed = parseFormExcludeNamespaceSelectorsToApi(
      newData.defaultRouterExcludeNamespaceSelectors,
    );
    const currentSelectors = currentData.default.excludeNamespaceSelectors || [];
    const newSelectors = parsed || [];
    if (!isEqual(newSelectors, currentSelectors)) {
      requestDefaultRouter.excluded_namespace_selectors = newSelectors;
    }
  }

  if (
    newData.isDefaultRouterNamespaceOwnershipPolicyStrict !== undefined &&
    newData.isDefaultRouterNamespaceOwnershipPolicyStrict !==
      currentData.default.isNamespaceOwnershipPolicyStrict
  ) {
    requestDefaultRouter.route_namespace_ownership_policy =
      newData.isDefaultRouterNamespaceOwnershipPolicyStrict
        ? NamespaceOwnershipPolicy.Strict
        : NamespaceOwnershipPolicy.InterNamespaceAllowed;
  }

  if (
    newData.isDefaultRouterWildcardPolicyAllowed !== undefined &&
    newData.isDefaultRouterWildcardPolicyAllowed !== currentData.default.isWildcardPolicyAllowed
  ) {
    requestDefaultRouter.route_wildcard_policy = newData.isDefaultRouterWildcardPolicyAllowed
      ? WildcardPolicy.WildcardsAllowed
      : WildcardPolicy.WildcardsDisallowed;
  }

  if (
    newData.is_nlb_load_balancer !== undefined &&
    newData.is_nlb_load_balancer !== (currentData.default.loadBalancer === LoadBalancerFlavor.nlb)
  ) {
    requestDefaultRouter.load_balancer_type = newData.is_nlb_load_balancer
      ? LoadBalancerFlavor.nlb
      : LoadBalancerFlavor.classic;
  }

  if (
    newData.clusterRoutesTlsSecretRef !== undefined &&
    newData.clusterRoutesTlsSecretRef !== (currentData.default.tlsSecretRef || '')
  ) {
    requestDefaultRouter.cluster_routes_tls_secret_ref = newData.clusterRoutesTlsSecretRef;
  }

  if (
    newData.clusterRoutesHostname !== undefined &&
    newData.clusterRoutesHostname !== (currentData.default.hostname || '')
  ) {
    // The API does not allow to PATCH the field without the secret ref
    requestDefaultRouter.cluster_routes_hostname = newData.clusterRoutesHostname;
    requestDefaultRouter.cluster_routes_tls_secret_ref = newData.clusterRoutesTlsSecretRef;
  }

  return requestDefaultRouter;
};

// Edit existing additional router
const createAdditionalRouterRequest = (newData, currentData) => {
  const requestAdditionalRouter = {};

  if (
    newData.private_additional_router !== undefined &&
    newData.private_additional_router !== currentData.additional?.isPrivate
  ) {
    requestAdditionalRouter.listening = newData.private_additional_router ? 'internal' : 'external';
    requestAdditionalRouter.id = currentData.additional?.routerID;
  }

  if (
    newData.labels_additional_router !== undefined &&
    newData.labels_additional_router !== currentData.additional?.routeSelectors
  ) {
    requestAdditionalRouter.route_selectors = strToKeyValueObject(
      newData.labels_additional_router,
      '',
    );
    requestAdditionalRouter.id = currentData.additional?.routerID;
  }

  return requestAdditionalRouter;
};

const sendNetworkConfigRequests = async (newData, currentData, clusterID, clusterService) => {
  let result;

  // API privacy setting changed
  if (currentData.APIPrivate !== newData.private_api) {
    const clusterRequest = {
      api: {
        listening: newData.private_api ? 'internal' : 'external',
      },
    };
    result = await clusterService.editCluster(clusterID, clusterRequest);
    if (result.status === 204) {
      // editing cluster succeeded.
      // modify the details in state now (instead of waiting for a refresh) to avoid flicker
      invalidateClusterDetailsQueries();
    }
  }

  const hadAdditionalRouter = has(currentData, 'additional');
  const additionalRouterDeleted = hadAdditionalRouter && newData.enable_additional_router === false;

  const requestDefaultRouter = createDefaultRouterRequest(newData, currentData);

  let requestAdditionalRouter;
  if (!additionalRouterDeleted && hadAdditionalRouter) {
    requestAdditionalRouter = createAdditionalRouterRequest(newData, currentData);
  }

  if (Object.getOwnPropertyNames(requestDefaultRouter).length > 1 /* more than just the "id" ? */) {
    result = await clusterService.editIngress(
      clusterID,
      requestDefaultRouter.id,
      requestDefaultRouter,
    );
  }
  if (additionalRouterDeleted) {
    result = await clusterService.deleteAdditionalIngress(
      clusterID,
      currentData.additional.routerID,
      requestDefaultRouter,
    );
  }

  // The "additional" routers are depracated.
  // Can not create additional router for any OCP version.
  // For OSD 4.11 and 4.12, we can only edit and delete.
  // For OSD 4.13+, we can only delete.
  // Rosa clusters have additional routers non-editable (search for hideAdvancedOptions in the EditClusterIngressDialog)
  // There should be no STS cluster with an "additional" router (never supported).
  if (requestAdditionalRouter && Object.getOwnPropertyNames(requestAdditionalRouter).length > 0) {
    result = await clusterService.editIngress(
      clusterID,
      requestAdditionalRouter.id,
      requestAdditionalRouter,
    );
  }

  return result;
};

const saveNetworkingConfiguration = (newData, currentData, clusterID) => (dispatch) =>
  dispatch({
    type: networkingConstants.EDIT_CLUSTER_ROUTERS,
    payload: sendNetworkConfigRequests(newData, currentData, clusterID, dispatch),
  });

const networkingActions = {
  getClusterRouters,
  editClusterRouters,
  saveNetworkingConfiguration,
  resetClusterRouters,
  resetEditRoutersResponse,
};

export {
  createDefaultRouterRequest,
  editClusterRouters,
  getClusterRouters,
  networkingActions,
  resetClusterRouters,
  resetEditRoutersResponse,
  saveNetworkingConfiguration,
  sendNetworkConfigRequests,
};
