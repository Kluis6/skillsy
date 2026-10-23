const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
const sharedDir = path.resolve(__dirname, '../../packages/shared');

// packages/shared lives outside the app; Metro resolves @skillsy/shared/* via
// the tsconfig paths and needs to watch the folder too.
config.watchFolders = [...(config.watchFolders ?? []), sharedDir];

// Packages imported by shared code (zod, for example) must come from the app's
// own node_modules, not the site's at the repo root, which Metro doesn't watch.
const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromShared = context.originModulePath.startsWith(sharedDir + path.sep);
  const isPackage = !moduleName.startsWith('.') && !moduleName.startsWith('@skillsy/');
  const nextContext =
    fromShared && isPackage
      ? { ...context, originModulePath: path.join(__dirname, 'package.json') }
      : context;
  return (resolveRequest ?? context.resolveRequest)(nextContext, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
