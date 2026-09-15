import type { FormikValues } from 'formik';

import { validateUrl } from '~/common/validators';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import { SpotInterruptionMode } from './spotInterruptionHandlingConstants';

const SQS_QUEUE_HOSTNAME_PATTERN = /^sqs(?:-fips)?\.([a-z0-9-]+)\.amazonaws\.com$/i;
const SQS_QUEUE_PATHNAME_PATTERN = /^\/\d{12}\/[a-zA-Z0-9_-]+(\.fifo)?$/;
const SQS_QUEUE_NAME_MAX_LENGTH = 80;

export const validateSpotTerminationHandlerQueueUrl = (
  value: string,
  region?: string,
): string | undefined => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return 'SQS queue URL is required.';
  }

  const urlError = validateUrl(trimmedValue, 'https');
  if (urlError) {
    return urlError;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedValue);
  } catch {
    return 'Enter a valid Amazon SQS queue URL.';
  }

  const queueRegion = parsedUrl.hostname.match(SQS_QUEUE_HOSTNAME_PATTERN)?.[1];
  const hasInvalidUrlParts =
    !!parsedUrl.username ||
    !!parsedUrl.password ||
    !!parsedUrl.port ||
    !!parsedUrl.search ||
    !!parsedUrl.hash;

  if (hasInvalidUrlParts || !SQS_QUEUE_PATHNAME_PATTERN.test(parsedUrl.pathname)) {
    return 'Enter a valid Amazon SQS queue URL.';
  }

  if (!queueRegion) {
    return 'Enter a valid Amazon SQS queue URL.';
  }

  const queueName = parsedUrl.pathname.split('/')[2];
  if (queueName.length > SQS_QUEUE_NAME_MAX_LENGTH) {
    return `The SQS queue name cannot exceed ${SQS_QUEUE_NAME_MAX_LENGTH} characters.`;
  }

  if (region && queueRegion !== region) {
    return `The SQS queue URL must be in the cluster region (${region}).`;
  }

  return undefined;
};

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
