import React from 'react';
import { Form, Formik } from 'formik';

import { FieldId, initialValues } from '~/components/clusters/wizards/rosa/constants';
import { render, screen, waitFor } from '~/testUtils';

import { CloudWatchLogForwarding } from './CloudWatchLogForwarding';

jest.mock('./LogForwardingGroupsApplicationsSelector', () => ({
  LogForwardingGroupsApplicationsSelector: () => (
    <div data-testid="log-forwarding-groups-applications-selector" />
  ),
}));

jest.mock('./useCloudWatchLogGroupNameAutofill', () => ({
  useCloudWatchLogGroupNameAutofill: jest.fn(),
}));

const renderCloudWatch = (formValues: Record<string, unknown> = {}) => {
  const { user, ...rest } = render(
    <Formik
      initialValues={{
        ...initialValues,
        ...formValues,
      }}
      onSubmit={jest.fn()}
    >
      <Form noValidate>
        <CloudWatchLogForwarding />
      </Form>
    </Formik>,
  );
  return { user, ...rest };
};

describe('<CloudWatchLogForwarding />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the enable checkbox and hides CloudWatch fields when disabled', () => {
    renderCloudWatch({ [FieldId.LogForwardingCloudWatchEnabled]: false });

    expect(screen.getByRole('heading', { name: 'CloudWatch' })).toBeInTheDocument();
    expect(screen.getByLabelText('Enable CloudWatch')).toBeInTheDocument();
    expect(screen.queryByLabelText('Log group name')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('log-forwarding-groups-applications-selector'),
    ).not.toBeInTheDocument();
  });

  it('shows prerequisite alert, fields, and groups selector when CloudWatch is enabled', async () => {
    const { user } = renderCloudWatch({ [FieldId.LogForwardingCloudWatchEnabled]: false });

    await user.click(screen.getByLabelText('Enable CloudWatch'));

    await waitFor(() => {
      expect(screen.getByText('Prerequisite')).toBeInTheDocument();
    });
    expect(
      screen.getByLabelText(
        "I've read and completed all the prerequisites and am ready to continue creating my cluster.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Log group name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Role ARN/i })).toBeInTheDocument();
    expect(screen.getByTestId('log-forwarding-groups-applications-selector')).toBeInTheDocument();
  });
});
