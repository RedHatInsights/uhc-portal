interface AuthConfig {
  username: string;
  password: string;
}

export function getAuthConfig(username?: string, password?: string): AuthConfig {
  // If username and password are provided directly, use them
  if (username && password) {
    return { username, password };
  }

  // Default behavior - read from environment variables
  const envUsername = process.env.TEST_WITHQUOTA_USER || '';
  const envPassword = process.env.TEST_WITHQUOTA_PASSWORD || '';

  if (!envUsername || !envPassword) {
    throw new Error(
      'Test credentials not found. Please set TEST_WITHQUOTA_USER and TEST_WITHQUOTA_PASSWORD environment variables.',
    );
  }

  return {
    username: envUsername,
    password: envPassword,
  };
}
