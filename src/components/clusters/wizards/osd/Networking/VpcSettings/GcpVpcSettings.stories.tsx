import React from 'react';
import { Formik, type FormikValues } from 'formik';
import { Provider } from 'react-redux';

import { Form, Grid, GridItem, Title } from '@patternfly/react-core';
import { configureStore } from '@reduxjs/toolkit';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { FieldId, initialValues } from '~/components/clusters/wizards/osd/constants';
import { ClusterPrivacyType } from '~/components/clusters/wizards/osd/Networking/constants';
import {
  GCP_BYO_FIREWALL_RULES,
  GCP_DNS_ZONE,
} from '~/queries/featureGates/featureConstants';
import type { GcpFirewallRule } from '~/types/clusters_mgmt.v1';

import { GcpVpcSettings } from './GcpVpcSettings';

const FEATURE_GATE_QUERY_KEY = 'featureGate' as const;

const MOCK_WIF_CONFIG = {
  id: 'dc-wif-5',
  display_name: 'demo-wif-config',
  gcp: { project_id: 'my-service-project' },
};

const MOCK_FIREWALL_RULES: GcpFirewallRule[] = [
  {
    id: 'fw-1',
    name: 'prod-byo-firewall',
    profile: 'public',
    wif_config: { id: MOCK_WIF_CONFIG.id },
    gcp_network: {
      project_id: 'my-host-project',
      vpc_name: 'ocmdev-shared-vpc',
    },
  },
  {
    id: 'fw-2',
    name: 'staging-fw-rules',
    profile: 'public',
    wif_config: { id: MOCK_WIF_CONFIG.id },
    gcp_network: {
      project_id: 'my-host-project',
      vpc_name: 'ocmdev-shared-vpc',
    },
  },
  {
    id: 'fw-private-1',
    name: 'prod-byo-firewall-private',
    profile: 'private',
    wif_config: { id: MOCK_WIF_CONFIG.id },
    gcp_network: {
      project_id: 'my-host-project',
      vpc_name: 'ocmdev-shared-vpc',
    },
  },
];

const baseFirewallFormValues: Partial<FormikValues> = {
  [FieldId.CloudProvider]: CloudProviderType.Gcp,
  [FieldId.Byoc]: 'true',
  [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
  [FieldId.GcpWifConfig]: MOCK_WIF_CONFIG,
  [FieldId.ClusterVersion]: { raw_id: '4.21.0' },
  [FieldId.InstallToVpc]: true,
  [FieldId.InstallToSharedVpc]: true,
  [FieldId.SharedHostProjectID]: 'my-host-project',
  [FieldId.VpcName]: 'ocmdev-shared-vpc',
  [FieldId.ControlPlaneSubnet]: 'control-plane-subnet',
  [FieldId.ComputeSubnet]: 'compute-subnet',
  [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
  [FieldId.PrivateServiceConnect]: false,
  [FieldId.FirewallRules]: { id: '' },
};

function buildQueryClient(options?: {
  isFirewallRulesEnabled?: boolean;
  isDnsZoneEnabled?: boolean;
  firewallRules?: GcpFirewallRule[];
}) {
  const {
    isFirewallRulesEnabled = true,
    isDnsZoneEnabled = false,
    firewallRules = MOCK_FIREWALL_RULES,
  } = options ?? {};

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  queryClient.setQueryData([FEATURE_GATE_QUERY_KEY, GCP_BYO_FIREWALL_RULES], {
    data: { enabled: isFirewallRulesEnabled },
  });
  queryClient.setQueryData([FEATURE_GATE_QUERY_KEY, GCP_DNS_ZONE], {
    data: { enabled: isDnsZoneEnabled },
  });

  // Seed both profiles so Private+PSC stories do not hit the network.
  queryClient.setQueryData(['gcpFirewallRules', 'public'], {
    data: { items: firewallRules.filter((rule) => rule.profile !== 'private') },
  });
  queryClient.setQueryData(['gcpFirewallRules', 'private'], {
    data: { items: firewallRules.filter((rule) => rule.profile === 'private') },
  });

  return queryClient;
}

function buildStore() {
  return configureStore({
    reducer: {
      userProfile: () => ({
        organization: {
          details: { id: 'storybook-org-1' },
        },
      }),
      ccsInquiries: () => ({
        vpcs: {
          pending: false,
          fulfilled: true,
          error: false,
          cloudProvider: CloudProviderType.Gcp,
          credentials: undefined,
          region: 'us-east1',
          data: {
            items: [
              {
                name: 'prod-us-east1-vpc',
                subnets: [
                  { name: 'control-plane-subnet' },
                  { name: 'compute-subnet' },
                  { name: 'psc-subnet' },
                ],
              },
            ],
          },
        },
      }),
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });
}

type StoryShellProps = {
  formValues?: Partial<FormikValues>;
  isFirewallRulesEnabled?: boolean;
  isDnsZoneEnabled?: boolean;
  firewallRules?: GcpFirewallRule[];
};

/**
 * Renders the OSD GCP VPC settings screen (same Form + Grid shell as {@link VpcSettings})
 * with seeded feature gates and firewall-rules query cache so Storybook does not call the network.
 */
function GcpVpcSettingsStoryShell({
  formValues = {},
  isFirewallRulesEnabled = true,
  isDnsZoneEnabled = false,
  firewallRules = MOCK_FIREWALL_RULES,
}: StoryShellProps) {
  const store = React.useMemo(() => buildStore(), []);
  const queryClient = React.useMemo(
    () =>
      buildQueryClient({
        isFirewallRulesEnabled,
        isDnsZoneEnabled,
        firewallRules,
      }),
    [isFirewallRulesEnabled, isDnsZoneEnabled, firewallRules],
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Formik<FormikValues>
          initialValues={{
            ...initialValues,
            ...baseFirewallFormValues,
            ...formValues,
          }}
          enableReinitialize
          onSubmit={() => undefined}
        >
          <Form noValidate>
            <Grid hasGutter>
              <GridItem>
                <Title headingLevel="h3">Virtual Private Cloud (VPC) subnet settings</Title>
              </GridItem>
              <GcpVpcSettings />
            </Grid>
          </Form>
        </Formik>
      </QueryClientProvider>
    </Provider>
  );
}

const meta = {
  title: 'Wizards/OSD/Networking/VPC Settings (GCP Firewall Rules)',
  component: GcpVpcSettingsStoryShell,
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 2em', maxWidth: '56rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GcpVpcSettingsStoryShell>;

export default meta;

type Story = StoryObj<typeof GcpVpcSettingsStoryShell>;

export const SharedVpcWithFirewallRules: Story = {
  name: 'Shared VPC — Firewall Rules (empty selection)',
};

export const SharedVpcWithSelectedFirewallRules: Story = {
  name: 'Shared VPC — Firewall Rules selected',
  args: {
    formValues: {
      [FieldId.FirewallRules]: MOCK_FIREWALL_RULES[0],
    },
  },
};

export const SharedVpcPrivateServiceConnect: Story = {
  name: 'Shared VPC — Private + PSC (private profile CLI)',
  args: {
    formValues: {
      [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
      [FieldId.PrivateServiceConnect]: true,
      [FieldId.PSCSubnet]: 'psc-subnet',
      [FieldId.FirewallRules]: MOCK_FIREWALL_RULES[2],
    },
  },
};

export const SharedVpcWithDnsZoneAndFirewallRules: Story = {
  name: 'Shared VPC — DNS Zone + Firewall Rules',
  args: {
    isDnsZoneEnabled: true,
    formValues: {
      [FieldId.HasDomainPrefix]: true,
      [FieldId.DomainPrefix]: 'apps',
      [FieldId.DnsZone]: { id: '' },
      [FieldId.FirewallRules]: MOCK_FIREWALL_RULES[0],
    },
  },
};

export const VersionBelowGate: Story = {
  name: 'OpenShift 4.20 — Firewall Rules hidden',
  args: {
    formValues: {
      [FieldId.ClusterVersion]: { raw_id: '4.20.0' },
    },
  },
};

export const FeatureGateDisabled: Story = {
  name: 'Feature gate disabled — Firewall Rules hidden',
  args: {
    isFirewallRulesEnabled: false,
  },
};

export const NoMatchingFirewallRules: Story = {
  name: 'No matching firewall rules',
  args: {
    firewallRules: [],
  },
};
