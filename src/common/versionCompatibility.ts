import semver from 'semver';

import { SupportedFeature } from './featureCompatibility';

type CompatibilityOptions = { day1?: boolean; day2?: boolean; isHypershift?: boolean };

type FeatureCompatibility = {
  label: string;
  day1?: string;
  day2?: string;
  hypershift?: { day1?: string; day2?: string };
};

const featureCompatibilityMap: Record<SupportedFeature, FeatureCompatibility> = {
  [SupportedFeature.SECURITY_GROUPS]: {
    label: 'security groups',
    day1: '4.14.0',
    day2: '4.11.0',
    hypershift: {
      day1: '4.14.0',
      day2: '4.15.0',
    },
  },
  [SupportedFeature.AWS_SHARED_VPC]: {
    label: 'shared VPCs',
    day1: '4.13.9',
    day2: '4.13.9',
    hypershift: {
      day1: '4.13.9',
      day2: '4.13.9',
    },
  },
  [SupportedFeature.AUTO_CLUSTER_TRANSFER_OWNERSHIP]: {
    label: 'auto cluster transfer ownership',
    // Transfers will be based on product, not version
  },
};

const incompatibilityReason = (
  featureCompatibility: FeatureCompatibility,
  versionToCheck: string,
  options: CompatibilityOptions,
) => {
  let minimumVersion;
  if (options.isHypershift) {
    minimumVersion = options.day1
      ? featureCompatibility.hypershift?.day1
      : featureCompatibility.hypershift?.day2;
  } else {
    minimumVersion = options.day1 ? featureCompatibility.day1 : featureCompatibility.day2;
  }

  const isCompatible =
    !minimumVersion ||
    semver.gte(semver.coerce(versionToCheck) || '', semver.coerce(minimumVersion) || '');

  return isCompatible
    ? ''
    : `To use ${featureCompatibility.label}, your cluster must be version ${minimumVersion} or newer.`;
};

/**
 * Returns the reason that makes a feature incompatible with a given OpenShift version
 *
 * @param feature feature to check
 * @param versionRawId OpenShift version raw id
 * @param options compatibility options
 */
const getIncompatibleVersionReason = (
  feature: SupportedFeature,
  versionRawId: string | undefined,
  options: CompatibilityOptions,
) => {
  // Any feature not defined is assumed to be compatible with any version
  const featureCompatibility = featureCompatibilityMap[feature];
  if (!versionRawId || !featureCompatibility) {
    return '';
  }
  return incompatibilityReason(featureCompatibility, versionRawId, options);
};

export { getIncompatibleVersionReason, CompatibilityOptions };
