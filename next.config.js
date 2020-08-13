require('dotenv').config();

const path = require('path');
const config = require('./config.json');
const tsConfig = require('./tsconfig.json');
const compose = require('next-compose-plugins');
const withOffline = require('next-offline');
const withManifest = require('next-manifest');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYSE === 'true',
});

const manifest = {
  output: './public/',
  short_name: config.site.shortName,
  name: config.site.title,
  description: config.site.description,
  dir: 'ltr',
  lang: 'en',
  start_url: '/',
  display: 'standalone',
  background_color: config.theme.colour,
  theme_color: config.theme.colour,
};

module.exports = compose(
  [[withOffline], [withManifest, { manifest }], [withBundleAnalyzer]],
  {
    env: {
      GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    },
    webpack: (config, options) => {
      const alias = {};

      Object.entries(tsConfig.compilerOptions.paths).forEach(([from, to]) => {
        to.forEach((to) => {
          alias[from.replace('*', '').replace(/\/$/, '')] = path.resolve(
            __dirname,
            to.replace('*', '')
          );
        });
      });

      config.resolve.alias = { ...alias, ...config.resolve.alias };

      // if (config.optimization.splitChunks.cacheGroups) {
      //   for (let k in config.optimization.splitChunks.cacheGroups) {
      //     const current = config.optimization.splitChunks.cacheGroups[k];
      //     if (typeof current === 'object') {
      //       config.optimization.splitChunks.cacheGroups[k] = {
      //         ...current,
      //         maxSize: 15000
      //       };
      //     }
      //   }
      // }

      // // Preact
      // if (!options.defaultLoaders) {
      //   throw new Error(
      //     'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
      //   );
      // }

      // if (options.isServer) {
      //   config.externals = ['react', 'react-dom', ...config.externals];
      // }

      // config.resolve.alias = Object.assign({}, config.resolve.alias, {
      //   react: 'preact/compat',
      //   react$: 'preact/compat',
      //   'react-dom': 'preact/compat',
      //   'react-dom$': 'preact/compat'
      // });

      return config;
    },
  }
);
