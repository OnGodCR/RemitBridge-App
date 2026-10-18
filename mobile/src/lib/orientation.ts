import { Dimensions, Platform } from 'react-native';

/** Narrower than this on its short side is a phone; Android's own tablet line is 600dp. */
const TABLET_SHORT_SIDE = 600;

/**
 * Tablets turn freely and phones stay upright (Angad, 2026-10-17, D187). The app declares
 * every orientation (app.json) because Android 16 ignores a portrait lock on tablets
 * anyway, and an iPad is expected to turn; on a phone this locks it back to portrait,
 * since the screens are drawn for a tall, narrow column. Best effort: if the lock fails,
 * the phone simply follows its own rotation setting.
 *
 * Required here rather than imported: a development build made before the module was added
 * has no native side, and a top-level import would crash it at launch.
 */
export function keepPhonesUpright(): void {
  if (Platform.OS === 'web') return;
  const { width, height } = Dimensions.get('screen');
  if (Math.min(width, height) >= TABLET_SHORT_SIDE) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ScreenOrientation = require('expo-screen-orientation') as typeof import('expo-screen-orientation');
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  } catch {
    // No native module in this build: the phone follows its own rotation setting.
  }
}
