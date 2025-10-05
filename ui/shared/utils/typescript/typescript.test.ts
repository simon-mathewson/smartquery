import { describe, expect, test } from 'vitest';
import { isNotNull, isNotUndefined } from './typescript';

describe('TypeScript utils', () => {
  test('isNotNull', () => {
    expect(isNotNull(null)).toBe(false);
    expect(isNotNull('')).toBe(true);
    expect(isNotNull(0)).toBe(true);
    expect(isNotNull(undefined)).toBe(true);
  });

  test('isNotUndefined', () => {
    expect(isNotUndefined(undefined)).toBe(false);
    expect(isNotUndefined('')).toBe(true);
    expect(isNotUndefined(0)).toBe(true);
    expect(isNotUndefined(null)).toBe(true);
  });
});
