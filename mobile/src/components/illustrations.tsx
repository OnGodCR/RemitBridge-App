import { createContext, useContext, useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

/**
 * RemitBridge's own spot illustrations (DECISIONS.md D103), in place of stock symbols.
 *
 * One style for all of them, so they read as a set:
 * - a 64-unit square, ink outlines 2 units wide with round ends, white "paper" fills;
 * - a mint disc behind, always the same size and place;
 * - colour only from the brand: solid green for what arrives, grey for the fee, and a
 *   translucent green "highlighter" for the cost hidden in the rate (no yellow, Angad's
 *   call), kept apart from the solid black bar that means a detail is covered.
 *
 * Decorative: screen readers skip them, and the words beside them carry the meaning.
 * Colours come from the theme, so they follow dark mode.
 *
 * Depth (D109, Angad: the app looked "a tad bland"): every drawing is drawn three times,
 * stacked. First its disc, shaded from mint to a deeper mint with a soft highlight, so it
 * reads as lit from the top left. Then the whole drawing as a deep-green silhouette,
 * shifted a little down and right and faded, so it sits on the disc like a raised sticker.
 * Then the drawing itself. Each drawing is written once; `depth()` does the stacking.
 */

type Art = { size?: number };

/** Which of the three layers is being drawn. */
type Layer = 'disc' | 'shadow' | 'art';
const LayerContext = createContext<Layer>('art');

function useInk() {
  const t = useTheme();
  const layer = useContext(LayerContext);
  if (layer === 'shadow') return { ink: t.depth, paper: t.depth, tint: t.depth, green: t.depth, grey: t.depth };
  return {
    ink: t.text,
    paper: t.card,
    tint: t.accent,
    green: t.moneyReceived,
    grey: t.moneyFee,
  };
}

/**
 * The square a drawing lives in. On the disc layer it draws only the shaded disc; on the
 * shadow and art layers, only the drawing.
 */
function Frame({
  size = 48,
  disc = { cx: 35, cy: 31, r: 27 },
  children,
}: {
  size?: number;
  disc?: { cx: number; cy: number; r: number };
  children: ReactNode;
}) {
  const t = useTheme();
  const layer = useContext(LayerContext);
  const id = `disc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessible={false} importantForAccessibility="no-hide-descendants">
      {layer === 'disc' ? (
        <>
          <Defs>
            <LinearGradient id={id} x1="0.2" y1="0.1" x2="0.85" y2="1">
              <Stop offset="0" stopColor={t.accent} />
              <Stop offset="1" stopColor={t.accentDeep} />
            </LinearGradient>
          </Defs>
          <Circle cx={disc.cx} cy={disc.cy} r={disc.r} fill={`url(#${id})`} />
          <Ellipse
            cx={disc.cx - disc.r * 0.32}
            cy={disc.cy - disc.r * 0.5}
            rx={disc.r * 0.42}
            ry={disc.r * 0.2}
            fill={t.glow}
            opacity={t.glowOpacity}
            transform={`rotate(-25 ${disc.cx - disc.r * 0.32} ${disc.cy - disc.r * 0.5})`}
          />
        </>
      ) : (
        children
      )}
    </Svg>
  );
}

/** Stacks a drawing's three layers: shaded disc, faded silhouette a little lower, drawing. */
function depth(Draw: (props: Art) => ReactNode, defaultSize = 48) {
  return function Layered({ size = defaultSize }: Art) {
    const t = useTheme();
    const shift = (size / 64) * 2.4;
    return (
      <View style={{ width: size, height: size }} accessible={false} importantForAccessibility="no-hide-descendants">
        <LayerContext.Provider value="disc">
          <Draw size={size} />
        </LayerContext.Provider>
        <View style={[StyleSheet.absoluteFill, { opacity: t.depthOpacity, transform: [{ translateX: shift * 0.5 }, { translateY: shift }] }]}>
          <LayerContext.Provider value="shadow">
            <Draw size={size} />
          </LayerContext.Provider>
        </View>
        <View style={StyleSheet.absoluteFill}>
          <LayerContext.Provider value="art">
            <Draw size={size} />
          </LayerContext.Provider>
        </View>
      </View>
    );
  };
}

/** Stroke settings shared by every outline. */
function useLine(width = 2) {
  const c = useInk();
  return { stroke: c.ink, strokeWidth: width, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
}

/** A receipt with a torn bottom edge, the shape the scanner is about. */
const RECEIPT = 'M14 10 H40 V50 L35.7 47 L31.3 50 L27 47 L22.7 50 L18.3 47 L14 50 Z';

// Scan ---------------------------------------------------------------------------------

/** The Scan tab's lead: a receipt in a viewfinder, a name covered, the markup lit up. */
export const ScanHero = depth(function ScanHero({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size} disc={{ cx: 32, cy: 32, r: 28 }}>
      <Path d="M20 14 H44 V48 L40 45.5 L36 48 L32 45.5 L28 48 L24 45.5 L20 48 Z" fill={c.paper} {...line} strokeWidth={1.5} />
      <Rect x={24} y={18} width={14} height={3.5} rx={1} fill={c.ink} />
      <Path d="M24 26 H40" {...line} strokeWidth={1.5} />
      <Rect x={23} y={29} width={18} height={6} rx={1.5} fill={c.green} fillOpacity={0.4} />
      <Path d="M24 32 H40" {...line} strokeWidth={1.5} />
      <Path d="M24 38.5 H34" {...line} strokeWidth={1.5} />
      <Path d="M8 16 V8 H16 M48 8 H56 V16 M56 48 V56 H48 M16 56 H8 V48" stroke={c.green} strokeWidth={2.5} strokeLinecap="round" fill="none" />
    </Frame>
  );
}, 132);

/** Step 1: a camera. */
export const StepSnap = depth(function StepSnap({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M22 22 L26 15 H38 L42 22" fill={c.paper} {...line} />
      <Rect x={10} y={22} width={44} height={30} rx={5} fill={c.paper} {...line} />
      <Circle cx={32} cy={37} r={9} fill={c.paper} {...line} />
      <Circle cx={32} cy={37} r={4} fill={c.green} />
    </Frame>
  );
});

/** Step 2: the receipt with personal details covered. */
export const StepCover = depth(function StepCover({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d={RECEIPT} fill={c.paper} {...line} />
      <Rect x={19} y={16} width={16} height={4} rx={1} fill={c.ink} />
      <Path d="M19 26 H33" {...line} />
      <Rect x={19} y={31} width={12} height={4} rx={1} fill={c.ink} />
      <Path d="M19 41 H30" {...line} />
    </Frame>
  );
});

/** Step 3: the cost bar, as Compare draws it: received, fee, markup. */
export const StepCost = depth(function StepCost({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Rect x={8} y={28} width={30} height={10} rx={2} fill={c.green} />
      <Rect x={38} y={28} width={8} height={10} fill={c.grey} />
      <Rect x={46} y={28} width={10} height={10} rx={2} fill={c.green} fillOpacity={0.4} />
      <Rect x={8} y={28} width={48} height={10} rx={2} fill="none" {...line} />
      <Path d="M8 48 H30" {...line} />
      <Path d="M46 44 V50" {...line} />
    </Frame>
  );
});

// Tools --------------------------------------------------------------------------------

/** Fair rate: a balance whose beam is the bridge's arc. */
export const FairRateArt = depth(function FairRateArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M32 18 V50 M24 50 H40" {...line} />
      <Path d="M12 26 Q32 14 52 26" {...line} fill="none" />
      <Path d="M12 26 L8 37 M12 26 L16 37 M52 26 L48 37 M52 26 L56 37" {...line} />
      <Path d="M6 37 A6 5 0 0 0 18 37 Z" fill={c.green} {...line} />
      <Path d="M46 37 A6 5 0 0 0 58 37 Z" fill={c.paper} {...line} />
    </Frame>
  );
});

/** Scam check: a shield with a warning. */
export const ScamCheckArt = depth(function ScamCheckArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M30 10 L46 16 V30 C46 42 38 50 30 54 C22 50 14 42 14 30 V16 Z" fill={c.paper} {...line} />
      <Path d="M30 22 V34" stroke={c.ink} strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx={30} cy={41.5} r={2.2} fill={c.ink} />
    </Frame>
  );
});

/** TrueCost: a receipt under a magnifier, the markup line found. */
export const TrueCostArt = depth(function TrueCostArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d={RECEIPT} fill={c.paper} {...line} />
      <Path d="M19 18 H35 M19 24 H31" {...line} />
      <Rect x={18} y={28} width={16} height={6} rx={1.5} fill={c.green} fillOpacity={0.4} />
      <Path d="M19 31 H33" {...line} />
      <Path d="M19 39 H27" {...line} />
      <Circle cx={43} cy={41} r={8} fill={c.paper} {...line} />
      <Path d="M49 47 L55 53" {...line} strokeWidth={3} />
    </Frame>
  );
});

/** Yearly cost: a calendar page with a coin on it. */
export const YearlyCostArt = depth(function YearlyCostArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Rect x={10} y={14} width={36} height={34} rx={4} fill={c.paper} {...line} />
      <Path d="M10 22 H46 M20 10 V17 M36 10 V17" {...line} />
      <Path d="M16 30 H22 M26 30 H32 M16 38 H22" {...line} />
      <Circle cx={46} cy={45} r={9} fill={c.green} {...line} />
      <Circle cx={46} cy={45} r={4.5} fill="none" stroke={c.paper} strokeWidth={1.5} />
    </Frame>
  );
});

/** Rate history: a line over time. */
export const RateHistoryArt = depth(function RateHistoryArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M10 12 V52 H56" {...line} fill="none" />
      <Path d="M14 44 L24 35 L32 39 L42 24 L52 29" stroke={c.green} strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={42} cy={24} r={3.5} fill={c.paper} {...line} />
    </Frame>
  );
});

// Learn --------------------------------------------------------------------------------

/** Fee + hidden markup: a grey coin plus a highlighted one. */
export const FeeMarkupArt = depth(function FeeMarkupArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Circle cx={16} cy={36} r={9} fill={c.grey} {...line} />
      <Circle cx={50} cy={36} r={9} fill={c.green} fillOpacity={0.4} {...line} />
      <Path d="M33 31 V41 M28 36 H38" {...line} strokeWidth={2.5} />
    </Frame>
  );
});

/** Checked prices only: a seal with a tick. */
export const CheckedArt = depth(function CheckedArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M24 44 L20 56 L26 52 L30 57 L32 46" fill={c.paper} {...line} />
      <Circle cx={30} cy={30} r={15} fill={c.paper} {...line} />
      <Path d="M23 30 L28 35 L38 24" stroke={c.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Frame>
  );
});

/** No affiliate deals: a price tag, struck out. */
export const NoAffiliateArt = depth(function NoAffiliateArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M12 28 L30 10 H50 V30 L32 48 Z" fill={c.paper} {...line} />
      <Circle cx={43} cy={17} r={3} fill="none" {...line} />
      <Path d="M14 50 L50 14" stroke={c.ink} strokeWidth={3} strokeLinecap="round" />
    </Frame>
  );
});

/** Wrong price? Write to us: an envelope. */
export const WrongPriceArt = depth(function WrongPriceArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Rect x={8} y={20} width={44} height={30} rx={3} fill={c.paper} {...line} />
      <Path d="M8 22 L30 38 L52 22" {...line} fill="none" />
      <Circle cx={51} cy={20} r={6} fill={c.green} />
    </Frame>
  );
});

/** Glossary: an open book. */
export const GlossaryArt = depth(function GlossaryArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M32 18 C26 14 18 14 8 16 V48 C18 46 26 46 32 50 C38 46 46 46 56 48 V16 C46 14 38 14 32 18 Z" fill={c.paper} {...line} />
      <Path d="M32 18 V50 M14 24 H26 M14 30 H26 M14 36 H22" {...line} />
      <Path d="M38 24 H50" stroke={c.green} strokeWidth={2.5} strokeLinecap="round" />
    </Frame>
  );
});

/** Route board: a folded map with a route on it. */
export const RouteBoardArt = depth(function RouteBoardArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M8 18 L22 12 L38 18 L54 12 V46 L38 52 L22 46 L8 52 Z" fill={c.paper} {...line} />
      <Path d="M22 12 V46 M38 18 V52" {...line} strokeWidth={1.5} />
      <Path d="M13 42 Q28 22 46 26" stroke={c.green} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="3 4" fill="none" />
      <Circle cx={46} cy={26} r={3.5} fill={c.green} />
    </Frame>
  );
});

/** What people paid: bars from shared receipts. */
export const ObservatoryArt = depth(function ObservatoryArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Rect x={13} y={32} width={9} height={18} rx={1.5} fill={c.green} {...line} />
      <Rect x={27} y={22} width={9} height={28} rx={1.5} fill={c.paper} {...line} />
      <Rect x={41} y={36} width={9} height={14} rx={1.5} fill={c.grey} {...line} />
      <Path d="M8 50 H56" {...line} />
    </Frame>
  );
});

/** RemitBench: a flask. */
export const RemitBenchArt = depth(function RemitBenchArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M17 45 H47 L49 49 Q51 54 45 54 H19 Q13 54 15 49 Z" fill={c.green} />
      <Path d="M26 10 H38 M28 10 V27 L15 49 Q13 54 19 54 H45 Q51 54 49 49 L36 27 V10" fill="none" {...line} />
      <Circle cx={30} cy={38} r={2} fill={c.paper} {...line} strokeWidth={1.5} />
      <Circle cx={36} cy={33} r={1.5} fill={c.paper} {...line} strokeWidth={1.5} />
    </Frame>
  );
});

// Learn modules --------------------------------------------------------------------------

/** The basics: a sender and a recipient joined by the bridge's arc. */
export const BasicsArt = depth(function BasicsArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M12 44 Q32 16 52 44" stroke={c.green} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M20 34 V50 M44 34 V50 M8 50 H56" {...line} />
      <Circle cx={12} cy={40} r={5} fill={c.paper} {...line} />
      <Circle cx={52} cy={40} r={5} fill={c.green} {...line} />
    </Frame>
  );
});

/** How money arrives: a home, with the money at the door. */
export const ArrivalArt = depth(function ArrivalArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M12 30 L30 14 L48 30 V52 H12 Z" fill={c.paper} {...line} />
      <Rect x={25} y={38} width={10} height={14} rx={1} fill={c.paper} {...line} />
      <Circle cx={47} cy={46} r={8} fill={c.green} {...line} />
    </Frame>
  );
});

/** How money moves between banks: a bank building. */
export const BankArt = depth(function BankArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M8 24 L32 12 L56 24 Z" fill={c.paper} {...line} />
      <Path d="M14 28 V46 M24 28 V46 M40 28 V46 M50 28 V46" {...line} />
      <Path d="M8 50 H56 M10 24 H54" {...line} />
      <Path d="M30 34 H38" stroke={c.green} strokeWidth={3} strokeLinecap="round" />
    </Frame>
  );
});

/** Inside a provider: the pre-funded pool, a tank part full. */
export const ProviderArt = depth(function ProviderArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d="M16 30 V48 C16 52 48 52 48 48 V30 C48 34 16 34 16 30 Z" fill={c.green} />
      <Path d="M16 16 V48 C16 52 48 52 48 48 V16" fill="none" {...line} />
      <Path d="M16 16 C16 12 48 12 48 16 C48 20 16 20 16 16 Z" fill={c.paper} {...line} />
      <Path d="M16 30 C16 34 48 34 48 30" {...line} fill="none" />
    </Frame>
  );
});

/** Crypto and stablecoins: blocks in a chain. */
export const ChainArt = depth(function ChainArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Rect x={6} y={28} width={14} height={14} rx={2} fill={c.paper} {...line} />
      <Rect x={25} y={28} width={14} height={14} rx={2} fill={c.green} {...line} />
      <Rect x={44} y={28} width={14} height={14} rx={2} fill={c.paper} {...line} />
      <Path d="M20 35 H25 M39 35 H44" {...line} />
    </Frame>
  );
});

// Saved --------------------------------------------------------------------------------

/** Saved: a bookmark over a receipt. */
export const SavedArt = depth(function SavedArt({ size }: Art) {
  const c = useInk();
  const line = useLine();
  return (
    <Frame size={size}>
      <Path d={RECEIPT} fill={c.paper} {...line} />
      <Path d="M19 18 H31 M19 24 H29 M19 30 H26" {...line} />
      <Path d="M34 8 H48 V34 L41 28 L34 34 Z" fill={c.green} {...line} />
    </Frame>
  );
});
