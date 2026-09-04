import type { FormikValues } from 'formik';

import { isEnhancedSpotVersionSupported } from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingConstants';
import { validateSpotInterruptionFields } from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingValidation';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { isRosaHcpLogForwardingSubmitContext } from '~/components/clusters/wizards/rosa/LogForwarding/logForwardingTreeFromQueryClient';
import { validateLogForwardingFields } from '~/components/clusters/wizards/rosa/LogForwarding/logForwardingValidation';

import { stepId } from './rosaWizardConstants';

interface MinMaxField {
  min: string | number;
  max: string | number;
}

const addMinMaxError = (
  errors: Record<string, MinMaxField>,
  minMaxItem: MinMaxField,
  fieldName: string,
) => {
  if (minMaxItem.min > minMaxItem.max) {
    // eslint-disable-next-line no-param-reassign
    errors[fieldName] = {
      min: 'The minimum cannot be above the maximum value.',
      max: 'The minimum cannot be above the maximum value.',
    };
  }
};

const rosaWizardFormValidator = (values: FormikValues, activeStepId?: string | number) => {
  const autoScaler = values[FieldId.ClusterAutoscaling];
  const validateLogForwarding =
    isRosaHcpLogForwardingSubmitContext({}, values) &&
    (activeStepId === stepId.CLUSTER_ADDITIONAL_SETTINGS__LOG_FORWARDING ||
      activeStepId === stepId.REVIEW_AND_CREATE);
  const logForwardingErrors = validateLogForwarding ? validateLogForwardingFields(values) : {};
  const validateSpotInterruption =
    values[FieldId.Hypershift] === 'true' &&
    isEnhancedSpotVersionSupported(values[FieldId.ClusterVersion]?.raw_id) &&
    (activeStepId === stepId.CLUSTER_SETTINGS__MACHINE_POOL ||
      activeStepId === stepId.REVIEW_AND_CREATE);
  const spotInterruptionErrors = validateSpotInterruption
    ? validateSpotInterruptionFields(values)
    : {};

  if (!autoScaler) {
    if (!Object.keys(logForwardingErrors).length && !Object.keys(spotInterruptionErrors).length) {
      return {};
    }
    return {
      ...spotInterruptionErrors,
      ...logForwardingErrors,
    };
  }

  const { cores, memory } = autoScaler.resource_limits;

  const resourceLimitErrors: Record<string, MinMaxField> = {};
  addMinMaxError(resourceLimitErrors, cores, 'cores');
  addMinMaxError(resourceLimitErrors, memory, 'memory');

  if (Object.keys(resourceLimitErrors).length === 0) {
    if (!Object.keys(logForwardingErrors).length && !Object.keys(spotInterruptionErrors).length) {
      return {};
    }
    return {
      ...spotInterruptionErrors,
      ...logForwardingErrors,
    };
  }

  const autoscalingErrors = {
    cluster_autoscaling: {
      resource_limits: resourceLimitErrors,
    },
  };

  if (!Object.keys(logForwardingErrors).length && !Object.keys(spotInterruptionErrors).length) {
    return autoscalingErrors;
  }

  return {
    ...autoscalingErrors,
    ...spotInterruptionErrors,
    ...logForwardingErrors,
  };
};

export { rosaWizardFormValidator };
