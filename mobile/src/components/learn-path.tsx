import { Icon } from '@/components/icon';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { MODULE_ART } from '@/components/module-art';
import { AppText } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import type { Module, ModuleId } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { moduleProgress } from '@/lib/learn-progress';

/**
 * Learn's modules as a path (DECISIONS.md D107, D111), after Duolingo's: one node per
 * module, starting at the bottom and winding up the screen, joined by a dashed line. Each node's ring fills as its lessons
 * are read; a finished module gets a tick; the next one carries an "Up next" tag. Nothing
 * is locked: any module opens any time. The path climbs a mountain (LearnBackdrop): hills
 * at the bottom where module 1 sits, the peak by the last one.
 */
const NODE = 92;
/** How far the rim shows below a node. */
const RIM = 6;
// Room for a node, its label below and the next tag above without touching.
const ROW = 200;
/** Sideways swing for each node, as a share of the room either side. */
const SWING = [0, 0.7, 1, 0.7, 0, -0.7, -1, -0.7];

export function LearnPath({
  modules,
  learned,
  next,
  onOpen,
  onNextAt,
}: {
  modules: Module[];
  learned: Set<string>;
  next: ModuleId | null;
  onOpen: (m: Module) => void;
  /** Where the next module sits, from the top of the path, so the screen can scroll to it. */
  onNextAt?: (y: number) => void;
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  // A gentle zigzag near the middle (Angad, 2026-10-01: the wide swing looked off-centre).
  const amp = Math.max(0, Math.min(52, width / 2 - NODE / 2 - Spacing.three));
  // The first module at the bottom, climbing up (D111).
  const centers = modules.map((_, i) => ({
    x: width / 2 + SWING[i % SWING.length] * amp,
    y: (modules.length - 1 - i) * ROW + 48 + NODE / 2,
  }));
  const height = modules.length * ROW + 24;
  const nextIndex = modules.findIndex((m) => m.id === next);
  const nextY = width > 0 ? centers[nextIndex >= 0 ? nextIndex : 0].y : null;
  useEffect(() => {
    if (nextY !== null) onNextAt?.(nextY);
  }, [nextY, onNextAt]);

  return (
    <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <>
          <LearnBackdrop width={width} height={height} />
          <Svg width={width} height={height} style={StyleSheet.absoluteFill} accessible={false}>
            {centers.slice(1).map((c, i) => {
              const a = centers[i];
              return (
                <Path
                  key={i}
                  d={`M${a.x} ${a.y} C${a.x} ${a.y - ROW / 2} ${c.x} ${c.y + ROW / 2} ${c.x} ${c.y}`}
                  stroke={t.primary}
                  strokeOpacity={0.35}
                  strokeWidth={4}
                  strokeDasharray="2 10"
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
          </Svg>
          {modules.map((m, i) => (
            <Node key={m.id} index={i} module={m} learned={learned} isNext={m.id === next} center={centers[i]} width={width} onOpen={onOpen} />
          ))}
        </>
      ) : null}
    </View>
  );
}

function Node({
  index,
  module: m,
  learned,
  isNext,
  center,
  width,
  onOpen,
}: {
  index: number;
  module: Module;
  learned: Set<string>;
  isNext: boolean;
  center: { x: number; y: number };
  width: number;
  onOpen: (m: Module) => void;
}) {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn;
  const { read, total, complete } = moduleProgress(m, learned);
  const Art = MODULE_ART[m.id];
  const title = l.modules[m.id].title;
  const LABEL = 180;
  const labelLeft = Math.min(Math.max(center.x - LABEL / 2, 0), width - LABEL);

  return (
    <>
      {isNext ? (
        <View style={[styles.tag, { backgroundColor: t.primary, left: center.x - 60, top: center.y - NODE / 2 - 38 }]} pointerEvents="none">
          <AppText style={[styles.tagText, { color: t.primaryForeground }]}>{read > 0 ? l.continue : l.start}</AppText>
          <View style={[styles.tagTail, { borderTopColor: t.primary }]} />
        </View>
      ) : null}
      <Pressable
        onPress={() => onOpen(m)}
        accessibilityRole="button"
        accessibilityLabel={l.nodeLabel(index + 1, title, read, total)}
        style={[styles.node, { left: center.x - NODE / 2, top: center.y - NODE / 2, transform: [{ scale: isNext ? 1.06 : 1 }] }]}>
        {({ pressed }) => (
          <>
            {/* Duolingo's chunky button (D109): a darker rim below the node, which the node
                sinks into while pressed. Green once started, grey before. */}
            <View style={[styles.rim, { backgroundColor: read > 0 ? t.depth : t.border, opacity: read > 0 ? 0.55 : 1 }]} />
            <View style={{ transform: [{ translateY: pressed ? RIM - 1 : 0 }] }}>
              <Ring progress={total ? read / total : 0} color={t.primary} track={t.border} size={NODE} fill={t.card}>
                <View style={[styles.face, { backgroundColor: t.card }]}>
                  <Art size={56} />
                </View>
              </Ring>
              {complete ? (
                <View style={[styles.badge, { backgroundColor: t.primary, borderColor: t.background }]}>
                  <Icon name="checkmark" size={14} weight="bold" tintColor={t.primaryForeground} fallback={null} />
                </View>
              ) : null}
            </View>
          </>
        )}
      </Pressable>
      {/* A small card behind the words, so they read on the mountain and the dashed line
          passes under them. */}
      <View style={[styles.labelSlot, { left: labelLeft, top: center.y + NODE / 2 + Spacing.two, width: LABEL }]} pointerEvents="none">
        <View style={[styles.label, { backgroundColor: t.card, borderBottomColor: t.rim }]}>
          <AppText style={[styles.labelTitle, { color: t.text }]} numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="small" style={{ color: complete ? t.primary : t.textSecondary, textAlign: 'center' }}>
            {complete ? l.moduleDone : l.moduleCount(read, total)}
          </AppText>
        </View>
      </View>
    </>
  );
}

/** How far the scenery reaches past the path's own box: to the screen's edges, and under
 * the scroll view's bottom padding (learn.tsx's `path` style). */
const BLEED_X = Spacing.three;
const BLEED_TOP = Spacing.two;
const BLEED_BOTTOM = Spacing.six + Spacing.five;

/** A few small dots in the sky, as shares of the width and of the upper half's height. */
const DOTS = [
  [0.08, 0.06, 3], [0.9, 0.04, 2.5], [0.16, 0.2, 2], [0.84, 0.17, 3], [0.06, 0.36, 2.5],
  [0.94, 0.33, 2], [0.12, 0.52, 2], [0.88, 0.5, 2.5], [0.05, 0.7, 2], [0.95, 0.68, 2],
] as const;

/**
 * The scene behind the path (Angad, 2026-10-01: "add a background to the learn"): a mountain
 * the modules climb, its shaded side drawn the way the app's drawings show depth (D109),
 * rolling hills at its foot, and a few dots in the sky. Mint tokens only, so dark mode
 * follows. It scrolls with the path.
 */
function LearnBackdrop({ width, height }: { width: number; height: number }) {
  const t = useTheme();
  const W = width + BLEED_X * 2;
  const H = height + BLEED_TOP + BLEED_BOTTOM;
  const peak = BLEED_TOP + 20;
  const sky = H * 0.5;
  return (
    <Svg
      width={W}
      height={H}
      style={{ position: 'absolute', left: -BLEED_X, top: -BLEED_TOP }}
      accessible={false}
      pointerEvents="none">
      {/* The mountain. */}
      <Path
        d={`M0 ${H} L0 ${peak + H * 0.32} C${W * 0.12} ${peak + H * 0.16} ${W * 0.3} ${peak + 30} ${W * 0.5} ${peak} C${W * 0.7} ${peak + 30} ${W * 0.88} ${peak + H * 0.16} ${W} ${peak + H * 0.32} L${W} ${H} Z`}
        fill={t.accent}
      />
      {/* Its shaded side. */}
      <Path
        d={`M${W * 0.5} ${peak} C${W * 0.7} ${peak + 30} ${W * 0.88} ${peak + H * 0.16} ${W} ${peak + H * 0.32} L${W} ${H} L${W * 0.7} ${H} C${W * 0.66} ${H * 0.55} ${W * 0.58} ${peak + H * 0.12} ${W * 0.5} ${peak} Z`}
        fill={t.accentDeep}
        fillOpacity={0.45}
      />
      {/* Hills at its foot. */}
      <Path
        d={`M0 ${H} L0 ${H - 170} C${W * 0.22} ${H - 230} ${W * 0.42} ${H - 140} ${W * 0.6} ${H - 160} C${W * 0.76} ${H - 178} ${W * 0.9} ${H - 215} ${W} ${H - 190} L${W} ${H} Z`}
        fill={t.accentDeep}
        fillOpacity={0.6}
      />
      <Path
        d={`M0 ${H} L0 ${H - 95} C${W * 0.3} ${H - 150} ${W * 0.62} ${H - 70} ${W} ${H - 120} L${W} ${H} Z`}
        fill={t.accent}
      />
      {DOTS.map(([x, y, r], i) => (
        <Circle key={i} cx={x * W} cy={y * sky} r={r} fill={t.accentDeep} />
      ))}
    </Svg>
  );
}

/** A ring that fills clockwise from the top. */
export function Ring({
  progress,
  color,
  track,
  size,
  stroke = 6,
  fill = 'none',
  children,
}: {
  progress: number;
  color: string;
  track: string;
  size: number;
  stroke?: number;
  /** Behind the ring, so the rim beneath doesn't show through. */
  fill?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} accessible={false}>
        <Circle cx={size / 2} cy={size / 2} r={r + stroke / 2} fill={fill} />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {progress > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c * Math.min(progress, 1)} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  node: { position: 'absolute', width: NODE, height: NODE + RIM },
  rim: { position: 'absolute', top: RIM, left: 0, width: NODE, height: NODE, borderRadius: NODE / 2 },
  face: { width: NODE - 16, height: NODE - 16, borderRadius: (NODE - 16) / 2, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: { position: 'absolute', width: 120, borderRadius: 10, paddingVertical: 6, alignItems: 'center' },
  tagText: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 18 },
  tagTail: {
    position: 'absolute',
    bottom: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  labelSlot: { position: 'absolute', alignItems: 'center' },
  label: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two + Spacing.one,
    borderRadius: 12,
    borderBottomWidth: 2,
  },
  labelTitle: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 19, textAlign: 'center' },
});
