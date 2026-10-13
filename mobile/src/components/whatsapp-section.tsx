import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';

import { ListGroup, ListRow } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { useCopy, useLanguage } from '@/i18n';
import { announce } from '@/lib/announce';
import { useAuth } from '@/lib/auth';
import { track } from '@/lib/track';
import {
  formatNumber,
  linkStatus,
  newLinkCode,
  openChat,
  unlinkWhatsApp,
  whatsAppSettings,
  type LinkStatus,
  type WhatsAppSettings,
} from '@/lib/whatsapp';

/**
 * The WhatsApp rows (DECISIONS.md D138), on the WhatsApp tab since D147: chat with the bot
 * (its number under the row; the tab passes chat={false} and shows its own button), and,
 * signed in, link this account's WhatsApp so "SAVE 500 to India" there lands in Saved. Shown to everyone once the bot can reply to anyone (app_settings.whatsapp_live);
 * until then only in development builds, for testing with Meta's test number.
 */
export function WhatsAppSection({ chat = true, title }: { chat?: boolean; title?: string } = {}) {
  const copy = useCopy();
  const w = copy.whatsapp;
  const { language } = useLanguage();
  const { session } = useAuth();
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    whatsAppSettings().then((s) => live && setSettings(s));
    return () => {
      live = false;
    };
  }, []);

  // The link happens in WhatsApp, so check again whenever the person comes back.
  const refresh = useCallback(async () => {
    const s = session ? await linkStatus() : null;
    setStatus(s);
    if (s?.linked) setNote(null);
  }, [session]);
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  if (!settings || !(settings.live || __DEV__)) return null;

  const link = async () => {
    const code = await newLinkCode();
    if (!code) {
      setNote(w.failed);
      announce(w.failed);
      return;
    }
    track('whatsapp_link_started', {});
    setNote(w.linkSent);
    if (!(await openChat(settings.number, `LINK ${code}`))) setNote(w.openFailed(formatNumber(settings.number)));
  };

  const confirmUnlink = () =>
    Alert.alert(w.unlinkTitle, w.unlinkBody, [
      { text: w.cancel, style: 'cancel' },
      {
        text: w.unlink,
        style: 'destructive',
        onPress: async () => {
          if (await unlinkWhatsApp()) {
            setStatus({ linked: false, linkedAt: null });
            announce(w.unlinked);
          } else {
            setNote(w.failed);
          }
        },
      },
    ]);

  const since = status?.linkedAt
    ? new Date(status.linkedAt).toLocaleDateString(language.locale, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <>
      <ListGroup title={title ?? w.title} cards>
        {chat ? (
          <ListRow
            external
            icon="message"
            title={w.chat}
            subtitle={formatNumber(settings.number)}
            onPress={async () => {
              if (!(await openChat(settings.number, w.hello))) Alert.alert(w.title, w.openFailed(formatNumber(settings.number)));
            }}
          />
        ) : null}
        {session && status?.linked ? (
          <ListRow icon="link" title={w.linked} subtitle={w.linkedSub(since)} onPress={confirmUnlink} />
        ) : null}
      </ListGroup>
      {/* Signed in and not known to be linked: a real button, shown even when the status
          check fails, since a bare heading with nothing to tap is what Angad found on his
          Samsung (2026-10-12). Linking again is harmless: the server replaces the old code. */}
      {session && !status?.linked ? (
        <>
          <AppText muted>{w.linkSub}</AppText>
          <Button label={w.link} variant="secondary" onPress={link} />
          <AppText variant="small" muted>
            {w.linkNote}
          </AppText>
        </>
      ) : null}
      {note ? <AppText muted>{note}</AppText> : null}
      {!settings.live ? (
        <AppText variant="small" muted>
          {w.devOnly}
        </AppText>
      ) : null}
    </>
  );
}
