import { expandSeverityTypesForFilter } from '../serviceLogSeverity';

describe('expandSeverityTypesForFilter', () => {
  it('returns an empty list unchanged', () => {
    expect(expandSeverityTypesForFilter([])).toEqual([]);
  });

  it('expands Warning to include Moderate and vice versa', () => {
    expect(expandSeverityTypesForFilter(['Warning']).sort()).toEqual(['Moderate', 'Warning']);
    expect(expandSeverityTypesForFilter(['Moderate']).sort()).toEqual(['Moderate', 'Warning']);
  });

  it('expands Info ↔ Low and Major ↔ Important', () => {
    expect(expandSeverityTypesForFilter(['Info']).sort()).toEqual(['Info', 'Low']);
    expect(expandSeverityTypesForFilter(['Low']).sort()).toEqual(['Info', 'Low']);
    expect(expandSeverityTypesForFilter(['Major']).sort()).toEqual(['Important', 'Major']);
    expect(expandSeverityTypesForFilter(['Important']).sort()).toEqual(['Important', 'Major']);
  });

  it('leaves unpaired severities unchanged', () => {
    expect(expandSeverityTypesForFilter(['Critical', 'Debug'])).toEqual(['Critical', 'Debug']);
  });

  it('deduplicates when both sides of a pair are selected', () => {
    expect(expandSeverityTypesForFilter(['Warning', 'Moderate']).sort()).toEqual([
      'Moderate',
      'Warning',
    ]);
  });

  it('does not treat Object.prototype names as severity mappings', () => {
    expect(expandSeverityTypesForFilter(['toString', 'constructor'])).toEqual([
      'toString',
      'constructor',
    ]);
  });
});
