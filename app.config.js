const appJson = require('./app.json');

module.exports = ({ config }) => {
  const expoConfig = appJson.expo || {};
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  return {
    ...config,
    ...expoConfig,
    android: {
      ...(expoConfig.android || {}),
      config: googleMapsApiKey
        ? {
            ...((expoConfig.android && expoConfig.android.config) || {}),
            googleMaps: {
              apiKey: googleMapsApiKey,
            },
          }
        : (expoConfig.android && expoConfig.android.config) || undefined,
    },
  };
};
