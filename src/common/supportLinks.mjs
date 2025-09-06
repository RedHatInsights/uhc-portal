// This module has .mjs extension to simplify importing from NodeJS scripts.
// Support-related URLs for Red Hat Customer Portal and Knowledge Base articles

import { combineAndSortLinks } from './linkUtils.mjs';

const supportLinks = {
  // Support Case Management
  SUPPORT_CASE_NEW: 'https://access.redhat.com/support/cases/#/case/new',
  SUPPORT_CASE_NEW_WITH_ISSUE:
    'https://access.redhat.com/support/cases/#/case/new/open-case/describe-issue',
  SUPPORT_CASE_VIEW: 'https://access.redhat.com/support/cases/#/case',
  SUPPORT_HOME: 'https://access.redhat.com/support/',

  // Knowledge Base Articles
  EXPORT_CONTROL_KB: 'https://access.redhat.com/articles/1340183',
  OFFLINE_TOKENS_KB: 'https://access.redhat.com/articles/7074172',
  ARCHIVE_CLUSTER_KB: 'https://access.redhat.com/articles/4397891',
  BILLING_MODEL_KB: 'https://access.redhat.com/articles/5990101',
  PULL_SECRET_CHANGE_KB: 'https://access.redhat.com/solutions/4902871',

  // Support Policies and Classifications
  OPENSHIFT_SUPPORT_POLICY: 'https://access.redhat.com/support/policy/updates/openshift',
  OPENSHIFT_POLICY_UPDATES: 'https://access.redhat.com/support/policy/updates/openshift/policies',
  SECURITY_CLASSIFICATION_CRITICAL:
    'https://access.redhat.com/security/updates/classification/#critical',
};

/** Returns all support-related external links. */
const getLinks = async () => combineAndSortLinks(Object.values(supportLinks));

export { getLinks };
export default supportLinks;
