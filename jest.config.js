const config = {
  roots: ['<rootDir>/src'],
  verbose: true,

  setupFiles: ['<rootDir>/src/setupTests.ts'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  clearMocks: true,
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@patternfly|react-monaco-editor|monaco-.*|lodash-es|screenfull|uuid|@openshift/dynamic-plugin-sdk|cidr-tools|ip-bigint)/)',
  ],
  testPathIgnorePatterns: ['<rootDir>/cache/Cypress/', '^.+\\.(fixtures?)\\.[jt]sx?$'],
  moduleNameMapper: {
    /* Map Assisted UI lib to a mock that defines the same API but won't import the actual code */
    '@openshift-assisted/ui-lib/ocm': '<rootDir>/__mocks__/assistedUiMock.ts',
    /* Map Assisted UI lib translations to a mock file too */
    '@openshift-assisted/locales/([a-z]{2,3}/translation.json)':
      '<rootDir>/__mocks__/assistedUiTranslationMock.json',
    '^react-markdown$': '<rootDir>/__mocks__/markdownMock.tsx',
    '^rehype-raw$': '<rootDir>/__mocks__/rehype-raw.ts',
    '^remark-gfm$': '<rootDir>/__mocks__/remark-gfm.ts',
    '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^src/components/common/TechnologyPreview$': '<rootDir>/__mocks__/technologyPreviewFake.tsx',
    '@scalprum/react-core': '<rootDir>/__mocks__/scalprumComponentMock.tsx',
    'keycloak-js': '<rootDir>/__mocks__/keycloakMock.ts',
  },
  globals: {
    APP_DEVMODE: false,
    APP_DEV_SERVER: false,
    // Warning! Moving this config to the "ts-jes" transform makes the test slower and close to double the used heap size
    'ts-jest': {
      isolatedModules: true,
      tsconfig: { module: 'esnext', moduleResolution: 'node' },
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node', 'mjs'],
  testTimeout: 10000,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/.*fixtures.*',
    '<rootDir>/src/.*mock.*',
    '<rootDir>/src/.*index.*',
    '<rootDir>/src/.*stories.*',
    '<rootDir>/src/.*styles.*',
    '<rootDir>/src/.*types.*',
    '<rootDir>/src/.*constants.*',
    '<rootDir>/src/services/apiRequest.*',
  ],
  coverageDirectory: 'unitTestCoverage',
  coverageReporters: ['html', 'json-summary', 'text-summary'],
};

module.exports = config;
