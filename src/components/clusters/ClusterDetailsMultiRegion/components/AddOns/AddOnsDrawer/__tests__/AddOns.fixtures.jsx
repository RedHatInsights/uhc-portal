export const crcWorkspaces = {
  kind: 'AddOn',
  href: '/api/clusters_mgmt/v1/addons/codeready-workspaces',
  id: 'codeready-workspaces',
  name: 'Red Hat CodeReady Workspaces',
  description:
    'A collaborative Kubernetes-native development solution that delivers OpenShift workspaces and in-browser IDE for rapid cloud application development. This add-on installs PostgreSQL, Red Hat SSO, and the Red Hat CodeReady Workspaces server, as well as configures all three services.',
  docs_link: 'https://access.redhat.com/documentation/en-us/red_hat_codeready_workspaces',
  label: 'api.openshift.com/addon-codeready-workspaces-operator',
  icon: 'SNIPPED',
  enabled: true,
  resource_name: 'addon-crw-operator',
  resource_cost: 0,
  target_namespace: 'codeready-workspaces-operator',
  install_mode: 'single_namespace',
  operator_name: 'crwoperator',
  hidden: false,
  has_external_resources: false,
};
export const managedIntegration = {
  kind: 'AddOn',
  href: '/api/clusters_mgmt/v1/addons/managed-integration',
  id: 'managed-integration',
  name: 'Red Hat Managed Integration',
  description:
    'Red Hat managed integration, based on the integreatly project, is an opinionated installation of a number of independent middleware services and tools into an OpenShift Dedicated cluster.',
  docs_link: 'https://access.redhat.com/documentation/en-us/red_hat_managed_integration/2/',
  label: 'api.openshift.com/addon-managed-integration',
  icon: null,
  enabled: true,
  resource_name: 'managed-integration',
  resource_cost: 0.5,
  target_namespace: 'redhat-rhmi-operator',
  install_mode: 'single_namespace',
  operator_name: 'integreatly-operator',
  parameters: {
    items: [
      {
        id: 'cidr-range',
        name: 'CIDR Range',
        description:
          'A block of IP addresses used by the RHMI installation program while installing the cluster',
        value_type: 'string',
        validation:
          '/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/(1[6-9]|2[0-6]))$/',
        required: true,
        editable: false,
      },
      {
        id: 'notification-email',
        name: 'Notification Email',
        description: 'Notification email address',
        value_type: 'string',
        validation: "/^w+([-+.']w+)*@w+([-.]w+)*.w+([-.]w+)*$/",
        required: false,
        editable: true,
      },
    ],
  },
};
export const serviceMesh = {
  kind: 'AddOn',
  href: '/api/clusters_mgmt/v1/addons/service-mesh',
  id: 'service-mesh',
  name: 'Red Hat OpenShift Service Mesh',
  description:
    'Based on the open source Istio project, Red Hat OpenShift Service Mesh provides an easy way to create a network of deployed services that provides discovery, load balancing, service-to-service authentication, failure recovery, metrics, and monitoring.',
  label: 'api.openshift.com/addon-service-mesh',
  icon: null,
  enabled: true,
  resource_name: 'addon-service-mesh',
  resource_cost: 1,
  target_namespace: 'redhat-service-mesh-operator',
  install_mode: 'single_namespace',
  operator_name: 'service-mesh-operator',
};
export const dbaOperator = {
  kind: 'AddOn',
  href: '/api/clusters_mgmt/v1/addons/dba-operator',
  id: 'dba-operator',
  name: 'DBA Operator',
  description: 'DBA Operator description',
  label: 'api.openshift.com/addon-dba-operator',
  icon: null,
  enabled: true,
  resource_name: 'addon-dba-operator',
  resource_cost: 1,
  target_namespace: 'addon-dba-operator',
  install_mode: 'all_namespaces',
  operator_name: 'dba-operator',
};
export const integreatly = {
  kind: 'AddOn',
  href: '/api/clusters_mgmt/v1/addons/integreatly',
  id: 'integreatly',
  name: 'Integreatly Operator',
  description: 'Install and configure the integreatly suite of Software',
  docs_link: 'https://access.redhat.com/documentation/en-us/red_hat_managed_integration/2/',
  icon: null,
  label: 'api.openshift.com/addon-integreatly-operator',
  enabled: true,
  resource_name: 'addon-rhmi-operator',
  resource_cost: 1,
  target_namespace: 'redhat-rhmi-operator',
  install_mode: 'single_namespace',
  operator_name: 'integreatly-operator',
};
export const prowOperator = {
  kind: 'AddOn',
  href: '/api/clusters_mgmt/v1/addons/prow-operator',
  id: 'prow-operator',
  name: 'Prow Operator',
  description: 'Manage Prow CRDs',
  docs_link: 'https://pkg.go.dev/k8s.io/test-infra/prow',
  label: 'api.openshift.com/addon-prow-operator',
  icon: null,
  enabled: true,
  resource_name: 'addon-prow-operator',
  resource_cost: 1,
  target_namespace: 'prow',
  install_mode: 'single_namespace',
  operator_name: 'prow-operator',
};
export const loggingOperator = {
  kind: 'AddOn',
  href: '/api/clusters_mgmt/v1/addons/cluster-logging-operator',
  id: 'cluster-logging-operator',
  name: 'Red Hat OpenShift Cluster logging operator',
  description:
    'The Cluster Logging Operator for OKD provides a means for configuring and managing your aggregated logging stack.',
  label: 'api.openshift.com/addon-cluster-logging-operator',
  icon: 'SNIPPED',
  enabled: true,
  resource_name: 'addon-cluster-logging-operator',
  resource_cost: 1,
  target_namespace: 'openshift-logging',
  install_mode: 'single_namespace',
  operator_name: 'cluster-logging',
  hidden: false,
  has_external_resources: true,
};

export const mockAddOns = {
  items: [
    crcWorkspaces,
    managedIntegration,
    serviceMesh,
    dbaOperator,
    integreatly,
    prowOperator,
    loggingOperator,
  ],
};

export const mockClusterAddOns = {
  items: [
    {
      kind: 'AddOnLink',
      href: '/api/clusters_mgmt/v1/addons/service-mesh',
      addon: {
        id: 'service-mesh',
      },
      state: 'ready',
    },
  ],
};

export const mockClusterAddOnsParams = {
  items: [
    {
      kind: 'AddOnLink',
      href: '/api/clusters_mgmt/v1/addons/crc-workspaces',
      addon: {
        id: 'crc-workspaces',
      },
      state: 'ready',
    },
    {
      kind: 'AddOnLink',
      href: '/api/clusters_mgmt/v1/addons/managed-integration',
      addon: {
        id: 'managed-integration',
      },
      state: 'ready',
      parameters: {
        items: [
          {
            id: 'cidr-range',
            value: '10.1.0.0/16',
          },
        ],
      },
    },
    {
      kind: 'AddOnLink',
      href: '/api/clusters_mgmt/v1/addons/managed-integration',
      addon: {
        id: 'managed-integration',
      },
      state: 'ready',
      parameters: {
        items: [
          {
            id: 'cidr-range',
            value: '10.1.0.0/16',
          },
          {
            id: 'foo',
            value: 'bar',
          },
        ],
      },
    },
  ],
};

export const billingQuota = {
  standard: {
    cost: 1,
    allowed: 1,
    consumed: 1,
  },
  marketplace: {
    cloudAccounts: {
      aws: [
        {
          cloud_account_id: '000000000004',
          cloud_provider_id: 'aws',
        },
      ],
      azure: [
        {
          cloud_account_id: 'fakeAzureSubscriptionId',
          cloud_provider_id: 'azure',
        },
      ],
    },
    cost: 5,
    allowed: 15,
    consumed: 10,
  },
};
