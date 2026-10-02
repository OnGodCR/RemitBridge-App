import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { LanguageSheet } from '@/components/language-picker';
import { CheckedArt, FeeMarkupArt, NoAffiliateArt, SavedArt, WrongPriceArt } from '@/components/illustrations';
import { ListGroup, ListPoint, ListRow } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { offeredLanguages } from '@/i18n/languages';
import { useIsAdmin } from '@/lib/admin';
import { useAuth } from '@/lib/auth';
import { announce } from '@/lib/announce';
import { CONTACT, LINKS, openPage, writeToUs } from '@/lib/links';
import { fullName, saveName } from '@/lib/name';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/track';
import { useTabFocus } from '@/lib/current-tab';
import { FocusRise } from '@/components/motion-views';
import { WhatsAppSection } from '@/components/whatsapp-section';

/**
 * Account: what's saved (comparisons, then receipts), the admin tools for admins, the
 * account actions, and the pages the stores require. Lists are the website's divided index
 * (D63); actions that change the account stay buttons, because they aren't places to go.
 */
export default function AccountScreen() {
  useTabFocus('/account');
  const t = useTheme();
  const copy = useCopy();
  const a = copy.account;
  const { language } = useLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const canChooseLanguage = offeredLanguages().length > 1;
  const { session, signOut, resetOnboarding } = useAuth();
  const [busy, setBusy] = useState(false);
  const isAdmin = useIsAdmin();

  const confirmDelete = () =>
    Alert.alert(a.deleteTitle, a.deleteBody, [
      { text: copy.common.cancel, style: 'cancel' },
      { text: copy.common.delete, style: 'destructive', onPress: deleteAccount },
    ]);

  const deleteAccount = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    setBusy(false);
    if (error) {
      Alert.alert(a.deleteFailedTitle, a.deleteFailedBody);
      return;
    }
    track('account_deleted');
    await signOut();
  };

  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title={a.title}>
          {session ? (
            <AppText style={{ color: t.heroMuted }}>{session.user.email ?? a.signedInApple}</AppText>
          ) : null}
        </HeroHeader>
        <FocusRise style={[styles.content, { backgroundColor: t.background }]}>
          {session ? (
            <>
              <NameField />
              {/* Saved items have their own screen (D108); this row is one of three ways in. */}
              <ListGroup cards>
                <ListRow art={<SavedArt />} title={copy.titles.saved} subtitle={copy.saved.rowSub} onPress={() => router.push('/saved')} />
              </ListGroup>
              {isAdmin ? (
                <ListGroup title={a.admin} cards>
                  <ListRow icon="plus.circle" title={a.addPrice} subtitle={a.addPriceSub} onPress={() => router.push('/admin')} />
                  <ListRow icon="chart.bar" title={a.metrics} subtitle={a.metricsSub} onPress={() => router.push('/metrics')} />
                </ListGroup>
              ) : null}
              <View style={styles.actions}>
                <Button label={a.signOut} variant="secondary" onPress={signOut} />
                <Button label={a.deleteAccount} variant="plain" loading={busy} onPress={confirmDelete} />
              </View>
            </>
          ) : (
            <View style={styles.actions}>
              <AppText style={{ color: t.textSecondary }}>
                {a.optional}
              </AppText>
              <Button label={a.createOrSignIn} onPress={() => router.push('/sign-in')} />
            </View>
          )}

          <WhatsAppSection />

          {canChooseLanguage ? (
            <ListGroup title={copy.language.title} cards>
              <ListRow icon="globe" title={language.name} subtitle={copy.language.pick} onPress={() => setLanguageOpen(true)} />
              {language.code !== 'en' ? (
                <ListRow
                  external
                  icon="pencil"
                  title={copy.language.improve}
                  subtitle={CONTACT}
                  onPress={() => writeToUs(copy, `Translation: ${language.english}`)}
                />
              ) : null}
            </ListGroup>
          ) : null}
          <LanguageSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />

          {/* How RemitBridge works, moved here from Learn (D104): it's about us, not a lesson. */}
          <ListGroup title={copy.learn.howItWorks}>
            <ListPoint art={<FeeMarkupArt />} title={copy.learn.feeMarkup}>{copy.learn.feeMarkupBody}</ListPoint>
            <ListPoint art={<CheckedArt />} title={copy.learn.checkedOnly}>{copy.learn.checkedOnlyBody}</ListPoint>
            <ListPoint art={<NoAffiliateArt />} title={copy.learn.noAffiliate}>{copy.learn.noAffiliateBody}</ListPoint>
            <ListPoint art={<WrongPriceArt />} title={copy.learn.wrongPrice}>
              <AppText style={{ color: t.primary }} accessibilityRole="link" onPress={() => writeToUs(copy)}>
                {CONTACT}
              </AppText>
            </ListPoint>
          </ListGroup>

          <ListGroup title={a.about} cards>
            <ListRow icon="map" title={a.routeBoard} subtitle={a.routeBoardSub} onPress={() => router.push('/routes')} />
            <ListRow external icon="hand.raised" title={a.privacy} subtitle={a.privacySub} onPress={() => openPage(LINKS.privacy)} />
            <ListRow external icon="questionmark.circle" title={a.support} subtitle={a.supportSub} onPress={() => openPage(LINKS.support)} />
          </ListGroup>

          {__DEV__ ? (
            <ListGroup cards>
              <ListRow
                icon="doc.text.magnifyingglass"
                title={copy.devPreview.row}
                subtitle={copy.devPreview.intro}
                onPress={() => router.push('/dev/receipt-preview')}
              />
            </ListGroup>
          ) : null}
          {__DEV__ ? (
            <Button
              label={a.replay}
              variant="plain"
              onPress={async () => {
                await signOut();
                resetOnboarding();
              }}
            />
          ) : null}
        </FocusRise>
      </ScrollView>
      <StatusBarShield />
    </View>
  );
}

/** The name the app greets you by (D114), kept with the account and deleted with it. */
function NameField() {
  const t = useTheme();
  const copy = useCopy();
  const { session } = useAuth();
  const stored = fullName(session);
  const [value, setValue] = useState(stored);
  const [busy, setBusy] = useState(false);
  const changed = value.trim() !== stored;
  return (
    <View style={styles.nameField}>
      <AppText variant="label" muted>
        {copy.account.yourName}
      </AppText>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={copy.account.namePlaceholder}
        placeholderTextColor={t.textSecondary}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        maxLength={40}
        accessibilityLabel={copy.account.yourName}
        style={[styles.nameInput, { color: t.text, backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim }]}
      />
      {changed && value.trim() ? (
        <Button
          label={copy.confirm.save}
          variant="secondary"
          loading={busy}
          onPress={async () => {
            setBusy(true);
            if (await saveName(value)) announce(copy.account.nameSaved);
            setBusy(false);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  nameField: { gap: Spacing.two },
  nameInput: {
    minHeight: MinTapTarget + 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 3,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.semibold,
    fontSize: 17,
  },
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { flexGrow: 1, padding: Spacing.three, paddingTop: Spacing.four, gap: Spacing.five, paddingBottom: Spacing.six },
  actions: { gap: Spacing.three },
});
