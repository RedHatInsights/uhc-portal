import { FormikValues } from 'formik';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { validateLogForwardingFields } from '~/components/common/GroupsApplicationsSelector/logForwardingValidation';

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

const rosaWizardFormValidator = (values: FormikValues) => {
  const autoScaler = values[FieldId.ClusterAutoscaling];
  const logForwardingEnabled =
    values[FieldId.LogForwardingS3Enabled] || values[FieldId.LogForwardingCloudWatchEnabled];
  const logForwardingErrors = logForwardingEnabled ? validateLogForwardingFields(values) : {};

  if (!autoScaler) {
    return Object.keys(logForwardingErrors).length ? logForwardingErrors : {};
  }

  const { cores, memory } = autoScaler.resource_limits;

  const resourceLimitErrors: Record<string, MinMaxField> = {};
  addMinMaxError(resourceLimitErrors, cores, 'cores');
  addMinMaxError(resourceLimitErrors, memory, 'memory');

  if (Object.keys(resourceLimitErrors).length === 0) {
    return Object.keys(logForwardingErrors).length ? logForwardingErrors : {};
  }

  const autoscalingErrors = {
    cluster_autoscaling: {
      resource_limits: resourceLimitErrors,
    },
  };

  if (Object.keys(logForwardingErrors).length === 0) {
    return autoscalingErrors;
  }

  return {
    ...autoscalingErrors,
    ...logForwardingErrors,
  };
};

export { rosaWizardFormValidator };
