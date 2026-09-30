import { SymbolView, type SFSymbol } from 'expo-symbols';
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
  title: { fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.5 },
  heading: { fontFamily: Fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  // Amounts: tabular figures so columns line up and values don't jitter (PRD 14.5).
  figure: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
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

/**
 * A segmented control: one choice from a few options, laid out as equal parts of one
 * bordered bar. Used for delivery method.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.segmented, { backgroundColor: t.muted, borderColor: t.border }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              selected && [styles.segmentSelected, { backgroundColor: t.primary, borderColor: t.primary }],
            ]}>
            <AppText
              variant="label"
              numberOfLines={1}
              style={{ color: selected ? t.primaryForeground : t.textSecondary }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Full-width button, shaped like the website's: fully rounded and bold, because a button
 * should look pressable (the site's own rule). `primary` is brand green; `secondary` is an
 * outline. `trailingIcon` puts a symbol after the label, like the site's "Try the
 * calculator" arrow.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  trailingIcon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'plain' | 'inverse' | 'inverse-plain';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  trailingIcon?: SFSymbol;
}) {
  const t = useTheme();
  const bg =
    variant === 'primary'
      ? t.primary
      : variant === 'secondary'
        ? t.card
        : variant === 'inverse'
          ? t.heroField
          : 'transparent';
  const fg =
    variant === 'primary'
      ? t.primaryForeground
      : variant === 'plain'
        ? t.textSecondary
        : variant === 'inverse'
          ? t.primary
          : variant === 'inverse-plain'
            ? t.heroText
            : t.text;
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
          {trailingIcon ? (
            <SymbolView pointerEvents="none" name={trailingIcon} size={15} weight="bold" tintColor={fg} fallback={null} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

/**
 * The website's text link: green, semibold, with its arrow ("See the research →"). For a
 * next step inside a notice or under a form, where a full button would shout.
 */
export function TextLink({
  label,
  onPress,
  external,
  icon,
  arrow = true,
  busy,
}: {
  label: string;
  onPress: () => void;
  external?: boolean;
  /** A symbol before the label, for actions (save) rather than places. */
  icon?: SFSymbol;
  arrow?: boolean;
  busy?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole={external ? 'link' : 'button'}
      accessibilityState={{ busy }}
      hitSlop={6}
      style={({ pressed }) => [styles.link, { opacity: pressed || busy ? 0.6 : 1 }]}>
      {icon ? <SymbolView pointerEvents="none" name={icon} size={15} weight="semibold" tintColor={t.primary} fallback={null} /> : null}
      <AppText style={[styles.linkLabel, { color: t.primary }]}>{label}</AppText>
      {arrow ? (
        <SymbolView
          pointerEvents="none"
          name={external ? 'arrow.up.right' : 'arrow.right'}
          size={14}
          weight="bold"
          tintColor={t.primary}
          fallback={null}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2, minHeight: MinTapTarget, alignSelf: 'flex-start' },
  linkLabel: { fontFamily: Fonts.semibold, fontSize: 16 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: MinTapTarget - 6,
    borderRadius: Radius.md - 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  segmentSelected: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  button: {
    minHeight: 54,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  buttonLabel: { fontSize: 16, fontFamily: Fonts.bold },
});
