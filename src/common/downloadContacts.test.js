import contacts from './downloadContacts.json';
import { tools, urls } from './installLinks.mjs';

const collectUrls = (node, out = []) => {
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  if (node && typeof node === 'object') {
    Object.values(node).forEach((value) => collectUrls(value, out));
  }
  return out;
};

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
      expect(entry).toBeDefined();
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

  it('maps every installLinks URL to the matching contact key', () => {
    const compiled = contacts.map((entry) => ({
      ...entry,
      urlRegex: new RegExp(entry.urlPattern),
    }));

    Object.values(tools).forEach((toolId) => {
      collectUrls(urls[toolId] || {}).forEach((url) => {
        const match = compiled.find((entry) => entry.urlRegex.test(url));
        expect(match?.key).toBe(toolId);
      });
    });
  });
});
