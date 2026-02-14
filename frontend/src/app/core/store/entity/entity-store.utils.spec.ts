import {
  DEFAULT_LIST_KEY,
  getExpiration,
  getFilterKey,
  isExpired,
} from './entity-store.utils';

describe('entity-store.utils', () => {
  it('returns the default list key for empty filters', () => {
    expect(getFilterKey()).toBe(DEFAULT_LIST_KEY);
    expect(getFilterKey(null)).toBe(DEFAULT_LIST_KEY);
  });

  it('creates stable keys for object filters', () => {
    const first = getFilterKey({ b: 2, a: 1 });
    const second = getFilterKey({ a: 1, b: 2 });

    expect(first).toBe(second);
  });

  it('handles array filters deterministically', () => {
    const first = getFilterKey({ values: [2, 1, 3] });
    const second = getFilterKey({ values: [2, 1, 3] });

    expect(first).toBe(second);
  });

  it('computes expiration timestamps and respects expiry checks', () => {
    const expiresAt = getExpiration(500);

    expect(expiresAt).toBeGreaterThan(Date.now() - 1);
    expect(isExpired(expiresAt)).toBe(false);
    expect(isExpired(Date.now() - 1000)).toBe(true);
  });
});
