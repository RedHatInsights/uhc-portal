import apiRequest from '~/services/apiRequest';

import type {
  Account,
  AccountList,
  ClusterTransfer,
  ClusterTransferList,
  ClusterTransferPatchRequest,
  Label,
  LabelList,
  Organization,
  QuotaCostList,
  SelfEntitlementStatus,
  Subscription,
  SubscriptionCreateRequest,
  SubscriptionList,
  SubscriptionPatchRequest,
  SubscriptionRoleBindingList,
  SupportCasesCreatedResponse,
} from '../types/accounts_mgmt.v1';
import type {
  AwsstsAccountRole,
  AwsstsPolicy,
  AwsstsRole,
  StsCredentialRequest,
} from '../types/clusters_mgmt.v1';

const getCurrentAccount = () => apiRequest.get<Account>('/api/accounts_mgmt/v1/current_account');

const getOrganization = (organizationID: string) =>
  apiRequest.get<Organization>(`/api/accounts_mgmt/v1/organizations/${organizationID}`, {
    params: {
      fetchCapabilities: true,
    },
  });

export type getSubscriptionQueryType = {
  page: number;
  ['page_size']: number;
  filter?: string;
  fields?: string;
  order?: string;
};

const getSubscriptions = (params: getSubscriptionQueryType) =>
  apiRequest.get<SubscriptionList>('/api/accounts_mgmt/v1/subscriptions', {
    params: {
      page: params.page,
      size: params.page_size,
      orderBy: params.order,
      search: params.filter,
      fields: params.fields,
      fetchAccounts: true,
      fetchCapabilities: true,
    },
  });

const searchSubscriptions = (search: string, size: number = -1) =>
  apiRequest.get<SubscriptionList>('/api/accounts_mgmt/v1/subscriptions', {
    params: {
      size,
      search,
      fetchAccounts: true,
      fetchCapabilities: true,
    },
  });

const getSubscription = (subscriptionID: string) =>
  apiRequest.get<Subscription>(`/api/accounts_mgmt/v1/subscriptions/${subscriptionID}`, {
    params: {
      fetchAccounts: true,
      fetchCpuAndSocket: true,
      fetchCapabilities: true,
    },
  });

const fetchSubscriptionByExternalId = (clusterExternalID: string) =>
  apiRequest.get<SubscriptionList>('/api/accounts_mgmt/v1/subscriptions', {
    params: {
      search: `external_cluster_id='${clusterExternalID}'`,
      fetchAccounts: true,
      fetchCpuAndSocket: true,
      fetchCapabilities: true,
      fetchMetrics: true,
    },
  });

const fetchSubscriptionByClusterId = (clusterID: string) =>
  apiRequest.get<SubscriptionList>('/api/accounts_mgmt/v1/subscriptions', {
    params: {
      search: `cluster_id='${clusterID}'`,
      fetchAccounts: true,
      fetchCpuAndSocket: true,
      fetchCapabilities: true,
      fetchMetrics: true,
    },
  });

const getUnhealthyClusters = (
  organizationID: string,
  params: {
    page: number;
    ['page_size']: number;
    order?: string;
    search?: string;
    filter?: string;
  },
) => {
  let search = `
    organization_id = '${organizationID}'
    and status NOT IN ('Deprovisioned', 'Archived')
    and metrics.health_state = 'unhealthy'
  `;
  if (params.filter && params.filter !== '') {
    search += ` and ${params.filter}`;
  }
  return apiRequest.get<SubscriptionList>('/api/accounts_mgmt/v1/subscriptions', {
    params: {
      page: params.page,
      size: params.page_size,
      // TODO incorrect param order?
      order: params.order,
      search,
    },
  });
};

const editSubscription = (subscriptionID: string, data: SubscriptionPatchRequest) =>
  apiRequest.patch<Subscription>(`/api/accounts_mgmt/v1/subscriptions/${subscriptionID}`, data);

const registerDisconnected = (data: SubscriptionCreateRequest) =>
  apiRequest.post<Subscription>('/api/accounts_mgmt/v1/subscriptions', data);

// TODO add return type
const getOnDemandMetrics = (subscriptionID: string) =>
  apiRequest.get(`/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/ondemand_metrics`);

const getNotificationContacts = (subscriptionID: string) =>
  apiRequest.get<AccountList>(
    `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/notification_contacts`,
  );

const addNotificationContact = (subscriptionID: string, accountIdentifier: string) =>
  apiRequest.post<AccountList>(
    `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/notification_contacts`,
    { account_identifier: accountIdentifier },
  );

const deleteNotificationContact = (subscriptionID: string, accountID: string) =>
  apiRequest.delete<unknown>(
    `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/notification_contacts/${accountID}`,
  );

const getOrganizationQuota = (organizationID: string) =>
  apiRequest.get<QuotaCostList>(
    `/api/accounts_mgmt/v1/organizations/${organizationID}/quota_cost`,
    {
      params: {
        fetchRelatedResources: true,
        fetchCloudAccounts: true,
      },
    },
  );

const getSupportCases = (subscriptionID: string) =>
  apiRequest.get<SupportCasesCreatedResponse>(
    `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/support_cases`,
  );

const createRosaEntitlement = () =>
  apiRequest.post<SelfEntitlementStatus>('/api/accounts_mgmt/v1/self_entitlement/rosa');

const getSubscriptionRoleBindings = (subscriptionID: string) =>
  apiRequest.get<SubscriptionRoleBindingList>(
    `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/role_bindings`,
    {
      params: {
        fetchAccounts: true,
      },
    },
  );

const createSubscriptionRoleBinding = (subscriptionID: string, username: string, roleID: string) =>
  apiRequest({
    method: 'post',
    data: { account_username: username, role_id: roleID },
    url: `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/role_bindings`,
  });

const deleteSubscriptionRoleBinding = (subscriptionID: string, roleBindingID: string) =>
  apiRequest({
    method: 'delete',
    url: `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/role_bindings/${roleBindingID}`,
  });

const getOrganizationLabels = (organizationID: string) =>
  apiRequest.get<LabelList>(`/api/accounts_mgmt/v1/organizations/${organizationID}/labels`);

const getAWSAccountARNs = (awsAccountID: string) =>
  apiRequest.post<AwsstsAccountRole>('/api/clusters_mgmt/v1/aws_inquiries/sts_account_roles', {
    account_id: awsAccountID,
  });

const getOCMRole = (awsAccountID: string) =>
  apiRequest.post<AwsstsRole>('/api/clusters_mgmt/v1/aws_inquiries/sts_ocm_role', {
    account_id: awsAccountID,
  });

const getUserRole = (accountID: string) =>
  apiRequest.get<Label>(`/api/accounts_mgmt/v1/accounts/${accountID}/labels/sts_user_role`);

const getPolicies = () =>
  apiRequest.get<{
    /**
     * Retrieved list of policies.
     */
    items?: Array<AwsstsPolicy>;
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
  }>('/api/clusters_mgmt/v1/aws_inquiries/sts_policies');

const getCredentialRequests = () =>
  apiRequest.get<{
    /**
     * Retrieved list of CredRequest.
     */
    items?: Array<StsCredentialRequest>;
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
  }>('/api/clusters_mgmt/v1/aws_inquiries/sts_credential_requests');

const getRegionalInstances = () => apiRequest.get(`/api/accounts_mgmt/v1/regions`);

const createClusterTransfer = (
  clusterID: string,
  currentOwner: string,
  recipient: string,
  recipientOrgId: string | null,
  recipientAccountId: string | null,
) =>
  apiRequest({
    method: 'post',
    data: {
      cluster_uuid: clusterID,
      owner: currentOwner,
      recipient,
      recipient_external_org_id: recipientOrgId,
      recipient_ebs_account_id: recipientAccountId,
    },
    url: '/api/accounts_mgmt/v1/cluster_transfers',
  });

const getClusterTransfers = () =>
  apiRequest.get<ClusterTransferList>('/api/accounts_mgmt/v1/cluster_transfers');

const getClusterTransferByExternalID = (clusterExternalID: string) =>
  apiRequest.get<ClusterTransferList>('/api/accounts_mgmt/v1/cluster_transfers', {
    params: {
      search: `cluster_uuid='${clusterExternalID}'`,
    },
  });
const searchClusterTransfers = (filter: string) =>
  apiRequest.get<ClusterTransferList>('/api/accounts_mgmt/v1/cluster_transfers', {
    params: {
      search: filter,
      orderBy: 'updated_at desc',
    },
  });
const editClusterTransfer = (transferID: string, data: ClusterTransferPatchRequest) =>
  apiRequest.patch<ClusterTransfer>(`/api/accounts_mgmt/v1/cluster_transfers/${transferID}`, data);

const accountsService = {
  getCurrentAccount,
  getOrganization,
  getSubscription,
  getSubscriptions,
  getUnhealthyClusters,
  getNotificationContacts,
  addNotificationContact,
  deleteNotificationContact,
  getOrganizationQuota,
  editSubscription,
  registerDisconnected,
  getOnDemandMetrics,
  getSupportCases,
  fetchSubscriptionByExternalId,
  createRosaEntitlement,
  getSubscriptionRoleBindings,
  createSubscriptionRoleBinding,
  deleteSubscriptionRoleBinding,
  getOrganizationLabels,
  getAWSAccountARNs,
  getOCMRole,
  getUserRole,
  getPolicies,
  getCredentialRequests,
  searchSubscriptions,
  getRegionalInstances,
  fetchSubscriptionByClusterId,
  createClusterTransfer,
  getClusterTransfers,
  getClusterTransferByExternalID,
  searchClusterTransfers,
  editClusterTransfer,
};

export default accountsService;
