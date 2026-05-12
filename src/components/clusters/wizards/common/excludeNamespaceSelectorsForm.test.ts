import {
  hasConfiguredExcludeNamespaceSelectors,
  parseFormExcludeNamespaceSelectorsToApi,
} from './excludeNamespaceSelectorsForm';

describe('excludeNamespaceSelectorsForm', () => {
  describe('parseFormExcludeNamespaceSelectorsToApi', () => {
    it('returns undefined for empty or placeholder rows', () => {
      expect(parseFormExcludeNamespaceSelectorsToApi(undefined)).toBeUndefined();
      expect(
        parseFormExcludeNamespaceSelectorsToApi([{ id: '1', key: '', value: '' }]),
      ).toBeUndefined();
    });

    it('maps trimmed keys and comma-separated values', () => {
      expect(
        parseFormExcludeNamespaceSelectorsToApi([
          { key: 'department', value: 'finance, HR, legal' },
          { key: 'type', value: 'customer' },
        ]),
      ).toEqual([
        { key: 'department', values: ['finance', 'HR', 'legal'] },
        { key: 'type', values: ['customer'] },
      ]);
    });

    it('drops rows with key but no values', () => {
      expect(
        parseFormExcludeNamespaceSelectorsToApi([{ key: 'k', value: '  ,  ' }]),
      ).toBeUndefined();
    });
  });

  describe('hasConfiguredExcludeNamespaceSelectors', () => {
    it('is false when parse yields nothing', () => {
      expect(hasConfiguredExcludeNamespaceSelectors([{ key: '', value: '' }])).toBe(false);
    });

    it('is true when at least one selector has values', () => {
      expect(hasConfiguredExcludeNamespaceSelectors([{ key: 'env', value: 'prod' }])).toBe(true);
    });
  });
});
