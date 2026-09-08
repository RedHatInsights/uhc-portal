import type { FormikValues } from 'formik';

import { validateSpotTerminationHandlerQueueUrl } from '~/common/validators';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import { SpotInterruptionMode } from './spotInterruptionHandlingConstants';

export function validateSpotInterruptionFields(values: FormikValues): Record<string, string> {
  if (values[FieldId.SpotInterruptionHandling] !== SpotInterruptionMode.Enhanced) {
    return {};
  }

  const validationError = validateSpotTerminationHandlerQueueUrl(
    values[FieldId.SpotTerminationHandlerQueueUrl],
    values[FieldId.Region],
  );

  return validationError ? { [FieldId.SpotTerminationHandlerQueueUrl]: validationError } : {};
}
