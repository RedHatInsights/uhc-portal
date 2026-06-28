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

  describe('log group name autofill', () => {
    it('autofills the log group name from the cluster name when CloudWatch is enabled', async () => {
      const { user } = renderCloudWatch({
        [FieldId.ClusterName]: 'my-cluster',
        [FieldId.LogForwardingCloudWatchEnabled]: false,
      });

      await user.click(screen.getByLabelText('Enable CloudWatch'));

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /Log group name/i });
        expect((input as HTMLInputElement).value).toMatch(/^my-cluster-[a-z][a-z0-9]{3}$/);
      });
    });

    it('does not autofill the log group name if a value already exists', async () => {
      const { user } = renderCloudWatch({
        [FieldId.ClusterName]: 'my-cluster',
        [FieldId.LogForwardingCloudWatchEnabled]: false,
        [FieldId.LogForwardingCloudWatchLogGroupName]: 'already-set',
      });

      await user.click(screen.getByLabelText('Enable CloudWatch'));

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /Log group name/i });
        expect((input as HTMLInputElement).value).toBe('already-set');
      });
    });

    it('preserves the log group name when CloudWatch is disabled and re-enabled', async () => {
      const { user } = renderCloudWatch({
        [FieldId.ClusterName]: 'my-cluster',
        [FieldId.LogForwardingCloudWatchEnabled]: true,
        [FieldId.LogForwardingCloudWatchLogGroupName]: 'my-cluster-abcd',
      });

      await user.click(screen.getByLabelText('Enable CloudWatch'));
      await waitFor(() => {
        expect(screen.queryByLabelText('Log group name')).not.toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Enable CloudWatch'));
      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /Log group name/i });
        expect((input as HTMLInputElement).value).toBe('my-cluster-abcd');
      });
    });
  });
});
