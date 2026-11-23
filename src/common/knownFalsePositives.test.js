import {
  countKnownFalsePositives,
  errorMarker,
  formatSummaryStatusLine,
  getActionableErrorCount,
  getKnownFalsePositiveNote,
  getKnownFalsePositiveNoteForBrokenLink,
} from './knownFalsePositives.mjs';

describe('knownFalsePositives', () => {
  describe('getKnownFalsePositiveNote', () => {
    it('returns the Slack invite reason when the URL matches the shared_invite pattern', () => {
      expect(getKnownFalsePositiveNote('https://join.slack.com/t/org/shared_invite/abc')).toBe(
        'Slack invite links block programmatic access (expected 403)',
      );
    });

    it('returns the Google Cloud Console reason when the URL matches console.cloud.google.com', () => {
      expect(
        getKnownFalsePositiveNote('https://console.cloud.google.com/marketplace/product/foo'),
      ).toBe('Google Cloud Console returns oversized headers that exceed node-fetch limits');
    });

    it('returns null when the URL does not match a known false-positive pattern', () => {
      expect(getKnownFalsePositiveNote('https://example.com/real-broken-link')).toBeNull();
    });
  });

  describe('getKnownFalsePositiveNoteForBrokenLink', () => {
    it('returns the destination note when the redirect URL matches a known false-positive pattern', () => {
      expect(
        getKnownFalsePositiveNoteForBrokenLink(
          'https://red.ht/rosa-slack',
          'https://join.slack.com/t/org/shared_invite/abc',
        ),
      ).toBe('Slack invite links block programmatic access (expected 403)');
    });

    it('returns the original URL note when only the original URL matches', () => {
      expect(
        getKnownFalsePositiveNoteForBrokenLink(
          'https://join.slack.com/t/org/shared_invite/abc',
          'https://example.com/elsewhere',
        ),
      ).toBe('Slack invite links block programmatic access (expected 403)');
    });

    it('returns null when neither URL matches a known false-positive pattern', () => {
      expect(
        getKnownFalsePositiveNoteForBrokenLink(
          'https://example.com/from',
          'https://example.com/to',
        ),
      ).toBeNull();
    });
  });

  describe('getActionableErrorCount', () => {
    it('returns total errors minus known false positives as the actionable count', () => {
      expect(getActionableErrorCount(4, 2)).toBe(2);
    });

    it('returns 0 when every error is a known false positive', () => {
      expect(getActionableErrorCount(2, 2)).toBe(0);
    });
  });

  describe('formatSummaryStatusLine', () => {
    it('returns an Issues found status line when actionable errors is greater than 0', () => {
      expect(formatSummaryStatusLine(2, 2)).toBe(
        '👎 Issues found (2 known false positives 🟡, 2 actionable 🔴)',
      );
    });

    it('returns an All clear status line when actionable errors is 0 and known false positives exist', () => {
      expect(formatSummaryStatusLine(2, 0)).toBe(
        '👍 All clear (2 known false positives 🟡, 0 actionable 🔴)',
      );
    });

    it('returns an All clear status line when there are no errors', () => {
      expect(formatSummaryStatusLine(0, 0)).toBe(
        '👍 All clear (0 known false positives 🟡, 0 actionable 🔴)',
      );
    });
  });

  describe('errorMarker', () => {
    it('returns 🟡 when a false-positive note is present', () => {
      expect(errorMarker('Slack invite links block programmatic access (expected 403)')).toBe('🟡');
    });

    it('returns 🔴 when a false-positive note is not present', () => {
      expect(errorMarker(null)).toBe('🔴');
    });
  });

  describe('countKnownFalsePositives', () => {
    it('counts matching client, request, and redirect errors and ignores unmatched URLs', () => {
      const categories = {
        clientErrors: [
          { url: 'https://join.slack.com/t/org/shared_invite/abc' },
          { url: 'https://example.com/real-broken-link' },
        ],
        serverErrors: [],
        errors: [{ url: 'https://console.cloud.google.com/marketplace/product/foo' }],
      };
      const testedRedirects = [
        {
          originalUrl: 'https://red.ht/rosa-slack',
          redirectUrl: 'https://join.slack.com/t/org/shared_invite/abc',
          finalStatus: 403,
        },
        {
          originalUrl: 'https://example.com/from',
          redirectUrl: 'https://example.com/to',
          finalStatus: 404,
        },
      ];

      expect(countKnownFalsePositives(categories, testedRedirects)).toBe(3);
    });
  });
});
