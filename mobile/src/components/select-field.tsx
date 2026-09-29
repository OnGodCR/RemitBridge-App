import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Country } from '@/lib/countries';

/**
 * A dropdown for countries: a field showing the current choice that opens a sheet with
 * the full list. Countries that aren't live yet are listed but can't be picked.
 */
export function CountrySelect({
  label,
  title,
  value,
  options,
  onChange,
}: {
  label: string;
  title: string;
  value: string;
  options: Country[];
  onChange: (code: string) => void;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.code === value) ?? options[0];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current.name}. Change`}
        style={({ pressed }) => [
          styles.field,
          { backgroundColor: t.card, borderColor: t.border, opacity: pressed ? 0.8 : 1 },
        ]}>
        <AppText variant="small" muted>
          {label}
        </AppText>
        <View style={styles.fieldRow}>
          <AppText style={styles.flag}>{current.flag}</AppText>
          <AppText variant="label" style={styles.fieldName} numberOfLines={1}>
            {current.short ?? current.name}
          </AppText>
          <SymbolView
            pointerEvents="none"
            name="chevron.down"
            size={14}
            weight="semibold"
            tintColor={t.textSecondary}
            fallback={<AppText muted>▾</AppText>}
          />
        </View>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={[styles.sheet, { backgroundColor: t.background }]} edges={['bottom']}>
          <View style={styles.sheetHeader}>
            <AppText variant="heading">{title}</AppText>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={styles.close}>
              <AppText variant="label" style={{ color: t.primary }}>
                Done
              </AppText>
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(c) => c.code}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: t.border }]} />
            )}
            renderItem={({ item }) => {
              const selected = item.code === current.code;
              return (
                <Pressable
                  disabled={!item.live}
                  onPress={() => {
                    onChange(item.code);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: !item.live }}
                  accessibilityLabel={`${item.name}${item.live ? '' : ', coming soon'}`}
                  style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
                  <AppText style={[styles.flag, !item.live && styles.dim]}>{item.flag}</AppText>
                  <AppText variant="label" style={[styles.rowName, !item.live && styles.dim]}>
                    {item.name}
                  </AppText>
                  {item.live ? (
                    <AppText variant="small" muted>
                      {item.currency}
                    </AppText>
                  ) : (
                    <View style={[styles.soon, { backgroundColor: t.muted }]}>
                      <AppText variant="small" muted>
                        Soon
                      </AppText>
                    </View>
                  )}
                  {selected ? (
                    <SymbolView
                      pointerEvents="none"
                      name="checkmark"
                      size={16}
                      weight="bold"
                      tintColor={t.primary}
                      fallback={<AppText style={{ color: t.primary }}>✓</AppText>}
                    />
                  ) : (
                    <View style={styles.checkSpace} />
                  )}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    minHeight: 64,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    gap: 2,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fieldName: { flex: 1, fontSize: 15 },
  flag: { fontSize: 22, lineHeight: 28 },
  sheet: { flex: 1 },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  close: { minHeight: MinTapTarget, justifyContent: 'center' },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  rowName: { flex: 1, fontSize: 16 },
  dim: { opacity: 0.45 },
  soon: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: Radius.pill },
  checkSpace: { width: 16 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
});
