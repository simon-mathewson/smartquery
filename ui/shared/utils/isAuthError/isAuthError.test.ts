import { expect, test } from 'vitest';
import { isAuthError } from './isAuthError';

test('isAuthError', () => {
  expect(isAuthError(new Error('Authentication failed'))).toBe(false);
  expect(isAuthError(new Error('Failed to authenticate'))).toBe(false);
  expect(isAuthError(new Error('Authentication failed: invalid password'))).toBe(false);
  expect(isAuthError(new Error('Failed to authenticate: invalid password'))).toBe(false);
  expect(
    isAuthError(new Error("Access denied for user 'root'@'192.168.65.1' (using password: YES)")),
  ).toBe(true);
  expect(isAuthError(new Error('All configured authentication methods failed'))).toBe(true);
  expect(isAuthError(new Error('password authentication failed for user '))).toBe(true);
});
