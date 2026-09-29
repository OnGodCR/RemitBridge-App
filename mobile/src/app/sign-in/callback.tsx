import { Redirect } from 'expo-router';

/**
 * Landing route for the Google OAuth redirect (remitbridge://sign-in/callback). The code
 * exchange happens in lib/sign-in.ts, inside the auth session; if the OS opens this route
 * directly instead, just go home.
 */
export default function Callback() {
  return <Redirect href="/" />;
}
