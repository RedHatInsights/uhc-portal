import { useEffect, useRef } from 'react';
import { useField, useFormikContext } from 'formik';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import { createCloudWatchLogGroupName } from './logForwardingNaming';

/**
 * When CloudWatch log forwarding is enabled, fills the log group name from the cluster name
 * (same pattern as Custom operator role prefix). Clears the field when CloudWatch is disabled.
 *
 * Autofill runs once: when the checkbox is first enabled and the field is empty. After that the
 * value is left untouched — including when the cluster name changes. Unchecking and rechecking
 * CloudWatch clears the field and triggers a fresh autofill with the current cluster name.
 *
 * `lastAutofilledValueRef` tracks the value we last wrote so that a user-clear (setting the
 * field back to empty) is not confused with "never been filled" — preventing an unwanted
 * re-autofill after the user intentionally clears the field.
 */
export function useCloudWatchLogGroupNameAutofill(): void {
  const { setFieldValue } = useFormikContext<Record<string, unknown>>();
  const [{ value: cwEnabled }] = useField<boolean>(FieldId.LogForwardingCloudWatchEnabled);
  const [{ value: logGroupName }] = useField<string>(FieldId.LogForwardingCloudWatchLogGroupName);
  const [{ value: clusterNameRaw }] = useField<string>(FieldId.ClusterName);
  const clusterName = String(clusterNameRaw ?? '').trim();
  const lastAutofilledValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cwEnabled) {
      if (logGroupName) {
        setFieldValue(FieldId.LogForwardingCloudWatchLogGroupName, '');
      }
      lastAutofilledValueRef.current = null;
      return;
    }
    if (!clusterName) {
      return;
    }

    // The user has manually edited the field if the current value no longer matches what we last
    // wrote (and we have written something before).
    const userHasEdited =
      lastAutofilledValueRef.current !== null && logGroupName !== lastAutofilledValueRef.current;

    if (!userHasEdited && !logGroupName) {
      const autofilled = createCloudWatchLogGroupName(clusterName);
      lastAutofilledValueRef.current = autofilled;
      setFieldValue(FieldId.LogForwardingCloudWatchLogGroupName, autofilled);
    }
  }, [cwEnabled, clusterName, logGroupName, setFieldValue]);
}
