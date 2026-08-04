import React from 'react';
import { Form, Formik } from 'formik';

import { FieldId, initialValues } from '~/components/clusters/wizards/rosa/constants';
import { render, screen, waitFor } from '~/testUtils';

import { AmazonS3LogForwarding } from './AmazonS3LogForwarding';

jest.mock('./LogForwardingGroupsApplicationsSelector', () => ({
  LogForwardingGroupsApplicationsSelector: () => (
    <div data-testid="log-forwarding-groups-applications-selector" />
  ),
}));

const renderS3 = (formValues: Record<string, unknown> = {}) => {
  const { user, ...rest } = render(
    <Formik
      initialValues={{
        ...initialValues,
        ...formValues,
      }}
      onSubmit={jest.fn()}
    >
      <Form noValidate>
        <AmazonS3LogForwarding />
      </Form>
    </Formik>,
  );
  return { user, ...rest };
};

describe('<AmazonS3LogForwarding />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the enable checkbox and hides S3 fields when disabled', () => {
    renderS3({ [FieldId.LogForwardingS3Enabled]: false });

    expect(screen.getByRole('heading', { name: 'Amazon S3' })).toBeInTheDocument();
    expect(screen.getByLabelText('Enable Amazon S3')).toBeInTheDocument();
    expect(screen.queryByLabelText('Bucket name')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('log-forwarding-groups-applications-selector'),
    ).not.toBeInTheDocument();
  });

  it('shows bucket fields and groups selector when S3 is enabled', async () => {
    const { user } = renderS3({ [FieldId.LogForwardingS3Enabled]: false });

    await user.click(screen.getByLabelText('Enable Amazon S3'));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /Bucket name/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('textbox', { name: /Bucket prefix/i })).toBeInTheDocument();
    expect(screen.getByTestId('log-forwarding-groups-applications-selector')).toBeInTheDocument();
  });
});
