import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View, type LayoutChangeEvent } from 'react-native';

import {
  detectPii,
  redactionBoxes,
  redactPage,
  toggleWord,
  type ConfirmResponse,
  type OcrPage,
  type Redaction,
  type ScanResponse,
} from '@remitbridge/receipt';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { ReceiptConfirm, type Answers } from '@/components/receipt-confirm';
import { ReceiptResult } from '@/components/receipt-result';
import { AppText, Button, Card } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fill, useStrings, type Strings } from '@/i18n';
import { isoDay } from '@/lib/fx';
import { canScan, preparePhoto, recognize, renderRedacted, type PreparedPhoto } from '@/lib/receipt-scan';
import { confirmScan, forgetReceipt, sendScan } from '@/lib/receipts';
import { track } from '@/lib/track';

/**
 * Scan a receipt (DECISIONS.md D69-D72). The photo is read and redacted on the phone; the
 * person sees exactly the redacted image that would be sent, can cover more, chooses
 * whether it may be kept for research, and only then is anything sent.
 *
 * Then the confirmation screen (every value outlined where it was read, the unsure ones
 * first, any of them correctable) and the result (true cost, advertised vs. paid, the tax
 * check, next time).
 */

type Step =
  | { kind: 'start'; message?: string }
  | { kind: 'reading' }
  | { kind: 'preview'; photo: PreparedPhoto; page: OcrPage; hidden: Redaction[]; redacted: string; sending: boolean; message?: string }
  | {
      kind: 'confirm';
      photo: PreparedPhoto;
      page: OcrPage;
      redacted: string;
      result: ScanResponse;
      sending: boolean;
      message?: string;
    }
  | { kind: 'result'; id: string; confirmed: ConfirmResponse; deleted: boolean };

export default function ScanScreen() {
  const t = useTheme();
  const strings = useStrings();
  const s = strings.scan;
  const [step, setStep] = useState<Step>({ kind: 'start' });
  const [consent, setConsent] = useState(false);

  useEffect(() => track('tool_opened', { tool: 'receipt_scan' }), []);

  const pick = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setStep({ kind: 'start', message: source === 'camera' ? s.cameraDenied : s.photosDenied });
      return;
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, exif: false };
    const picked = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = picked.canceled ? null : picked.assets[0];
    if (!asset) return;

    setStep({ kind: 'reading' });
    try {
      const photo = await preparePhoto(asset.uri, asset.width, asset.height);
      const ocr = await recognize(photo);
      if (!ocr.ok) {
        setStep({ kind: 'start', message: ocr.reason === 'no_text' ? s.noText : ocr.reason === 'misaligned' ? s.misaligned : s.needsBuild });
        return;
      }
      const hidden = detectPii(ocr.page);
      setStep({ kind: 'preview', photo, page: ocr.page, hidden, redacted: renderRedacted(photo, redactionBoxes(ocr.page, hidden)), sending: false });
    } catch {
      setStep({ kind: 'start', message: s.failed });
    }
  };

  const tap = (line: number, word: number) => {
    if (step.kind !== 'preview' || step.sending) return;
    const hidden = toggleWord(step.hidden, line, word);
    if (hidden === step.hidden) return;
    setStep({ ...step, hidden, redacted: renderRedacted(step.photo, redactionBoxes(step.page, hidden)) });
  };

  const send = async () => {
    if (step.kind !== 'preview') return;
    setStep({ ...step, sending: true, message: undefined });
    const sent = await sendScan({
      page: redactPage(step.page, step.hidden),
      image: { mediaType: 'image/jpeg', base64: step.redacted },
      research_consent: consent,
      today: isoDay(new Date()),
    });
    if (!sent.ok) {
      setStep({ ...step, sending: false, message: sent.reason === 'not_connected' ? s.notConnected : s.sendFailed });
      return;
    }
    // Counts only (D31): how much was read and whether it added up, never a value.
    track('receipt_scanned', {
      fields_read: Object.keys(sent.result.fields).length,
      model_asked: sent.result.model.asked.length,
      checks_passed: sent.result.checks.every((c) => c.ok),
      research_consent: consent,
    });
    setStep({ kind: 'confirm', photo: step.photo, page: redactPage(step.page, step.hidden), redacted: step.redacted, result: sent.result, sending: false });
  };

  const confirm = async (answers: Answers) => {
    if (step.kind !== 'confirm') return;
    setStep({ ...step, sending: true, message: undefined });
    const done = await confirmScan(step.result.id, answers, isoDay(new Date()));
    if (!done.ok) {
      setStep({ ...step, sending: false, message: done.reason === 'expired' ? strings.confirm.expired : strings.confirm.failed });
      return;
    }
    track('receipt_confirmed', {
      corrected: Object.keys(answers).length,
      compared: done.confirmed.comparison.quote !== null,
    });
    setStep({ kind: 'result', id: step.result.id, confirmed: done.confirmed, deleted: false });
  };

  const forget = async () => {
    if (step.kind !== 'result') return;
    if (await forgetReceipt(step.id)) setStep({ ...step, deleted: true });
  };

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      {step.kind === 'start' ? (
        <>
          <AppText muted>{s.intro}</AppText>
          {canScan() ? (
            <View style={styles.buttons}>
              <Button label={s.takePhoto} onPress={() => pick('camera')} />
              <Button label={s.choosePhoto} variant="secondary" onPress={() => pick('library')} />
            </View>
          ) : (
            <Card>
              <AppText>{s.needsBuild}</AppText>
            </Card>
          )}
          {step.message ? <AppText style={{ color: t.destructive }}>{step.message}</AppText> : null}
        </>
      ) : null}

      {step.kind === 'reading' ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <AppText muted>{s.reading}</AppText>
        </View>
      ) : null}

      {step.kind === 'preview' ? (
        <>
          <AppText variant="heading">{s.previewTitle}</AppText>
          <AppText muted>{s.previewHelp}</AppText>
          <RedactedPhoto photo={step.photo} page={step.page} hidden={step.hidden} redacted={step.redacted} onTap={tap} strings={s} />
          <AppText variant="small" muted>
            {redactionBoxes(step.page, step.hidden).length === 1
              ? s.coveredOne
              : fill(s.coveredMany, { count: redactionBoxes(step.page, step.hidden).length })}
          </AppText>

          <Card>
            <View style={styles.consent}>
              <AppText variant="label" style={styles.flex}>
                {s.consentLabel}
              </AppText>
              <Switch
                value={consent}
                onValueChange={setConsent}
                trackColor={{ true: t.primary, false: t.border }}
                accessibilityLabel={s.consentLabel}
              />
            </View>
            <AppText variant="small" muted>
              {s.consentHelp}
            </AppText>
          </Card>

          {step.message ? <AppText style={{ color: t.destructive }}>{step.message}</AppText> : null}
          <View style={styles.buttons}>
            <Button label={s.send} onPress={send} loading={step.sending} />
            <Button label={s.retake} variant="plain" disabled={step.sending} onPress={() => setStep({ kind: 'start' })} />
          </View>
        </>
      ) : null}

      {step.kind === 'confirm' ? (
        <ReceiptConfirm
          photo={{ width: step.photo.width, height: step.photo.height, redacted: step.redacted }}
          page={step.page}
          result={step.result}
          sending={step.sending}
          message={step.message}
          onConfirm={confirm}
        />
      ) : null}

      {step.kind === 'result' ? (
        <>
          <ReceiptResult confirmed={step.confirmed} />
          <View style={styles.buttons}>
            {step.deleted ? <AppText muted>{s.deleted}</AppText> : <Button label={s.deleteNow} variant="secondary" onPress={forget} />}
            <Button label={s.another} variant="plain" onPress={() => setStep({ kind: 'start' })} />
          </View>
        </>
      ) : null}

      <DoesNotTellYou title={strings.limitsTitle} items={s.limits} />
    </ScrollView>
  );
}

/**
 * The redacted photo as it will be sent, with an invisible tap target over every word the
 * rules didn't already cover, so the person can cover more (or uncover what they covered).
 */
function RedactedPhoto({
  photo,
  page,
  hidden,
  redacted,
  onTap,
  strings: s,
}: {
  photo: PreparedPhoto;
  page: OcrPage;
  hidden: Redaction[];
  redacted: string;
  onTap: (line: number, word: number) => void;
  strings: Strings['scan'];
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const scale = width / photo.width;
  const byWord = new Map(hidden.map((r) => [`${r.line}:${r.word}`, r.kind]));

  return (
    <View
      testID="receipt-photo"
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.photo, { aspectRatio: photo.width / photo.height, borderColor: t.border }]}>
      <Image source={{ uri: `data:image/jpeg;base64,${redacted}` }} style={StyleSheet.absoluteFill} contentFit="fill" />
      {width > 0
        ? page.lines.flatMap((line, i) =>
            line.words.map((w, j) => {
              const kind = byWord.get(`${i}:${j}`);
              if (kind && kind !== 'manual') return null;
              return (
                <Pressable
                  key={`${i}:${j}`}
                  onPress={() => onTap(i, j)}
                  accessibilityRole="button"
                  accessibilityLabel={kind === 'manual' ? s.tapCovered : fill(s.tapWord, { text: w.text })}
                  hitSlop={4}
                  style={{
                    position: 'absolute',
                    left: w.box.x * scale,
                    top: w.box.y * scale,
                    width: Math.max(w.box.width * scale, 12),
                    height: Math.max(w.box.height * scale, 12),
                  }}
                />
              );
            }),
          )
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  buttons: { gap: Spacing.two },
  center: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five },
  photo: { width: '100%', borderRadius: Radius.md, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  consent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
});
