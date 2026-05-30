import { getMinComputeNodeCount } from '../useUpdateMinComputeNodeCount';

describe('getMinComputeNodeCount', () => {
  it('returns null when isHypershift is false', () => {
    const result = getMinComputeNodeCount({
      isHypershift: false,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 1,
      newPoolsLength: 1,
    });

    expect(result).toBeNull();
  });

  it('returns null when currentNodes is undefined', () => {
    const result = getMinComputeNodeCount({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: undefined,
      newPoolsLength: 1,
    });

    expect(result).toBeNull();
  });

  it('returns null when current nodes are above minimum', () => {
    // For 1 pool: min=2, increment=1 → minUserInputNodes = 2
    const result = getMinComputeNodeCount({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 5,
      newPoolsLength: 1,
    });

    expect(result).toBeNull();
  });

  it('returns adjusted value when current nodes are below minimum for 1 pool', () => {
    // For 1 pool: min=2, increment=1 → minUserInputNodes = 2
    const result = getMinComputeNodeCount({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 1,
      newPoolsLength: 1,
    });

    expect(result).toBe(2);
  });

  it('returns null when current nodes equal the minimum for 2 pools', () => {
    // For 2 pools: min=2, increment=2 → minUserInputNodes = 1
    // So currentNodes=1 is valid and no adjustment needed
    const result = getMinComputeNodeCount({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 1,
      newPoolsLength: 2,
    });

    expect(result).toBeNull();
  });

  it('handles string currentNodes value', () => {
    // For 1 pool: min=2, increment=1 → minUserInputNodes = 2
    const result = getMinComputeNodeCount({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: '1',
      newPoolsLength: 1,
    });

    expect(result).toBe(2);
  });

  it('returns null when current nodes exactly equal the minimum (no adjustment needed)', () => {
    // For 1 pool: min=2, increment=1 → minUserInputNodes = 2
    // currentNodes=2 equals minimum, so no adjustment needed
    const result = getMinComputeNodeCount({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 2,
      newPoolsLength: 1,
    });

    expect(result).toBeNull();
  });
});
