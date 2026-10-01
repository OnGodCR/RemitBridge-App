import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SavedArt } from '@/components/illustrations';
import { RateAlerts } from '@/components/rate-alerts';
import { SavedChecks } from '@/components/saved-checks';
import { SavedComparisons } from '@/components/saved-comparisons';
import { AppText, Button } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { useAuth } from '@/lib/auth';

/**
 * Everything saved, in one place (DECISIONS.md D108, D113): rate alerts and comparisons
 * from Compare, and receipt checks from TrueCost. Reached from Tools, from Compare's save link and from Account, so
 * it isn't buried at the bottom of Account. Saving needs an account (D19), so signed out
 * it says so and offers to sign in.
 */
export default function SavedScreen() {
  const t = useTheme();
  const copy = useCopy();
  const { session } = useAuth();
  return (
    <ScrollView style={{ backgroundColor: t.background }} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <StatusBar style="auto" />
      {session ? (
        <>
          <RateAlerts />
          <SavedComparisons />
          <SavedChecks />
        </>
      ) : (
        <View style={styles.signedOut}>
          <SavedArt size={96} />
          <AppText style={[styles.center, { color: t.text }]}>{copy.saved.signedOut}</AppText>
          <Button label={copy.account.createOrSignIn} onPress={() => router.push('/sign-in')} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.five, paddingBottom: Spacing.six },
  signedOut: { alignItems: 'center', gap: Spacing.four, paddingTop: Spacing.five },
  center: { textAlign: 'center' },
});
