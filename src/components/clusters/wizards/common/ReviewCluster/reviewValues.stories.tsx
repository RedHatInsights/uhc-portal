import React from 'react';
import type { FormikValues } from 'formik';

import { DescriptionList, Grid, GridItem, Title } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import { getRandomID } from '~/common/helpers';
import { STANDARD_TRIAL_BILLING_MODEL_TYPE } from '~/common/subscriptionTypes';
import {
  HOST_PREFIX_DEFAULT,
  MACHINE_CIDR_DEFAULT,
  POD_CIDR_DEFAULT,
  SERVICE_CIDR_DEFAULT,
} from '~/components/clusters/common/networkingConstants';
import { FieldId, IMDSType } from '~/components/clusters/wizards/common/constants';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import {
  ApplicationIngressType,
  ClusterPrivacyType,
} from '~/components/clusters/wizards/osd/Networking/constants';
import { SubscriptionCommonFieldsCluster_billing_model as ClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { ReviewItem } from './ReviewSection';
import reviewValues from './reviewValues';

const TRUST_BUNDLE_SNIPPET = `-----BEGIN CERTIFICATE-----
MIICdzCCAeCgAwIBAgIBATANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJVUzAe
Fw0yNjAxMDEwMDAwMDBaFw0zNjAxMDEwMDAwMDBaMA0xCzAJBgNVBAYTAlVTMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAfixture
-----END CERTIFICATE-----`;

const listOptions = {
  orientation: {
    sm: 'horizontal' as const,
  },
};

/**
 * Form values shaped like ROSA/OSD wizard `values` so every `reviewValues` entry can render.
 * Hypershift is off here so classic AWS VPC + security group review paths are exercised.
 */
const buildFullReviewFormValues = (): FormikValues => {
  const privateSubnetId = 'subnet-0privateaaaaaaaa';
  const publicSubnetId = 'subnet-0publicbbbbbbbb';
  return {
    billing_model: ClusterBillingModel.marketplace_gcp,
    byoc: 'true',
    disable_scp_checks: true,
    cloud_provider: 'aws',
    [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
    [FieldId.GcpWifConfig]: { display_name: 'demo-wif-config-pool' },
    name: 'demo-cluster',
    domain_prefix: 'apps',
    rosa_roles_provider_creation_mode: 'auto',
    byo_oidc_config_id: 'ocm-oidc-config-demo',
    byo_oidc_config_id_managed: 'true',
    custom_operator_roles_prefix: 'demo-prefix',
    channel_group: 'eus',
    cluster_version: {
      id: 'openshift-v4.16.5',
      raw_id: '4.16.5',
      channel_group: 'candidate',
      available_channels: ['candidate-4.16', 'fast-4.16', 'stable-4.16'],
    },
    version_channel: 'candidate-4.16',
    hypershift: 'false',
    region: 'us-east-1',
    multi_az: 'true',
    persistent_storage: '107374182400',
    load_balancers: 8,
    secure_boot: 'true',
    enable_user_workload_monitoring: 'true',
    upgrade_policy: 'automatic',
    automatic_upgrade_schedule: '0 14 * * WED',
    node_drain_grace_period: 45,
    etcd_encryption: 'true',
    fips: 'true',
    etcd_key_arn: 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    customer_managed_key: 'true',
    kms_key_arn: 'arn:aws:kms:us-east-1:123456789012:key/00000000-1111-2222-3333-444444444444',
    network_configuration_toggle: 'advanced',
    machine_type: { id: 'm5.2xlarge' },
    autoscalingEnabled: 'true',
    imds: IMDSType.V2Only,
    nodes_compute: '3',
    worker_volume_size_gib: '500',
    min_replicas: 3,
    max_replicas: 12,
    node_labels: [
      { key: 'node-role.kubernetes.io/worker', value: '' },
      { key: 'environment', value: 'staging' },
    ],
    install_to_vpc: 'true',
    selected_vpc: {
      id: 'vpc-0abcd1234efgh5678',
      name: 'ocm-demo-vpc',
      aws_subnets: [
        {
          subnet_id: privateSubnetId,
          name: 'private-subnet-us-east-1a',
          availability_zone: 'us-east-1a',
        },
        {
          subnet_id: publicSubnetId,
          name: 'public-subnet-us-east-1a',
          availability_zone: 'us-east-1a',
        },
      ],
      aws_security_groups: [
        { id: 'sg-controlplane01', name: 'additional-control-plane' },
        { id: 'sg-infra00000001', name: 'additional-infra' },
        { id: 'sg-worker00000001', name: 'additional-worker' },
      ],
    },
    use_privatelink: 'false',
    shared_vpc: {
      base_dns_domain: 'shared.example.com',
      hosted_zone_id: 'Z1234567890ABC',
      hosted_zone_role_arn: 'arn:aws:iam::111122223333:role/shared-vpc-role',
    },
    aws_standalone_vpc: true,
    aws_hosted_machine_pools: true,
    cluster_privacy_public_subnet_id: publicSubnetId,
    securityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-controlplane01'],
      infra: ['sg-infra00000001'],
      worker: ['sg-worker00000001'],
    },
    applicationIngress: ApplicationIngressType.Custom,
    defaultRouterSelectors: 'route=external,shard=blue',
    defaultRouterExcludedNamespacesFlag: 'kube-system, openshift-monitoring ',
    defaultRouterExcludeNamespaceSelectors: [
      {
        id: getRandomID(),
        key: 'kubernetes.io/metadata.name',
        value: 'openshift-ingress, default',
      },
      { id: getRandomID(), key: 'env', value: ' dev , staging ' },
    ],
    isDefaultRouterWildcardPolicyAllowed: true,
    isDefaultRouterNamespaceOwnershipPolicyStrict: false,
    gpc_vpc: true,
    configure_proxy: 'true',
    private_service_connect: true,
    http_proxy_url: 'http://proxy.internal.example.com:8080',
    https_proxy_url: 'https://secure-proxy.internal.example.com:8443',
    no_proxy_domains: ['.cluster.local', '.svc', '169.254.169.254'],
    additional_trust_bundle: `${TRUST_BUNDLE_SNIPPET}\n${TRUST_BUNDLE_SNIPPET}`,
    network_machine_cidr: MACHINE_CIDR_DEFAULT,
    network_service_cidr: SERVICE_CIDR_DEFAULT,
    network_pod_cidr: POD_CIDR_DEFAULT,
    network_host_prefix: HOST_PREFIX_DEFAULT,
    cluster_privacy: ClusterPrivacyType.Internal,
    associated_aws_id: '123456789012',
    shared_host_project_id: 'shared-host-project-123',
    dns_zone: {
      id: 'dns-zone-ocm-demo',
      gcp: { domain_prefix: 'apps', project_id: 'gcp-billing-project-456' },
    },
    billing_account_id: '987654321098',
    installer_role_arn: 'arn:aws:iam::123456789012:role/ocm-installer-demo',
    support_role_arn: 'arn:aws:iam::123456789012:role/ocm-support-demo',
    worker_role_arn: 'arn:aws:iam::123456789012:role/ocm-worker-demo',
    control_plane_role_arn: 'arn:aws:iam::123456789012:role/ocm-control-plane-demo',
    enable_external_authentication: 'true',
    machinePoolsSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId,
        publicSubnetId,
      },
    ],
    vpc_name: 'existing-gcp-vpc-name',
    control_plane_subnet: 'gcp-control-plane-subnet',
    compute_subnet: 'gcp-compute-subnet',
    psc_subnet: 'gcp-psc-subnet',
  };
};

const reviewFieldKeys = Object.keys(reviewValues) as (keyof typeof reviewValues)[];

const ReviewValuesCatalog = () => {
  const formValues = buildFullReviewFormValues();
  return (
    <Grid hasGutter>
      <GridItem span={12}>
        <Title headingLevel="h2">Review values catalog</Title>
        <p className="pf-v6-u-color-text-200 pf-v6-u-mb-md">
          Every entry from <code>reviewValues.jsx</code> rendered through <code>ReviewItem</code>{' '}
          using a single rich fixture.
        </p>
        <DescriptionList isHorizontal {...listOptions}>
          {reviewFieldKeys.map((fieldKey) => (
            <ReviewItem key={String(fieldKey)} name={String(fieldKey)} formValues={formValues} />
          ))}
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

const meta: Meta<typeof ReviewValuesCatalog> = {
  title: 'Wizards/ReviewCluster/reviewValues',
  component: ReviewValuesCatalog,
  decorators: [
    (Story) => (
      <div style={{ margin: '1rem', maxWidth: '960px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ReviewValuesCatalog>;

export const AllConfiguredRows: Story = {
  name: 'All review rows (fixture)',
  render: () => <ReviewValuesCatalog />,
};

/** Highlights alternate billing label strings from `reviewValues.billing_model.values`. */
export const BillingModelShowcase: Story = {
  name: 'Billing model labels',
  render: () => {
    const base = buildFullReviewFormValues();
    const models: Array<{ label: string; billingModel: string }> = [
      { label: 'Standard', billingModel: ClusterBillingModel.standard },
      { label: 'Marketplace (RHM)', billingModel: ClusterBillingModel.marketplace },
      { label: 'Marketplace AWS', billingModel: ClusterBillingModel.marketplace_aws },
      { label: 'Marketplace GCP', billingModel: ClusterBillingModel.marketplace_gcp },
      { label: 'Free trial', billingModel: STANDARD_TRIAL_BILLING_MODEL_TYPE },
    ];
    return (
      <Grid hasGutter>
        {models.map(({ label, billingModel }) => (
          <GridItem span={12} key={billingModel}>
            <Title headingLevel="h3">{label}</Title>
            <DescriptionList isHorizontal {...listOptions}>
              <ReviewItem
                name="billing_model"
                formValues={{ ...base, billing_model: billingModel }}
              />
            </DescriptionList>
          </GridItem>
        ))}
      </Grid>
    );
  },
};
