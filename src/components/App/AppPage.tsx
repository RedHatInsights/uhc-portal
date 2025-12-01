import React, { PropsWithChildren, useEffect } from 'react';

import { RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';

import config from '../../config';

import { AppDrawer } from './AppDrawer';
import EnvOverrideMessage from './EnvOverrideMessage';
import ErrorBoundary from './ErrorBoundary';
import RestrictedEnvOverrideMessage from './RestrictedEnvOverrideMessage';

export const AppPage: React.FC<PropsWithChildren<{ title?: string; showTabbedView?: boolean }>> = ({
  children,
  title,
  showTabbedView,
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const restrictedEnvOverride = !!localStorage.getItem(RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY);
  return (
    <AppDrawer>
      <div className="pf-v6-u-display-flex pf-v6-u-flex-direction-row">
        {restrictedEnvOverride && !showTabbedView && <RestrictedEnvOverrideMessage />}
        {config.envOverride && !showTabbedView && <EnvOverrideMessage env={config.envOverride} />}
      </div>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AppDrawer>
  );
};
