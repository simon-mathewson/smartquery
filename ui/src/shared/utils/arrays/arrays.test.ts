import { expect, test } from '@playwright/experimental-ct-react';
import { cloneArrayWithEmptyValues } from './arrays';

test('cloneArrayWithEmptyValues', () => {
  const array = [];
  const item = 'test';
  array[1] = item;

  const clonedArray = cloneArrayWithEmptyValues(array);

  // Expect absence of index 0 in cloned array (not undefined)
  expect(0 in clonedArray).toBe(false);
  expect(clonedArray[1]).toBe(item);
  expect(clonedArray.length).toBe(2);
});
