import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Settings from the phone's accessibility menu that the app follows, read once at the top
 * so every piece of text doesn't subscribe on its own.
 *
 * Bold Text (iOS): the system thickens its own fonts when it's on, but a bundled font like
 * Plus Jakarta Sans doesn't change by itself, so AppText steps each weight up one.
 * Text size and Reduce Motion need no provider: font scaling is built into Text, and the
 * animations read Reduce Motion themselves (components/motion.ts).
 */
const BoldText = createContext(false);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [bold, setBold] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isBoldTextEnabled().then(setBold, () => undefined);
    const sub = AccessibilityInfo.addEventListener('boldTextChanged', setBold);
    return () => sub.remove();
  }, []);
  return <BoldText.Provider value={bold}>{children}</BoldText.Provider>;
}

export function useBoldText(): boolean {
  return useContext(BoldText);
}
