import { Icon } from '@/components/icon';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Flag, FLAG_SLOT, FlagSlot } from '@/components/flag';
import { AppText, useLargeText } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useIconSize } from '@/hooks/use-icon-size';
import { useTheme } from '@/hooks/use-theme';
import { countryIn, currencyIn, useCopy } from '@/i18n';
import type { Country } from '@/lib/countries';
import { CURRENCIES } from '@/lib/currencies';

/**
 * A dropdown: a field showing the current choice that opens a sheet with the full list.
 * Used for countries on Compare and for currencies in the tools.
 *
 * The sheet closes three ways: the close button (top left, clear of anything floating
 * at top right, such as Expo Go's dev button, which hid a top-right "Done"), a swipe
 * down, or picking any enabled option, including the current one.
 *
 * A search field at the top filters by every string in `search`, so "mex", "MX" and
 * "MXN" all find Mexico.
 */
export interface SelectOption {
  value: string;
  /** Country code for the flag. */
  flag: string;
  name: string;
  /** Shown in the field when the full name won't fit. */
  short?: string;
  /** Right-hand detail in the list, e.g. the currency code. */
  detail: string;
  disabled?: boolean;
  /** Can be picked, but has no prices: the detail says "Not yet" (PRD 6.7). */
  uncovered?: boolean;
  search: string[];
}

export function SelectField({
  label,
  title,
  value,
  options,
  onChange,
  tone = 'hero',
}: {
  label: string;
  title: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** `hero` sits on the green header band; `plain` on the page background. */
  tone?: 'hero' | 'plain';
}) {
  const t = useTheme();
  const copy = useCopy();
  const large = useLargeText();
  const icon = useIconSize(13);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = options.find((o) => o.value === value) ?? options[0];
  const close = () => {
    setOpen(false);
    setQuery('');
  };
  const q = normalize(query);
  const shown = q ? options.filter((o) => o.search.some((f) => normalize(f).includes(q))) : options;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={copy.select.change(label, current.name)}
        style={({ pressed }) => [
          styles.field,
          tone === 'hero'
            ? { backgroundColor: t.heroField }
            : { backgroundColor: t.card, borderColor: t.border, borderWidth: StyleSheet.hairlineWidth },
          { opacity: pressed ? 0.85 : 1 },
        ]}>
        <AppText variant="small" muted>
          {label}
        </AppText>
        <View style={styles.fieldRow}>
          <Flag code={current.flag} height={16} />
          <AppText variant="label" style={styles.fieldName} numberOfLines={large ? 2 : 1}>
            {current.short ?? current.name}
          </AppText>
          <Icon
            pointerEvents="none"
            name="chevron.down"
            size={icon}
            weight="semibold"
            tintColor={t.textSecondary}
            fallback={<AppText muted>›</AppText>}
          />
        </View>
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <SafeAreaView style={[styles.sheet, { backgroundColor: t.background }]} edges={['bottom']}>
          <View style={[styles.grabber, { backgroundColor: t.border }]} />
          <View style={styles.sheetHeader}>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={copy.common.close}
              hitSlop={8}
              style={styles.close}>
              <Icon
                pointerEvents="none"
                name="xmark"
                size={icon + 4}
                weight="semibold"
                tintColor={t.text}
                fallback={<AppText variant="label">{copy.common.close}</AppText>}
              />
            </Pressable>
            <AppText variant="heading">{title}</AppText>
          </View>
          <View style={[styles.search, { backgroundColor: t.card, borderColor: t.border }]}>
            <Icon
              pointerEvents="none"
              name="magnifyingglass"
              size={icon + 2}
              weight="medium"
              tintColor={t.textSecondary}
              fallback={<AppText muted>⌕</AppText>}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={copy.common.search}
              placeholderTextColor={t.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
              accessibilityLabel={copy.select.searchLabel(title)}
              maxFontSizeMultiplier={2}
              style={[styles.searchInput, { color: t.text }]}
            />
          </View>
          <FlatList
            data={shown}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <AppText muted style={styles.empty}>
                {copy.select.nothingMatches(query.trim())}
              </AppText>
            }
            keyExtractor={(o) => o.value}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: t.border }]} />}
            renderItem={({ item }) => {
              const selected = item.value === current.value;
              return (
                <Pressable
                  disabled={item.disabled}
                  onPress={() => {
                    onChange(item.value);
                    close();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: !!item.disabled }}
                  accessibilityLabel={`${item.name}${item.disabled ? `, ${copy.select.comingSoon}` : item.uncovered ? `, ${copy.select.notCovered}` : ''}`}
                  style={({ pressed }) => [styles.row, { backgroundColor: pressed ? t.muted : 'transparent' }]}>
                  <FlagSlot code={item.flag} dim={item.disabled} />
                  <AppText
                    variant="label"
                    style={[styles.rowName, { color: item.disabled ? t.textSecondary : t.text }]}>
                    {item.name}
                  </AppText>
                  <AppText variant="small" muted>
                    {item.disabled ? copy.select.comingSoon : item.uncovered ? copy.select.notYet : item.detail}
                  </AppText>
                  <View style={styles.check}>
                    {selected ? (
                      <Icon
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

/**
 * Countries for Compare and route requests. Every country can be picked; `covered` says
 * which have prices (from the other field's country), and the rest read "Not yet". Picking
 * one of those shows the request form instead of results (PRD 6.7).
 */
export function CountrySelect({
  options,
  covered,
  ...rest
}: {
  label: string;
  title: string;
  value: string;
  options: Country[];
  covered: (code: string) => boolean;
  onChange: (code: string) => void;
  tone?: 'hero' | 'plain';
}) {
  const copy = useCopy();
  return (
    <SelectField
      {...rest}
      options={options.map((c) => {
        const name = countryIn(copy, c.code);
        return {
          value: c.code,
          flag: c.code,
          name,
          // The field is narrow: each language's own short form ("EE. UU."), else English's ("US").
          short: copy.countriesShort[c.code] ?? (name === c.name ? c.short : undefined),
          detail: c.currency,
          uncovered: !covered(c.code),
          // English names still match, so "mexico" finds México in any language.
          search: [name, c.name, c.short ?? '', c.code, c.currency],
        };
      })}
    />
  );
}

const CURRENCY_OPTIONS: SelectOption[] = CURRENCIES.map((c) => ({
  value: c.code,
  flag: c.flag,
  name: c.name,
  short: c.code,
  detail: c.code,
  search: [c.name, c.code, c.flag],
}));

/** Currencies for the tools, on the page background, named in the app's language. */
export function CurrencySelect(props: { label: string; value: string; onChange: (code: string) => void }) {
  const copy = useCopy();
  const options = CURRENCY_OPTIONS.map((o) => {
    const name = currencyIn(copy, o.value);
    return { ...o, name, search: [...o.search, name] };
  });
  return <SelectField {...props} title={props.label} options={options} tone="plain" />;
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    minHeight: 60,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    gap: 2,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fieldName: { flex: 1, fontSize: 16 },
  sheet: { flex: 1 },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, marginTop: Spacing.two },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  close: { width: MinTapTarget, height: MinTapTarget, alignItems: 'center', justifyContent: 'center' },
  search: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontFamily: Fonts.medium, fontSize: 16, paddingVertical: Spacing.two },
  empty: { padding: Spacing.three },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  rowName: { flex: 1, fontSize: 16 },
  check: { width: 18, alignItems: 'flex-end' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.three + FLAG_SLOT + Spacing.three },
});
