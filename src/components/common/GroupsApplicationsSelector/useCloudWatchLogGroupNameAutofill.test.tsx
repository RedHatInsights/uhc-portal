import React from 'react';
import { Form, Formik, useFormikContext } from 'formik';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { render, screen, waitFor } from '~/testUtils';

import { useCloudWatchLogGroupNameAutofill } from './useCloudWatchLogGroupNameAutofill';

function AutofillProbe() {
  useCloudWatchLogGroupNameAutofill();
  const { values } = useFormikContext<Record<string, unknown>>();
  return (
    <output data-testid="log-group-name">
      {String(values[FieldId.LogForwardingCloudWatchLogGroupName] ?? '')}
    </output>
  );
}

function renderWithFormik(initialValues: Record<string, unknown>) {
  return render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <AutofillProbe />
      </Form>
    </Formik>,
  );
}

describe('useCloudWatchLogGroupNameAutofill', () => {
  it('clears log group name when CloudWatch is disabled', async () => {
    renderWithFormik({
      [FieldId.ClusterName]: 'my-cluster',
      [FieldId.LogForwardingCloudWatchEnabled]: false,
      [FieldId.LogForwardingCloudWatchLogGroupName]: 'stale-name',
    });

    await waitFor(() => expect(screen.getByTestId('log-group-name')).toHaveTextContent(''));
  });

  it('fills log group name when CloudWatch is enabled', async () => {
    renderWithFormik({
      [FieldId.ClusterName]: 'my-cluster',
      [FieldId.LogForwardingCloudWatchEnabled]: true,
      [FieldId.LogForwardingCloudWatchLogGroupName]: '',
    });

    await waitFor(() => {
      const value = screen.getByTestId('log-group-name').textContent ?? '';
      expect(value).toMatch(/^my-cluster-[a-z][a-z0-9]{3}$/);
    });
  });

  it('leaves log group name empty when enabled but cluster name is missing', async () => {
    renderWithFormik({
      [FieldId.ClusterName]: '',
      [FieldId.LogForwardingCloudWatchEnabled]: true,
      [FieldId.LogForwardingCloudWatchLogGroupName]: '',
    });

    await waitFor(() => expect(screen.getByTestId('log-group-name')).toHaveTextContent(''));
  });
});
