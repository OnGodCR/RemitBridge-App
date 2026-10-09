import { Icon } from '@/components/icon';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * One choice from a short list that's too long for a segmented control (how a transfer was
 * paid for has six answers). A divided list with a check on the chosen row, in the same
 * register as the rest of the app (D44, D63): hairlines, text labels, no pills.
 */
export function ChoiceList<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  label: string;
}) {
  const t = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.list, { backgroundColor: t.card, borderColor: t.border }]}>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [
              styles.row,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <AppText variant={selected ? 'label' : 'body'} style={styles.flex}>
              {o.label}
            </AppText>
            {selected ? (
              <Icon name="checkmark" size={15} weight="semibold" tintColor={t.primary} fallback={<AppText style={{ color: t.primary }}>✓</AppText>} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three },
  row: { minHeight: MinTapTarget, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
});
