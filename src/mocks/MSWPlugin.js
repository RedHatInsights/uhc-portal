const path = require('path');
const fs = require('fs');

/**
 * Webpack plugin that emits mockServiceWorker.js into the build output.
 * The dev server serves the output directory at /, so the file becomes
 * available at /mockServiceWorker.js without touching the mockdata server.
 * Only used in development — excluded from production builds via fec.config.js.
 */
class MSWPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MSWPlugin', (compilation, callback) => {
      const content = fs.readFileSync(path.resolve(__dirname, '../../public/mockServiceWorker.js'));
      compilation.emitAsset(
        'mockServiceWorker.js',
        new compiler.webpack.sources.RawSource(content),
      );
      callback();
    });
  }
}

module.exports = MSWPlugin;
