import { NamespaceSelector } from '~/types/clusters_mgmt.v1';

import { apiSelectorsToFormRows, excludeNamespaceSelectorsAsString } from './NetworkingSelector';

describe('excludeNamespaceSelectorsAsString', () => {
  it('returns empty string for undefined', () => {
    expect(excludeNamespaceSelectorsAsString(undefined)).toBe('');
  });

  it('returns empty string for empty array', () => {
    expect(excludeNamespaceSelectorsAsString([])).toBe('');
  });

  it('formats a single selector with one value as key=value', () => {
    const selectors: NamespaceSelector[] = [{ key: 'type', values: ['customer'] }];
    expect(excludeNamespaceSelectorsAsString(selectors)).toBe('type=customer');
  });

  it('formats a single selector with multiple values as key=[v1, v2]', () => {
    const selectors: NamespaceSelector[] = [{ key: 'department', values: ['finance', 'HR'] }];
    expect(excludeNamespaceSelectorsAsString(selectors)).toBe('department=[finance, HR]');
  });

  it('formats multiple selectors separated by commas', () => {
    const selectors: NamespaceSelector[] = [
      { key: 'department', values: ['finance', 'HR'] },
      { key: 'type', values: ['customer'] },
    ];
    expect(excludeNamespaceSelectorsAsString(selectors)).toBe(
      'department=[finance, HR], type=customer',
    );
  });

  it('filters out selectors without a key', () => {
    const selectors: NamespaceSelector[] = [
      { key: 'department', values: ['finance'] },
      { values: ['orphan'] },
    ];
    expect(excludeNamespaceSelectorsAsString(selectors)).toBe('department=finance');
  });

  it('handles a selector with empty values array', () => {
    const selectors: NamespaceSelector[] = [{ key: 'env', values: [] }];
    expect(excludeNamespaceSelectorsAsString(selectors)).toBe('env=');
  });

  it('handles a selector with undefined values', () => {
    const selectors: NamespaceSelector[] = [{ key: 'env' }];
    expect(excludeNamespaceSelectorsAsString(selectors)).toBe('env=');
  });
});

describe('apiSelectorsToFormRows', () => {
  it('returns empty array for undefined', () => {
    expect(apiSelectorsToFormRows(undefined)).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(apiSelectorsToFormRows([])).toEqual([]);
  });

  it('maps a single selector to a form row with comma-joined values', () => {
    const selectors: NamespaceSelector[] = [{ key: 'department', values: ['finance', 'HR'] }];
    expect(apiSelectorsToFormRows(selectors)).toEqual([{ key: 'department', value: 'finance,HR' }]);
  });

  it('maps multiple selectors to form rows', () => {
    const selectors: NamespaceSelector[] = [
      { key: 'department', values: ['finance', 'HR', 'legal'] },
      { key: 'type', values: ['customer'] },
    ];
    expect(apiSelectorsToFormRows(selectors)).toEqual([
      { key: 'department', value: 'finance,HR,legal' },
      { key: 'type', value: 'customer' },
    ]);
  });

  it('filters out selectors without a key', () => {
    const selectors: NamespaceSelector[] = [
      { key: 'env', values: ['prod'] },
      { values: ['orphan'] },
    ];
    expect(apiSelectorsToFormRows(selectors)).toEqual([{ key: 'env', value: 'prod' }]);
  });

  it('handles a selector with empty values', () => {
    const selectors: NamespaceSelector[] = [{ key: 'env', values: [] }];
    expect(apiSelectorsToFormRows(selectors)).toEqual([{ key: 'env', value: '' }]);
  });

  it('handles a selector with undefined values', () => {
    const selectors: NamespaceSelector[] = [{ key: 'env' }];
    expect(apiSelectorsToFormRows(selectors)).toEqual([{ key: 'env', value: '' }]);
  });
});
