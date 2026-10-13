import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import AppTabs from '@/components/app-tabs';
import { currentTab, setSwipeDirection } from '@/lib/current-tab';

/** The tabs left to right, as the tab bar shows them. */
const ORDER = ['/', '/scan', '/whatsapp', '/tools', '/learn'] as const;

/** The furthest the current swipe has gone sideways. The pan's own translation can arrive
 * as 0 at the end on iOS, so it's kept from the updates. One swipe at a time. */
let dx = 0;

/**
 * Swiping left or right anywhere on a tab moves to the next or previous tab (Angad,
 * 2026-10-01). The swipe has to be clearly sideways: a gesture that starts vertical is left
 * to the scroll view, and a short or slow drag does nothing, so reading and scrolling stay
 * as they were. Built once: it depends on nothing that renders.
 *
 * iPhone only since 2026-10-11: Android's tabs are pages in a native pager
 * (components/pager-tabs.tsx), which follows the finger itself.
 */
const swipe = Gesture.Pan()
  .runOnJS(true)
  .activeOffsetX([-30, 30])
  .failOffsetY([-15, 15])
  .onBegin(() => {
    dx = 0;
  })
  .onUpdate((e) => {
    if (Math.abs(e.translationX) > Math.abs(dx)) dx = e.translationX;
  })
  .onEnd((e) => {
    const direction = Math.sign(dx || e.velocityX);
    const far = Math.abs(dx) > 80 || Math.abs(e.velocityX) > 700;
    if (!far || !direction) return;
    const i = ORDER.indexOf(currentTab() as (typeof ORDER)[number]);
    if (i < 0) return;
    const next = direction < 0 ? i + 1 : i - 1;
    if (next < 0 || next >= ORDER.length) return;
    setSwipeDirection(direction);
    router.navigate(ORDER[next]);
  });

export default function TabsLayout() {
  if (Platform.OS === 'android') return <AppTabs />;
  return (
    <GestureDetector gesture={swipe}>
      <View style={styles.fill} collapsable={false}>
        <AppTabs />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
