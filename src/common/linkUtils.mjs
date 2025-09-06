// This module has .mjs extension to simplify importing from NodeJS scripts.
// Shared utility functions for URL/link handling

/**
 * Combines multiple link arrays, removes duplicates, and sorts them
 * @param {...Array<string>} linkSources - Arrays of links to combine
 * @returns {Array<string>} - Sorted array of unique links
 */
export const combineAndSortLinks = (...linkSources) => {
  const allLinks = linkSources.flat();
  return [...new Set(allLinks)].sort();
};
