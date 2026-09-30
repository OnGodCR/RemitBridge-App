import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { ListGroup, ListRow } from '@/components/list-row';
import { SavedChecks } from '@/components/saved-checks';
import { SavedComparisons } from '@/components/saved-comparisons';
import { AppText, Button } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useIsAdmin } from '@/lib/admin';
import { useAuth } from '@/lib/auth';
import { LINKS, openPage } from '@/lib/links';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/track';

/**
 * Account: what's saved (comparisons, then receipts), the admin tools for admins, the
 * account actions, and the pages the stores require. Lists are the website's divided index
 * (D63); actions that change the account stay buttons, because they aren't places to go.
 */
export default function AccountScreen() {
  const t = useTheme();
  const { session, signOut, resetOnboarding } = useAuth();
  const [busy, setBusy] = useState(false);
  const isAdmin = useIsAdmin();

  const confirmDelete = () =>
    Alert.alert('Delete your account?', 'Your saved comparisons and receipts go with it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteAccount },
    ]);

  const deleteAccount = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    setBusy(false);
    if (error) {
      Alert.alert('Couldn’t delete your account', 'Try again in a moment.');
      return;
    }
    track('account_deleted');
    await signOut();
  };

  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title="Account">
          <AppText style={{ color: t.heroMuted }}>
            {session ? (session.user.email ?? 'Signed in with Apple') : 'Save comparisons and the receipts you check.'}
          </AppText>
        </HeroHeader>
        <View style={[styles.content, { backgroundColor: t.background }]}>
          {session ? (
            <>
              <SavedComparisons />
              <SavedChecks />
              {isAdmin ? (
                <ListGroup title="Admin">
                  <ListRow title="Add a price" subtitle="Enter a price read from a provider’s site" onPress={() => router.push('/admin')} />
                  <ListRow title="Metrics" subtitle="Usage, funnel and impact, with definitions" onPress={() => router.push('/metrics')} />
                </ListGroup>
              ) : null}
              <View style={styles.actions}>
                <Button label="Sign out" variant="secondary" onPress={signOut} />
                <Button label="Delete account" variant="plain" loading={busy} onPress={confirmDelete} />
              </View>
            </>
          ) : (
            <View style={styles.actions}>
              <AppText style={{ color: t.textSecondary }}>
                An account is optional. It keeps what you save, on any phone you use.
              </AppText>
              <Button label="Create account or sign in" onPress={() => router.push('/sign-in')} />
            </View>
          )}

          <ListGroup title="About">
            <ListRow title="Route board" subtitle="Which routes we check, and which people want" onPress={() => router.push('/routes')} />
            <ListRow external title="Privacy policy" subtitle="What we keep, and what we never do" onPress={() => openPage(LINKS.privacy)} />
            <ListRow external title="Support" subtitle="Questions, and how to reach us" onPress={() => openPage(LINKS.support)} />
          </ListGroup>

          {__DEV__ ? (
            <Button
              label="Replay onboarding (dev only)"
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
