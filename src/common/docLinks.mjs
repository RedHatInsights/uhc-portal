// import { combineAndSortLinks } from './linkUtils.mjs';

const ROSA_CLASSIC_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws_classic_architecture/4/html';
const OCP_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html';
const OSD_DOCS_BASE = 'https://docs.redhat.com/en/documentation/openshift_dedicated/4/html';
const ROSA_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html';
const RH_BASE = 'https://www.redhat.com/en';
const COSTMGMT_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html';

const docLinks = {
  WHAT_IS_OPENSHIFT: 'https://www.redhat.com/en/technologies/cloud-computing/openshift',
  WHAT_IS_ROSA: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/aws',
  WHAT_IS_OSD: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated',
  LEARN_MORE_OSD:
    'https://www.redhat.com/en/products/interactive-walkthrough/install-openshift-dedicated-google-cloud',
  ROSA_COMMUNITY_SLACK: 'https://red.ht/rosa-slack',
  ROSA_QUICKSTART: `${ROSA_CLASSIC_DOCS_BASE}/getting_started/rosa-quickstart-guide-ui`,
  OSD_QUICKSTART: 'https://www.youtube.com/watch?v=p9KBFvMDQJM&feature=youtu.be',
  AZURE_OPENSHIFT_GET_STARTED: 'https://azure.microsoft.com/en-us/products/openshift/',
  OPENSHIFT_LOCAL_SUPPORT_AND_COMMUNITY_DOCS: 'https://crc.dev/docs/using/',

  // Rosa Classic
  ROSA_CLASSIC_CIDR_MACHINE: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions#machine-cidr-description`,
  ROSA_CLASSIC_CIDR_SERVICE: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions#service-cidr-description`,
  ROSA_CLASSIC_CIDR_POD: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions#pod-cidr-description`,
  ROSA_CLASSIC_CIDR_HOST: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions#host-prefix-description`,
  ROSA_CLASSIC_MONITORING: `${ROSA_CLASSIC_DOCS_BASE}-single/monitoring/index#preparing-to-configure-the-monitoring-stack-uwm`,
  ROSA_CLASSIC_SECURITY_GROUPS: `${ROSA_CLASSIC_DOCS_BASE}/prepare_your_environment/rosa-sts-aws-prereqs#rosa-security-groups_rosa-sts-aws-prereqs`,
  ROSA_CLASSIC_CLUSTER_WIDE_PROXY: `${ROSA_CLASSIC_DOCS_BASE}/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
  ROSA_CLASSIC_UPGRADES: `${ROSA_CLASSIC_DOCS_BASE}/upgrading/rosa-upgrading-sts`,
  ROSA_CLASSIC_AWS_ACCOUNT_ASSOCIATION: `${ROSA_CLASSIC_DOCS_BASE}/prepare_your_environment/rosa-cloud-expert-prereq-checklist`,
  ROSA_CLASSIC_AWS_LIMITS_SCALE: `${ROSA_CLASSIC_DOCS_BASE}/prepare_your_environment/rosa-planning-environment`,
  ROSA_CLASSIC_AWS_IAM_RESOURCES: `${ROSA_CLASSIC_DOCS_BASE}/introduction_to_rosa/rosa-sts-about-iam-resources`,
  ROSA_CLASSIC_AWS_IAM_OPERATOR_ROLES: `${ROSA_CLASSIC_DOCS_BASE}/introduction_to_rosa/rosa-sts-about-iam-resources#rosa-sts-operator-roles_rosa-sts-about-iam-resources`,
  CIDR_RANGE_DEFINITIONS_ROSA_CLASSIC: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions`,

  // Rosa
  ROSA_UNDERSTANDING_IDENTITY_PROVIDER: `${ROSA_DOCS_BASE}/authentication_and_authorization/sd-configuring-identity-providers`,
  ROSA_SERVICE_DEFINITION_COMPUTE: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-instance-types_rosa-service-definition`,
  ROSA_CIDR_MACHINE: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions#machine-cidr-description`,
  ROSA_CIDR_SERVICE: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions#service-cidr-description`,
  ROSA_CIDR_POD: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions#pod-cidr-description`,
  ROSA_CIDR_HOST: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions#host-prefix-description`,
  ROSA_CLUSTER_AUTOSCALING: `${ROSA_DOCS_BASE}/cluster_administration/rosa-cluster-autoscaling-hcp`,
  ROSA_MONITORING: `${ROSA_DOCS_BASE}-single/monitoring/index#preparing-to-configure-the-monitoring-stack-uwm`,
  ROSA_AUTOSCALING: `${ROSA_DOCS_BASE}/cluster_administration/manage-nodes-using-machine-pools#rosa-nodes-about-autoscaling-nodes`,
  ROSA_SECURITY_GROUPS: `${ROSA_DOCS_BASE}/prepare_your_environment/rosa-hcp-prereqs#rosa-security-groups_rosa-hcp-prereqs`,
  ROSA_LIFE_CYCLE: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#life-cycle-overview_rosa-life-cycle`,
  ROSA_LIFE_CYCLE_DATES: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#sd-life-cycle-dates_rosa-hcp-life-cycle`,
  ROSA_Z_STREAM: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-patch-versions_rosa-hcp-life-cycle`,
  ROSA_WORKER_NODE_COUNT: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-compute_rosa-service-definition`,
  ROSA_SERVICE_ETCD_ENCRYPTION: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-etcd-encryption_rosa-service-definition`,
  ROSA_CLUSTER_WIDE_PROXY: `${ROSA_DOCS_BASE}/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
  ROSA_UPGRADES: `${ROSA_DOCS_BASE}/upgrading/rosa-hcp-upgrading`,
  ROSA_LIMITED_SUPPORT_DEFINITION: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-limited-support_rosa-service-definition`,
  ROSA_SHARED_VPC: `${ROSA_DOCS_BASE}/install_clusters/rosa-hcp-shared-vpc-config`,
  ROSA_PRIVATE_CONNECTIONS: `${ROSA_DOCS_BASE}/cluster_administration/configuring-private-connections#rosa-configuring-private-connections`,
  ROSA_AWS_ACCOUNT_ASSOCIATION: `${ROSA_DOCS_BASE}/prepare_your_environment/rosa-cloud-expert-prereq-checklist`,
  ROSA_AWS_IAM_RESOURCES: `${ROSA_DOCS_BASE}/introduction_to_rosa/rosa-hcp-about-iam-resources`,
  ROSA_AWS_IAM_OPERATOR_ROLES: `${ROSA_DOCS_BASE}/introduction_to_rosa/rosa-hcp-about-iam-resources#rosa-sts-operator-roles_rosa-sts-about-iam-resources`,
  CIDR_RANGE_DEFINITIONS_ROSA: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions`,
  VIRTUAL_PRIVATE_CLOUD_URL: `${ROSA_DOCS_BASE}/install_clusters/rosa-hcp-quickstart-guide#rosa-hcp-quickstart-creating-vpc`,
  WINDOWS_LICENSE_INCLUDED_REDHAT_DOCS: `${ROSA_DOCS_BASE}/cluster_administration/managing-compute-nodes-using-machine-pools#creating_machine_pools_ocm_rosa-managing-worker-nodes`,
  ROSA_CAPACITY_RESERVATION_OVERVIEW: `${ROSA_DOCS_BASE}/cluster_administration/managing-compute-nodes-using-machine-pools#rosa-managing-worker-nodes`,
  TERRAFORM_ROSA_HCP_URL: `${ROSA_DOCS_BASE}/install_clusters/creating-a-rosa-cluster-using-terraform`,
  TERRAFORM_REGISTRY_ROSA_HCP:
    'https://registry.terraform.io/providers/terraform-redhat/rhcs/latest/docs/guides/hosted-control-planes',
  ROSA_AWS_FEDRAMP: `${ROSA_DOCS_BASE}/getting_started_with_rosa_govcloud/index`,
  ROSA_HCP_CLI_URL: `${ROSA_DOCS_BASE}/install_clusters/rosa-hcp-sts-creating-a-cluster-quickly`,
  LEARN_MORE_SSO_ROSA: `${ROSA_DOCS_BASE}/cli_tools/rosa-cli#rosa-login-sso_rosa-getting-started-cli`,

  // OSD
  OSD_DEDICATED_ADMIN_ROLE: `${OSD_DOCS_BASE}/authentication_and_authorization/osd-admin-roles`,
  OSD_CCS_AWS_LIMITS: `${OSD_DOCS_BASE}/planning_your_environment/aws-ccs#aws-limits_aws-ccs`,
  OSD_CCS_AWS_CUSTOMER_REQ: `${OSD_DOCS_BASE}/planning_your_environment/aws-ccs#ccs-aws-customer-requirements_aws-ccs`,
  OSD_CCS_GCP: `${OSD_DOCS_BASE}/planning_your_environment/gcp-ccs`,
  OSD_CCS_GCP_LIMITS: `${OSD_DOCS_BASE}/planning_your_environment/gcp-ccs#gcp-limits_gcp-ccs`,
  OSD_CCS_GCP_SHEILDED_VM: `${OSD_DOCS_BASE}/openshift_dedicated_clusters_on_google_cloud/osd-creating-a-cluster-on-gcp-with-workload-identity-federation`,
  OSD_CCS_GCP_WIF_CREATION_LEARN_MORE: `${OSD_DOCS_BASE}/openshift_dedicated_clusters_on_google_cloud/osd-creating-a-cluster-on-gcp-with-workload-identity-federation#workload-identity-federation-overview_osd-creating-a-cluster-on-gcp-with-workload-identity-federation`,
  OSD_LIFE_CYCLE: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#osd-life-cycle`,
  OSD_LIFE_CYCLE_DATES: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#sd-life-cycle-dates_osd-life-cycle`,
  OSD_Z_STREAM: `${OSD_DOCS_BASE}/upgrading/osd-upgrades#upgrade-auto_osd-upgrades`,
  OSD_ETCD_ENCRYPTION: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#etcd-encryption_osd-service-definition_dedicated/policies-and-service-definition#sdpolicy-account-management_osd-service-definition`,
  OSD_AWS_PRIVATE_CONNECTIONS: `${OSD_DOCS_BASE}/cluster_administration/configuring-private-connections#enable-aws-access`,
  OSD_PRIVATE_CLUSTER: `${OSD_DOCS_BASE}/cluster_administration/configuring-private-connections#private-cluster`,
  OSD_CLUSTER_WIDE_PROXY: `${OSD_DOCS_BASE}/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
  OSD_UPGRADES: `${OSD_DOCS_BASE}/upgrading/osd-upgrades`,
  OSD_LIMITED_SUPPORT_DEFINITION: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#limited-support_osd-service-definition`,
  OSD_MONITORING_STACK: `${OSD_DOCS_BASE}/monitoring/configuring-user-workload-monitoring#preparing-to-configure-the-monitoring-stack-uwm`,
  OSD_CIDR_MACHINE: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions#machine-cidr-description`,
  OSD_CIDR_SERVICE: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions#service-cidr-description`,
  OSD_CIDR_POD: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions#pod-cidr-description`,
  OSD_CIDR_HOST: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions#host-prefix-description`,
  OSD_CLUSTER_AUTOSCALING: `${OSD_DOCS_BASE}/cluster_administration/osd-cluster-autoscaling`,
  OSD_SECURITY_GROUPS: `${OSD_DOCS_BASE}/planning_your_environment/aws-ccs#osd-security-groups-custom_aws-ccs`,
  CIDR_RANGE_DEFINITIONS_OSD: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions`,
  CONFIGURE_PROXY_URL: `${OSD_DOCS_BASE}/networking_overview/index`,

  // OCP
  AWS_CONTROL_PLANE_URL: `${OCP_DOCS_BASE}/architecture/control-plane#control-plane`,
  IDP_HTPASSWD: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#configuring-htpasswd-identity-provider`,
  IDP_LDAP: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-ldap-identity-provider`,
  IDP_GITHUB: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#configuring-github-identity-provider`,
  IDP_GITLAB: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-gitlab-identity-provider`,
  IDP_GOOGLE: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-google-identity-provider`,
  IDP_OPENID: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-oidc-identity-provider`,
  CCO_MANUAL_MODE: `${OCP_DOCS_BASE}/authentication_and_authorization/managing-cloud-provider-credentials#cco-mode-manual`,
  UNDERSTANDING_AUTHENTICATION: `${OCP_DOCS_BASE}/authentication_and_authorization/understanding-authentication`,
  UNDERSTANDING_IDENTITY_PROVIDER: `${OCP_DOCS_BASE}/authentication_and_authorization/understanding-identity-provider`,
  APPLYING_AUTOSCALING: `${OCP_DOCS_BASE}/machine_management/applying-autoscaling`,
  APPLYING_AUTOSCALING_API_DETAIL: `${OCP_DOCS_BASE}/autoscale_apis/clusterautoscaler-autoscaling-openshift-io-v1`,
  AWS_SPOT_INSTANCES: `${OCP_DOCS_BASE}/machine_management/managing-compute-machines-with-the-machine-api#machineset-non-guaranteed-instance_creating-machineset-aws`,
  COSTMGMT_ADDING_OCP: `${COSTMGMT_DOCS_BASE}/integrating_openshift_container_platform_data_into_cost_management/index`,
  UPDATING_CLUSTER: `${OCP_DOCS_BASE}/updating_clusters/performing-a-cluster-update#updating-cluster-web-console`,

  // AWS
  AWS_CLI: 'https://aws.amazon.com/cli/',
  AWS_CLI_CONFIGURATION_INSTRUCTIONS:
    'https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html',
  AWS_CLI_INSTRUCTIONS:
    'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-auto.html',
  AWS_CLI_GETTING_STARTED_MANUAL:
    'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-manual.html',
  AWS_ROSA_GET_STARTED: 'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started.html',
  AWS_FINDING_KEY_ARN: 'https://docs.aws.amazon.com/kms/latest/developerguide/find-cmk-id-arn.html',
  AWS_IMDS:
    'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-options.html',
  AWS_LOAD_BALANCER_FEATURES:
    'https://aws.amazon.com/elasticloadbalancing/features/#Product_comparisons',
  AWS_SHARED_VPC: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-sharing.html',
  AWS_CAPACITY_RESERVATION:
    'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/capacity-reservation-overview.html',

  AWS_ARN_CONFIG: 'https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html',
  AWS_DATA_PROTECTION: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/data-protection.html',
  FINDING_AWS_ACCOUNT_IDENTIFIERS:
    'https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-identifiers.html',
  CREATE_VPC_WAYS: `https://docs.aws.amazon.com/rosa/latest/userguide/getting-started-hcp.html#create-vpc-hcp`,
  WINDOWS_LICENSE_INCLUDED_AWS_DOCS: 'https://aws.amazon.com/windows/resources/licensing/',

  // GCP
  GCP_VPC_PROVISIONING:
    'https://cloud.google.com/vpc/docs/provisioning-shared-vpc#migs-service-accounts',
  GCP_ORG_POLICY: 'https://cloud.google.com/resource-manager/docs/organization-policy/overview',
  GCP_ORG_POLICY_API: 'https://cloud.google.com/resource-manager/docs/reference/orgpolicy/rest',
  GCP_SERVICE_ACCOUNT_KEYS:
    'https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys',
  GCP_ENCRYPTION_KEYS: 'https://cloud.google.com/storage/docs/encryption/default-keys',
  OSD_CCS_GCP_WIF_GCLOUD_CREDENTIALS:
    'https://cloud.google.com/docs/authentication/provide-credentials-adc',

  // RH Developers
  RH_DEV_TOOLS: 'https://developers.redhat.com/topics/developer-tools',
  OCM_CLI_RELEASES_LATEST:
    'https://developers.redhat.com/content-gateway/rest/browse/pub/cgw/ocm/latest',

  // RH Base docs
  RH_CONTACT: `${RH_BASE}/contact`,
  RH_ISTIO: `${RH_BASE}/topics/microservices/what-is-istio`,
  RH_ARGO_CD: `${RH_BASE}/blog/argocd-and-gitops-whats-next`,
  RH_OCP_SUBSCRIPTIONS: `${RH_BASE}/resources/self-managed-openshift-sizing-subscription-guide`,
  RH_ACS_TRIAL: `${RH_BASE}/technologies/cloud-computing/openshift/advanced-cluster-security-kubernetes/trial`,
  RH_OPENSHIFT_AI_TRIAL: `${RH_BASE}/technologies/cloud-computing/openshift/openshift-ai/trial`,
  RH_ACM_TRIAL: `${RH_BASE}/technologies/management/advanced-cluster-management/trial`,
  RH_ACM: `${RH_BASE}/technologies/management/advanced-cluster-management`,
  RH_OPENSHIFT_OBSERVABILITY: `${RH_BASE}/technologies/cloud-computing/openshift/observability`,
  RH_ROSA: `${RH_BASE}/technologies/cloud-computing/openshift/aws`,
  RH_ROSA_LEARN: `${RH_BASE}/technologies/cloud-computing/openshift/aws/learn`,
  RH_ROSA_INSTALL: `${RH_BASE}/products/interactive-walkthrough/install-rosa`,
  RH_ROSA_LIGHTBOARD: `${RH_BASE}/about/videos/rosa-lightboard`,

  // Cli docs
  KN_DOCS: `${OCP_DOCS_BASE}/cli_tools/kn-cli-tools`,
  TKN_DOCS: `${OCP_DOCS_BASE}/cli_tools/pipelines-cli-tkn#installing-tkn`,
  CLI_TOOLS_OCP_GETTING_STARTED: `${OCP_DOCS_BASE}/cli_tools/openshift-cli-oc#cli-about-cli_cli-developer-commands`,
  OPM_DOCS: `${OCP_DOCS_BASE}/cli_tools/opm-cli#olm-about-opm_cli-opm-install`,
  ODO_DOCS: 'https://odo.dev/docs/introduction',

  // Misc
  LEARN_MORE_SSO:
    'https://docs.redhat.com/en/documentation/openshift_cluster_manager/1-latest/html-single/managing_clusters/index#con-ocm-with-rhsso_downloading-and-updating-pull-secrets',
  TRANSFER_CLUSTER_OWNERSHIP:
    'https://docs.redhat.com/en/documentation/openshift_cluster_manager/1-latest/html-single/managing_clusters/index#transferring-cluster-ownership_downloading-and-updating-pull-secrets',
  OSDK_REMOVAL_DOCS_4_19: `https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/release_notes/ocp-4-19-release-notes#ocp-4-19-removed-osdk_release-notes`,
  HELM_DOCS: `${OCP_DOCS_BASE}/building_applications/working-with-helm-charts#understanding-helm`,
};

export default docLinks;
