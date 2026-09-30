import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type LayoutChangeEvent } from 'react-native';

import {
  checkValue,
  DELIVERY_METHODS,
  FIELD_NAMES,
  FIELD_SPECS,
  spanBox,
  type FieldName,
  type FieldValues,
  type OcrPage,
  type ScanResponse,
} from '@remitbridge/receipt';
import { FUNDING_METHODS } from '@remitbridge/formula';

import { ChoiceList } from '@/components/choice-list';
import { AppText, Button, Card } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fill, useStrings } from '@/i18n';
import { today } from '@/lib/fx';
import { editText, formatValue, parseTyped } from '@/lib/receipt-format';

/**
 * The confirmation screen (Phase 3, item 1e). The redacted photo with every value that was
 * read outlined where it was read; values to check are outlined in amber and listed first.
 * Tapping a value, on the photo or in the list, opens it for editing. Every value to check
 * needs an answer (a correction, or "This is right") before the result is worked out.
 * The person's answers go to the server as user_corrected values.
 */
export type Answers = Partial<Record<FieldName, FieldValues[FieldName]>>;

export function ReceiptConfirm({
  photo,
  page,
  result,
  sending,
  message,
  onConfirm,
}: {
  photo: { width: number; height: number; redacted: string };
  page: OcrPage;
  result: ScanResponse;
  sending: boolean;
  message?: string;
  onConfirm: (answers: Answers) => void;
}) {
  const t = useTheme();
  const strings = useStrings();
  const s = strings.confirm;
  const [answers, setAnswers] = useState<Answers>({});
  const [editing, setEditing] = useState<FieldName | null>(null);
  const [width, setWidth] = useState(0);

  const valueOf = (name: FieldName) => (name in answers ? answers[name] : result.fields[name]?.value);
  const values = Object.fromEntries(FIELD_NAMES.map((f) => [f, valueOf(f)]).filter(([, v]) => v !== undefined)) as Partial<FieldValues>;
  const flagged = new Set(result.to_confirm);
  const left = result.to_confirm.filter((f) => !(f in answers));
  const ordered = [...result.to_confirm, ...FIELD_NAMES.filter((f) => !flagged.has(f))];
  const answer = (name: FieldName, value: FieldValues[FieldName]) => {
    setAnswers((a) => ({ ...a, [name]: value }));
    setEditing(null);
  };
  const scale = width / photo.width;

  return (
    <>
      <AppText variant="heading">{s.title}</AppText>
      <AppText muted>{s.help}</AppText>

      <View
        testID="confirm-photo"
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        style={[styles.photo, { aspectRatio: photo.width / photo.height, borderColor: t.border }]}>
        <Image source={{ uri: `data:image/jpeg;base64,${photo.redacted}` }} style={StyleSheet.absoluteFill} contentFit="fill" />
        {width > 0
          ? FIELD_NAMES.map((name) => {
              const source = result.fields[name]?.source;
              const box = source ? spanBox(page, source) : null;
              if (!box) return null;
              const warn = flagged.has(name) && !(name in answers);
              return (
                <Pressable
                  key={name}
                  onPress={() => setEditing(name)}
                  accessibilityRole="button"
                  accessibilityLabel={`${strings.fields[name]}: ${formatValue(name, valueOf(name), values, strings)}${warn ? `. ${strings.scan.toCheck}` : ''}`}
                  style={[
                    styles.mark,
                    {
                      left: box.x * scale - 3,
                      top: box.y * scale - 3,
                      width: box.width * scale + 6,
                      height: box.height * scale + 6,
                      borderColor: warn ? t.moneyMarkup : t.primary,
                      borderWidth: warn ? 3 : 2,
                    },
                  ]}
                />
              );
            })
          : null}
      </View>

      {editing ? (
        <Editor
          key={editing}
          name={editing}
          value={valueOf(editing)}
          values={values}
          suggestion={result.suspect?.field === editing ? result.suspect.suggestion : undefined}
          flagged={flagged.has(editing)}
          onSave={(v) => answer(editing, v)}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <Card>
        {ordered.map((name, i) => {
          const value = valueOf(name);
          const warn = flagged.has(name) && !(name in answers);
          return (
            <Pressable
              key={name}
              onPress={() => setEditing(name)}
              accessibilityRole="button"
              accessibilityHint={s.help}
              style={({ pressed }) => [
                styles.row,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                warn && { borderLeftWidth: 3, borderLeftColor: t.moneyMarkup, paddingLeft: Spacing.two },
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <View style={styles.flex}>
                <AppText variant="label">{strings.fields[name]}</AppText>
                <AppText variant="small" muted>
                  {name in answers ? strings.paths.user_corrected : result.fields[name] ? strings.paths[result.fields[name]!.path] : strings.scan.notFound}
                </AppText>
                {warn ? (
                  <AppText variant="small" style={{ color: t.moneyMarkup }}>
                    {strings.scan.toCheck}
                  </AppText>
                ) : null}
              </View>
              <AppText variant={value !== undefined ? 'label' : 'small'} muted={value === undefined}>
                {value !== undefined ? formatValue(name, value, values, strings) : '–'}
              </AppText>
            </Pressable>
          );
        })}
      </Card>

      {message ? <AppText style={{ color: t.destructive }}>{message}</AppText> : null}
      <Button
        label={left.length === 0 ? s.ready : left.length === 1 ? s.leftOne : fill(s.left, { count: left.length })}
        disabled={left.length > 0}
        loading={sending}
        onPress={() => onConfirm(answers)}
      />
    </>
  );
}

/** Changing one value: a text field for numbers, codes, dates and names; a list for methods. */
function Editor({
  name,
  value,
  values,
  suggestion,
  flagged,
  onSave,
  onCancel,
}: {
  name: FieldName;
  value: unknown;
  values: Partial<FieldValues>;
  suggestion?: number;
  flagged: boolean;
  onSave: (value: FieldValues[FieldName]) => void;
  onCancel: () => void;
}) {
  const t = useTheme();
  const strings = useStrings();
  const s = strings.confirm;
  const spec = FIELD_SPECS[name];
  const [text, setText] = useState(editText(name, value));
  const [error, setError] = useState(false);

  const save = (raw: unknown) => {
    const checked = checkValue(name, raw, today());
    if (!checked.ok) {
      setError(true);
      return;
    }
    onSave(checked.value);
  };

  const options =
    name === 'funding_method'
      ? FUNDING_METHODS.map((f) => ({ value: f as string, label: strings.funding[f] }))
      : name === 'delivery_method'
        ? DELIVERY_METHODS.map((d) => ({ value: d as string, label: strings.delivery[d] }))
        : null;

  return (
    <Card style={{ borderColor: t.primary }}>
      <AppText variant="label">{fill(s.editing, { field: strings.fields[name] })}</AppText>
      {options ? (
        <ChoiceList label={strings.fields[name]} options={options} value={typeof value === 'string' ? value : null} onChange={(v) => save(v)} />
      ) : (
        <TextInput
          value={text}
          onChangeText={(v) => {
            setText(v);
            setError(false);
          }}
          autoFocus
          accessibilityLabel={strings.fields[name]}
          placeholder={spec.kind === 'date' ? s.datePlaceholder : spec.kind === 'currency' ? s.currencyPlaceholder : undefined}
          placeholderTextColor={t.textSecondary}
          keyboardType={spec.kind === 'money' || spec.kind === 'rate' ? 'decimal-pad' : spec.kind === 'date' ? 'numbers-and-punctuation' : 'default'}
          autoCapitalize={spec.kind === 'currency' ? 'characters' : 'none'}
          autoCorrect={false}
          style={[styles.input, { color: t.text, borderColor: error ? t.destructive : t.border, backgroundColor: t.background }]}
        />
      )}
      {error ? <AppText style={{ color: t.destructive }}>{fill(s.invalid, { field: strings.fields[name].toLowerCase() })}</AppText> : null}
      {suggestion !== undefined ? (
        <>
          <AppText variant="small" muted>
            {fill(s.suggestion, { value: formatValue(name, suggestion, values, strings) })}
          </AppText>
          <Button
            label={fill(s.useSuggestion, { value: formatValue(name, suggestion, values, strings) })}
            variant="secondary"
            onPress={() => save(suggestion)}
          />
        </>
      ) : null}
      <View style={styles.buttons}>
        {!options ? <Button label={s.save} onPress={() => save(parseTyped(name, text))} /> : null}
        {flagged && value !== undefined ? <Button label={s.looksRight} variant="secondary" onPress={() => save(value)} /> : null}
        <Button label={s.cancel} variant="plain" onPress={onCancel} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', borderRadius: Radius.md, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  mark: { position: 'absolute', borderRadius: Radius.sm },
  row: { minHeight: MinTapTarget, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  flex: { flex: 1 },
  input: {
    minHeight: MinTapTarget,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.medium,
    fontSize: 17,
  },
  buttons: { gap: Spacing.two },
});
