import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * app.json, plus what can't live there: where the Firebase config for Android push is
 * (D127), and the Google sign-in plugin, which needs the iPhone client ID (D129). EAS builds get it from the GOOGLE_SERVICES_JSON secret file;
 * on this Mac it's mobile/google-services.json, which git ignores.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  // Native Google sign-in (D129) needs the iPhone client ID, reversed, as a URL scheme; the
  // plugin refuses to run without it, so it's added only once the ID is set.
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const googleSignIn: [string, { iosUrlScheme: string }][] = iosClientId
    ? [['@react-native-google-signin/google-signin', { iosUrlScheme: `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}` }]]
    : [];
  return {
    ...(config as ExpoConfig),
    android: {
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    },
    plugins: [...(config.plugins ?? []), ...googleSignIn],
  };
};
