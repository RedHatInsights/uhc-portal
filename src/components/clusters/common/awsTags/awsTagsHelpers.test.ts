import {
  awsTagsToRows,
  buildAwsTagsPatch,
  canEditAwsTagsForVersion,
  getAWSTags,
  getOwnAwsTags,
  isProtectedAwsTagKey,
  splitAwsTags,
  SYSTEM_TAG_REASON,
} from './awsTagsHelpers';

describe('awsTagsHelpers', () => {
  describe('canEditAwsTagsForVersion', () => {
    it.each([
      ['4.19.9', false],
      ['4.20.0', true],
      ['4.20.0-rc.1', true],
      ['4.21.3', true],
      ['', false],
      [undefined, false],
    ])('returns the expected value for version "%s"', (version, expected) => {
      expect(canEditAwsTagsForVersion(version)).toBe(expected);
    });
  });

  describe('isProtectedAwsTagKey', () => {
    it.each([
      ['red-hat-managed', true],
      ['red-hat-clustertype', true],
      ['api.openshift.com/id', true],
      ['kubernetes.io/cluster/abc', true],
      ['k8s.io/role', true],
      ['openshift.io/foo', true],
      ['sigs.k8s.io/cluster-api-provider-aws/cluster/abc', true],
      ['red-hat-foo', false],
      ['env', false],
      ['Name', false],
    ])('returns the expected value for key "%s"', (key, expected) => {
      expect(isProtectedAwsTagKey(key)).toBe(expected);
    });

    it('protects "Name" only for cluster tags', () => {
      expect(isProtectedAwsTagKey('Name', { isCluster: true })).toBe(true);
    });
  });

  describe('splitAwsTags', () => {
    it('separates system and inherited tags from editable tags', () => {
      expect(
        splitAwsTags(
          {
            env: 'prod',
            team: 'payments',
            owner: 'bob',
            'red-hat-managed': 'true',
          },
          { inheritedTags: { team: 'payments', owner: 'alice' } },
        ),
      ).toEqual({
        editable: { env: 'prod', owner: 'bob' },
        inherited: { team: 'payments' },
        overridden: { owner: 'alice' },
        readOnly: [{ key: 'red-hat-managed', value: 'true', reason: SYSTEM_TAG_REASON }],
      });
    });

    it('handles undefined tags', () => {
      expect(splitAwsTags(undefined)).toEqual({
        editable: {},
        inherited: {},
        overridden: {},
        readOnly: [],
      });
    });
  });

  describe('awsTagsToRows and getAWSTags', () => {
    it('returns a single empty row when there are no tags', () => {
      expect(awsTagsToRows({})).toEqual([{ key: '', value: '' }]);
      expect(getAWSTags([{ key: '', value: '' }])).toEqual({});
    });

    it('converts between rows and tags', () => {
      const rows = [
        { key: 'env', value: 'prod' },
        { key: 'team', value: 'payments' },
      ];
      expect(getAWSTags(rows)).toEqual({ env: 'prod', team: 'payments' });
      expect(awsTagsToRows({ env: 'prod', team: 'payments' })).toEqual(rows);
    });

    it('puts inherited, then overridden, cluster tags first with their cluster value', () => {
      expect(
        awsTagsToRows({ env: 'prod', owner: 'bob' }, { team: 'payments' }, { owner: 'alice' }),
      ).toEqual([
        { key: 'team', value: 'payments', inheritedValue: 'payments' },
        { key: 'owner', value: 'bob', inheritedValue: 'alice' },
        { key: 'env', value: 'prod' },
      ]);
    });
  });

  describe('getOwnAwsTags', () => {
    it('excludes cluster tags that use the cluster value and keeps overrides', () => {
      expect(
        getOwnAwsTags([
          { key: 'team', value: 'payments', inheritedValue: 'payments' },
          { key: 'owner', value: 'bob', inheritedValue: 'alice' },
          { key: 'env', value: 'prod' },
        ]),
      ).toEqual({ owner: 'bob', env: 'prod' });
    });
  });

  describe('tag keys that match Object.prototype members', () => {
    it('does not treat prototype members as inherited cluster tags', () => {
      expect(
        splitAwsTags({ constructor: 'a', toString: 'b' }, { inheritedTags: { env: 'prod' } }),
      ).toEqual({
        editable: { constructor: 'a', toString: 'b' },
        inherited: {},
        overridden: {},
        readOnly: [],
      });
    });

    it('keeps "__proto__" as a tag key', () => {
      const tags = getAWSTags([
        { key: '__proto__', value: 'a' },
        { key: 'env', value: 'prod' },
      ]);
      expect(Object.keys(tags)).toEqual(['__proto__', 'env']);
      expect(Object.getPrototypeOf(tags)).toBe(Object.prototype);
    });

    it('sends null when a prototype-named tag is removed', () => {
      expect(buildAwsTagsPatch({ toString: 'a', constructor: 'b' }, {})).toEqual({
        toString: null,
        constructor: null,
      });
    });

    it('sends a newly added prototype-named tag', () => {
      expect(buildAwsTagsPatch({}, { constructor: 'a' })).toEqual({ constructor: 'a' });
    });
  });

  describe('buildAwsTagsPatch', () => {
    it('includes added and changed tags and sets removed tags to null', () => {
      expect(
        buildAwsTagsPatch(
          { env: 'prod', team: 'old', owner: 'alice' },
          { env: 'prod', team: 'new', cost: '42' },
        ),
      ).toEqual({ team: 'new', cost: '42', owner: null });
    });

    it('returns an empty patch when nothing changed', () => {
      expect(buildAwsTagsPatch({ env: 'prod' }, { env: 'prod' })).toEqual({});
    });
  });
});
