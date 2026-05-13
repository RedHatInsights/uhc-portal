import type { StorybookConfig } from '@storybook/react-webpack5';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-onboarding',
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
    }
    // Match fec.config.js DefinePlugin so `src/config.ts` and anything importing API services load.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Storybook bundles webpack; plugin types differ from root `webpack`.
    const defineEnvPlugin: any = new webpack.DefinePlugin({
      APP_DEV_SERVER: JSON.stringify(false),
      APP_DEVMODE: JSON.stringify(false),
      APP_SENTRY_RELEASE_VERSION: JSON.stringify(''),
    });
    config.plugins = [...(config.plugins ?? []), defineEnvPlugin];
    return config;
  },
  core: {
    disableTelemetry: true,
  },
};
export default config;
