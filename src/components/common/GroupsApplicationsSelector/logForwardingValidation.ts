import { FormikValues } from 'formik';

import { validateRoleARN } from '~/common/validators';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

/** Allowed characters per CloudWatch Logs log group naming rules (max 512). */
const CLOUDWATCH_LOG_GROUP_NAME_MAX_LENGTH = 512;
const CLOUDWATCH_LOG_GROUP_NAME_RE = /^[-#./A-Za-z0-9_]+$/;

function logForwardingSelectedItemsMissing(values: FormikValues, fieldId: string): boolean {
  const raw = values[fieldId];
  if (!Array.isArray(raw)) {
    return true;
  }
  return raw.length === 0;
}

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

    if (logForwardingSelectedItemsMissing(values, FieldId.LogForwardingS3SelectedItems)) {
      errors[FieldId.LogForwardingS3SelectedItems] = 'Select at least one group or application.';
    }
  }

  if (values[FieldId.LogForwardingCloudWatchEnabled]) {
    const logGroup = String(values[FieldId.LogForwardingCloudWatchLogGroupName] ?? '').trim();
    if (!logGroup) {
      errors[FieldId.LogForwardingCloudWatchLogGroupName] = 'Log group name is required.';
    } else if (logGroup.length > CLOUDWATCH_LOG_GROUP_NAME_MAX_LENGTH) {
      errors[FieldId.LogForwardingCloudWatchLogGroupName] =
        'Log group name contains invalid characters or is too long (max 512).';
    } else if (!CLOUDWATCH_LOG_GROUP_NAME_RE.test(logGroup)) {
      errors[FieldId.LogForwardingCloudWatchLogGroupName] =
        'Log group name contains invalid characters or is too long (max 512).';
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

    if (logForwardingSelectedItemsMissing(values, FieldId.LogForwardingCloudWatchSelectedItems)) {
      errors[FieldId.LogForwardingCloudWatchSelectedItems] =
        'Select at least one group or application.';
    }
  }

  return errors;
}
