import { expect, test } from '@playwright/experimental-ct-react';
import { ErrorMessage } from './ErrorMessage';

test('shows error message', async ({ mount }) => {
  const $ = await mount(<ErrorMessage>Error message</ErrorMessage>);

  await expect($).toHaveText('Error message');
});
