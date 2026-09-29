import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader } from '@/components/hero-header';
import { SavedChecks } from '@/components/saved-checks';
import { AppText, Button } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useIsAdmin } from '@/lib/admin';
import { useAuth } from '@/lib/auth';
import { LINKS, openPage } from '@/lib/links';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/track';

export default function AccountScreen() {
  const t = useTheme();
  const { session, signOut, resetOnboarding } = useAuth();
  const [busy, setBusy] = useState(false);
  const isAdmin = useIsAdmin();

  const confirmDelete = () =>
    Alert.alert('Delete your account?', 'Your saved routes and transfers go with it.', [
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
            {session ? (session.user.email ?? 'Signed in with Apple') : 'Save the receipts you check.'}
          </AppText>
        </HeroHeader>
        <View style={[styles.content, { backgroundColor: t.background }]}>
        {session ? (
          <>
            <SavedChecks />
            {isAdmin ? <Button label="Add a price" onPress={() => router.push('/admin')} /> : null}
            <Button label="Sign out" variant="secondary" onPress={signOut} />
            <Button label="Delete account" variant="plain" loading={busy} onPress={confirmDelete} />
          </>
        ) : (
          <Button label="Create account" onPress={() => router.push('/sign-in')} />
        )}
        <View style={styles.links}>
          <Button label="Privacy policy" variant="plain" onPress={() => openPage(LINKS.privacy)} />
          <Button label="Support" variant="plain" onPress={() => openPage(LINKS.support)} />
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  links: { marginTop: Spacing.four },
  content: { flexGrow: 1, padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
});
