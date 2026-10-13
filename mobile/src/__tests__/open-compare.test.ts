import { router } from 'expo-router';

import { openCompare } from '@/lib/open-compare';

jest.mock('expo-router', () => ({
  router: { canDismiss: jest.fn(), dismissTo: jest.fn(), navigate: jest.fn() },
}));

const r = router as unknown as { canDismiss: jest.Mock; dismissTo: jest.Mock; navigate: jest.Mock };

beforeEach(() => jest.clearAllMocks());

test('from inside a tab, it switches to Compare', () => {
  r.canDismiss.mockReturnValue(false);
  openCompare({ routeId: 'us-mx', amount: 500, method: 'cash_pickup' });
  expect(r.dismissTo).not.toHaveBeenCalled();
  expect(r.navigate).toHaveBeenCalledWith({
    pathname: '/',
    params: { route: 'us-mx', amount: '500', method: 'cash_pickup', at: expect.any(String) },
  });
});

test('from a pushed screen, it pops back to the tabs', () => {
  r.canDismiss.mockReturnValue(true);
  openCompare({ routeId: 'us-in' });
  expect(r.navigate).not.toHaveBeenCalled();
  expect(r.dismissTo).toHaveBeenCalledWith({ pathname: '/', params: { route: 'us-in', at: expect.any(String) } });
});
