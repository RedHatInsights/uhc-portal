import { useEffect, useRef } from 'react';
import { useField, useFormikContext } from 'formik';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import { createCloudWatchLogGroupName } from './logForwardingNaming';

/**
 * When CloudWatch log forwarding is enabled, fills the log group name from the cluster name
 * (same pattern as Custom operator role prefix). Clears the field when CloudWatch is disabled.
 */
export function useCloudWatchLogGroupNameAutofill(): void {
  const { setFieldValue } = useFormikContext<Record<string, unknown>>();
  const [{ value: cwEnabled }] = useField<boolean>(FieldId.LogForwardingCloudWatchEnabled);
  const [{ value: logGroupName }] = useField<string>(FieldId.LogForwardingCloudWatchLogGroupName);
  const [{ value: clusterNameRaw }] = useField<string>(FieldId.ClusterName);
  const clusterName = String(clusterNameRaw ?? '').trim();
  const previousClusterNameRef = useRef(clusterName);

  useEffect(() => {
    if (!cwEnabled) {
      if (logGroupName) {
        setFieldValue(FieldId.LogForwardingCloudWatchLogGroupName, '');
      }
      previousClusterNameRef.current = clusterName;
      return;
    }
    if (!clusterName) {
      return;
    }
    const clusterNameChanged = previousClusterNameRef.current !== clusterName;
    if (!logGroupName || clusterNameChanged) {
      setFieldValue(
        FieldId.LogForwardingCloudWatchLogGroupName,
        createCloudWatchLogGroupName(clusterName),
      );
    }
    previousClusterNameRef.current = clusterName;
  }, [cwEnabled, clusterName, logGroupName, setFieldValue]);
}
