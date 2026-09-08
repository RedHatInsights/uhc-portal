import {
  ENHANCED_SPOT_MIN_VERSION,
  isEnhancedSpotVersionSupported,
} from './spotInterruptionHandlingConstants';

describe('isEnhancedSpotVersionSupported', () => {
  it('returns false when the version is below 4.22', () => {
    expect(isEnhancedSpotVersionSupported('4.21.9')).toBe(false);
  });

  it('returns true when the version is 4.22.0', () => {
    expect(isEnhancedSpotVersionSupported(ENHANCED_SPOT_MIN_VERSION)).toBe(true);
  });

  it('returns true when the version is above 4.22', () => {
    expect(isEnhancedSpotVersionSupported('4.23.0')).toBe(true);
  });

  it('returns true for 4.22 prerelease versions', () => {
    expect(isEnhancedSpotVersionSupported('4.22.0-0.nightly-2026-05-19-113338')).toBe(true);
  });

  it('returns false when the version is missing', () => {
    expect(isEnhancedSpotVersionSupported(undefined)).toBe(false);
    expect(isEnhancedSpotVersionSupported('')).toBe(false);
  });
});
