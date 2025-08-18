const path = require('path');
const webpack = require('webpack');
const { insights } = require('./package.json');

const name = insights.appname;

module.exports = {
  appUrl: `/${name}`,
  appEntry: path.resolve(__dirname, 'src/bootstrap.ts'),
  hotReload: process.env.HOT === 'true',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  interceptChromeConfig: false,
  customProxy: [
    {
      context: ['/mockdata'],
      pathRewrite: { '^/mockdata': '' },
      target: 'http://[::1]:8010',
    },
  ],
  plugins: [
    new webpack.DefinePlugin({
      APP_DEVMODE: process.env.NODE_ENV !== 'production',
      APP_SENTRY_RELEASE_VERSION: JSON.stringify(process.env.SENTRY_VERSION),
      APP_DEV_SERVER: process.env.NODE_ENV !== 'production',
    }),
  ],
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      '~': path.resolve(__dirname, 'src/'),
    },
  },
  moduleFederation: {
    exclude: ['react-redux', 'react-router-dom'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.2.0',
        },
      },
    ],
    exposes: {
      './RootApp': path.resolve(__dirname, 'src/chrome-main.tsx'),
    },
  },
};
