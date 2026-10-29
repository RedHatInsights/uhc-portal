/**
 * Ownership map for download/binary URLs used by check-links.mjs --slack.
 * Loads downloadContacts.json and compiles urlPattern strings to RegExp.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const jsonPath = join(dirname(fileURLToPath(import.meta.url)), 'downloadContacts.json');

/**
 * @returns {Array<Object>} Raw entries from downloadContacts.json
 */
const readDownloadContacts = () => JSON.parse(readFileSync(jsonPath, 'utf8'));

/**
 * Loads download contact entries and compiles each urlPattern to a RegExp.
 * @returns {Array<Object>} Entries with urlRegex added
 */
const getDownloadContacts = () =>
  readDownloadContacts().map((entry) => ({
    ...entry,
    urlRegex: new RegExp(entry.urlPattern),
  }));

/**
 * Finds the first contact whose urlPattern matches the given URL.
 * @param {string} url
 * @param {Array<Object>} [contacts]
 * @returns {Object|null}
 */
const findContactForUrl = (url, contacts = getDownloadContacts()) =>
  contacts.find((entry) => entry.urlRegex.test(url)) ?? null;

/**
 * @param {string} key
 * @param {Array<Object>} [contacts]
 * @returns {Object|null}
 */
const findContactByKey = (key, contacts = getDownloadContacts()) =>
  contacts.find((entry) => entry.key === key) ?? null;

/**
 * Overwrites slackChannels for the given key and writes downloadContacts.json.
 * Skips writing if the channels are already the same.
 * @param {string} key
 * @param {Array<string>} slackChannels
 * @returns {Object|null} Entry with optional `noChange: true`, or null if key unknown
 */
const updateSlackChannels = (key, slackChannels) => {
  const entries = readDownloadContacts();
  const index = entries.findIndex((entry) => entry.key === key);
  if (index === -1) {
    return null;
  }

  const current = entries[index].slackChannels;
  const isSame =
    current.length === slackChannels.length && current.every((ch, i) => ch === slackChannels[i]);

  if (isSame) {
    return { ...entries[index], noChange: true };
  }

  entries[index] = { ...entries[index], slackChannels };
  writeFileSync(jsonPath, `${JSON.stringify(entries, null, 2)}\n`);
  return entries[index];
};

export { findContactByKey, findContactForUrl, getDownloadContacts, updateSlackChannels };
