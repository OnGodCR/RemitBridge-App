import { useWindowDimensions } from 'react-native';

/**
 * An icon size that grows with the phone's text size, up to 1.6x, so an arrow or a mark
 * doesn't shrink to a speck next to large text. Text itself may grow to 2x (scaleCap in
 * components/ui.tsx); icons stop earlier because they carry no words.
 */
export function useIconSize(base: number): number {
  const { fontScale } = useWindowDimensions();
  return Math.round(base * Math.min(Math.max(fontScale, 1), 1.6));
}
