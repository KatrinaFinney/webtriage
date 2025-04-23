// next.config.js
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
module.exports = {
  webpack(config, { isServer }) {
    if (isServer) {
      // 1) Treat these as externals so runtime require() works
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
        'chrome-aws-lambda',
        'lighthouse',
        'puppeteer-core',
      ];

      // 2) Ignore any dynamic requires under chrome-aws-lambda/build
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /chrome-aws-lambda[\/\\]build/,
        })
      );
    }
    return config;
  },
};
