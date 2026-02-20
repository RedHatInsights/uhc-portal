import { FormikValues } from 'formik';

import { BREADCRUMB_PATHS, buildBreadcrumbs } from '~/common/breadcrumbPaths';
import { getDefaultSecurityGroupsSettings } from '~/common/securityGroupsHelpers';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { getDefaultClusterAutoScaling } from '~/components/clusters/common/clusterAutoScalingValues';
import {
  HOST_PREFIX_DEFAULT,
  MACHINE_CIDR_DEFAULT,
  SERVICE_CIDR_DEFAULT,
} from '~/components/clusters/common/networkingConstants';
import {
  CHANNEL_GROUP_DEFAULT,
  CloudProviderType,
  emptyAWSSubnet,
  FieldId as CommonFieldId,
  IMDSType,
  UpgradePolicyType,
} from '~/components/clusters/wizards/common/constants';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { BreadcrumbPath } from '~/components/common/Breadcrumbs';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { ApplicationIngressType, ClusterPrivacyType } from './Networking/constants';

export enum OsdFieldId {
  // TODO: many fields here should move to common/constants.
  PersistentStorage = 'persistent_storage',
  LoadBalancers = 'load_balancers',
  SecureBoot = 'secure_boot',
  ClusterPrivacy = 'cluster_privacy',
  InstallToSharedVpc = 'install_to_shared_vpc',
  SharedHostProjectID = 'shared_host_project_id',
  KeyLocation = 'key_location',
  KeyRing = 'key_ring',
  KeyName = 'key_name',
  KmsServiceAccount = 'kms_service_account',
  DisableScpChecks = 'disable_scp_checks',
  NetworkMachineCidr = 'network_machine_cidr',
  NetworkServiceCidr = 'network_service_cidr',
  NetworkPodCidr = 'network_pod_cidr',
  NetworkHostPrefix = 'network_host_prefix',
  NetworkMachineCidrSingleAz = 'network_machine_cidr_single_az',
  NetworkMachineCidrMultiAz = 'network_machine_cidr_multi_az',
  MarketplaceSelection = 'marketplace_selection',
}

export const FieldId = { ...CommonFieldId, ...OsdFieldId };

export enum StepName {
  BillingModel = 'Billing model',
  ClusterSettings = 'Cluster settings',
  CloudProvider = 'Cloud provider',
  Details = 'Details',
  MachinePool = 'Machine pool',
  Networking = 'Networking',
  Configuration = 'Configuration',
  VpcSettings = 'VPC settings',
  ClusterProxy = 'Cluster-wide proxy',
  CidrRanges = 'CIDR ranges',
  ClusterUpdates = 'Cluster updates',
  Review = 'Review and create',
}

export enum StepId {
  BillingModel = 'billing-model',
  ClusterSettings = 'cluster-settings',
  ClusterSettingsCloudProvider = 'cluster-settings-cloud-provider',
  ClusterSettingsDetails = 'cluster-settings-details',
  ClusterSettingsMachinePool = 'cluster-settings-machine-pool',
  Networking = 'networking',
  NetworkingConfiguration = 'networking-config',
  NetworkingVpcSettings = 'networking-vpc-settings',
  NetworkingClusterProxy = 'networking-cluster-proxy',
  NetworkingCidrRanges = 'networking-cidr-ranges',
  ClusterUpdates = 'cluster-updates',
  Review = 'review',
}

export enum UrlPath {
  Create = '/create',
  CreateOsd = '/create/osd',
  CreateCloud = '/create/cloud',
}

export const breadcrumbs: BreadcrumbPath[] = buildBreadcrumbs(
  BREADCRUMB_PATHS.CLUSTER_LIST,
  BREADCRUMB_PATHS.CLUSTER_TYPE,
  BREADCRUMB_PATHS.OSD,
);

export const initialValues: FormikValues = {
  [FieldId.Product]: normalizedProducts.OSD,
  [FieldId.Byoc]: 'true',
  [FieldId.CloudProvider]: CloudProviderType.Gcp,
  [FieldId.AcknowledgePrereq]: false,
  [FieldId.BillingModel]: SubscriptionCommonFieldsClusterBillingModel.standard,
  [FieldId.MultiAz]: 'false',
  [FieldId.SelectedVpc]: { id: '', name: '' },
  [FieldId.MachinePoolsSubnets]: [emptyAWSSubnet()],
  [FieldId.SecurityGroups]: getDefaultSecurityGroupsSettings(),
  [FieldId.InstallToSharedVpc]: false,
  [FieldId.SecureBoot]: false,
  [FieldId.EnableUserWorkloadMonitoring]: true,
  [FieldId.NodeLabels]: [{ key: '', value: '' }],
  [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
  [FieldId.CidrDefaultValuesEnabled]: true,
  [FieldId.NetworkMachineCidr]: MACHINE_CIDR_DEFAULT,
  [FieldId.NetworkServiceCidr]: SERVICE_CIDR_DEFAULT,
  [FieldId.NetworkHostPrefix]: HOST_PREFIX_DEFAULT,
  [FieldId.UpgradePolicy]: UpgradePolicyType.Manual,
  [FieldId.AutomaticUpgradeSchedule]: '0 0 * * 0',
  [FieldId.NodeDrainGracePeriod]: 60,
  [FieldId.PersistentStorage]: '107374182400',
  [FieldId.LoadBalancers]: 0,
  [FieldId.DisableScpChecks]: false,
  [FieldId.CustomerManagedKey]: 'false',
  [FieldId.IMDS]: IMDSType.V1AndV2,
  [FieldId.ApplicationIngress]: ApplicationIngressType.Default,
  [FieldId.DefaultRouterExcludedNamespacesFlag]: '',
  [FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict]: true,
  [FieldId.IsDefaultRouterWildcardPolicyAllowed]: false,
  [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(),
  [FieldId.DomainPrefix]: '',
  [FieldId.HasDomainPrefix]: false,
  [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
  [FieldId.GcpWifConfig]: '',
  [FieldId.PrivateServiceConnect]: false,
  [FieldId.PSCSubnet]: '',
  [FieldId.ChannelGroup]: CHANNEL_GROUP_DEFAULT,
  [FieldId.VersionChannel]: '',
};

export const initialTouched = {
  [FieldId.AcknowledgePrereq]: true,
};

export const clusterNameHint =
  'This name identifies your cluster in OpenShift Cluster Manager and forms part of the cluster console subdomain.';
export const documentTitle =
  'Create an OpenShift Dedicated cluster | Red Hat OpenShift Cluster Manager';
export const ariaLabel = 'Create OpenShift Dedicated cluster wizard';
export const MIN_SECURE_BOOT_VERSION = '4.13.0';
