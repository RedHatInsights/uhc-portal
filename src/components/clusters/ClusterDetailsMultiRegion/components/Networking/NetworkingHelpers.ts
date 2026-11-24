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

/** Default OpenShift console hostname for a cluster's application router domain. */
export const getDefaultConsoleHostname = (defaultRouterAddress?: string): string => {
  if (!defaultRouterAddress) {
    return '';
  }
  return `console-openshift-console.${defaultRouterAddress}`;
};

/**
 True when Cluster console URL has not yet caught up to the configured Console hostname
 */
export const shouldShowConsoleUrlPendingAlert = (
  consoleHostname?: string,
  consoleUrl?: string,
  defaultRouterAddress?: string,
): boolean => {
  const configuredHostname = consoleHostname?.trim().toLowerCase() || '';
  const consoleUrlHostname = getHostnameFromUrl(consoleUrl).toLowerCase();

  if (configuredHostname) {
    return configuredHostname !== consoleUrlHostname;
  }

  // Custom hostname cleared: show while URL is still not back on the default console host
  if (!consoleUrlHostname) {
    return false;
  }
  const defaultConsoleHostname = getDefaultConsoleHostname(defaultRouterAddress).toLowerCase();
  if (!defaultConsoleHostname) {
    return false;
  }
  return consoleUrlHostname !== defaultConsoleHostname;
};
