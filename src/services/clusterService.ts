import { AxiosResponse } from 'axios';

import { WifConfigList } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import defaultApiRequest, { APIRequest, getAPIRequestForRegion } from '~/services/apiRequest';
import type { Subscription } from '~/types/accounts_mgmt.v1';
import { AWSCredentials, ListAPIParams } from '~/types/types';

import type {
  AddOn,
  AddOnInstallation,
  AwsInfrastructureAccessRole,
  AwsInfrastructureAccessRoleGrant,
  BreakGlassCredential,
  CloudProvider,
  CloudRegion,
  CloudVpc,
  Cluster,
  ClusterAutoscaler,
  ClusterStatus,
  DeleteProtection,
  DnsDomain,
  EncryptionKey,
  ExternalAuth,
  Flavour,
  Gcp,
  Group,
  IdentityProvider,
  InflightCheck,
  Ingress,
  KeyRing,
  KubeletConfig,
  LimitedSupportReason,
  Log,
  MachinePool,
  MachineType,
  NodePool,
  NodePoolUpgradePolicy,
  OidcConfig,
  ProductTechnologyPreview,
  UpgradePolicy,
  UpgradePolicyState,
  User,
  Version,
  VersionGate,
  VersionGateAgreement,
  WifConfig,
} from '../types/clusters_mgmt.v1';

const OSDUpgradeType = 'OSD';

type DndDomainsQuery = Partial<{
  userDefined: boolean;
  hasCluster: boolean;
}>;

export type ClusterList = {
  /**
   * Retrieved list of clusters.
   */
  items?: Array<Cluster>;
  /**
   * Index of the requested page, where one corresponds to the first page.
   */
  page: number;
  /**
   * Maximum number of items that will be contained in the returned page.
   */
  size: number;
  /**
   * Total number of items of the collection that match the search criteria,
   * regardless of the size of the page.
   */
  total: number;
};

export function getClusterService(apiRequest: APIRequest = defaultApiRequest) {
  return {
    getClusters: (params: ListAPIParams) =>
      apiRequest.get<ClusterList>('/api/clusters_mgmt/v1/clusters', { params }),

    searchClusters: (search: string, size: number = -1) =>
      apiRequest.post<ClusterList>(
        '/api/clusters_mgmt/v1/clusters?method=get',
        // yes, POST with ?method=get. I know it's weird.
        // the backend does not have a /search endpoint,
        // and we might need to send a query that is longer than the GET length limit
        {
          size,
          search,
        },
      ),

    postNewCluster: (params: Cluster) =>
      apiRequest.post<Cluster>('/api/clusters_mgmt/v1/clusters', params),

    getClusterDetails: (clusterID: string) =>
      apiRequest.get<Cluster>(`/api/clusters_mgmt/v1/clusters/${clusterID}`),

    getClusterStatus: (clusterID: string) =>
      apiRequest.get<ClusterStatus>(`/api/clusters_mgmt/v1/clusters/${clusterID}/status`),

    getInflightChecks: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of clusters.
         */
        items?: Array<InflightCheck>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/inflight_checks`),

    rerunInflightChecks: (clusterID: string) =>
      apiRequest.post<unknown>(`/api/clusters_mgmt/v1/network_verifications`, {
        cluster_id: clusterID,
      }),

    getTriggeredInflightCheckState: (subnetId: string) =>
      apiRequest.get<unknown>(`/api/clusters_mgmt/v1/network_verifications/${subnetId}`),

    editCluster: (clusterID: string, data: Cluster) =>
      apiRequest.patch<Cluster>(`/api/clusters_mgmt/v1/clusters/${clusterID}`, data),

    deleteCluster: (clusterID: string) =>
      apiRequest.delete<unknown>(`/api/clusters_mgmt/v1/clusters/${clusterID}`),

    getCloudProviders: () =>
      apiRequest.get<{
        /**
         * Retrieved list of cloud providers.
         * Includes additional `regions` property since `fetchRegions = true`.
         */
        items?: Array<CloudProvider>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/cloud_providers', {
        params: {
          size: -1,
          fetchRegions: true,
        },
      }),

    getLogs: (clusterID: string, offset: number, logType: 'install' | 'uninstall') =>
      apiRequest.get<Log>(`/api/clusters_mgmt/v1/clusters/${clusterID}/logs/${logType}`, {
        params: {
          offset,
        },
      }),

    getIdentityProviders: (clusterID: string) =>
      apiRequest.get<IdentityProvider>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/identity_providers`,
      ),

    deleteIdentityProvider: (clusterID: string, idpID: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/identity_providers/${idpID}`,
      ),

    createClusterIdentityProvider: (clusterID: string, data: IdentityProvider) =>
      apiRequest.post<IdentityProvider>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/identity_providers`,
        data,
      ),

    editClusterIdentityProvider: (clusterID: string, data: IdentityProvider) =>
      apiRequest.patch<IdentityProvider>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/identity_providers/${data.id}`,
        data,
      ),

    getHtpasswdUsers: (clusterID: string, idpID: string) =>
      apiRequest.get<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/identity_providers/${idpID}/htpasswd_users`,
      ),

    createHtpasswdUser: (clusterID: string, idpID: string, username: string, password: string) =>
      apiRequest.post<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/identity_providers/${idpID}/htpasswd_users`,
        { password, username },
      ),

    editHtpasswdUser: (clusterID: string, idpID: string, userId: string, password: string) =>
      apiRequest.patch<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/identity_providers/${idpID}/htpasswd_users/${userId}`,
        { password },
      ),

    deleteHtpasswdUser: (clusterID: string, idpID: string, htpasswdUserID: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/identity_providers/${idpID}/htpasswd_users/${htpasswdUserID}`,
      ),

    getClusterGroupUsers: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of groups.
         */
        items?: Array<Group>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/groups`, {
        params: {
          size: -1,
        },
      }),

    addClusterGroupUser: (clusterID: string, groupID: string, userID: string) =>
      apiRequest.post<User>(`/api/clusters_mgmt/v1/clusters/${clusterID}/groups/${groupID}/users`, {
        id: userID,
      }),

    deleteClusterGroupUser: (clusterID: string, groupID: string, userID: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/groups/${groupID}/users/${encodeURIComponent(
          userID,
        )}`,
      ),

    getFlavour: (flavourID: string) =>
      apiRequest.get<Flavour>(`/api/clusters_mgmt/v1/flavours/${flavourID}`),

    getMachineTypes: () =>
      apiRequest.get<{
        /**
         * Retrieved list of cloud providers.
         */
        items?: Array<MachineType>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/machine_types', {
        params: {
          size: -1,
        },
      }),

    getMachineTypesByRegion: (
      accessKeyId: string,
      accountId: string,
      secretAccessKey: string,
      region: string,
    ) =>
      apiRequest.post<{
        /**
         * Retrieved list of cloud providers.
         */
        items?: Array<MachineType>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>(
        '/api/clusters_mgmt/v1/aws_inquiries/machine_types',
        {
          aws: {
            access_key_id: accessKeyId,
            account_id: accountId,
            secret_access_key: secretAccessKey,
          },
          region: {
            id: region,
          },
        },
        {
          params: {
            size: -1,
          },
        },
      ),

    getMachineTypesByRegionARN: (roleARN: string, region: string, availabilityZones?: string[]) =>
      apiRequest.post<{
        /**
         * Retrieved list of cloud providers.
         */
        items?: Array<MachineType>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>(
        '/api/clusters_mgmt/v1/aws_inquiries/machine_types',
        {
          aws: {
            sts: {
              role_arn: roleARN,
            },
          },
          region: {
            id: region,
          },
          availability_zones: availabilityZones,
        },
        {
          params: {
            size: -1,
          },
        },
      ),

    getStorageQuotaValues: () =>
      apiRequest.get<{ items: number[] }>('/api/clusters_mgmt/v1/storage_quota_values'),

    getLoadBalancerQuotaValues: () =>
      apiRequest.get<{ items: number[] }>('/api/clusters_mgmt/v1/load_balancer_quota_values'),

    archiveCluster: (subscriptionID: string) =>
      apiRequest.patch<Subscription>(
        `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}`,
        '{"status":"Archived"}',
      ),

    unarchiveCluster: (subscriptionID: string) =>
      apiRequest.patch<Subscription>(
        `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}`,
        '{"status":"Disconnected"}',
      ),

    hibernateCluster: (clusterID: string) =>
      apiRequest.post<unknown>(`/api/clusters_mgmt/v1/clusters/${clusterID}/hibernate`),

    resumeCluster: (clusterID: string) =>
      apiRequest.post<unknown>(`/api/clusters_mgmt/v1/clusters/${clusterID}/resume`),

    getDnsDomains: (query: DndDomainsQuery) => {
      const search = `user_defined='${query.userDefined}' AND cluster.id${
        query.hasCluster ? "!=''" : "=''"
      }`;
      return apiRequest.get<{
        /**
         * Retrieved list of add-ons.
         */
        items?: Array<DnsDomain>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/dns_domains', {
        params: { search },
      });
    },

    createNewDnsDomain: () => apiRequest.post<DnsDomain>('/api/clusters_mgmt/v1/dns_domains', {}),

    deleteDnsDomain: (id: string) =>
      apiRequest.delete<unknown>(`/api/clusters_mgmt/v1/dns_domains/${id}`, {}),

    getEnabledAddOns: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of add-ons.
         */
        items?: Array<AddOn>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/addon_inquiries`, {
        // Request all enabled add-ons
        params: {
          size: -1,
          search: `enabled='t'`,
        },
      }),

    getClusterAddOns: (clusterID: string) =>
      apiRequest.get<AddOn>(`/api/clusters_mgmt/v1/clusters/${clusterID}/addons`),

    addClusterAddOn: (clusterID: string, data: AddOnInstallation) =>
      apiRequest.post<AddOnInstallation>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/addons`,
        data,
      ),

    updateClusterAddOn: (clusterID: string, addOnID: string, data: AddOnInstallation) =>
      apiRequest.patch<AddOnInstallation>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/addons/${addOnID}`,
        data,
      ),

    deleteClusterAddOn: (clusterID: string, addOnID: string) =>
      apiRequest.delete<unknown>(`/api/clusters_mgmt/v1/clusters/${clusterID}/addons/${addOnID}`),

    getInstallableVersions: ({
      isRosa = false,
      isMarketplaceGcp = false,
      isWIF = false,
      isHCP = false,
      includeUnstableVersions = false,
    }) =>
      apiRequest.get<{
        /**
         * Retrieved list of versions.
         */
        items?: Array<Version>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         *
         * Default value is `100`.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/versions/', {
        params: {
          order: 'end_of_life_timestamp desc',
          product: isHCP ? 'hcp' : undefined,
          // Internal users can test other channels via `ocm` CLI, no UI needed.
          // For external users, make sure we only offer stable channel.
          search: `enabled='t' AND (channel_group='stable' OR channel_group='eus'${includeUnstableVersions ? " OR channel_group='candidate' OR channel_group='fast' OR channel_group='nightly'" : ''})${isRosa ? " AND rosa_enabled='t'" : ''}${
            isMarketplaceGcp ? " AND gcp_marketplace_enabled='t'" : ''
          }${isWIF ? " AND wif_enabled='t'" : ''}`,
          size: -1,
        },
      }),

    getRoles: () =>
      apiRequest.get<{
        /**
         * Retrieved list of roles.
         */
        items?: Array<AwsInfrastructureAccessRole>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>("/api/clusters_mgmt/v1/aws_infrastructure_access_roles/?search=state='valid'"),

    getGrants: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of Aws infrastructure access role grants.
         */
        items?: Array<AwsInfrastructureAccessRoleGrant>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/aws_infrastructure_access_role_grants`),

    addGrant: (clusterID: string, roleId: string, arn: string) =>
      apiRequest.post<AwsInfrastructureAccessRoleGrant>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/aws_infrastructure_access_role_grants/`,
        {
          role: {
            id: roleId,
          },
          user_arn: arn,
        },
      ),

    deleteGrant: (clusterID: string, grantId: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/aws_infrastructure_access_role_grants/${grantId}`,
      ),

    getIngresses: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of ingresses.
         */
        items?: Array<Ingress>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/ingresses`),

    editIngresses: (clusterID: string, data: Ingress) =>
      apiRequest.patch<Array<Ingress>>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/ingresses`,
        data,
      ),

    editIngress: (clusterID: string, routerID: string, data: Ingress) =>
      apiRequest.patch<Ingress>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/ingresses/${routerID}`,
        data,
      ),

    addAdditionalIngress: (clusterID: string, data: Ingress) =>
      apiRequest.post<Ingress>(`/api/clusters_mgmt/v1/clusters/${clusterID}/ingresses`, data),

    deleteAdditionalIngress: (clusterID: string, routerID: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/ingresses/${routerID}`,
      ),

    postUpgradeSchedule: (clusterID: string, schedule: UpgradePolicy, dryRun?: boolean) =>
      apiRequest.post<UpgradePolicy>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/upgrade_policies`,
        schedule,
        dryRun ? { params: { dryRun: true } } : undefined,
      ),
    postControlPlaneUpgradeSchedule: (
      clusterID: string,
      schedule: UpgradePolicy,
      dryRun?: boolean,
    ) =>
      apiRequest.post<UpgradePolicy>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/control_plane/upgrade_policies`,
        schedule,
        dryRun ? { params: { dryRun: true } } : undefined,
      ),

    postNodePoolUpgradeSchedule: (
      clusterID: string,
      nodePoolID: string,
      schedule: NodePoolUpgradePolicy,
    ) =>
      apiRequest.post<NodePoolUpgradePolicy>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/node_pools/${nodePoolID}/upgrade_policies`,
        schedule,
      ),

    patchUpgradeSchedule: (clusterID: string, policyID: string, schedule: UpgradePolicy) =>
      apiRequest.patch<UpgradePolicy>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/upgrade_policies/${policyID}`,
        schedule,
      ),

    patchControlPlaneUpgradeSchedule: (
      clusterID: string,
      policyID: string,
      schedule: UpgradePolicy,
    ) =>
      apiRequest.patch<UpgradePolicy>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/control_plane/upgrade_policies/${policyID}`,
        schedule,
      ),

    getUpgradeSchedules: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of upgrade policy.
         */
        items?: Array<UpgradePolicy>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/upgrade_policies`, {
        params: {
          search: `upgrade_type='${OSDUpgradeType}'`,
        },
      }),

    getControlPlaneUpgradeSchedules: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieves the list of upgrade policies for the control plane.
         */
        items?: Array<UpgradePolicy>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/control_plane/upgrade_policies`, {
        params: {},
      }),

    getUpgradeScheduleState: (
      clusterID: string,
      policyID: string,
    ): Promise<AxiosResponse<UpgradePolicyState>> =>
      apiRequest.get<UpgradePolicyState>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/upgrade_policies/${policyID}/state`,
      ),

    deleteUpgradeSchedule: (clusterID: string, policyID: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/upgrade_policies/${policyID}`,
      ),

    deleteControlPlaneUpgradeSchedule: (clusterID: string, policyID: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/control_plane/upgrade_policies/${policyID}`,
      ),

    getMachinePools: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of machine pools.
         */
        items?: Array<MachinePool>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/machine_pools`),

    getNodePoolUpgradePolicies: (clusterId: string, nodePoolID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of node pools upgrade policies.
         */
        items?: Array<NodePoolUpgradePolicy>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterId}/node_pools/${nodePoolID}/upgrade_policies`),

    getNodePools: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of node pools.
         */
        items?: Array<NodePool>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/node_pools`),

    patchNodePool: (clusterID: string, nodePoolID: string, data: NodePool) =>
      apiRequest.patch<NodePool>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/node_pools/${nodePoolID}`,
        data,
      ),

    patchMachinePool: (clusterID: string, machinePoolID: string, data: MachinePool) =>
      apiRequest.patch<MachinePool>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/machine_pools/${machinePoolID}`,
        data,
      ),

    addMachinePool: (clusterID: string, data: MachinePool) =>
      apiRequest.post<MachinePool>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/machine_pools`,
        data,
      ),

    addNodePool: (clusterID: string, data: NodePool) =>
      apiRequest.post<NodePool>(`/api/clusters_mgmt/v1/clusters/${clusterID}/node_pools`, data),

    deleteMachinePool: (clusterID: string, machinePoolID: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/machine_pools/${machinePoolID}`,
      ),

    deleteNodePool: (clusterID: string, nodePoolID: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/node_pools/${nodePoolID}`,
      ),

    getClusterAutoscaler: (clusterID: string) =>
      apiRequest.get<ClusterAutoscaler>(`/api/clusters_mgmt/v1/clusters/${clusterID}/autoscaler`),

    enableClusterAutoscaler: (clusterID: string, autoscaler: ClusterAutoscaler) =>
      apiRequest.post<ClusterAutoscaler>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/autoscaler`,
        autoscaler,
      ),

    updateClusterAutoscaler: (clusterID: string, autoscaler: ClusterAutoscaler) =>
      apiRequest.patch<ClusterAutoscaler>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/autoscaler`,
        autoscaler,
      ),

    disableClusterAutoscaler: (clusterID: string) =>
      apiRequest.delete<ClusterAutoscaler>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/autoscaler`,
      ),

    upgradeTrialCluster: (clusterID: string, data: Cluster) =>
      apiRequest.patch<Cluster>(`/api/clusters_mgmt/v1/clusters/${clusterID}`, data),

    /**
     * Gets the VPC details of a BYO VPC cluster
     *
     * @param clusterId {string} the cluster ID.
     * @param {object} options - Additional parameters to include in the request query.
     */
    getAWSVPCDetails: (clusterId: string, options?: { includeSecurityGroups: boolean }) => {
      const query = options?.includeSecurityGroups ? '?fetchSecurityGroups=true' : '';
      return apiRequest.get<CloudVpc>(`/api/clusters_mgmt/v1/clusters/${clusterId}/vpc${query}`);
    },

    /**
     * List AWS VPCs for given CCS account.
     *
     * @param credentials {json} an object in the form:
     * `{
     *    account_id: string,
     *    access_key_id: string,
     *    secret_access_key: string,
     *  }`
     * or, when using STS, in the form:
     * `{
     *    account_id: string,
     *    sts: {
     *      role_arn: string
     *    }
     *  }`
     * @param region {string} the region ID.
     * @param {string} [subnet] - Optimization: If provided, only VPC attached to that subnet id will be included.
     * @param {object} options - Additional parameters to include in the request query.
     */
    listAWSVPCs: (
      credentials: AWSCredentials,
      region: string,
      subnet?: string,
      options?: { includeSecurityGroups: boolean },
    ) => {
      const query = options?.includeSecurityGroups ? '?fetchSecurityGroups=true' : '';
      return apiRequest.post<{
        /**
         * Retrieved list of cloud VPC.
         */
        items?: Array<CloudVpc>;
        /**
         * Index of the returned page, where one corresponds to the first page. As this
         * collection doesn't support paging the result will always be `1`.
         */
        page?: number;
        /**
         * Number of items that will be contained in the returned page. As this collection
         * doesn't support paging or searching the result will always be the total number of
         * vpcs of the provider.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page. As this collection doesn't support paging or
         * searching the result will always be the total number of available vpcs of the provider.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/aws_inquiries/vpcs${query}`, {
        aws: credentials,
        region: {
          id: region,
        },
        subnets: subnet ? [subnet] : undefined,
      });
    },
    listGCPVPCs: (credentials: Gcp, region: string) =>
      apiRequest.post<{
        /**
         * Retrieved list of cloud VPC.
         */
        items?: Array<CloudVpc>;
        /**
         * Index of the returned page, where one corresponds to the first page. As this
         * collection doesn't support paging the result will always be `1`.
         */
        page?: number;
        /**
         * Number of items that will be contained in the returned page. As this collection
         * doesn't support paging or searching the result will always be the total number of
         * vpcs of the provider.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page. As this collection doesn't support paging or
         * searching the result will always be the total number of available vpcs of the provider.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/gcp_inquiries/vpcs', {
        gcp: credentials,
        region: {
          id: region,
        },
      }),

    /** Possible location values depend on region,
     *  see comma-separated kms_location_id from getCloudProviders().
     */
    listGCPKeyRings: (credentials: Gcp, location: string) =>
      apiRequest.post<{
        /**
         * Retrieved list of key rings.
         */
        items?: Array<KeyRing>;
        /**
         * Index of the returned page, where one corresponds to the first page. As this
         * collection doesn't support paging the result will always be `1`.
         */
        page?: number;
        /**
         * Number of items that will be contained in the returned page. As this collection
         * doesn't support paging or searching the result will always be the total number of
         * key rings of the provider.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page. As this collection doesn't support paging or
         * searching the result will always be the total number of available key rings of the provider.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/gcp_inquiries/key_rings', {
        gcp: credentials,
        key_location: location,
      }),

    listGCPKeys: (credentials: Gcp, location: string, ring: string) =>
      apiRequest.post<{
        /**
         * Retrieved list of encryption keys.
         */
        items?: Array<EncryptionKey>;
        /**
         * Index of the returned page, where one corresponds to the first page. As this
         * collection doesn't support paging the result will always be `1`.
         */
        page?: number;
        /**
         * Number of items that will be contained in the returned page. As this collection
         * doesn't support paging or searching the result will always be the total number of
         * regions of the provider.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page. As this collection doesn't support paging or
         * searching the result will always be the total number of available regions of the provider.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/gcp_inquiries/encryption_keys', {
        gcp: credentials,
        key_location: location,
        key_ring_name: ring,
      }),

    /**
     * List AWS regions for given CCS account.
     * @param {Object} credentials
     * @param {string} [openshiftVersionId] Optional. Exclude regions known to be incompatible
     *   with this version.
     */
    listAWSRegions: (credentials: AWSCredentials, openshiftVersionId?: string) =>
      apiRequest.post<{
        /**
         * Retrieved list of regions.
         */
        items?: Array<CloudRegion>;
        /**
         * Index of the returned page, where one corresponds to the first page. As this
         * collection doesn't support paging the result will always be `1`.
         */
        page?: number;
        /**
         * Number of items that will be contained in the returned page. As this collection
         * doesn't support paging or searching the result will always be the total number of
         * regions of the provider.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page. As this collection doesn't support paging or
         * searching the result will always be the total number of available regions of the provider.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/aws_inquiries/regions', {
        aws: credentials,
        ...(openshiftVersionId && {
          version: {
            id: openshiftVersionId,
          },
        }),
      }),

    getUpgradeGates: () =>
      apiRequest.get<{
        /**
         * Retrieved list of version gates.
         */
        items?: Array<VersionGate>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         *
         * Default value is `100`.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>('/api/clusters_mgmt/v1/version_gates'),

    getClusterGateAgreements: (clusterID: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of version gate agreement.
         */
        items?: Array<VersionGateAgreement>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterID}/gate_agreements`),

    postClusterGateAgreement: (clusterID: string, gateId: string) =>
      apiRequest.post<VersionGateAgreement>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/gate_agreements`,
        { version_gate: { id: gateId } },
      ),

    getOperatorRoleCommands: (awsAccountID: string, clusterID: string, installerRoleARN: string) =>
      // TODO response type?
      apiRequest.post(`/api/clusters_mgmt/v1/clusters/${clusterID}/sts_commands`, {
        account_id: awsAccountID,
        sts: {
          role_arn: installerRoleARN,
        },
      }),

    getOidcConfigurations: (awsAccountID: string) =>
      apiRequest.get<OidcConfig[]>(`/api/clusters_mgmt/v1/oidc_configs`, {
        params: {
          // Managed oidc_configs are reused across the organization. For those, awsAccountID is not set
          // Unmanaged oidc_configs are associated to a particular aws account. For those, awsAccountID must match
          search: `aws.account_id='${awsAccountID}' or aws.account_id=''`,
        },
      }),

    getLimitedSupportReasons: (clusterId: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of template.
         */
        items?: Array<LimitedSupportReason>;
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Number of items contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterId}/limited_support_reasons`),

    getKubeletConfiguration: (clusterId: string) =>
      apiRequest.get<KubeletConfig>(`/api/clusters_mgmt/v1/clusters/${clusterId}/kubelet_config`),

    postKubeletConfiguration: (clusterId: string, config: KubeletConfig) =>
      apiRequest.post<KubeletConfig>(`/api/clusters_mgmt/v1/clusters/${clusterId}/kubelet_config`, {
        ...config,
      }),

    patchKubeletConfiguration: (clusterId: string, config: KubeletConfig) =>
      apiRequest.patch<KubeletConfig>(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/kubelet_config`,
        {
          ...config,
        },
      ),

    deleteKubeletConfiguration: (clusterId: string) =>
      apiRequest.patch<KubeletConfig>(`/api/clusters_mgmt/v1/clusters/${clusterId}/kubelet_config`),

    getTechPreviewStatus: (product: string, id: string) =>
      apiRequest.get<ProductTechnologyPreview>(
        `/api/clusters_mgmt/v1/products/${product}/technology_previews/${id}`,
      ),

    updateDeleteProtection: (clusterID: string, isProtected: boolean) =>
      apiRequest.patch<DeleteProtection>(
        `/api/clusters_mgmt/v1/clusters/${clusterID}/delete_protection`,
        { enabled: isProtected },
      ),

    postExternalAuth: (clusterId: string, data: ExternalAuth) =>
      apiRequest.post<ExternalAuth>(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/external_auth_config/external_auths`,
        data,
      ),

    patchExternalAuth: (clusterId: string, id: string, data: ExternalAuth) =>
      apiRequest.patch<ExternalAuth>(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/external_auth_config/external_auths/${id}`,
        data,
      ),

    getExternalAuths: (clusterId: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of ext auths.
         */
        items?: ExternalAuth[];
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterId}/external_auth_config/external_auths`),

    getExternalAuthDetails: (clusterId: string, id: string) =>
      apiRequest.get<ExternalAuth>(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/external_auth_config/external_auths/${id}`,
      ),

    deleteExternalAuth: (clusterId: string, id: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/external_auth_config/external_auths/${id}`,
      ),

    postBreakGlassCredentials: (clusterId: string, data: BreakGlassCredential) =>
      apiRequest.post<BreakGlassCredential>(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/break_glass_credentials`,
        data,
      ),

    getBreakGlassCredentials: (clusterId: string) =>
      apiRequest.get<{
        /**
         * Retrieved list of break glass credentials.
         */
        items?: BreakGlassCredential[];
        /**
         * Index of the requested page, where one corresponds to the first page.
         */
        page?: number;
        /**
         * Maximum number of items that will be contained in the returned page.
         */
        size?: number;
        /**
         * Total number of items of the collection that match the search criteria,
         * regardless of the size of the page.
         */
        total?: number;
      }>(`/api/clusters_mgmt/v1/clusters/${clusterId}/break_glass_credentials`),

    getBreakGlassCredentialDetails: (clusterId: string, id: string) =>
      apiRequest.get<BreakGlassCredential>(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/break_glass_credentials/${id}`,
      ),

    revokeBreakGlassCredentials: (clusterId: string) =>
      apiRequest.delete<unknown>(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/break_glass_credentials`,
      ),

    getGCPWifConfigs: (query: string) =>
      apiRequest.get<WifConfigList>(`/api/clusters_mgmt/v1/gcp/wif_configs`, {
        params: {
          size: -1,
        },
      }),

    getGCPWifConfig: (id: string): Promise<AxiosResponse<WifConfig>> =>
      apiRequest.get(`/api/clusters_mgmt/v1/gcp/wif_configs/${id}`),
  };
}

export const getClusterServiceForRegion = (region?: string) =>
  getClusterService(getAPIRequestForRegion(region));

const clusterService = getClusterService();

export default clusterService;
