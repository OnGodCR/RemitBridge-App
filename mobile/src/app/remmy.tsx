import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type SFSymbol } from '@/components/icon';
import { Rise } from '@/components/motion-views';
import { RemmyMascot } from '@/components/remmy';
import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { countryIn, useCopy, useLanguage } from '@/i18n';
import type { Copy } from '@/i18n/en';
import { announce } from '@/lib/announce';
import { money } from '@/lib/format';
import { prefs } from '@/lib/prefs';
import { boldParts, newChat, retryLast, runAction, sendToRemmy, useRemmy, type RemmyMessage } from '@/lib/remmy';
import type { RemmyAction, RemmyScreen } from '@/lib/remmy-actions';
import { track } from '@/lib/track';

/**
 * Remmy, the assistant inside the app (DECISIONS.md D175). Ask anything the WhatsApp bot
 * answers; Remmy shows the steps it took ("Checked today's prices") and, when it can act,
 * a card that does it: open Compare on a route, a screen, a lesson, or save a comparison.
 * When someone asks to be taken somewhere, the card opens it by itself after a beat.
 */
export default function RemmyChat() {
  const t = useTheme();
  const copy = useCopy();
  const r = copy.remmy;
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const { messages, thinking } = useRemmy();
  const [draft, setDraft] = useState('');
  const scroll = useRef<ScrollView>(null);
  // The composer rides on the keyboard. A KeyboardAvoidingView measured from the window got
  // it wrong inside the iPhone sheet and did nothing on Android (edge to edge), so this reads
  // the keyboard's live height instead, frame by frame, on both.
  const keyboard = useAnimatedKeyboard();
  const lift = useAnimatedStyle(() => ({ paddingBottom: keyboard.height.value }));
  const composerPad = useAnimatedStyle(() => ({
    paddingBottom: Math.max(insets.bottom - keyboard.height.value, 0) + Spacing.two,
  }));

  useEffect(() => track('remmy_opened'), []);
  useEffect(() => {
    const sub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () =>
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 120),
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === 'remmy' && last.text) announce(last.text.replace(/\*/g, ''));
  }, [messages]);

  // Before the first message, ask once whether messages may go to the AI model, as the
  // receipt scanner does (Apple 5.1.2(i) wants explicit permission; D175). "Not now" sends
  // nothing and keeps the draft.
  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    const go = () => {
      setDraft('');
      sendToRemmy(text, language.code);
    };
    if (prefs.remmyConsent()) return go();
    Alert.alert(r.aiTitle, r.aiBody, [
      { text: r.aiDecline, style: 'cancel', onPress: () => setDraft(text) },
      {
        text: r.aiAllow,
        onPress: () => {
          prefs.setRemmyConsent();
          go();
        },
      },
    ]);
  };

  return (
    <Animated.View style={[styles.fill, { backgroundColor: t.background }, lift]}>
      <StatusBar style="auto" />
      <View style={[styles.header, { paddingTop: (Platform.OS === 'android' ? insets.top : 0) + Spacing.three, borderBottomColor: t.border }]}>
        <RemmyMascot size={40} />
        <View style={styles.headerText}>
          <AppText style={[styles.name, { color: t.text }]}>{r.name}</AppText>
          <AppText variant="small" muted numberOfLines={1}>
            {r.subtitle}
          </AppText>
        </View>
        {messages.length ? <HeaderButton icon="arrow.counterclockwise" label={r.newChat} onPress={newChat} /> : null}
        <HeaderButton icon="xmark" label={r.close} onPress={() => router.back()} />
      </View>

      <ScrollView
        ref={scroll}
        style={styles.fill}
        contentContainerStyle={[styles.thread, !messages.length && styles.threadEmpty]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {messages.length ? (
          messages.map((m, i) =>
            m.role === 'user' ? (
              <UserBubble key={m.id} text={m.text} />
            ) : (
              <RemmyBubble key={m.id} message={m} latest={i === messages.length - 1} onRetry={() => retryLast(language.code)} />
            ),
          )
        ) : (
          <Welcome onPick={send} />
        )}
        {thinking ? <Thinking /> : null}
      </ScrollView>

      <Animated.View style={[styles.composer, { borderTopColor: t.border, backgroundColor: t.background }, composerPad]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={r.placeholder}
          placeholderTextColor={t.textSecondary}
          multiline
          maxLength={500}
          returnKeyType="send"
          submitBehavior="submit"
          onSubmitEditing={() => send(draft)}
          accessibilityLabel={r.placeholder}
          style={[styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border }]}
        />
        <Pressable
          onPress={() => send(draft)}
          disabled={!draft.trim() || thinking}
          accessibilityRole="button"
          accessibilityLabel={r.send}
          style={[styles.sendButton, { backgroundColor: draft.trim() && !thinking ? t.primary : t.muted }]}>
          <Icon name="arrow.up" size={20} weight="bold" tintColor={draft.trim() && !thinking ? t.primaryForeground : t.textSecondary} fallback={null} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function HeaderButton({ icon, label, onPress }: { icon: SFSymbol; label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={[styles.headerButton, { backgroundColor: t.muted }]}>
      <Icon name={icon} size={17} weight="bold" tintColor={t.textSecondary} fallback={null} />
    </Pressable>
  );
}

/** Before the first message: Remmy, hovering, and four things to try. */
function Welcome({ onPick }: { onPick: (text: string) => void }) {
  const t = useTheme();
  const r = useCopy().remmy;
  const reduced = useReducedMotion();
  const float = useSharedValue(0);
  useEffect(() => {
    if (!reduced) float.set(withRepeat(withSequence(withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })), -1));
  }, [reduced, float]);
  const hover = useAnimatedStyle(() => ({ transform: [{ translateY: float.get() }] }));
  return (
    <Rise style={styles.welcome}>
      <Animated.View style={hover}>
        <RemmyMascot size={96} />
      </Animated.View>
      <AppText accessibilityRole="header" style={[styles.hello, { color: t.text }]}>
        {r.hello}
      </AppText>
      <AppText style={[styles.intro, { color: t.textSecondary }]}>{r.intro}</AppText>
      <View style={styles.suggestions}>
        {r.suggestions.map((s) => (
          <Pressable
            key={s}
            onPress={() => onPick(s)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.suggestion, { backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim, opacity: pressed ? 0.7 : 1 }]}>
            <AppText style={[styles.suggestionText, { color: t.text }]}>{s}</AppText>
            <Icon name="arrow.up.right" size={14} weight="bold" tintColor={t.primary} fallback={null} />
          </Pressable>
        ))}
      </View>
      <AppText variant="small" muted style={styles.privacy}>
        {r.privacy}
      </AppText>
    </Rise>
  );
}

function UserBubble({ text }: { text: string }) {
  const t = useTheme();
  return (
    <Rise style={styles.userRow}>
      <View style={[styles.userBubble, { backgroundColor: t.primary }]}>
        <AppText style={[styles.bubbleText, { color: t.primaryForeground }]}>{text}</AppText>
      </View>
    </Rise>
  );
}

function RemmyBubble({ message, latest, onRetry }: { message: Extract<RemmyMessage, { role: 'remmy' }>; latest: boolean; onRetry: () => void }) {
  const t = useTheme();
  const copy = useCopy();
  const r = copy.remmy;
  const text = message.failed
    ? r.offline
    : message.limited && !message.text
      ? message.reason === 'slow'
        ? r.slow
        : r.limited
      : message.text || (message.actions.length ? r.here : r.noAnswer);
  const steps = [...new Set(message.steps.map((s) => r.steps[s] ?? r.steps.action))];
  return (
    <Rise style={styles.remmyRow}>
      <RemmyMascot size={30} />
      <View style={styles.remmyColumn}>
        {steps.length ? (
          <View style={styles.steps}>
            {steps.map((s) => (
              <View key={s} style={[styles.step, { backgroundColor: t.accent }]}>
                <Icon name="checkmark.circle.fill" size={13} tintColor={t.primary} fallback={null} />
                <AppText style={[styles.stepText, { color: t.accentForeground }]}>{s}</AppText>
              </View>
            ))}
          </View>
        ) : null}
        <View style={[styles.remmyBubble, { backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim }]}>
          <AppText style={[styles.bubbleText, { color: t.text }]}>
            {boldParts(text).map((p, i) => (
              <AppText key={i} style={p.bold ? [styles.bold, { color: t.primary }] : undefined}>
                {p.text}
              </AppText>
            ))}
          </AppText>
          {message.failed ? (
            <Pressable onPress={onRetry} accessibilityRole="button" style={styles.retry}>
              <AppText style={[styles.retryText, { color: t.primary }]}>{r.retry}</AppText>
            </Pressable>
          ) : null}
        </View>
        {message.actions.map((a, i) => (
          <ActionCard key={i} action={a} autoRun={latest && i === 0 && 'now' in a && a.now === true} copy={copy} />
        ))}
      </View>
    </Rise>
  );
}

const SCREEN_ICON: Record<RemmyAction['type'], SFSymbol> = {
  compare: 'arrow.left.arrow.right',
  screen: 'arrow.up.right',
  lesson: 'book',
  save: 'bookmark.fill',
};

function screenTitle(copy: Copy, screen: RemmyScreen): string {
  const titles: Record<RemmyScreen, string> = {
    compare: copy.tabs.compare,
    scan: copy.titles.scan,
    whatsapp: copy.tabs.whatsapp,
    tools: copy.tabs.tools,
    learn: copy.tabs.learn,
    saved: copy.titles.saved,
    account: copy.account.title,
    glossary: copy.titles.glossary,
    routes: copy.titles.routeBoard,
    request_route: copy.titles.askForRoute,
    fair_rate: copy.titles.fairRate,
    scam_check: copy.titles.scamCheck,
    true_cost: copy.titles.trueCost,
    yearly_cost: copy.titles.yearlyCost,
    rate_history: copy.titles.rateHistory,
    observatory: copy.titles.observatory,
    remitbench: copy.titles.remitbench,
    blog: copy.titles.blog,
    sign_in: copy.account.createOrSignIn,
    privacy: copy.account.privacy,
    terms: copy.account.terms,
    support: copy.account.support,
  };
  return titles[screen];
}

/**
 * What Remmy offers to do, as a card with one button. When the person asked to be taken
 * somewhere, it opens by itself after a beat, so they see what's happening first.
 */
function ActionCard({ action, autoRun, copy }: { action: RemmyAction; autoRun: boolean; copy: Copy }) {
  const t = useTheme();
  const r = copy.remmy;
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'already' | 'signedOut' | 'error'>('idle');
  const ran = useRef(false);
  const country = 'routeId' in action ? countryIn(copy, action.routeId.split('-')[1]?.toUpperCase() ?? '') : '';
  const title =
    action.type === 'compare' || action.type === 'save'
      ? `${money(action.amount, 'USD').replace('.00', '')} → ${country}`
      : action.type === 'lesson'
        ? copy.learn.modules[action.module].title
        : screenTitle(copy, action.screen);
  const sub =
    action.type === 'compare' || action.type === 'save'
      ? copy.delivery[action.method as keyof typeof copy.delivery] ?? ''
      : action.type === 'lesson'
        ? action.mode
          ? copy.learn.games.modes[action.mode]
          : r.lessonCard
        : '';
  const label =
    action.type === 'save'
      ? { idle: r.save, busy: r.save, done: r.saved, already: r.already, signedOut: r.signIn, error: r.saveFailed }[state]
      : state === 'busy'
        ? r.opening
        : action.type === 'lesson'
          ? r.start
          : r.go;

  const run = async () => {
    if (state === 'signedOut') {
      router.back();
      router.push('/sign-in');
      return;
    }
    if (state !== 'idle' && state !== 'error') return;
    setState('busy');
    track('remmy_action', { type: action.type });
    const result = await runAction(action);
    if (action.type !== 'save') return;
    setState(result === 'saved' ? 'done' : result === 'already' ? 'already' : result === 'signed_out' ? 'signedOut' : 'error');
  };

  useEffect(() => {
    if (!autoRun || ran.current) return;
    ran.current = true;
    setState('busy');
    const timer = setTimeout(() => {
      track('remmy_action', { type: action.type, auto: true });
      runAction(action);
    }, 900);
    return () => clearTimeout(timer);
  }, [autoRun, action]);

  const finished = state === 'done' || state === 'already';
  return (
    <Rise style={[styles.card, { backgroundColor: t.card, borderColor: t.primary, borderBottomColor: t.primaryDeep }]}>
      <View style={[styles.cardIcon, { backgroundColor: t.accent }]}>
        <Icon name={SCREEN_ICON[action.type]} size={18} weight="bold" tintColor={t.primary} fallback={null} />
      </View>
      <View style={styles.cardText}>
        <AppText style={[styles.cardTitle, { color: t.text }]} numberOfLines={2}>
          {title}
        </AppText>
        {sub ? (
          <AppText variant="small" muted numberOfLines={1}>
            {sub}
          </AppText>
        ) : null}
      </View>
      <Pressable
        onPress={run}
        disabled={finished || (state === 'busy' && action.type !== 'save')}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${title}`}
        style={({ pressed }) => [styles.cardButton, { backgroundColor: finished ? t.accent : t.primary, opacity: pressed ? 0.8 : 1 }]}>
        {finished ? <Icon name="checkmark" size={14} weight="bold" tintColor={t.primary} fallback={null} /> : null}
        <AppText style={[styles.cardButtonText, { color: finished ? t.primary : t.primaryForeground }]}>{label}</AppText>
      </Pressable>
    </Rise>
  );
}

/** Three dots and what Remmy is doing, while it works. */
function Thinking() {
  const t = useTheme();
  const r = useCopy().remmy;
  const [hint, setHint] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setHint((h) => (h + 1) % r.thinking.length), 1400);
    return () => clearInterval(timer);
  }, [r.thinking.length]);
  return (
    <View style={styles.remmyRow} accessible accessibilityLabel={r.thinking[0]} accessibilityLiveRegion="polite">
      <RemmyMascot size={30} />
      <View style={[styles.thinking, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <Dot key={i} delay={i * 160} />
          ))}
        </View>
        <AppText variant="small" muted>
          {r.thinking[hint]}
        </AppText>
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const lift = useSharedValue(0);
  useEffect(() => {
    if (!reduced) lift.set(withDelay(delay, withRepeat(withSequence(withTiming(-4, { duration: 280 }), withTiming(0, { duration: 280 })), -1)));
  }, [reduced, lift, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: lift.get() }] }));
  return <Animated.View style={[styles.dot, { backgroundColor: t.primary }, style]} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: { flex: 1 },
  name: { fontFamily: Fonts.extrabold, fontSize: 19, lineHeight: 24 },
  headerButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  thread: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  threadEmpty: { flexGrow: 1, justifyContent: 'center' },
  welcome: { alignItems: 'center', gap: Spacing.three },
  hello: { fontFamily: Fonts.extrabold, fontSize: 26, lineHeight: 32, letterSpacing: -0.5, textAlign: 'center' },
  intro: { fontSize: 16, lineHeight: 23, textAlign: 'center', maxWidth: 300 },
  suggestions: { alignSelf: 'stretch', gap: Spacing.two, marginTop: Spacing.two },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderRadius: Radius.lg + 2,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 4,
    minHeight: MinTapTarget + 4,
  },
  suggestionText: { flex: 1, fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 20 },
  userRow: { alignItems: 'flex-end' },
  userBubble: { maxWidth: '82%', borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2 },
  remmyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  remmyColumn: { flex: 1, gap: Spacing.two },
  remmyBubble: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderWidth: 1,
    borderBottomWidth: 3,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    gap: Spacing.two,
  },
  bubbleText: { fontSize: 16, lineHeight: 23 },
  bold: { fontFamily: Fonts.extrabold },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  step: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  stepText: { fontFamily: Fonts.semibold, fontSize: 12 },
  retry: { minHeight: MinTapTarget, justifyContent: 'center' },
  retryText: { fontFamily: Fonts.bold, fontSize: 15 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderRadius: Radius.lg + 4,
    padding: Spacing.two + 2,
  },
  cardIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 1 },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20 },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    minHeight: 38,
  },
  cardButtonText: { fontFamily: Fonts.bold, fontSize: 14 },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  dots: { flexDirection: 'row', gap: 4, paddingTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: MinTapTarget,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    paddingTop: 11,
    paddingBottom: 11,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  sendButton: { width: MinTapTarget, height: MinTapTarget, borderRadius: MinTapTarget / 2, alignItems: 'center', justifyContent: 'center' },
  privacy: { textAlign: 'center', marginTop: Spacing.one },
});
