import { MAX_NODES_DEFAULT } from '~/components/clusters/common/clusterAutoScalingValues';
import { FieldId } from '~/components/clusters/wizards/osd/constants';

import {
  checkHostDomain,
  composeValidators,
  validateExcludeNamespaceSelectorKey,
  validateExcludeNamespaceSelectorValue,
  validateMaxNodes,
  validatePositive,
  validateSecureURL,
} from './validators';

describe('validators', () => {
  describe('checkHostDomain', () => {
    it('should return undefined if the host domain is valid', () => {
      expect(checkHostDomain('example.com')).toEqual(undefined);
    });

    it('should return error if the host domain is invalid', () => {
      expect(checkHostDomain('example')).toBeDefined();
    });
    it('should return error if the host domain contains protocol', () => {
      expect(checkHostDomain('https://example.com')).toBeDefined();
    });
    it('should return error if the host domain is empty', () => {
      expect(checkHostDomain('')).toBeDefined();
    });
    it('should return undefined if subdomain host domain is valid', () => {
      expect(checkHostDomain('sub.example.com')).toEqual(undefined);
    });
  });
  describe('validateSecureURL', () => {
    it('should return false if no secure protocol', () => {
      expect(validateSecureURL('example.com')).toEqual(false);
    });

    it('should return false if the host domain is invalid', () => {
      expect(validateSecureURL('example')).toEqual(false);
    });
    it('should return true if the host domain contains secure protocol', () => {
      expect(validateSecureURL('https://example.com')).toEqual(true);
    });
    it('should return false if the host domain is empty', () => {
      expect(validateSecureURL('')).toEqual(false);
    });
    it('should return false if subdomain host domain is valid but unsecure', () => {
      expect(validateSecureURL('http://sub.example.com')).toEqual(false);
    });
  });
  describe('composeValidators', () => {
    const validateFnc1 = () => 'Error 1';
    const validateFnc2 = () => 'Error 2';
    const validateFnc3 = () => undefined;

    it('should return the first encountered error string', () => {
      expect(composeValidators(validateFnc1, validateFnc2, validateFnc3)('')).toEqual('Error 1');
      expect(composeValidators(validateFnc3, validateFnc2, validateFnc1)('')).toEqual('Error 2');
    });
  });

  describe('Cluster autosacler validators', () => {
    describe('Max nodes total', () => {
      it('should not allow a value larger than the max nodes', () => {
        expect(validateMaxNodes(MAX_NODES_DEFAULT + 5, MAX_NODES_DEFAULT)).toEqual(
          `Value must not be greater than ${MAX_NODES_DEFAULT}.`,
        );
      });
      it('should allow a value less than or equal to the max nodes', () => {
        expect(validateMaxNodes(MAX_NODES_DEFAULT - 5, MAX_NODES_DEFAULT)).toEqual(undefined);
        expect(validateMaxNodes(MAX_NODES_DEFAULT, MAX_NODES_DEFAULT)).toEqual(undefined);
      });
    });
  });

  describe('validatePositive', () => {
    it.each([
      ['should not allow a negative value', -5, 'Input must be a positive number.'],
      ['should not allow 0', 0, 'Input must be a positive number.'],
      ['should allow a positive value', 5, undefined],
    ])('%s', (_title: string, value: number | string, expected: string | undefined) =>
      expect(validatePositive(value)).toBe(expected),
    );
  });

  describe('validateExcludeNamespaceSelectorKey', () => {
    const field = FieldId.DefaultRouterExcludeNamespaceSelectors;
    const keyName = (index: number) => `${field}[${index}].key`;

    it('returns undefined for a single empty placeholder row', () => {
      expect(
        validateExcludeNamespaceSelectorKey(
          '',
          { [field]: [{ key: '', value: '' }] },
          undefined,
          keyName(0),
        ),
      ).toBeUndefined();
    });

    it('returns an error when the key is not a valid Kubernetes label key', () => {
      expect(
        validateExcludeNamespaceSelectorKey(
          'Invalid_Label_Key!',
          { [field]: [{ key: 'Invalid_Label_Key!', value: 'v' }] },
          undefined,
          keyName(0),
        ),
      ).toBe(
        "A valid key name must consist of alphanumeric characters, '-', '.' , '_'  or '/' and must start and end with an alphanumeric character",
      );
    });

    it('returns undefined for a valid unique key', () => {
      expect(
        validateExcludeNamespaceSelectorKey(
          'department',
          { [field]: [{ key: 'department', value: 'finance' }] },
          undefined,
          keyName(0),
        ),
      ).toBeUndefined();
    });

    it('returns an error when another row already uses the same key', () => {
      expect(
        validateExcludeNamespaceSelectorKey(
          'env',
          {
            [field]: [
              { key: 'env', value: 'prod' },
              { key: 'env', value: 'dev' },
            ],
          },
          undefined,
          keyName(1),
        ),
      ).toBe('Each selector must have a different key.');
    });

    it('returns undefined after format check when field name is missing (no uniqueness check)', () => {
      expect(
        validateExcludeNamespaceSelectorKey('env', { [field]: [{ key: 'env', value: 'prod' }] }),
      ).toBeUndefined();
    });
  });

  describe('validateExcludeNamespaceSelectorValue', () => {
    const field = FieldId.DefaultRouterExcludeNamespaceSelectors;
    const valueName = (index: number) => `${field}[${index}].value`;

    it('returns undefined for a single empty placeholder row', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          '',
          { [field]: [{ key: '', value: '' }] },
          undefined,
          valueName(0),
        ),
      ).toBeUndefined();
    });

    it('returns an error when values are set before the row key', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          'prod',
          { [field]: [{ key: '', value: 'prod' }] },
          undefined,
          valueName(0),
        ),
      ).toBe('Enter a label key before values.');
    });

    it('returns an error when the key is set but values string is empty', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          '',
          { [field]: [{ key: 'env', value: '' }] },
          undefined,
          valueName(0),
        ),
      ).toBe('Enter at least one value, separated by commas.');
    });

    it('returns an error when the key is set but values are only whitespace', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          '   ',
          { [field]: [{ key: 'env', value: '' }] },
          undefined,
          valueName(0),
        ),
      ).toBe('Each comma-separated value must not have leading or trailing spaces.');
    });

    it('returns an error when a comma-separated value has surrounding spaces', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          'prod , staging',
          { [field]: [{ key: 'env', value: 'prod , staging' }] },
          undefined,
          valueName(0),
        ),
      ).toBe('Each comma-separated value must not have leading or trailing spaces.');
    });

    it('returns an error when values start with a comma', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          ',prod',
          { [field]: [{ key: 'env', value: ',prod' }] },
          undefined,
          valueName(0),
        ),
      ).toBe('Do not use a leading comma, trailing comma, or two commas in a row.');
    });

    it('returns an error when values end with a comma', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          'prod,',
          { [field]: [{ key: 'env', value: 'prod,' }] },
          undefined,
          valueName(0),
        ),
      ).toBe('Do not use a leading comma, trailing comma, or two commas in a row.');
    });

    it('returns an error when two commas appear without a value between them', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          'prod,,staging',
          { [field]: [{ key: 'env', value: 'prod,,staging' }] },
          undefined,
          valueName(0),
        ),
      ).toBe('Do not use a leading comma, trailing comma, or two commas in a row.');
    });

    it('returns undefined for comma-separated label values', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          'finance,hr,legal',
          { [field]: [{ key: 'department', value: 'finance,hr,legal' }] },
          undefined,
          valueName(0),
        ),
      ).toBeUndefined();
    });

    it('returns an error when a comma-separated segment is not a valid label value', () => {
      const message = validateExcludeNamespaceSelectorValue(
        'good,bad value!',
        { [field]: [{ key: 'k', value: 'good,bad value!' }] },
        undefined,
        valueName(0),
      );
      expect(message).toBeDefined();
      expect(message).toContain('valid value');
    });

    it('returns an error when a value is the openshift-console namespace name', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          'openshift-console',
          { [field]: [{ key: 'kubernetes.io/metadata.name', value: 'openshift-console' }] },
          undefined,
          valueName(0),
        ),
      ).toBe(
        'Do not exclude openshift-console or openshift-authentication namespaces; they are vital to cluster operations.',
      );
    });

    it('returns an error when a value is the openshift-authentication namespace name', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          'openshift-authentication',
          { [field]: [{ key: 'kubernetes.io/metadata.name', value: 'openshift-authentication' }] },
          undefined,
          valueName(0),
        ),
      ).toBe(
        'Do not exclude openshift-console or openshift-authentication namespaces; they are vital to cluster operations.',
      );
    });

    it('returns an error when a comma-separated list includes a protected namespace (case-insensitive)', () => {
      expect(
        validateExcludeNamespaceSelectorValue(
          'tenant-a,OPENSHIFT-CONSOLE',
          {
            [field]: [{ key: 'kubernetes.io/metadata.name', value: 'tenant-a,OPENSHIFT-CONSOLE' }],
          },
          undefined,
          valueName(0),
        ),
      ).toBe(
        'Do not exclude openshift-console or openshift-authentication namespaces; they are vital to cluster operations.',
      );
    });
  });
});
