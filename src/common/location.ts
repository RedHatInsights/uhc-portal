/**
 * Gets the user's location (url) object
 * Why this is needed:
 * Package upgrade jest-environment-jsdom to 30.0.5 caused breaking changes in unit tests around window.location
 * Importing this function into the source code files around those tests allows us to spy on window.location
 */
export const getLocation = (): Location => window.location;
