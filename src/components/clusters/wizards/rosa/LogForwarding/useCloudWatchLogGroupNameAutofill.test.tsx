import React from 'react';
import { Form, Formik, useFormikContext } from 'formik';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { render, screen, userEvent, waitFor } from '~/testUtils';

import { useCloudWatchLogGroupNameAutofill } from './useCloudWatchLogGroupNameAutofill';

function AutofillProbe() {
  useCloudWatchLogGroupNameAutofill();
  const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
  return (
    <>
      <output data-testid="log-group-name">
        {String(values[FieldId.LogForwardingCloudWatchLogGroupName] ?? '')}
      </output>
      <button
        type="button"
        data-testid="clear-field"
        onClick={() => setFieldValue(FieldId.LogForwardingCloudWatchLogGroupName, '')}
      >
        Clear
      </button>
      <button
        type="button"
        data-testid="set-custom"
        onClick={() =>
          setFieldValue(FieldId.LogForwardingCloudWatchLogGroupName, 'my-custom-group')
        }
      >
        Set custom
      </button>
      <button
        type="button"
        data-testid="toggle-cloudwatch"
        onClick={() =>
          setFieldValue(
            FieldId.LogForwardingCloudWatchEnabled,
            !values[FieldId.LogForwardingCloudWatchEnabled],
          )
        }
      >
        Toggle CloudWatch
      </button>
    </>
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

  it('does not re-autofill after the user clears the field', async () => {
    renderWithFormik({
      [FieldId.ClusterName]: 'my-cluster',
      [FieldId.LogForwardingCloudWatchEnabled]: true,
      [FieldId.LogForwardingCloudWatchLogGroupName]: '',
    });

    // Wait for the initial autofill
    await waitFor(() => {
      expect(screen.getByTestId('log-group-name').textContent).toMatch(/^my-cluster-/);
    });

    // User clears the field
    await userEvent.click(screen.getByTestId('clear-field'));

    // The field should remain empty — the hook must not re-autofill
    await waitFor(() => expect(screen.getByTestId('log-group-name')).toHaveTextContent(''));
  });

  it('does not re-autofill after the user sets a custom value', async () => {
    renderWithFormik({
      [FieldId.ClusterName]: 'my-cluster',
      [FieldId.LogForwardingCloudWatchEnabled]: true,
      [FieldId.LogForwardingCloudWatchLogGroupName]: '',
    });

    // Wait for initial autofill then override with a custom value
    await waitFor(() => {
      expect(screen.getByTestId('log-group-name').textContent).toMatch(/^my-cluster-/);
    });

    await userEvent.click(screen.getByTestId('set-custom'));

    await waitFor(() =>
      expect(screen.getByTestId('log-group-name')).toHaveTextContent('my-custom-group'),
    );
  });

  it('autofills with the current cluster name when CloudWatch is toggled off then on', async () => {
    renderWithFormik({
      [FieldId.ClusterName]: 'new-cluster',
      [FieldId.LogForwardingCloudWatchEnabled]: true,
      [FieldId.LogForwardingCloudWatchLogGroupName]: 'old-cluster-abcd',
    });

    // Initially a stale log group name is present (as if the user had autofilled with an old
    // cluster name). Disabling and re-enabling CloudWatch should trigger a fresh autofill.
    await userEvent.click(screen.getByTestId('toggle-cloudwatch')); // disable
    await waitFor(() => expect(screen.getByTestId('log-group-name')).toHaveTextContent(''));

    await userEvent.click(screen.getByTestId('toggle-cloudwatch')); // re-enable
    await waitFor(() => {
      expect(screen.getByTestId('log-group-name').textContent).toMatch(/^new-cluster-/);
    });
  });
});
