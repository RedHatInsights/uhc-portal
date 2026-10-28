import { mockRestrictedEnv } from '~/testUtils';

import {
  FULL_CMVP_APPROVAL_MAX_MINOR,
  shouldShowRosaGovCloudFipsWarningOnUpgrade,
} from './RosaGovCloudFipsWarningHelpers';

describe('shouldShowRosaGovCloudFipsWarningOnUpgrade', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns false outside restricted env even when version is on the full-CMVP line', () => {
    mockRestrictedEnv(false);

    expect(shouldShowRosaGovCloudFipsWarningOnUpgrade('4.18.0')).toBe(false);
  });

  it.each(['4.17.1', '4.18.0', '4.18.9', '4.18.0-0.nightly'])(
    'returns true in restricted env when version %s is still on the full-CMVP line',
    (version) => {
      mockRestrictedEnv(true);

      expect(shouldShowRosaGovCloudFipsWarningOnUpgrade(version)).toBe(true);
    },
  );

  it.each(['4.19.0', '4.19.5', '4.22.1', '5.0.0', '5.1.2'])(
    'returns false in restricted env when version %s is above the full-CMVP line',
    (version) => {
      mockRestrictedEnv(true);

      expect(shouldShowRosaGovCloudFipsWarningOnUpgrade(version)).toBe(false);
    },
  );

  it('returns false when version is missing', () => {
    mockRestrictedEnv(true);

    expect(shouldShowRosaGovCloudFipsWarningOnUpgrade(undefined)).toBe(false);
    expect(shouldShowRosaGovCloudFipsWarningOnUpgrade('')).toBe(false);
  });

  it(`uses ${FULL_CMVP_APPROVAL_MAX_MINOR} as the full-CMVP max minor`, () => {
    expect(FULL_CMVP_APPROVAL_MAX_MINOR).toBe('4.18');
  });
});
