import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { RouteNotCovered } from '@/components/route-request';
import { CountrySelect } from '@/components/select-field';
import { AppText, Button } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { countryName, RECEIVING, SENDING } from '@/lib/countries';
import { openCompare } from '@/lib/open-compare';
import { ROUTES, routeFor } from '@/lib/routes';

/**
 * Ask for a route from the board (PRD 6.7): the two countries, then the same request form
 * Compare shows for a route it doesn't cover. Picking a route we already check says so and
 * offers Compare instead, so nobody files a request for something that's there.
 */
export default function RequestRoute() {
  const t = useTheme();
  const [from, setFrom] = useState('US');
  const [to, setTo] = useState('NP');
  const covered = routeFor(from, to);

  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: t.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic">
        <StatusBar style="auto" />
        <View style={styles.pair}>
          <CountrySelect
            label="From"
            title="Send from"
            tone="plain"
            value={from}
            options={SENDING}
            covered={(code) => ROUTES.some((r) => r.id.startsWith(`${code.toLowerCase()}-`))}
            onChange={setFrom}
          />
          <CountrySelect
            label="To"
            title="Send to"
            tone="plain"
            value={to}
            options={RECEIVING}
            covered={(code) => !!routeFor(from, code)}
            onChange={setTo}
          />
        </View>
        {covered ? (
          <View style={styles.covered}>
            <AppText style={[styles.title, { color: t.text }]}>
              We already check {countryName(from)} to {countryName(to)}.
            </AppText>
            <Button
              label="Compare it"
              trailingIcon="arrow.right"
              onPress={() => openCompare({ routeId: covered.id })}
            />
          </View>
        ) : (
          <RouteNotCovered from={from} to={to} boardLink={false} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.five, paddingBottom: Spacing.six },
  pair: { flexDirection: 'row', gap: Spacing.two },
  covered: { gap: Spacing.three },
  title: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 26 },
});
