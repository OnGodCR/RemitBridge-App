import { AccessibilityInfo } from 'react-native';

/**
 * Says the outcome of an action out loud to VoiceOver and TalkBack users ("Saved", "Your
 * request is counted"). A sighted person sees the text change; without this, a screen
 * reader user hears nothing until they go looking for it.
 */
export function announce(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}
