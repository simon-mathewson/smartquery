import { expect, test } from '@playwright/experimental-ct-react';
import { ErrorMessage } from './ErrorMessage';
import { TestApp } from '~/test/componentTests/TestApp';

test('shows error message', async ({ mount }) => {
  const $ = await mount(
    <TestApp>
      <ErrorMessage>Error message</ErrorMessage>
    </TestApp>,
  );

  await expect($.page()).toHaveScreenshot('errorMessage.png');

  await expect($).toHaveText('Error message');
});
