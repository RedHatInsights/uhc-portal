import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import {
  validateLogForwardingFields,
  validateS3BucketName,
  validateS3BucketPrefix,
} from './logForwardingValidation';

const validRoleArn = 'arn:aws:iam::123456789012:role/log-forward-role';

describe('logForwardingValidation', () => {
  describe('validateS3BucketName', () => {
    it('accepts valid DNS-compliant names', () => {
      expect(validateS3BucketName('my-bucket-01')).toBeUndefined();
      expect(validateS3BucketName('abc')).toBeUndefined();
      expect(validateS3BucketName('a.b.c.d')).toBeUndefined();
    });

    it('rejects invalid length', () => {
      expect(validateS3BucketName('ab')).toContain('3 and 63');
      expect(validateS3BucketName(`${'a'.repeat(64)}`)).toContain('3 and 63');
    });

    it('rejects uppercase and invalid characters', () => {
      expect(validateS3BucketName('My-Bucket')).toBeDefined();
      expect(validateS3BucketName('my_bucket')).toBeDefined();
    });

    it('rejects when middle segment uses invalid characters', () => {
      expect(validateS3BucketName('my!bucket')).toContain(
        'Use only lowercase letters, numbers, dots, and hyphens.',
      );
    });

    it('rejects when name does not start with lowercase letter or number', () => {
      expect(validateS3BucketName('-mybucket')).toContain(
        'Bucket name must start and end with a lowercase letter or number.',
      );
      expect(validateS3BucketName('.mybucket')).toContain(
        'Bucket name must start and end with a lowercase letter or number.',
      );
    });

    it('rejects when name does not end with lowercase letter or number', () => {
      expect(validateS3BucketName('mybucket-')).toContain(
        'Bucket name must start and end with a lowercase letter or number.',
      );
    });

    it('rejects consecutive dots', () => {
      expect(validateS3BucketName('my..bucket')).toContain('consecutive');
    });

    it('rejects IP-address-shaped names', () => {
      expect(validateS3BucketName('192.168.1.1')).toContain('IP address');
    });

    it('trims whitespace before validating', () => {
      expect(validateS3BucketName('  my-bucket  ')).toBeUndefined();
    });
  });

  describe('validateS3BucketPrefix', () => {
    it('allows empty optional prefix', () => {
      expect(validateS3BucketPrefix('')).toBeUndefined();
      expect(validateS3BucketPrefix('   ')).toBeUndefined();
    });

    it('rejects consecutive dots in prefix', () => {
      expect(validateS3BucketPrefix('logs/../x')).toContain('consecutive');
    });

    it('rejects prefix longer than 1024 characters', () => {
      const long = `${'a'.repeat(1025)}`;
      expect(validateS3BucketPrefix(long)).toContain('1024');
    });

    it('allows prefix at max length', () => {
      expect(validateS3BucketPrefix('a'.repeat(1024))).toBeUndefined();
    });
  });

  describe('validateLogForwardingFields', () => {
    it('returns no errors when log forwarding toggles are off', () => {
      expect(
        validateLogForwardingFields({
          [FieldId.LogForwardingS3Enabled]: false,
          [FieldId.LogForwardingCloudWatchEnabled]: false,
        }),
      ).toEqual({});
    });

    describe('S3 enabled', () => {
      const baseS3 = {
        [FieldId.LogForwardingS3Enabled]: true,
        [FieldId.LogForwardingS3BucketName]: '',
        [FieldId.LogForwardingS3BucketPrefix]: '',
      };

      it('requires bucket name', () => {
        const errors = validateLogForwardingFields(baseS3);
        expect(errors[FieldId.LogForwardingS3BucketName]).toBe('Bucket name is required.');
      });

      it('maps bucket name validation errors from validateS3BucketName', () => {
        const errors = validateLogForwardingFields({
          ...baseS3,
          [FieldId.LogForwardingS3BucketName]: 'AB',
        });
        expect(errors[FieldId.LogForwardingS3BucketName]).toContain('3 and 63');
      });

      it('maps prefix validation errors', () => {
        const errors = validateLogForwardingFields({
          ...baseS3,
          [FieldId.LogForwardingS3BucketName]: 'my-bucket',
          [FieldId.LogForwardingS3BucketPrefix]: 'a..b',
        });
        expect(errors[FieldId.LogForwardingS3BucketPrefix]).toContain('consecutive');
      });

      it('returns no S3 field errors when bucket and prefix are valid', () => {
        const errors = validateLogForwardingFields({
          ...baseS3,
          [FieldId.LogForwardingS3BucketName]: 'my-bucket',
          [FieldId.LogForwardingS3BucketPrefix]: 'logs/',
        });
        expect(errors[FieldId.LogForwardingS3BucketName]).toBeUndefined();
        expect(errors[FieldId.LogForwardingS3BucketPrefix]).toBeUndefined();
      });

      it('coerces non-string bucket and prefix values', () => {
        const errors = validateLogForwardingFields({
          ...baseS3,
          [FieldId.LogForwardingS3BucketName]: null,
          [FieldId.LogForwardingS3BucketPrefix]: undefined,
        } as Record<string, unknown>);
        expect(errors[FieldId.LogForwardingS3BucketName]).toBe('Bucket name is required.');
      });
    });

    describe('CloudWatch enabled', () => {
      const baseCw = {
        [FieldId.LogForwardingCloudWatchEnabled]: true,
        [FieldId.LogForwardingCloudWatchLogGroupName]: '',
        [FieldId.LogForwardingCloudWatchRoleArn]: '',
        [FieldId.LogForwardingCloudWatchPrerequisiteAck]: false,
      };

      it('requires log group name', () => {
        const errors = validateLogForwardingFields(baseCw);
        expect(errors[FieldId.LogForwardingCloudWatchLogGroupName]).toBe(
          'Log group name is required.',
        );
      });

      it('requires role ARN', () => {
        const errors = validateLogForwardingFields({
          ...baseCw,
          [FieldId.LogForwardingCloudWatchLogGroupName]: '/aws/log-group',
        });
        expect(errors[FieldId.LogForwardingCloudWatchRoleArn]).toBe('Role ARN is required.');
      });

      it('maps invalid role ARN from validateRoleARN', () => {
        const errors = validateLogForwardingFields({
          ...baseCw,
          [FieldId.LogForwardingCloudWatchLogGroupName]: '/aws/log-group',
          [FieldId.LogForwardingCloudWatchRoleArn]: 'not-a-valid-arn',
        });
        expect(errors[FieldId.LogForwardingCloudWatchRoleArn]).toContain('ARN value should be');
      });

      it('requires prerequisite acknowledgment', () => {
        const errors = validateLogForwardingFields({
          ...baseCw,
          [FieldId.LogForwardingCloudWatchLogGroupName]: '/aws/log-group',
          [FieldId.LogForwardingCloudWatchRoleArn]: validRoleArn,
          [FieldId.LogForwardingCloudWatchPrerequisiteAck]: false,
        });
        expect(errors[FieldId.LogForwardingCloudWatchPrerequisiteAck]).toBe(
          'Confirm you have completed the prerequisites to continue.',
        );
      });

      it('returns no CloudWatch field errors when all fields are valid', () => {
        const errors = validateLogForwardingFields({
          ...baseCw,
          [FieldId.LogForwardingCloudWatchLogGroupName]: '/aws/log-group',
          [FieldId.LogForwardingCloudWatchRoleArn]: validRoleArn,
          [FieldId.LogForwardingCloudWatchPrerequisiteAck]: true,
        });
        expect(errors[FieldId.LogForwardingCloudWatchLogGroupName]).toBeUndefined();
        expect(errors[FieldId.LogForwardingCloudWatchRoleArn]).toBeUndefined();
        expect(errors[FieldId.LogForwardingCloudWatchPrerequisiteAck]).toBeUndefined();
      });

      it('coerces non-string CloudWatch values', () => {
        const errors = validateLogForwardingFields({
          ...baseCw,
          [FieldId.LogForwardingCloudWatchLogGroupName]: null,
          [FieldId.LogForwardingCloudWatchRoleArn]: null,
        } as Record<string, unknown>);
        expect(errors[FieldId.LogForwardingCloudWatchLogGroupName]).toBe(
          'Log group name is required.',
        );
        expect(errors[FieldId.LogForwardingCloudWatchRoleArn]).toBe('Role ARN is required.');
      });
    });

    it('validates S3 and CloudWatch independently when both are enabled', () => {
      const errors = validateLogForwardingFields({
        [FieldId.LogForwardingS3Enabled]: true,
        [FieldId.LogForwardingS3BucketName]: '',
        [FieldId.LogForwardingS3BucketPrefix]: '',
        [FieldId.LogForwardingCloudWatchEnabled]: true,
        [FieldId.LogForwardingCloudWatchLogGroupName]: '',
        [FieldId.LogForwardingCloudWatchRoleArn]: '',
        [FieldId.LogForwardingCloudWatchPrerequisiteAck]: false,
      });
      expect(errors[FieldId.LogForwardingS3BucketName]).toBeDefined();
      expect(errors[FieldId.LogForwardingCloudWatchLogGroupName]).toBeDefined();
      expect(errors[FieldId.LogForwardingCloudWatchRoleArn]).toBeDefined();
      expect(errors[FieldId.LogForwardingCloudWatchPrerequisiteAck]).toBeDefined();
    });
  });
});
