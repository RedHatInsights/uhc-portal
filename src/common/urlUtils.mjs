// This module has .mjs extension to simplify importing from NodeJS scripts.
// Utility functions for URL handling across link files

import { combineAndSortLinks } from './linkUtils.mjs';

/**
 * Gets all external link URLs from both installLinks and supportLinks
 * This is the centralized function that scripts should use
 * @returns {Promise<Array<string>>} - Sorted array of all unique external link URLs
 */
export const getAllExternalLinks = async () => {
  const { getLinks: getInstallLinks } = await import('./installLinks.mjs');
  const { getLinks: getSupportLinks } = await import('./supportLinks.mjs');

  const installLinks = await getInstallLinks();
  const supportLinks = await getSupportLinks();

  return combineAndSortLinks(installLinks, supportLinks);
};
