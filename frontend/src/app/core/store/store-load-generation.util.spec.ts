import { describe, expect, it } from 'vitest';
import { createStoreLoadGeneration } from './store-load-generation.util';

describe('createStoreLoadGeneration', () => {
  it('starts at generation 0', () => {
    const loadGeneration = createStoreLoadGeneration();
    expect(loadGeneration.current()).toBe(0);
    expect(loadGeneration.isCurrent(0)).toBe(true);
  });

  it('bumps generation and invalidates prior requests', () => {
    const loadGeneration = createStoreLoadGeneration();
    const requestGeneration = loadGeneration.current();

    loadGeneration.bump();

    expect(loadGeneration.current()).toBe(1);
    expect(loadGeneration.isCurrent(requestGeneration)).toBe(false);
    expect(loadGeneration.isCurrent(1)).toBe(true);
  });

  it('tracks multiple bumps', () => {
    const loadGeneration = createStoreLoadGeneration();

    loadGeneration.bump();
    loadGeneration.bump();

    expect(loadGeneration.current()).toBe(2);
    expect(loadGeneration.isCurrent(0)).toBe(false);
    expect(loadGeneration.isCurrent(1)).toBe(false);
    expect(loadGeneration.isCurrent(2)).toBe(true);
  });
});
