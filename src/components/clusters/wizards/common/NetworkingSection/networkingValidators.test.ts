import { validateNamespacesList } from './networkingValidators';

describe('validateNamespacesList', () => {
  const invalidNamespaceError = (name: string) =>
    `Namespace name '${name}' isn't valid, must consist of lower-case alphanumeric characters or '-', start with an alphabetic character, and end with an alphanumeric character. For example, 'my-name', or 'abc-123'.`;
  const reservedNamespaceError = (name: string) =>
    `Excluded namespaces value '${name}' must not include 'openshift' or 'kube'`;
  const longNamespaceName = `a${'b'.repeat(63)}`;

  it.each([
    ['', undefined],
    ['foo-bar', undefined],
    ['foo-bar,my-namespace,abc-123', undefined],
    ['Invalid_Name', invalidNamespaceError('Invalid_Name')],
    ['123foo', invalidNamespaceError('123foo')],
    [longNamespaceName, 'Namespace names may not exceed 63 characters.'],
    ['foo-bar,Invalid_Name', invalidNamespaceError('Invalid_Name')],
    ['openshift', reservedNamespaceError('openshift')],
    ['kube', reservedNamespaceError('kube')],
    ['openshift-monitoring', reservedNamespaceError('openshift-monitoring')],
    ['kube-system', reservedNamespaceError('kube-system')],
    ['foo-bar,kube-system', reservedNamespaceError('kube-system')],
  ])('value %p to be %p', (value: string, expected: string | undefined) =>
    expect(validateNamespacesList(value)).toBe(expected),
  );
});
