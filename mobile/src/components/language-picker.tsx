import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Spacing } from '@/constants/theme';
import { useIconSize } from '@/hooks/use-icon-size';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { isReviewed, offeredLanguages, type LanguageCode } from '@/i18n/languages';
import { announce } from '@/lib/announce';
import { track } from '@/lib/track';

/**
 * Choosing the app's language (DECISIONS.md D69). The list shows each language in its own
 * name, the way its speakers look for it, with the English name under it; VoiceOver reads
 * each name in that language's voice. Drafts (no reviewer yet) are marked, and only exist
 * in development builds, so a release can never show an unchecked translation.
 *
 * With one language on offer (a release build before any review) there's nothing to
 * choose, so the button doesn't render at all.
 */
export function LanguageButton({ onDark }: { onDark?: boolean }) {
  const t = useTheme();
  const copy = useCopy();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const icon = useIconSize(16);
  if (offeredLanguages().length < 2) return null;
  const color = onDark ? t.heroText : t.text;
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${copy.language.title}: ${language.name}`}
        accessibilityHint={copy.language.pick}
        hitSlop={6}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
        <SymbolView pointerEvents="none" name="globe" size={icon} tintColor={color} fallback={null} />
        <AppText style={[styles.buttonLabel, { color }]}>{language.name}</AppText>
        <SymbolView pointerEvents="none" name="chevron.down" size={icon - 4} weight="semibold" tintColor={color} fallback={null} />
      </Pressable>
      <LanguageSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function LanguageSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const copy = useCopy();
  const { language, setLanguage } = useLanguage();
  const icon = useIconSize(17);
  const languages = offeredLanguages();
  const anyDraft = languages.some((l) => !isReviewed(l));

  const pick = (code: LanguageCode) => {
    if (code !== language.code) {
      track('language_changed', { language: code });
      setLanguage(code);
      const picked = languages.find((l) => l.code === code);
      if (picked) announce(picked.name);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.sheet, { backgroundColor: t.background }]} edges={['bottom']}>
        <View style={[styles.grabber, { backgroundColor: t.border }]} />
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={copy.common.close}
            hitSlop={8}
            style={styles.close}>
            <SymbolView pointerEvents="none" name="xmark" size={icon} weight="semibold" tintColor={t.text} fallback={null} />
          </Pressable>
          <AppText variant="heading" accessibilityRole="header">
            {copy.language.pick}
          </AppText>
        </View>
        <ScrollView contentContainerStyle={styles.list}>
          {languages.map((l) => {
            const selected = l.code === language.code;
            const draft = !isReviewed(l);
            return (
              <Pressable
                key={l.code}
                onPress={() => pick(l.code)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLanguage={l.locale}
                accessibilityLabel={`${l.name}${l.code === 'en' ? '' : `, ${l.english}`}${draft ? `, ${copy.language.draft}` : ''}`}
                style={({ pressed }) => [styles.row, { borderBottomColor: t.border, opacity: pressed ? 0.6 : 1 }]}>
                <View style={styles.rowText}>
                  <AppText accessibilityLanguage={l.locale} style={[styles.name, { color: t.text }]}>
                    {l.name}
                  </AppText>
                  <AppText variant="small" style={{ color: t.textSecondary }}>
                    {l.english}
                    {draft ? ` · ${copy.language.draft}` : ''}
                  </AppText>
                </View>
                {selected ? (
                  <SymbolView pointerEvents="none" name="checkmark" size={icon} weight="bold" tintColor={t.primary} fallback={null} />
                ) : null}
              </Pressable>
            );
          })}
          {anyDraft ? (
            <AppText variant="small" style={[styles.note, { color: t.textSecondary }]}>
              {copy.language.draftNote}
            </AppText>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2, minHeight: MinTapTarget, alignSelf: 'flex-start' },
  buttonLabel: { fontFamily: Fonts.semibold, fontSize: 16 },
  sheet: { flex: 1 },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, marginTop: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: Spacing.two },
  close: { width: MinTapTarget, height: MinTapTarget, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  row: {
    minHeight: MinTapTarget + 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { flex: 1, gap: 2 },
  name: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 26 },
  note: { paddingTop: Spacing.three },
});
