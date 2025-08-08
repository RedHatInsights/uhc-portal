/* eslint-disable camelcase */
import { containsCidr, overlapCidr } from 'cidr-tools';
import IPCIDR from 'ip-cidr';
import { ValidationError, Validator } from 'jsonschema';
import { get, indexOf, inRange } from 'lodash';

import { parseCIDRSubnetLength, Subnet } from '~/common/helpers';
import { FormSubnet } from '~/components/clusters/wizards/common/FormSubnet';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { clusterService } from '~/services';
import type { Gcp, Taint } from '~/types/clusters_mgmt.v1';

import { sqlString } from './queryHelpers';

type Networks = Parameters<typeof overlapCidr>[0];

export const maxAdditionalSecurityGroups = 5;
export const maxAdditionalSecurityGroupsHypershift = 10;

// Valid RFC-1035 labels must consist of lower case alphanumeric characters or '-', start with an
// alphabetic character, and end with an alphanumeric character (e.g. 'my-name',  or 'abc-123').
const DNS_LABEL_REGEXP = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
const DNS_ONLY_ALPHANUMERIC_HYPHEN = /^[-a-z0-9]+$/;
const DNS_START_ALPHA = /^[a-z]/;
const DNS_END_ALPHANUMERIC = /[a-z0-9]$/;

// Regular expression used to check whether forward slash is multiple times
const MULTIPLE_FORWARD_SLASH_REGEX = /^.*[/]+.*[/]+.*$/i;

// Regular expression used to check base DNS domains, based on RFC-1035
const BASE_DOMAIN_REGEXP = /^([a-z]([-a-z0-9]*[a-z0-9])?\.)+[a-z]([-a-z0-9]*[a-z0-9])?$/;

// Regular expression used to check general subdomain structure, based on RFC-1035
const DNS_SUBDOMAIN_REGEXP = /^([a-z]([-a-z0-9]*[a-z0-9])?)+(\.[a-z]([-a-z0-9]*[a-z0-9])?)*$/;

// Regular expression used to check UUID as specified in RFC4122.
const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Regular expression to check k8s "time" parameters (e.g. max_node_provision_time)
const K8S_TIME_PARAMETER_REGEXP = /^([0-9]+(\.[0-9]+)?(ns|us|µs|ms|s|m|h))+$/;

// Regular expression to check a single k8s "gpu" parameter, (eg. "nvidia.com/gpu:10:15")
const K8S_GPU_PARAMETER_REGEXP = /^[a-zA-Z]+[a-zA-Z0-9./-]*:[0-9]+:[0-9]+$/;

// Regular expression used to check whether input is a valid IPv4 CIDR range
const CIDR_REGEXP =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[1-9]))$/;
const SERVICE_CIDR_MAX = 24;
const POD_CIDR_MAX = 21;
const POD_NODES_MIN = 32;
const AWS_MACHINE_CIDR_MIN = 16;
const AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 25;
const AWS_MACHINE_CIDR_MAX_MULTI_AZ = 24;
const GCP_MACHINE_CIDR_MAX = 23;

// Regular expression used to check whether input is a valid IPv4 subnet prefix length
const HOST_PREFIX_REGEXP = /^\/?(3[0-2]|[1-2][0-9]|[0-9])$/;
const HOST_PREFIX_MIN = 23;
const HOST_PREFIX_MAX = 26;

// Regular expression for a valid URL for a console in a self managed cluster.
const CONSOLE_URL_REGEXP =
  /^https?:\/\/(([0-9]{1,3}\.){3}[0-9]{1,3}|([a-z0-9-]+\.)+[a-z]{2,})(:[0-9]+)?([a-z0-9_/-]+)?$/i;

// Maximum length for a cluster name
const MAX_CLUSTER_NAME_LENGTH = 54;

const MAX_DOMAIN_PREFIX_LENGTH = 15;

const MAX_MACHINE_POOL_NAME_LENGTH = 30;

const MAX_NODE_POOL_NAME_LENGTH = 15;

const MAX_OBJECT_NAME_LENGTH = 63;

// Maximum length of a cluster display name
const MAX_CLUSTER_DISPLAY_NAME_LENGTH = 63;

const GCP_PROJECT_ID_REGEX = /^[a-z][-a-z0-9]{4,28}[a-z0-9]{1}$/;

const GCP_SUBNET_NAME_MAXLEN = 63;

const AWS_USER_OR_GROUP_ARN_REGEX = /^arn:aws([-\w]+)?:iam::\d{12}:(user|group)\/\S+/;
const AWS_ROLE_ARN_REGEX = /^arn:aws([-\w]+)?:iam::\d{12}:role\/\S+/;
const AWS_PRIVATE_HOSTED_ZONE_ID_REGEX = /^Z[0-9A-Z]{3,}/;

const LABEL_VALUE_MAX_LENGTH = 63;

const LABEL_KEY_NAME_MAX_LENGTH = 63;

const LABEL_KEY_PREFIX_MAX_LENGTH = 253;

const AWS_NUMERIC_ACCOUNT_ID_REGEX = /^\d{12}$/;

const GCP_KMS_SERVICE_ACCOUNT_REGEX = /^[a-z0-9.+-]+@[\w.-]+\.[a-z]{2,4}$/;

const AWS_KMS_SERVICE_ACCOUNT_REGEX =
  /^arn:aws([-\w]+)?:kms:[\w-]+:\d{12}:key\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX =
  /^arn:aws([-\w]+)?:kms:[\w-]+:\d{12}:key\/mrk-[0-9a-f]{32}$/;

/**
 * A valid label key name must consist of alphanumeric characters, '-', '_' or '.',
 * and must start and end with an alphanumeric character. e.g. 'MyName', 'my.name',
 * or '123-abc'.
 * @see https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set
 */
const LABEL_KEY_NAME_REGEX = /^([a-z0-9][a-z0-9-_.]*)?[a-z0-9]$/i;
// Tag keys and values may only contain alphanumeric characters and the following symbols: [_ . : / = + - @].
const AWS_TAG_KEY_VALUE_REGEX = /^([a-z0-9-_.:/=+-@]*)$/i;

const AWS_TAG_KEY_MAX_LENGTH = 128;
const AWS_TAG_VALUE_MAX_LENGTH = 256;

/**
 * A valid label value must be an empty string or consist of alphanumeric characters, '-', '_'
 * or '.', and must start and end with an alphanumeric character. e.g. 'MyValue', or 'my_value',
 * or '12345'
 * @see https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set
 */
const LABEL_VALUE_REGEX = /^(([a-z0-9][a-z0-9-_.]*)?[a-z0-9])?$/i;

const MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH = 32;

const AUTOSCALER_MAX_LOG_VERBOSITY = 6;

type Validations = {
  validated: boolean;
  text: string;
}[];

// Function to validate that a field is mandatory, i.e. must be a non whitespace string
const required = (value?: string): string | undefined =>
  value && value.trim() ? undefined : 'Field is required';

// Function to validate that a field has a true value.
// Use with checkbox to ensure it is selected on a form, e.g. Ts&Cs agreement
const requiredTrue = (value: string | boolean): string | undefined =>
  value && value === true ? undefined : 'Field must be selected';

// Function to validate that user has acknowledged prerequisites by clicking checkbox.
const acknowledgePrerequisites = (value: string | boolean): string | undefined =>
  value && value === true
    ? undefined
    : 'Acknowledge that you have read and completed all prerequisites.';

// Function to validate that the identity provider name field doesn't include whitespaces:
const checkIdentityProviderName = (value?: string): string | undefined => {
  if (!value) {
    return 'Name is required.';
  }
  if (/\s/.test(value)) {
    return 'Name must not contain whitespaces.';
  }
  if (/[^A-Za-z0-9_-]/.test(value)) {
    return 'Name should contain only alphanumeric and dashes';
  }
  return undefined;
};

// Function to validate that the issuer field uses https scheme:
const checkOpenIDIssuer = (value?: string): string | undefined => {
  if (!value) {
    return 'Issuer URL is required.';
  }
  if (!value.startsWith('https://')) {
    return 'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)';
  }
  let url;
  try {
    url = new URL(value);
  } catch (error) {
    return 'Invalid URL';
  }
  if (url.hash !== '' || url.search !== '') {
    return 'The URL must not include a query string (?) or fragment (#)';
  }

  // url.hash doesnt work for https://issuer.com# and it succeeds.
  // added explicit validation for that scenario
  if (url.href.includes('#')) {
    return 'The URL must not include a query string (?) or fragment (#)';
  }

  return undefined;
};

// Function to validate that the object name contains a valid DNS label:
const checkObjectName = (
  value: string | undefined,
  objectName: string,
  maxLen: number,
): string | undefined => {
  if (!value) {
    return `${objectName} name is required.`;
  }
  if (!DNS_LABEL_REGEXP.test(value)) {
    return `${objectName} name '${value}' isn't valid, must consist of lower-case alphanumeric characters or '-', start with an alphabetic character, and end with an alphanumeric character. For example, 'my-name', or 'abc-123'.`;
  }
  if (value.length > maxLen) {
    return `${objectName} names may not exceed ${maxLen} characters.`;
  }
  return undefined;
};

const checkObjectNameValidation = (
  value: string | undefined,
  objectName: string,
  maxLen: number,
) => [
  {
    text: `1 - ${maxLen} characters`,
    validated: !!value?.length && value?.length <= maxLen,
  },
  {
    text: 'Consist of lower-case alphanumeric characters, or hyphen (-)',
    validated: !!value && DNS_ONLY_ALPHANUMERIC_HYPHEN.test(value),
  },
  {
    text: 'Start with a lower-case alphabetic character',
    validated: !!value && DNS_START_ALPHA.test(value),
  },
  {
    text: 'End with a lower-case alphanumeric character',
    validated: !!value && DNS_END_ALPHANUMERIC.test(value),
  },
];

const checkObjectNameAsyncValidation = (
  value?: string,
  isMultiRegionEnabled?: boolean,
  isExistingRegionalClusterName?: boolean,
) => [
  {
    text: 'Globally unique name in your organization',
    validator: async () => {
      if (!value?.length) {
        return false;
      }

      if (isMultiRegionEnabled) {
        if (isExistingRegionalClusterName) {
          return false;
        }
      } else {
        const search = `name = ${sqlString(value)}`;
        const { data } = await clusterService.searchClusters(search, 1);
        // Normally, we get 0 or 1 items, 1 meaning a cluster of that name already exists.
        // But dumb mockserver ignores `search` and `size`, always returns full static list;
        // checking the returned name(s) allows this validation to work in ?env=mockdata UI.
        return !data?.items?.some((cluster) => cluster.name === value);
      }
      return true;
    },
  },
];

const checkObjectNameDomainPrefixAsyncValidation = (
  value?: string,
  isMultiRegionEnabled?: boolean,
  isExistingRegionalClusterName?: boolean,
  isExistingRegionalDomainPrefix?: boolean,
) => [
  {
    text: 'Globally unique domain prefix in your organization',
    validator: async () => {
      if (!value?.length) {
        return false;
      }

      if (isMultiRegionEnabled) {
        if (isExistingRegionalDomainPrefix) {
          return false;
        }
      } else {
        const search = `domain_prefix = ${sqlString(value)}`;
        const { data } = await clusterService.searchClusters(search, 1);

        return !data?.items?.some((cluster) => cluster.domain_prefix === value);
      }
      return true;
    },
  },
];

const clusterNameValidation = (value?: string, maxLen?: number) =>
  checkObjectNameValidation(value, 'Cluster', maxLen || MAX_CLUSTER_NAME_LENGTH);

const clusterNameAsyncValidation = (
  value?: string,
  isMultiRegionEnabled?: boolean,
  isExistingRegionalClusterName?: boolean,
) => checkObjectNameAsyncValidation(value, isMultiRegionEnabled, isExistingRegionalClusterName);

const checkMachinePoolName = (value: string | undefined) =>
  checkObjectName(value, 'Machine pool', MAX_MACHINE_POOL_NAME_LENGTH);

const checkNodePoolName = (value: string | undefined) =>
  checkObjectName(value, 'Machine pool', MAX_NODE_POOL_NAME_LENGTH);

const domainPrefixValidation = (value?: string) =>
  checkObjectNameValidation(value, 'Domain Prefix', MAX_DOMAIN_PREFIX_LENGTH);

const domainPrefixAsyncValidation = (
  value?: string,
  isMultiRegionEnabled?: boolean,
  isExistingRegionalClusterName?: boolean,
  isExistingRegionalDomainPrefix?: boolean,
) =>
  checkObjectNameDomainPrefixAsyncValidation(
    value,
    isMultiRegionEnabled,
    isExistingRegionalClusterName,
    isExistingRegionalDomainPrefix,
  );

const createAsyncValidationEvaluator =
  (
    asyncValidation: (
      value: string,
      isMultiRegionEnabled?: boolean,
      isExistingRegionalClusterName?: boolean,
      isExistingRegionalDomainPrefix?: boolean,
    ) => {
      text: string;
      validator: () => Promise<boolean>;
    }[],
  ) =>
  async (
    value: string,
    isMultiRegionEnabled?: boolean,
    isExistingRegionalClusterName?: boolean,
    isExistingRegionalDomainPrefix?: boolean,
  ) => {
    const populatedValidation = asyncValidation(
      value,
      isMultiRegionEnabled,
      isExistingRegionalClusterName,
      isExistingRegionalDomainPrefix,
    );
    const validationResults = await Promise.all(
      populatedValidation.map(({ validator }) => validator?.()),
    );

    return populatedValidation.map((item, i) => ({
      ...item,
      validated: validationResults[i],
    }));
  };

const evaluateClusterNameAsyncValidation = createAsyncValidationEvaluator(
  clusterNameAsyncValidation,
);

const evaluateDomainPrefixAsyncValidation = createAsyncValidationEvaluator(
  domainPrefixAsyncValidation,
);

const findFirstFailureMessage = (populatedValidation: Validations | undefined) =>
  populatedValidation?.find((validation) => validation.validated === false)?.text;

/**
 * executes cluster-name async validations.
 * to be used at the form level hook (asyncValidate).
 *
 * @param value the value to be validated
 * @returns {Promise<void>} a promise which resolves quietly, or rejects with a form errors map.
 */
const asyncValidateClusterName = async (
  value: string,
  isMultiRegionEnabled?: boolean,
  isExistingRegionalClusterName?: boolean,
) => {
  const evaluatedAsyncValidation = await evaluateClusterNameAsyncValidation(
    value,
    isMultiRegionEnabled,
    isExistingRegionalClusterName,
  );
  return findFirstFailureMessage(evaluatedAsyncValidation);
};

const asyncValidateDomainPrefix = async (
  value: string,
  isMultiRegionEnabled?: boolean,
  isExistingRegionalClusterName?: boolean,
  isExistingRegionalDomainPrefix?: boolean,
) => {
  const evaluatedAsyncValidation = await evaluateDomainPrefixAsyncValidation(
    value,
    isMultiRegionEnabled,
    isExistingRegionalClusterName,
    isExistingRegionalDomainPrefix,
  );
  return findFirstFailureMessage(evaluatedAsyncValidation);
};

const k8sGpuParameter = (gpuParam: string): string | undefined => {
  if (!gpuParam) {
    return undefined;
  }
  const gpuParams = gpuParam.split(',');
  const invalidParams = gpuParams
    .map((param) => {
      let hasError = false;

      if (K8S_GPU_PARAMETER_REGEXP.test(param)) {
        const parts = param.split(':');
        const min = Number(parts[1]);
        const max = Number(parts[2]);
        if (min < 0 || max < 0 || min > max) {
          hasError = true;
        }
      } else {
        hasError = true;
      }
      return hasError ? param || 'empty param' : undefined;
    })
    .filter(Boolean);
  return invalidParams.length === 0 ? undefined : `Invalid params: ${invalidParams.join(',')}`;
};

const validateListOfBalancingLabels = (input: string | undefined) => {
  if (!input) {
    return undefined;
  }
  const labels = input.split(',');
  if (/\s/.test(input)) {
    return 'Labels must not contain whitespaces.';
  }
  const nonEmptyLabels = labels.filter(Boolean);

  return labels.length === nonEmptyLabels.length ? undefined : 'Empty labels are not allowed.';
};

const k8sTimeParameter = (timeValue: string): string | undefined => {
  if (!timeValue) {
    return 'Field is required.';
  }
  if (!K8S_TIME_PARAMETER_REGEXP.test(timeValue)) {
    return 'Not a valid time value.';
  }
  return undefined;
};

/* The input field value becomes the empty string when the field is not a number */
const isNumeric = (num: string | number) => num !== '' && !Number.isNaN(Number(num));

const k8sNumberParameter = (num: number | string): string | undefined => {
  const number = Number(num);
  if (number < 0) {
    return 'Value cannot be a negative number.';
  }
  return undefined;
};

const k8sLogVerbosityParameter = (num: number | string) => {
  if (+num < 1 || +num > AUTOSCALER_MAX_LOG_VERBOSITY) {
    return `Value must be between 1 and ${AUTOSCALER_MAX_LOG_VERBOSITY}.`;
  }
  return undefined;
};

const k8sScaleDownUtilizationThresholdParameter = (num: number | string) => {
  if (+num < 0 || +num > 1) {
    return 'Value must be between 0 and 1.';
  }
  return undefined;
};

const minMaxBaseFieldExtractorRegExp = /^(.*)(\.min|\.max)+$/;

const k8sMinMaxParameter = (
  minOrMax: string,
  allValues: object,
  props: object,
  fieldName: string,
): string | undefined => {
  // Report the error if it's not a number
  const numError = isNumeric(minOrMax) ? undefined : 'Value must be a number.';
  if (numError) {
    return numError;
  }
  const number = Number(minOrMax);
  if (number < 0) {
    return 'Value cannot be a negative number';
  }

  /* Extracts the base field to be able to compare the min and max values to one another */
  const baseFieldMatch = fieldName.match(minMaxBaseFieldExtractorRegExp);
  const baseField = baseFieldMatch ? baseFieldMatch[1] : ''; // Should always match

  // Check the validity of the pair of values
  const minParamValue = get(allValues, `${baseField}.min`, 0);
  const maxParamValue = get(allValues, `${baseField}.max`, 0);

  return minParamValue <= maxParamValue
    ? undefined
    : 'The minimum cannot be above the maximum value.';
};

const validateMaxNodes = (num: number | string, maxNodes: number | string) =>
  +num > +maxNodes ? `Value must not be greater than ${maxNodes}.` : undefined;

const validatePositive = (num: number | string) =>
  Number(num) <= 0 ? `Input must be a positive number.` : undefined;

const clusterAutoScalingValidators = {
  k8sTimeParameter,
  k8sNumberParameter,
  k8sMinMaxParameter,
  k8sGpuParameter,
  k8sScaleDownUtilizationThresholdParameter,
  k8sLogVerbosityParameter,
  validateMaxNodes,
};

/**
 * creates a validator function that exits on first failure (and returns its error message),
 * using the validation provider output collection as its input.
 *
 * @param validationProvider {function(*, object, object, object): array}
 *        a function that returns a collection of validations,
 *        and can be passed to a Field's validation attribute.
 *        first argument is the value, second is allValues, etc.
 * @returns {function(*): *} a validator function that exits on the first failed validation,
 *          outputting its error message.
 */
const createPessimisticValidator =
  <V>(
    validationProvider: (
      value?: V,
      allValues?: any,
      props?: any,
      name?: any,
    ) => Validations | undefined = () => undefined,
  ) =>
  (value?: V, allValues?: any, props?: any, name?: any) =>
    findFirstFailureMessage(validationProvider(value, allValues, props, name));

const checkCustomOperatorRolesPrefix = (value: string): string | undefined => {
  const label = 'Custom operator roles prefix';
  if (!value) {
    return undefined;
  }
  if (!DNS_LABEL_REGEXP.test(value)) {
    return `${label} '${value}' isn't valid, must consist of lower-case alphanumeric characters or '-', start with an alphabetic character, and end with an alphanumeric character. For example, 'my-name', or 'abc-123'.`;
  }
  if (value.length > MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH) {
    return `${label} may not exceed ${MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH} characters.`;
  }
  return undefined;
};

// Function to validate that the github team is formatted: <org/team>
const checkGithubTeams = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const teams = value.split(',');

  for (let i = 0; i < teams.length; i += 1) {
    const team = teams[i];
    const orgTeam = team.split('/');

    if (orgTeam.length !== 2) {
      return "Each team must be of format 'org/team'.";
    }

    if (!orgTeam[0] || !orgTeam[1]) {
      return "Each team must be of format 'org/team'.";
    }

    if (/\s/.test(orgTeam[0])) {
      return 'Organization must not contain whitespaces.';
    }

    if (/\s/.test(orgTeam[1])) {
      return 'Team must not contain whitespaces.';
    }
  }

  return undefined;
};

const parseNodeLabelKey = (
  labelKey: string | undefined,
): { name: string | undefined; prefix: string | undefined } => {
  const [name, prefix] =
    labelKey
      // split at the first delimiter, and only keep the first two segments,
      // to get rid of the empty match at the end
      ?.split(/\/(.+)/, 2)
      // reverse order before destructuring to ensure the name is always defined,
      // while the prefix is left undefined if missing
      ?.reverse() ?? [];

  return { name, prefix };
};

const parseNodeLabelTags = (labels: string[]) =>
  ([] as string[]).concat(labels).map((pair) => pair.split('='));

const parseNodeLabels = (input: string | string[] | undefined) => {
  // avoid processing falsy values (and specifically, empty strings)
  if (!input) {
    return undefined;
  }
  // turn the input into an array, if necessary
  const labels = typeof input === 'string' ? input.split(',') : input;

  return parseNodeLabelTags(labels);
};

const labelAndTaintKeyValidations = (
  value: string | undefined,
  items: { key?: string; value?: string }[],
  keyType?: string,
): Validations => {
  const { prefix, name } = parseNodeLabelKey(value);
  const isEmptyValid = items?.length === 1 && !items[0].key && !items[0].value;

  return [
    {
      validated: !!value && !MULTIPLE_FORWARD_SLASH_REGEX.test(value),
      text: "A qualified name must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character with an optional DNS subdomain prefix and '/' (e.g. 'example.com/MyName')",
    },
    {
      validated: typeof prefix === 'undefined' || DNS_SUBDOMAIN_REGEXP.test(prefix),
      text: "A valid key prefix part of a lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character",
    },
    {
      validated: typeof prefix === 'undefined' || prefix.length <= LABEL_KEY_PREFIX_MAX_LENGTH,
      text: `A valid key prefix must be ${LABEL_KEY_PREFIX_MAX_LENGTH} characters or less`,
    },
    {
      validated: typeof name === 'undefined' || LABEL_KEY_NAME_REGEX.test(name),
      text: "A valid key name must consist of alphanumeric characters, '-', '.' , '_'  or '/' and must start and end with an alphanumeric character",
    },

    {
      validated: typeof name === 'undefined' || name.length <= LABEL_KEY_NAME_MAX_LENGTH,
      text: `A valid key name must be ${LABEL_KEY_NAME_MAX_LENGTH} characters or less`,
    },
    {
      validated: isEmptyValid || (value !== undefined && value.length > 0),
      text:
        keyType === 'label'
          ? "A valid key name must consist of alphanumeric characters, '-', '.' , '_'  or '/' and must start and end with an alphanumeric character"
          : 'Required',
    },
  ];
};

const awsTagKeyValidations = (value: string | undefined): Validations => [
  { validated: !!value && value.length > 0, text: 'Required' },
  {
    validated: !!value && AWS_TAG_KEY_VALUE_REGEX.test(value),
    text: "A valid AWS Tag key must consist of alphanumeric characters or any of the following: '_', '.', ':', '/', '=', '+', '-', '@'",
  },

  {
    validated: !!value && value.length <= AWS_TAG_KEY_MAX_LENGTH,
    text: `A valid AWS Tag key must be ${AWS_TAG_KEY_MAX_LENGTH} characters or less`,
  },

  {
    validated: !!value && !value.toLowerCase().startsWith('aws'),
    text: 'AWS Tag keys cannot start with "aws"',
  },
];

const awsTagValueValidations = (value: string | undefined): Validations => [
  {
    validated: !value || (!!value && AWS_TAG_KEY_VALUE_REGEX.test(value)),
    text: "A valid AWS Tag value must consist of alphanumeric characters or any of the following: '_', '.', ':', '/', '=', '+', '-', '@'",
  },

  {
    validated: !value || (!!value && value.length <= AWS_TAG_VALUE_MAX_LENGTH),
    text: `A valid AWS Tag key must be ${AWS_TAG_VALUE_MAX_LENGTH} characters or less`,
  },
];

const labelAndTaintValueValidations = (value: string | undefined): Validations => [
  {
    validated:
      typeof value === 'undefined' || value === null || value.length <= LABEL_VALUE_MAX_LENGTH,
    text: `A valid value must be ${LABEL_VALUE_MAX_LENGTH} characters or less`,
  },
  {
    validated: typeof value === 'undefined' || LABEL_VALUE_REGEX.test(value),
    text: "A valid value must consist of alphanumeric characters, '-', '.' or '_' and must start and end with an alphanumeric character",
  },
];

const taintKeyValidations = (
  value: string | undefined,
  allValues: { taints?: Taint[] },
): Validations => {
  const items = allValues?.taints || [];
  return labelAndTaintKeyValidations(value, items, 'taint');
};

const nodeLabelKeyValidations = (
  value: string | undefined,
  allValues: { node_labels?: Taint[] },
): Validations => {
  const items = allValues?.node_labels || [];
  return labelAndTaintKeyValidations(value, items, 'label');
};

const checkLabelKey = createPessimisticValidator(nodeLabelKeyValidations);
const checkAwsTagKey = createPessimisticValidator(awsTagKeyValidations);
const checkAwsTagValue = createPessimisticValidator(awsTagValueValidations);

const checkLabelValue = createPessimisticValidator(labelAndTaintValueValidations);

const checkTaintKey = createPessimisticValidator(taintKeyValidations);
const checkTaintValue = createPessimisticValidator(labelAndTaintValueValidations);

const checkLabels = (input?: string | string[]) =>
  parseNodeLabels(input)
    // collect the first error found
    ?.reduce<string | undefined>(
      (accum, [key, value]) => accum ?? checkLabelKey(key) ?? checkLabelValue(value),
      // defaulting to undefined
      undefined,
    );

const findDuplicateKey = (labels: string[]) => {
  const keys = {} as { [key: string]: boolean };
  let duplicateKey = null;
  labels.forEach((tag) => {
    const labelParts = tag.split('=');
    const labelKey = labelParts[0];
    if (keys[labelKey]) {
      duplicateKey = labelKey;
    } else {
      keys[labelKey] = true;
    }
  });
  return duplicateKey;
};

const validateDuplicateLabels = (input: string | string[] | undefined) => {
  if (!input) {
    return undefined;
  }

  const labels = typeof input === 'string' ? input.split(',') : input;
  const duplicateKey = findDuplicateKey(labels);
  if (duplicateKey) {
    return `Each label should have a unique key. "${duplicateKey}" already exists.`;
  }
  return undefined;
};

const checkKeyValueFormat = (value: string): string | undefined =>
  value.trim() !== '' && value?.match(/((.*=.*),*)+/g) === null
    ? 'Routes should match comma separated pairs in key=value format'
    : undefined;

const checkRouteSelectors = (value: string): string | undefined =>
  checkLabels(value) || validateDuplicateLabels(value);

const checkLabelsAdditionalRouter = (value: string): string | undefined =>
  checkKeyValueFormat(value) || checkRouteSelectors(value);

// Function to validate that the cluster ID field is a UUID:
const checkClusterUUID = (value?: string): string | undefined => {
  if (!value) {
    return 'Cluster ID is required.';
  }
  if (!UUID_REGEXP.test(value)) {
    return `Cluster ID '${value}' is not a valid UUID.`;
  }
  return undefined;
};

// Function to validate the cluster display name length
const checkClusterDisplayName = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (value.length > MAX_CLUSTER_DISPLAY_NAME_LENGTH) {
    return `Cluster display name may not exceed ${MAX_CLUSTER_DISPLAY_NAME_LENGTH} characters.`;
  }
  return undefined;
};

const checkUser = (value: string): string | undefined => {
  if (!value) {
    return 'cannot be empty.';
  }
  if (value.trim() !== value) {
    return 'cannot contain leading and trailing spaces';
  }
  if (value.includes('/')) {
    return "cannot contain '/'.";
  }
  if (value.includes(':')) {
    return "cannot contain ':'.";
  }
  if (value.includes('%')) {
    return "cannot contain '%'.";
  }
  if (value === '~') {
    return "cannot be '~'.";
  }
  if (value === '.') {
    return "cannot be '.'.";
  }
  if (value === '..') {
    return "cannot be '..'.";
  }
  // User cluster-admin is reserved for internal use with the HTPasswd IdP
  if (value === 'cluster-admin') {
    return "cannot be 'cluster-admin'.";
  }
  return undefined;
};

const checkUserID = (value: string): string | undefined => {
  const invalid = checkUser(value);
  return invalid ? `User ID ${invalid}` : undefined;
};

const RHIT_PRINCIPAL_PATTERN = /^[^"$<> ^|%\\(),=;~:/*\r\n]*$/;
const validateRHITUsername = (username: string): string | undefined => {
  const valid = RHIT_PRINCIPAL_PATTERN.test(username);
  return valid ? undefined : 'Username includes illegal symbols';
};

const validateUrl = (value: string, protocol: string | string[] = 'http'): string | undefined => {
  if (!value) {
    return undefined;
  }
  let protocolArr: string[];
  if (typeof protocol === 'string') {
    protocolArr = [protocol];
  } else {
    protocolArr = protocol;
  }
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch (error) {
    return 'Invalid URL';
  } finally {
    const valueStart = value.substring(0, value.indexOf('://'));
    if (!protocolArr.includes(valueStart)) {
      const protocolStr = protocolArr.map((p) => `${p}://`).join(', ');
      // eslint-disable-next-line no-unsafe-finally
      return `The URL should include the scheme prefix (${protocolStr})`;
    }
  }
  return undefined;
};

const validateUrlHttpsAndHttp = (value: string) => validateUrl(value, ['http', 'https']);

const validateCA = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (value === 'Invalid file') {
    return 'Must be a PEM encoded X.509 file (.pem, .crt, .ca, .cert) and no larger than 4 MB';
  }
  return undefined;
};

// Function to validate the cluster console URL
const checkClusterConsoleURL = (value?: string, isRequired?: boolean): string | undefined => {
  if (!value) {
    return isRequired ? 'Cluster console URL should not be empty' : undefined;
  }
  let url;
  try {
    url = new URL(value);
  } catch (error) {
    if (!(value.startsWith('http://') || value.startsWith('https://'))) {
      return 'The URL should include the scheme prefix (http://, https://)';
    }
    return 'Invalid URL';
  }
  if (!CONSOLE_URL_REGEXP.test(value)) {
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
      return 'The URL should include the scheme prefix (http://, https://)';
    }
    if (url.hash !== '' || url.search !== '') {
      return 'The URL must not include a query string (?) or fragment (#)';
    }
    return 'Invalid URL';
  }
  return undefined;
};

const checkNoProxyDomains = (value?: string[]) => {
  if (value && value.length > 0) {
    const invalidDomains = value.filter(
      (domain) =>
        !!domain && !(BASE_DOMAIN_REGEXP.test(domain) && DNS_SUBDOMAIN_REGEXP.test(domain)),
    );
    const plural = invalidDomains.length > 1;
    if (invalidDomains.length > 0) {
      return `The domain${plural ? 's' : ''} '${invalidDomains.join(', ')}' ${
        plural ? "aren't" : "isn't"
      } valid, 
      must contain at least two valid lower-case DNS labels separated by dots, for example 'domain.com' or 'sub.domain.com'.`;
    }
  }
  return undefined;
};

// Function to validate IP address blocks
const cidr = (value?: string): string | undefined => {
  if (value && !CIDR_REGEXP.test(value)) {
    return `IP address range '${value}' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'.`;
  }
  return undefined;
};

const subnetCidrs = (
  value?: string,
  formData?: Record<string, string>,
  fieldName?: string,
  selectedSubnets?: Subnet[],
): string | undefined => {
  type ErroredSubnet = {
    cidr_block: string;
    name: string;
    subnet_id: string;
    overlaps?: boolean;
  };

  if (!value || selectedSubnets?.length === 0) {
    return undefined;
  }

  const erroredSubnets: ErroredSubnet[] = [];

  const startingIP = (cidr: string) => {
    const ip = new IPCIDR(cidr);
    return ip.start().toString();
  };

  const compareCidrs = (shouldInclude: boolean) => {
    if (shouldInclude) {
      selectedSubnets?.forEach((subnet: Subnet) => {
        if (
          CIDR_REGEXP.test(subnet.cidr_block) &&
          !containsCidr(value, startingIP(subnet.cidr_block))
        ) {
          erroredSubnets.push(subnet);
        }
      });
    } else {
      selectedSubnets?.forEach((subnet: Subnet) => {
        if (CIDR_REGEXP.test(subnet.cidr_block)) {
          if (containsCidr(value, startingIP(subnet.cidr_block))) {
            erroredSubnets.push(subnet);
          } else if (overlapCidr(value, subnet.cidr_block)) {
            const overlappedSubnet = { ...subnet, overlaps: true };
            erroredSubnets.push(overlappedSubnet);
          }
        }
      });
    }
  };

  const subnetName = () => erroredSubnets[0]?.name || erroredSubnets[0]?.subnet_id;

  if (fieldName === FieldId.NetworkMachineCidr) {
    compareCidrs(true);
    if (erroredSubnets.length > 0) {
      return `The Machine CIDR does not include the starting IP (${startingIP(
        erroredSubnets[0].cidr_block,
      )}) of ${subnetName()}`;
    }
  }
  if (fieldName === FieldId.NetworkServiceCidr) {
    compareCidrs(false);
    if (erroredSubnets.length > 0) {
      if (erroredSubnets[0]?.overlaps) {
        return `The Service CIDR overlaps with ${subnetName()} CIDR 
        '${erroredSubnets[0].cidr_block}'`;
      }
      return `The Service CIDR includes the starting IP (${startingIP(
        erroredSubnets[0].cidr_block,
      )}) of ${subnetName()}`;
    }
  }
  if (fieldName === FieldId.NetworkPodCidr) {
    compareCidrs(false);
    if (erroredSubnets.length > 0) {
      if (erroredSubnets[0]?.overlaps) {
        return `The Pod CIDR overlaps with ${subnetName()} CIDR 
        '${erroredSubnets[0].cidr_block}'`;
      }
      return `The Pod CIDR includes the starting IP (${startingIP(
        erroredSubnets[0].cidr_block,
      )}) of ${subnetName()}`;
    }
  }

  return undefined;
};

const awsMachineCidr = (value?: string, formData?: Record<string, string>): string | undefined => {
  if (!value) {
    return undefined;
  }

  const isMultiAz = formData?.multi_az === 'true';
  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength < AWS_MACHINE_CIDR_MIN) {
      return `The subnet mask can't be larger than '/${AWS_MACHINE_CIDR_MIN}'.`;
    }

    if (
      (isMultiAz || formData?.hypershift === 'true') &&
      prefixLength > AWS_MACHINE_CIDR_MAX_MULTI_AZ
    ) {
      return `The subnet mask can't be smaller than '/${AWS_MACHINE_CIDR_MAX_MULTI_AZ}'.`;
    }

    if (!isMultiAz && prefixLength > AWS_MACHINE_CIDR_MAX_SINGLE_AZ) {
      return `The subnet mask can't be smaller than '/${AWS_MACHINE_CIDR_MAX_SINGLE_AZ}'.`;
    }
  }

  return undefined;
};

const gcpMachineCidr = (value?: string, formData?: Record<string, string>): string | undefined => {
  if (!value) {
    return undefined;
  }

  const isMultiAz = formData?.multi_az === 'true';
  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (isMultiAz && prefixLength > GCP_MACHINE_CIDR_MAX) {
      const maxComputeNodes = 2 ** (28 - GCP_MACHINE_CIDR_MAX);
      const multiAZ = (maxComputeNodes - 9) * 3;
      return `The subnet mask can't be smaller than '/${GCP_MACHINE_CIDR_MAX}', which provides up to ${multiAZ} nodes.`;
    }

    if (!isMultiAz && prefixLength > GCP_MACHINE_CIDR_MAX) {
      const maxComputeNodes = 2 ** (28 - GCP_MACHINE_CIDR_MAX);
      const singleAZ = maxComputeNodes - 9;
      return `The subnet mask can't be smaller than '/${GCP_MACHINE_CIDR_MAX}', which provides up to ${singleAZ} nodes.`;
    }
  }

  return undefined;
};

const serviceCidr = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength > SERVICE_CIDR_MAX) {
      const maxServices = 2 ** (32 - SERVICE_CIDR_MAX) - 2;
      return `The subnet mask can't be smaller than '/${SERVICE_CIDR_MAX}', which provides up to ${maxServices} services.`;
    }
  }

  return undefined;
};

const podCidr = (value?: string, formData?: Record<string, string>): string | undefined => {
  if (!value) {
    return undefined;
  }

  const prefixLength = parseCIDRSubnetLength(value);
  if (prefixLength != null) {
    if (prefixLength > POD_CIDR_MAX) {
      return `The subnet mask can't be smaller than /${POD_CIDR_MAX}.`;
    }

    const hostPrefix = parseCIDRSubnetLength(formData?.network_host_prefix) || 23;
    const maxPodIPs = 2 ** (32 - hostPrefix);
    const maxPodNodes = Math.floor(2 ** (32 - prefixLength) / maxPodIPs);
    if (maxPodNodes < POD_NODES_MIN) {
      return `The subnet mask of /${prefixLength} does not allow for enough nodes. Try changing the host prefix or the pod subnet range.`;
    }
  }

  return undefined;
};

const validateRange = (value?: string): string | undefined => {
  if (cidr(value) !== undefined || !value) {
    return undefined;
  }
  const parts = value.split('/');
  const cidrBinaryString = parts[0]
    .split('.')
    .map((octet) => Number(octet).toString(2).padEnd(8, '0'))
    .join('');
  const maskBits = parseInt(parts[1], 10);
  const maskedBinaryString = cidrBinaryString.slice(0, maskBits).padEnd(32, '0');

  if (maskedBinaryString !== cidrBinaryString) {
    return 'This is not a subnet address. The subnet prefix is inconsistent with the subnet mask.';
  }
  return undefined;
};

const disjointSubnets =
  (fieldName: string) =>
  (value: string | undefined, formData: { [name: string]: Networks }): string | undefined => {
    if (!value) {
      return undefined;
    }

    const networkingFields: { [key: string]: string } = {
      network_machine_cidr: 'Machine CIDR',
      network_service_cidr: 'Service CIDR',
      network_pod_cidr: 'Pod CIDR',
    };
    delete networkingFields[fieldName];
    const overlappingFields: string[] = [];

    if (CIDR_REGEXP.test(value)) {
      Object.keys(networkingFields).forEach((name) => {
        const fieldValue = get(formData, name, null);
        try {
          if (fieldValue && overlapCidr(value, fieldValue)) {
            overlappingFields.push(networkingFields[name]);
          }
        } catch {
          // parse error for fieldValue; ignore
        }
      });
    }

    const plural = overlappingFields.length > 1;
    if (overlappingFields.length > 0) {
      return `This subnet overlaps with the subnet${
        plural ? 's' : ''
      } in the ${overlappingFields.join(', ')} field${plural ? 's' : ''}.`;
    }
    return undefined;
  };

const privateAddress = (value?: string): string | undefined => {
  if (cidr(value) !== undefined || !value) {
    return undefined;
  }
  const parts = value.split('/');
  const octets = parts[0].split('.').map((octet) => parseInt(octet, 10));
  const maskBits = parseInt(parts[1], 10);

  // 10.0.0.0/8 – 10.255.255.255
  if (octets[0] === 10 && maskBits >= 8) {
    return undefined;
  }

  // 172.16.0.0/12 – 172.31.255.255
  if (octets[0] === 172 && inRange(octets[1], 16, 32) && maskBits >= 12) {
    return undefined;
  }

  // 192.168.0.0/16 – 192.168.255.255
  if (octets[0] === 192 && octets[1] === 168 && maskBits >= 16) {
    return undefined;
  }

  return 'Range is not private.';
};

const awsSubnetMask =
  (fieldName: string | undefined) =>
  (value?: string): string | undefined => {
    if (!fieldName || cidr(value) !== undefined || !value) {
      return undefined;
    }
    const awsSubnetMaskRanges: { [key: string]: [number | undefined, number] } = {
      network_machine_cidr_single_az: [AWS_MACHINE_CIDR_MIN, AWS_MACHINE_CIDR_MAX_SINGLE_AZ],
      network_machine_cidr_multi_az: [AWS_MACHINE_CIDR_MIN, AWS_MACHINE_CIDR_MAX_MULTI_AZ],
      network_service_cidr: [undefined, SERVICE_CIDR_MAX],
    };
    const maskRange = awsSubnetMaskRanges[fieldName];
    const parts = value.split('/');
    const maskBits = parseInt(parts[1], 10);
    if (!maskRange[0]) {
      if (maskBits > maskRange[1] || maskBits < 1) {
        return `Subnet mask must be between /1 and /${maskRange[1]}.`;
      }
      return undefined;
    }
    if (!(maskRange[0] <= maskBits && maskBits <= maskRange[1])) {
      return `Subnet mask must be between /${maskRange[0]} and /${maskRange[1]}.`;
    }
    return undefined;
  };

// Function to validate IP address masks
const hostPrefix = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (!HOST_PREFIX_REGEXP.test(value)) {
    return `The value '${value}' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'.`;
  }

  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength < HOST_PREFIX_MIN) {
      const maxPodIPs = 2 ** (32 - HOST_PREFIX_MIN) - 2;
      return `The subnet mask can't be larger than '/${HOST_PREFIX_MIN}', which provides up to ${maxPodIPs} Pod IP addresses.`;
    }
    if (prefixLength > HOST_PREFIX_MAX) {
      const maxPodIPs = 2 ** (32 - HOST_PREFIX_MAX) - 2;
      return `The subnet mask can't be smaller than '/${HOST_PREFIX_MAX}', which provides up to ${maxPodIPs} Pod IP addresses.`;
    }
  }

  return undefined;
};

const nodesMultiAz = (value: string | number): string | undefined => {
  if (Number(value) % 3 > 0) {
    return 'Number of nodes must be multiple of 3 for Multi AZ cluster.';
  }
  return undefined;
};

/**
 * General function used to validate numeric user input according to some flags.
 * Returns an informative error message when taking an illegal input.
 * @param {*} input           Input string
 * @param {*} allowDecimal    true if input number may have a decimal point,
 *                            false if it must be an integer
 * @param {*} allowNeg        true if input number may be negative, otherwise false
 * @param {*} allowZero       true if input number may be 0, otherwise false
 */
const validateNumericInput = (
  input: string | undefined,
  { allowDecimal = false, allowNeg = false, allowZero = false, max = NaN, min = NaN } = {},
) => {
  if (!input) {
    return undefined; // accept empty input. Further validation done according to field
  }
  const value = Number(input);
  if (Number.isNaN(value)) {
    return 'Input must be a number.';
  }
  if (!Number.isNaN(min) && value < min) {
    return `Input cannot be less than ${min}.`;
  }
  if (!allowNeg && !allowZero && value <= 0) {
    return 'Input must be a positive number.';
  }
  if (!allowNeg && allowZero && value < 0) {
    return 'Input must be a non-negative number.';
  }
  if (!allowDecimal && input.toString().includes('.')) {
    return 'Input must be an integer.';
  }
  if (!Number.isNaN(max) && value > max) {
    return `Input cannot be more than ${max}.`;
  }
  return undefined;
};

const checkDisconnectedConsoleURL = (value?: string) => checkClusterConsoleURL(value, false);

const checkDisconnectedvCPU = (value?: string) => validateNumericInput(value, { max: 16000 });

const checkDisconnectedSockets = (value?: string) => validateNumericInput(value, { max: 2000 });

const checkDisconnectedMemCapacity = (value?: string) =>
  validateNumericInput(value, { allowDecimal: true, max: 256000 });

const validateARN = (value: string, regExp: RegExp, arnFormat: string): string | undefined => {
  if (!value) {
    return 'Field is required.';
  }
  if (/\s/.test(value)) {
    return 'Value must not contain whitespaces.';
  }
  if (!regExp.test(value)) {
    return `ARN value should be in the format arn:aws:iam::123456789012:${arnFormat}.`;
  }
  return undefined;
};

const validateUserOrGroupARN = (value: string) =>
  validateARN(value, AWS_USER_OR_GROUP_ARN_REGEX, 'user/name');
const validateRoleARN = (value: string) => validateARN(value, AWS_ROLE_ARN_REGEX, 'role/role-name');

const validatePrivateHostedZoneId = (value: string) => {
  if (!value) {
    return 'Field is required.';
  }
  if (!AWS_PRIVATE_HOSTED_ZONE_ID_REGEX.test(value)) {
    return 'Not a valid Private hosted zone ID.';
  }
  return undefined;
};

const validateGCPHostProjectId = (value: string) => {
  if (!value) {
    return 'Field is required.';
  }
  if (!GCP_PROJECT_ID_REGEX.test(value)) {
    return 'Not a valid hosted project ID. This must be an existing GCP project ID within which all networks are defined.';
  }
  return undefined;
};

/**
 * for ReduxFieldArray, validate there is at least one filled value.
 * Note that since ReduxFieldArray stores the input's key/id with each value,
 * and the value itself under a key with the name of the input
 * - this function is not like other validators, it's a function that returns a function,
 * so you can specify the field name.
 *
 * @param {*} values array of value objects
 */
const atLeastOneRequired =
  (fieldName: string, isEmpty?: (value: unknown) => boolean) => (fields: { name: string }[]) => {
    if (!fields) {
      return undefined;
    }
    let nonEmptyValues = 0;
    fields.forEach((field) => {
      if (isEmpty) {
        if (!isEmpty(field)) {
          nonEmptyValues += 1;
        }
      } else {
        const content = get(field, fieldName, null);
        if (content && (content as string).trim() !== '') {
          nonEmptyValues += 1;
        }
      }
    });

    if (nonEmptyValues === 0) {
      return 'At least one is required.';
    }
    return undefined;
  };

const awsNumericAccountID = (input?: string): string | undefined => {
  if (!input) {
    return 'AWS account ID is required.';
  }
  if (!AWS_NUMERIC_ACCOUNT_ID_REGEX.test(input)) {
    return 'AWS account ID must be a 12 digits positive number.';
  }
  return undefined;
};

const validateServiceAccountObject = (obj: Gcp): string | undefined => {
  const osdServiceAccountSchema = {
    id: '/osdServiceAccount',
    type: 'object',
    properties: {
      type: {
        const: 'service_account',
      },
      project_id: {
        type: 'string',
      },
      private_key_id: {
        type: 'string',
      },
      private_key: {
        type: 'string',
        pattern: '^-----BEGIN PRIVATE KEY-----\n(.|\n)*\n-----END PRIVATE KEY-----\n$',
      },
      client_email: {
        type: 'string',
        format: 'email',
        pattern: '^osd-ccs-admin@([\\S]*)\\.iam\\.gserviceaccount\\.com$',
      },
      client_id: {
        // maybe numeric?
        type: 'string',
      },
      auth_uri: {
        const: 'https://accounts.google.com/o/oauth2/auth',
      },
      token_uri: {
        type: 'string',
        format: 'uri',
      },
      auth_provider_x509_cert_url: {
        const: 'https://www.googleapis.com/oauth2/v1/certs',
      },
      client_x509_cert_url: {
        type: 'string',
        format: 'uri',
      },
    },
    required: [
      'type',
      'project_id',
      'private_key_id',
      'private_key',
      'client_email',
      'client_id',
      'auth_uri',
      'token_uri',
      'auth_provider_x509_cert_url',
      'client_x509_cert_url',
    ],
  };
  const v = new Validator();
  v.validate(obj, osdServiceAccountSchema, { throwError: true });
  return undefined;
};

const validateGCPServiceAccount = (content: string): string | undefined => {
  try {
    const contentObj = JSON.parse(content);
    return validateServiceAccountObject(contentObj);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return 'Invalid JSON format.';
    }
    if (e instanceof ValidationError) {
      let errorMessage;
      if (e.property.startsWith('instance.')) {
        const errorFieldName = e.property.replace('instance.', '');
        if (errorFieldName === 'client_email' && e.instance.split[0] !== 'osd-ccs-admin') {
          errorMessage = `The field '${errorFieldName}' requires a service account name of 'osd-ccs-admin'.`;
        } else if (e.message.indexOf('does not match pattern') !== -1) {
          errorMessage = `The field '${errorFieldName}' is not in the required format.`;
        } else {
          errorMessage = `The field '${errorFieldName}' ${e.message}`;
        }
      } else {
        errorMessage = e.message;
      }
      return `The provided JSON does not meet the requirements: ${errorMessage}`;
    }
    return undefined;
  }
};

/**
 * Creates a validation function for checking uniqueness within a collection of fields.
 *
 * @param error {string|Error} The error to return from the validation function,
 * in case the validation fails.
 * @param otherValuesSelector {function(string, object): (*[])} A function that
 * selects the other fields (excluding the one currently under validation),
 * and returns their values.
 * It is passed two parameters; the `name` of the field currently under validation,
 * and the `allValues` object.
 *
 * @returns {function(*, object, object, string): string|Error|undefined}
 * A field-level validation function that checks uniqueness.
 */
const createUniqueFieldValidator =
  (error: string, otherValuesSelector: (name: string, allValues: any) => any[]) =>
  (value: unknown, allValues: any, _: unknown, name: string) => {
    const otherValues = otherValuesSelector(name, allValues) ?? [];
    if (otherValues.includes(value)) {
      return error;
    }
    return undefined;
  };

const validateSecurityGroups = (securityGroups: string[], isHypershift: boolean) => {
  const maxSecurityGroups = isHypershift
    ? maxAdditionalSecurityGroupsHypershift
    : maxAdditionalSecurityGroups;
  return securityGroups?.length && securityGroups.length > maxSecurityGroups
    ? `A maximum of ${maxSecurityGroups} security groups can be selected.`
    : undefined;
};

const validateUniqueAZ = (
  currentAZ: string | undefined,
  allValues: { machinePoolsSubnets: FormSubnet[] },
) => {
  const sameAZs = (allValues.machinePoolsSubnets || [])
    .map((item) => item.availabilityZone)
    .filter((az: string) => !!currentAZ && az === currentAZ);
  return sameAZs.length > 1 ? 'Must select 3 different AZs.' : undefined;
};

const validateUniqueNodeLabel = createUniqueFieldValidator(
  'Each label must have a different key.',
  (
    currentFieldName: string,
    allValues: {
      ['node_labels']: {
        key: string;
        value: string;
      }[];
    },
  ) =>
    Object.entries(allValues.node_labels)
      .filter(([fieldKey]) => !currentFieldName.includes(`[${fieldKey}]`))
      .map(([, fieldValue]) => fieldValue.key),
);

const validateRequiredPublicSubnetId = (
  publicSubnetId: string,
  allValues: unknown,
  props?: { pristine: boolean },
) => (!props?.pristine && !publicSubnetId ? 'Subnet is required' : undefined);

// Validating multiple MPs
const hasRepeatedSubnets = (
  subnetId: string,
  allValues: { machinePoolsSubnets: FormSubnet[] },
): boolean =>
  allValues.machinePoolsSubnets.filter((mpSubnet) => mpSubnet.privateSubnetId === subnetId).length >
  1;

const hasRepeatedAvailabilityZones = (
  subnetId: string,
  machinePoolsSubnets: FormSubnet[],
): boolean => {
  const availabilityZoneFromSubnet = machinePoolsSubnets.find(
    (e) => e.privateSubnetId === subnetId,
  )?.availabilityZone;
  const availabilityZones = machinePoolsSubnets
    .filter((e) => e.availabilityZone === availabilityZoneFromSubnet)
    .map((e) => e.availabilityZone);

  return availabilityZones.length !== new Set(availabilityZones).size;
};

const validateMultipleMachinePoolsSubnets = (
  subnetId: string,
  allValues: { machinePoolsSubnets: FormSubnet[] },
  props?: { pristine: boolean; isHypershift?: boolean },
) => {
  switch (true) {
    case subnetId === '':
      return props?.pristine ? undefined : 'Subnet is required';
    case hasRepeatedSubnets(subnetId, allValues):
      return 'Every machine pool must be associated to a different subnet';
    case props?.isHypershift &&
      hasRepeatedAvailabilityZones(subnetId, allValues.machinePoolsSubnets):
      return 'Every machine pool subnet should belong to a different availability zone';
    default:
      return undefined;
  }
};

const validateGCPSubnet = (value?: string): string | undefined => {
  if (!value) {
    return 'Field is required.';
  }
  if (/\s/.test(value)) {
    return 'Name must not contain whitespaces.';
  }
  if (/[^a-z0-9-]/.test(value)) {
    return 'Name should contain only lowercase letters, numbers and hyphens.';
  }
  if (value.length > GCP_SUBNET_NAME_MAXLEN) {
    return `Name may not exceed ${GCP_SUBNET_NAME_MAXLEN} characters.`;
  }
  return undefined;
};

const validateGCPKMSServiceAccount = (value?: string): string | undefined => {
  if (!value) {
    return 'Field is required.';
  }
  if (/\s/.test(value)) {
    return 'Field must not contain whitespaces.';
  }
  if (!GCP_KMS_SERVICE_ACCOUNT_REGEX.test(value)) {
    return (
      'Field start with lowercase letter and can only contain hyphens (-), at (@) and dot (.).' +
      'For e.g. "myserviceaccount@myproj.iam.gserviceaccount.com" or "<projectnumericid>-compute@developer.gserviceaccount.com".'
    );
  }
  return undefined;
};

const validateAWSKMSKeyARN = (value: string, region: string): string | undefined => {
  if (!value) {
    return 'Field is required.';
  }

  if (/\s/.test(value)) {
    return 'Value must not contain whitespaces.';
  }

  if (
    value.includes(':key/mrk-')
      ? !AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(value)
      : !AWS_KMS_SERVICE_ACCOUNT_REGEX.test(value)
  ) {
    return 'Key provided is not a valid ARN. It should be in the format "arn:aws:kms:<region>:<accountid>:key/<keyid>".';
  }

  const kmsRegion = value.split('kms:')?.pop()?.split(':')[0];
  if (kmsRegion !== region) {
    return 'Your KMS key must contain your selected region.';
  }

  return undefined;
};

const validateHTPasswdPassword = (
  password: string,
):
  | {
      emptyPassword: boolean;
      baseRequirements: boolean;
      uppercase: boolean;
      lowercase: boolean;
      numbersOrSymbols: boolean;
    }
  | undefined => {
  const errors = {
    emptyPassword: false,
    baseRequirements: false,
    uppercase: false,
    lowercase: false,
    numbersOrSymbols: false,
  };
  if (!password || !password.trim()) {
    errors.emptyPassword = true;
    return errors;
  }
  if (
    (password.match(/[^\x20-\x7E]/g) || []).length !== 0 ||
    password.indexOf(' ') !== -1 ||
    password.length < 14
  ) {
    errors.baseRequirements = true;
  }
  if ((password.match(/[A-Z]/g) || []).length === 0) {
    errors.uppercase = true;
  }
  if ((password.match(/[a-z]/g) || []).length === 0) {
    errors.lowercase = true;
  }
  if (/^[a-zA-Z ]+$/.test(password)) {
    errors.numbersOrSymbols = true;
  }
  if (Object.values(errors).every((item) => item === false)) {
    return undefined;
  }
  return errors;
};

const validateUniqueHTPasswdUsername = (fields: { name: string }[]) => {
  if (!fields) {
    return undefined;
  }

  const dedup = new Set(fields.map((field) => get(field, 'username', null)));
  if (dedup.size !== fields.length) {
    return 'Usernames must be unique only.';
  }

  return undefined;
};

const validateHTPasswdUsername = (username: string): string | undefined => {
  if (
    indexOf(username, '%') !== -1 ||
    indexOf(username, ':') !== -1 ||
    indexOf(username, '/') !== -1 ||
    indexOf(username, ' ') !== -1
  ) {
    return 'Username must not contain /, :, %, or empty spaces.';
  }
  return undefined;
};

const validateHTPasswdPasswordConfirm = (
  passwordConfirm: string,
  allValues: { [key: string]: string },
  _unused: unknown,
  confirmField: string,
): string | undefined => {
  const pwdField = confirmField.substring(0, confirmField.lastIndexOf('-confirm'));
  const password = get(allValues, pwdField);
  if (passwordConfirm !== password) {
    return 'The passwords do not match';
  }
  return undefined;
};

const shouldSkipLabelKeyValidation = (
  allValues: Record<string, unknown>,
  name?: string,
): boolean => {
  const nodeLabels = (allValues?.node_labels as {
    key: string;
    value: string;
  }[]) ?? [{}];
  // filling the first and only label key/value pair is optional -it serves as a placeholder.
  // if empty, it won't be taken into account in the request payload.
  const [{ key: firstLabelKey, value: firstLabelValue }] = nodeLabels;

  // for deleted node labels, we need to skip validation by checking that the value does not exist in node_labels
  // keyIndex gets the index of the label from the name prop. example: '2' from 'node_labels[2].key'
  const keyIndex = name?.match(/\[([^[\]]*)\]/) ?? [];

  return (
    (nodeLabels.length === 1 && !firstLabelKey && !firstLabelValue) ||
    !Object.keys(nodeLabels).includes(keyIndex[1])
  );
};

const validateLabelKey = (
  key: string,
  allValues: Record<string, unknown>,
  props?: any,
  name?: any,
): string | undefined => {
  if (shouldSkipLabelKeyValidation(allValues, name)) {
    return undefined;
  }

  return checkLabelKey(key) ?? validateUniqueNodeLabel(key, allValues, props, name);
};

const validateLabelValue = checkLabelValue;

type Tls = {
  clusterRoutesTlsSecretRef?: string;
  clusterRoutesHostname?: string;
};

const validateTlsPair = (tlsSecret?: string, tlsHostname?: string) => {
  if (!tlsSecret && !tlsHostname) {
    return undefined;
  }
  if (!tlsSecret || !tlsHostname) {
    return 'You cannot provide only one of TLS secret name and Hostname';
  }
  return checkObjectName(tlsSecret, 'TLS secret', MAX_OBJECT_NAME_LENGTH);
};

const validateTlsSecretName = (value: string, allValues: Tls) =>
  validateTlsPair(value, allValues.clusterRoutesHostname);

const validateTlsHostname = (value: string, allValues: Tls) =>
  validateTlsPair(value, allValues.clusterRoutesTlsSecretRef);

const validateNamespacesList = (value = '') => {
  const namespaces = value.split(',');
  const incorrect = namespaces.find(
    (namespace) => !!checkObjectName(namespace, 'Namespace', MAX_OBJECT_NAME_LENGTH),
  );
  if (incorrect) {
    return checkObjectName(incorrect, 'Namespace', MAX_OBJECT_NAME_LENGTH);
  }

  return undefined;
};

const validateWorkerVolumeSize = (
  size: number,
  allValues: object,
  {
    minWorkerVolumeSizeGiB,
    maxWorkerVolumeSizeGiB,
  }: { minWorkerVolumeSizeGiB: number; maxWorkerVolumeSizeGiB: number },
) => {
  if (size < minWorkerVolumeSizeGiB || size > maxWorkerVolumeSizeGiB) {
    return `The worker root disk size must be between ${minWorkerVolumeSizeGiB} GiB and ${maxWorkerVolumeSizeGiB} GiB.`;
  }

  return size === Math.floor(size)
    ? undefined
    : 'Decimals are not allowed for the worker root disk size. Enter a whole number.';
};

const composeValidators =
  (...args: Array<(value: any) => string | undefined>) =>
  (value: any) => {
    for (let i = 0; i < args.length; i += 1) {
      const validator = args[i];
      const error = validator(value);

      if (error) {
        return error;
      }
    }

    return undefined;
  };

// Function to validate that a field contains a correct host domain
const checkHostDomain = (value?: string): string | undefined => {
  if (!value) {
    return 'Host domain is required.';
  }
  if (!BASE_DOMAIN_REGEXP.test(value)) {
    return `Host domain '${value}' isn't valid, must contain at least two valid lower-case host labels separated by dots, for example 'mydomain.com'.`;
  }
  return undefined;
};

const validateSecureURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const validators = {
  required,
  acknowledgePrerequisites,
  checkIdentityProviderName,
  checkClusterUUID,
  checkClusterDisplayName,
  checkUserID,
  validateRHITUsername,
  cidr,
  subnetCidrs,
  awsMachineCidr,
  gcpMachineCidr,
  serviceCidr,
  podCidr,
  disjointSubnets,
  validateRange,
  privateAddress,
  awsSubnetMask,
  hostPrefix,
  nodesMultiAz,
  validateNumericInput,
  validateLabelKey,
  validateLabelValue,
  validateWorkerVolumeSize,
  checkOpenIDIssuer,
  checkGithubTeams,
  checkRouteSelectors,
  checkDisconnectedConsoleURL,
  checkDisconnectedvCPU,
  checkDisconnectedSockets,
  checkDisconnectedMemCapacity,
  checkCustomOperatorRolesPrefix,
  checkHostDomain,
  AWS_MACHINE_CIDR_MIN,
  AWS_MACHINE_CIDR_MAX_SINGLE_AZ,
  AWS_MACHINE_CIDR_MAX_MULTI_AZ,
  GCP_MACHINE_CIDR_MAX,
  SERVICE_CIDR_MAX,
  POD_NODES_MIN,
  HOST_PREFIX_MIN,
  HOST_PREFIX_MAX,
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
};

export {
  acknowledgePrerequisites,
  asyncValidateClusterName,
  asyncValidateDomainPrefix,
  atLeastOneRequired,
  awsNumericAccountID,
  checkClusterConsoleURL,
  checkClusterDisplayName,
  checkClusterUUID,
  checkCustomOperatorRolesPrefix,
  checkDisconnectedConsoleURL,
  checkDisconnectedMemCapacity,
  checkDisconnectedSockets,
  checkDisconnectedvCPU,
  checkGithubTeams,
  checkHostDomain,
  checkIdentityProviderName,
  checkKeyValueFormat,
  checkLabelKey,
  checkLabels,
  checkLabelsAdditionalRouter,
  checkLabelValue,
  checkMachinePoolName,
  checkNodePoolName,
  checkNoProxyDomains,
  checkOpenIDIssuer,
  checkRouteSelectors,
  checkTaintKey,
  checkTaintValue,
  checkUserID,
  clusterAutoScalingValidators,
  clusterNameAsyncValidation,
  clusterNameValidation,
  composeValidators,
  createPessimisticValidator,
  domainPrefixAsyncValidation,
  domainPrefixValidation,
  evaluateClusterNameAsyncValidation,
  MAX_CLUSTER_NAME_LENGTH,
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
  required,
  requiredTrue,
  validateARN,
  validateAWSKMSKeyARN,
  validateCA,
  validateDuplicateLabels,
  validateGCPHostProjectId,
  validateGCPKMSServiceAccount,
  validateGCPServiceAccount,
  validateGCPSubnet,
  validateHTPasswdPassword,
  validateHTPasswdPasswordConfirm,
  validateHTPasswdUsername,
  validateLabelKey,
  validateLabelValue,
  validateListOfBalancingLabels,
  validateMaxNodes,
  validateMultipleMachinePoolsSubnets,
  validateNamespacesList,
  validateNumericInput,
  validatePositive,
  validatePrivateHostedZoneId,
  validateRequiredPublicSubnetId,
  validateRHITUsername,
  validateRoleARN,
  validateSecureURL,
  validateSecurityGroups,
  validateServiceAccountObject,
  validateTlsHostname,
  validateTlsSecretName,
  validateUniqueAZ,
  validateUniqueHTPasswdUsername,
  validateUniqueNodeLabel,
  validateUrl,
  validateUrlHttpsAndHttp,
  validateUserOrGroupARN,
  validateWorkerVolumeSize,
  checkAwsTagKey,
  checkAwsTagValue,
};

export default validators;
