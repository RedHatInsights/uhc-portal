import React from 'react';

import { Grid, GridItem, Label, LabelGroup } from '@patternfly/react-core';

import { arrayToString, stringToArrayTrimmed, strToKeyValueObject } from '~/common/helpers';
import { STANDARD_TRIAL_BILLING_MODEL_TYPE } from '~/common/subscriptionTypes';
import { humanizeValueWithUnitGiB } from '~/common/units';
import { routeSelectorsAsString } from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/NetworkingSelector';
import parseUpdateSchedule from '~/components/clusters/common/Upgrades/parseUpdateSchedule';
import { IMDSType } from '~/components/clusters/wizards/common';
import {
  createChannelGroupLabel,
  getVersionNameWithChannel,
} from '~/components/clusters/wizards/common/ClusterSettings/Details/versionSelectHelper';
import { ClusterPrivacyType } from '~/components/clusters/wizards/osd//Networking/constants';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import AwsVpcTable from './AwsVpcTable';
import SecurityGroupsTable from './SecurityGroupsTable';

/**
 * reviewValues structure - key: field name
 * {
 *  title - human readable title
 *  values - map from values to human readable strings. optional.
 *           when both `values` and `valueTransform` are unspecified, actual value is shown.
 *  valueTransform - function to transform current value to human readable string,
 *                   gets two parameters: value (current value), allValues (all form values)
 *                   executed when `values` is not defined,
 *                   or when `values` has no entry for the provided value. optional.
 *  isBoolean - when set to `true`, value `undefined` will be treated as `false`,
 *             to match the behaviour of a boolean field.
 *  isMonospace - when set to `true`, value will be shown in monospace font.
 *  isOptional - when set to `true`, the field will only be shown when the value is not falsy.
 *  isExpandable: when set to `true`, the field will be expandable
 *    - initiallyExpanded: optionally set this when isExpandable is set to `true`.
 *      Determines if the section is initially expanded.
 * }
 */
const reviewValues = {
  billing_model: {
    title: 'Subscription type',
    values: {
      [SubscriptionCommonFieldsClusterBillingModel.standard]:
        'Annual: Fixed capacity subscription from Red Hat',
      [SubscriptionCommonFieldsClusterBillingModel.marketplace]:
        'On-Demand: Flexible usage billed through Red Hat Marketplace',
      [SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp]:
        'On-Demand: Flexible usage billed through Google Cloud Marketplace',
      [STANDARD_TRIAL_BILLING_MODEL_TYPE]: 'Free trial (upgradeable)',
    },
  },
  byoc: {
    title: 'Infrastructure type',
    isBoolean: true,
    values: {
      true: 'Customer cloud subscription',
      false: 'Red Hat cloud account',
    },
  },
  disable_scp_checks: {
    title: 'AWS service control policy (SCP) checks',
    valueTransform: (value) => (value ? 'Disabled' : 'Enabled'),
  },
  cloud_provider: {
    title: 'Cloud provider',
    valueTransform: (value) => (value === 'gcp' ? 'Google Cloud' : value?.toUpperCase()),
  },
  [FieldId.GcpAuthType]: {
    title: 'Authentication type',
    valueTransform: (value) =>
      value === GCPAuthType.ServiceAccounts ? 'Service Account' : 'Workload Identity Federation',
  },
  [FieldId.GcpWifConfig]: {
    title: 'WIF configuration',
    valueTransform: (value) => value.display_name,
  },
  name: {
    title: 'Cluster name',
  },
  domain_prefix: {
    title: 'Domain prefix',
  },
  rosa_roles_provider_creation_mode: {
    title: 'Operator roles and OIDC provider mode',
  },
  byo_oidc_config_id: {
    title: 'OIDC Configuration ID',
  },
  byo_oidc_config_id_managed: {
    title: 'OIDC Configuration Type',
    isBoolean: true,
    values: {
      true: 'Red Hat managed',
      false: 'Self-managed',
    },
  },
  custom_operator_roles_prefix: {
    title: 'Operator roles prefix',
  },
  channel_group: {
    title: 'Channel group',
    valueTransform: (value) => createChannelGroupLabel(value),
  },
  cluster_version: {
    title: 'Version',
    valueTransform: (value) => getVersionNameWithChannel(value),
  },
  version_channel: {
    title: 'Channel',
  },
  hypershift: {
    title: 'Control plane',
    isBoolean: true,
    values: { true: 'Hosted architecture', false: 'Classic architecture' },
  },
  region: {
    title: 'Region',
  },
  multi_az: {
    title: 'Availability',
    isBoolean: true,
    values: {
      true: 'Multi-zone',
      false: 'Single zone',
    },
  },
  persistent_storage: {
    title: 'Persistent storage',
    valueTransform: (value) => {
      const humanized = humanizeValueWithUnitGiB(parseFloat(value));
      return `${humanized.value} GiB`;
    },
  },
  load_balancers: {
    title: 'Load balancers',
  },
  secure_boot: {
    title: 'Secure Boot support for Shielded VMs',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  enable_user_workload_monitoring: {
    title: 'User workload monitoring',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  upgrade_policy: {
    title: 'Update strategy',
    valueTransform: (value) => (value === 'manual' ? 'Individual updates' : 'Recurring updates'),
  },
  automatic_upgrade_schedule: {
    title: 'Recurring update schedule',
    valueTransform: (value) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const hours = [...Array(24).keys()].map((hour) => `${hour.toString().padStart(2, 0)}:00`);
      const [hour, day] = parseUpdateSchedule(value);
      return `Every ${days[day]} at ${hours[hour]} UTC`;
    },
  },
  node_drain_grace_period: {
    title: 'Node draining',
    valueTransform: (value) => `${value} minutes`,
  },
  etcd_encryption: {
    title: 'Additional etcd encryption',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  fips: {
    title: 'FIPS cryptography',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  etcd_key_arn: {
    title: 'Etcd encryption key ARN',
  },
  customer_managed_key: {
    title: 'Encrypt volumes with customer keys',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  kms_key_arn: {
    title: 'Custom KMS key ARN',
    isOptional: true,
  },
  network_configuration_toggle: {
    title: 'Networking',
    values: {
      basic: 'Basic',
      advanced: 'Advanced',
    },
  },
  machine_type: {
    title: 'Node instance type',
  },
  autoscalingEnabled: {
    title: 'Autoscaling',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  imds: {
    title: 'Instance Metadata Service (IMDS)',
    values: {
      [IMDSType.V1AndV2]: 'IMDSv1 and IMDSv2',
      [IMDSType.V2Only]: 'IMDSv2 only',
    },
  },
  nodes_compute: {
    title: 'Compute node count',
    valueTransform: (value, allValues) => {
      if (allValues.hypershift === 'true') {
        return String(Number(value) * allValues.machinePoolsSubnets.length);
      }
      if (allValues.multi_az === 'true') {
        return `${value} (× 3 zones = ${Number(value) * 3} compute nodes)`;
      }
      return value;
    },
  },
  worker_volume_size_gib: {
    title: 'Worker root disk size',
    valueTransform: (value) => `${value} GiB`,
  },
  min_replicas: {
    title: 'Compute node range',
    valueTransform: (value, allValues) => (
      <>
        <span>
          Minimum nodes
          {allValues.hypershift === 'true' ? ' per machine pool' : ''}
          {allValues.multi_az === 'true' && allValues.hypershift !== 'true' ? ' per zone' : ''}:
        </span>{' '}
        {value || 0}
        <span className="pf-v6-u-ml-lg">
          Maximum nodes
          {allValues.hypershift === 'true' ? ' per machine pool' : ''}
          {allValues.multi_az === 'true' && allValues.hypershift !== 'true' ? ' per zone' : ''}:
        </span>{' '}
        {allValues.max_replicas || 0}
      </>
    ),
  },
  node_labels: {
    title: 'Node labels',
    valueTransform: (labels) => (
      <LabelGroup>
        {labels.map((label) => (
          <Label key={label.key} color="blue" textMaxWidth="15em">
            {`${label.key} = ${label.value || ''}`}
          </Label>
        ))}
      </LabelGroup>
    ),
  },
  // For non-Hypershift
  install_to_vpc: {
    title: 'Install into existing VPC',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  // For Hypershift
  selected_vpc: {
    title: 'Install to selected VPC',
    valueTransform: (selectedVPC = {}) => selectedVPC.name || selectedVPC.id,
  },
  use_privatelink: {
    title: 'PrivateLink',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  shared_vpc: {
    title: 'Shared VPC settings',
    valueTransform: (sharedVpcSettings) => (
      <Grid>
        {/* Three columns to match the layout of VPC subnet settings */}
        <GridItem md={3}>
          <strong>Base DNS domain</strong>
        </GridItem>
        <GridItem md={3}>
          <strong>Private hosted zone ID</strong>
        </GridItem>
        <GridItem md={3}>
          <strong>Shared VPC role</strong>
        </GridItem>
        <GridItem />
        <GridItem md={3}>{sharedVpcSettings.base_dns_domain}</GridItem>
        <GridItem md={3}>{sharedVpcSettings.hosted_zone_id}</GridItem>
        <GridItem md={3}>{sharedVpcSettings.hosted_zone_role_arn}</GridItem>
        <GridItem />
      </Grid>
    ),
  },
  // For ROSA and OSD wizards
  aws_standalone_vpc: {
    title: 'VPC subnet settings',
    valueTransform: (value, allValues) => (
      <AwsVpcTable
        vpc={allValues.selected_vpc}
        machinePoolsSubnets={allValues.machinePoolsSubnets}
        hasPublicSubnets={!allValues.use_privatelink}
      />
    ),
  },
  aws_hosted_machine_pools: {
    title: 'Machine pools',
    valueTransform: (value, allValues) => {
      const fullMpSubnets = allValues.machinePoolsSubnets.map((mpSubnet) => {
        const privateSubnetInfo = allValues.selected_vpc.aws_subnets?.find(
          (vpcSubnet) => vpcSubnet.subnet_id === mpSubnet.privateSubnetId,
        );
        return {
          availabilityZone: privateSubnetInfo.availability_zone,
          privateSubnetId: privateSubnetInfo.subnet_id,
          publicSubnetId: '',
        };
      });
      return (
        <AwsVpcTable
          vpc={allValues.selected_vpc}
          machinePoolsSubnets={fullMpSubnets}
          hasPublicSubnets={false}
        />
      );
    },
  },
  cluster_privacy_public_subnet_id: {
    title: 'Public subnet',
    valueTransform: (publicSubnetId, allValues) => {
      const subnetInfo = allValues.selected_vpc.aws_subnets?.find(
        (vpcSubnet) => vpcSubnet.subnet_id === publicSubnetId,
      );
      return subnetInfo?.name || publicSubnetId;
    },
  },
  securityGroups: {
    title: 'Security groups',
    valueTransform: (formGroups, allValues) => (
      <SecurityGroupsTable
        vpcGroups={allValues.selected_vpc?.aws_security_groups || []}
        formGroups={formGroups}
        isHypershiftSelected={allValues.hypershift === 'true'}
      />
    ),
  },
  applicationIngress: {
    title: 'Application ingress',
    valueTransform: (value) => (value === 'default' ? 'Use default settings' : 'Custom settings'),
  },
  defaultRouterSelectors: {
    title: 'Route selectors',
    valueTransform: (value) =>
      value ? routeSelectorsAsString(strToKeyValueObject(value, '')) : 'None specified',
  },
  defaultRouterExcludedNamespacesFlag: {
    title: 'Excluded namespaces',
    valueTransform: (value) =>
      value ? arrayToString(stringToArrayTrimmed(value)) : 'None specified',
  },
  isDefaultRouterWildcardPolicyAllowed: {
    title: 'Wildcard policy',
    valueTransform: (value) => (value ? 'Allowed' : 'Disallowed'),
  },
  isDefaultRouterNamespaceOwnershipPolicyStrict: {
    title: 'Namespace ownership policy',
    valueTransform: (value) => (value ? 'Strict namespace ownership' : 'Inter-namespace ownership'),
  },
  gpc_vpc: {
    title: 'VPC subnet settings',
    valueTransform: (value, allValues) => {
      const isPscCluster =
        allValues.cluster_privacy === ClusterPrivacyType.Internal &&
        allValues.install_to_vpc &&
        allValues.private_service_connect;
      return (
        <Grid>
          <GridItem md={3}>
            <strong>Existing VPC name</strong>
          </GridItem>
          <GridItem md={3}>
            <strong>Control plane subnet name</strong>
          </GridItem>
          <GridItem md={3}>
            <strong>Compute subnet name</strong>
          </GridItem>
          {isPscCluster ? (
            <GridItem md={3}>
              <strong>Private Service Connect subnet name</strong>
            </GridItem>
          ) : (
            <GridItem md={3} />
          )}
          <GridItem md={3}>{allValues.vpc_name}</GridItem>
          <GridItem md={3}>{allValues.control_plane_subnet}</GridItem>
          <GridItem md={3}>{allValues.compute_subnet}</GridItem>
          {isPscCluster ? <GridItem md={3}>{allValues.psc_subnet}</GridItem> : <GridItem md={3} />}
        </Grid>
      );
    },
  },
  configure_proxy: {
    title: 'Cluster-wide proxy',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  private_service_connect: {
    title: 'Private service connect',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  http_proxy_url: {
    title: 'HTTP proxy URL',
    isOptional: true,
  },
  https_proxy_url: {
    title: 'HTTPS proxy URL',
    isOptional: true,
  },
  no_proxy_domains: {
    title: 'No Proxy domains',
    isOptional: true,
    valueTransform: (noProxyDomains) => (
      <LabelGroup>
        {/* eslint-disable-next-line react/destructuring-assignment */}
        {noProxyDomains.map((domain) => (
          <Label color="blue" isCompact textMaxWidth="15em">
            {domain}
          </Label>
        ))}
      </LabelGroup>
    ),
  },
  additional_trust_bundle: {
    title: 'Additional trust bundle',
    isMonospace: true,
    isOptional: true,
    isExpandable: true,
    initiallyExpanded: false,
  },
  network_machine_cidr: {
    title: 'Machine CIDR',
  },
  network_service_cidr: {
    title: 'Service CIDR',
  },
  network_pod_cidr: {
    title: 'Pod CIDR',
  },
  network_host_prefix: {
    title: 'Host prefix',
    valueTransform: (value) => (value?.includes('/') ? value : `/${value}`),
  },
  cluster_privacy: {
    title: 'Cluster privacy',
    values: {
      external: 'Public',
      internal: 'Private',
      undefined: 'Public',
    },
  },
  associated_aws_id: {
    title: 'AWS infrastructure account ID',
  },
  shared_host_project_id: {
    title: 'Google Cloud shared host project ID',
  },
  billing_account_id: {
    title: 'AWS billing account ID',
  },
  installer_role_arn: {
    title: 'Installer role',
  },
  support_role_arn: {
    title: 'Support role ARN',
  },
  worker_role_arn: {
    title: 'Compute role',
  },
  control_plane_role_arn: {
    title: 'Control plane role',
  },
  enable_external_authentication: {
    title: 'External Authentication',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
};

export default reviewValues;
