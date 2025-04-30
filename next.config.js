// next.config.js
const webpack = require('webpack')
/** @type {import('next').NextConfig} */
module.exports = {
  webpack(config, { isServer }) {
    if (isServer) {
      // 1) Preserve Next.js defaults, then append
      config.externals.push(
        'chrome-aws-lambda',
        'lighthouse',
        'puppeteer-core',
      )
      // 2) If you still need to ignore dynamic chrome-aws-lambda files:
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /chrome-aws-lambda[\/\\]build/,
        })
      )
    }
    return config
  },
}
