const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// packages/shared lives outside the app; Metro resolves @skillsy/shared/* via
// the tsconfig paths and needs to watch the folder too.
config.watchFolders = [...(config.watchFolders ?? []), path.resolve(__dirname, '../../packages/shared')];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
