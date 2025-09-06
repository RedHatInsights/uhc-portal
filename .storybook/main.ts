import { StorybookConfig } from '@storybook/react-webpack5';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { DefinePlugin, NormalModuleReplacementPlugin } from 'webpack';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/components/clusters/wizards/rosa/ControlPlaneScreen/ControlPlaneScreen.stories.tsx',
    '../src/components/clusters/wizards/rosa/AccountsRolesScreen/AccountsRolesScreen.stories.tsx',
    '../src/**/*.mdx',
    // Step 3: Cluster settings (all sub-stories)
    '../src/components/clusters/wizards/rosa/ClusterSettings/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // Step 4: Networking in correct order (Configuration before CIDR ranges)
    '../src/components/clusters/wizards/rosa/NetworkScreen/NetworkScreen.stories.tsx',
    '../src/components/clusters/wizards/rosa/CIDRScreen/CIDRScreen.stories.tsx',
    // Step 5
    '../src/components/clusters/wizards/rosa/ClusterRolesScreen/ClusterRolesScreen.stories.tsx',
    // Exclude specific files from glob pattern and add them in order
    '../src/**/!(UpdatesScreen|ReviewClusterScreen|ReviewRoleItem|UpgradeSettingsFields|NetworkScreen|CIDRScreen|ClusterRolesScreen|SharedVPCSection|SharedVPCDomainSelect).stories.@(js|jsx|mjs|ts|tsx)',
    // Steps 6 and 7 in correct order
    '../src/components/clusters/wizards/rosa/UpdatesScreen/UpdatesScreen.stories.tsx',
    '../src/components/clusters/wizards/rosa/ReviewClusterScreen/ReviewClusterScreen.stories.tsx',
    // Common components last
    '../src/components/clusters/wizards/rosa/ReviewClusterScreen/ReviewRoleItem.stories.tsx',
    '../src/components/clusters/wizards/rosa/common/Upgrades/UpgradeSettingsFields.stories.tsx',
    '../src/components/clusters/wizards/rosa/NetworkingSection/SharedVPCSection.stories.tsx',
    '../src/components/clusters/wizards/rosa/NetworkingSection/SharedVPCDomainSelect.stories.tsx',
  ],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          // Replaces any existing Sass rules with given rules
          {
            test: /\.scss$/,
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: {
                  sassOptions: {
                    includePaths: ['./src'],
                  },
                },
              },
            ],
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                },
              },
            ],
          },
        ],
      },
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  typescript: {
    check: false,
    checkOptions: {},
    skipCompiler: false,
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.plugins = [
        ...((config.resolve.plugins as any) ?? []),
        new TsconfigPathsPlugin({
          extensions: config.resolve.extensions,
        }),
      ];
      config.resolve.alias = {
        ...config.resolve.alias,
        '@redhat-cloud-services/frontend-components/useChrome': path.resolve(
          __dirname,
          'mocks/useChrome.ts',
        ),
        // Mock the release hooks for VersionSelection
        '~/components/releases/hooks': path.resolve(__dirname, 'mocks/releaseHooks.ts'),
        'src/components/releases/hooks': path.resolve(__dirname, 'mocks/releaseHooks.ts'),
      };
    }
    config.plugins = [
      ...(config.plugins || []),
      new DefinePlugin({
        APP_DEV_SERVER: true,
      }) as any,
      // Mock the release hooks for VersionSelection
      new NormalModuleReplacementPlugin(
        /^~\/components\/releases\/hooks$/,
        path.resolve(__dirname, 'mocks/releaseHooks.ts')
      ),
      new NormalModuleReplacementPlugin(
        /^src\/components\/releases\/hooks$/,
        path.resolve(__dirname, 'mocks/releaseHooks.ts')
      ),
    ];
    return config;
  },
  core: {
    disableTelemetry: true,
  },
};
export default config;
