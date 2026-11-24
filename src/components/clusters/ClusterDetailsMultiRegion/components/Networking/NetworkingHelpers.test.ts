import {
  getDefaultConsoleHostname,
  getHostnameFromUrl,
  shouldShowConsoleUrlPendingAlert,
} from './NetworkingHelpers';

describe('getHostnameFromUrl', () => {
  it('returns hostname from a full URL', () => {
    expect(getHostnameFromUrl('https://console.example.com/')).toBe('console.example.com');
  });

  it('returns empty string for missing or invalid URLs', () => {
    expect(getHostnameFromUrl(undefined)).toBe('');
    expect(getHostnameFromUrl('')).toBe('');
    expect(getHostnameFromUrl('not a url')).toBe('');
  });
});

describe('getDefaultConsoleHostname', () => {
  it('builds the default console hostname from the application router address', () => {
    expect(getDefaultConsoleHostname('apps.example.com')).toBe(
      'console-openshift-console.apps.example.com',
    );
  });

  it('returns empty string when router address is missing', () => {
    expect(getDefaultConsoleHostname(undefined)).toBe('');
    expect(getDefaultConsoleHostname('')).toBe('');
  });
});

describe('shouldShowConsoleUrlPendingAlert', () => {
  const defaultRouterAddress = 'apps.example.com';

  it('is hidden when Console hostname is empty and console URL is already on the default host', () => {
    expect(
      shouldShowConsoleUrlPendingAlert(
        '',
        'https://console-openshift-console.apps.example.com',
        defaultRouterAddress,
      ),
    ).toBe(false);
    expect(
      shouldShowConsoleUrlPendingAlert(
        undefined,
        'https://console-openshift-console.apps.example.com',
        defaultRouterAddress,
      ),
    ).toBe(false);
  });

  it('is shown when Console hostname is cleared but console URL is still on the custom host', () => {
    expect(
      shouldShowConsoleUrlPendingAlert('', 'https://console.example.com', defaultRouterAddress),
    ).toBe(true);
  });

  it('is hidden when Console hostname matches the console URL hostname', () => {
    expect(
      shouldShowConsoleUrlPendingAlert(
        'console.example.com',
        'https://console.example.com/',
        defaultRouterAddress,
      ),
    ).toBe(false);
  });

  it('is shown when Console hostname does not match the console URL hostname', () => {
    expect(
      shouldShowConsoleUrlPendingAlert(
        'console.example.com',
        'https://console-openshift-console.apps.example.com',
        defaultRouterAddress,
      ),
    ).toBe(true);
  });

  it('is shown when Console hostname is set and console URL is missing', () => {
    expect(
      shouldShowConsoleUrlPendingAlert('console.example.com', undefined, defaultRouterAddress),
    ).toBe(true);
    expect(shouldShowConsoleUrlPendingAlert('console.example.com', '', defaultRouterAddress)).toBe(
      true,
    );
  });

  it('is hidden when Console hostname is empty and console URL is missing', () => {
    expect(shouldShowConsoleUrlPendingAlert('', undefined, defaultRouterAddress)).toBe(false);
  });
});
