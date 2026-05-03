import { arrayToString } from '~/common/helpers';
import { Ingress, NamespaceSelector } from '~/types/clusters_mgmt.v1';
import {
  LoadBalancerFlavor,
  NamespaceOwnershipPolicy,
  WildcardPolicy,
} from '~/types/clusters_mgmt.v1/enums';

export const routeSelectorPairsAsStrings = (routeSelectors = {}) =>
  Object.entries(routeSelectors).map((entry) => entry.join('=')) || [];

export const routeSelectorsAsString = (routeSelectors: RouteSelectors = {}) =>
  routeSelectorPairsAsStrings(routeSelectors).join(',') || '';

export const excludedNamespacesAsString = (namespaces?: string[]) =>
  arrayToString(namespaces) || '';

export const excludeNamespaceSelectorsAsString = (selectors?: NamespaceSelector[]): string => {
  if (!selectors?.length) {
    return '';
  }
  return selectors
    .filter((s) => s.key)
    .map((s) => {
      const values = s.values ?? [];
      if (values.length <= 1) {
        return `${s.key}=${values[0] ?? ''}`;
      }
      return `${s.key}=[${values.join(', ')}]`;
    })
    .join(', ');
};

export const apiSelectorsToFormRows = (
  selectors?: NamespaceSelector[],
): { key: string; value: string }[] => {
  if (!selectors?.length) {
    return [];
  }
  return selectors
    .filter((s) => s.key)
    .map((s) => ({
      key: s.key!,
      value: (s.values ?? []).join(','),
    }));
};

export type RouteSelectors = Ingress['route_selectors'];

export type ClusterRouter = {
  routerID?: string;
  isDefault: boolean;
  isPrivate: boolean;
  address?: string;
  loadBalancer?: LoadBalancerFlavor;
  routeSelectors?: RouteSelectors;
  excludedNamespaces?: string[];
  excludeNamespaceSelectors?: NamespaceSelector[];
  isNamespaceOwnershipPolicyStrict: boolean;
  isWildcardPolicyAllowed: boolean;
  tlsSecretRef?: string;
  hostname?: string;
};

export type ClusterRouters = {
  default?: ClusterRouter;
  additional?: ClusterRouter;
};

const NetworkingSelector = (clusterRouters: Ingress[]): ClusterRouters => {
  const routers: ClusterRouters = {};
  clusterRouters?.forEach((r: Ingress) => {
    const router: ClusterRouter = {
      routerID: r.id,
      isDefault: !!r.default,
      isPrivate: r.listening === 'internal',
      address: r.dns_name,
      loadBalancer: r.load_balancer_type as LoadBalancerFlavor,
      routeSelectors: r.route_selectors,
      excludedNamespaces: r.excluded_namespaces,
      excludeNamespaceSelectors: r.excluded_namespace_selectors,
      // Default is NamespaceOwnershipPolicy.Strict if route_namespace_ownership_policy not set
      isNamespaceOwnershipPolicyStrict:
        r.route_namespace_ownership_policy !== NamespaceOwnershipPolicy.InterNamespaceAllowed,
      isWildcardPolicyAllowed: r.route_wildcard_policy === WildcardPolicy.WildcardsAllowed,
      tlsSecretRef: r.cluster_routes_tls_secret_ref,
      hostname: r.cluster_routes_hostname,
    };

    if (router.isDefault) {
      routers.default = router;
    } else {
      routers.additional = router;
    }
  });
  return routers;
};

export default NetworkingSelector;
