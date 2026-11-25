import { getAwsTagsValidationSchema } from './awsTagsValidation';

const reservedKeyError = 'This AWS tag key is reserved and cannot be used.';

const validateKey = (key: string, options: { isCluster?: boolean } = {}) => {
  const awsTags = [
    { key, value: 'value' },
    { key: 'env', value: 'prod' },
  ];
  return getAwsTagsValidationSchema(awsTags, { isHypershift: true, ...options }).validateAt(
    '[0].key',
    awsTags,
  );
};

describe('getAwsTagsValidationSchema', () => {
  it.each(['red-hat-managed', 'red-hat-clustertype', 'api.openshift.com/id', 'kubernetes.io/role'])(
    'rejects the reserved key "%s"',
    async (key) => {
      await expect(validateKey(key)).rejects.toThrow(reservedKeyError);
    },
  );

  it('rejects "Name" only for cluster tags', async () => {
    await expect(validateKey('Name')).resolves.toBe('Name');
    await expect(validateKey('Name', { isCluster: true })).rejects.toThrow(reservedKeyError);
  });

  it('accepts a key that is not reserved', async () => {
    await expect(validateKey('red-hat-team', { isCluster: true })).resolves.toBe('red-hat-team');
  });

  it('rejects duplicate keys', async () => {
    await expect(validateKey('env')).rejects.toThrow('Each AWS tag must have a different key.');
  });

  it('rejects more tags than the max count', async () => {
    const awsTags = [
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
    ];
    await expect(
      getAwsTagsValidationSchema(awsTags, { isHypershift: true, maxCount: 1 }).validate(awsTags),
    ).rejects.toThrow('You can add at most 1 AWS tags.');
  });
});
