import { FormikTouched, FormikValues } from 'formik';

import { getRandomID } from '~/common/helpers';
import { getDefaultSecurityGroupsSettings } from '~/common/securityGroupsHelpers';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { getDefaultClusterAutoScaling } from '~/components/clusters/common/clusterAutoScalingValues';
import { defaultWorkerNodeVolumeSizeGiB } from '~/components/clusters/common/machinePools/constants';
import {
  HOST_PREFIX_DEFAULT,
  MACHINE_CIDR_DEFAULT,
  POD_CIDR_DEFAULT,
  SERVICE_CIDR_DEFAULT,
} from '~/components/clusters/common/networkingConstants';
import {
  AWS_DEFAULT_REGION,
  CloudProviderType,
  emptyAWSSubnet,
  FieldId as CommonFieldId,
  IMDSType,
} from '~/components/clusters/wizards/common/constants';
import {
  ApplicationIngressType,
  ClusterPrivacyType,
} from '~/components/clusters/wizards/osd/Networking/constants';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

export enum RosaFieldId {
  AssociatedAwsId = 'associated_aws_id',
  BillingAccountId = 'billing_account_id',
  CloudProviderId = 'cloud_provider',
  ClusterPrivacy = 'cluster_privacy',
  ClusterPrivacyPublicSubnetId = 'cluster_privacy_public_subnet_id',
  ControlPlaneRoleArn = 'control_plane_role_arn',
  DetectedOcmAndUserRoles = 'detected_ocm_and_user_roles',
  EtcdKeyArn = 'etcd_key_arn',
  Hypershift = 'hypershift',
  RosaMaxOsVersion = 'rosa_max_os_version',
  SharedVpc = 'shared_vpc',
  SupportRoleArn = 'support_role_arn',
  WorkerRoleArn = 'worker_role_arn',
  WorkerVolumeSizeGib = 'worker_volume_size_gib',
  MachineTypeAvailability = 'machine_type_availability',
}

export const FieldId = { ...CommonFieldId, ...RosaFieldId };

export enum StepName {
  AccountsAndRoles = 'Accounts and roles',
  ClusterSettings = 'Cluster settings',
  Details = 'Details',
  MachinePool = 'Machine pool',
  Networking = 'Networking',
  Configuration = 'Configuration',
  VpcSettings = 'VPC settings',
  ClusterProxy = 'Cluster-wide proxy',
  CidrRanges = 'CIDR ranges',
  ClusterRolesAndPolicies = 'Cluster roles and policies',
  ClusterUpdates = 'Cluster updates',
  Review = 'Review and create',
}

export enum StepId {
  AccountsAndRoles = 'accounts-and-roles',
  ClusterSettings = 'cluster-settings',
  ClusterSettingsDetails = 'cluster-settings-details',
  ClusterSettingsMachinePool = 'cluster-settings-machine-pool',
  Networking = 'networking',
  NetworkingConfiguration = 'networking-config',
  NetworkingVpcSettings = 'networking-vpc-settings',
  NetworkingClusterProxy = 'networking-cluster-proxy',
  NetworkingCidrRanges = 'networking-cidr-ranges',
  ClusterRolesAndPolicies = 'cluster-roles-and-policies',
  ClusterUpdates = 'cluster-updates',
  Review = 'review',
}

const hypershiftDefaultSelected = true;

export const initialValuesHypershift = (isHypershift: boolean, isMultiRegionEnabled?: boolean) =>
  isHypershift
    ? {
        [FieldId.BillingModel]: SubscriptionCommonFieldsClusterBillingModel.marketplace_aws,
        [FieldId.ClusterAutoscaling]: null,
        [FieldId.ClusterPrivacyPublicSubnetId]: '',
        [FieldId.InstallToVpc]: true,
        [FieldId.NodeLabels]: [{ id: getRandomID() }],
        [FieldId.SharedVpc]: { is_allowed: false },
        [FieldId.UpgradePolicy]: 'automatic',
        [FieldId.Region]: isMultiRegionEnabled ? undefined : AWS_DEFAULT_REGION,
      }
    : {
        [FieldId.BillingModel]: SubscriptionCommonFieldsClusterBillingModel.standard,
        [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(),
        [FieldId.ClusterPrivacyPublicSubnetId]: '',
        [FieldId.EnableUserWorkloadMonitoring]: true,
        [FieldId.InstallToVpc]: false,
        [FieldId.SecurityGroups]: getDefaultSecurityGroupsSettings(),
        [FieldId.SharedVpc]: {
          is_allowed: true,
          is_selected: false,
          base_dns_domain: '',
          hosted_zone_id: '',
          hosted_zone_role_arn: '',
        },
        [FieldId.UpgradePolicy]: 'manual',
      };

export const initialValues: (hypershiftDefault?: boolean) => FormikValues = (
  hypershiftDefault = hypershiftDefaultSelected,
) => ({
  // static for ROSA, shouldn't change
  [FieldId.Byoc]: 'true',
  [FieldId.CloudProvider]: CloudProviderType.Aws,
  [FieldId.Product]: normalizedProducts.ROSA,

  // other fields
  [FieldId.ApplicationIngress]: ApplicationIngressType.Default,
  [FieldId.AutomaticUpgradeSchedule]: '0 0 * * 0',
  [FieldId.ChannelGroup]: 'stable',
  [FieldId.CidrDefaultValuesToggle]: true,
  [FieldId.ClusterName]: '',
  [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
  [FieldId.ConfigureProxy]: false,
  [FieldId.CustomerManagedKey]: 'false',
  [FieldId.DefaultRouterExcludedNamespacesFlag]: '',
  [FieldId.DefaultRouterSelectors]: '',
  [FieldId.DisableScpChecks]: false,
  [FieldId.EtcdEncryption]: false,
  [FieldId.EtcdKeyArn]: '',
  [FieldId.FipsCryptography]: false,
  [FieldId.Hypershift]: `${hypershiftDefaultSelected}`,
  [FieldId.IMDS]: IMDSType.V1AndV2,
  [FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict]: true,
  [FieldId.IsDefaultRouterWildcardPolicyAllowed]: false,
  [FieldId.KmsKeyArn]: '',
  [FieldId.MachinePoolsSubnets]: [emptyAWSSubnet()],
  [FieldId.MultiAz]: 'false',
  [FieldId.NetworkHostPrefix]: HOST_PREFIX_DEFAULT,
  [FieldId.NetworkMachineCidr]: MACHINE_CIDR_DEFAULT,
  [FieldId.NetworkPodCidr]: POD_CIDR_DEFAULT,
  [FieldId.NetworkServiceCidr]: SERVICE_CIDR_DEFAULT,
  [FieldId.NodeDrainGracePeriod]: 60,
  [FieldId.NodeLabels]: [{ id: getRandomID() }],
  [FieldId.NodesCompute]: 2,
  [FieldId.Region]: AWS_DEFAULT_REGION,
  [FieldId.SelectedVpc]: { id: '', name: '' },
  [FieldId.UsePrivateLink]: false,
  [FieldId.EnableExteranlAuthentication]: false,
  [FieldId.RegionalInstance]: {},
  [FieldId.VersionChannel]: '',
  [FieldId.WorkerVolumeSizeGib]: defaultWorkerNodeVolumeSizeGiB,

  // Optional fields based on whether Hypershift is selected or not
  ...initialValuesHypershift(hypershiftDefault),
});

export const initialValuesRestrictedEnv: FormikValues = {
  ...initialValues(false),
  [FieldId.Hypershift]: 'false',
  [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
  [FieldId.EtcdEncryption]: true,
  [FieldId.FipsCryptography]: true,
};

export const initialTouched: FormikTouched<FormikValues> = {
  [FieldId.Hypershift]: hypershiftDefaultSelected,
};
