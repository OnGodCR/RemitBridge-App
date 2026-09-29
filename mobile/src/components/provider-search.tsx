import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchProviders, matchProviders, type Provider } from '@/lib/providers';
import { track } from '@/lib/track';

const TYPE_LABEL: Record<Provider['type'], string> = {
  bank: 'Bank',
  credit_union: 'Credit union',
  mto: 'Money transfer',
  fintech: 'App',
};

/**
 * Search for a provider by name. Picking one narrows Compare to that provider; the
 * clear button (or clearing the text) shows everyone again.
 */
export function ProviderSearch({
  selected,
  onSelect,
}: {
  selected: Provider | null;
  onSelect: (provider: Provider | null) => void;
}) {
  const t = useTheme();
  const [all, setAll] = useState<Provider[]>([]);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const input = useRef<TextInput>(null);

  useEffect(() => {
    fetchProviders().then(setAll);
  }, []);

  const text = selected && !focused ? selected.name : query;
  const matches = focused ? matchProviders(all, query) : [];
  const noMatch = focused && query.trim().length > 0 && matches.length === 0;

  const pick = (p: Provider) => {
    track('provider_searched', { provider: p.id });
    onSelect(p);
    setQuery('');
    setFocused(false);
    Keyboard.dismiss();
  };

  const clear = () => {
    setQuery('');
    onSelect(null);
    input.current?.focus(); // stay in the field, ready for the next search
  };

  return (
    <View>
      <View style={[styles.box, { backgroundColor: t.card, borderColor: focused ? t.primary : t.border }]}>
        <SymbolView
          pointerEvents="none"
          name="magnifyingglass"
          size={15}
          weight="medium"
          tintColor={t.textSecondary}
          fallback={<AppText muted>⌕</AppText>}
        />
        <TextInput
          ref={input}
          value={text}
          onChangeText={(v) => {
            setQuery(v);
            if (selected) onSelect(null);
          }}
          onFocus={() => {
            setFocused(true);
            setQuery(selected ? '' : query);
          }}
          onBlur={() => setFocused(false)}
          placeholder="Search providers"
          placeholderTextColor={t.textSecondary}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search providers"
          style={[styles.input, { color: t.text }]}
        />
        {text ? (
          <Pressable
            onPress={clear}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            style={styles.clear}>
            <SymbolView
              pointerEvents="none"
              name="xmark.circle.fill"
              size={17}
              tintColor={t.textSecondary}
              fallback={<AppText muted>×</AppText>}
            />
          </Pressable>
        ) : null}
      </View>

      {matches.length > 0 || noMatch ? (
        <View style={[styles.results, { backgroundColor: t.card, borderColor: t.border }]}>
          {noMatch ? (
            <AppText muted style={styles.empty}>
              No provider called “{query.trim()}” yet.
            </AppText>
          ) : (
            matches.map((p, i) => (
              <Pressable
                key={p.id}
                onPress={() => pick(p)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                  { backgroundColor: pressed ? t.muted : 'transparent' },
                ]}>
                <AppText variant="label" style={styles.name}>
                  {p.name}
                </AppText>
                <AppText variant="small" muted>
                  {TYPE_LABEL[p.type]}
                </AppText>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
  },
  input: { flex: 1, fontFamily: Fonts.medium, fontSize: 16, paddingVertical: Spacing.two },
  clear: { minHeight: MinTapTarget, justifyContent: 'center' },
  results: {
    marginTop: Spacing.one,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  name: { flex: 1, fontSize: 15 },
  empty: { padding: Spacing.three },
});
