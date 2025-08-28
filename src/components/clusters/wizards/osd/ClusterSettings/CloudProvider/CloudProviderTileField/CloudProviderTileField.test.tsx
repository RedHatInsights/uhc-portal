import * as React from 'react';
import { Form, Formik } from 'formik';

import { CloudProviderType } from '~/components/clusters/wizards/common';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import {
  FieldId,
  initialValues as defaultValues,
} from '~/components/clusters/wizards/osd/constants';
import { checkAccessibility, fireEvent, render, screen, waitFor } from '~/testUtils';
import { SubscriptionCommonFieldsCluster_billing_model as BillingModel } from '~/types/accounts_mgmt.v1';

import { CloudProviderTileField } from './CloudProviderTileField';

jest.mock('~/components/clusters/wizards/osd/BillingModel/useGetBillingQuotas', () => ({
  useGetBillingQuotas: () => ({
    gcpResources: true,
    awsResources: true,
  }),
}));

const expectCloudProviderToBe = (submitFn: jest.Mock, value: string) => {
  expect(submitFn).toHaveBeenCalledWith(
    expect.objectContaining({
      [FieldId.CloudProvider]: value,
    }),
    expect.anything(),
  );
};

describe('<CloudProviderTileField />', () => {
  const awsLabel = 'Amazon Web Service logo Run on Amazon Web Services';
  const gcpLabel = 'Run on Google Cloud Platform';

  it('is accessible', async () => {
    const { container } = render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <CloudProviderTileField />
      </Formik>,
    );

    await checkAccessibility(container);
  });

  it('shows AWS and GCP options with GCP as default selection', async () => {
    render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <Form>
          <CloudProviderTileField />
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('radio', { name: gcpLabel })).toHaveAttribute('checked');
    expect(screen.getByRole('radio', { name: awsLabel })).not.toHaveAttribute('checked');
  });

  it('allows changing provider', async () => {
    const handleSubmit = jest.fn();
    const { user } = render(
      <Formik initialValues={defaultValues} onSubmit={handleSubmit}>
        <Form>
          <CloudProviderTileField />
          <button type="submit">Submit</button>
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('radio', { name: awsLabel })).not.toHaveAttribute('checked');

    // The radio button we are targeting here that is used for selection is hidden so we need to use fireEvent
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.click(screen.getByRole('radio', { name: awsLabel }));

    await waitFor(() =>
      expect(screen.getByRole('radio', { name: awsLabel })).toHaveProperty('checked'),
    );

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expectCloudProviderToBe(handleSubmit, CloudProviderType.Aws));
  });
});

describe('CloudProviderTileField visibility logic based on billing model and GCP auth type', () => {
  it('hides AWS tile when billing model is "On-demand: Flexible usage billed through the Google Cloud Marketplace"', () => {
    const customValues = {
      ...defaultValues,
      [FieldId.BillingModel]: BillingModel.marketplace_gcp,
    };
    render(
      <Formik initialValues={customValues} onSubmit={() => {}}>
        <Form>
          <CloudProviderTileField />
        </Form>
      </Formik>,
    );

    expect(screen.getByText(/run on google cloud platform/i)).toBeInTheDocument();
  });

  it('shows both AWS and GCP tiles when billing model is "Annual: Fixed capacity subscription from Red Hat" and "GCP auth is Service Accounts"', () => {
    const customValues = {
      ...defaultValues,
      [FieldId.BillingModel]: BillingModel.standard,
      [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
    };
    render(
      <Formik initialValues={customValues} onSubmit={() => {}}>
        <Form>
          <CloudProviderTileField />
        </Form>
      </Formik>,
    );

    expect(screen.getByText(/run on amazon web services/i)).toBeInTheDocument();
    expect(screen.getByText(/run on google cloud platform/i)).toBeInTheDocument();
  });
});
