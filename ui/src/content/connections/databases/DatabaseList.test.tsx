import { expect, test } from '@playwright/experimental-ct-react';
import { DatabaseListStory } from './DatabaseList.story';
import { postgresConnectionMock, getConnectionsMock } from '../mocks';
import type { ActiveConnection } from '~/shared/types';
import type { Connections } from '../useConnections';
import { spy } from 'tinyspy';
import { routes } from '~/router/routes';
import { getActiveConnectionMock } from '../activeConnection/mocks';
import type { ActiveConnectionContextType } from '../activeConnection/Context';

test.use({
  viewport: { width: 500, height: 400 },
});

test.describe('DatabaseList', () => {
  test('should render list of databases', async ({ mount }) => {
    const connections = getConnectionsMock();
    const { activeConnection } = connections;

    const $ = await mount(
      <DatabaseListStory testApp={{ providerOverrides: { ConnectionsProvider: connections } }} />,
    );

    await expect($.getByRole('heading', { level: 2 }).first()).toHaveText('Databases');

    await expect($.getByRole('option', { selected: true }).first()).toHaveText(
      activeConnection.database,
    );

    await expect($).toHaveScreenshot('initial.png');
  });

  test('should allow connecting to a database', async ({ mount }) => {
    const navigateSpy = spy();

    const { activeConnection } = getConnectionsMock();
    const { databases } = getActiveConnectionMock();

    const $ = await mount(<DatabaseListStory testApp={{ navigateSpy }} />);

    expect(
      await $.getByRole('option', { name: databases[1].name }).evaluate(
        (el) => (el as HTMLAnchorElement).href,
      ),
    ).toMatch(
      routes.connection({
        connectionId: activeConnection.id,
        database: databases[1].name,
        schema: '',
      }),
    );
  });

  test('should render list of schemas', async ({ mount }) => {
    const connections = {
      ...getConnectionsMock(),
      activeConnection: {
        ...postgresConnectionMock,
        connectedViaCloud: false,
        connectorId: '2',
        credentialStorage: 'plain',
      } satisfies ActiveConnection,
    } satisfies Connections;

    const activeConnection = {
      ...getActiveConnectionMock(),
      activeConnection: connections.activeConnection,
      databases: [{ name: 'postgres', schemas: ['public', 'information_schema'] }],
    } satisfies ActiveConnectionContextType;

    const $ = await mount(
      <DatabaseListStory
        testApp={{
          providerOverrides: {
            ActiveConnectionProvider: activeConnection,
            ConnectionsProvider: connections,
          },
        }}
      />,
    );

    await expect($.getByRole('heading', { level: 2 }).last()).toHaveText('Schemas');

    await expect($.getByRole('option', { selected: true }).last()).toHaveText(
      connections.activeConnection.schema,
    );

    await expect($).toHaveScreenshot('withSchemas.png');

    expect(
      await $.getByRole('option', { name: connections.activeConnection.schema }).evaluate(
        (el) => (el as HTMLAnchorElement).href,
      ),
    ).toMatch(
      routes.connection({
        connectionId: connections.activeConnection.id,
        database: connections.activeConnection.database,
        schema: connections.activeConnection.schema,
      }),
    );
  });
});
