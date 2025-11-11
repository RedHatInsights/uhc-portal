// This module has .mjs extension to simplify importing from NodeJS scripts.
// Shared utility functions for URL/link handling

/**
 * Combines multiple link arrays, removes duplicates, and sorts them
 * @param {...Array<string>} linkSources - Arrays of links to combine
 * @returns {Array<string>} - Sorted array of unique links
 */
export const combineAndSortLinks = (...linkSources) => {
  const allLinks = linkSources.flat();
  // Use Set to remove duplicates, then convert back to array for sorting
  // This ensures no duplicate URLs exist when combining multiple link sources
  const ensureNoDuplicates = (links) => [...new Set(links)];

  return ensureNoDuplicates(allLinks).sort();
};
