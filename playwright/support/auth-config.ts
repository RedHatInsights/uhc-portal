interface AuthConfig {
  username: string;
  password: string;
}

export function getAuthConfig(username?: string, password?: string): AuthConfig {
  // If username and password are provided directly, use them
  if (username && password) {
    return { username, password };
  }

  // Read from environment variables — support both local dev names and Konflux CI names
  const envUsername = process.env.TEST_WITHQUOTA_USER || process.env.E2E_USER || '';
  const envPassword = process.env.TEST_WITHQUOTA_PASSWORD || process.env.E2E_PASSWORD || '';

  if (!envUsername || !envPassword) {
    throw new Error(
      'Test credentials not found. Please set TEST_WITHQUOTA_USER/TEST_WITHQUOTA_PASSWORD or E2E_USER/E2E_PASSWORD environment variables.',
    );
  }

  return {
    username: envUsername,
    password: envPassword,
  };
}

/**
 * Builds a short, cluster-name-safe suffix from a username.
 * Takes characters until the first special character (e.g. `@` in an email),
 * then returns the first `length` alphanumeric characters (default 4), lowercased.
 *
 * @example
 * getUsernameSuffix('abcd@redhat.com') // 'abcd'
 * getUsernameSuffix('abcd') // 'jdoe'
 */
export function getUsernameSuffix(username?: string, length = 4): string {
  const name = username ?? getAuthConfig().username;
  const untilSpecial = name.match(/^[a-zA-Z0-9]+/)?.[0] ?? '';
  return untilSpecial.toLowerCase().substring(0, length);
}
