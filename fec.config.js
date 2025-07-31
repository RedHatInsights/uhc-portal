const path = require('path');
const webpack = require('webpack');

module.exports = {
  appUrl: '/openshift',
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
      APP_DEV_SERVER: process.env.NODE_ENV !== 'production',
      APP_API_ENV: JSON.stringify(process.env.CLOUDOT_ENV === 'stage' ? 'staging' : 'production'),
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
