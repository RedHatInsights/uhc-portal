import { Chrome } from '~/types/types';

import { ENV_OVERRIDE_LOCALSTORAGE_KEY } from './common/localStorageConstants';

describe('config', () => {
  const originalAppDevServer = (global as any).APP_DEV_SERVER;
  const mockChrome = { isBeta: () => false, getEnvironment: () => 'prod' };

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    (global as any).APP_DEV_SERVER = originalAppDevServer;
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
});
