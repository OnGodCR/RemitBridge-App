import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { LanguageSheet } from '@/components/language-picker';
import { CheckedArt, FeeMarkupArt, NoAffiliateArt, SavedArt, WrongPriceArt } from '@/components/illustrations';
import { ListGroup, ListItem, ListPoint, ListRow } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { INCORPORATED, LEGAL_NAME } from '@/constants/site-config';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { languagesNeedingReview, offeredLanguages } from '@/i18n/languages';
import { useIsAdmin } from '@/lib/admin';
import { useAuth } from '@/lib/auth';
import { announce } from '@/lib/announce';
import { CONTACT, LINKS, openPage, writeToUs } from '@/lib/links';
import { fullName, saveName } from '@/lib/name';
import { newsletterStatus, setNewsletter } from '@/lib/newsletter';
import { appleAuthorizationCode } from '@/lib/sign-in';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/track';
import { FocusRise } from '@/components/motion-views';

/**
 * Account: what's saved (comparisons, then receipts), the admin tools for admins, the
 * account actions, and the pages the stores require. Lists are the website's divided index
 * (D63); actions that change the account stay buttons, because they aren't places to go.
 */
export default function AccountScreen() {
  const t = useTheme();
  const gutter = useGutter();
  const copy = useCopy();
  const a = copy.account;
  const { language } = useLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const canChooseLanguage = offeredLanguages().length > 1;
  const needVolunteers = languagesNeedingReview().length > 0;
  const { session, signOut } = useAuth();
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
    // Signed in with Apple: Apple's sheet gives a one-time code, and the server uses it to
    // revoke RemitBridge's access to the Apple Account (D145). Backing out of the sheet
    // cancels the deletion; without a code the account is still deleted.
    let apple_code: string | undefined;
    const providers = (session?.user.app_metadata?.providers as string[] | undefined) ?? [session?.user.app_metadata?.provider];
    if (Platform.OS === 'ios' && providers.includes('apple')) {
      const code = await appleAuthorizationCode();
      if (code === 'closed') {
        setBusy(false);
        return;
      }
      apple_code = code ?? undefined;
    }
    const { error } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
      ...(apple_code ? { body: { apple_code } } : {}),
    });
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
        <HeroHeader title={a.title} onBack={() => router.back()}>
          {session ? (
            <AppText style={{ color: t.heroMuted }}>{session.user.email ?? a.signedInApple}</AppText>
          ) : null}
        </HeroHeader>
        <FocusRise style={[styles.content, { backgroundColor: t.background, paddingHorizontal: gutter }]}>
          {session ? (
            <>
              <NameField />
              {/* Saved items have their own screen (D108); this row is one of three ways in. */}
              <ListGroup cards>
                <ListRow art={<SavedArt />} title={copy.titles.saved} subtitle={copy.saved.rowSub} onPress={() => router.push('/saved')} />
              </ListGroup>
              <NewsletterSwitch />
              {isAdmin ? (
                <ListGroup title={a.admin} cards>
                  <ListRow icon="plus.circle" title={a.addPrice} subtitle={a.addPriceSub} onPress={() => router.push('/admin')} />
                  <ListRow icon="chart.bar" title={a.metrics} subtitle={a.metricsSub} onPress={() => router.push('/metrics')} />
                  <ListRow icon="bubble.left" title={a.suggestions} subtitle={a.suggestionsSub} onPress={() => router.push('/suggestions')} />
                  <ListRow icon="envelope.fill" title={a.writeNewsletter} subtitle={a.writeNewsletterSub} onPress={() => router.push('/newsletter')} />
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
              {/* D151: the drafts released before a review ask for the people who can check them. */}
              {needVolunteers ? (
                <ListRow
                  external
                  icon="person.2"
                  title={copy.language.volunteerTitle}
                  subtitle={copy.language.volunteerBody}
                  onPress={() => writeToUs(copy, 'Translation volunteer')}
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
            <ListRow icon="hand.raised" title={a.privacy} subtitle={a.privacySub} onPress={() => router.push('/legal/privacy')} />
            <ListRow external icon="questionmark.circle" title={a.support} subtitle={a.supportSub} onPress={() => openPage(LINKS.support)} />
            <ListRow icon="doc.text" title={a.terms} subtitle={a.termsSub} onPress={() => router.push('/legal/terms')} />
            <ListRow external icon="list.bullet" title={a.licenses} subtitle={a.licensesSub} onPress={() => openPage(LINKS.licenses)} />
          </ListGroup>
          <AppText variant="small" muted style={styles.legal}>
            {a.copyright(LEGAL_NAME, INCORPORATED)}
          </AppText>

        </FocusRise>
      </ScrollView>
      <StatusBarShield />
    </View>
  );
}

/**
 * The newsletter (D169): off until the person turns it on, and it goes to the address they
 * signed in with. Hidden until the current setting is known, so it never shows the wrong one.
 */
function NewsletterSwitch() {
  const t = useTheme();
  const copy = useCopy();
  const a = copy.account;
  const { language } = useLanguage();
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    newsletterStatus().then((s) => live && setOn(s));
    return () => {
      live = false;
    };
  }, []);

  if (on === null) return null;
  const change = async (next: boolean) => {
    setBusy(true);
    setOn(next);
    const ok = await setNewsletter(next, language.code);
    setBusy(false);
    if (!ok) {
      setOn(!next);
      Alert.alert(copy.whatsapp.failed);
      return;
    }
    announce(next ? a.newsletterOn : a.newsletterOff);
    track(next ? 'newsletter_on' : 'newsletter_off');
  };
  return (
    <ListGroup title={a.newsletter}>
      <ListItem style={styles.switchRow}>
        <AppText style={[styles.switchText, { color: t.textSecondary }]}>{a.newsletterSub}</AppText>
        <Switch
          value={on}
          disabled={busy}
          onValueChange={change}
          trackColor={{ true: t.primary, false: t.border }}
          accessibilityLabel={a.newsletter}
          accessibilityHint={a.newsletterSub}
        />
      </ListItem>
    </ListGroup>
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
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  switchText: { flex: 1 },
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
  legal: { textAlign: 'center' },
});
