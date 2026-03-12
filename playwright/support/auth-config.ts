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
