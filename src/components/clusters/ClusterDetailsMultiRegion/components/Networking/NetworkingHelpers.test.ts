import { getHostnameFromUrl, shouldShowConsoleUrlPendingAlert } from './NetworkingHelpers';

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

describe('shouldShowConsoleUrlPendingAlert', () => {
  it('is hidden when Console hostname is empty and console URL is on a default-shaped host', () => {
    expect(
      shouldShowConsoleUrlPendingAlert('', 'https://console-openshift-console.apps.example.com'),
    ).toBe(false);
    expect(
      shouldShowConsoleUrlPendingAlert(
        undefined,
        'https://console-openshift-console.apps.other-domain.example.com',
      ),
    ).toBe(false);
  });

  it('is shown when Console hostname is cleared but console URL is still on the custom host', () => {
    expect(shouldShowConsoleUrlPendingAlert('', 'https://console.example.com')).toBe(true);
  });

  it('is hidden when Console hostname matches the console URL hostname', () => {
    expect(
      shouldShowConsoleUrlPendingAlert('console.example.com', 'https://console.example.com/'),
    ).toBe(false);
  });

  it('is shown when Console hostname does not match the console URL hostname', () => {
    expect(
      shouldShowConsoleUrlPendingAlert(
        'console.example.com',
        'https://console-openshift-console.apps.example.com',
      ),
    ).toBe(true);
  });

  it('is shown when Console hostname is set and console URL is missing', () => {
    expect(shouldShowConsoleUrlPendingAlert('console.example.com', undefined)).toBe(true);
    expect(shouldShowConsoleUrlPendingAlert('console.example.com', '')).toBe(true);
  });

  it('is hidden when Console hostname is empty and console URL is missing', () => {
    expect(shouldShowConsoleUrlPendingAlert('', undefined)).toBe(false);
  });
});
