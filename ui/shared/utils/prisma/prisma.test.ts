import { describe, expect, test } from 'vitest';
import { isAuthError } from './prisma';

describe('Prisma utils', () => {
  test('isAuthError', () => {
    expect(isAuthError(new Error('Authentication failed'))).toBe(true);
    expect(isAuthError(new Error('Failed to authenticate'))).toBe(false);
    expect(isAuthError(new Error('Authentication failed: invalid password'))).toBe(true);
    expect(isAuthError(new Error('Failed to authenticate: invalid password'))).toBe(false);
  });
});
