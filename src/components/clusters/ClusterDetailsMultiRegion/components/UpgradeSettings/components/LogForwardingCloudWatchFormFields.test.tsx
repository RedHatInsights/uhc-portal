import React from 'react';
import { Form, Formik } from 'formik';

import { render, screen } from '~/testUtils';

import { LogForwardingCloudWatchFormFields } from './LogForwardingCloudWatchFormFields';

jest.mock('./ClusterLogForwardingGroupsApplicationsSelector', () => ({
  ClusterLogForwardingGroupsApplicationsSelector: ({ name }: { name: string }) => (
    <div data-testid="cluster-log-forwarding-selector" data-name={name} />
  ),
}));

const renderFields = (showPrerequisites = false) =>
  render(
    <Formik
      initialValues={{
        logGroupName: '',
        roleArn: '',
        selectedItems: [],
        prerequisiteAck: false,
      }}
      onSubmit={jest.fn()}
    >
      <Form noValidate>
        <LogForwardingCloudWatchFormFields showPrerequisites={showPrerequisites} />
      </Form>
    </Formik>,
  );

describe('LogForwardingCloudWatchFormFields', () => {
  it('renders CloudWatch fields without prerequisites by default', () => {
    renderFields(false);

    expect(screen.queryByText('Prerequisite')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Log group name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Role ARN/i })).toBeInTheDocument();
    expect(screen.getByTestId('cluster-log-forwarding-selector')).toBeInTheDocument();
  });

  it('renders prerequisite alert and acknowledgment when showPrerequisites is true', () => {
    renderFields(true);

    expect(screen.getByText('Prerequisite')).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        "I've read and completed all the prerequisites and am ready to continue.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  it('supports custom field names', () => {
    render(
      <Formik
        initialValues={{
          customLogGroup: '',
          customRole: '',
          customItems: [],
          customAck: false,
        }}
        onSubmit={jest.fn()}
      >
        <Form noValidate>
          <LogForwardingCloudWatchFormFields
            logGroupNameField="customLogGroup"
            roleArnField="customRole"
            selectedItemsField="customItems"
            prerequisiteAckField="customAck"
            showPrerequisites
          />
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('textbox', { name: /Log group name/i })).toHaveAttribute(
      'id',
      'customLogGroup',
    );
    expect(screen.getByRole('textbox', { name: /Role ARN/i })).toHaveAttribute('id', 'customRole');
    expect(screen.getByTestId('cluster-log-forwarding-selector')).toHaveAttribute(
      'data-name',
      'customItems',
    );
  });
});
