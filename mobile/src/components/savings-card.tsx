import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { money } from '@/lib/format';
import { savingsSummary, type SavingsSummary } from '@/lib/savings';

/**
 * The savings counter (D149): "what you could have kept", added up across every receipt
 * scanned on this phone. Drawn like the receipt result's own kept box (mint, green edge,
 * D124), so the two read as the same figure. Hidden until a receipt has been compared.
 */
export function SavingsCard() {
  const t = useTheme();
  const copy = useCopy();
  // Read as the start step mounts. Only Scan changes the total (a scan or a deletion), and
  // the start step mounts fresh after either, so it's never stale when it shows.
  const [summary] = useState<SavingsSummary>(() => savingsSummary());
  if (summary.count === 0) return null;
  return (
    <View style={[styles.card, { backgroundColor: t.accent, borderLeftColor: t.primary }]} accessible>
      <AppText variant="label" style={{ color: t.accentForeground }}>
        {copy.result.keptTitle}
      </AppText>
      {summary.total > 0 ? (
        <>
          <AppText style={[styles.value, { color: t.primary }]}>{money(summary.total, 'USD')}</AppText>
          <AppText style={{ color: t.accentForeground }}>{copy.scan.savingsAcross(summary.count)}</AppText>
        </>
      ) : (
        <AppText style={{ color: t.accentForeground }}>{copy.scan.savingsNone(summary.count)}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 4, borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  value: { fontFamily: Fonts.extrabold, fontSize: 34, lineHeight: 40, fontVariant: ['tabular-nums'] },
});
