import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/track';

export default function AccountScreen() {
  const t = useTheme();
  const { session, signOut, resetOnboarding } = useAuth();
  const [busy, setBusy] = useState(false);

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
    <SafeAreaView style={[styles.fill, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">Account</AppText>
        {session ? (
          <>
            <Card>
              <AppText variant="small" muted>
                Signed in as
              </AppText>
              <AppText variant="heading">{session.user.email ?? 'Apple ID'}</AppText>
            </Card>
            <Button label="Sign out" variant="secondary" onPress={signOut} />
            <Button label="Delete account" variant="plain" loading={busy} onPress={confirmDelete} />
          </>
        ) : (
          <>
            <AppText muted>Save your routes and past transfers.</AppText>
            <Button label="Create account" onPress={() => router.push('/sign-in')} />
          </>
        )}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
});
