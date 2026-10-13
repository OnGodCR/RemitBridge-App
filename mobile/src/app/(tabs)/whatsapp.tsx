import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { Icon } from '@/components/icon';
import { ListGroup, ListPoint } from '@/components/list-row';
import { FocusRise } from '@/components/motion-views';
import { AppText, Button, TextLink } from '@/components/ui';
import { WhatsAppSection } from '@/components/whatsapp-section';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { useTabFocus } from '@/lib/current-tab';
import { LINKS, openPage } from '@/lib/links';
import { track } from '@/lib/track';
import { formatNumber, openChat, whatsAppSettings, type WhatsAppSettings } from '@/lib/whatsapp';

/**
 * The WhatsApp tab (DECISIONS.md D147; Angad, 2026-10-09: the bot is "a major feature"):
 * what the bot does, a button into the chat, what to send it, and linking it to an account.
 * It works for anyone with WhatsApp and no app, which is the point of telling people here:
 * they can pass it on to family. Until the bot can answer everyone
 * (app_settings.whatsapp_live), the chat and linking show only in development builds and
 * everyone else sees that it's coming.
 */
export default function WhatsAppScreen() {
  useTabFocus('/whatsapp');
  const t = useTheme();
  const copy = useCopy();
  const w = copy.whatsapp;
  const wt = copy.whatsappTab;
  const { session } = useAuth();
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);

  useEffect(() => {
    let live = true;
    whatsAppSettings().then((s) => live && setSettings(s));
    return () => {
      live = false;
    };
  }, []);

  const open = settings && (settings.live || __DEV__) ? settings : null;

  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title={copy.tabs.whatsapp}>
          <AppText style={[styles.lead, { color: t.heroText }]}>{wt.lead}</AppText>
        </HeroHeader>
        <FocusRise style={[styles.body, { backgroundColor: t.background }]}>
          <View style={styles.intro}>
            <AppText style={[styles.sub, { color: t.text }]}>{wt.sub}</AppText>
            {open ? (
              <>
                <Button
                  label={w.chat}
                  icon={<Icon name="message.fill" size={18} tintColor={t.primaryForeground} fallback={null} />}
                  onPress={async () => {
                    track('whatsapp_chat_opened', { from: 'tab' });
                    if (!(await openChat(open.number, w.hello))) Alert.alert(w.title, w.openFailed(formatNumber(open.number)));
                  }}
                />
                <AppText variant="small" muted style={styles.center}>
                  {formatNumber(open.number)}
                </AppText>
              </>
            ) : settings ? (
              <View style={[styles.soon, { borderLeftColor: t.primary }]}>
                <AppText style={{ color: t.text }}>{wt.soon}</AppText>
              </View>
            ) : null}
          </View>

          {/* What to send, the bot's own commands (packages/bot), shown as you'd type them. */}
          <ListGroup title={wt.tryTitle}>
            {wt.tries.map((x) => (
              <ListPoint key={x.send} title={x.send}>
                {x.does}
              </ListPoint>
            ))}
          </ListGroup>

          <View style={styles.section}>
            {session ? (
              <>
                <WhatsAppSection chat={false} title={wt.linkTitle} />
              </>
            ) : open ? (
              <>
                <AppText variant="heading">{wt.linkTitle}</AppText>
                <AppText muted>{wt.linkWhy}</AppText>
                <Button label={wt.signInToLink} variant="secondary" onPress={() => router.push('/sign-in')} />
              </>
            ) : null}
          </View>

          <View style={styles.privacy}>
            <AppText variant="small" muted>
              {wt.privacy}
            </AppText>
            <TextLink label={copy.account.privacy} onPress={() => openPage(LINKS.privacy)} />
          </View>
        </FocusRise>
      </ScrollView>
      <StatusBarShield />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  lead: { fontFamily: Fonts.semibold, fontSize: 18, lineHeight: 24 },
  body: { flexGrow: 1, padding: Spacing.three, paddingTop: Spacing.four, gap: Spacing.five, paddingBottom: Spacing.six },
  intro: { gap: Spacing.three },
  sub: { fontSize: 17, lineHeight: 24 },
  center: { textAlign: 'center' },
  soon: { borderLeftWidth: 3, paddingLeft: Spacing.three, paddingVertical: Spacing.one },
  section: { gap: Spacing.three },
  privacy: { gap: Spacing.one },
});
