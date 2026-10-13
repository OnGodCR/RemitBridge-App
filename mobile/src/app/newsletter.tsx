import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ListGroup } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EnglishOnly } from '@/i18n';
import { sendIssue, sentIssues, subscriberCount, type SentIssue } from '@/lib/newsletter';

/**
 * Writing the newsletter (D169), for admins. Plain text: a blank line starts a paragraph, and
 * web addresses become links. A test goes to your own address first; sending to everyone asks
 * once more, and the function refuses a second send within 10 minutes and any full send until
 * site.config.json has a postal address.
 */
function NewsletterScreen() {
  const t = useTheme();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [issues, setIssues] = useState<SentIssue[]>([]);
  const [busy, setBusy] = useState<'test' | 'send' | null>(null);

  const load = useCallback(async () => {
    const [c, i] = await Promise.all([subscriberCount(), sentIssues()]);
    setCount(c);
    setIssues(i);
  }, []);
  useEffect(() => {
    let live = true;
    Promise.all([subscriberCount(), sentIssues()]).then(([c, i]) => {
      if (!live) return;
      setCount(c);
      setIssues(i);
    });
    return () => {
      live = false;
    };
  }, []);

  const ready = subject.trim().length > 0 && body.trim().length > 0;

  const run = async (mode: 'test' | 'send') => {
    setBusy(mode);
    const r = await sendIssue(mode, subject, body);
    setBusy(null);
    if (!r.ok) {
      Alert.alert('Not sent', r.message);
      return;
    }
    if (mode === 'test') {
      Alert.alert('Test sent', `Check ${r.to ?? 'your inbox'}.`);
      return;
    }
    Alert.alert('Sent', r.failed ? `${r.sent} sent, ${r.failed} failed. Resend's free plan sends 100 a day.` : `${r.sent} sent.`);
    if (!r.failed) {
      setSubject('');
      setBody('');
    }
    load();
  };

  const confirmSend = () =>
    Alert.alert('Send to everyone?', `"${subject.trim()}" goes to ${count ?? 'every'} ${count === 1 ? 'person' : 'people'}. It can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: () => run('send') },
    ]);

  const input = [styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim }];
  return (
    <ScrollView style={{ backgroundColor: t.background }} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
      <StatusBar style="auto" />
      <AppText muted>
        {count === null ? 'Counting subscribers…' : `${count} ${count === 1 ? 'person gets' : 'people get'} the next issue.`}
      </AppText>
      <View style={styles.field}>
        <AppText variant="label" muted>
          Subject
        </AppText>
        <TextInput value={subject} onChangeText={setSubject} maxLength={150} placeholder="Kenya is on RemitBridge" placeholderTextColor={t.textSecondary} accessibilityLabel="Subject" style={input} />
      </View>
      <View style={styles.field}>
        <AppText variant="label" muted>
          Message
        </AppText>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={20000}
          placeholder={'Hi,\n\nA blank line starts a new paragraph. Links like https://app.remitbridgelabs.org work.'}
          placeholderTextColor={t.textSecondary}
          accessibilityLabel="Message"
          textAlignVertical="top"
          style={[input, styles.body]}
        />
        <AppText variant="small" muted>
          Every issue ends with why they got it, a one-tap unsubscribe link, and the name, postal address and email of RemitBridge Labs.
        </AppText>
      </View>
      <View style={styles.actions}>
        <Button label="Send a test to me" variant="secondary" disabled={!ready} loading={busy === 'test'} onPress={() => run('test')} />
        <Button label={count ? `Send to ${count} ${count === 1 ? 'person' : 'people'}` : 'Send to everyone'} disabled={!ready || !count} loading={busy === 'send'} onPress={confirmSend} />
      </View>
      {issues.length ? (
        <ListGroup title="Sent">
          {issues.map((i) => (
            <View key={i.id} style={[styles.row, { borderBottomColor: t.border }]}>
              <AppText>{i.subject}</AppText>
              <AppText variant="small" muted>
                {new Date(i.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · {i.sent} of {i.recipients} sent
                {i.failed ? ` · ${i.failed} failed` : ''}
              </AppText>
            </View>
          ))}
        </ListGroup>
      ) : null}
    </ScrollView>
  );
}

/** Admin-only, so English whatever the app's language (DECISIONS.md D69). */
export default function NewsletterScreenRoute() {
  return (
    <EnglishOnly>
      <NewsletterScreen />
    </EnglishOnly>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  field: { gap: Spacing.two },
  input: {
    minHeight: MinTapTarget + 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 3,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.regular,
    fontSize: 17,
  },
  body: { minHeight: 220 },
  actions: { gap: Spacing.three },
  row: { paddingVertical: Spacing.two, gap: Spacing.one, borderBottomWidth: StyleSheet.hairlineWidth },
});
