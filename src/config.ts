import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

import {
  ENV_OVERRIDE_LOCALSTORAGE_KEY,
  RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY,
} from './common/localStorageConstants';
import { Chrome } from './types/types';
import {
  resolveIsRestrictedEnv,
  resolveRestrictedEnvApi,
  resolveRestrictedEnvSso,
} from './restrictedEnv';

export type Config = {
  configData: EnvConfigWithFedRamp;
  dateConfig: () => void;
  envOverride: string | undefined;
  fakeOSD: boolean;
  fetchConfig: (chrome: Chrome) => Promise<any>;
  loadConfig: (data: EnvConfigWithFedRamp) => void;
};

type EnvConfig = {
  apiGateway: string;
  insightsGateway?: string;
  sentryDSN?: string;
  showOldMetrics?: boolean;
  fedrampGateway?: string;
  fedrampS3?: string;
  demoExperience?: string;
  apiGatewayXCM?: string;
  apiRegionalGatewayTemplate?: string;
};

type EnvConfigWithFedRamp = {
  restrictedEnv: boolean;
  restrictedEnvApi: string;
  restrictedEnvSso: string;
} & EnvConfig;

const configs: { [env: string]: Promise<EnvConfig> | undefined } = {};

// Specify configs to load below. The `webpackMode` comments are to ensure configs
// get bundled in the main chunk, and not spilt to tiny chunks

configs.production = import(/* webpackMode: "eager" */ './config/production.json');
configs.staging = import(/* webpackMode: "eager" */ './config/staging.json');
configs.integration = import(/* webpackMode: "eager" */ './config/integration.json');

if (APP_DEV_SERVER) {
  // running in webpack dev server, add mockdata configs
  configs.mockdata = import(/* webpackMode: "eager" */ './config/mockdata.json');
}

// select config according to the environment
export const APP_API_ENV =
  window.location.host.includes('dev') || window.location.host.includes('foo')
    ? 'staging'
    : 'production';
configs.default = configs[APP_API_ENV];

const parseEnvQueryParam = (): string | undefined => {
  let ret: string | undefined;
  window.location.search
    .substring(1)
    .split('&')
    .forEach((queryString) => {
      const [key, val] = queryString.split('=');
      if (key === 'env' && !!configs[val]) {
        ret = val;
      } else if (key === 'env' && val === 'mockserver' && configs.mockdata) {
        ret = 'mockdata';
      }
    });
  return ret;
};

const parseFakeQueryParam = () => {
  let ret = false;
  window.location.search
    .substring(1)
    .split('&')
    .forEach((queryString) => {
      const [key, val] = queryString.split('=');
      if (key === 'fake' && val === 'true') {
        ret = true;
      }
    });
  return ret;
};

const parseRestrictedQueryParam = () => {
  let ret = false;
  window.location.search
    .substring(1)
    .split('&')
    .forEach((queryString) => {
      const [key, val] = queryString.split('=');
      if (key.toLowerCase() === 'restricted' && val === 'true') {
        ret = true;
      }
    });
  return ret;
};

const config = {
  configData: {} as EnvConfigWithFedRamp,
  envOverride: undefined as string | undefined,
  fakeOSD: false,
  multiRegion: false,
  newClusterList: false,

  loadConfig(data: EnvConfig, chrome: Chrome) {
    const configData = {
      ...data,
      // replace $SELF_PATH$ with the current host
      // to avoid CORS issues when not using prod.foo
      apiGateway: data.apiGateway.replace('$SELF_PATH$', window.location.host),
      ...(data.apiRegionalGatewayTemplate
        ? {
            apiRegionalGatewayTemplate: data.apiRegionalGatewayTemplate.replace(
              '$SELF_PATH$',
              window.location.host,
            ),
          }
        : {}),
      insightsGateway:
        data.insightsGateway?.replace('$SELF_PATH$', window.location.host) || undefined,
      fedrampGateway:
        data.insightsGateway?.replace('$SELF_PATH$', window.location.host) || undefined,
    };

    const simulatedRestrictedEnv = !!localStorage.getItem(RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY);
    const fedRampConfig = {
      restrictedEnv: simulatedRestrictedEnv || resolveIsRestrictedEnv(chrome),
      restrictedEnvApi: simulatedRestrictedEnv ? configData.apiGateway : resolveRestrictedEnvApi(),
      // restricted-env sso domain cannot be inferred in simulated restricted-env, so leave it empty
      restrictedEnvSso: simulatedRestrictedEnv ? '' : resolveRestrictedEnvSso(),
    };

    this.configData = {
      ...configData,
      ...fedRampConfig,
    };

    // make config available in browser devtools for debugging
    (window as any).ocmConfig = this;
  },

  fetchConfig(chrome: Chrome) {
    const that = this;
    return new Promise<void>((resolve) => {
      if (parseFakeQueryParam()) {
        that.fakeOSD = true;
      }

      if (parseRestrictedQueryParam()) {
        localStorage.setItem(RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY, 'true');
      }

      const queryEnv = parseEnvQueryParam() || localStorage.getItem(ENV_OVERRIDE_LOCALSTORAGE_KEY);
      if (queryEnv && configs[queryEnv]) {
        configs[queryEnv]!.then((data) => {
          this.loadConfig(data, chrome);
          // eslint-disable-next-line no-console
          console.info(`Loaded override config: ${queryEnv}`);
          that.envOverride = queryEnv;
          localStorage.setItem(ENV_OVERRIDE_LOCALSTORAGE_KEY, queryEnv);
          resolve();
        });
      } else {
        configs.default?.then((data) => {
          this.loadConfig(data, chrome);
          // eslint-disable-next-line no-console
          console.info(`Loaded default config: ${APP_API_ENV}`);
          resolve();
        });
      }
    });
  },

  dateConfig() {
    dayjs.extend(utc);
    dayjs.extend(relativeTime);
    dayjs.extend(advancedFormat);
  },
};

export default config;
