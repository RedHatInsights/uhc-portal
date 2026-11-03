import * as Yup from 'yup';

import { checkAwsTagKey, checkAwsTagValue } from '~/common/validators';

import { AwsTagRow, isProtectedAwsTagKey } from './awsTagsHelpers';

/**
 * Yup schema for AWS tag rows: key and value format, reserved and duplicate keys,
 * and an optional maximum number of tags. `isCluster` also reserves cluster-only keys.
 */
export const getAwsTagsValidationSchema = (
  awsTags: AwsTagRow[],
  {
    isHypershift,
    maxCount,
    isCluster = false,
  }: { isHypershift: boolean; maxCount?: number; isCluster?: boolean },
) => {
  const schema = Yup.array().of(
    Yup.object().shape({
      key: Yup.string().test('awsTag-key', '', function test(value) {
        if (awsTags.length === 1 && (!value || value.length === 0)) {
          return true;
        }
        const err = checkAwsTagKey(value);
        if (err) {
          return new Yup.ValidationError(err, value, this.path);
        }

        if (value && isProtectedAwsTagKey(value, { isCluster })) {
          return new Yup.ValidationError(
            'This AWS tag key is reserved and cannot be used.',
            value,
            this.path,
          );
        }

        if (awsTags.filter(({ key }) => key === value).length > 1) {
          return new Yup.ValidationError(
            'Each AWS tag must have a different key.',
            value,
            this.path,
          );
        }
        return true;
      }),
      value: Yup.string().test('awsTag-value', '', function test(value) {
        const awsTagKey = this.parent.key;
        // Allow an empty placeholder row (no key and no value) even on HCP,
        // where non-empty values are otherwise required.
        if (!awsTagKey && (!value || value.length === 0)) {
          return true;
        }

        const err = checkAwsTagValue(value, { isHypershift });
        if (err) {
          return new Yup.ValidationError(err, value, this.path);
        }

        if (value && !awsTagKey) {
          return new Yup.ValidationError('AWS tag key has to be defined', value, this.path);
        }
        return true;
      }),
    }),
  );

  return maxCount === undefined
    ? schema
    : schema.max(maxCount, `You can add at most ${maxCount} AWS tags.`);
};
