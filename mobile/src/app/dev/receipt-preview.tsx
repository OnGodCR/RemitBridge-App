import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ReceiptConfirm } from '@/components/receipt-confirm';
import { ReceiptResult } from '@/components/receipt-result';
import { AppText, Segmented } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { SAMPLE_PAGE, SAMPLE_RESULT, SAMPLE_RESULT_NONE, SAMPLE_RESULT_TODAY, SAMPLE_SCAN } from '@/dev/receipt-samples';
import { SAMPLE_RECEIPT_JPEG } from '@/dev/sample-receipt';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

type Part = 'check' | 'result' | 'today' | 'none';

/**
 * The scanner's later screens with made-up receipts (D124): the check of what was read, and
 * the result three ways (that day's prices, today's, and nothing fair to compare). Expo Go
 * can't scan, so this is how they're seen before the iPhone build. Development builds only:
 * a release build sends this route home.
 */
export default function ReceiptPreview() {
  const t = useTheme();
  const copy = useCopy();
  const d = copy.devPreview;
  const [part, setPart] = useState<Part>('check');
  if (!__DEV__) return <Redirect href="/" />;

  return (
    <ScrollView style={{ backgroundColor: t.background }} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <AppText muted>{d.intro}</AppText>
      <Segmented
        options={[
          { value: 'check', label: d.check },
          { value: 'result', label: d.result },
          { value: 'today', label: d.today },
          { value: 'none', label: d.none },
        ]}
        value={part}
        onChange={setPart}
      />
      {part === 'check' ? (
        <ReceiptConfirm
          photo={{ width: SAMPLE_RECEIPT_JPEG.width, height: SAMPLE_RECEIPT_JPEG.height, redacted: SAMPLE_RECEIPT_JPEG.base64 }}
          page={SAMPLE_PAGE}
          result={SAMPLE_SCAN}
          sending={false}
          onConfirm={() => setPart('result')}
        />
      ) : (
        <ReceiptResult confirmed={part === 'result' ? SAMPLE_RESULT : part === 'today' ? SAMPLE_RESULT_TODAY : SAMPLE_RESULT_NONE} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
});
