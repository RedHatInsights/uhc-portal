import { isMajorMinorEqualOrGreater } from '~/common/versionHelpers';

/* When changing, consider updating the COnfiguration and NetworkScreen components as well (they contain 4.13-specific logic */
export const canConfigureDayTwoManagedIngress = (clusterVersionRawId: string): boolean =>
  isMajorMinorEqualOrGreater(clusterVersionRawId, 4, 13);

export const canConfigureLoadBalancer = (
  clusterVersionRawId: string,
  isSTSEnabled: boolean,
): boolean => !isSTSEnabled || canConfigureDayTwoManagedIngress(clusterVersionRawId);

/** Returns the hostname portion of a URL, or '' if missing/invalid. */
export const getHostnameFromUrl = (url?: string): string => {
  if (!url) {
    return '';
  }
  try {
    const normalized = url.includes('://') ? url : `https://${url}`;
    return new URL(normalized).hostname;
  } catch {
    return '';
  }
};

/** Default OpenShift console route hostname prefix (`console` + `openshift-console` namespace). */
const DEFAULT_CONSOLE_HOSTNAME_PREFIX = 'console-openshift-console.';

const isDefaultConsoleHostname = (hostname: string): boolean =>
  hostname.startsWith(DEFAULT_CONSOLE_HOSTNAME_PREFIX);

/**
 * True when Cluster console URL has not yet caught up to the configured Console hostname,
 * or (after clear) is still not on a default-shaped console-openshift-console.* host.
 */
export const shouldShowConsoleUrlPendingAlert = (
  consoleHostname?: string,
  consoleUrl?: string,
): boolean => {
  const configuredHostname = consoleHostname?.trim().toLowerCase() || '';
  const consoleUrlHostname = getHostnameFromUrl(consoleUrl).toLowerCase();

  if (configuredHostname) {
    return configuredHostname !== consoleUrlHostname;
  }

  if (!consoleUrlHostname) {
    return false;
  }
  return !isDefaultConsoleHostname(consoleUrlHostname);
};
