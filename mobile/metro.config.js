// Bypass the problematic @expo/metro-config entirely
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig();
  
  // Basic configuration without problematic plugins
  return {
    ...config,
    resolver: {
      ...config.resolver,
      sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
      assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'otf', 'woff', 'woff2']
    },
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve('metro-react-native-babel-transformer')
    }
  };
})();