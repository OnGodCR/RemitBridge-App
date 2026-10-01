/**
 * The receipt observatory (D96): the sample size first, groups only from five receipts,
 * and plain words while there are too few to show anything.
 */
import { render, screen, waitFor } from '@testing-library/react-native';

import ObservatoryScreen from '@/app/observatory';
import { fetchObservatory, type Observatory } from '@/lib/observatory';

jest.mock('@/lib/supabase', () => ({ supabase: null }));
jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('@/lib/track', () => ({ track: jest.fn() }));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-router', () => ({
  // Runs the focus effect once, on mount, as a first focus would.
  useFocusEffect: (effect: () => void) => jest.requireActual<typeof import('react')>('react').useEffect(effect, [effect]),
}));
jest.mock('@/lib/observatory', () => ({ fetchObservatory: jest.fn() }));

const fetchMock = fetchObservatory as jest.MockedFunction<typeof fetchObservatory>;

const DATA: Observatory = {
  receipts: 12,
  min_group: 5,
  since: '2026-10',
  groups: [
    {
      provider_id: 'western-union',
      route_id: 'us-mx',
      receipts: 7,
      median_total_cost_pct: 4.25,
      median_markup_pct: 2.1,
      compared: 5,
      paid_more_than_advertised: 3,
    },
  ],
  tax: { taxed: 6, matches: 5, not_found: 1 },
  disclosures_missing: { cfpb_contact: 4, error_rights: 2 },
};

describe('the observatory', () => {
  it('leads with the sample size, then groups, tax and disclosures', async () => {
    fetchMock.mockResolvedValue(DATA);
    render(<ObservatoryScreen />);
    await waitFor(() => expect(screen.getByText('12 shared receipts since October 2026')).toBeTruthy());
    expect(screen.getByText('Early results')).toBeTruthy();
    expect(screen.getByText('Western Union · United States → Mexico · 7 receipts')).toBeTruthy();
    expect(screen.getByText('4.25%')).toBeTruthy();
    expect(screen.getByText('3 of 5 compared got a worse rate than advertised that day')).toBeTruthy();
    expect(screen.getByText('6 were paid in cash or similar. The 1% tax matched on 5; no tax line was found on 1.')).toBeTruthy();
    expect(screen.getByText('the CFPB’s contact details: 4 of 12')).toBeTruthy();
  });

  it('shows no breakdown while there are fewer receipts than a group needs', async () => {
    fetchMock.mockResolvedValue({ ...DATA, receipts: 3, groups: [], tax: null, disclosures_missing: {} });
    render(<ObservatoryScreen />);
    await waitFor(() => expect(screen.getByText(/Not enough receipts have been shared yet/)).toBeTruthy());
    expect(screen.queryByText('By provider and route')).toBeNull();
  });

  it('offers to try again when the totals don’t load', async () => {
    fetchMock.mockResolvedValue(null);
    render(<ObservatoryScreen />);
    await waitFor(() => expect(screen.getByText('The results couldn’t load.')).toBeTruthy());
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
