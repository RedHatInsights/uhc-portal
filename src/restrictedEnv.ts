import type { ChromeAPI } from '@redhat-cloud-services/types';

import type { Config } from '~/config';

import { getLocation } from './common/location';

/**
 * determines whether the UI runs within a restricted env'.
 *
 * to be used internally, exported for unit-testing purposes.
 * for external usage, please use the equivalent getter instead: IsRestrictedEnv().
 */
export const resolveIsRestrictedEnv = (chrome: ChromeAPI) =>
  ['int', 'scr', 'frh', 'frhStage'].includes(chrome.getEnvironment());

/**
 * returns the current domain, stripping the console subdomain by default.
 *
 * to be used internally, exported for unit-testing purposes.
 * for external usage, see the higher-level config adapter methods getRestrictedEnvApi() / getRestrictedEnvSso().
 *
 * @param subdomain an optional subdomain to replace the stripped one with.
 */
export const resolveRestrictedEnvDomain = (subdomain?: string) =>
  // restricted-env domain names must not be exposed publicly.
  // infer the root domain from current location, to avoid hard-coding.
  getLocation().origin.replace('console.', subdomain ?? '');

/**
 * to be used internally, exported for unit-testing purposes.
 * for external usage, please use the equivalent getter instead: getRestrictedEnvApi().
 */
export const resolveRestrictedEnvApi = () => resolveRestrictedEnvDomain('api.');

/**
 * to be used internally, exported for unit-testing purposes.
 * for external usage, please use the equivalent getter instead: getRestrictedEnvSso().
 */
export const resolveRestrictedEnvSso = () => resolveRestrictedEnvDomain('sso.');

// 'isRestrictedEnv' is for an internal insights-chrome environment which may change the visibility of certain ocm pages and features.
export const isRestrictedEnv = () =>
  ((window as any).ocmConfig as Config)?.configData.restrictedEnv;

export const getRestrictedEnvApi = () =>
  ((window as any).ocmConfig as Config)?.configData.restrictedEnvApi;

export const getRestrictedEnvSso = () =>
  ((window as any).ocmConfig as Config)?.configData.restrictedEnvSso;

export const SUPPORT_CASE_URL = 'https://redhatgov.servicenowservices.com/css';

export const getRefreshToken = (chrome: ChromeAPI) => chrome.auth.getRefreshToken();
