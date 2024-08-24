import { expect, test } from '@playwright/experimental-ct-react';
import { DatabaseListStory } from './List.story';
import { spy } from 'tinyspy';

const connectionsContext = {
  activeConnection: { id: 'connection', database: 'users' },
  activeConnectionDatabases: ['users', 'products', 'orders', 'customers', 'invoices'],
  connect: spy(() => Promise.resolve()),
};

const { activeConnection, activeConnectionDatabases, connect } = connectionsContext;

test.describe('DatabaseList', () => {
  test('should render list of databases', async ({ mount }) => {
    const $ = await mount(<DatabaseListStory connectionsContext={connectionsContext} />);

    await expect($.getByRole('heading', { level: 2 })).toHaveText('Databases');

    await expect($.getByRole('option', { selected: true })).toHaveText(activeConnection.database);

    await expect($).toHaveScreenshot();
  });

  test('should allow connecting to a database', async ({ mount }) => {
    const $ = await mount(<DatabaseListStory connectionsContext={connectionsContext} />);

    await $.getByRole('option', { name: activeConnectionDatabases[1] }).click();

    expect(connect.calls).toEqual([
      [activeConnection.id, { database: activeConnectionDatabases[1] }],
    ]);
  });
});
