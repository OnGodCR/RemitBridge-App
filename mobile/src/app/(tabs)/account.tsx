import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { LanguageSheet } from '@/components/language-picker';
import { ListGroup, ListRow } from '@/components/list-row';
import { SavedChecks } from '@/components/saved-checks';
import { SavedComparisons } from '@/components/saved-comparisons';
import { AppText, Button } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { offeredLanguages } from '@/i18n/languages';
import { useIsAdmin } from '@/lib/admin';
import { useAuth } from '@/lib/auth';
import { CONTACT, LINKS, openPage } from '@/lib/links';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/track';

/**
 * Account: what's saved (comparisons, then receipts), the admin tools for admins, the
 * account actions, and the pages the stores require. Lists are the website's divided index
 * (D63); actions that change the account stay buttons, because they aren't places to go.
 */
export default function AccountScreen() {
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
          <AppText style={{ color: t.heroMuted }}>
            {session ? (session.user.email ?? a.signedInApple) : a.signedOutLine}
          </AppText>
        </HeroHeader>
        <View style={[styles.content, { backgroundColor: t.background }]}>
          {session ? (
            <>
              <SavedComparisons />
              <SavedChecks />
              {isAdmin ? (
                <ListGroup title={a.admin}>
                  <ListRow title={a.addPrice} subtitle={a.addPriceSub} onPress={() => router.push('/admin')} />
                  <ListRow title={a.metrics} subtitle={a.metricsSub} onPress={() => router.push('/metrics')} />
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
            <ListGroup title={copy.language.title}>
              <ListRow title={language.name} subtitle={copy.language.pick} onPress={() => setLanguageOpen(true)} />
              <ListRow
                external
                title={copy.language.improve}
                subtitle={CONTACT}
                onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${encodeURIComponent(`Translation: ${language.english}`)}`)}
              />
            </ListGroup>
          ) : null}
          <LanguageSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />

          <ListGroup title={a.about}>
            <ListRow title={a.routeBoard} subtitle={a.routeBoardSub} onPress={() => router.push('/routes')} />
            <ListRow external title={a.privacy} subtitle={a.privacySub} onPress={() => openPage(LINKS.privacy)} />
            <ListRow external title={a.support} subtitle={a.supportSub} onPress={() => openPage(LINKS.support)} />
          </ListGroup>

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
        </View>
      </ScrollView>
      <StatusBarShield />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { flexGrow: 1, padding: Spacing.three, paddingTop: Spacing.four, gap: Spacing.five, paddingBottom: Spacing.six },
  actions: { gap: Spacing.three },
});
