import { describe, expect, test, vi } from 'vitest';
import { getIsWindows } from './getIsWindows';

describe('getIsWindows', () => {
  test('returns true on Windows', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Windows NT 10.0; Win64; x64');

    expect(getIsWindows()).toBe(true);
  });

  test('returns false on Mac', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Macintosh; Intel Mac OS X 10_15_7');

    expect(getIsWindows()).toBe(false);
  });

  test('returns false on Linux', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Linux; Android 10; Pixel 3a');

    expect(getIsWindows()).toBe(false);
  });
});
