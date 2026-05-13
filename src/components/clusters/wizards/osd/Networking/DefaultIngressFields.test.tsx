import React from 'react';
import { Formik, FormikValues } from 'formik';

import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen, waitFor, within } from '~/testUtils';

import { FieldId, initialValues } from '../constants';

import { DefaultIngressFields } from './DefaultIngressFields';

const protectedNamespaceSelectorValidationMessage =
  'Do not exclude openshift-console or openshift-authentication namespaces; they are vital to cluster operations.';

const renderWithFormik = (values?: Partial<FormikValues>) =>
  render(
    <Formik initialValues={{ ...initialValues, ...values }} onSubmit={() => {}}>
      <DefaultIngressFields />
    </Formik>,
  );

describe('DefaultIngressFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureGate([]);
  });

  describe('Exclude namespace selectors (GCP + feature gate)', () => {
    it('renders the field group, label help popover, and key/value UI when the gate is on and provider is GCP', async () => {
      const useFeatureGateSpy = mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);
      renderWithFormik({ [FieldId.CloudProvider]: CloudProviderType.Gcp });

      expect(useFeatureGateSpy).toHaveBeenCalledWith(GCP_EXCLUDE_NAMESPACE_SELECTORS);

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: 'Exclude namespace selector values' }),
        ).toBeInTheDocument();
      });
      const excludeSelectorsSection = screen.getByTestId(
        'default-ingress-exclude-namespace-selectors',
      );
      expect(
        within(excludeSelectorsSection).getByRole('button', { name: 'More information' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add selector' })).toBeInTheDocument();
      expect(screen.getByText('Values (comma-separated)')).toBeInTheDocument();
    });

    it('shows protected-namespace validation after entering openshift-console as a selector value', async () => {
      mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);
      const { user } = renderWithFormik({ [FieldId.CloudProvider]: CloudProviderType.Gcp });

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

    it('does not render the exclude-namespace selectors block when the feature gate is off', () => {
      renderWithFormik({ [FieldId.CloudProvider]: CloudProviderType.Gcp });

      expect(
        screen.queryByRole('textbox', { name: 'Exclude namespace selector values' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add selector' })).not.toBeInTheDocument();
    });

    it('does not render the block when the gate is on but the cloud provider is not GCP', () => {
      mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);
      renderWithFormik({ [FieldId.CloudProvider]: CloudProviderType.Aws });

      expect(
        screen.queryByRole('textbox', { name: 'Exclude namespace selector values' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add selector' })).not.toBeInTheDocument();
    });
  });
});
