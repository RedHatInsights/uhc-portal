/* eslint-disable camelcase */
import { useEffect, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useLocation } from 'react-router-dom';
import semver from 'semver';

import { OrganizationState } from '~/redux/reducers/userReducer';
import { PromiseReducerState } from '~/redux/stateTypes';

const noop = Function.prototype;

const isValid = (id?: string | boolean): boolean =>
  id !== null && id !== undefined && id !== false && id !== '';

const strToCleanArray = (str?: string): string[] | undefined =>
  str
    ? str
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item)
    : undefined;

const multiInputToCleanArray = (
  formData: { [name: string]: string | { [name: string]: string | null }[] },
  fieldName: string,
): string[] => {
  const fieldContents = formData[fieldName];
  return Array.isArray(fieldContents)
    ? fieldContents
        .map((fieldContent) => fieldContent?.[fieldName])
        .filter((input) => input)
        .map((item) => item!.trim())
    : [];
};

/**
 * Normalizes the data to make sure it's a list
 * @param itemOrList {Object} item or list of items.
 */
const asArray = <T>(itemOrList: T | T[]): T[] => {
  if (Array.isArray(itemOrList)) {
    return itemOrList;
  }
  return [itemOrList];
};

const stringToArray = (str?: string) => str && str.trim().split(',');
const stringToArrayTrimmed = (str: string) =>
  asArray(stringToArray(str))
    .map((ns) => ns?.trim())
    .filter((ns) => !!ns);

const arrayToString = (arr?: string[]) => arr && arr.join(',');

/**
 * Parses comma separated key<delimiter>value pairs into an object.
 * @param {*} str Comma separated string of kay:val pairs
 * @param {*} delimiter delimiter to split each pair by
 */
const strToCleanObject = (str: string, delimiter: string): { [k: string]: string } => {
  if (!str) {
    return {};
  }
  const pairArray = strToCleanArray(str);
  const pairs: { [k: string]: string } = {};
  pairArray?.forEach((pairStr) => {
    const [key, val] = pairStr.split(delimiter);
    pairs[key] = val;
  });
  return pairs;
};

/**
 * Generates cryptographically secure number within small range
 * there's a slight bias towards the lower end of the range.
 * @param min minimum range including min
 * @param max maximum range including max
 * @returns returns a cryptographically secure number within provided small range
 */
const secureRandomValueInRange = (min: number, max: number) => {
  const uints = new Uint32Array(1);
  crypto.getRandomValues(uints);
  const randomNumber = uints[0] / (0xffffffff + 1);
  const minNum = Math.ceil(min);
  const maxNum = Math.floor(max);
  return Math.floor(randomNumber * (maxNum - minNum + 1)) + minNum;
};

/**
 * Generates a random string (8 hex chars) that can be used as a key.
 */
const getRandomID = () => {
  const id = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
  return `${id}`;
};

const noQuotaTooltip =
  'You do not have enough quota for this option. Contact sales to purchase additional quota.';

const noMachineTypes =
  'You do not have enough quota to create a cluster with the minimum required worker capacity.';

const nodeKeyValueTooltipText =
  "To add an additional label, make sure all of your labels' keys are filled out (value fields are optional).";

/**
 * Returns true if an object is empty or if all its direct children are empty.
 *
 * For example:
 * ```
 * nestedIsEmpty({}) = true
 * nestedIsEmpty({a: []}) = true
 * nestedIsEmpty({a: [], b: ['a']}) = false
 * ```
 * @param {Object} obj
 */
const nestedIsEmpty = (obj: { [k: string]: unknown[] }): boolean =>
  isEmpty(obj) ||
  Object.keys(obj)
    .map((key) => isEmpty(obj[key]))
    .every((item) => item);

const helpers = {
  noop,
  isValid,
  strToCleanArray,
  asArray,
  nestedIsEmpty,
};

const shouldRefetchQuota = (
  organizationState: PromiseReducerState<OrganizationState>,
  checkTimeSinceRefresh = true,
) => {
  const now = new Date().getTime();
  const lastFetchedQuota = organizationState.timestamp ?? now;
  const TWO_MINUTES = 1000 * 60 * 2;
  return (
    !organizationState.pending &&
    (!organizationState.fulfilled || !checkTimeSinceRefresh || now - lastFetchedQuota > TWO_MINUTES)
  );
};

/**
 * Scroll to and focus on the first field found in the record of IDs.
 * @param ids List of element IDs. An ID can be partial.
 * @param focusSelector Used to discover element to focus on, defaults to form elements;
 * input, select, textarea
 * @return true if a field was found to scroll to, false otherwise.
 */
const scrollToFirstField = (
  ids: string[],
  focusSelector: string = 'input,select,textarea,button',
) => {
  if (!ids?.length) {
    return false;
  }

  // Use all error selectors, where the first matching element in the document is returned.
  // CSS.escape since it's possible for the id to be something like 'machinePoolsSubnets[0].privateSubnetId'
  // which needs to be escaped to use querySelector on it
  const selectorsExact = ids.map((id) => `[id="${CSS.escape(id)}"]`).join(',');
  const selectorsWildcard = ids.map((id) => `[id*="${CSS.escape(id)}"]`).join(',');
  const scrollElement =
    document.querySelector(selectorsExact) || document.querySelector(selectorsWildcard);

  if (scrollElement instanceof HTMLElement) {
    let focusElement: HTMLElement | null = scrollElement;

    // Find the element to focus on if the focusSelector does not include the element to scroll to.
    if (!focusSelector.includes(scrollElement.tagName.toLowerCase())) {
      focusElement = scrollElement?.querySelector(focusSelector);
    }

    // Scroll and focus
    setTimeout(() => scrollElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    focusElement?.focus({ preventScroll: true });

    return true;
  }

  return false;
};

/**
 * Converts redux form structure to the structure expected by OCM API.
 * Pairs with missing keys are omitted.
 *
 * @example
 * parseReduxFormKeyValueList([
 *  { key: "foo", value: "bar" },
 *  { key: "hello", value: "world" },
 *  { key: undefined, value: "wat" },
 * ]) // => { foo: "bar", hello: "world" }
 * @param {Array} [labelsFormData=[{}]] Array of key value pairs
 */
const parseReduxFormKeyValueList = (
  labelsFormData: { key: string | undefined; value: string | undefined }[] = [{}] as {
    key: string;
    value: string;
  }[],
): {
  [k: string]: string;
} =>
  Object.fromEntries(
    labelsFormData
      .filter(({ key }) => typeof key !== 'undefined' && key !== '')
      .map(({ key, value }) => [key, value ?? '']),
  );

/**
 * Converts redux form structure to the structure expected by OCM API.
 * Pairs with missing keys are omitted, and the 'id' property is removed
 *
 * @param {Array} taintsFormData Array of taints. Example:
 * [{ key: 'foo', value: 'bar', effect: 'NoSchedule'},
 * { id: '1a2b3c', key: 'foo1', value: 'bar1', effect: 'NoExecute'},]
 */
const parseReduxFormTaints = (
  taintsFormData: { key?: string; value?: string; effect?: string; id?: string }[],
) =>
  taintsFormData
    .map(
      (taint) =>
        taint.key &&
        taint.effect && {
          key: taint.key,
          value: taint.value === null || taint.value === undefined ? '' : taint.value,
          effect: taint.effect,
        },
    )
    .filter(Boolean);

// https://pkg.go.dev/time#Time
const goZeroTime = '0001-01-01T00:00:00Z';

/**
 * try to parse the go zero time, and return null for it.
 * it does not exhaust all time formats.
 * the fix is for AMS returning null timestamp in the form of go zerotime.
 * @param {string} timeStr the timestamp string. Example:
 * '2021-10-08T17:11:02Z' returns '2021-10-08T17:11:02Z'
 * '0001-01-01T00:00:00Z' returns null
 */
const goZeroTime2Null = (timeStr: string): string | null => {
  if (timeStr === goZeroTime) {
    return null;
  }

  const tm = Date.parse(timeStr);
  if (!Number.isNaN(tm) && tm === Date.parse(goZeroTime)) {
    return null;
  }

  return timeStr;
};

/**
 * determine if a version's major.minor level is <= maxMinorVerison's major.minor level.
 * we exclude the patch version of maxMinorVersion here even though ocpVersion can have a patch version.
 * this works because a <=major.minor semver range ignores patch versions, e.g. 4.11.13 satisfies the range <=4.11.
 * @param {string} version version to test (major.minor.patch or major.minor)
 * @param {string} maxMinorVersion version to compare with (major.minor.patch or major.minor)
 */
const isSupportedMinorVersion = (version: string, maxMinorVersion: string) => {
  const parsedMaxMinorVersion = maxMinorVersion ? semver.coerce(maxMinorVersion) : null;
  const parsedVersion = semver.coerce(version)?.version || '';
  return parsedMaxMinorVersion
    ? semver.satisfies(
        parsedVersion,
        `<=${semver.major(parsedMaxMinorVersion)}.${semver.minor(parsedMaxMinorVersion)}`,
      )
    : false;
};

/**
 * render only the major.minor portion of a major.minor.patch version string.
 * @param {string} version
 */
const formatMinorVersion = (version: string) => {
  const parsedVersion = semver.coerce(version);
  return parsedVersion ? `${semver.major(parsedVersion)}.${semver.minor(parsedVersion)}` : version;
};

/**
 * From "key1=value1,key2=value2" returns object { "key1": "value1", "key2": "value2"}.
 *
 * More examples:
 * - strToKeyValueObject('foo', '') is equal to strToKeyValueObject('foo=', undefined)
 * - strToKeyValueObject('foo') results in "{ foo: undefined }"
 *
 * @param {string} input comma-separated list of key=value pairs
 * @param {string} defaultValue used when the value is missing (like input === "foo").
 *
 */
const strToKeyValueObject = (input?: string, defaultValue?: string) => {
  if (input === undefined) {
    return undefined;
  }

  if (!input) {
    return {};
  }

  return input.split(',').reduce((accum, pair) => {
    const [key, value] = pair.split('=');
    return { ...accum, [key]: value ?? defaultValue };
  }, {});
};

const truncateTextWithEllipsis = (text: string, maxLength?: number) => {
  if (text && maxLength && text.length > maxLength) {
    return `${text.slice(0, maxLength / 3)}... ${text.slice((-maxLength * 2) / 3)}`;
  }
  return text;
};

type Subnet = {
  cidr_block: string;
  name: string;
  subnet_id: string;
};

const constructSelectedSubnets = (formValues?: Record<string, any>) => {
  type MachinePoolSubnet = {
    availability_zone: string;
    privateSubnetId: string;
    publicSubnetId: string;
  };
  const isHypershift = formValues?.hypershift === 'true';
  const usePrivateLink = formValues?.use_privatelink;

  let privateSubnets: Subnet[] = [];
  let publicSubnets: Subnet[] = [];
  let selectedSubnets: Subnet[] = [];

  if (formValues?.install_to_vpc) {
    let publicSubnetIds: string[] = [];

    const privateSubnetIds = formValues?.machinePoolsSubnets
      .map((obj: MachinePoolSubnet) => obj.privateSubnetId)
      .filter((id: string) => id !== undefined && id !== '');

    if (isHypershift) {
      publicSubnetIds = formValues?.cluster_privacy_public_subnet_id;
    } else {
      publicSubnetIds = formValues?.machinePoolsSubnets
        .map((obj: MachinePoolSubnet) => obj.publicSubnetId)
        .filter((id: string) => id !== undefined && id !== '');
    }

    if (formValues?.selected_vpc?.aws_subnets) {
      privateSubnets = formValues?.selected_vpc?.aws_subnets.filter((obj: Subnet) =>
        privateSubnetIds.includes(obj.subnet_id),
      );

      publicSubnets = formValues?.selected_vpc?.aws_subnets.filter((obj: Subnet) =>
        publicSubnetIds.includes(obj.subnet_id),
      );
    }

    if (usePrivateLink) {
      selectedSubnets = privateSubnets;
    } else {
      selectedSubnets = privateSubnets.concat(publicSubnets);
    }
  }

  return selectedSubnets;
};

/**
 * A custom React hook for smooth scrolling to an element based on the URL hash.
 * It listens for hash changes and scrolls to the corresponding element if it exists.
 *
 * Notes:
 * - Ensure elements have unique `id` attributes matching the hash.
 * - Resets the `lastHash` reference after scrolling to avoid redundant actions.
 */
const useScrollToAnchor = () => {
  const location = useLocation();
  const lastHash = useRef('');
  useEffect(() => {
    if (location.hash) {
      // Sanitize the hash value (remove the '#' and allow only alphanumeric characters and hyphens)
      const sanitizedHash = location.hash.slice(1).replace(/[^a-zA-Z0-9-_]/g, '');
      lastHash.current = sanitizedHash;
    }

    if (lastHash.current && document.getElementById(lastHash.current)) {
      setTimeout(() => {
        document
          .getElementById(lastHash.current)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        lastHash.current = '';
      }, 100);
    }
  }, [location]);

  return null;
};

const parseCIDRSubnetLength = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  return parseInt(value.split('/').pop() ?? '', 10);
};

export {
  noop,
  isValid,
  strToCleanArray,
  asArray,
  multiInputToCleanArray,
  getRandomID,
  secureRandomValueInRange,
  noQuotaTooltip,
  noMachineTypes,
  nodeKeyValueTooltipText,
  strToCleanObject,
  shouldRefetchQuota,
  scrollToFirstField,
  parseReduxFormKeyValueList,
  parseReduxFormTaints,
  goZeroTime,
  goZeroTime2Null,
  stringToArray,
  arrayToString,
  truncateTextWithEllipsis,
  isSupportedMinorVersion,
  formatMinorVersion,
  strToKeyValueObject,
  stringToArrayTrimmed,
  constructSelectedSubnets,
  Subnet,
  useScrollToAnchor,
  parseCIDRSubnetLength,
};

export default helpers;
