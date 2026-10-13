import { recommendedMode } from '@/lib/learn-games';
import { Icon } from '@/components/icon';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

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
 * is locked: any module opens any time. The trail is solid where you've walked it and
 * dotted beyond; the module you're up to pulses. The path climbs from hills at the bottom,
 * where module 1 sits, to a flag by the last one (LearnBackdrop).
 */
const NODE = 92;
/** How far the rim shows below a node. */
const RIM = 6;
// Room for a node, its label below and the next tag above without touching.
const ROW = 176;
/** Room between a node and its label card. */
const GAP = 14;
/** Room above the last module for the finish flag. */
const TOP = 112;
/** Where the flag's pole stands, from the top of the path. */
const FLAG_Y = 16;
const FLAG_H = 44;

export function LearnPath({
  modules,
  learned,
  next,
  onOpen,
  onStart,
  onNextAt,
}: {
  modules: Module[];
  learned: Set<string>;
  next: ModuleId | null;
  onOpen: (m: Module) => void;
  /** The Start bubble over the next module: straight into its lesson, as on Duolingo. */
  onStart?: (m: Module) => void;
  /** Where the next module sits, from the top of the path, so the screen can scroll to it. */
  onNextAt?: (y: number) => void;
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  // Nodes alternate sides, each with its label card on the open side (2026-10-10). The
  // earlier single column under a gentle swing (Angad, 2026-10-01: a wide swing with the
  // labels underneath looked off-centre) stacked every label down the middle; side by
  // side, each row spans the width, so the zigzag stays balanced.
  const side = (i: number) => (i % 2 === 0 ? 'left' : 'right');
  // The first module at the bottom, climbing up (D111).
  const centers = modules.map((_, i) => ({
    x: side(i) === 'left' ? NODE / 2 + Spacing.three : width - NODE / 2 - Spacing.three,
    y: (modules.length - 1 - i) * ROW + TOP + NODE / 2,
  }));
  const height = modules.length * ROW + TOP - 24;
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
            {/* The finish: a dotted last stretch from the top module to a flag. */}
            <Path
              d={`M${centers[centers.length - 1].x} ${centers[centers.length - 1].y} C${centers[centers.length - 1].x} ${FLAG_Y + FLAG_H + 30} ${width / 2} ${FLAG_Y + FLAG_H + 40} ${width / 2} ${FLAG_Y + FLAG_H}`}
              stroke={t.primary}
              strokeOpacity={0.3}
              strokeWidth={4}
              strokeDasharray="2 11"
              strokeLinecap="round"
              fill="none"
            />
            <G x={width / 2} y={FLAG_Y}>
              <Circle cx={0} cy={FLAG_H} r={7} fill={t.accentDeep} fillOpacity={0.35} />
              <Path d={`M0 0 V${FLAG_H}`} stroke={t.depth} strokeWidth={3} strokeLinecap="round" />
              <Path d="M1.5 1 L28 9.5 L1.5 18 Z" fill={t.primary} />
            </G>
            {/* The trail: solid green up to where you've got, dotted beyond (2026-10-10). */}
            {centers.slice(1).map((c, i) => {
              const a = centers[i];
              const walked = moduleProgress(modules[i], learned).complete;
              return (
                <Path
                  key={i}
                  d={`M${a.x} ${a.y} C${a.x} ${a.y - ROW / 2} ${c.x} ${c.y + ROW / 2} ${c.x} ${c.y}`}
                  stroke={t.primary}
                  strokeOpacity={walked ? 0.9 : 0.3}
                  strokeWidth={walked ? 6 : 4}
                  strokeDasharray={walked ? undefined : '2 11'}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
          </Svg>
          {modules.map((m, i) => (
            <Node
              key={m.id}
              index={i}
              module={m}
              learned={learned}
              isNext={m.id === next}
              center={centers[i]}
              width={width}
              onOpen={onOpen}
              onStart={onStart ?? onOpen}
            />
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
  onStart,
}: {
  index: number;
  module: Module;
  learned: Set<string>;
  isNext: boolean;
  center: { x: number; y: number };
  width: number;
  onOpen: (m: Module) => void;
  onStart: (m: Module) => void;
}) {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn;
  const { read, total, complete } = moduleProgress(m, learned);
  const Art = MODULE_ART[m.id];
  const title = l.modules[m.id].title;
  // The label sits beside the node, on whichever side has the room.
  const onLeft = center.x > width / 2;
  const labelWidth = width - (center.x > width / 2 ? width - center.x : center.x) - NODE / 2 - GAP;
  const labelLeft = onLeft ? 0 : center.x + NODE / 2 + GAP;

  return (
    <>
      {isNext ? <Halo center={center} /> : null}
      {isNext ? (
        // It looks like a button, so it is one (2026-10-12: tapping it did nothing, since it let
        // touches through to the empty path behind it). It starts the lesson.
        <Pressable
          onPress={() => onStart(m)}
          accessibilityRole="button"
          accessibilityLabel={`${read > 0 ? l.continue : l.start}: ${title}`}
          hitSlop={8}
          style={({ pressed }) => [
            styles.tag,
            { backgroundColor: t.primary, left: center.x - 60, top: center.y - NODE / 2 - 38, opacity: pressed ? 0.8 : 1 },
          ]}>
          <AppText style={[styles.tagText, { color: t.primaryForeground }]}>{read > 0 ? l.continue : l.start}</AppText>
          <View style={[styles.tagTail, { borderTopColor: t.primary }]} />
        </Pressable>
      ) : null}
      <Pressable
        onPress={() => onOpen(m)}
        accessibilityRole="button"
        accessibilityLabel={`${l.nodeLabel(index + 1, title, read, total)}. ${l.games.modes[recommendedMode(m, learned)]}`}
        style={[styles.node, { left: center.x - NODE / 2, top: center.y - NODE / 2, transform: [{ scale: isNext ? 1.06 : 1 }] }]}>
        {({ pressed }) => (
          <>
            {/* Duolingo's chunky button (D109): a darker rim below the node, which the node
                sinks into while pressed. Green once started, grey before. */}
            <View style={[styles.rim, { backgroundColor: read > 0 ? t.depth : t.border, opacity: read > 0 ? 0.55 : 1 }]} />
            <View style={{ transform: [{ translateY: pressed ? RIM - 1 : 0 }] }}>
              <Ring progress={total ? read / total : 0} color={t.primary} track={t.border} size={NODE} fill={t.card}>
                {/* Modules not yet started sit back a little, so the path reads at a glance. */}
                <View style={[styles.face, { backgroundColor: t.card, opacity: read > 0 || isNext ? 1 : 0.6 }]}>
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
      {/* A card beside the node with the module's number, name and how far you've got,
          so the words read on the scenery and the trail passes under them. */}
      <View
        style={[styles.labelSlot, { left: labelLeft, width: labelWidth, top: center.y - 44, alignItems: onLeft ? 'flex-end' : 'flex-start' }]}
        pointerEvents="box-none">
        <Pressable
          onPress={() => onOpen(m)}
          accessible={false}
          style={[styles.label, { backgroundColor: t.card, borderBottomColor: t.rim, borderLeftColor: read > 0 ? t.primary : t.card }]}>
          <AppText style={[styles.labelEyebrow, { color: t.primary }]}>{l.moduleN(index + 1)}</AppText>
          <AppText style={[styles.labelTitle, { color: t.text }]} numberOfLines={2}>
            {title}
          </AppText>
          <View style={styles.labelFoot}>
            <View style={[styles.labelTrack, { backgroundColor: t.border }]}>
              <View style={[styles.labelFill, { backgroundColor: t.primary, width: `${total ? (read / total) * 100 : 0}%` }]} />
            </View>
            <AppText variant="small" style={{ color: complete ? t.primary : t.textSecondary, fontFamily: Fonts.semibold }}>
              {complete ? l.moduleDone : l.moduleCount(read, total)}
            </AppText>
          </View>
        </Pressable>
      </View>
    </>
  );
}

/**
 * A soft green pulse behind the module you're up to, so the eye finds it. It never takes
 * taps (D136), and stays still when the phone asks for less motion.
 */
function Halo({ center }: { center: { x: number; y: number } }) {
  const t = useTheme();
  const still = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pulse, still]);
  const style = useAnimatedStyle(() => ({
    opacity: still ? 0.18 : 0.28 * (1 - pulse.value),
    transform: [{ scale: still ? 1 : 0.85 + pulse.value * 0.35 }],
  }));
  const size = NODE + 28;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.halo, { backgroundColor: t.primary, left: center.x - size / 2, top: center.y - size / 2 }, style]}
    />
  );
}

/** How far the scenery reaches past the path's own box: to the screen's edges, and under
 * the scroll view's bottom padding (learn.tsx's `path` style). */
const BLEED_X = Spacing.three;
const BLEED_TOP = Spacing.two;
const BLEED_BOTTOM = Spacing.six + Spacing.five;

/** Clouds in the upper sky: x and y as shares of the width and of the sky's height, and a size. */
const CLOUDS = [
  [0.14, 0.05, 1], [0.8, 0.12, 0.8], [0.1, 0.3, 0.7], [0.86, 0.38, 1], [0.18, 0.56, 0.8], [0.82, 0.7, 0.7],
] as const;

/**
 * The scene behind the path (Angad, 2026-10-01: "add a background to the learn"; made
 * lighter 2026-10-10, when the solid mountain read as heavy): a sky that deepens from the
 * page colour to mint as you go down, soft clouds, a faint ridge in the distance, rolling
 * hills where module 1 sits (the finish flag is drawn with the path). Mint tokens only, so
 * dark mode follows. It scrolls with the path.
 */
function LearnBackdrop({ width, height }: { width: number; height: number }) {
  const t = useTheme();
  const W = width + BLEED_X * 2;
  const H = height + BLEED_TOP + BLEED_BOTTOM;
  const sky = H * 0.75;
  const ridge = H * 0.42;
  return (
    <Svg
      width={W}
      height={H}
      style={{ position: 'absolute', left: -BLEED_X, top: -BLEED_TOP }}
      accessible={false}
      pointerEvents="none">
      <Defs>
        <LinearGradient id="learnSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={t.background} />
          <Stop offset="0.6" stopColor={t.accent} />
          <Stop offset="1" stopColor={t.accent} />
        </LinearGradient>
      </Defs>
      <Path d={`M0 0 H${W} V${H} H0 Z`} fill="url(#learnSky)" />
      {/* A far ridge, barely there. */}
      <Path
        d={`M0 ${H} L0 ${ridge + 60} C${W * 0.18} ${ridge - 10} ${W * 0.32} ${ridge + 40} ${W * 0.5} ${ridge - 30} C${W * 0.68} ${ridge + 30} ${W * 0.84} ${ridge - 20} ${W} ${ridge + 50} L${W} ${H} Z`}
        fill={t.accentDeep}
        fillOpacity={0.08}
      />
      {CLOUDS.map(([x, y, k], i) => (
        <Cloud key={i} x={x * W} y={y * sky} k={k} color={t.card} />
      ))}
      {/* Hills at the foot of the path. */}
      <Path
        d={`M0 ${H} L0 ${H - 170} C${W * 0.22} ${H - 230} ${W * 0.42} ${H - 140} ${W * 0.6} ${H - 160} C${W * 0.76} ${H - 178} ${W * 0.9} ${H - 215} ${W} ${H - 190} L${W} ${H} Z`}
        fill={t.accentDeep}
        fillOpacity={0.35}
      />
      <Path
        d={`M0 ${H} L0 ${H - 95} C${W * 0.3} ${H - 150} ${W * 0.62} ${H - 70} ${W} ${H - 120} L${W} ${H} Z`}
        fill={t.accentDeep}
        fillOpacity={0.55}
      />
    </Svg>
  );
}

/** A soft cloud: three bumps on a flat base. */
function Cloud({ x, y, k, color }: { x: number; y: number; k: number; color: string }) {
  return (
    <G x={x} y={y} scale={k} opacity={0.9}>
      <Circle cx={-14} cy={4} r={12} fill={color} />
      <Circle cx={4} cy={-4} r={16} fill={color} />
      <Circle cx={22} cy={5} r={11} fill={color} />
      <Path d="M-26 6 H33 A10 10 0 0 1 33 16 H-26 A10 10 0 0 1 -26 6 Z" fill={color} />
    </G>
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
  trackOpacity = 1,
  children,
}: {
  progress: number;
  color: string;
  track: string;
  size: number;
  stroke?: number;
  /** Behind the ring, so the rim beneath doesn't show through. */
  fill?: string;
  /** For a track in the same colour as the ring, faded (Learn's header, on green). */
  trackOpacity?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} accessible={false}>
        <Circle cx={size / 2} cy={size / 2} r={r + stroke / 2} fill={fill} />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeOpacity={trackOpacity} strokeWidth={stroke} fill="none" />
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
  labelSlot: { position: 'absolute', height: 88, justifyContent: 'center' },
  label: {
    alignItems: 'flex-start',
    gap: 1,
    maxWidth: '100%',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three - 2,
    borderRadius: 12,
    borderBottomWidth: 2,
    // A green left edge once a module is started: the app's mark for what counts.
    borderLeftWidth: 3,
  },
  labelEyebrow: { fontFamily: Fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase' },
  labelTitle: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 19 },
  labelFoot: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 4 },
  labelTrack: { width: 44, height: 5, borderRadius: 3, overflow: 'hidden' },
  labelFill: { height: 5, borderRadius: 3 },
  halo: { position: 'absolute', width: NODE + 28, height: NODE + 28, borderRadius: (NODE + 28) / 2 },
});
