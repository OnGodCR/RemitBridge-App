/**
 * The ported blog (DECISIONS.md D106) holds together: every figure has its picture, every
 * cover exists, and every link between posts lands on a post in the app.
 */
import { BLOG_IMAGES } from '@/data/blog-images';
import { linkTarget, POSTS, relatedTo } from '@/data/blog';

jest.mock('@/data/blog-images', () => {
  const keys = (require('@/data/blog.json') as { posts: { cover: string | null; body: { image?: string }[] | null }[] }).posts.flatMap(
    (p) => [p.cover, ...(p.body ?? []).map((b) => b.image)].filter(Boolean),
  );
  return { BLOG_IMAGES: Object.fromEntries(keys.map((k) => [k, 1])) };
});

it('has all 30 posts, the written ones with bodies', () => {
  // Summary-only posts stay out of the app until they're written (D190).
  expect(POSTS.length).toBeGreaterThanOrEqual(17);
  expect(POSTS.every((p) => p.body)).toBe(true);
});

it('gives every figure a picture with a size', () => {
  for (const p of POSTS) {
    for (const b of p.body ?? []) {
      if (b.type !== 'figure') continue;
      expect(BLOG_IMAGES[b.image!]).toBeTruthy();
      expect(b.width! > 0 && b.height! > 0).toBe(true);
    }
  }
});

it('sends every link between posts to a post in the app', () => {
  for (const p of POSTS) {
    for (const b of p.body ?? []) {
      for (const text of [b.text ?? '', ...(b.items ?? [])]) {
        for (const [, path] of text.matchAll(/\]\((\/blog\/[^)#]+)/g)) {
          expect(linkTarget(path)).toHaveProperty('app');
        }
      }
    }
  }
});

it('always has something to read next', () => {
  for (const p of POSTS) expect(relatedTo(p).length).toBe(3);
});
