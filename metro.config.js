const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for "Cannot assign to property 'protocol' which has only a getter" error
// This is a Hermes engine compatibility issue with Expo SDK 54
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
