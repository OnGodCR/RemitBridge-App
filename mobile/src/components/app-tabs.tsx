import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

export default function AppTabs() {
  const t = useTheme();
  const copy = useCopy();
  return (
    <NativeTabs
      backgroundColor={t.card}
      indicatorColor={t.accent}
      tintColor={t.primary}
      labelStyle={{ selected: { color: t.primary } }}>
      {/* Scan opens the app (D101): a real receipt is a better first step than a sum. */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{copy.tabs.scan}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="doc.text.viewfinder" md="document_scanner" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="compare">
        <NativeTabs.Trigger.Label>{copy.tabs.compare}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="arrow.left.arrow.right" md="compare_arrows" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tools">
        <NativeTabs.Trigger.Label>{copy.tabs.tools}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="wrench.and.screwdriver" md="build" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="learn">
        <NativeTabs.Trigger.Label>{copy.tabs.learn}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>{copy.tabs.account}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
