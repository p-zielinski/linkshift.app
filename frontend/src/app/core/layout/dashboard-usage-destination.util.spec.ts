import { resolveUsageDestination } from './dashboard-usage-destination.util';

describe('resolveUsageDestination', () => {
  it('routes campaign mode to settings plan-usage anchor', () => {
    expect(resolveUsageDestination('campaign')).toEqual({
      path: '/settings',
      fragment: 'plan-usage',
    });
  });

  it('routes advanced mode to dashboard without fragment', () => {
    expect(resolveUsageDestination('advanced')).toEqual({
      path: '/dashboard',
      fragment: null,
    });
  });
});
