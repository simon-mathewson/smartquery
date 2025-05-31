import { expect, test } from '@playwright/experimental-ct-react';
import { DatabaseListStory } from './List.story';
import { postgresConnectionMock, getConnectionsContextMock } from '../Context.mock';
import type { ActiveConnection } from '~/shared/types';
import type { Connections } from '../useConnections';

test.describe('DatabaseList', () => {
  test('should render list of databases', async ({ mount }) => {
    const connections = getConnectionsContextMock();
    const { activeConnection } = connections;

    const $ = await mount(<DatabaseListStory connectionsContext={connections} />);

    await expect($.getByRole('heading', { level: 2 }).first()).toHaveText('Databases');

    await expect($.getByRole('option', { selected: true }).first()).toHaveText(
      activeConnection.database,
    );

    await expect($).toHaveScreenshot('initial.png');
  });

  test('should allow connecting to a database', async ({ mount }) => {
    const connections = getConnectionsContextMock();
    const { activeConnection, activeConnectionDatabases, connect } = connections;

    const $ = await mount(<DatabaseListStory connectionsContext={connections} />);

    await $.getByRole('option', { name: activeConnectionDatabases[1].name }).click();

    expect(connect.calls).toEqual([
      [activeConnection.id, { database: activeConnectionDatabases[1].name }],
    ]);
  });

  test('should render list of schemas', async ({ mount }) => {
    const connections = {
      ...getConnectionsContextMock(),
      activeConnection: {
        ...postgresConnectionMock,
        clientId: '2',
        credentialStorage: 'localStorage',
      } satisfies ActiveConnection,
      activeConnectionDatabases: [{ name: 'postgres', schemas: ['public', 'information_schema'] }],
    } satisfies Connections;
    const { activeConnection } = connections;

    const $ = await mount(<DatabaseListStory connectionsContext={connections} />);

    await expect($.getByRole('heading', { level: 2 }).last()).toHaveText('Schemas');

    await expect($.getByRole('option', { selected: true }).last()).toHaveText(
      activeConnection.schema!,
    );

    await expect($).toHaveScreenshot('withSchemas.png');
  });
});
