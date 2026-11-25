import docLinks from '~/common/docLinks.mjs';

export const rosaHandsOnLinks = {
  slackChannel: docLinks.ROSA_COMMUNITY_SLACK,
  learnMore: docLinks.RH_ROSA,
  getStarted: '/create/rosa/getstarted',
  customerSuccess: 'mailto:openshift-rosa@redhat.com',
};

export const UNAUTHORIZED = 'unauthorized';

export const MAX_DURATION = 8;

/** StatusAlert banner — used by Playwright when PF Alert (component="span") has no role. */
export const ROSA_HANDS_ON_STATUS_ALERT_TEST_ID = 'rosa-hands-on-status-alert';
