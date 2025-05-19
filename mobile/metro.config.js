// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Modify the resolver configuration
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'];
config.resolver.assetExts = [
  'bmp', 'gif', 'jpg', 'jpeg', 'png', 'psd', 'svg', 'webp',
  'ttf', 'otf', 'woff', 'woff2',
  'mp4', 'mov', 'mp3', 'wav'
];

// 2. Remove specific problematic plugins
if (config.transformer && config.transformer.serializer) {
  // Remove importLocationsPlugin dependency if it exists
  if (config.transformer.serializer.experimentalSerializerHook) {
    config.transformer.serializer.experimentalSerializerHook = null;
  }
}

module.exports = config;