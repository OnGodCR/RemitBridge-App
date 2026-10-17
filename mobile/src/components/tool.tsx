import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type LayoutChangeEvent,
} from 'react-native';

import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * The frame every tool screen shares (DECISIONS.md D58): a native header from the tools
 * stack, the tool's drawing (D103) beside one short line saying what it does, then the inputs and the answer. The
 * keyboard gets out of the way on scroll, since number pads have no return key.
 */
export function ToolScreen({ intro, art, children }: { intro: string; art?: ReactNode; children: ReactNode }) {
  const t = useTheme();
  const gutter = useGutter();
  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: t.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic">
        {art ? (
          <View style={styles.lead}>
            <View accessible={false} importantForAccessibility="no-hide-descendants">
              {art}
            </View>
            <AppText muted style={styles.leadText}>
              {intro}
            </AppText>
          </View>
        ) : (
          <AppText muted>{intro}</AppText>
        )}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="label" muted>
        {title}
      </AppText>
      {children}
    </View>
  );
}

/** Digits and at most one decimal point, with up to `decimals` places. */
export function cleanNumber(text: string, decimals = 2): string {
  const [whole, ...rest] = text.replace(/[^\d.]/g, '').split('.');
  const trimmed = whole.replace(/^0+(?=\d)/, '');
  return rest.length ? `${trimmed}.${rest.join('').slice(0, decimals)}` : trimmed;
}

/** A labeled row inside a card: label on the left, value typed on the right, unit after. */
export function Field({
  label,
  hint,
  unit,
  value,
  onChange,
  placeholder = '0',
  keyboardType = 'decimal-pad',
  decimals = 2,
  last,
}: {
  label: string;
  hint?: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  decimals?: number;
  last?: boolean;
}) {
  const t = useTheme();
  const copy = useCopy();
  const numeric = keyboardType === 'decimal-pad' || keyboardType === 'number-pad';
  return (
    <View
      style={[styles.field, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border }]}>
      <View style={styles.fieldText}>
        <AppText variant="label">{label}</AppText>
        {hint ? (
          <AppText variant="small" muted>
            {hint}
          </AppText>
        ) : null}
      </View>
      <TextInput
        value={value}
        onChangeText={(v) => onChange(numeric ? cleanNumber(v, decimals) : v)}
        placeholder={placeholder}
        placeholderTextColor={t.textSecondary}
        keyboardType={keyboardType}
        selectTextOnFocus
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={unit ? copy.tool.inUnit(label, unit) : label}
        maxFontSizeMultiplier={2}
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

/** A card of fields. */
export function Fields({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={[styles.fields, { backgroundColor: t.card, borderColor: t.border }]}>{children}</View>;
}

/**
 * The answer, in the brand band: the one number the tool exists to show, big, with a line
 * of context. Supporting lines go below in a `Breakdown`.
 */
export function Answer({ label, value, note }: { label: string; value: string; note?: string }) {
  const t = useTheme();
  return (
    <View style={[styles.answer, { backgroundColor: t.hero }]} accessible accessibilityLiveRegion="polite">
      <AppText variant="label" style={{ color: t.heroMuted }}>
        {label}
      </AppText>
      <AppText style={[styles.answerValue, { color: t.heroText }]}>{value}</AppText>
      {note ? (
        <AppText variant="small" style={{ color: t.heroMuted }}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

export function Breakdown({ rows }: { rows: { label: string; value: string; strong?: boolean; tone?: string }[] }) {
  const t = useTheme();
  return (
    <View style={[styles.fields, { backgroundColor: t.card, borderColor: t.border }]}>
      {rows.map((r, i) => (
        <View
          key={r.label}
          style={[
            styles.line,
            i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border },
          ]}>
          <View style={styles.lineLabel}>
            {r.tone ? <View style={[styles.swatch, { backgroundColor: r.tone }]} /> : null}
            <AppText variant={r.strong ? 'label' : 'body'} style={styles.flex}>
              {r.label}
            </AppText>
          </View>
          <AppText variant="label" style={styles.lineValue}>
            {r.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** Where a figure came from, under the result (PRD 14.3: every figure names its source). */
export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <AppText variant="small" muted>
      {children}
    </AppText>
  );
}

/**
 * A slider, drawn with plain views and the view's own touch handlers, so the app takes no
 * extra native dependency. Screen readers get it as an adjustable control that steps up
 * and down.
 */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  format,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label: string;
  format: (v: number) => string;
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);

  const clamp = (v: number) => {
    const snapped = Math.round((v - min) / step) * step + min;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(4))));
  };
  const set = (x: number) => onChange(clamp(min + (x / Math.max(1, width)) * (max - min)));

  const pct = (value - min) / (max - min);
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: format(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(clamp(value + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => set(e.nativeEvent.locationX)}
      onResponderMove={(e) => set(e.nativeEvent.locationX)}
      style={styles.slider}>
      <View pointerEvents="none" style={[styles.track, { backgroundColor: t.border }]}>
        <View style={[styles.trackFill, { width: pct * width, backgroundColor: t.primary }]} />
      </View>
      <View
        pointerEvents="none"
        style={[styles.thumb, { left: pct * width - THUMB / 2, backgroundColor: t.card, borderColor: t.primary }]}
      />
    </View>
  );
}

const THUMB = 26;

const styles = StyleSheet.create({
  lead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  leadText: { flex: 1 },
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  section: { gap: Spacing.two },
  fields: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
  },
  field: { minHeight: MinTapTarget + 8, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fieldText: { flexShrink: 1, gap: 1, paddingVertical: Spacing.two, maxWidth: '58%' },
  fieldInput: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 17,
    paddingVertical: Spacing.two,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  unit: { minWidth: 32 },
  answer: { borderRadius: Radius.lg, padding: Spacing.four, gap: Spacing.one },
  answerValue: {
    fontFamily: Fonts.extrabold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  line: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  lineLabel: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  lineValue: { fontSize: 15, fontVariant: ['tabular-nums'] },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  slider: { height: MinTapTarget, justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  trackFill: { height: 6 },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    top: (MinTapTarget - THUMB) / 2,
  },
});
