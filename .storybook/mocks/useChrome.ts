console.log('🔍 MOCK LOADED: useChrome.ts');

export const stubbedChrome = {
  on: () => () => {},
  appNavClick: () => {},
  auth: {
    getUser: () => Promise.resolve({ data: {} }),
    getToken: () => Promise.resolve(),
    getOfflineToken: () => Promise.resolve({ data: { refresh_token: 'hello' } }),
  },
  getEnvironment: () => 'prod',
  segment: {
    setPageMetadata: () => {},
  },
  analytics: {
    track: () => {},
  },
};

const useChrome = () => stubbedChrome;

export default useChrome; 