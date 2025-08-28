import {
  resolveRestrictedEnvApi,
  resolveRestrictedEnvDomain,
  resolveRestrictedEnvSso,
} from '~/restrictedEnv';

let location: Location;

function mockOrigin(origin: string) {
  jest.spyOn(window, 'location', 'get').mockReturnValue({
    ...location,
    origin,
  });
}

describe('restrictedEnv', () => {
  describe.each([[''], ['int.'], ['stage.']])('environment subdomain: "%s"', (envSubdomain) => {
    beforeEach(() => {
      location = window.location;
      mockOrigin(`https://console.${envSubdomain}example.com`);
    });

    afterEach(() => {
      jest.spyOn(window, 'location', 'get').mockRestore();
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
