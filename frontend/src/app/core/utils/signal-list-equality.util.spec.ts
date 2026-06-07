import {
  areRowsEqualByIdAndUpdatedAt,
  areSortedIdListsEqual,
} from './signal-list-equality.util';

describe('signal-list-equality.util', () => {
  it('compares sorted id lists by value', () => {
    expect(areSortedIdListsEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(areSortedIdListsEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(areSortedIdListsEqual(['a'], ['a', 'b'])).toBe(false);
  });

  it('compares rows by id and updatedAt', () => {
    const row = { id: '1', updatedAt: '2026-06-01T00:00:00.000Z', name: 'A' };
    expect(areRowsEqualByIdAndUpdatedAt([row], [{ ...row, name: 'B' }])).toBe(true);
    expect(
      areRowsEqualByIdAndUpdatedAt([row], [{ ...row, updatedAt: '2026-06-02T00:00:00.000Z' }]),
    ).toBe(false);
  });
});
