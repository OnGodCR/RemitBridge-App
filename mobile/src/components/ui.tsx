import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'small' | 'figure';

const variants: Record<Variant, TextStyle> = {
  // Headings: bold and tightly tracked, like the website's h1-h4.
  title: { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7 },
  heading: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 22, letterSpacing: -0.4 },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  // Amounts: tabular figures so columns line up and values don't jitter (PRD 14.5).
  figure: {
    fontFamily: Fonts.extrabold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
};

export function AppText({
  variant = 'body',
  muted,
  style,
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean }) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[variants[variant], { color: muted ? t.textSecondary : t.text }, style]}
    />
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, style]}>
      {children}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? t.primary : t.card,
          borderColor: selected ? t.primary : t.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <AppText variant="label" style={{ color: selected ? t.primaryForeground : t.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

/** Full-width button. `primary` is brand green; `secondary` is an outline. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'plain';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.primary : variant === 'secondary' ? t.card : 'transparent';
  const fg = variant === 'primary' ? t.primaryForeground : variant === 'plain' ? t.textSecondary : t.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor: variant === 'secondary' ? t.border : 'transparent',
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon}
          <AppText variant="label" style={[styles.buttonLabel, { color: fg }]}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  chip: {
    minHeight: MinTapTarget,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  button: {
    minHeight: 52,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  buttonLabel: { fontSize: 16 },
});
