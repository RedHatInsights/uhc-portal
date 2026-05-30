import { invalidateClusterDetailsQueries } from '../../../../../queries/ClusterDetailsQueries/useFetchClusterDetails';
import { clusterService } from '../../../../../services';
import {
  LoadBalancerFlavor,
  NamespaceOwnershipPolicy,
  WildcardPolicy,
} from '../../../../../types/clusters_mgmt.v1/enums';

import { createDefaultRouterRequest, sendNetworkConfigRequests } from './NetworkingActions';

jest.mock('../../../../../services');
jest.mock('../../../../../queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  invalidateClusterDetailsQueries: jest.fn(),
}));

describe('createDefaultRouterRequest', () => {
  test('handles empty data', () => {
    const newData = {}; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('sets visibility', () => {
    const newData = { private_default_router: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.private_default_router = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      listening: 'internal',
    });

    newData.private_default_router = false;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      listening: 'external',
    });

    newData.private_default_router = false;
    currentData.default.isPrivate = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      listening: 'external',
    });
  });

  test('does not send visibility', () => {
    const newData = { private_default_router: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.private_default_router = true;
    currentData.default.isPrivate = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.private_default_router = false;
    currentData.default.isPrivate = false;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('defaultRouterSelectors', () => {
    const newData = { defaultRouterSelectors: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.defaultRouterSelectors = 'foo=bar';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_selectors: {
        foo: 'bar',
      },
    });

    newData.defaultRouterSelectors = 'foo=bar,aa=bb';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_selectors: {
        foo: 'bar',
        aa: 'bb',
      },
    });

    newData.defaultRouterSelectors = 'foo=bar';
    currentData.default.routeSelectors = {};
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_selectors: {
        foo: 'bar',
      },
    });

    newData.defaultRouterSelectors = '';
    currentData.default.routeSelectors = {
      foo: 'bar',
    };
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_selectors: {},
    });

    newData.defaultRouterSelectors = 'aa=bb';
    currentData.default.routeSelectors = {
      foo: 'bar',
    };
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_selectors: { aa: 'bb' },
    });
  });

  test('does not set route_selectors in request', () => {
    const newData = { defaultRouterSelectors: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.defaultRouterSelectors = '';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.defaultRouterSelectors = '';
    currentData.default.routeSelectors = {};
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('sets route_namespace_ownership_policy', () => {
    const newData = { isDefaultRouterNamespaceOwnershipPolicyStrict: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.isDefaultRouterNamespaceOwnershipPolicyStrict = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_namespace_ownership_policy: NamespaceOwnershipPolicy.Strict,
    });

    newData.isDefaultRouterNamespaceOwnershipPolicyStrict = false;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_namespace_ownership_policy: NamespaceOwnershipPolicy.InterNamespaceAllowed,
    });

    newData.isDefaultRouterNamespaceOwnershipPolicyStrict = false;
    currentData.default.isNamespaceOwnershipPolicyStrict = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_namespace_ownership_policy: NamespaceOwnershipPolicy.InterNamespaceAllowed,
    });
  });

  test('does not send route_namespace_ownership_policy', () => {
    const newData = { isDefaultRouterNamespaceOwnershipPolicyStrict: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.isDefaultRouterNamespaceOwnershipPolicyStrict = true;
    currentData.default.isNamespaceOwnershipPolicyStrict = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.isDefaultRouterNamespaceOwnershipPolicyStrict = false;
    currentData.default.isNamespaceOwnershipPolicyStrict = false;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('sets route_wildcard_policy', () => {
    const newData = { isDefaultRouterWildcardPolicyAllowed: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.isDefaultRouterWildcardPolicyAllowed = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_wildcard_policy: WildcardPolicy.WildcardsAllowed,
    });

    newData.isDefaultRouterWildcardPolicyAllowed = false;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_wildcard_policy: WildcardPolicy.WildcardsDisallowed,
    });

    newData.isDefaultRouterWildcardPolicyAllowed = false;
    currentData.default.isWildcardPolicyAllowed = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_wildcard_policy: WildcardPolicy.WildcardsDisallowed,
    });
  });

  test('does not send route_wildcard_policy', () => {
    const newData = { isDefaultRouterWildcardPolicyAllowed: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.isDefaultRouterWildcardPolicyAllowed = true;
    currentData.default.isWildcardPolicyAllowed = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.isDefaultRouterWildcardPolicyAllowed = false;
    currentData.default.isWildcardPolicyAllowed = false;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('sets load_balancer_type', () => {
    const newData = { is_nlb_load_balancer: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.is_nlb_load_balancer = true;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      load_balancer_type: LoadBalancerFlavor.nlb,
    });

    newData.is_nlb_load_balancer = false;
    currentData.default.loadBalancer = LoadBalancerFlavor.nlb;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      load_balancer_type: LoadBalancerFlavor.classic,
    });

    newData.is_nlb_load_balancer = true;
    currentData.default.loadBalancer = LoadBalancerFlavor.classic;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      load_balancer_type: LoadBalancerFlavor.nlb,
    });
  });

  test('does not send load_balancer_type', () => {
    const newData = { is_nlb_load_balancer: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.is_nlb_load_balancer = false;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.is_nlb_load_balancer = true;
    currentData.default.loadBalancer = LoadBalancerFlavor.nlb;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.is_nlb_load_balancer = false;
    currentData.default.loadBalancer = LoadBalancerFlavor.classic;
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('sets cluster_routes_tls_secret_ref', () => {
    const newData = { clusterRoutesTlsSecretRef: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.clusterRoutesTlsSecretRef = 'tls-ref';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      cluster_routes_tls_secret_ref: 'tls-ref',
    });

    newData.clusterRoutesTlsSecretRef = '';
    currentData.default.tlsSecretRef = 'foo';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      cluster_routes_tls_secret_ref: '',
    });

    newData.clusterRoutesTlsSecretRef = 'bar';
    currentData.default.tlsSecretRef = 'foo';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      cluster_routes_tls_secret_ref: 'bar',
    });
  });

  test('does not send cluster_routes_tls_secret_ref', () => {
    const newData = { clusterRoutesTlsSecretRef: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.clusterRoutesTlsSecretRef = '';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.clusterRoutesTlsSecretRef = '';
    currentData.default.tlsSecretRef = '';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.clusterRoutesTlsSecretRef = 'foo';
    currentData.default.tlsSecretRef = 'foo';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('sets cluster_routes_hostname', () => {
    const newData = { clusterRoutesHostname: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.clusterRoutesHostname = 'hostname';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      cluster_routes_hostname: 'hostname',
    });

    newData.clusterRoutesHostname = '';
    currentData.default.hostname = 'foo';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      cluster_routes_hostname: '',
    });

    newData.clusterRoutesHostname = 'bar';
    currentData.default.hostname = 'foo';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      cluster_routes_hostname: 'bar',
    });

    newData.clusterRoutesHostname = 'bar';
    newData.clusterRoutesTlsSecretRef = 'zzz';
    currentData.default.hostname = 'foo';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      cluster_routes_hostname: 'bar',
      cluster_routes_tls_secret_ref: 'zzz',
    });
  });

  test('does not send cluster_routes_hostname', () => {
    const newData = { clusterRoutesHostname: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.clusterRoutesHostname = '';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.clusterRoutesHostname = '';
    currentData.default.hostname = '';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.clusterRoutesHostname = 'foo';
    currentData.default.hostname = 'foo';
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('sets excluded_namespace_selectors', () => {
    const newData = { defaultRouterExcludeNamespaceSelectors: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.defaultRouterExcludeNamespaceSelectors = [{ key: 'department', value: 'finance,HR' }];
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      excluded_namespace_selectors: [{ key: 'department', values: ['finance', 'HR'] }],
    });

    newData.defaultRouterExcludeNamespaceSelectors = [
      { key: 'department', value: 'finance,HR' },
      { key: 'type', value: 'customer' },
    ];
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      excluded_namespace_selectors: [
        { key: 'department', values: ['finance', 'HR'] },
        { key: 'type', values: ['customer'] },
      ],
    });

    newData.defaultRouterExcludeNamespaceSelectors = [{ key: 'env', value: 'prod' }];
    currentData.default.excludeNamespaceSelectors = [{ key: 'department', values: ['finance'] }];
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      excluded_namespace_selectors: [{ key: 'env', values: ['prod'] }],
    });
  });

  test('does not set excluded_namespace_selectors', () => {
    const newData = { defaultRouterExcludeNamespaceSelectors: undefined }; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.defaultRouterExcludeNamespaceSelectors = [{ key: '', value: '' }];
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });

    newData.defaultRouterExcludeNamespaceSelectors = [{ key: 'department', value: 'finance' }];
    currentData.default.excludeNamespaceSelectors = [{ key: 'department', values: ['finance'] }];
    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
    });
  });

  test('can combine multiple fields', () => {
    const newData = {}; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.isDefaultRouterWildcardPolicyAllowed = true;
    newData.clusterRoutesHostname = 'bar';
    newData.clusterRoutesTlsSecretRef = 'zzz';
    newData.is_nlb_load_balancer = false;
    newData.defaultRouterSelectors = 'foo=bar';
    newData.defaultRouterExcludeNamespaceSelectors = [{ key: 'env', value: 'staging' }];

    expect(createDefaultRouterRequest(newData, currentData)).toEqual({
      id: 'router-id',
      route_wildcard_policy: WildcardPolicy.WildcardsAllowed,
      cluster_routes_hostname: 'bar',
      cluster_routes_tls_secret_ref: 'zzz',
      route_selectors: {
        foo: 'bar',
      },
      excluded_namespace_selectors: [{ key: 'env', values: ['staging'] }],
    });
  });
});

const success = {
  status: 200,
  // So far we do not need more data in the response
};

describe('sendNetworkConfigRequests', () => {
  beforeEach(() => {
    clusterService.editIngress.mockResolvedValue(success);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('calls clusterService.editIngress', async () => {
    const newData = {}; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.isDefaultRouterWildcardPolicyAllowed = true;
    await sendNetworkConfigRequests(newData, currentData, 'cluster-id', clusterService);

    expect(clusterService.editIngress).toHaveBeenCalled();
  });

  test('should not call clusterService.editIngress', async () => {
    const newData = {}; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    await sendNetworkConfigRequests(newData, currentData, 'cluster-id', clusterService);

    expect(clusterService.editIngress).not.toHaveBeenCalled();
  });

  test('changes Cluster API', async () => {
    clusterService.editCluster.mockResolvedValue({ status: 204 });

    const newData = {}; // by the user
    const currentData = { default: { routerID: 'router-id' } }; // by the API

    newData.private_api = true;
    currentData.APIPrivate = false;

    newData.isDefaultRouterWildcardPolicyAllowed = true;

    await sendNetworkConfigRequests(newData, currentData, 'cluster-id', clusterService);

    expect(clusterService.editCluster).toHaveBeenCalledTimes(1);
    expect(invalidateClusterDetailsQueries).toHaveBeenCalledTimes(1);
    expect(clusterService.editIngress).toHaveBeenCalledTimes(1);
  });
});
