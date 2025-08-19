interface AuthConfig {
  username: string;
  password: string;
}

const config = {
  prodAuth: {
    username: process.env.TEST_WITHQUOTA_USER || '',
    password: process.env.TEST_WITHQUOTA_PASSWORD || '',
  },
};

export const getAuthConfig = (): AuthConfig => {
  if (!process.env.TEST_WITHQUOTA_USER) {
    throw new Error('TEST_WITHQUOTA_USER environment variable is required');
  }
  if (!process.env.TEST_WITHQUOTA_PASSWORD) {
    throw new Error('TEST_WITHQUOTA_PASSWORD environment variable is required');
  }

  return config.prodAuth;
};
