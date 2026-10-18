import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch } from 'react-native';

import { DisplayTitle, Eyebrow } from '@/components/brand';
import { ListRow } from '@/components/list-row';
import { Rise } from '@/components/motion-views';
import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { announce } from '@/lib/announce';
import { useAuth } from '@/lib/auth';
import { acceptLegal, acceptedVersion } from '@/lib/legal';
import { track } from '@/lib/track';

/**
 * Agreeing to the terms and privacy policy (D188, Angad 2026-10-17). Shown once an account
 * exists and hasn't agreed to the current versions: right after signing up, and again for
 * everyone with an account whenever either document's date changes. Both documents open
 * inside the app. Nothing is pre-ticked; the agreement is saved on the account with the
 * version and time. Saying no signs out, and the app goes on working without an account.
 */
export default function Consent() {
  const t = useTheme();
  const copy = useCopy();
  const c = copy.legal;
  const { session, signOut } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  // Someone who agreed to an older version is told why they're seeing this again.
  const returning = acceptedVersion(session) !== null;

  const accept = async () => {
    setBusy(true);
    setFailed(false);
    const ok = await acceptLegal();
    setBusy(false);
    if (ok) {
      track('legal_accepted');
      // The new session drops this screen's guard and the tabs come back on their own.
    } else {
      setFailed(true);
      announce(c.failed);
    }
  };

  const decline = async () => {
    track('legal_declined');
    await signOut();
  };

  return (
    <Step
      actions={
        <Rise step={4} style={styles.actions}>
          <Button label={c.accept} trailingIcon="arrow.right" onPress={accept} disabled={!agreed} loading={busy} />
          <Button label={c.decline} variant="plain" onPress={decline} />
          <AppText variant="small" muted style={styles.center}>
            {c.declineNote}
          </AppText>
        </Rise>
      }>
      <Rise step={0} style={styles.head}>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <DisplayTitle lead={c.lead} accent={c.accent} />
        <AppText style={[styles.intro, { color: t.textSecondary }]}>{returning ? c.changed : c.intro}</AppText>
      </Rise>

      <Rise step={1} style={styles.docs}>
        <ListRow icon="doc.text" title={copy.account.terms} subtitle={copy.account.termsSub} onPress={() => router.push('/legal/terms')} />
        <ListRow icon="hand.raised" title={copy.account.privacy} subtitle={copy.account.privacySub} onPress={() => router.push('/legal/privacy')} />
      </Rise>

      <Rise step={2}>
        <Pressable
          onPress={() => setAgreed((v) => !v)}
          accessibilityRole="switch"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel={c.agree}
          style={styles.agree}>
          <AppText style={[styles.agreeText, { color: t.text }]}>{c.agree}</AppText>
          <Switch
            value={agreed}
            onValueChange={setAgreed}
            trackColor={{ true: t.primary, false: t.border }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </Pressable>
      </Rise>

      {failed ? (
        <AppText variant="label" style={{ color: t.destructive }} accessibilityLiveRegion="polite">
          {c.failed}
        </AppText>
      ) : null}
    </Step>
  );
}

const styles = StyleSheet.create({
  head: { gap: Spacing.three },
  intro: { fontSize: 16, lineHeight: 23 },
  docs: { gap: Spacing.two },
  agree: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  agreeText: { flex: 1, fontSize: 16, lineHeight: 23 },
  actions: { gap: Spacing.two },
  center: { textAlign: 'center' },
});
