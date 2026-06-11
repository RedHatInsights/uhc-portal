import React from 'react';
import { Formik } from 'formik';

import { getRandomID } from '~/common/helpers';
import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen, waitFor } from '~/testUtils';

import { DefaultIngressFieldsFormik } from './DefaultIngressFieldsFormik';

const protectedNamespaceSelectorValidationMessage =
  'Do not exclude openshift-console or openshift-authentication namespaces; they are vital to cluster operations.';

const defaultFormikValues = {
  defaultRouterSelectors: '',
  defaultRouterExcludedNamespacesFlag: '',
  defaultRouterExcludeNamespaceSelectors: [{ id: getRandomID(), key: '', value: '' }],
  isDefaultRouterNamespaceOwnershipPolicyStrict: true,
  isDefaultRouterWildcardPolicyAllowed: false,
  clusterRoutesTlsSecretRef: '',
  clusterRoutesHostname: '',
};

describe('DefaultIngressFieldsFormik – Exclude namespace selectors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureGate([]);
  });

  it('renders the exclude namespace selectors field when feature flag ON + GCP', async () => {
    mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);

    render(
      <Formik initialValues={defaultFormikValues} onSubmit={() => {}}>
        <DefaultIngressFieldsFormik isDay2 hasSufficientIngressEditVersion provider="gcp" />
      </Formik>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Exclude namespace selector values' }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Exclude namespace selectors')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add selector' })).toBeInTheDocument();
    expect(screen.getByText('Value(s) (comma-separated)')).toBeInTheDocument();
  });

  it('does NOT render when feature flag is OFF', () => {
    render(
      <Formik initialValues={defaultFormikValues} onSubmit={() => {}}>
        <DefaultIngressFieldsFormik isDay2 hasSufficientIngressEditVersion provider="gcp" />
      </Formik>,
    );

    expect(
      screen.queryByRole('textbox', { name: 'Exclude namespace selector values' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add selector' })).not.toBeInTheDocument();
  });

  it('does NOT render when provider is not GCP', () => {
    mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);

    render(
      <Formik initialValues={defaultFormikValues} onSubmit={() => {}}>
        <DefaultIngressFieldsFormik isDay2 hasSufficientIngressEditVersion provider="aws" />
      </Formik>,
    );

    expect(
      screen.queryByRole('textbox', { name: 'Exclude namespace selector values' }),
    ).not.toBeInTheDocument();
  });

  it('shows protected-namespace validation when entering openshift-console as a value', async () => {
    mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);
    const { user } = render(
      <Formik initialValues={defaultFormikValues} onSubmit={() => {}}>
        {({ values }) => (
          <DefaultIngressFieldsFormik
            isDay2
            hasSufficientIngressEditVersion
            provider="gcp"
            values={values}
          />
        )}
      </Formik>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Exclude namespace selector values' }),
      ).toBeInTheDocument();
    });

    const keyInput = screen.getByRole('textbox', { name: 'Exclude namespace selector key' });
    const valueInput = screen.getByRole('textbox', { name: 'Exclude namespace selector values' });

    await user.type(keyInput, 'env');
    await user.type(valueInput, 'openshift-console');

    await waitFor(() => {
      expect(screen.getByText(protectedNamespaceSelectorValidationMessage)).toBeInTheDocument();
    });
  });
});
