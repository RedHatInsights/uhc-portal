import React from 'react';
import { Formik, type FormikValues } from 'formik';

import { Form } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';

import { DefaultIngressFieldsFormik } from './DefaultIngressFieldsFormik';

const FEATURE_GATE_QUERY_KEY = 'featureGate' as const;

function buildQueryClient(excludeNamespaceSelectorsEnabled: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData([FEATURE_GATE_QUERY_KEY, GCP_EXCLUDE_NAMESPACE_SELECTORS], {
    data: { enabled: excludeNamespaceSelectorsEnabled },
  });
  return queryClient;
}

type StoryShellProps = {
  formValues?: Partial<FormikValues>;
  excludeNamespaceSelectorsFeatureGate?: boolean;
  provider?: string;
  isDay2?: boolean;
  isHypershiftCluster?: boolean;
};

const defaultFormValues: FormikValues = {
  default_router_address: 'apps.osd-gcp-1.devshift.org',
  private_default_router: false,
  defaultRouterSelectors: '',
  defaultRouterExcludedNamespacesFlag: '',
  defaultRouterExcludeNamespaceSelectors: [{ id: '1', key: '', value: '' }],
  isDefaultRouterNamespaceOwnershipPolicyStrict: false,
  isDefaultRouterWildcardPolicyAllowed: false,
  clusterRoutesTlsSecretRef: '',
  clusterRoutesHostname: '',
};

function DefaultIngressFieldsFormikStoryShell({
  formValues = {},
  excludeNamespaceSelectorsFeatureGate = false,
  provider = CloudProviderType.Gcp,
  isDay2 = true,
  isHypershiftCluster = false,
}: StoryShellProps) {
  const queryClient = React.useMemo(
    () => buildQueryClient(excludeNamespaceSelectorsFeatureGate),
    [excludeNamespaceSelectorsFeatureGate],
  );

  const mergedValues = { ...defaultFormValues, ...formValues };

  return (
    <QueryClientProvider client={queryClient}>
      <Formik<FormikValues> initialValues={mergedValues} onSubmit={() => undefined}>
        {({ values }) => (
          <Form noValidate>
            <DefaultIngressFieldsFormik
              isDay2={isDay2}
              hasSufficientIngressEditVersion
              provider={provider}
              isHypershiftCluster={isHypershiftCluster}
              values={values}
            />
          </Form>
        )}
      </Formik>
    </QueryClientProvider>
  );
}

const meta = {
  title: 'ClusterDetails/Networking/DefaultIngressFieldsFormik',
  component: DefaultIngressFieldsFormikStoryShell,
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 2em', maxWidth: '56rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DefaultIngressFieldsFormikStoryShell>;

export default meta;

type Story = StoryObj<typeof DefaultIngressFieldsFormikStoryShell>;

export const GcpExcludeNamespaceSelectorsOn: Story = {
  name: 'Day 2 GCP + exclude-namespace selectors gate ON',
  args: {
    provider: CloudProviderType.Gcp,
    excludeNamespaceSelectorsFeatureGate: true,
  },
};

export const GcpExcludeNamespaceSelectorsOff: Story = {
  name: 'Day 2 GCP + exclude-namespace selectors gate OFF',
  args: {
    provider: CloudProviderType.Gcp,
    excludeNamespaceSelectorsFeatureGate: false,
  },
};

export const AwsGateOn: Story = {
  name: 'Day 2 AWS (gate on; selectors hidden)',
  args: {
    provider: CloudProviderType.Aws,
    excludeNamespaceSelectorsFeatureGate: true,
  },
};

export const GcpWithPrefilledSelectors: Story = {
  name: 'Day 2 GCP + pre-filled selectors',
  args: {
    provider: CloudProviderType.Gcp,
    excludeNamespaceSelectorsFeatureGate: true,
    formValues: {
      defaultRouterExcludeNamespaceSelectors: [
        { id: '1', key: 'department', value: 'finance,HR' },
        { id: '2', key: 'type', value: 'customer' },
      ],
    },
  },
};
