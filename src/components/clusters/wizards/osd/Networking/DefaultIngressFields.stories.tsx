import React from 'react';
import { Formik, type FormikTouched, type FormikValues } from 'formik';

import { Form, Grid } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';

import { FieldId, initialValues } from '../constants';

import { DefaultIngressFields } from './DefaultIngressFields';

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
  /** Merged into OSD wizard `initialValues` for fields this component reads. */
  formValues?: Partial<FormikValues>;
  /** Mark the first exclude-namespace selector row touched so validation renders in Storybook. */
  touchExcludeNamespaceSelectorFields?: boolean;
};

/**
 * Renders {@link DefaultIngressFields} the same way as the OSD networking “Configuration” step
 * (Formik context + `Grid`); seeds react-query so `useFeatureGate` does not call the network.
 */
function DefaultIngressFieldsStoryShell({
  formValues = {},
  touchExcludeNamespaceSelectorFields = false,
}: StoryShellProps) {
  const queryClient = React.useMemo(() => buildQueryClient(), []);

  const initialTouched: FormikTouched<FormikValues> | undefined =
    touchExcludeNamespaceSelectorFields
      ? {
          [FieldId.DefaultRouterExcludeNamespaceSelectors]: [{ key: true, value: true }],
        }
      : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <Formik<FormikValues>
        initialValues={{
          ...initialValues,
          [FieldId.DefaultRouterSelectors]: '',
          ...formValues,
        }}
        initialTouched={initialTouched}
        validateOnMount={touchExcludeNamespaceSelectorFields}
        onSubmit={() => undefined}
      >
        <Form noValidate>
          <Grid hasGutter>
            <DefaultIngressFields />
          </Grid>
        </Form>
      </Formik>
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Wizards/OSD/Networking/Application Ingress Custom Settings',
  component: DefaultIngressFieldsStoryShell,
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 2em', maxWidth: '56rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DefaultIngressFieldsStoryShell>;

export default meta;

type Story = StoryObj<typeof DefaultIngressFieldsStoryShell>;

export const Default: Story = {
  name: 'Default (empty selector row)',
};

export const WithSelectors: Story = {
  name: 'Multiple selectors (single + CSV values)',
  args: {
    formValues: {
      [FieldId.DefaultRouterExcludeNamespaceSelectors]: [
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
      [FieldId.DefaultRouterExcludeNamespaceSelectors]: [
        { id: '1', key: 'kubernetes.io/metadata.name', value: 'openshift-console' },
      ],
    },
    touchExcludeNamespaceSelectorFields: true,
  },
};
