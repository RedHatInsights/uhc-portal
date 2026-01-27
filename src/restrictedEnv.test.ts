import * as locationUtils from '~/common/location';
import {
  resolveRestrictedEnvApi,
  resolveRestrictedEnvDomain,
  resolveRestrictedEnvSso,
} from '~/restrictedEnv';

describe('restrictedEnv', () => {
  let locationSpy: jest.SpyInstance;

  describe.each([[''], ['int.'], ['stage.']])('environment subdomain: "%s"', (envSubdomain) => {
    beforeEach(() => {
      locationSpy = jest.spyOn(locationUtils, 'getLocation');

      locationSpy.mockReturnValue({
        origin: `https://console.${envSubdomain}example.com`,
      });
    });

    afterEach(() => {
      locationSpy.mockRestore();
    });

    describe('resolveRestrictedEnvApi()', () => {
      it('returns the base domain, prepended with "api."', () => {
        const result = resolveRestrictedEnvApi();
        expect(result).toBe(`https://api.${envSubdomain}example.com`);
      });
    });

    describe('resolveRestrictedEnvSso()', () => {
      it('returns the base domain, prepended with "sso."', () => {
        const result = resolveRestrictedEnvSso();
        expect(result).toBe(`https://sso.${envSubdomain}example.com`);
      });
    });

    describe('resolveRestrictedEnvDomain()', () => {
      it.each([
        [
          'returns current origin stripped from the "console." subdomain, if no arguments are passed',
          undefined,
          `https://${envSubdomain}example.com`,
        ],
        [
          'returns the current origin, prepended with the passed subdomain',
          'aaa.',
          `https://aaa.${envSubdomain}example.com`,
        ],
        [
          'returns the current origin, prepended with the passed subdomain, when the subdomain is multi-level',
          'aaa.bbb.',
          `https://aaa.bbb.${envSubdomain}example.com`,
        ],
      ])('%s', (_title, subdomain, expected) => {
        const result = resolveRestrictedEnvDomain(subdomain);
        expect(result).toBe(expected);
      });
    });
  });
});
