// This module has .mjs extension to simplify importing from NodeJS scripts.
// Support-related URLs for Red Hat Customer Portal and Knowledge Base articles

import { combineAndSortLinks } from './linkUtils.mjs';

const BASE_URL = 'https://access.redhat.com/';
const SUPPORT_URL = `${BASE_URL}support/`;
const ARTICLES_URL = `${BASE_URL}articles/`;
const SOLUTIONS_URL = `${BASE_URL}solutions/`;
const SECURITY_URL = `${BASE_URL}security/`;

const supportLinks = {
  // Support Case Management
  SUPPORT_CASE_NEW: `${SUPPORT_URL}cases/#/case/new`,
  SUPPORT_CASE_NEW_WITH_ISSUE: `${SUPPORT_URL}cases/#/case/new/open-case/describe-issue`,
  SUPPORT_CASE_VIEW: `${SUPPORT_URL}cases/#/case`,
  SUPPORT_HOME: SUPPORT_URL,

  // Knowledge Base Articles
  EXPORT_CONTROL_KB: `${ARTICLES_URL}1340183`,
  OFFLINE_TOKENS_KB: `${ARTICLES_URL}7074172`,
  ARCHIVE_CLUSTER_KB: `${ARTICLES_URL}4397891`,
  BILLING_MODEL_KB: `${ARTICLES_URL}5990101`,
  PULL_SECRET_CHANGE_KB: `${SOLUTIONS_URL}4902871`,

  // Support Policies and Classifications
  OPENSHIFT_SUPPORT_POLICY: `${SUPPORT_URL}policy/updates/openshift`,
  OPENSHIFT_POLICY_UPDATES: `${SUPPORT_URL}policy/updates/openshift/policies`,
  SECURITY_CLASSIFICATION_CRITICAL: `${SECURITY_URL}updates/classification/#critical`,
};

const getLinks = async () => combineAndSortLinks(Object.values(supportLinks));

export { getLinks };
export default supportLinks;
