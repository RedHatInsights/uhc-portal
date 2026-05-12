import React from 'react';
import { Formik, type FormikValues } from 'formik';

import { Form } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';

import { DefaultIngressFieldsFormik } from './DefaultIngressFieldsFormik';

const FEATURE_GATE_QUERY_KEY = 'featureGate' as const;

function buildQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData([FEATURE_GATE_QUERY_KEY, GCP_EXCLUDE_NAMESPACE_SELECTORS], {
    data: { enabled: true },
  });
  return queryClient;
}

type StoryShellProps = {
  formValues?: Partial<FormikValues>;
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

function DefaultIngressFieldsFormikStoryShell({ formValues = {} }: StoryShellProps) {
  const queryClient = React.useMemo(() => buildQueryClient(), []);
  const mergedValues = { ...defaultFormValues, ...formValues };

  return (
    <QueryClientProvider client={queryClient}>
      <Formik<FormikValues> initialValues={mergedValues} onSubmit={() => undefined}>
        {({ values }) => (
          <Form noValidate>
            <DefaultIngressFieldsFormik
              isDay2
              hasSufficientIngressEditVersion
              provider={CloudProviderType.Gcp}
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

export const Default: Story = {
  name: 'Default (empty selector row)',
};

export const WithSelectors: Story = {
  name: 'Multiple selectors (single + CSV values)',
  args: {
    formValues: {
      defaultRouterExcludeNamespaceSelectors: [
        { id: '1', key: 'department', value: 'finance,HR' },
        { id: '2', key: 'type', value: 'customer' },
      ],
    },
  },
};

export const ProtectedNamespaceValidation: Story = {
  name: 'Validation: protected namespace (openshift-console)',
  args: {
    formValues: {
      defaultRouterExcludeNamespaceSelectors: [
        { id: '1', key: 'kubernetes.io/metadata.name', value: 'openshift-console' },
      ],
    },
  },
};
