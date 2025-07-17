import { expect, test } from '@playwright/experimental-ct-react';
import { TestApp } from '~/test/componentTests/TestApp';
import { Connections } from './Connections';
import { routes } from '~/router/routes';
import { mysqlConnectionMock } from './mocks';

test.use({
  viewport: { height: 520, width: 520 },
});

test.describe('Connections', () => {
  test('should show list initially', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <Connections />
      </TestApp>,
    );

    await expect($).toHaveScreenshot('initial.png');

    await expect($.getByRole('listbox', { name: 'Connections' })).toBeVisible();
    await expect($.getByRole('listbox', { name: 'Databases' })).toBeVisible();
    await expect($.page().locator('form')).not.toBeAttached();

    expect(
      await $.getByRole('option', { name: mysqlConnectionMock.name }).evaluate(
        (el) => (el as HTMLAnchorElement).href,
      ),
    ).toMatch(
      routes.connection({
        connectionId: mysqlConnectionMock.id,
        database: mysqlConnectionMock.database,
        schema: '',
      }),
    );
  });

  test('should allow hiding databases', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <Connections hideDatabases />
      </TestApp>,
    );

    await expect($.getByRole('listbox', { name: 'Connections' })).toBeVisible();
    await expect($.getByRole('listbox', { name: 'Databases' })).not.toBeVisible();
    await expect($.page().locator('form')).not.toBeAttached();
  });

  test('allows adding connection', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <Connections hideDatabases />
      </TestApp>,
    );

    await $.getByRole('button', { name: 'Add' }).click();

    await expect($.getByRole('listbox', { name: 'Connections' })).not.toBeAttached();
    await expect($.getByRole('listbox', { name: 'Databases' })).not.toBeAttached();
    await expect($.getByText('Add Connection')).toBeVisible();
    await expect($.page().locator('form')).toBeVisible();
  });

  test('allows editing connection', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <Connections hideDatabases />
      </TestApp>,
    );

    await $.getByRole('option').first().getByRole('button', { name: 'Edit' }).click();

    await expect($.getByRole('listbox', { name: 'Connections' })).not.toBeVisible();
    await expect($.getByRole('listbox', { name: 'Databases' })).not.toBeVisible();
    await expect($.getByText('Edit Connection')).toBeVisible();
    await expect($.page().locator('form')).toBeVisible();
  });
});
