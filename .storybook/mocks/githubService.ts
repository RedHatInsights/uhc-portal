console.log('🔍 MOCK LOADED: githubService.ts');

const githubService = {
  getLatestRelease: () => Promise.resolve({
    data: {
      tag_name: 'v1.0.0',
      name: 'Mock Release',
    },
  }),
};

export default githubService; 