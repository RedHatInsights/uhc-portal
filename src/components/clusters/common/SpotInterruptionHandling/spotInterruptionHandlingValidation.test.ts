import { SpotInterruptionMode } from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingConstants';
import { validateSpotInterruptionFields } from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingValidation';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

describe('validateSpotInterruptionFields', () => {
  it('returns no errors in simple mode', () => {
    expect(
      validateSpotInterruptionFields({
        [FieldId.SpotInterruptionHandling]: SpotInterruptionMode.Simple,
        [FieldId.SpotTerminationHandlerQueueUrl]: '',
      }),
    ).toEqual({});
  });

  it('returns required error when enhanced mode is selected and SQS URL is empty', () => {
    expect(
      validateSpotInterruptionFields({
        [FieldId.SpotInterruptionHandling]: SpotInterruptionMode.Enhanced,
        [FieldId.SpotTerminationHandlerQueueUrl]: '',
      }),
    ).toEqual({
      [FieldId.SpotTerminationHandlerQueueUrl]: 'SQS queue URL is required.',
    });
  });

  it('returns region mismatch error when the SQS URL region does not match the cluster region', () => {
    expect(
      validateSpotInterruptionFields({
        [FieldId.SpotInterruptionHandling]: SpotInterruptionMode.Enhanced,
        [FieldId.Region]: 'us-west-2',
        [FieldId.SpotTerminationHandlerQueueUrl]:
          'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
      }),
    ).toEqual({
      [FieldId.SpotTerminationHandlerQueueUrl]:
        'The SQS queue URL must be in the cluster region (us-west-2).',
    });
  });

  it('returns no errors when enhanced mode SQS URL is valid', () => {
    expect(
      validateSpotInterruptionFields({
        [FieldId.SpotInterruptionHandling]: SpotInterruptionMode.Enhanced,
        [FieldId.Region]: 'us-gov-west-1',
        [FieldId.SpotTerminationHandlerQueueUrl]:
          'https://sqs-fips.us-gov-west-1.amazonaws.com/123456789012/rosa-cluster-spot',
      }),
    ).toEqual({});
  });
});
