import semver from 'semver';

const ROSA_DOCS_PATH = 'red_hat_openshift_service_on_aws';
const DOCS_BASE = 'https://docs.redhat.com/en/documentation';
const CP_DOCS_BASE = 'https://access.redhat.com/documentation/en-us';

/**
 * Maps OCP major version to the docs version slug.
 * Today all versions map to /4/ per the Docs team's Option 1 decision
 * (ROSA 5.0 Linking Options). Flip 5 → 5 when Docs publishes /5/html URLs.
 */
const DOC_VERSION_MAP = {
  4: 4,
  5: 4,
};

const DEFAULT_DOC_VERSION = 4;

/**
 * Resolves the docs version slug for a given cluster OpenShift version.
 * Missing, invalid, or unmapped majors fall back to 4.
 *
 * @param {string} [clusterVersion]
 * @returns {number}
 */
export const getRosaDocsVersionSlug = (clusterVersion) => {
  const parsed = semver.coerce(clusterVersion);
  const major = parsed?.major ?? DEFAULT_DOC_VERSION;
  return DOC_VERSION_MAP[major] ?? DEFAULT_DOC_VERSION;
};

/**
 * ROSA HCP docs base on docs.redhat.com.
 *
 * @param {string} [clusterVersion]
 * @returns {string}
 */
export const getRosaDocsBase = (clusterVersion) => {
  const docVersion = getRosaDocsVersionSlug(clusterVersion);
  return `${DOCS_BASE}/${ROSA_DOCS_PATH}/${docVersion}/html`;
};

/**
 * ROSA HCP docs base on access.redhat.com (Customer Portal).
 *
 * @param {string} [clusterVersion]
 * @returns {string}
 */
export const getRosaCpDocsBase = (clusterVersion) => {
  const docVersion = getRosaDocsVersionSlug(clusterVersion);
  return `${CP_DOCS_BASE}/${ROSA_DOCS_PATH}/${docVersion}/html`;
};

/**
 * ROSA HCP docs root on access.redhat.com (no /html suffix).
 *
 * @param {string} [clusterVersion]
 * @returns {string}
 */
export const getRosaCpDocsRoot = (clusterVersion) => {
  const docVersion = getRosaDocsVersionSlug(clusterVersion);
  return `${CP_DOCS_BASE}/${ROSA_DOCS_PATH}/${docVersion}`;
};
