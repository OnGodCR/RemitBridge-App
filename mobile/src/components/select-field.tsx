import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, CodeBadge } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Country } from '@/lib/countries';

/**
 * A dropdown for countries: a field showing the current choice that opens a sheet with
 * the full list. Countries that aren't live yet are listed but can't be picked.
 *
 * The sheet closes three ways: the close button (top left, clear of anything floating
 * at top right, such as Expo Go's dev button, which hid a top-right "Done"), a swipe
 * down, or picking any live country, including the current one.
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
  const close = () => setOpen(false);

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
          <AppText variant="label" style={styles.fieldName} numberOfLines={1}>
            {current.short ?? current.name}
          </AppText>
          <SymbolView
            pointerEvents="none"
            name="chevron.down"
            size={13}
            weight="semibold"
            tintColor={t.textSecondary}
            fallback={<AppText muted>›</AppText>}
          />
        </View>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}>
        <SafeAreaView style={[styles.sheet, { backgroundColor: t.background }]} edges={['bottom']}>
          <View style={[styles.grabber, { backgroundColor: t.border }]} />
          <View style={styles.sheetHeader}>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={styles.close}>
              <SymbolView
                pointerEvents="none"
                name="xmark"
                size={17}
                weight="semibold"
                tintColor={t.text}
                fallback={<AppText variant="label">Close</AppText>}
              />
            </Pressable>
            <AppText variant="heading">{title}</AppText>
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
                    close();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: !item.live }}
                  accessibilityLabel={`${item.name}${item.live ? '' : ', coming soon'}`}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: pressed ? t.muted : 'transparent' },
                  ]}>
                  <CodeBadge code={item.code} dim={!item.live} />
                  <AppText
                    variant="label"
                    style={[styles.rowName, { color: item.live ? t.text : t.textSecondary }]}>
                    {item.name}
                  </AppText>
                  <AppText variant="small" muted>
                    {item.live ? item.currency : 'Coming soon'}
                  </AppText>
                  <View style={styles.check}>
                    {selected ? (
                      <SymbolView
                        pointerEvents="none"
                        name="checkmark"
                        size={15}
                        weight="bold"
                        tintColor={t.primary}
                        fallback={<AppText style={{ color: t.primary }}>✓</AppText>}
                      />
                    ) : null}
                  </View>
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
    minHeight: 60,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    gap: 2,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fieldName: { flex: 1, fontSize: 16 },
  sheet: { flex: 1 },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    marginTop: Spacing.two,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  close: {
    width: MinTapTarget,
    height: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  rowName: { flex: 1, fontSize: 16 },
  check: { width: 18, alignItems: 'flex-end' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.three + 32 + Spacing.three },
});
