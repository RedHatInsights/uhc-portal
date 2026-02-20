import { FormikValues } from 'formik';

import { isMajorMinorEqualOrGreater, splitVersion } from '~/common/versionHelpers';

import { FormSubnet } from './FormSubnet';

// Fields that are used in both OSD and ROSA wizards.
export enum FieldId {
  AccessKeyId = 'access_key_id',
  AccountId = 'account_id',
  AcknowledgePrereq = 'acknowledge_prerequisites',
  AdditionalTrustBundle = 'additional_trust_bundle',
  ApplicationIngress = 'applicationIngress',
  AutomaticUpgradeSchedule = 'automatic_upgrade_schedule',
  AutoscalingEnabled = 'autoscalingEnabled',
  BillingModel = 'billing_model',
  Byoc = 'byoc',
  ByoOidcConfigId = 'byo_oidc_config_id',
  ByoOidcConfigIdManaged = 'byo_oidc_config_id_managed',
  ChannelGroup = 'channel_group',
  CidrDefaultValuesEnabled = 'cidr_default_values_enabled',
  CidrDefaultValuesToggle = 'cidr_default_values_toggle',
  CloudProvider = 'cloud_provider',
  ClusterAutoscaling = 'cluster_autoscaling',
  ClusterName = 'name',
  ClusterVersion = 'cluster_version',
  VersionChannel = 'version_channel',
  ComputeSubnet = 'compute_subnet',
  ConfigureProxy = 'configure_proxy',
  PrivateServiceConnect = 'private_service_connect',
  PSCSubnet = 'psc_subnet',
  ControlPlaneSubnet = 'control_plane_subnet',
  CustomerManagedKey = 'customer_managed_key',
  CustomOperatorRolesPrefix = 'custom_operator_roles_prefix',
  DefaultRouterExcludedNamespacesFlag = 'defaultRouterExcludedNamespacesFlag',
  DefaultRouterSelectors = 'defaultRouterSelectors',
  DetectedOcmRole = 'detected_ocm_role',
  DisableScpChecks = 'disable_scp_checks',
  DomainPrefix = 'domain_prefix',
  EnableUserWorkloadMonitoring = 'enable_user_workload_monitoring',
  EtcdEncryption = 'etcd_encryption',
  FipsCryptography = 'fips',
  GcpServiceAccount = 'gcp_service_account',
  HasDomainPrefix = 'has_domain_prefix',
  HttpProxyUrl = 'http_proxy_url',
  HttpsProxyUrl = 'https_proxy_url',
  IMDS = 'imds',
  InstallerRoleArn = 'installer_role_arn',
  InstallToVpc = 'install_to_vpc',
  IsDefaultRouterNamespaceOwnershipPolicyStrict = 'isDefaultRouterNamespaceOwnershipPolicyStrict',
  IsDefaultRouterWildcardPolicyAllowed = 'isDefaultRouterWildcardPolicyAllowed',
  KmsKeyArn = 'kms_key_arn',
  MachinePoolsSubnets = 'machinePoolsSubnets', // OSD AWS / ROSA classic
  MachineType = 'machine_type',
  MachineTypeForceChoice = 'machine_type_force_choice',
  MaxReplicas = 'max_replicas',
  MinReplicas = 'min_replicas',
  MultiAz = 'multi_az',
  NetworkHostPrefix = 'network_host_prefix',
  NetworkMachineCidr = 'network_machine_cidr',
  NetworkPodCidr = 'network_pod_cidr',
  NetworkServiceCidr = 'network_service_cidr',
  NodeDrainGracePeriod = 'node_drain_grace_period',
  NodeLabels = 'node_labels',
  NodesCompute = 'nodes_compute',
  NoProxyDomains = 'no_proxy_domains',
  Product = 'product',
  Region = 'region',
  RegionalInstance = 'regional_instance',
  RosaCreatorArn = 'rosa_creator_arn',
  RosaRolesProviderCreationMode = 'rosa_roles_provider_creation_mode',
  SecretAccessKey = 'secret_access_key',
  SecurityGroupIds = 'securityGroupIds',
  SecurityGroups = 'securityGroups',
  SelectedVpc = 'selected_vpc', // OSD AWS / ROSA classic
  UpgradePolicy = 'upgrade_policy',
  UsePrivateLink = 'use_privatelink',
  VpcName = 'vpc_name', // OSD GCP (shared VPC)
  EnableExteranlAuthentication = 'enable_external_authentication',
  GcpAuthType = 'gcp_auth_type',
  GcpWifConfig = 'gcp_wif_config',
}

export const initialValues: FormikValues = {
  [FieldId.AutomaticUpgradeSchedule]: '0 0 * * 0',
};

export enum CloudProviderType {
  Aws = 'aws',
  Gcp = 'gcp',
}

export enum UpgradePolicyType {
  Automatic = 'automatic',
  Manual = 'manual',
}

export enum IMDSType {
  V1AndV2 = 'optional',
  V2Only = 'required',
}

export const AWS_DEFAULT_REGION = 'us-east-1';
export const GCP_DEFAULT_REGION = 'us-east1';
export const CHANNEL_GROUP_DEFAULT = 'stable';

export const emptyAWSSubnet: () => FormSubnet = () => ({
  availabilityZone: '',
  privateSubnetId: '',
  publicSubnetId: '',
});

export const canSelectImds = (clusterVersionRawId: string): boolean => {
  const [major, minor] = splitVersion(clusterVersionRawId);
  return major > 4 || (major === 4 && minor >= 11);
};

export const canConfigureDayOneManagedIngress = (clusterVersionRawId: string): boolean =>
  isMajorMinorEqualOrGreater(clusterVersionRawId, 4, 14);

export const canConfigureDayOnePrivateServiceConnect = (clusterVersionRawId: string): boolean =>
  isMajorMinorEqualOrGreater(clusterVersionRawId, 4, 17);

// Default compute node counts for different cluster configurations
export const DEFAULT_NODE_COUNT_CUSTOMER_SINGLE_AZ = 2;
export const DEFAULT_NODE_COUNT_CUSTOMER_MULTI_AZ = 1;
export const DEFAULT_NODE_COUNT_REDHAT_SINGLE_AZ = 4;
export const DEFAULT_NODE_COUNT_REDHAT_MULTI_AZ = 3;
