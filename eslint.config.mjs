import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noSnapshotTesting from 'eslint-plugin-no-snapshot-testing';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import storybook from 'eslint-plugin-storybook';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';

// eslint-disable-next-line import/extensions
import customRules from './eslint-plugin-custom-rules/index.js';

const testFiles = [
  '**/*setupTests.ts',
  '**/*.test.{js,jsx,ts,tsx}',
  '**/*test.{js,jsx,ts,tsx}',
  '**/*.spec.{js,jsx,ts,tsx}',
  '**/*.stories.{js,jsx,ts,tsx}',
  'src/testUtils.tsx',
  'cypress.config.js',
  'fec.config.js',
  '*.mjs',
  'run/**/*.{js,mjs}',
];

export default [
  // Global ignores
  {
    ignores: ['node_modules/**', 'dist/**', '.yalc/**', '*.json'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // React recommended
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // Main project configuration
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx}'],
    plugins: {
      import: fixupPluginRules(importPlugin),
      'simple-import-sort': simpleImportSort,
      'no-snapshot-testing': noSnapshotTesting,
      'custom-rules': customRules,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        insights: 'readonly',
        APP_DEVMODE: 'readonly',
        APP_DEV_SERVER: 'readonly',
        APP_SENTRY_RELEASE_VERSION: 'readonly',
        OCM_SHOW_OLD_METRICS: 'readonly',
      },
      parserOptions: {
        project: './tsconfig.lint.json',
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2017,
        sourceType: 'module',
        extraFileExtensions: ['.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: '.',
        },
      },
    },
    rules: {
      // no-restricted-imports - PatternFly, apiRequest, do_not_use
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./apiRequest', '../**/apiRequest', '../**/services/apiRequest'],
              message: 'Use ~/services/apiRequest that provides mocks in unit tests',
            },
            {
              group: ['@patternfly/react-icons/dist/js**'],
              message:
                'Import using the full esm path `@patternfly/react-icons/dist/esm/icons/<icon>` instead',
            },
            {
              group: ['@patternfly/react-tokens/dist/js**'],
              message:
                'Import using the full esm path `@patternfly/react-tokens/dist/esm/icons/<icon>` instead',
            },
            {
              group: ['*/*do_not_use*/*', '~/*/*/*do_not_use*/*'],
              message: "Files in a 'do not use' directory are archived and should not be used",
            },
          ],
          paths: [
            {
              name: '@patternfly/react-icons',
              message:
                'Import using full path `@patternfly/react-icons/dist/esm/icons/<icon>` instead',
            },
            {
              name: '@patternfly/react-tokens',
              message: 'Import using full path `@patternfly/react-tokens/dist/esm/<token>` instead',
            },
          ],
        },
      ],

      // Import rules
      'import/no-extraneous-dependencies': 'error',
      'import/no-named-as-default-member': 'error',
      'import/prefer-default-export': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          mjs: 'always',
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],

      // React rules
      'react/state-in-constructor': ['error', 'never'],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: ['function-declaration', 'arrow-function'],
          unnamedComponents: ['function-expression', 'arrow-function'],
        },
      ],
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx', '.jsx'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // Core JS rules
      camelcase: ['error', { properties: 'never', ignoreDestructuring: false }],
      'consistent-return': 'error',
      'default-case': 'error',
      'default-param-last': 'error',
      'no-await-in-loop': 'error',
      'no-console': 'error',
      'no-nested-ternary': 'error',
      'no-new': 'error',
      'no-param-reassign': [
        'error',
        { props: true, ignorePropertyModificationsFor: ['draft', 'response', 'acc'] },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message:
            'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
        {
          selector: 'LabeledStatement',
          message:
            'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
        },
        {
          selector: 'WithStatement',
          message:
            '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
        },
      ],
      'no-use-before-define': 'off',
      'no-underscore-dangle': ['error', { allow: ['__dirname', '__filename'] }],
      'no-shadow': 'off',
      'prefer-destructuring': [
        'warn',
        { VariableDeclarator: { array: false, object: true }, AssignmentExpression: { array: false, object: false } },
      ],
      'prefer-promise-reject-errors': 'error',
      'arrow-body-style': 'error',

      // TypeScript rules
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          varsIgnorePattern: '^_|^React$',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-extra-non-null-assertion': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-this-alias': 'off',

      // React rules
      'react/display-name': 'off',
      'react/jsx-key': 'off',
      'react/no-array-index-key': 'warn',
      'react/no-did-update-set-state': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/no-unstable-nested-components': 'error',
      'react/destructuring-assignment': 'error',
      'react/no-unused-prop-types': 'error',
      'no-constant-binary-expression': 'off',

      // Import sorting
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react$', '^next', '^[a-z]'],
            ['^@'],
            ['^~'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
            ['^\\u0000'],
          ],
        },
      ],

      // Custom rules
      'custom-rules/restrict-react-router-imports': 'error',

      // Snapshot testing
      'no-snapshot-testing/no-snapshot-testing': 'error',

      // JSX A11y
      ...jsxA11y.configs.recommended.rules,
    },
  },

  // Testing Library config for test files
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.js',
      '**/*.test.jsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
    ...testingLibrary.configs['flat/react'],
    rules: {
      ...testingLibrary.configs['flat/react'].rules,
      'testing-library/await-async-queries': 'error',
      'testing-library/prefer-screen-queries': 'off',
      'testing-library/prefer-presence-queries': 'off',
      'testing-library/no-container': 'off',
      'testing-library/no-dom-import': 'error',
      'testing-library/no-unnecessary-act': 'error',
      'testing-library/prefer-find-by': 'error',
      'testing-library/prefer-user-event': 'error',
      'testing-library/no-wait-for-multiple-assertions': 'error',
      'testing-library/render-result-naming-convention': 'error',
      'testing-library/no-debugging-utils': 'error',
    },
  },

  // Storybook config
  ...storybook.configs['flat/recommended'],
  {
    files: ['**/*.stories.ts', '**/*.stories.tsx', '**/*.stories.js', '**/*.stories.jsx'],
    rules: {
      'storybook/context-in-play-function': 'off',
    },
  },

  // Test files override - allow devDependencies and node globals
  {
    files: testFiles,
    languageOptions: {
      globals: {
        ...globals.node,
        global: 'readonly',
      },
    },
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'no-console': 'off',
    },
  },

  // TypeScript files - relax strict rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      'react/prop-types': 'off',
    },
  },

  // Node.js files in run/ directory - need node globals
  {
    files: ['run/**/*.js', 'run/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Prettier - must be last to override formatting rules
  eslintConfigPrettier,
];
