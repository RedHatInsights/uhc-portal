import dayjs from 'dayjs';

import { normalizedProducts } from '~/common/subscriptionTypes';
import clusterStates from '~/components/clusters/common/clusterStates';
import {
  SubscriptionCommonFieldsStatus,
  SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel,
} from '~/types/accounts_mgmt.v1';

// Mock Feature Gates
export const mockFeatureGates = {
  AUTO_CLUSTER_TRANSFER_OWNERSHIP: true,
  OSD_GCP_WIF: true,
  HIDE_RH_MARKETPLACE: false,
};

// Mock Redux State for Alerts Stories
export const mockReduxState = {
  userProfile: {
    organization: {
      id: 'org-123',
      name: 'Test Organization',
      details: {
        name: 'Test Organization',
        id: 'org-123',
      },
    },
    selfTermsReviewResult: {
      fulfilled: true,
      terms_required: true, // Keep true for stories that should show Terms alert
      redirect_url: 'https://console.redhat.com/terms',
    },
    // Add user details that might be accessed by components
    user: {
      username: 'test-user',
      email: 'test-user@example.com',
      first_name: 'Test',
      last_name: 'User',
    },
    account: {
      account_number: '123456',
      org_id: 'org-123',
    },
    // Add keycloak profile for ClusterActionsDropdown
    keycloakProfile: {
      username: 'test-user',
      email: 'test-user@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
  },
  modal: {
    modalName: null,
  },
  cost: {
    userAccess: {
      data: true,
      pending: false,
      fulfilled: true,
    },
  },
  insightsData: {
    'bae5b227-2472-4e71-be4d-a18fc60bb48a': {
      status: 200,
      data: [
        {
          rule_id: 'ccx_rules_ocp.external.rules.nodes_kubelet_version_check.report',
          description: 'Critical security vulnerability detected',
          details:
            'Your cluster has a critical security vulnerability that needs immediate attention.',
          reason: 'Security Risk',
          resolution: 'Update to the latest OpenShift version',
          created_at: '2024-01-15T08:25:00Z',
          total_risk: 4,
          resolution_risk: 0,
          user_vote: 0,
          extra_data: {
            error_key: 'CRITICAL_SECURITY_VULNERABILITY',
            type: 'rule',
          },
          tags: ['security', 'critical'],
        },
      ],
    },
  },
  clusterSupport: {
    notificationContacts: {
      pending: false,
    },
  },
  clusterRouters: {},
  subscriptionSettings: {
    requestState: {
      pending: false,
    },
  },
  monitoring: {
    issues: {
      totalCount: 5,
    },
    warnings: {
      totalCount: 3,
    },
  },
  // Add additional common Redux state
  featureGates: mockFeatureGates,
  clusters: {
    list: [],
  },
  addOns: {
    addOns: {
      items: [],
      pending: false,
      fulfilled: true,
    },
  },
  logs: {
    lines: '',
    len: 0,
    logType: undefined,
    pending: false,
    fulfilled: false,
    rejected: false,
    error: null,
  },
};

// Mock Redux State without Terms Alert (for Installing and Hibernating stories)
export const mockReduxStateNoTerms = {
  ...mockReduxState,
  userProfile: {
    ...mockReduxState.userProfile,
    selfTermsReviewResult: {
      fulfilled: true,
      terms_required: false, // No terms required for these stories
      redirect_url: 'https://console.redhat.com/terms',
    },
  },
};

// Mock Cloud Providers
export const mockCloudProviders = {
  aws: {
    id: 'aws',
    display_name: 'Amazon Web Services',
    name: 'aws',
  },
  gcp: {
    id: 'gcp',
    display_name: 'Google Cloud Platform',
    name: 'gcp',
  },
  azure: {
    id: 'azure',
    display_name: 'Microsoft Azure',
    name: 'azure',
  },
};

// Base cluster for all alert scenarios
export const baseAlertCluster = {
  id: '1i4counta3holamvo1g5tp6n8p3a03bq',
  external_id: 'bae5b227-2472-4e71-be4d-a18fc60bb48a',
  name: 'alert-overload-cluster',
  display_name: 'alert-overload-cluster',
  infra_id: 'alert-overload-d7vkd',
  state: clusterStates.ready,
  managed: true,
  canEdit: false,
  creation_timestamp: '2021-01-10T15:17:16.278663Z',
  activity_timestamp: '2021-01-11T11:55:29Z',
  cloud_provider: {
    kind: 'CloudProviderLink',
    id: 'aws',
    href: '/api/clusters_mgmt/v1/cloud_providers/aws',
  },
  region: {
    kind: 'CloudRegionLink',
    id: 'us-east-1',
    href: '/api/clusters_mgmt/v1/cloud_providers/aws/regions/us-east-1',
  },
  console: {
    url: 'https://console-openshift-console.apps.alert-overload.example.com',
  },
  api: {
    url: 'https://api.alert-overload.example.com:6443',
    listening: 'external',
  },
  nodes: {
    master: 3,
    infra: 2,
    compute: 4,
    availability_zones: ['us-east-1a', 'us-east-1b', 'us-east-1c'],
  },
  openshift_version: '4.14.8',
  version: {
    id: '4.14.8',
    raw_id: 'openshift-v4.14.8',
  },
  multi_az: true,
  billing_model: 'standard',
  delete_protection: {
    enabled: false,
  },
  dns: {
    base_domain: 'example.com',
  },
  network: {
    machine_cidr: '10.0.0.0/16',
    service_cidr: '172.30.0.0/16',
    pod_cidr: '10.128.0.0/14',
  },
  metrics: {
    cpu: {
      used: { value: 8.5, unit: '' },
      total: { value: 16, unit: '' },
      updated_timestamp: '2024-01-15T14:23:18Z',
    },
    memory: {
      used: { value: 32212254720, unit: 'B' },
      total: { value: 68719476736, unit: 'B' },
      updated_timestamp: '2024-01-15T14:23:19Z',
    },
    storage: {
      used: { value: 0, unit: 'B' },
      total: { value: 0, unit: 'B' },
      updated_timestamp: '0001-01-01T00:00:00Z',
    },
    nodes: {
      total: 9,
      master: 3,
      compute: 4,
    },
    upgrade: {},
  },
  subscription: {
    id: 'subscription-alert-123',
    status: SubscriptionCommonFieldsStatus.Active,
    plan: {
      id: normalizedProducts.OCP,
      type: normalizedProducts.OCP,
    },
    support_level: SubscriptionCommonFieldsSupportLevel.Eval,
    rh_region_id: 'us-east-1',
    cluster_billing_model: 'standard',
    cloud_provider_id: 'aws',
    cloud_account_id: '123456789012',
    creator: {
      username: 'test-user',
      email: 'test-user@example.com',
    },
  },
  status: {
    limited_support_reason_count: 2,
    limited_support_reasons: [
      {
        id: 'unsupported_version',
        summary: 'Unsupported OpenShift version',
        details:
          'This cluster is running an unsupported version of OpenShift that may have security vulnerabilities.',
        override: { enabled: false },
      },
      {
        id: 'custom_networking',
        summary: 'Custom networking configuration',
        details:
          'Custom networking configurations may not be fully supported and could impact cluster stability.',
        override: { enabled: false },
      },
    ],
    description:
      'Network validation failed: Required egress URLs are not accessible from cluster subnets. The following URLs need to be allowlisted in your firewall: https://registry.redhat.io:443, https://quay.io:443',
    provision_error_code: 'NetworkValidationFailed',
    provision_error_message:
      'Network validation failed: Required egress URLs are not accessible from cluster subnets',
  },
};

// Installing Cluster - Shows only installation-specific alerts
export const installingOnlyCluster = {
  ...baseAlertCluster,
  state: clusterStates.installing, // Installing state for ClusterStatusMonitor
  // Add AWS subnet IDs to trigger network validation alerts
  aws: {
    subnet_ids: ['subnet-123', 'subnet-456', 'subnet-789'],
  },
  // Add inflight checks for "User action required" alert
  inflight_checks: [
    {
      id: 'network-validation-check',
      state: 'failed', // This triggers hasInflightEgressErrors
      details: {
        'subnet-123': {
          egress_url_errors: ['https://registry.redhat.io:443', 'https://quay.io:443'],
        },
      },
    },
  ],
  status: {
    ...baseAlertCluster.status,
    provision_error_code: 'NetworkValidationFailed',
    provision_error_message:
      'Network validation failed: Required egress URLs are not accessible from cluster subnets',
  },
  subscription: {
    ...baseAlertCluster.subscription,
    plan: {
      id: normalizedProducts.OCP, // Changed to OCP to avoid Terms alert (not in OSD/RHMI/ROSA list)
      type: normalizedProducts.OCP,
    },
    // Remove any terms review requirements
    support_level: SubscriptionCommonFieldsSupportLevel.Standard, // Standard support, no terms needed
  },
};

// Ready Cluster - Shows ready-specific + general alerts
export const readyAlertsCluster = {
  ...baseAlertCluster,
  state: clusterStates.ready, // Ready state for IDP alert
  managed: true, // Required for IDP alert
  idpActions: { create: true }, // Required for IDP alert
  canEdit: false, // Keep for potential future use
  expiration_timestamp: dayjs().add(12, 'hours').toISOString(), // Danger level expiration
  // Add limited support reasons for LimitedSupportAlert
  limitedSupportReasons: [
    {
      id: 'unsupported_version',
      summary: 'Unsupported OpenShift version',
      details:
        'This cluster is running an unsupported version of OpenShift that may have security vulnerabilities.',
      override: { enabled: false },
    },
    {
      id: 'custom_networking',
      summary: 'Custom networking configuration',
      details:
        'Custom networking configurations may not be fully supported and could impact cluster stability.',
      override: { enabled: false },
    },
  ],
  subscription: {
    ...baseAlertCluster.subscription,
    plan: {
      id: normalizedProducts.OSD, // OSD to trigger TermsAlert
      type: normalizedProducts.OSD,
    },
    support_level: SubscriptionCommonFieldsSupportLevel.None, // Show expired evaluation (danger)
    eval_expiration_date: dayjs().subtract(1, 'day').toISOString(), // Already expired
    status: SubscriptionCommonFieldsStatus.Active,
    released: false, // Don't show transfer ownership for this scenario
  },
};

// ROSA Classic Cluster with installation issues
export const rosaClassicCluster = {
  ...baseAlertCluster,
  state: clusterStates.installing,
  subscription: {
    ...baseAlertCluster.subscription,
    plan: {
      id: normalizedProducts.ROSA,
      type: normalizedProducts.ROSA,
    },
    cloud_provider_id: 'aws',
  },
  aws: {
    subnet_ids: ['subnet-123', 'subnet-456', 'subnet-789'],
    sts: {
      role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
      auto_mode: true,
      oidc_endpoint_url:
        'https://rh-oidc.s3.us-east-1.amazonaws.com/1ricsv5bio0domn5gofgaar07aifjpr0',
      operator_iam_roles: [
        {
          name: 'cloud-credentials',
          namespace: 'openshift-machine-api',
          role_arn:
            'arn:aws:iam::123456789012:role/cluster-rosa-openshift-machine-api-aws-cloud-credentials',
        },
      ],
    },
    private_hosted_zone_id: 'Z123456789',
  },
  status: {
    ...baseAlertCluster.status,
    provision_error_code: 'NetworkValidationFailed',
    provision_error_message:
      'Network validation failed: Required egress URLs are not accessible from cluster subnets',
  },
};

// Installing Cluster with trial expiration
export const installingTrialCluster = {
  ...baseAlertCluster,
  state: clusterStates.installing,
  subscription: {
    ...baseAlertCluster.subscription,
    plan: {
      id: normalizedProducts.OSDTrial,
      type: normalizedProducts.OSDTrial,
    },
  },
  // Remove expiration timestamp to avoid the date formatting issue
  expiration_timestamp: undefined,
};

// Error State Cluster
export const errorStateCluster = {
  ...baseAlertCluster,
  state: clusterStates.error,
  subscription: {
    ...baseAlertCluster.subscription,
    support_level: SubscriptionCommonFieldsSupportLevel.None, // Expired
  },
};

// Expiration Alerts Cluster
export const expirationAlertsCluster = {
  ...baseAlertCluster,
  subscription: {
    ...baseAlertCluster.subscription,
    plan: {
      id: normalizedProducts.OSDTrial,
      type: normalizedProducts.OSDTrial,
    },
    cluster_billing_model: 'marketplace',
  },
  expiration_timestamp: dayjs().add(6, 'hours').toISOString(), // Danger level
};

// Post-Installation Cluster - Shows alerts for ready/operational clusters
export const postInstallationCluster = {
  ...baseAlertCluster,
  state: clusterStates.ready, // Cluster is operational
  managed: true, // Required for IDP alert
  idpActions: { create: true }, // Required for IDP alert
  canEdit: true, // User can edit (no non-editable alert)
  expiration_timestamp: dayjs().add(25, 'hours').toISOString(), // Warning level (1+ days)
  // Add limited support reasons for variety
  limitedSupportReasons: [
    {
      id: 'unsupported_addon',
      summary: 'Unsupported add-on configuration',
      details: 'This cluster has add-ons that may not be fully supported.',
      override: { enabled: false },
    },
  ],
  subscription: {
    ...baseAlertCluster.subscription,
    plan: {
      id: normalizedProducts.OSD, // OSD to trigger TermsAlert
      type: normalizedProducts.OSD,
    },
    support_level: SubscriptionCommonFieldsSupportLevel.Eval, // Show evaluation warning (not expired)
    eval_expiration_date: dayjs().add(10, 'days').toISOString(), // Expiring in 10 days
    status: SubscriptionCommonFieldsStatus.Active,
    released: false,
  },
};

// Hibernating Cluster
export const hibernatingCluster = {
  ...baseAlertCluster,
  state: clusterStates.hibernating,
  subscription: {
    ...baseAlertCluster.subscription,
    plan: {
      id: normalizedProducts.OCP, // Changed to OCP to avoid Terms alert (not in OSD/RHMI/ROSA list)
      type: normalizedProducts.OCP,
    },
    support_level: SubscriptionCommonFieldsSupportLevel.Standard, // Standard support, no terms needed
  },
};

// Mock React Query responses
export const mockQueryResponses = {
  clusterDetails: {
    isLoading: false,
    cluster: baseAlertCluster,
    isError: false,
    error: null,
    isFetching: false,
  },
  clusterIdentityProviders: {
    isLoading: false,
    clusterIdentityProviders: [], // Empty to trigger IDP alert
    isError: false,
  },
  cloudProviders: {
    isLoading: false,
    data: mockCloudProviders,
    isError: false,
  },
  pendingAccessRequests: {
    data: {
      total: 3,
      pending: false,
    },
  },
  accessProtection: {
    data: null,
    isLoading: false,
  },
  wifConfig: {
    data: {
      displayName: 'test-wif-config',
      isLoading: false,
      isSuccess: true,
    },
  },
};

// Mock user access data
export const mockUserAccess = {
  data: true,
  pending: false,
  fulfilled: true,
};

// Mock insights data for side panel
export const mockInsightsData = {
  status: 200,
  data: [
    {
      rule_id: 'ccx_rules_ocp.external.rules.nodes_kubelet_version_check.report',
      description: 'Critical security vulnerability detected',
      details:
        'Your cluster has a critical security vulnerability that needs immediate attention. Update to the latest OpenShift version to resolve this issue.',
      reason: 'Security Risk',
      resolution: 'Update to OpenShift 4.14.10 or later',
      created_at: '2024-01-15T08:25:00Z',
      total_risk: 4,
      resolution_risk: 0,
      user_vote: 0,
      extra_data: {
        error_key: 'CRITICAL_SECURITY_VULNERABILITY',
        type: 'rule',
      },
      tags: ['security', 'critical'],
    },
    {
      rule_id: 'ccx_rules_ocp.external.rules.cluster_wide_proxy_auth_check.report',
      description: 'Cluster-wide proxy authentication issue',
      details: 'The cluster-wide proxy configuration may be preventing proper authentication.',
      reason: 'Authentication Issue',
      resolution: 'Review and update proxy authentication settings',
      created_at: '2024-01-14T10:15:00Z',
      total_risk: 2,
      resolution_risk: 1,
      user_vote: 0,
      extra_data: {
        error_key: 'PROXY_AUTH_ISSUE',
        type: 'rule',
      },
      tags: ['proxy', 'auth'],
    },
  ],
};
