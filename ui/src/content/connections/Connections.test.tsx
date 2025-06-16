import { expect, test } from '@playwright/experimental-ct-react';
import { Connections } from './Connections';
import { ConnectionsContext } from './Context';
import { getConnectionsContextMock } from './Context.mock';
import type { LinkApiClient } from '../link/api/client';
import { LinkApiContext } from '../link/api/Context';

test.use({
  viewport: { height: 520, width: 520 },
});

test.describe('Connections', () => {
  test('should show list initially', async ({ mount }) => {
    const $ = await mount(
      <ConnectionsContext.Provider value={getConnectionsContextMock()}>
        <Connections />
      </ConnectionsContext.Provider>,
    );

    await expect($).toHaveScreenshot('initial.png');

    await expect($.getByRole('listbox', { name: 'Connections' })).toBeVisible();
    await expect($.getByRole('listbox', { name: 'Databases' })).toBeVisible();
    await expect($.page().locator('form')).not.toBeAttached();
  });

  test('should allow hiding databases', async ({ mount }) => {
    const $ = await mount(
      <ConnectionsContext.Provider value={getConnectionsContextMock()}>
        <Connections hideDatabases />
      </ConnectionsContext.Provider>,
    );

    await expect($.getByRole('listbox', { name: 'Connections' })).toBeVisible();
    await expect($.getByRole('listbox', { name: 'Databases' })).not.toBeVisible();
    await expect($.page().locator('form')).not.toBeAttached();
  });

  test('allows adding connection', async ({ mount }) => {
    const $ = await mount(
      <ConnectionsContext.Provider value={getConnectionsContextMock()}>
        <LinkApiContext.Provider value={{} as Partial<LinkApiClient> as LinkApiClient}>
          <Connections hideDatabases />
        </LinkApiContext.Provider>
      </ConnectionsContext.Provider>,
    );

    await $.getByRole('button', { name: 'Add' }).click();

    await expect($.getByRole('listbox', { name: 'Connections' })).not.toBeAttached();
    await expect($.getByRole('listbox', { name: 'Databases' })).not.toBeAttached();
    await expect($.getByText('Add Connection')).toBeVisible();
    await expect($.page().locator('form')).toBeVisible();
  });

  test('allows editing connection', async ({ mount }) => {
    const $ = await mount(
      <ConnectionsContext.Provider value={getConnectionsContextMock()}>
        <LinkApiContext.Provider value={{} as Partial<LinkApiClient> as LinkApiClient}>
          <Connections hideDatabases />
        </LinkApiContext.Provider>
      </ConnectionsContext.Provider>,
    );

    await $.getByRole('option').first().getByRole('button', { name: 'Edit' }).click();

    await expect($.getByRole('listbox', { name: 'Connections' })).not.toBeVisible();
    await expect($.getByRole('listbox', { name: 'Databases' })).not.toBeVisible();
    await expect($.getByText('Edit Connection')).toBeVisible();
    await expect($.page().locator('form')).toBeVisible();
  });
});
