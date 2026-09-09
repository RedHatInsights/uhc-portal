import { SpotInterruptionMode } from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingConstants';
import {
  validateSpotInterruptionFields,
  validateSpotTerminationHandlerQueueUrl,
} from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingValidation';
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

describe('validateSpotTerminationHandlerQueueUrl', () => {
  const validQueueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot';

  it('returns required error when the URL is empty', () => {
    expect(validateSpotTerminationHandlerQueueUrl('', 'us-east-1')).toBe(
      'SQS queue URL is required.',
    );
  });

  it('returns URL format error when the URL is invalid', () => {
    expect(validateSpotTerminationHandlerQueueUrl('invalid-url', 'us-east-1')).toBe(
      'The URL should include the scheme prefix (https://)',
    );
  });

  it('returns URL format error when the URL uses http', () => {
    expect(
      validateSpotTerminationHandlerQueueUrl(
        'http://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
        'us-east-1',
      ),
    ).toBe('The URL should include the scheme prefix (https://)');
  });

  it('returns an error when the URL is not a valid Amazon SQS queue URL', () => {
    expect(validateSpotTerminationHandlerQueueUrl('https://example.com/queue', 'us-east-1')).toBe(
      'Enter a valid Amazon SQS queue URL.',
    );
  });

  it('returns an error when the SQS URL does not include account ID and queue name', () => {
    expect(
      validateSpotTerminationHandlerQueueUrl('https://sqs.us-east-1.amazonaws.com/', 'us-east-1'),
    ).toBe('Enter a valid Amazon SQS queue URL.');
  });

  it('returns an error when the SQS URL contains credentials', () => {
    expect(
      validateSpotTerminationHandlerQueueUrl(
        'https://user:pass@sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
        'us-east-1',
      ),
    ).toBe('Enter a valid Amazon SQS queue URL.');
  });

  it('returns an error when the SQS URL contains a port', () => {
    expect(
      validateSpotTerminationHandlerQueueUrl(
        'https://sqs.us-east-1.amazonaws.com:8443/123456789012/rosa-cluster-spot',
        'us-east-1',
      ),
    ).toBe('Enter a valid Amazon SQS queue URL.');
  });

  it('returns an error when the SQS URL contains query or fragment', () => {
    expect(
      validateSpotTerminationHandlerQueueUrl(
        'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot?x=1#frag',
        'us-east-1',
      ),
    ).toBe('Enter a valid Amazon SQS queue URL.');
  });

  it('returns an error when the SQS URL queue name contains whitespace', () => {
    expect(
      validateSpotTerminationHandlerQueueUrl(
        'https://sqs.us-west-2.amazonaws.com/720420066366/rosa-c  luster-spot',
        'us-west-2',
      ),
    ).toBe('Enter a valid Amazon SQS queue URL.');
  });

  it('returns an error when the SQS URL queue name exceeds 80 characters', () => {
    const queueName = 'a'.repeat(81);

    expect(
      validateSpotTerminationHandlerQueueUrl(
        `https://sqs.us-east-1.amazonaws.com/123456789012/${queueName}`,
        'us-east-1',
      ),
    ).toBe('The SQS queue name cannot exceed 80 characters.');
  });

  it('returns no error when the SQS URL queue name is 80 characters', () => {
    const queueName = 'a'.repeat(80);

    expect(
      validateSpotTerminationHandlerQueueUrl(
        `https://sqs.us-east-1.amazonaws.com/123456789012/${queueName}`,
        'us-east-1',
      ),
    ).toBeUndefined();
  });

  it('returns no error when the SQS URL has leading or trailing whitespace', () => {
    expect(
      validateSpotTerminationHandlerQueueUrl(`  ${validQueueUrl}  `, 'us-east-1'),
    ).toBeUndefined();
  });

  it('returns required error when the URL is only whitespace', () => {
    expect(validateSpotTerminationHandlerQueueUrl('   ', 'us-east-1')).toBe(
      'SQS queue URL is required.',
    );
  });

  it('returns no error when the URL region matches the cluster region', () => {
    expect(validateSpotTerminationHandlerQueueUrl(validQueueUrl, 'us-east-1')).toBeUndefined();
  });

  it('returns no error when a GovCloud FIPS SQS URL region matches the cluster region', () => {
    expect(
      validateSpotTerminationHandlerQueueUrl(
        'https://sqs-fips.us-gov-west-1.amazonaws.com/123456789012/rosa-cluster-spot',
        'us-gov-west-1',
      ),
    ).toBeUndefined();
  });

  it('returns region mismatch error when the URL region does not match the cluster region', () => {
    expect(validateSpotTerminationHandlerQueueUrl(validQueueUrl, 'us-west-2')).toBe(
      'The SQS queue URL must be in the cluster region (us-west-2).',
    );
  });

  it('skips region validation when cluster region is not provided', () => {
    expect(validateSpotTerminationHandlerQueueUrl(validQueueUrl)).toBeUndefined();
  });
});
