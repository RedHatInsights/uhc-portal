/**
 * Route path constants for Cypress tests.
 * Use these constants instead of hardcoding paths to ensure consistency
 * and make route changes easier to manage.
 */

/** Base path for the OCM application */
export const OCM_BASE_PATH = '/openshift';

/** Cluster list path (relative) */
export const CLUSTER_LIST_PATH = '/clusters/list';

/** Full cluster list path including base path */
export const CLUSTER_LIST_FULL_PATH = `${OCM_BASE_PATH}${CLUSTER_LIST_PATH}`;
