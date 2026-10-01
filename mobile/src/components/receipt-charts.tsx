import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { GrowBar, GrowIn } from '@/components/motion-views';
import { AppText } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The receipt result's charts (D126): each says one thing a sentence used to, so the screen
 * reads at a glance. Every chart carries an accessibility label with the same facts in
 * words, for VoiceOver.
 */

/** A chart's container width, measured, for the charts that place things along a scale. */
function useWidth() {
  const [width, setWidth] = useState(0);
  return { width, onLayout: (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width) };
}

/** Where a value sits on a 0-to-max track, clamped so labels stay on screen. */
const at = (value: number, max: number, width: number) => Math.max(0, Math.min(width, (value / max) * width));

/**
 * The cost as a share of what was sent, on a scale with the UN target and the world average
 * marked: one look says whether this was cheap, typical or dear.
 */
export function CostScale({
  you,
  world,
  target,
  labels,
  label,
}: {
  you: number;
  world: number;
  target: number;
  labels: { you: string; world: string; target: string };
  label: string;
}) {
  const t = useTheme();
  const { width, onLayout } = useWidth();
  const max = Math.max(you, world, target) * 1.25;
  const tick = (value: number, text: string, above: boolean, color: string, strong = false) => {
    const x = at(value, max, width);
    const left = Math.max(0, Math.min(width - 96, x - 48));
    return (
      <View key={text} pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* The receipt's own mark is the dot, so it gets no tick. */}
        {above ? null : <View style={[styles.tick, { left: x - 1, backgroundColor: color, top: 22, height: 12 }]} />}
        <View style={[styles.tickLabel, { left, top: above ? 0 : 44 }]}>
          <AppText variant="small" numberOfLines={1} style={{ color, fontFamily: strong ? Fonts.bold : Fonts.medium, textAlign: 'center' }}>
            {text}
          </AppText>
        </View>
      </View>
    );
  };
  return (
    <View accessible accessibilityLabel={label} onLayout={onLayout} style={styles.scale}>
      {width > 0 ? (
        <>
          <View style={[styles.scaleTrack, { backgroundColor: t.muted }]}>
            {/* Up to the UN target is the good zone. */}
            <View style={{ width: at(target, max, width), height: '100%', backgroundColor: t.accent }} />
          </View>
          {tick(target, labels.target, false, t.primary)}
          {tick(world, labels.world, false, t.textSecondary)}
          {/* The receipt itself: a dot on the track, labelled above. */}
          <View style={[styles.dot, { left: at(you, max, width) - 9, backgroundColor: you <= target ? t.primary : t.text, borderColor: t.card }]} />
          {tick(you, labels.you, true, t.text, true)}
        </>
      ) : null}
    </View>
  );
}

export type Part = { key: string; label: string; amount: number; display: string; color: string };

/** The cost split into its parts, as one bar, with each part's amount beneath. */
export function SplitBar({ parts, label }: { parts: Part[]; label: string }) {
  const t = useTheme();
  const shown = parts.filter((p) => p.amount > 0);
  return (
    <View accessible accessibilityLabel={label} style={styles.split}>
      <View style={[styles.splitTrack, { backgroundColor: t.muted }]}>
        <GrowIn style={styles.splitParts}>
          {shown.map((p) => (
            <View key={p.key} style={{ flex: p.amount, backgroundColor: p.color }} />
          ))}
        </GrowIn>
      </View>
      <View style={styles.legend}>
        {shown.map((p) => (
          <View key={p.key} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: p.color }]} />
            <AppText style={[styles.legendLabel, { color: t.text }]}>{p.label}</AppText>
            <AppText style={[styles.legendValue, { color: t.text }]}>{p.display}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * What could have arrived (the whole bar) and what did (the filled part): the empty end is
 * what the fee, the rate and the rest took.
 */
export function ArrivedBar({
  got,
  possible,
  gotText,
  lostText,
  label,
}: {
  got: number;
  possible: number;
  gotText: string;
  lostText: string;
  label: string;
}) {
  const t = useTheme();
  const share = possible > 0 ? Math.max(0, Math.min(1, got / possible)) : 0;
  return (
    <View accessible accessibilityLabel={label} style={styles.arrived}>
      <View style={[styles.arrivedTrack, { backgroundColor: t.moneyMarkup, opacity: 1 }]}>
        <GrowBar fraction={share} style={[styles.arrivedFill, { backgroundColor: t.moneyReceived }]} />
      </View>
      <View style={styles.arrivedText}>
        <AppText style={{ color: t.text, fontFamily: Fonts.semibold, flexShrink: 1 }}>{gotText}</AppText>
        <AppText variant="small" style={{ color: t.moneyMarkupText, fontFamily: Fonts.semibold, textAlign: 'right', flexShrink: 1 }}>
          {lostText}
        </AppText>
      </View>
    </View>
  );
}

/** Two or more amounts as bars on one scale, longest first is the most. */
export function CompareBars({ rows, label }: { rows: { key: string; name: string; value: number; display: string; color: string; strong?: boolean }[]; label: string }) {
  const t = useTheme();
  const max = Math.max(...rows.map((r) => r.value), 0.0001);
  return (
    <View accessible accessibilityLabel={label} style={styles.bars}>
      {rows.map((r, i) => (
        <View key={r.key} style={styles.barRow}>
          <View style={styles.barHead}>
            <AppText style={{ color: t.text, fontFamily: r.strong ? Fonts.bold : Fonts.medium }}>{r.name}</AppText>
            <AppText style={{ color: t.text, fontFamily: Fonts.bold, fontVariant: ['tabular-nums'] }}>{r.display}</AppText>
          </View>
          <View style={[styles.barTrack, { backgroundColor: t.muted }]}>
            <GrowBar fraction={r.value / max} delay={i * 120} style={[styles.barFill, { backgroundColor: r.color }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Exchange rates on one line: the mid-market rate, the provider's advertised rate and the
 * receipt's, so the gaps between them show as distances. Labels alternate above and below,
 * since rates a hair apart would overlap.
 */
export function RateLine({ points, label }: { points: { key: string; name: string; value: number; display: string; color: string; strong?: boolean }[]; label: string }) {
  const t = useTheme();
  const { width, onLayout } = useWidth();
  const values = points.map((p) => p.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = (hi - lo || hi * 0.01) * 0.35;
  const min = lo - pad;
  const span = hi + pad - min;
  const sorted = [...points].sort((a, b) => a.value - b.value);
  return (
    <View accessible accessibilityLabel={label} onLayout={onLayout} style={styles.rate}>
      {width > 0 ? (
        <>
          <View style={[styles.rateTrack, { backgroundColor: t.border }]} />
          {sorted.map((p, i) => {
            const x = ((p.value - min) / span) * width;
            const above = i % 2 === 0;
            const left = Math.max(0, Math.min(width - 150, x - 75));
            return (
              <View key={p.key} pointerEvents="none" style={StyleSheet.absoluteFill}>
                <View style={[styles.rateDot, { left: x - 8, backgroundColor: p.color, borderColor: t.card }]} />
                <View style={[styles.rateLabel, above ? styles.rateAbove : styles.rateBelow, { left }]}>
                  <AppText variant="small" numberOfLines={2} style={{ color: t.textSecondary, textAlign: 'center' }}>
                    {p.name}
                  </AppText>
                  <AppText numberOfLines={1} style={{ color: p.strong ? t.text : t.textSecondary, fontFamily: p.strong ? Fonts.bold : Fonts.semibold, textAlign: 'center', fontVariant: ['tabular-nums'] }}>
                    {p.display}
                  </AppText>
                </View>
              </View>
            );
          })}
        </>
      ) : null}
    </View>
  );
}

/** One line with a status icon: a check, a warning, or a neutral mark. */
export function StatusLine({ tone, text }: { tone: 'good' | 'warn' | 'neutral'; text: string }) {
  const t = useTheme();
  const icon: SFSymbol = tone === 'good' ? 'checkmark.circle.fill' : tone === 'warn' ? 'exclamationmark.circle.fill' : 'minus.circle.fill';
  // Never red for a cost or a mismatch: red is for real errors only (theme.ts).
  const color = tone === 'good' ? t.primary : tone === 'warn' ? t.text : t.textSecondary;
  return (
    <View style={styles.status}>
      <SymbolView name={icon} size={22} tintColor={color} fallback={null} />
      <AppText style={[styles.statusText, { color: t.text }]}>{text}</AppText>
    </View>
  );
}

/** Small labelled chips, for a list of things (the disclosures not found). */
export function Chips({ items, icon }: { items: string[]; icon: SFSymbol }) {
  const t = useTheme();
  return (
    <View style={styles.chips}>
      {items.map((x) => (
        <View key={x} style={[styles.chip, { backgroundColor: t.muted, borderColor: t.border }]}>
          <SymbolView name={icon} size={12} weight="bold" tintColor={t.textSecondary} fallback={null} />
          <AppText variant="small" style={{ color: t.text }}>
            {x}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scale: { height: 66, marginTop: Spacing.one },
  scaleTrack: { position: 'absolute', top: 24, left: 0, right: 0, height: 8, borderRadius: 4, overflow: 'hidden' },
  tick: { position: 'absolute', width: 2, borderRadius: 1 },
  tickLabel: { position: 'absolute', width: 96 },
  dot: { position: 'absolute', top: 19, width: 18, height: 18, borderRadius: 9, borderWidth: 3 },
  split: { gap: Spacing.three },
  splitTrack: { height: 22, borderRadius: Radius.sm, overflow: 'hidden' },
  splitParts: { flex: 1, flexDirection: 'row', gap: 2 },
  legend: { gap: Spacing.two },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  legendLabel: { flex: 1 },
  legendValue: { fontFamily: Fonts.bold, fontVariant: ['tabular-nums'] },
  arrived: { gap: Spacing.two },
  arrivedTrack: { height: 22, borderRadius: Radius.sm, overflow: 'hidden' },
  arrivedFill: { height: '100%' },
  arrivedText: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  bars: { gap: Spacing.three },
  barRow: { gap: Spacing.one },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  barTrack: { height: 14, borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 7 },
  // Room for a two-line label above and below the line.
  rate: { height: 148 },
  rateTrack: { position: 'absolute', top: 73, left: 0, right: 0, height: 2 },
  rateDot: { position: 'absolute', top: 66, width: 16, height: 16, borderRadius: 8, borderWidth: 3 },
  rateLabel: { position: 'absolute', width: 150 },
  // Above the line: a box ending just over it, so one- and two-line labels both sit close.
  rateAbove: { top: 0, height: 62, justifyContent: 'flex-end' },
  rateBelow: { top: 86 },
  status: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  statusText: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.two + 2, paddingVertical: Spacing.one },
});
