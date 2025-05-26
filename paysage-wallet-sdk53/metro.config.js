// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure the resolver for Metro
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'];
config.resolver.assetExts = [
  'bmp', 'gif', 'jpg', 'jpeg', 'png', 'psd', 'svg', 'webp',
  'ttf', 'otf', 'woff', 'woff2',
  'mp4', 'mov', 'mp3', 'wav'
];

module.exports = config;
