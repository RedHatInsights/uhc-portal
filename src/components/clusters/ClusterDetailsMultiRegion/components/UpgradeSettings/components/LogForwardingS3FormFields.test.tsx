import React from 'react';
import { Form, Formik } from 'formik';

import { render, screen } from '~/testUtils';

import { LogForwardingS3FormFields } from './LogForwardingS3FormFields';

jest.mock('./ClusterLogForwardingGroupsApplicationsSelector', () => ({
  ClusterLogForwardingGroupsApplicationsSelector: ({ name }: { name: string }) => (
    <div data-testid="cluster-log-forwarding-selector" data-name={name} />
  ),
}));

const renderFields = () =>
  render(
    <Formik
      initialValues={{ bucketName: '', bucketPrefix: '', selectedItems: [] }}
      onSubmit={jest.fn()}
    >
      <Form noValidate>
        <LogForwardingS3FormFields />
      </Form>
    </Formik>,
  );

describe('LogForwardingS3FormFields', () => {
  it('renders bucket fields and the groups/applications selector', () => {
    renderFields();

    expect(screen.getByRole('textbox', { name: /Bucket name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Bucket prefix/i })).toBeInTheDocument();
    expect(screen.getByTestId('cluster-log-forwarding-selector')).toHaveAttribute(
      'data-name',
      'selectedItems',
    );
  });

  it('supports custom field names', () => {
    render(
      <Formik
        initialValues={{ customBucket: '', customPrefix: '', customItems: [] }}
        onSubmit={jest.fn()}
      >
        <Form noValidate>
          <LogForwardingS3FormFields
            bucketNameField="customBucket"
            bucketPrefixField="customPrefix"
            selectedItemsField="customItems"
          />
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('textbox', { name: /Bucket name/i })).toHaveAttribute(
      'id',
      'customBucket',
    );
    expect(screen.getByRole('textbox', { name: /Bucket prefix/i })).toHaveAttribute(
      'id',
      'customPrefix',
    );
    expect(screen.getByTestId('cluster-log-forwarding-selector')).toHaveAttribute(
      'data-name',
      'customItems',
    );
  });
});
