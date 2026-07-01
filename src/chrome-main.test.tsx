// Heavy deps that run code at module load time are mocked so chrome-main can be imported cleanly.
// The dynamic import('./mocks/browser') is also mocked; the factory survives jest.resetModules()
// so chrome-main and the test share the same worker instance within each test.

jest.mock('@openshift-assisted/ui-lib/ocm', () => ({
  Api: { setAuthInterceptor: jest.fn() },
  Config: { setRouteBasePath: jest.fn() },
  Services: {
    APIs: { ClustersAPI: { listBySubscriptionIds: jest.fn(), get: jest.fn() } },
    NewFeatureSupportLevelsService: { getFeaturesSupportLevel: jest.fn() },
  },
}));
jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => jest.fn());
jest.mock('@redhat-cloud-services/frontend-components-notifications', () => ({
  NotificationsProvider: jest.fn(),
}));
jest.mock('@redhat-cloud-services/frontend-components-notifications/NotificationPortal', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@sentry/browser', () => ({
  init: jest.fn(),
  getCurrentScope: jest.fn(() => ({ setUser: jest.fn() })),
  globalHandlersIntegration: jest.fn(),
}));
jest.mock('@sentry/integrations', () => ({ sessionTimingIntegration: jest.fn() }));
jest.mock('~/queries/featureGates/useFetchFeatureGate', () => ({
  preFetchAllFeatureGates: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('./components/App/App', () => ({ __esModule: true, default: () => null }));
jest.mock('./hooks/useAnalytics', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('./i18n', () => {});
jest.mock('./mocks/browser', () => ({ worker: { start: jest.fn() } }));

describe('chrome-main', () => {
  const originalAppDevMode = (global as any).APP_DEVMODE;

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    (global as any).APP_DEVMODE = originalAppDevMode;
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  describe('MSW worker initialization', () => {
    it('starts MSW worker when APP_DEVMODE is true and localStorage contains msw', async () => {
      (global as any).APP_DEVMODE = true;
      localStorage.setItem('ocmOverridenEnvironment', 'msw');

      await import('./chrome-main');
      // flush the microtask queue so the dynamic import's .then() callback runs
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

      const { worker } = await import('./mocks/browser');
      expect(worker.start).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' });
    });

    it('starts MSW worker when APP_DEVMODE is true and ?env=msw is in the URL', async () => {
      (global as any).APP_DEVMODE = true;
      window.history.pushState({}, '', '?env=msw');

      await import('./chrome-main');
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

      const { worker } = await import('./mocks/browser');
      expect(worker.start).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' });
    });

    it('does not start MSW worker when APP_DEVMODE is false', async () => {
      (global as any).APP_DEVMODE = false;
      localStorage.setItem('ocmOverridenEnvironment', 'msw');

      await import('./chrome-main');
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

      const { worker } = await import('./mocks/browser');
      expect(worker.start).not.toHaveBeenCalled();
    });
  });
});
