import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { AppText } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDay } from '@/lib/fx';

/**
 * A line over days, for Rate history and the quote detail's recent prices. Plain views, each
 * segment a thin rotated bar, so no charting or SVG dependency is needed. Drag across it to
 * read any day; screen readers get the range, the low and the high.
 */
export interface ChartPoint {
  /** ISO day, "2026-09-29". */
  date: string;
  value: number;
}

export function LineChart({
  points,
  unit,
  format,
  height = 180,
}: {
  points: ChartPoint[];
  unit: string;
  format: (n: number) => string;
  height?: number;
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const H = height;

  const { lo, hi } = useMemo(() => {
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // A flat series has no range; pad it so the line runs through the middle.
    const pad = max - min < Number.EPSILON ? Math.max(max * 0.002, 0.0001) : (max - min) * 0.1;
    return { lo: min - pad, hi: max + pad };
  }, [points]);

  const xy = (i: number) => ({
    x: (i / (points.length - 1)) * width,
    y: H - ((points[i].value - lo) / (hi - lo)) * H,
  });

  const pick = (x: number) =>
    setActive(Math.max(0, Math.min(points.length - 1, Math.round((x / Math.max(1, width)) * (points.length - 1)))));

  const shown = points[active ?? points.length - 1];

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.head}>
        <AppText variant="figure" style={{ color: t.primary }}>
          {format(shown.value)}
        </AppText>
        <AppText variant="small" muted>
          {unit} · {formatDay(shown.date)}
        </AppText>
      </View>
      <View
        style={{ height: H }}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
        onResponderMove={(e) => pick(e.nativeEvent.locationX)}
        onResponderRelease={() => setActive(null)}
        accessible
        accessibilityLabel={`${unit}, ${points.length} days from ${formatDay(points[0].date)} to ${formatDay(
          points[points.length - 1].date,
        )}. Low ${format(Math.min(...points.map((p) => p.value)))}, high ${format(Math.max(...points.map((p) => p.value)))}.`}>
        {width > 0
          ? points.slice(1).map((_, k) => {
              const a = xy(k);
              const b = xy(k + 1);
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              return (
                <View
                  key={`${points[k + 1].date}-${k}`}
                  pointerEvents="none"
                  style={[
                    styles.segment,
                    {
                      width: len + 1,
                      left: (a.x + b.x) / 2 - (len + 1) / 2,
                      top: (a.y + b.y) / 2 - 1,
                      backgroundColor: t.primary,
                      transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
                    },
                  ]}
                />
              );
            })
          : null}
        {active !== null && width > 0 ? (
          <>
            <View pointerEvents="none" style={[styles.cursor, { left: xy(active).x, backgroundColor: t.border }]} />
            <View
              pointerEvents="none"
              style={[
                styles.dot,
                { left: xy(active).x - 5, top: xy(active).y - 5, backgroundColor: t.card, borderColor: t.primary },
              ]}
            />
          </>
        ) : null}
      </View>
      <View style={styles.axis}>
        <AppText variant="small" muted>
          {formatDay(points[0].date)}
        </AppText>
        <AppText variant="small" muted>
          {formatDay(points[points.length - 1].date)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.three },
  head: { gap: 2 },
  segment: { position: 'absolute', height: 2, borderRadius: 1 },
  cursor: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
});
