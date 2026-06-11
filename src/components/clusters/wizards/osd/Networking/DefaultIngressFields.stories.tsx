import React from 'react';
import { Formik, type FormikValues } from 'formik';

import { Form, Grid } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';

import { FieldId, initialValues } from '../constants';

import { DefaultIngressFields } from './DefaultIngressFields';

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
  /** Merged into OSD wizard `initialValues` for fields this component reads. */
  formValues?: Partial<FormikValues>;
  /** Cached result for {@link GCP_EXCLUDE_NAMESPACE_SELECTORS}. */
  excludeNamespaceSelectorsFeatureGate?: boolean;
};

/**
 * Renders {@link DefaultIngressFields} the same way as the OSD networking “Configuration” step
 * (Formik context + `Grid`); seeds react-query so `useFeatureGate` does not call the network.
 */
function DefaultIngressFieldsStoryShell({
  formValues = {},
  excludeNamespaceSelectorsFeatureGate = false,
}: StoryShellProps) {
  const queryClient = React.useMemo(
    () => buildQueryClient(excludeNamespaceSelectorsFeatureGate),
    [excludeNamespaceSelectorsFeatureGate],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Formik<FormikValues>
        initialValues={{
          ...initialValues,
          [FieldId.DefaultRouterSelectors]: '',
          ...formValues,
        }}
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

export const GcpFeatureGateOff: Story = {
  name: 'GCP (exclude-namespace selectors gate off)',
  args: {
    formValues: { [FieldId.CloudProvider]: CloudProviderType.Gcp },
    excludeNamespaceSelectorsFeatureGate: false,
  },
};

export const GcpExcludeNamespaceSelectors: Story = {
  name: 'GCP + exclude-namespace selectors',
  args: {
    formValues: { [FieldId.CloudProvider]: CloudProviderType.Gcp },
    excludeNamespaceSelectorsFeatureGate: true,
  },
};

export const AwsProviderGateOn: Story = {
  name: 'AWS (gate on; selectors hidden)',
  args: {
    formValues: { [FieldId.CloudProvider]: CloudProviderType.Aws },
    excludeNamespaceSelectorsFeatureGate: true,
  },
};
