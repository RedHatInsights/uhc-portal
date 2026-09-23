import { stringToArrayTrimmed } from '~/common/helpers';
import { checkObjectName, MAX_OBJECT_NAME_LENGTH } from '~/common/validators';

const RESERVED_EXCLUDED_NAMESPACE_SUBSTRINGS = ['openshift', 'kube'];

const getExcludedNamespaceReservedSubstringError = (namespace: string): string | undefined => {
  const lowerNamespace = namespace.toLowerCase();
  if (
    RESERVED_EXCLUDED_NAMESPACE_SUBSTRINGS.some((substring) => lowerNamespace.includes(substring))
  ) {
    return `Excluded namespaces value '${namespace}' must not include 'openshift' or 'kube'`;
  }
  return undefined;
};

export const validateNamespacesList = (value = '') => {
  const namespaces = stringToArrayTrimmed(value);
  if (namespaces.length === 0) {
    return undefined;
  }

  const incorrect = namespaces.find(
    (namespace) => !!checkObjectName(namespace, 'Namespace', MAX_OBJECT_NAME_LENGTH),
  );
  if (incorrect) {
    return checkObjectName(incorrect, 'Namespace', MAX_OBJECT_NAME_LENGTH);
  }

  const reserved = namespaces.find((namespace) =>
    getExcludedNamespaceReservedSubstringError(namespace),
  );
  if (reserved) {
    return getExcludedNamespaceReservedSubstringError(reserved);
  }

  return undefined;
};
