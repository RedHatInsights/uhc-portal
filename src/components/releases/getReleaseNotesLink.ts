import isEmpty from 'lodash/isEmpty';
import semver from 'semver';

// example link: https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/release_notes/ocp-4-16-release-notes
const getReleaseNotesLink = (version: string | undefined): string | null => {
  // includePrerelease: without it, semver.coerce() silently strips prerelease/build
  // metadata (e.g. "5.0.0-rc.1" -> "5.0.0"), which would defeat the prerelease guard below.
  const parsed = semver.coerce(version, { includePrerelease: true });

  if (!parsed) {
    return null;
  }

  const { major, minor, patch, prerelease } = parsed;

  if (!isEmpty(prerelease)) {
    return null;
  }

  const pageURL = `https://docs.redhat.com/en/documentation/openshift_container_platform/${major}.${minor}/html/release_notes/ocp-${major}-${minor}-release-notes`;
  const patchAnchor = `#ocp-${major}-${minor}-${patch}`;

  if (patch > 0) {
    return pageURL + patchAnchor;
  }

  return pageURL;
};

export default getReleaseNotesLink;
