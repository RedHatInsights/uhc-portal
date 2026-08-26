/**
 * @jest-environment-options {"url": "https://console.dev.redhat.com/openshift/token/show?code=test&state=test&session_state=test"}
 */

import { doOffline } from '../TokenUtils';

const OFFLINE_REDIRECT_STORAGE_KEY = 'chrome.offline.redirectUri';

describe('TokenUtils', () => {
  describe('doOffline', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('builds redirect_uri from origin and pathname without OIDC callback params', () => {
      doOffline(jest.fn());

      const redirectUri = localStorage.getItem(OFFLINE_REDIRECT_STORAGE_KEY);

      expect(redirectUri).toBe(
        'https://console.dev.redhat.com/openshift/token/show?noauth=2402500adeacc30eb5c5a8a5e2e0ec1f',
      );
      expect(redirectUri).not.toContain('code=');
      expect(redirectUri).not.toContain('state=');
      expect(redirectUri).not.toContain('session_state=');
    });
  });
});
