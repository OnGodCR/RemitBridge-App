import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { LEGAL_DOCS, type LegalDocId, type LegalSpan } from '@/lib/legal';
import { LINKS, openPage } from '@/lib/links';

/**
 * The terms of use or the privacy policy, read inside the app (D188): the site's own words,
 * in the app's type, with a link to the same page on the web. Shown by the legal/[doc]
 * screen (from Account, Remmy and WhatsApp) and inside the consent step.
 */
export function LegalDocument({ id }: { id: LegalDocId }) {
  const t = useTheme();
  const gutter = useGutter();
  const copy = useCopy();
  const { language } = useLanguage();
  const page = LEGAL_DOCS[id];

  return (
    <ScrollView style={{ backgroundColor: t.background }} contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]} contentInsetAdjustmentBehavior="automatic">
      <AppText variant="small" muted>
        {page.updated}
      </AppText>
      {/* Legal text stays in English until it has been translated and reviewed. */}
      {language.code !== 'en' ? (
        <AppText variant="small" muted>
          {copy.legal.englishOnly}
        </AppText>
      ) : null}
      {page.blocks.map((block, i) =>
        block.kind === 'heading' ? (
          <AppText key={i} accessibilityRole="header" accessibilityLanguage="en-US" style={[styles.heading, { color: t.text }]}>
            {block.text}
          </AppText>
        ) : (
          <View key={i} style={block.kind === 'item' ? styles.item : undefined}>
            {block.kind === 'item' ? <AppText style={[styles.bullet, { color: t.textSecondary }]}>{'•'}</AppText> : null}
            <AppText accessibilityLanguage="en-US" style={[styles.body, block.kind === 'item' && styles.itemText]}>
              {block.spans.map((span, j) => (
                <Span key={j} span={span} />
              ))}
            </AppText>
          </View>
        ),
      )}
      <AppText style={[styles.web, { color: t.primary }]} accessibilityRole="link" onPress={() => openPage(LINKS[id])}>
        {copy.legal.openOnWeb}
      </AppText>
    </ScrollView>
  );
}

function Span({ span }: { span: LegalSpan }) {
  const t = useTheme();
  if (span.href) {
    const href = span.href;
    return (
      <AppText
        accessibilityRole="link"
        style={[styles.body, styles.link, { color: t.primary }]}
        onPress={() => (href.startsWith('mailto:') ? Linking.openURL(href).catch(() => undefined) : openPage(href))}>
        {span.text}
      </AppText>
    );
  }
  return <AppText style={[styles.body, span.bold && styles.bold]}>{span.text}</AppText>;
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three },
  heading: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 24, marginTop: Spacing.three },
  body: { fontSize: 16, lineHeight: 24 },
  bold: { fontFamily: Fonts.bold },
  link: { textDecorationLine: 'underline' },
  item: { flexDirection: 'row', gap: Spacing.two },
  bullet: { fontSize: 16, lineHeight: 24 },
  itemText: { flex: 1 },
  web: { fontFamily: Fonts.semibold, fontSize: 16, marginTop: Spacing.three },
});
