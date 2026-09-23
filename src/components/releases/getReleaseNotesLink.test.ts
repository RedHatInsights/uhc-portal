import getReleaseNotesLink from './getReleaseNotesLink';

describe('getReleaseNotesLink', () => {
  it('returns null for an unparsable version', () => {
    expect(getReleaseNotesLink(undefined)).toBeNull();
    expect(getReleaseNotesLink('not-a-version')).toBeNull();
  });

  // A prerelease (e.g. an OCP candidate/nightly build) must not get a link to
  // release notes that don't exist yet for that build.
  it('returns null for a prerelease version', () => {
    expect(getReleaseNotesLink('5.0.0-rc.1')).toBeNull();
  });

  it('builds a link without a patch anchor when patch is 0', () => {
    expect(getReleaseNotesLink('4.16')).toBe(
      'https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/release_notes/ocp-4-16-release-notes',
    );
  });

  it('builds a link with a patch anchor when patch is present', () => {
    expect(getReleaseNotesLink('4.16.12')).toBe(
      'https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/release_notes/ocp-4-16-release-notes#ocp-4-16-12',
    );
  });

  // 5.x versions must resolve the same way as 4.x, not be suppressed.
  it('builds a link for a 5.x version without a patch anchor', () => {
    expect(getReleaseNotesLink('5.0')).toBe(
      'https://docs.redhat.com/en/documentation/openshift_container_platform/5.0/html/release_notes/ocp-5-0-release-notes',
    );
  });

  it('builds a link for a 5.x version with a patch anchor', () => {
    expect(getReleaseNotesLink('5.0.3')).toBe(
      'https://docs.redhat.com/en/documentation/openshift_container_platform/5.0/html/release_notes/ocp-5-0-release-notes#ocp-5-0-3',
    );
  });
});
