console.log('🔍 MOCK LOADED: accountManager.ts');

export const createAuthorizationToken = () => Promise.resolve({
  data: { token: 'mock-token' },
});

const accountManager = {
  createAuthorizationToken,
};

export default accountManager; 