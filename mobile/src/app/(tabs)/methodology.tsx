import { Linking, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CONTACT = 'remitbridgesystemlabs@gmail.com';

/**
 * Methodology (PRD 5.4), kept to one line per point. The spot-check accuracy figure and
 * the update schedule join this screen once the engine has produced them; until then it
 * says nothing it can't back up.
 */
export default function MethodologyScreen() {
  const t = useTheme();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">How it works</AppText>

        <Point title="Fee + hidden markup">
          Total cost is the fee plus the markup hidden in the exchange rate.
        </Point>
        <Point title="Checked prices only">
          Every price passes our checks, or it isn’t shown. Mid-market rates from Frankfurter.
        </Point>
        <Point title="No affiliate deals">
          Nobody pays to rank. We never touch your money.
        </Point>
        <Point title="Wrong price?">
          <AppText
            style={{ color: t.primary }}
            accessibilityRole="link"
            onPress={() => Linking.openURL(`mailto:${CONTACT}`)}>
            {CONTACT}
          </AppText>
        </Point>
      </ScrollView>
    </SafeAreaView>
  );
}

function Point({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <AppText variant="heading">{title}</AppText>
      <AppText muted>{children}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
});
