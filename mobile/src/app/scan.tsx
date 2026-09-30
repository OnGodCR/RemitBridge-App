import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View, type LayoutChangeEvent } from 'react-native';

import {
  detectPii,
  FIELD_NAMES,
  FIELD_SPECS,
  redactionBoxes,
  redactPage,
  toggleWord,
  type ExtractedField,
  type FieldName,
  type OcrPage,
  type Redaction,
  type ScanResponse,
} from '@remitbridge/receipt';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { AppText, Button, Card } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fill, useStrings, type Strings } from '@/i18n';
import { money } from '@/lib/format';
import { isoDay } from '@/lib/fx';
import { canScan, preparePhoto, recognize, renderRedacted, type PreparedPhoto } from '@/lib/receipt-scan';
import { forgetReceipt, sendScan } from '@/lib/receipts';
import { track } from '@/lib/track';

/**
 * Scan a receipt (DECISIONS.md D69-D72). The photo is read and redacted on the phone; the
 * person sees exactly the redacted image that would be sent, can cover more, chooses
 * whether it may be kept for research, and only then is anything sent.
 *
 * Phase 2 ends at a plain list of what was read. The confirmation screen (tap a value on
 * the photo to correct it) and the result screen replace it in Phase 3.
 */

type Step =
  | { kind: 'start'; message?: string }
  | { kind: 'reading' }
  | { kind: 'preview'; photo: PreparedPhoto; page: OcrPage; hidden: Redaction[]; redacted: string; sending: boolean; message?: string }
  | { kind: 'done'; result: ScanResponse; deleted: boolean };

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
    setStep({ kind: 'done', result: sent.result, deleted: false });
  };

  const forget = async () => {
    if (step.kind !== 'done') return;
    if (await forgetReceipt(step.result.id)) setStep({ ...step, deleted: true });
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

      {step.kind === 'done' ? <ReadValues result={step.result} deleted={step.deleted} onForget={forget} onAgain={() => setStep({ kind: 'start' })} strings={strings} /> : null}

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

/** Phase 2's stand-in for the confirmation screen: what was read, and where it came from. */
function ReadValues({
  result,
  deleted,
  onForget,
  onAgain,
  strings,
}: {
  result: ScanResponse;
  deleted: boolean;
  onForget: () => void;
  onAgain: () => void;
  strings: Strings;
}) {
  const t = useTheme();
  const s = strings.scan;
  const read = FIELD_NAMES.filter((f) => result.fields[f]);
  return (
    <>
      <AppText variant="heading">{s.readTitle}</AppText>
      <AppText muted>{fill(s.readSummary, { read: read.length, total: FIELD_NAMES.length })}</AppText>
      <Card>
        {FIELD_NAMES.map((name, i) => {
          const field = result.fields[name];
          const check = result.to_confirm.includes(name);
          return (
            <View key={name} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border }]}>
              <View style={styles.flex}>
                <AppText variant="label">{strings.fields[name]}</AppText>
                {field ? (
                  <AppText variant="small" muted>
                    {strings.paths[field.path]}
                  </AppText>
                ) : null}
                {check ? (
                  <AppText variant="small" style={{ color: t.moneyMarkup }}>
                    {s.toCheck}
                  </AppText>
                ) : null}
              </View>
              <AppText variant={field ? 'label' : 'small'} muted={!field}>
                {field ? show(name, field, result, strings) : s.notFound}
              </AppText>
            </View>
          );
        })}
      </Card>
      <View style={styles.buttons}>
        {deleted ? <AppText muted>{s.deleted}</AppText> : <Button label={s.deleteNow} variant="secondary" onPress={onForget} />}
        <Button label={s.another} variant="plain" onPress={onAgain} />
      </View>
    </>
  );
}

/** A value as the person would read it on the receipt. */
function show(name: FieldName, field: ExtractedField, result: ScanResponse, strings: Strings): string {
  const v = field.value;
  if (name === 'funding_method') return strings.funding[v as keyof Strings['funding']];
  if (name === 'delivery_method') return strings.delivery[v as keyof Strings['delivery']];
  if (FIELD_SPECS[name].kind === 'money' && typeof v === 'number') {
    const receiving = name === 'amount_received' || name === 'pickup_charge';
    const currency = (receiving ? result.fields.receive_currency?.value : result.fields.send_currency?.value) as string | undefined;
    return currency ? money(v, currency) : String(v);
  }
  return String(v);
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
