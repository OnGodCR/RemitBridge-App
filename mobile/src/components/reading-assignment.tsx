import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ListGroup, ListRow } from '@/components/list-row';
import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { Module } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { readingFor } from '@/lib/reading';

/**
 * A finished module's last step: one or two blog posts that use its words, which the
 * person now knows enough of to read (lib/reading.ts). Shown when a lesson completes a
 * module, and on the module's page from then on.
 */
export function ReadingAssignment({ module: m, learned }: { module: Module; learned: Set<string> }) {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn;
  const posts = readingFor(m.terms, learned);
  if (!posts.length) return null;
  return (
    <View style={styles.wrap}>
      <ListGroup title={l.assignmentTitle} cards>
        <AppText style={{ color: t.textSecondary }}>{l.assignmentBody}</AppText>
        {posts.map(({ post, known }) => (
          <ListRow
            key={post.id}
            icon="newspaper"
            title={post.title}
            subtitle={l.usesWords(known)}
            onPress={() => router.push({ pathname: '/blog/[id]', params: { id: String(post.id) } })}
          />
        ))}
      </ListGroup>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: Spacing.two } });
