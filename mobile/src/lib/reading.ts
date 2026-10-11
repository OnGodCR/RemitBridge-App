import { POSTS, type BlogBlock, type BlogPost } from '@/data/blog';

/**
 * The reading assignment at the end of a module (Angad, 2026-10-11: "after each module,
 * prompt the person to go read blog posts that they have sufficient vocabulary [for] as
 * their final assignment"). Posts mark their glossary words as {{term-id|words}}, so the
 * app can tell which posts someone now has the words for.
 *
 * A post qualifies when it's written in full, uses at least one word from the module just
 * finished, and the person knows at least READY of all its marked words. The best ones use
 * the most words from this module, then the ones they know best. If none qualifies yet,
 * the post that uses the most of this module's words stands in, so there's always a next
 * step.
 */
const READY = 0.6;
const TOKEN = /\{\{([a-z0-9-]+)\|/g;

function textOf(block: BlogBlock): string {
  return [block.text, ...(block.items ?? []), ...(block.rows ?? []).flat()].filter(Boolean).join(' ');
}

/** The glossary terms a post marks. */
export function termsIn(post: BlogPost): Set<string> {
  const ids = new Set<string>();
  for (const block of post.body ?? []) for (const m of textOf(block).matchAll(TOKEN)) ids.add(m[1]);
  return ids;
}

const TERMS_BY_POST = new Map(POSTS.filter((p) => p.body).map((p) => [p.id, termsIn(p)]));

export interface Assignment {
  post: BlogPost;
  /** How many of the post's marked words the person knows. */
  known: number;
}

export function readingFor(moduleTerms: string[], learned: Set<string>, count = 2): Assignment[] {
  const scored = POSTS.flatMap((post) => {
    const terms = TERMS_BY_POST.get(post.id);
    if (!terms?.size) return [];
    const fromModule = moduleTerms.filter((id) => terms.has(id)).length;
    if (!fromModule) return [];
    const known = [...terms].filter((id) => learned.has(id)).length;
    return [{ post, known, fromModule, share: known / terms.size }];
  });
  const byFit = (a: (typeof scored)[number], b: (typeof scored)[number]) => b.fromModule - a.fromModule || b.share - a.share;
  const ready = scored.filter((s) => s.share >= READY).sort(byFit);
  const picked = ready.length ? ready : scored.sort(byFit).slice(0, 1);
  return picked.slice(0, count).map(({ post, known }) => ({ post, known }));
}
