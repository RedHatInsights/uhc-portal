import { parseSlackSelection } from './parseSlackSelection.mjs';

describe('parseSlackSelection', () => {
  it('returns skip when the input is empty', () => {
    expect(parseSlackSelection('', 4)).toEqual({ status: 'skip' });
  });

  it('returns skip when the input is only whitespace', () => {
    expect(parseSlackSelection('   ', 4)).toEqual({ status: 'skip' });
  });

  it('returns every index when the input is all', () => {
    expect(parseSlackSelection('all', 4)).toEqual({ status: 'ok', indices: [0, 1, 2, 3] });
  });

  it('returns every index when the input is ALL', () => {
    expect(parseSlackSelection('ALL', 3)).toEqual({ status: 'ok', indices: [0, 1, 2] });
  });

  it('returns the matching indices when the input is a comma-separated list with spaces', () => {
    expect(parseSlackSelection('1, 2', 4)).toEqual({ status: 'ok', indices: [0, 1] });
  });

  it('returns the matching indices when three numbers are selected from four links', () => {
    expect(parseSlackSelection('1,3,4', 4)).toEqual({ status: 'ok', indices: [0, 2, 3] });
  });

  it('returns unique indices when a number is repeated', () => {
    expect(parseSlackSelection('1,1', 4)).toEqual({ status: 'ok', indices: [0] });
  });

  it('returns invalid when the input is not a number or all', () => {
    const result = parseSlackSelection('foo', 4);

    expect(result.status).toBe('invalid');
    expect(result.message).toContain('Invalid selection "foo"');
  });

  it('returns invalid when all is misspelled', () => {
    expect(parseSlackSelection('alll', 4).status).toBe('invalid');
  });

  it('returns invalid when numbers are separated by spaces instead of commas', () => {
    expect(parseSlackSelection('1 2', 4).status).toBe('invalid');
  });

  it('returns invalid when a selection is out of range', () => {
    const result = parseSlackSelection('1, 99', 4);

    expect(result.status).toBe('invalid');
    expect(result.message).toContain('out of range');
  });

  it('returns invalid when one token in the list is not a number', () => {
    expect(parseSlackSelection('1, foo', 4).status).toBe('invalid');
  });
});
