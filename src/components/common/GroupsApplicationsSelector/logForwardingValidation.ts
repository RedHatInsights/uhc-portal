import { FormikValues } from 'formik';

import { validateRoleARN } from '~/common/validators';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

/** AWS S3 bucket naming rules (DNS-compliant): 3–63 chars, lowercase, no consecutive dots. */
export function validateS3BucketName(name: string): string | undefined {
  const n = name.trim();
  if (n.length < 3 || n.length > 63) {
    return 'Bucket name must be between 3 and 63 characters.';
  }
  if (!/^[a-z0-9]/.test(n) || !/[a-z0-9]$/.test(n)) {
    return 'Bucket name must start and end with a lowercase letter or number.';
  }
  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(n)) {
    return 'Use only lowercase letters, numbers, dots, and hyphens.';
  }
  if (/\.\./.test(n)) {
    return 'Bucket name cannot contain consecutive periods.';
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(n)) {
    return 'Bucket name cannot be formatted as an IP address.';
  }
  return undefined;
}

/**
 * Optional prefix: if present, apply the same character rules as the bucket name body
 * (no consecutive dots); keep validation light for optional field.
 */
export function validateS3BucketPrefix(prefix: string): string | undefined {
  const p = prefix.trim();
  if (!p) {
    return undefined;
  }
  if (p.length > 1024) {
    return 'Prefix must be 1024 characters or fewer.';
  }
  if (/\.\./.test(p)) {
    return 'Prefix cannot contain consecutive periods.';
  }
  return undefined;
}

export function validateLogForwardingFields(values: FormikValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (values[FieldId.LogForwardingS3Enabled]) {
    const bucket = String(values[FieldId.LogForwardingS3BucketName] ?? '').trim();
    if (!bucket) {
      errors[FieldId.LogForwardingS3BucketName] = 'Bucket name is required.';
    } else {
      const bucketErr = validateS3BucketName(bucket);
      if (bucketErr) {
        errors[FieldId.LogForwardingS3BucketName] = bucketErr;
      }
    }
    const prefix = String(values[FieldId.LogForwardingS3BucketPrefix] ?? '').trim();
    const prefixErr = validateS3BucketPrefix(prefix);
    if (prefixErr) {
      errors[FieldId.LogForwardingS3BucketPrefix] = prefixErr;
    }
  }

  if (values[FieldId.LogForwardingCloudWatchEnabled]) {
    const logGroup = String(values[FieldId.LogForwardingCloudWatchLogGroupName] ?? '').trim();
    if (!logGroup) {
      errors[FieldId.LogForwardingCloudWatchLogGroupName] = 'Log group name is required.';
    }
    const roleArn = String(values[FieldId.LogForwardingCloudWatchRoleArn] ?? '').trim();
    if (!roleArn) {
      errors[FieldId.LogForwardingCloudWatchRoleArn] = 'Role ARN is required.';
    } else {
      const arnErr = validateRoleARN(roleArn);
      if (arnErr) {
        errors[FieldId.LogForwardingCloudWatchRoleArn] = arnErr;
      }
    }
    if (!values[FieldId.LogForwardingCloudWatchPrerequisiteAck]) {
      errors[FieldId.LogForwardingCloudWatchPrerequisiteAck] =
        'Confirm you have completed the prerequisites to continue.';
    }
  }

  return errors;
}
