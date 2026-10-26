import { isSupportedMinorVersion } from '~/common/helpers';
import { isRestrictedEnv } from '~/restrictedEnv';

/** Last OCP minor with full CMVP approval (4.18.x). */
const FULL_CMVP_APPROVAL_MAX_MINOR = '4.18';

/** Upgrade wizard only: restricted env + current version still on the full-CMVP line (<= 4.18). */
const shouldShowRosaGovCloudFipsWarningOnUpgrade = (clusterVersion?: string): boolean =>
  !!clusterVersion &&
  isRestrictedEnv() &&
  isSupportedMinorVersion(clusterVersion, FULL_CMVP_APPROVAL_MAX_MINOR);

export { FULL_CMVP_APPROVAL_MAX_MINOR, shouldShowRosaGovCloudFipsWarningOnUpgrade };
