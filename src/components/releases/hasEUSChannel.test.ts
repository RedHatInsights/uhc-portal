import {
  hasEUSChannel,
  hasEUSChannelByEvenMinor,
  hasEUSChannelFromLifeCycle,
} from './hasEUSChannel';

describe('hasEUSChannel helpers', () => {
  describe('hasEUSChannelByEvenMinor', () => {
    it.each(['4.6', '4.8', '4.12', '4.16'])('returns true for even minor %s', (version) => {
      expect(hasEUSChannelByEvenMinor(version)).toBe(true);
    });

    it.each(['4.5', '4.7', '4.11', '5.0', '5.1', 'invalid'])(
      'returns false for non-EUS-pattern version %s',
      (version) => {
        expect(hasEUSChannelByEvenMinor(version)).toBe(false);
      },
    );
  });

  describe('hasEUSChannelFromLifeCycle', () => {
    it('returns true when Extended update support has a concrete start date', () => {
      expect(
        hasEUSChannelFromLifeCycle({
          name: '5.0',
          type: 'Full Support',
          phases: [
            {
              name: 'Extended update support',
              start_date: '2028-03-01T00:00:00.000Z',
              end_date: '2028-09-01T00:00:00.000Z',
              start_date_format: 'date',
              end_date_format: 'date',
            },
          ],
        }),
      ).toBe(true);
    });

    it('returns false when Extended update support dates are N/A', () => {
      expect(
        hasEUSChannelFromLifeCycle({
          name: '5.1',
          type: 'Full Support',
          phases: [
            {
              name: 'Extended update support',
              start_date: 'N/A',
              end_date: 'N/A',
              start_date_format: 'string',
              end_date_format: 'string',
            },
          ],
        }),
      ).toBe(false);
    });

    it('returns false when phases are missing', () => {
      expect(hasEUSChannelFromLifeCycle({ name: '4.12', type: 'Full Support' })).toBe(false);
    });
  });

  describe('hasEUSChannel', () => {
    const evenMinorWithoutPhases = { name: '4.12', type: 'Full Support' };
    const oddMinorWithEusDates = {
      name: '5.1',
      type: 'Full Support',
      phases: [
        {
          name: 'Extended update support',
          start_date: '2029-01-01T00:00:00.000Z',
          end_date: '2029-07-01T00:00:00.000Z',
          start_date_format: 'date' as const,
          end_date_format: 'date' as const,
        },
      ],
    };

    it('uses even-minor rule when OCP5 support is disabled', () => {
      expect(hasEUSChannel(evenMinorWithoutPhases, false)).toBe(true);
      expect(hasEUSChannel(oddMinorWithEusDates, false)).toBe(false);
    });

    it('uses lifecycle phase data when OCP5 support is enabled', () => {
      expect(hasEUSChannel(evenMinorWithoutPhases, true)).toBe(false);
      expect(hasEUSChannel(oddMinorWithEusDates, true)).toBe(true);
    });
  });
});
