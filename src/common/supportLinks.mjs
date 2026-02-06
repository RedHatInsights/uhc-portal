// This module has .mjs extension to simplify importing from NodeJS scripts.
// Support-related URLs for Red Hat Customer Portal, Knowledge Base articles and Support/Troubleshooting documentation

import { combineAndSortLinks } from './linkUtils.mjs';

const BASE_URL = 'https://access.redhat.com/';
const SUPPORT_URL = `${BASE_URL}support/`;
const ARTICLES_URL = `${BASE_URL}articles/`;
const SOLUTIONS_URL = `${BASE_URL}solutions/`;
const SECURITY_URL = `${BASE_URL}security/`;
const DOCUMENTATION_URL = `${BASE_URL}documentation/`;
const ROSA_CP_DOCS_BASE = `${BASE_URL}documentation/en-us/red_hat_openshift_service_on_aws/4/html`;
const OCM_DOCS_BASE = `${BASE_URL}documentation/en-us/openshift_cluster_manager/2023`;
const OCP_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html';

const supportLinks = {
  // Support Case Management
  SUPPORT_CASE_NEW: `${SUPPORT_URL}cases/#/case/new`,
  SUPPORT_CASE_NEW_WITH_ISSUE: `${SUPPORT_URL}cases/#/case/new/open-case/describe-issue`,
  SUPPORT_CASE_VIEW: `${SUPPORT_URL}cases/#/case`,
  SUPPORT_HOME: SUPPORT_URL,

  // Knowledge Base Articles
  EXPORT_CONTROL_KB: `${ARTICLES_URL}1340183`,
  OFFLINE_TOKENS_KB: `${ARTICLES_URL}7074172`,
  ARCHIVE_CLUSTER_KB: `${ARTICLES_URL}4397891`,
  BILLING_MODEL_KB: `${ARTICLES_URL}5990101`,
  PULL_SECRET_CHANGE_KB: `${SOLUTIONS_URL}4902871`,
  HIBERNATING_CLUSTER: `${ARTICLES_URL}7012966`,
  SUBSCRIPTION_EVAL_INFORMATION: `${ARTICLES_URL}4389911`,
  MANAGED_INGRESS_KNOWLEDGE_BASE: `${ARTICLES_URL}7028653`,
  INSTALL_GENERIC_NON_TESTED_PLATFORMS: `${ARTICLES_URL}4207611`,
  COOPERATIVE_COMMUNITY_SUPPORT_KCS: `${SOLUTIONS_URL}5893251`,
  OCM_CLI_DOCS: `${ARTICLES_URL}6114701`,
  ROSA_CREATE_NETWORK: `${ARTICLES_URL}7096266`,

  // Support Policies and Classifications
  OPENSHIFT_SUPPORT_POLICY: `${SUPPORT_URL}policy/updates/openshift`,
  OPENSHIFT_POLICY_UPDATES: `${SUPPORT_URL}policy/updates/openshift/policies`,
  SECURITY_CLASSIFICATION_CRITICAL: `${SECURITY_URL}updates/classification/#critical`,

  // Support/Troubleshooting Documentation
  ROSA_CP_DOCS: `${DOCUMENTATION_URL}en-us/red_hat_openshift_service_on_aws/4`,
  ACCESS_REQUEST_DOC_LINK: `${ROSA_CP_DOCS_BASE}/support/approved-access#approved-access`,
  ROSA_TROUBLESHOOTING_INSTALLATIONS: `${ROSA_CP_DOCS_BASE}/support/troubleshooting#rosa-troubleshooting-installations`,
  ROSA_DEFINITION_DOC: `${ROSA_CP_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-service-definition`,
  ROSA_CLI_DOCS: `${ROSA_CP_DOCS_BASE}/rosa_cli/rosa-get-started-cli`,
  ROSA_HCP_EXT_AUTH: `${ROSA_CP_DOCS_BASE}/install_rosa_with_hcp_clusters/rosa-hcp-sts-creating-a-cluster-ext-auth`,
  ROSA_HCP_BREAK_GLASS: `${ROSA_CP_DOCS_BASE}/install_rosa_with_hcp_clusters/rosa-hcp-sts-creating-a-cluster-ext-auth#rosa-hcp-sts-accessing-a-break-glass-cred-cli_rosa-hcp-sts-creating-a-cluster-ext-auth`,
  OCM_DOCS_PULL_SECRETS: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-managing-clusters#downloading_and_updating_pull_secrets`,
  OCM_DOCS_ROLES_AND_ACCESS: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-user-management-ocm`,
  OCM_DOCS_SUBSCRIPTIONS: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-cluster-subscriptions`,
  OCM_DOCS_UPGRADING_OSD_TRIAL: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-cluster-subscriptions#upgrading-osd-trial-cluster_assembly-cluster-subscriptions`,
  IDP_HTPASSWD: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#configuring-htpasswd-identity-provider`,
  IDP_LDAP: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-ldap-identity-provider`,
  IDP_GITHUB: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#configuring-github-identity-provider`,
  IDP_GITLAB: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-gitlab-identity-provider`,
  IDP_GOOGLE: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-google-identity-provider`,
  IDP_OPENID: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-oidc-identity-provider`,
  CCO_MANUAL_MODE: `${OCP_DOCS_BASE}/authentication_and_authorization/managing-cloud-provider-credentials#cco-mode-manual`,
  UNDERSTANDING_AUTHENTICATION: `${OCP_DOCS_BASE}/authentication_and_authorization/understanding-authentication`,
  UNDERSTANDING_IDENTITY_PROVIDER: `${OCP_DOCS_BASE}/authentication_and_authorization/understanding-identity-provider`,
  APPLYING_AUTOSCALING: `${OCP_DOCS_BASE}//machine_management/applying-autoscaling`,
  APPLYING_AUTOSCALING_API_DETAIL: `${OCP_DOCS_BASE}/autoscale_apis/clusterautoscaler-autoscaling-openshift-io-v1`,
  AWS_SPOT_INSTANCES: `${OCP_DOCS_BASE}/machine_management/managing-compute-machines-with-the-machine-api#machineset-non-guaranteed-instance_creating-machineset-aws`,
  TELEMETRY_INFORMATION: `${OCP_DOCS_BASE}/support/remote-health-monitoring-with-connected-clusters#about-remote-health-monitoring`,
  REMOTE_HEALTH_INSIGHTS: `${OCP_DOCS_BASE}/support/remote-health-monitoring-with-connected-clusters#insights-operator-advisor-overview_using-insights-to-identify-issues-with-your-cluster`,
  UPDATING_CLUSTER: `${OCP_DOCS_BASE}/updating_clusters/performing-a-cluster-update#updating-cluster-web-console`,

  // Support Offerings
  INSTALL_PRE_RELEASE_SUPPORT_KCS: `${SUPPORT_URL}offerings/devpreview`,
  TECH_PREVIEW_KCS: `${SUPPORT_URL}offerings/techpreview`,
};

const getLinks = async () => combineAndSortLinks(Object.values(supportLinks));

export { getLinks };
export default supportLinks;
