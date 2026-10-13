import { languagesNeedingReview, offeredLanguages } from '@/i18n/languages';

const codes = (list: { code: string }[]) => list.map((l) => l.code);

describe('which languages a build offers (D69, D151)', () => {
  it('releases every language, the unreviewed ones as drafts', () => {
    expect(codes(offeredLanguages(false))).toEqual(['en', 'hi', 'es', 'tl', 'vi']);
  });

  it('asks for volunteers for each released draft', () => {
    // Hindi was reviewed on 2026-10-12, so only the other three still ask for volunteers.
    expect(codes(languagesNeedingReview(false))).toEqual(['es', 'tl', 'vi']);
  });

  it('shows every draft in development builds', () => {
    expect(codes(offeredLanguages(true))).toEqual(['en', 'hi', 'es', 'tl', 'vi']);
  });
});
