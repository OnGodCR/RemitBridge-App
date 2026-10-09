import type { AndroidSymbol } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type SFSymbol } from '@/components/icon';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * The bottom bar: Scan, Compare, WhatsApp, Tools, Learn (D147; Account moved to the top
 * right of every tab, since Android's bar holds five at most).
 *
 * iPhone keeps the system tab bar. Android draws its own (Angad, 2026-10-09: the stock
 * Material bar "just doesn't have that feel"): flat on the card colour with a hairline
 * on top, no pill behind the icon, and the colour easing between tabs instead of
 * snapping, which is what the iPhone bar does.
 */
const TABS: { name: string; label: 'scan' | 'compare' | 'whatsapp' | 'tools' | 'learn'; sf: SFSymbol; md: AndroidSymbol }[] = [
  // Scan opens the app (D101): a real receipt is a better first step than a sum.
  { name: 'index', label: 'scan', sf: 'doc.text.viewfinder', md: 'document_scanner' },
  { name: 'compare', label: 'compare', sf: 'arrow.left.arrow.right', md: 'compare_arrows' },
  { name: 'whatsapp', label: 'whatsapp', sf: 'message', md: 'chat' },
  { name: 'tools', label: 'tools', sf: 'wrench.and.screwdriver', md: 'build' },
  { name: 'learn', label: 'learn', sf: 'book', md: 'menu_book' },
];

export default function AppTabs() {
  return Platform.OS === 'android' ? <AndroidTabs /> : <IosTabs />;
}

function IosTabs() {
  const t = useTheme();
  const copy = useCopy();
  return (
    <NativeTabs
      backgroundColor={t.card}
      indicatorColor={t.accent}
      tintColor={t.primary}
      labelStyle={{ selected: { color: t.primary } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{copy.tabs[tab.label]}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

function AndroidTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, animation: 'none' }} tabBar={(props) => <CleanTabBar {...props} />}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

type BarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

function CleanTabBar({ state, navigation }: BarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { backgroundColor: t.card, borderTopColor: t.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, i) => {
        const tab = TABS.find((x) => x.name === route.name);
        if (!tab) return null;
        const focused = state.index === i;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return <TabItem key={route.key} tab={tab} focused={focused} onPress={onPress} />;
      })}
    </View>
  );
}

function TabItem({ tab, focused, onPress }: { tab: (typeof TABS)[number]; focused: boolean; onPress: () => void }) {
  const t = useTheme();
  const copy = useCopy();
  const on = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused, on]);
  const label = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [t.textSecondary, t.primary]) }));
  const lift = useAnimatedStyle(() => ({ transform: [{ scale: 1 + on.value * 0.06 }] }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={copy.tabs[tab.label]}
      style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}>
      <Animated.View style={lift}>
        <Icon name={tab.sf} size={24} tintColor={focused ? t.primary : t.textSecondary} fallback={null} />
      </Animated.View>
      <Animated.Text numberOfLines={1} style={[styles.label, label]}>
        {copy.tabs[tab.label]}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 48 },
  label: { fontFamily: Fonts.semibold, fontSize: 12, letterSpacing: 0.1 },
});
