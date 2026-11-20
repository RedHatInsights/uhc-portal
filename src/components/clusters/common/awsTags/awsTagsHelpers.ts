import semver from 'semver';

// On a node pool, rows for cluster tags carry the cluster value in `inheritedValue`: the key is locked
// and a different value overrides the cluster tag for that node pool
export type AwsTagRow = { key: string; value: string; inheritedValue?: string };

export type AwsTags = Record<string, string>;

// A `null` value removes the tag; omitted keys are left unchanged (the API merges tags).
export type AwsTagsPatch = Record<string, string | null>;

export type ReadOnlyAwsTag = AwsTagRow & { reason: string };

export const AWS_TAGS_EDIT_MIN_VERSION = '4.20.0';

// Max number of user-defined tags on a ROSA HCP cluster (25 AWS tags minus those reserved by the service)
export const MAX_CLUSTER_AWS_TAGS = 18;

export const AWS_TAGS_EDIT_VERSION_REASON = `Editing AWS tags requires OpenShift version ${AWS_TAGS_EDIT_MIN_VERSION} or above.`;

export const SYSTEM_TAG_REASON = 'Managed by Red Hat';

const PROTECTED_TAG_KEYS = ['red-hat-managed', 'red-hat-clustertype'];

const PROTECTED_TAG_PREFIXES = [
  'api.openshift.com/',
  'kubernetes.io',
  'k8s.io',
  'openshift.io',
  'sigs.k8s.io/cluster-api-provider-aws/cluster/',
];

// ROSA HCP clusters always use a customer VPC, where "Name" is reserved at the cluster level
const PROTECTED_CLUSTER_TAG_KEYS = ['Name'];

/** Whether AWS tags can be edited day-2 on a cluster with the given OpenShift version (4.20+). */
export const canEditAwsTagsForVersion = (clusterVersion?: string): boolean => {
  const coercedVersion = semver.coerce(clusterVersion);
  return coercedVersion ? semver.gte(coercedVersion, AWS_TAGS_EDIT_MIN_VERSION) : false;
};

// Tag keys are user data and can match Object.prototype members (e.g. "constructor", "__proto__"),
// so check own properties and build maps with Object.fromEntries, which keeps them as data keys
const hasTag = (tags: AwsTags, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(tags, key);

/**
 * Whether a tag key is managed by Red Hat and cannot be set or removed by users.
 * `Name` is only reserved for cluster tags.
 */
export const isProtectedAwsTagKey = (key: string, { isCluster = false } = {}): boolean =>
  PROTECTED_TAG_KEYS.includes(key) ||
  PROTECTED_TAG_PREFIXES.some((prefix) => key.startsWith(prefix)) ||
  (isCluster && PROTECTED_CLUSTER_TAG_KEYS.includes(key));

/**
 * Splits tags returned by the API into system tags managed by the service (read-only),
 * tags inherited from the cluster (for node pools), and the remaining user tags.
 * `overridden` maps user tags that override a cluster tag to the cluster value.
 */
export const splitAwsTags = (
  tags: AwsTags | undefined,
  { isCluster = false, inheritedTags }: { isCluster?: boolean; inheritedTags?: AwsTags } = {},
): { editable: AwsTags; inherited: AwsTags; overridden: AwsTags; readOnly: ReadOnlyAwsTag[] } => {
  const editable: [string, string][] = [];
  const inherited: [string, string][] = [];
  const overridden: [string, string][] = [];
  const readOnly: ReadOnlyAwsTag[] = [];

  Object.entries(tags || {}).forEach(([key, value]) => {
    const inheritedValue =
      inheritedTags && hasTag(inheritedTags, key) ? inheritedTags[key] : undefined;
    if (isProtectedAwsTagKey(key, { isCluster })) {
      readOnly.push({ key, value, reason: SYSTEM_TAG_REASON });
    } else if (inheritedValue === value) {
      inherited.push([key, value]);
    } else {
      editable.push([key, value]);
      if (inheritedValue !== undefined) {
        overridden.push([key, inheritedValue]);
      }
    }
  });

  return {
    editable: Object.fromEntries(editable),
    inherited: Object.fromEntries(inherited),
    overridden: Object.fromEntries(overridden),
    readOnly,
  };
};

/** Builds form rows: cluster tags (inherited, then overridden) first, then the remaining tags. */
export const awsTagsToRows = (
  tags: AwsTags,
  inheritedTags: AwsTags = {},
  overriddenTags: AwsTags = {},
): AwsTagRow[] => {
  const tagEntries = Object.entries(tags);
  const rows: AwsTagRow[] = [
    ...Object.entries(inheritedTags).map(([key, value]) => ({ key, value, inheritedValue: value })),
    ...tagEntries
      .filter(([key]) => hasTag(overriddenTags, key))
      .map(([key, value]) => ({ key, value, inheritedValue: overriddenTags[key] })),
    ...tagEntries
      .filter(([key]) => !hasTag(overriddenTags, key))
      .map(([key, value]) => ({ key, value })),
  ];
  return rows.length > 0 ? rows : [{ key: '', value: '' }];
};

/** Converts form rows into a tags map; a single empty placeholder row means no tags. */
export const getAWSTags = (awsTags: AwsTagRow[]): AwsTags =>
  awsTags.length === 1 && !awsTags[0].key
    ? {}
    : Object.fromEntries(awsTags.map(({ key, value }) => [key, value]));

/** A node pool's own tags: excludes cluster tags that are not overridden (they use the cluster value). */
export const getOwnAwsTags = (awsTags: AwsTagRow[]): AwsTags =>
  getAWSTags(
    awsTags.filter(
      ({ value, inheritedValue }) => inheritedValue === undefined || value !== inheritedValue,
    ),
  );

/**
 * Builds the PATCH body for a tags update: new or changed tags with their value,
 * removed tags as `null`, and unchanged tags omitted (the API merges tags).
 */
export const buildAwsTagsPatch = (initial: AwsTags, next: AwsTags): AwsTagsPatch => {
  const changed = Object.entries(next).filter(
    ([key, value]) => !hasTag(initial, key) || initial[key] !== value,
  );
  const removed = Object.keys(initial)
    .filter((key) => !hasTag(next, key))
    .map((key): [string, null] => [key, null]);

  return Object.fromEntries([...changed, ...removed]);
};
