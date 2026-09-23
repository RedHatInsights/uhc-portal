import getCandidateChannelLink from './getCandidateChannelLink';

describe('getCandidateChannelLink', () => {
  it('returns null for an unparsable version', () => {
    expect(getCandidateChannelLink(undefined)).toBeNull();
    expect(getCandidateChannelLink('not-a-version')).toBeNull();
  });

  // A prerelease (e.g. an OCP candidate/nightly build) must not get a link to
  // an update-channels page that doesn't apply to that build.
  it('returns null for a prerelease version', () => {
    expect(getCandidateChannelLink('5.0.0-rc.1')).toBeNull();
  });

  it('uses the legacy index filename for 4.x versions before 4.6', () => {
    expect(getCandidateChannelLink('4.5')).toBe(
      'https://docs.redhat.com/en/documentation/openshift_container_platform/4.5/html/updating_clusters/index#candidate-4-5-channel',
    );
  });

  it('uses the legacy "understanding-upgrade-channels-releases" filename for 4.x between 4.6 and 4.13', () => {
    expect(getCandidateChannelLink('4.8')).toBe(
      'https://docs.redhat.com/en/documentation/openshift_container_platform/4.8/html/updating_clusters/understanding-upgrade-channels-releases#candidate-version-channel_understanding-upgrade-channels-releases',
    );
  });

  it('uses the current filename for 4.14+', () => {
    expect(getCandidateChannelLink('4.16')).toBe(
      'https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases',
    );
  });

  // 5.x versions must use the current filename regardless of minor,
  // never fall into the legacy 4.x branches (e.g. minor 0 would otherwise match `minor < 14`).
  it('uses the current filename for 5.x versions, even at minor 0', () => {
    expect(getCandidateChannelLink('5.0')).toBe(
      'https://docs.redhat.com/en/documentation/openshift_container_platform/5.0/html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases',
    );
  });
});
