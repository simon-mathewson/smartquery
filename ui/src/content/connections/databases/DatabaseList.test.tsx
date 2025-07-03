import { expect, test } from '@playwright/experimental-ct-react';
import { DatabaseListStory } from './DatabaseList.story';
import { postgresConnectionMock, getContextMock } from '../mocks';
import type { ActiveConnection } from '~/shared/types';
import type { Connections } from '../useConnections';
import { spy } from 'tinyspy';
import { routes } from '~/router/routes';

test.use({
  viewport: { width: 500, height: 400 },
});

test.describe('DatabaseList', () => {
  test('should render list of databases', async ({ mount }) => {
    const connections = getContextMock();
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
    const connections = getContextMock();
    const { activeConnection, activeConnectionDatabases } = connections;

    const $ = await mount(
      <DatabaseListStory
        testApp={{
          providerOverrides: { ConnectionsProvider: connections },
          navigateSpy,
        }}
      />,
    );

    await $.getByRole('option', { name: activeConnectionDatabases[1].name }).click();

    expect(navigateSpy.calls).toEqual([
      [
        routes.database({
          connectionId: activeConnection.id,
          database: activeConnectionDatabases[1].name,
          schema: '',
        }),
      ],
    ]);
  });

  test('should render list of schemas', async ({ mount }) => {
    const connections = {
      ...getContextMock(),
      activeConnection: {
        ...postgresConnectionMock,
        clientId: '2',
        credentialStorage: 'plain',
      } satisfies ActiveConnection,
      activeConnectionDatabases: [{ name: 'postgres', schemas: ['public', 'information_schema'] }],
    } satisfies Connections;
    const { activeConnection } = connections;

    const $ = await mount(
      <DatabaseListStory testApp={{ providerOverrides: { ConnectionsProvider: connections } }} />,
    );

    await expect($.getByRole('heading', { level: 2 }).last()).toHaveText('Schemas');

    await expect($.getByRole('option', { selected: true }).last()).toHaveText(
      activeConnection.schema!,
    );

    await expect($).toHaveScreenshot('withSchemas.png');
  });
});
