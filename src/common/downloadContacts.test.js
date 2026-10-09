import contacts from './downloadContacts.json';
import { tools } from './installLinks.mjs';

describe('downloadContacts', () => {
  const contactsByKey = new Map(contacts.map((entry) => [entry.key, entry]));

  it('has a matching entry for every installLinks tool', () => {
    Object.values(tools).forEach((tool) => {
      expect(contactsByKey.has(tool)).toBe(true);
    });
  });

  it('gives non-deprecated tools at least one Slack channel', () => {
    Object.values(tools).forEach((tool) => {
      const entry = contactsByKey.get(tool);
      if (entry?.deprecated) {
        return;
      }

      expect(entry.slackChannels.length).toBeGreaterThan(0);
    });
  });

  it('keeps deprecated odo and rhoas entries with no active Slack channels', () => {
    ['odo', 'rhoas'].forEach((key) => {
      const entry = contactsByKey.get(key);
      expect(entry.deprecated).toBe(true);
      expect(entry.slackChannels).toEqual([]);
    });
  });
});
