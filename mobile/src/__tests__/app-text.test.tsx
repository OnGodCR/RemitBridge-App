import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppText, hasDevanagari } from '@/components/ui';

describe('Hindi text', () => {
  it('is spotted in strings and arrays of them', () => {
    expect(hasDevanagari('मेरी रसीद पढ़ें')).toBe(true);
    expect(hasDevanagari(['Fee ', 'फ़ीस'])).toBe(true);
    expect(hasDevanagari('Read my receipt')).toBe(false);
    expect(hasDevanagari(42)).toBe(false);
  });

  it('is set in Noto Sans Devanagari at the same weight, with taller lines', () => {
    render(
      <>
        <AppText variant="label">फ़ीस</AppText>
        <AppText variant="label">Fee</AppText>
      </>,
    );
    const hindi = StyleSheet.flatten(screen.getByText('फ़ीस').props.style);
    const english = StyleSheet.flatten(screen.getByText('Fee').props.style);
    expect(hindi.fontFamily).toBe('NotoSansDevanagari_600SemiBold');
    expect(english.fontFamily).toBe('PlusJakartaSans_600SemiBold');
    expect(hindi.lineHeight).toBeGreaterThan(english.lineHeight as number);
  });
});
