import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const t = useTheme();
  return (
    <NativeTabs
      backgroundColor={t.card}
      indicatorColor={t.accent}
      labelStyle={{ selected: { color: t.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Compare</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="arrow.left.arrow.right" md="compare_arrows" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="methodology">
        <NativeTabs.Trigger.Label>How it works</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="info.circle" md="info" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
