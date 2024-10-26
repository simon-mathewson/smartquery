import { expect, test } from '@playwright/experimental-ct-react';
import { DatabaseListStory } from './List.story';
import { getConnectionsContextMock } from '../Context.mock';

test.describe('DatabaseList', () => {
  test('should render list of databases', async ({ mount }) => {
    const connections = getConnectionsContextMock();
    const { activeConnection } = connections;

    const $ = await mount(<DatabaseListStory connectionsContext={connections} />);

    await expect($.getByRole('heading', { level: 2 })).toHaveText('Databases');

    await expect($.getByRole('option', { selected: true })).toHaveText(activeConnection.database);

    await expect($).toHaveScreenshot('initial.png');
  });

  test('should allow connecting to a database', async ({ mount }) => {
    const connections = getConnectionsContextMock();
    const { activeConnection, activeConnectionDatabases, connect } = connections;

    const $ = await mount(<DatabaseListStory connectionsContext={connections} />);

    await $.getByRole('option', { name: activeConnectionDatabases[1] }).click();

    expect(connect.calls).toEqual([
      [activeConnection.id, { database: activeConnectionDatabases[1] }],
    ]);
  });
});
