import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/**
 * Country flags as small bundled images, not emoji: emoji flags don't render on Android or
 * Windows and look different on every system (DECISIONS.md D55). The PNGs are flat flags
 * from flagcdn.com (public domain), at 1x, 2x and 3x, so they stay sharp at every screen
 * density and need no network.
 *
 * Each flag keeps its real proportions (the US flag is wider than India's), drawn at a
 * fixed height with a hairline edge so white stripes don't melt into white cards.
 */
const FLAGS: Record<string, ImageSourcePropType> = {
  US: require('../../assets/flags/us.png'),
  CA: require('../../assets/flags/ca.png'),
  GB: require('../../assets/flags/gb.png'),
  AE: require('../../assets/flags/ae.png'),
  SA: require('../../assets/flags/sa.png'),
  AU: require('../../assets/flags/au.png'),
  IN: require('../../assets/flags/in.png'),
  MX: require('../../assets/flags/mx.png'),
  PH: require('../../assets/flags/ph.png'),
  VN: require('../../assets/flags/vn.png'),
  CN: require('../../assets/flags/cn.png'),
  GT: require('../../assets/flags/gt.png'),
  SV: require('../../assets/flags/sv.png'),
  HN: require('../../assets/flags/hn.png'),
  DO: require('../../assets/flags/do.png'),
  ET: require('../../assets/flags/et.png'),
  KE: require('../../assets/flags/ke.png'),
  NG: require('../../assets/flags/ng.png'),
  PK: require('../../assets/flags/pk.png'),
  BD: require('../../assets/flags/bd.png'),
};

export function Flag({ code, height = 18, dim }: { code: string; height?: number; dim?: boolean }) {
  const t = useTheme();
  const source = FLAGS[code.toUpperCase()];
  if (!source) return <View style={{ width: height * 1.5, height }} />;
  const { width: w, height: h } = Image.resolveAssetSource(source);
  return (
    <Image
      source={source}
      accessibilityIgnoresInvertColors
      accessible={false}
      style={[
        styles.flag,
        { height, width: Math.round((height * w) / h), borderColor: t.border, opacity: dim ? 0.55 : 1 },
      ]}
    />
  );
}

/** Width of the column flags sit in, so names line up whatever each flag's proportions. */
export const FLAG_SLOT = 36;

/** A flag in a fixed-width column, for lists. */
export function FlagSlot({ code, dim }: { code: string; dim?: boolean }) {
  return (
    <View style={styles.slot}>
      <Flag code={code} dim={dim} />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { width: FLAG_SLOT, alignItems: 'flex-start' },
  flag: { borderRadius: 3, borderWidth: StyleSheet.hairlineWidth },
});
