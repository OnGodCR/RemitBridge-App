import { Linking, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CONTACT = 'remitbridgesystemlabs@gmail.com';

/**
 * Methodology (PRD 5.4). Plain words, short sentences, and say what the numbers can't do.
 * The spot-check accuracy figure and the update schedule join this screen once the engine
 * has produced them; until then it says nothing it can't back up.
 */
export default function MethodologyScreen() {
  const t = useTheme();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">How it works</AppText>

        <Card>
          <AppText variant="heading">What a transfer really costs</AppText>
          <AppText muted>
            A transfer costs you in two places: the fee on the receipt, and the exchange-rate
            markup inside the rate. The markup is the gap between the rate you’re offered and
            the mid-market rate. The fee is usually the smaller part.
          </AppText>
          <AppText muted>
            Total cost adds the fee, the markup and any pickup charge, as a share of the amount
            you send. The fee comes off first, so the markup applies only to what is actually
            converted. This is the same method as TrueCost on remitbridgelabs.org.
          </AppText>
        </Card>

        <Card>
          <AppText variant="heading">Where the prices come from</AppText>
          <AppText muted>
            Every price comes from a provider’s public pricing, and each card says where and
            when it was checked. The mid-market rate comes from Frankfurter and is
            cross-checked against a second source. If they disagree, no price for that
            currency is shown.
          </AppText>
          <AppText muted>
            A price is shown only after it passes every check: the arithmetic adds up, it’s
            in a plausible range, and it hasn’t jumped without reason. A missing price is
            better than a wrong one. Prices older than 24 hours are marked stale, and after 48
            hours they’re removed.
          </AppText>
        </Card>

        <Card>
          <AppText variant="heading">No affiliate deals</AppText>
          <AppText muted>
            RemitBridge is free and non-commercial. No provider pays to be listed or ranked,
            and there are no affiliate links. Results are ranked by the amount received and
            nothing else. RemitBridge never holds or sends money.
          </AppText>
        </Card>

        <Card>
          <AppText variant="heading">Something looks wrong?</AppText>
          <AppText muted>
            If you’re a sender or a provider and a price looks wrong, write to{' '}
            <AppText
              style={{ color: t.primary }}
              accessibilityRole="link"
              onPress={() => Linking.openURL(`mailto:${CONTACT}`)}>
              {CONTACT}
            </AppText>
            .
          </AppText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
});
