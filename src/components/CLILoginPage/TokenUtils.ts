/**
 * Most of the code comes from https://github.com/RedHatInsights/insights-chrome/blob/master/src/js/jwt/jwt.ts
 * Updating it so we can create a hidden iframe to load the token instead
 *
 * TODO: Update doOffline function API in https://github.com/RedHatInsights/insights-chrome/blob/master/src/js/jwt/jwt.ts
 * so that we can provide a callback and skip calling the kc.login method, since we're using an iframe approach.
 * Once the API allows for that, we can remove most of the code here.
 *
 * The general flow:
 * Load token if it's not already in the redux store by calling:
 * loadOfflineToken((reason) => {
 *   if (reason === 'not available') {
 *     doOffline((token) => {
 *       setOfflineToken(token);
 *     });
 *   } else {
 *     setOfflineToken(reason);
 *   }
 * });
 *
 * Initially it will error out with the reason 'not available' and call doOffline
 * doOffline creates an iframe that goes out to the token API and redirects back to the originating page
 * Inside the iframe, this same page is loaded, and the loadOfflineToken function is called again
 * This time it will succeed, and the iframe child sends the token to the parent
 * Once the parent receives the token, it executes a function callback to pass the token
 */
import axios, { AxiosError } from 'axios';
import Keycloak from 'keycloak-js';

import type { Chrome } from '~/types/types';

const DEFAULT_ROUTES = {
  prod: {
    url: ['access.redhat.com', 'prod.foo.redhat.com', 'cloud.redhat.com', 'console.redhat.com'],
    sso: 'https://sso.redhat.com/auth',
    portal: 'https://access.redhat.com',
  },
  qa: {
    url: ['qa.foo.redhat.com', 'qa.cloud.redhat.com', 'qa.console.redhat.com'],
    sso: 'https://sso.qa.redhat.com/auth',
    portal: 'https://access.qa.redhat.com',
  },
  ci: {
    url: ['ci.foo.redhat.com', 'ci.cloud.redhat.com', 'ci.console.redhat.com'],
    sso: 'https://sso.qa.redhat.com/auth',
    portal: 'https://access.qa.redhat.com',
  },
  stage: {
    url: [
      'stage.foo.redhat.com',
      'cloud.stage.redhat.com',
      'console.stage.redhat.com',
      'fetest.stage.redhat.com',
    ],
    sso: 'https://sso.stage.redhat.com/auth',
    portal: 'https://access.stage.redhat.com',
  },
  gov: {
    url: ['gov.cloud.redhat.com', 'gov.console.redhat.com'],
    sso: 'https://sso.redhat.com/auth',
    portal: 'https://access.redhat.com',
  },
  govStage: {
    url: ['gov.cloud.stage.redhat.com', 'gov.console.stage.redhat.com'],
    sso: 'https://sso.stage.redhat.com/auth',
    portal: 'https://access.redhat.com',
  },
  dev: {
    url: ['console.dev.redhat.com'],
    sso: 'https://sso.redhat.com/auth',
    portal: 'https://access.redhat.com',
  },
};

const OFFLINE_REDIRECT_STORAGE_KEY = 'chrome.offline.redirectUri';

// Parse through keycloak options routes
const insightsUrl = async (env: typeof DEFAULT_ROUTES) => {
  const ssoEnv = Object.entries(env).find(([, { url }]) => url.includes(window.location.hostname));
  if (ssoEnv) {
    return ssoEnv?.[1].sso;
  }
  return 'https://sso.qa.redhat.com/auth';
};

const getPartnerScope = (pathname: string) => {
  // replace leading "/"
  const sanitizedPathname = pathname.replace(/^\//, '');
  // check if the pathname is connect/:partner
  if (sanitizedPathname.match(/^connect\/.+/)) {
    // return :partner param
    return `api.partner_link.${sanitizedPathname.split('/')[1]}`;
  }

  return undefined;
};

/**
 * Creates an iframe that goes out to the token API and redirects back.
 * Once the iframe fetches the token, it sends a message to the parent
 * document (message listener created in this function),
 * and then sends forwards it with the onDone callback function
 *
 * @param onDone Callback function after token is fetched
 */
export const doOffline = (onDone: (tokenOrError: string, errorReason?: string) => void) => {
  const noAuthParam = 'noauth';
  const offlineToken = '2402500adeacc30eb5c5a8a5e2e0ec1f';

  // clear previous postback
  localStorage.removeItem(OFFLINE_REDIRECT_STORAGE_KEY);
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set(noAuthParam, offlineToken);
  const redirectUri = url.toString();

  if (redirectUri) {
    // set new postback
    localStorage.setItem(OFFLINE_REDIRECT_STORAGE_KEY, redirectUri);
  }

  Promise.resolve(insightsUrl(DEFAULT_ROUTES)).then(async (ssoUrl) => {
    const kc = new Keycloak({ realm: 'redhat-external', clientId: 'cloud-services', url: ssoUrl });
    await kc.init({ redirectUri, checkLoginIframe: false, pkceMethod: false });

    const partnerScope = getPartnerScope(window.location.pathname);

    // Open an iframe to the token sso URL and with a redirect of the current page
    const iframe = document.createElement('iframe');
    const src = await kc.createLoginUrl({
      prompt: 'none',
      redirectUri,
      scope: `offline_access${partnerScope ? ` ${partnerScope}` : ''}`,
    });
    iframe.setAttribute('src', src);
    iframe.setAttribute('title', 'keycloak-silent-check-sso');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // this method is called from the iframe child
    const messageCallback = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || iframe.contentWindow !== event.source) {
        return;
      }
      if (typeof event.data === 'object' && event.data.tokenOrError) {
        onDone(event.data.tokenOrError, event.data.errorReason);

        window.removeEventListener('message', messageCallback);
        document.body.removeChild(iframe);
      }
    };

    window.addEventListener('message', messageCallback);
  });
};

/**
 * Tries to load the offline token
 *
 * @param {function(string):void} onError
 * Callback after token load encountered an error.
 * The callback gets the failure reason string as a parameter.
 */
export const loadOfflineToken = (
  callback: (tokenOrError: string, errorReason?: string) => void,
  targetOrigin: string,
  chrome: Chrome,
) => {
  chrome.auth
    .getOfflineToken()
    .then((response: any) => {
      // eslint-disable-next-line no-console
      console.log('Tokens: getOfflineToken succeeded => scope', response.data.scope);
      if (window.parent) {
        // We are inside an iframe, pass the token up to the parent
        window.parent.postMessage(
          {
            tokenOrError: response.data.refresh_token,
          },
          targetOrigin,
        );
      }
    })
    .catch((reason: string | AxiosError) => {
      const tokenOrError = axios.isAxiosError(reason) ? reason.toString() : reason;
      const errorReason = axios.isAxiosError(reason)
        ? (
            reason as AxiosError<
              any,
              {
                error: string;
                ['error_description']: string;
              }
            >
          ).response?.data?.error
        : '';
      // First time this method is called it will error out
      if (reason === 'not available') {
        // eslint-disable-next-line no-console
        console.log('Tokens: getOfflineToken failed => "not available", running doOffline()');
        doOffline(callback);
      } else if (window.self !== window.parent) {
        // We are inside an iframe, pass the token up to the parent
        window.parent?.postMessage(
          {
            tokenOrError,
            errorReason,
          },
          targetOrigin,
        );
      } else {
        // eslint-disable-next-line no-console
        console.log('Tokens: getOfflineToken failed =>', reason);
        callback(tokenOrError, errorReason);
      }
    });
};
