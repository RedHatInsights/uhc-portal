import {
  getRosaCpDocsBase,
  getRosaCpDocsRoot,
  getRosaDocsBase,
  getRosaDocsVersionSlug,
} from './rosaDocsBase.mjs';

describe('getRosaDocsVersionSlug', () => {
  it('defaults to 4 when version is undefined', () => {
    expect(getRosaDocsVersionSlug()).toBe(4);
  });

  it('defaults to 4 when version is empty', () => {
    expect(getRosaDocsVersionSlug('')).toBe(4);
  });

  it('maps OCP 4.x to docs slug 4', () => {
    expect(getRosaDocsVersionSlug('4.16.0')).toBe(4);
  });

  it('maps OCP 5.x to docs slug 4 until /5/ docs are published', () => {
    expect(getRosaDocsVersionSlug('5.0.0')).toBe(4);
  });

  it('defaults to 4 for an invalid version string', () => {
    expect(getRosaDocsVersionSlug('not-a-version')).toBe(4);
  });

  it('defaults to 4 for an unknown major version', () => {
    expect(getRosaDocsVersionSlug('6.0.0')).toBe(4);
  });

  it('maps prerelease OCP 5 versions to docs slug 4', () => {
    expect(getRosaDocsVersionSlug('5.0.0-rc.1')).toBe(4);
  });
});

describe('getRosaDocsBase', () => {
  it('returns the docs.redhat.com ROSA HCP base with /4/html by default', () => {
    expect(getRosaDocsBase()).toBe(
      'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html',
    );
  });

  it('returns /4/html for both v4 and v5 inputs today', () => {
    const expected =
      'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html';

    expect(getRosaDocsBase('4.16.0')).toBe(expected);
    expect(getRosaDocsBase('5.0.0')).toBe(expected);
  });
});

describe('getRosaCpDocsBase', () => {
  it('returns the access.redhat.com ROSA HCP base with /4/html by default', () => {
    expect(getRosaCpDocsBase()).toBe(
      'https://access.redhat.com/documentation/en-us/red_hat_openshift_service_on_aws/4/html',
    );
  });

  it('preserves the Customer Portal host and path shape for v4 and v5', () => {
    const expected =
      'https://access.redhat.com/documentation/en-us/red_hat_openshift_service_on_aws/4/html';

    expect(getRosaCpDocsBase('4.16.0')).toBe(expected);
    expect(getRosaCpDocsBase('5.0.0')).toBe(expected);
  });
});

describe('getRosaCpDocsRoot', () => {
  it('returns the access.redhat.com ROSA HCP root without /html', () => {
    expect(getRosaCpDocsRoot()).toBe(
      'https://access.redhat.com/documentation/en-us/red_hat_openshift_service_on_aws/4',
    );
  });
});
