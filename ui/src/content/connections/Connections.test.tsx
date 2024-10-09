import { expect, test } from '@playwright/experimental-ct-react';
import { Connections } from './Connections';
import { ConnectionsContext } from './Context';
import { connectionsContextMock } from './Context.mock';

test.use({
  viewport: { height: 520, width: 520 },
});

test.describe('Connections', () => {
  test('should show list initially', async ({ mount }) => {
    const $ = await mount(
      <ConnectionsContext.Provider value={connectionsContextMock}>
        <Connections />
      </ConnectionsContext.Provider>,
    );

    await expect($).toHaveScreenshot('initial.png');
  });
});
