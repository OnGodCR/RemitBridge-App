import { Stack, useLocalSearchParams } from 'expo-router';

import { LegalDocument } from '@/components/legal-document';
import { LEGAL_DOCS, type LegalDocId } from '@/lib/legal';

/** The terms of use or the privacy policy as a pushed screen (D188). */
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const id: LegalDocId = doc === 'privacy' ? 'privacy' : 'terms';
  return (
    <>
      <Stack.Screen options={{ title: LEGAL_DOCS[id].title }} />
      <LegalDocument id={id} />
    </>
  );
}
