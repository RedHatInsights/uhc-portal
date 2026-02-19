// This module has .mjs extension to simplify importing from NodeJS scripts.
// Utility functions for URL handling across link files

import { combineAndSortLinks } from './linkUtils.mjs';

/**
 * Gets all external link URLs from installLinks, supportLinks and docLinks
 * This is the centralized function that scripts should use
 * @returns {Promise<Array<string>>} - Sorted array of all unique external link URLs
 */
export const getAllExternalLinks = async () => {
  const { getLinks: getInstallLinks } = await import('./installLinks.mjs');
  const { getLinks: getSupportLinks } = await import('./supportLinks.mjs');
  const { getLinks: getDocLinks } = await import('./docLinks.mjs');

  const installLinks = await getInstallLinks();
  const supportLinks = await getSupportLinks();
  const docLinks = await getDocLinks();

  return combineAndSortLinks(installLinks, supportLinks, docLinks);
};
