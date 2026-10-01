import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * app.json, plus the one value that can't live there: where the Firebase config for
 * Android push is (D127). EAS builds get it from the GOOGLE_SERVICES_JSON secret file;
 * on this Mac it's mobile/google-services.json, which git ignores.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
