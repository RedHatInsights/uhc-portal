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

/**
 * True when a custom Console hostname is configured and Cluster console URL
 * has not yet reconciled to that hostname.
 */
export const shouldShowConsoleUrlPendingAlert = (
  consoleHostname?: string,
  consoleUrl?: string,
): boolean => {
  const configuredHostname = consoleHostname?.trim() || '';

  if (!configuredHostname) {
    return false;
  }
  return configuredHostname.toLowerCase() !== getHostnameFromUrl(consoleUrl).toLowerCase();
};
