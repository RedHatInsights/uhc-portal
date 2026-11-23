// Helpers for known false-positive annotation.

const STATUS_MARKER = {
  knownFalsePositive: '🟡',
  actionable: '🔴',
};

/**
 * Known URL patterns that produce expected (non-actionable) errors.
 * Each entry maps a regex to a short explanation shown in the output.
 */
const KNOWN_FALSE_POSITIVES = [
  {
    pattern: /join\.slack\.com\/.*shared_invite/,
    reason: 'Slack invite links block programmatic access (expected 403)',
  },
  {
    pattern: /console\.cloud\.google\.com/,
    reason: 'Google Cloud Console returns oversized headers that exceed node-fetch limits',
  },
];

/**
 * Returns a contextual note if a URL matches a known false-positive pattern.
 * @param {string} url
 * @returns {string|null}
 */
const getKnownFalsePositiveNote = (url) => {
  const match = KNOWN_FALSE_POSITIVES.find(({ pattern }) => pattern.test(url));
  return match ? match.reason : null;
};

/**
 * Classifies a broken result using the URL that matches KNOWN_FALSE_POSITIVES
 * (redirect destination when present, original URL otherwise).
 * @param {string} url
 * @param {string} [redirectUrl]
 * @returns {string|null}
 */
const getKnownFalsePositiveNoteForBrokenLink = (url, redirectUrl) =>
  (redirectUrl && getKnownFalsePositiveNote(redirectUrl)) || getKnownFalsePositiveNote(url);

/**
 * @param {string|null} note - Known false positive reason
 * @returns {string} 🟡 for known false positives, 🔴 for actionable errors
 */
const errorMarker = (note) => (note ? STATUS_MARKER.knownFalsePositive : STATUS_MARKER.actionable);

/**
 * @param {number} totalErrors
 * @param {number} knownFalsePositives
 * @returns {number}
 */
const getActionableErrorCount = (totalErrors, knownFalsePositives) =>
  totalErrors - knownFalsePositives;

/**
 * @param {number} knownFalsePositives
 * @param {number} actionableErrors
 * @returns {string}
 */
const formatSummaryStatusLine = (knownFalsePositives, actionableErrors) => {
  const statusCounts = `(${knownFalsePositives} known false positives ${STATUS_MARKER.knownFalsePositive}, ${actionableErrors} actionable ${STATUS_MARKER.actionable})`;
  return actionableErrors > 0 ? `👎 Issues found ${statusCounts}` : `👍 All clear ${statusCounts}`;
};

/**
 * @param {Object} item
 * @returns {boolean}
 */
const isRedirectTestError = (item) =>
  Boolean(item.error || (item.finalStatus && (item.finalStatus < 200 || item.finalStatus >= 300)));

/**
 * Counts broken results whose URL matches KNOWN_FALSE_POSITIVES.
 * Redirect failures are classified using the matching URL.
 * @param {Object} categories
 * @param {Array} [testedRedirects]
 * @returns {number}
 */
const countKnownFalsePositives = (categories, testedRedirects = []) => {
  const { clientErrors, serverErrors, errors } = categories;
  let count = 0;

  [...clientErrors, ...serverErrors, ...errors].forEach(({ url }) => {
    if (getKnownFalsePositiveNote(url)) {
      count += 1;
    }
  });

  testedRedirects.forEach((item) => {
    if (
      isRedirectTestError(item) &&
      getKnownFalsePositiveNoteForBrokenLink(item.originalUrl, item.redirectUrl)
    ) {
      count += 1;
    }
  });

  return count;
};

export {
  countKnownFalsePositives,
  errorMarker,
  formatSummaryStatusLine,
  getActionableErrorCount,
  getKnownFalsePositiveNote,
  getKnownFalsePositiveNoteForBrokenLink,
  isRedirectTestError,
  STATUS_MARKER,
};
