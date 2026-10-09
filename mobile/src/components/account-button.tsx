import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { firstName } from '@/lib/name';

/**
 * Account, from the top-right corner of every tab (Angad, 2026-10-09): the bottom bar
 * holds five tabs at most on Android, and WhatsApp took Account's place there. Signed in,
 * it shows the first letter of the name, like most apps; otherwise a person symbol.
 */
export function AccountButton() {
  const t = useTheme();
  const copy = useCopy();
  const name = firstName(useAuth().session);
  return (
    <Pressable
      onPress={() => router.push('/account')}
      accessibilityRole="button"
      accessibilityLabel={copy.tabs.account}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}>
      {/* A soft white disc on the green band: the tint alone, so the icon stays fully white. */}
      <View style={[StyleSheet.absoluteFill, styles.disc, { backgroundColor: t.heroText }]} />
      {name ? (
        <AppText style={[styles.initial, { color: t.heroText }]}>{name.charAt(0)}</AppText>
      ) : (
        <Icon name="person.crop.circle" size={22} tintColor={t.heroText} fallback={null} />
      )}
    </Pressable>
  );
}

const SIZE = 38;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    minWidth: MinTapTarget - 6,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: { borderRadius: SIZE / 2, opacity: 0.18 },
  initial: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 21 },
});
