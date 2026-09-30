import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TEMPLATES } from '@remitbridge/receipt';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { Answer, Breakdown, Section, SourceNote, ToolScreen } from '@/components/tool';
import { AppText, TextLink } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { countryIn, useCopy, useLanguage } from '@/i18n';
import { pct } from '@/lib/format';
import { fetchObservatory, type Observatory } from '@/lib/observatory';
import { ROUTES } from '@/lib/routes';
import { track } from '@/lib/track';

/**
 * The receipt observatory (Phase 6, DECISIONS.md D96): what people really paid, from
 * receipts they chose to share for research. Early results, so the sample size comes first
 * and every group needs five receipts before it shows.
 */
export default function ObservatoryScreen() {
  const copy = useCopy();
  const { language } = useLanguage();
  const o = copy.observatory;
  const [data, setData] = useState<Observatory | 'error' | null>(null);

  const load = useCallback(async () => {
    setData(null);
    setData((await fetchObservatory()) ?? 'error');
  }, []);

  useFocusEffect(
    useCallback(() => {
      track('learn_opened', { page: 'observatory' });
      load();
    }, [load]),
  );

  const providerName = (id: string) => TEMPLATES.find((t) => t.providerId === id)?.name ?? id;
  const routeName = (id: string) => {
    const route = ROUTES.find((r) => r.id === id);
    const [from, to] = id.toUpperCase().split('-');
    return route ? `${countryIn(copy, from)} → ${countryIn(copy, to)}` : id;
  };
  const month = (ym: string) =>
    new Date(`${ym}-01T12:00:00Z`).toLocaleString(language.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <ToolScreen intro={o.intro}>
      {data === null ? (
        <ActivityIndicator accessibilityLabel={o.early} />
      ) : data === 'error' ? (
        <View style={styles.gap}>
          <AppText muted>{o.loadFailed}</AppText>
          <TextLink label={copy.common.tryAgain} onPress={load} />
        </View>
      ) : (
        <>
          {/* The sample size, first and large: these are early results. */}
          <Answer label={o.early} value={o.sample(data.receipts, data.since ? month(data.since) : null)} />
          {data.receipts < data.min_group ? (
            <AppText>{o.tooFew(data.min_group)}</AppText>
          ) : (
            <>
              <Section title={o.groupsTitle}>
                {data.groups.length ? (
                  data.groups.map((g) => (
                    <View key={`${g.provider_id}-${g.route_id}`} style={styles.gap}>
                      <AppText variant="label">
                        {providerName(g.provider_id)} · {routeName(g.route_id)} · {o.receipts(g.receipts)}
                      </AppText>
                      <Breakdown
                        rows={[
                          ...(g.median_total_cost_pct !== null ? [{ label: o.medianCost, value: pct(Number(g.median_total_cost_pct), 2), strong: true }] : []),
                          ...(g.median_markup_pct !== null ? [{ label: o.medianMarkup, value: pct(Number(g.median_markup_pct), 2) }] : []),
                        ]}
                      />
                      {g.compared ? (
                        <AppText variant="small" muted>
                          {o.paidMore(g.paid_more_than_advertised, g.compared)}
                        </AppText>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <AppText muted>{o.noGroups(data.min_group)}</AppText>
                )}
              </Section>

              {data.tax && data.tax.taxed ? (
                <Section title={o.taxTitle}>
                  <AppText>{o.taxLine(data.tax.taxed, data.tax.matches, data.tax.not_found)}</AppText>
                </Section>
              ) : null}

              <Section title={o.disclosuresTitle}>
                {Object.keys(data.disclosures_missing).length ? (
                  Object.entries(data.disclosures_missing)
                    .sort((a, b) => b[1] - a[1])
                    .map(([item, n]) => (
                      <AppText key={item}>{o.disclosureLine(copy.result.disclosureItems[item] ?? item, n, data.receipts)}</AppText>
                    ))
                ) : (
                  <AppText muted>{o.noneMissing}</AppText>
                )}
                <AppText variant="small" muted>
                  {copy.result.disclosuresNote}
                </AppText>
              </Section>
            </>
          )}
          <SourceNote>{o.method(data.min_group)}</SourceNote>
        </>
      )}
      <DoesNotTellYou items={o.limits} />
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: Spacing.two },
});
