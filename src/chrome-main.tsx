/*
Copyright (c) 2018 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React from 'react';
import { Provider } from 'react-redux';

import * as OCM from '@openshift-assisted/ui-lib/ocm';
import { GenerateId } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { NotificationsProvider } from '@redhat-cloud-services/frontend-components-notifications';
// No type definitions
// @ts-ignore
import NotificationPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import * as Sentry from '@sentry/browser';
import { sessionTimingIntegration } from '@sentry/integrations';

import { trackEvents } from '~/common/analytics';
import { preFetchAllFeatureGates } from '~/queries/featureGates/useFetchFeatureGate';

import App from './components/App/App';
import useAnalytics, { Track } from './hooks/useAnalytics';
import { userInfoResponse } from './redux/actions/userActions';
import { store } from './redux/store';
import { authInterceptor } from './services/apiRequest';
import { Chrome } from './types/types';
import config, { APP_API_ENV } from './config';

import './styles/main.scss';

import './i18n';

const { Api, Config } = OCM;

/**
 * Assisted Installer configuration
 *
 * We need to pass axios auth interceptor so every request from AI has proper headers.
 *
 * We also need to set the route base path for the internal AI routing to work properly.
 */
Api.setAuthInterceptor(authInterceptor);
Config.setRouteBasePath('/assisted-installer');

type Props = {
  chrome: Chrome;
  track: Track;
};

class AppEntry extends React.Component<Props> {
  state = { ready: false };

  componentDidMount() {
    const { chrome, track } = this.props;
    config.dateConfig();
    chrome.on('APP_NAVIGATION', ({ navId, domEvent: { href } }) => {
      track(trackEvents.GlobalSideNav, {
        url: href,
        customProperties: {
          navId,
        },
      });
    });
    chrome.auth.getUser().then((data: any) => {
      if (data?.identity?.user) {
        store.dispatch(userInfoResponse(data.identity.user));
      }
      config.fetchConfig(chrome).then(async () => {
        await preFetchAllFeatureGates();

        this.setState({ ready: true });
        if (!APP_DEV_SERVER && !config.envOverride && config.configData.sentryDSN) {
          Sentry.init({
            dsn: config.configData.sentryDSN,
            ...(APP_SENTRY_RELEASE_VERSION ? { release: APP_SENTRY_RELEASE_VERSION } : {}),
            autoSessionTracking: false,
            integrations: [
              sessionTimingIntegration(),
              Sentry.globalHandlersIntegration({
                onerror: true,
                onunhandledrejection: false,
              }),
            ],
          });
          if (data?.identity?.user) {
            const { email, username } = data.identity.user;
            // add user info to Sentry
            Sentry.getCurrentScope().setUser({ email, username });
          }
        }
      });
      // avoid collisions with generated PF IDs in masthead
      // workaround for:
      //   https://issues.redhat.com/browse/RHCLOUD-31437
      //   https://github.com/patternfly/patternfly-react/issues/10160
      GenerateId.defaultProps = { prefix: 'pf-random-ocmui-id-', isRandom: true };
    });

    if (
      // app is running in local development
      APP_DEV_SERVER ||
      // app is not built in production mode
      APP_DEVMODE ||
      // build is not deployed in a production environment
      APP_API_ENV !== 'production'
    ) {
      chrome.enable.segmentDev();
    }
  }

  render() {
    const { ready } = this.state;
    if (ready) {
      return (
        <Provider store={store}>
          {/* <NotificationPortal /> */}
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </Provider>
      );
    }
    return null;
  }
}

/**
 * Entry point for Chrome 2.0
 *
 * This wrapper exists to call the useChrome hook
 */
const AppEntryWrapper = () => {
  const chrome = useChrome() as Chrome;
  const track = useAnalytics();
  return chrome.initialized ? <AppEntry chrome={chrome} track={track} /> : null;
};

export default AppEntryWrapper;
