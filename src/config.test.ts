import { Chrome } from '~/types/types';

import { ENV_OVERRIDE_LOCALSTORAGE_KEY } from './common/localStorageConstants';

describe('config', () => {
  const originalAppDevServer = (global as any).APP_DEV_SERVER;
  const originalAppDevMode = (global as any).APP_DEVMODE;
  const mockChrome = { isBeta: () => false, getEnvironment: () => 'prod' };

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    (global as any).APP_DEV_SERVER = originalAppDevServer;
    (global as any).APP_DEVMODE = originalAppDevMode;
    localStorage.clear();
  });

  describe('APP_DEV_SERVER mockdata loading', () => {
    it('loads mockdata config when APP_DEV_SERVER is true', async () => {
      (global as any).APP_DEV_SERVER = true;
      localStorage.setItem(ENV_OVERRIDE_LOCALSTORAGE_KEY, 'mockdata');

      const { default: config } = await import('./config');
      await config.fetchConfig(mockChrome as Chrome);

      expect(config.configData.showOldMetrics).toBe(true);
      expect(config.configData.apiGateway).toContain('/mockdata');
      expect(config.envOverride).toBe('mockdata');
    });

    it('does not load mockdata config when APP_DEV_SERVER is false', async () => {
      (global as any).APP_DEV_SERVER = false;
      localStorage.setItem(ENV_OVERRIDE_LOCALSTORAGE_KEY, 'mockdata');

      const { default: config } = await import('./config');
      await config.fetchConfig(mockChrome as Chrome);

      // mockdata is not available, so it falls back to default (production)
      expect(config.configData.showOldMetrics).toBeUndefined();
      expect(config.configData.apiGateway).toBe('https://api.openshift.com');
      expect(config.envOverride).toBeUndefined();
    });
  });

  describe('MSW env override', () => {
    afterEach(() => {
      window.history.pushState({}, '', '/');
    });

    it('sets envOverride to msw and persists to localStorage when APP_DEVMODE is true and localStorage contains msw', async () => {
      (global as any).APP_DEVMODE = true;
      localStorage.setItem(ENV_OVERRIDE_LOCALSTORAGE_KEY, 'msw');

      const { default: config } = await import('./config');
      await config.fetchConfig(mockChrome as Chrome);

      expect(config.envOverride).toBe('msw');
      expect(localStorage.getItem(ENV_OVERRIDE_LOCALSTORAGE_KEY)).toBe('msw');
      expect(config.configData.apiGateway).toBe('https://api.openshift.com');
    });

    it('falls through to default config and does not set envOverride when APP_DEVMODE is false and localStorage contains msw', async () => {
      (global as any).APP_DEVMODE = false;
      localStorage.setItem(ENV_OVERRIDE_LOCALSTORAGE_KEY, 'msw');

      const { default: config } = await import('./config');
      await config.fetchConfig(mockChrome as Chrome);

      expect(config.envOverride).toBeUndefined();
      expect(config.configData.apiGateway).toBe('https://api.openshift.com');
    });

    it('sets envOverride to msw and persists to localStorage when APP_DEVMODE is true and ?env=msw is in the URL', async () => {
      (global as any).APP_DEVMODE = true;
      window.history.pushState({}, '', '?env=msw');

      const { default: config } = await import('./config');
      await config.fetchConfig(mockChrome as Chrome);

      expect(config.envOverride).toBe('msw');
      expect(localStorage.getItem(ENV_OVERRIDE_LOCALSTORAGE_KEY)).toBe('msw');
    });

    it('ignores ?env=msw in the URL and uses default config when APP_DEVMODE is false', async () => {
      (global as any).APP_DEVMODE = false;
      window.history.pushState({}, '', '?env=msw');

      const { default: config } = await import('./config');
      await config.fetchConfig(mockChrome as Chrome);

      expect(config.envOverride).toBeUndefined();
      expect(localStorage.getItem(ENV_OVERRIDE_LOCALSTORAGE_KEY)).toBeNull();
    });
  });
});
