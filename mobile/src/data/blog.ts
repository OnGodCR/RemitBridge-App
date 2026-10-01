import type { Href } from 'expo-router';

import data from './blog.json';

/**
 * The website's blog, in the app (DECISIONS.md D106). blog.json and the pictures in
 * assets/blog are written by scripts/port-blog.mjs from the website repo and the live
 * site; rerun it when the website publishes or edits a post. Posts are in English, as on
 * the website.
 */
export type SeriesId = 'all' | 'series1' | 'series2' | 'series3' | 'series4' | 'series5';

/** One block of a post body, as the website stores it. */
export interface BlogBlock {
  type: 'p' | 'h' | 'label' | 'quote' | 'callout' | 'list' | 'table' | 'figure' | 'equation' | 'cta' | 'sources';
  text?: string;
  level?: number;
  cite?: string;
  items?: string[];
  icon?: 'pro' | 'con';
  /** A figure, captured from the website as a picture. */
  image?: string;
  width?: number;
  height?: number;
  columns?: string[];
  rows?: string[][];
  rowHeader?: string;
  rowHeaderHidden?: boolean;
  label?: string;
  to?: string;
}

export interface BlogPost {
  id: number;
  publishedOn?: string;
  series: Exclude<SeriesId, 'all'>;
  seriesName: string;
  title: string;
  author: { name: string; role: string };
  abstract: string;
  readTime: string;
  tags: string[];
  slug: string;
  /** Null for a post that's a summary so far. */
  body: BlogBlock[] | null;
  /** A key in BLOG_IMAGES, for posts with a photo cover. */
  cover: string | null;
}

export const POSTS = data.posts as unknown as BlogPost[];
export const SERIES = (data.series as { id: SeriesId }[]).map((s) => s.id);

export const postById = (id: number | string | undefined) => POSTS.find((p) => String(p.id) === String(id));

/** Same series first, then neighbours, so there is always something to read next. */
export function relatedTo(post: BlogPost, count = 3): BlogPost[] {
  const same = POSTS.filter((p) => p.series === post.series && p.id !== post.id && p.body);
  const others = POSTS.filter((p) => p.series !== post.series && p.id !== post.id && p.body);
  return [...same, ...others].slice(0, count);
}

/**
 * Where a link inside a post goes in the app. The website's paths become app screens where
 * the app has one; anything else opens on the website.
 */
export function linkTarget(path: string): { app: Href } | { web: string } {
  const [route] = path.split('#');
  if (route.startsWith('/blog/')) {
    const post = POSTS.find((p) => p.slug === route.slice('/blog/'.length));
    if (post) return { app: { pathname: '/blog/[id]', params: { id: String(post.id) } } };
  }
  const APP: Record<string, Href> = {
    '/blog': '/blog',
    '/truecost': '/true-cost',
    '/reckoner': '/yearly-cost',
    '/fair-rate': '/fair-rate',
    '/scam-check': '/scam-check',
    '/rate-history': '/rate-history',
    '/glossary': '/glossary',
    '/remitbench': '/remitbench',
  };
  if (APP[route]) return { app: APP[route] };
  return { web: `https://www.remitbridgelabs.org${path}` };
}
