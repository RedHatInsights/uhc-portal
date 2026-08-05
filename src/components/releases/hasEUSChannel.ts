import semver from 'semver';

import {
  ProductLifeCycle,
  ProductLifeCyclePhase,
} from '~/types/product-life-cycles/models/ProductLifeCycle';

type VersionInfo = ProductLifeCycle['versions'][number];

const EXTENDED_UPDATE_SUPPORT_PHASE = 'extended update support';

/**
 * OCP 4 EUS channels follow an even-minor cadence (4.6, 4.8, …).
 * Used when OCP5_SUPPORT is off.
 */
export const hasEUSChannelByEvenMinor = (versionName: string): boolean => {
  const parsed = semver.coerce(versionName);
  if (!parsed) {
    return false;
  }
  const { minor } = parsed;
  return minor > 5 && minor % 2 === 0;
};

const phaseHasConcreteDate = (phase: ProductLifeCyclePhase): boolean => {
  // v2: real EUS windows use date-typed start_date values (odd minors use N/A strings)
  if (phase.start_date_format === 'date') {
    return Boolean(phase.start_date && phase.start_date !== 'N/A');
  }
  // v1 shortcut fields
  if (phase.date_format === 'date') {
    return Boolean(phase.date && phase.date !== 'N/A');
  }
  return false;
};

/**
 * Determines EUS channel eligibility from lifecycle API phase data.
 * Versions with a concrete "Extended update support" start date have an EUS channel
 * regardless of major/minor cadence (needed for OCP 5+).
 */
export const hasEUSChannelFromLifeCycle = (version: VersionInfo): boolean => {
  const eusPhase = version.phases?.find(
    (phase) => phase.name.toLowerCase() === EXTENDED_UPDATE_SUPPORT_PHASE,
  );
  return eusPhase ? phaseHasConcreteDate(eusPhase) : false;
};

export const hasEUSChannel = (version: VersionInfo, useOcp5Support: boolean): boolean =>
  useOcp5Support ? hasEUSChannelFromLifeCycle(version) : hasEUSChannelByEvenMinor(version.name);
