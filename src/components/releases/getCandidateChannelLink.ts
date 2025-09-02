import isEmpty from 'lodash/isEmpty';
import semver from 'semver';

// example link: https://docs.redhat.com/en/documentation/openshift_container_platform/4.8/html/updating_clusters/updating-cluster-within-minor#candidate-4-8-channel
const getCandidateChannelLink = (version: string | undefined): string | null => {
  const parsed = semver.coerce(version);

  if (!parsed) {
    return null;
  }

  const { major, minor, prerelease } = parsed;

  if (major !== 4 || !isEmpty(prerelease)) {
    return null;
  }

  let filename = 'understanding-openshift-updates-1#understanding-update-channels-releases';
  // docs changed the URL with 4.14+
  if (minor < 14) {
    // docs changed the URL with 4.6+
    if (minor < 6) {
      filename = `index#candidate-${major}-${minor}-channel`;
    } else {
      filename =
        'understanding-upgrade-channels-releases#candidate-version-channel_understanding-upgrade-channels-releases';
    }
  }

  return `https://docs.redhat.com/en/documentation/openshift_container_platform/${major}.${minor}/html/updating_clusters/${filename}`;
};

export default getCandidateChannelLink;
