import isEmpty from 'lodash/isEmpty';
import semver from 'semver';

// example link: https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases
const getCandidateChannelLink = (version: string | undefined): string | null => {
  // includePrerelease: without it, semver.coerce() silently strips prerelease/build
  // metadata (e.g. "5.0.0-rc.1" -> "5.0.0"), which would defeat the prerelease guard below.
  const parsed = semver.coerce(version, { includePrerelease: true });

  if (!parsed) {
    return null;
  }

  const { major, minor, prerelease } = parsed;

  if (!isEmpty(prerelease)) {
    return null;
  }

  let filename = 'understanding-openshift-updates-1#understanding-update-channels-releases';
  // Legacy URL patterns only ever applied to OCP 4.x; 5.x always uses the current filename.
  if (major === 4 && minor < 14) {
    // docs changed the URL with 4.14+
    if (minor < 6) {
      // docs changed the URL with 4.6+
      filename = `index#candidate-${major}-${minor}-channel`;
    } else {
      filename =
        'understanding-upgrade-channels-releases#candidate-version-channel_understanding-upgrade-channels-releases';
    }
  }

  return `https://docs.redhat.com/en/documentation/openshift_container_platform/${major}.${minor}/html/updating_clusters/${filename}`;
};

export default getCandidateChannelLink;
