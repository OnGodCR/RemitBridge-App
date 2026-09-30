import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { AppText, Button, Card, Segmented } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  arithmeticCheck,
  fetchProviders,
  fetchRecentEntries,
  savePrice,
  type EntryStatus,
  type Provider,
  type SavedEntry,
} from '@/lib/admin';
import { checkedAgo, money } from '@/lib/format';
import { AMOUNTS, DELIVERY_LABELS, ROUTES, type DeliveryMethod } from '@/lib/routes';
import { track } from '@/lib/track';
import { EnglishOnly } from '@/i18n';

/**
 * Add a price (DECISIONS.md D52, D54). Read one quote off a provider's public calculator
 * and enter it exactly as shown. Saving doesn't publish anything: the engine checks the
 * entry with the same gate as every other quote, and the result shows under "Recent".
 */

const STATUS_LABEL: Record<EntryStatus, string> = {
  pending: 'Waiting to be checked',
  published: 'Passed, now shown',
  quarantined: 'Held for review',
  rejected: 'Rejected',
  skipped: 'Too old to check',
};

function cleanNumber(text: string, decimals: number): string {
  const [whole, ...rest] = text.replace(/[^\d.]/g, '').split('.');
  const trimmed = whole.replace(/^0+(?=\d)/, '');
  return rest.length ? `${trimmed}.${rest.join('').slice(0, decimals)}` : trimmed;
}

function AddPriceScreen() {
  const t = useTheme();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const [amount, setAmount] = useState<number>(500);
  const [method, setMethod] = useState<DeliveryMethod>(route.deliveryMethods[0]);
  const activeMethod = route.deliveryMethods.includes(method) ? method : route.deliveryMethods[0];
  const [fee, setFee] = useState('');
  const [rate, setRate] = useState('');
  const [received, setReceived] = useState('');
  const [pickup, setPickup] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [promo, setPromo] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [recent, setRecent] = useState<SavedEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const provider = providers.find((p) => p.id === providerId) ?? null;
  const names = Object.fromEntries(providers.map((p) => [p.id, p.name]));

  useEffect(() => {
    let live = true;
    fetchProviders().then((list) => {
      if (live) setProviders(list);
    });
    return () => {
      live = false;
    };
  }, []);

  const loadRecent = useCallback(async () => {
    setRecent(await fetchRecentEntries());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecent();
    }, [loadRecent]),
  );

  const numbers = {
    send_amount: amount,
    fee: Number(fee),
    offered_rate: Number(rate),
    amount_received: Number(received),
    pickup_charge: activeMethod === 'cash_pickup' ? Number(pickup) || 0 : 0,
  };
  const complete = !!provider && fee !== '' && numbers.offered_rate > 0 && numbers.amount_received > 0;
  const check = complete ? arithmeticCheck(numbers) : null;
  const url = sourceUrl.trim() || provider?.website || '';

  const reset = () => {
    setFee('');
    setRate('');
    setReceived('');
    setPickup('');
    setDeliveryTime('');
    setPromo('');
  };

  const save = async () => {
    if (!provider || !complete) return;
    setSaving(true);
    setMessage(null);
    const { error, dispatched } = await savePrice({
      provider_id: provider.id,
      route_id: route.id,
      delivery_method: activeMethod,
      ...numbers,
      delivery_time: deliveryTime.trim() || null,
      promo_text: promo.trim() || null,
      source_url: url,
    });
    setSaving(false);
    if (error) {
      setMessage({ tone: 'error', text: error });
      return;
    }
    track('price_entered', { provider: provider.id, route: route.id, amount });
    setMessage({
      tone: 'ok',
      text: dispatched ? 'Saved. Checking now.' : 'Saved. It’s checked within 3 hours.',
    });
    reset();
    loadRecent();
  };

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      {/* The tabs' green header sets a light status bar; this screen is light. */}
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        // Number pads have no return key, so a scroll puts the keyboard away.
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadRecent();
              setRefreshing(false);
            }}
          />
        }>
        <AppText muted>Enter one quote exactly as the provider’s site shows it.</AppText>

        <Section title="Provider">
          <Card style={styles.list}>
            {providers.map((p, i) => {
              const selected = p.id === providerId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setProviderId(p.id);
                    setSourceUrl('');
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.row,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                    { backgroundColor: pressed ? t.muted : 'transparent' },
                  ]}>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: selected ? t.primary : t.border },
                    ]}>
                    {selected ? <View style={[styles.radioDot, { backgroundColor: t.primary }]} /> : null}
                  </View>
                  <AppText variant="label" style={styles.rowText}>
                    {p.name}
                  </AppText>
                </Pressable>
              );
            })}
          </Card>
        </Section>

        <Section title="Route">
          <Segmented
            options={ROUTES.map((r) => ({ value: r.id, label: r.receiveCurrency }))}
            value={route.id}
            onChange={setRouteId}
          />
        </Section>

        <Section title="Amount sent">
          <Segmented
            options={AMOUNTS.map((a) => ({ value: String(a), label: `$${a.toLocaleString('en-US')}` }))}
            value={String(amount)}
            onChange={(v) => setAmount(Number(v))}
          />
        </Section>

        <Section title="Delivery">
          <Segmented
            options={route.deliveryMethods.map((m) => ({ value: m, label: DELIVERY_LABELS[m] }))}
            value={activeMethod}
            onChange={setMethod}
          />
        </Section>

        <Section title="What the site shows">
          <Card>
            <Field label="Fee" unit={route.sendCurrency} value={fee} onChange={(v) => setFee(cleanNumber(v, 2))} />
            <Field
              label={`Rate (1 ${route.sendCurrency} =)`}
              unit={route.receiveCurrency}
              value={rate}
              onChange={(v) => setRate(cleanNumber(v, 6))}
            />
            <Field
              label="Recipient gets"
              unit={route.receiveCurrency}
              value={received}
              onChange={(v) => setReceived(cleanNumber(v, 2))}
            />
            {activeMethod === 'cash_pickup' ? (
              <Field
                label="Pickup charge"
                unit={route.receiveCurrency}
                value={pickup}
                onChange={(v) => setPickup(cleanNumber(v, 2))}
              />
            ) : null}
            <Field
              label="Delivery time"
              placeholder="Optional"
              value={deliveryTime}
              onChange={setDeliveryTime}
              keyboardType="default"
            />
            <Field
              label="Promo text"
              placeholder="Only if labeled a promo"
              value={promo}
              onChange={setPromo}
              keyboardType="default"
            />
            <Field
              label="Page"
              placeholder={provider?.website ?? 'The calculator’s address'}
              value={sourceUrl}
              onChange={setSourceUrl}
              keyboardType="url"
              last
            />
          </Card>
        </Section>

        {check ? (
          <View
            style={[
              styles.check,
              { backgroundColor: check.ok ? t.accent : t.muted, borderLeftColor: check.ok ? t.primary : t.moneyMarkup },
            ]}>
            <AppText variant="label" style={{ color: check.ok ? t.accentForeground : t.text }}>
              {check.ok ? 'The numbers add up.' : 'The numbers don’t add up.'}
            </AppText>
            {check.ok ? null : (
              <AppText variant="small" muted>
                Fee and rate give {money(check.expected, route.receiveCurrency)}. Check each number, or save
                anyway and the gate will reject it.
              </AppText>
            )}
          </View>
        ) : null}

        {message ? (
          <AppText
            variant="label"
            accessibilityLiveRegion="polite"
            style={{ color: message.tone === 'ok' ? t.primary : t.destructive }}>
            {message.text}
          </AppText>
        ) : null}

        <Button label="Save price" onPress={save} disabled={!complete} loading={saving} />

        <Section title="Recent">
          {recent.length === 0 ? (
            <AppText muted>Nothing entered yet.</AppText>
          ) : (
            <Card style={styles.list}>
              {recent.map((e, i) => (
                <RecentRow key={e.id} entry={e} name={names[e.provider_id] ?? e.provider_id} first={i === 0} />
              ))}
            </Card>
          )}
        </Section>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="label" muted>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function Field({
  label,
  unit,
  value,
  onChange,
  placeholder = '0',
  keyboardType = 'decimal-pad',
  last,
}: {
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.field,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border },
      ]}>
      <AppText variant="label" style={styles.fieldLabel}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={unit ? `${label}, in ${unit}` : label}
        style={[styles.fieldInput, { color: t.text }]}
      />
      {unit ? (
        <AppText variant="small" muted style={styles.unit}>
          {unit}
        </AppText>
      ) : null}
    </View>
  );
}

function RecentRow({ entry, name, first }: { entry: SavedEntry; name: string; first: boolean }) {
  const t = useTheme();
  const route = ROUTES.find((r) => r.id === entry.route_id);
  const tone =
    entry.status === 'published'
      ? t.primary
      : entry.status === 'rejected'
        ? t.destructive
        : entry.status === 'quarantined'
          ? t.moneyMarkupText
          : t.textSecondary;
  return (
    <View
      style={[
        styles.recent,
        !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
      ]}>
      <View style={styles.recentTop}>
        <AppText variant="label" style={styles.rowText}>
          {name} · {route?.receiveCurrency ?? entry.route_id} · {money(entry.send_amount, 'USD')}
        </AppText>
        <AppText variant="small" muted>
          {checkedAgo(entry.observed_at).replace('Checked', 'Entered')}
        </AppText>
      </View>
      <AppText variant="small" style={{ color: tone }}>
        {STATUS_LABEL[entry.status]}
      </AppText>
      {entry.result_notes.length ? (
        <AppText variant="small" muted>
          {entry.result_notes.join(' ')}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  section: { gap: Spacing.two },
  list: { padding: 0, gap: 0 },
  row: {
    minHeight: MinTapTarget + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  rowText: { flex: 1, fontSize: 15 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  field: {
    minHeight: MinTapTarget + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  fieldLabel: { width: 120 },
  fieldInput: { flex: 1, fontFamily: Fonts.medium, fontSize: 16, paddingVertical: Spacing.two, textAlign: 'right' },
  unit: { width: 34 },
  check: {
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  recent: { padding: Spacing.three, gap: Spacing.one },
  recentTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});

/** Admin-only, so English whatever the app's language (DECISIONS.md D69). */
export default function AddPriceScreenRoute() {
  return (
    <EnglishOnly>
      <AddPriceScreen />
    </EnglishOnly>
  );
}
