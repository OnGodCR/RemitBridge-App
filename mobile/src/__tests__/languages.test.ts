import { languagesNeedingReview, offeredLanguages } from '@/i18n/languages';

const codes = (list: { code: string }[]) => list.map((l) => l.code);

describe('which languages a build offers (D69, D151)', () => {
  it('releases Spanish, Tagalog and Vietnamese as drafts, and holds Hindi for its reviewer', () => {
    expect(codes(offeredLanguages(false))).toEqual(['en', 'es', 'tl', 'vi']);
  });

  it('asks for volunteers for each released draft', () => {
    expect(codes(languagesNeedingReview(false))).toEqual(['es', 'tl', 'vi']);
  });

  it('shows every draft in development builds', () => {
    expect(codes(offeredLanguages(true))).toEqual(['en', 'hi', 'es', 'tl', 'vi']);
  });
});
