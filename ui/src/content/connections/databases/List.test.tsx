import { expect, test } from '@playwright/experimental-ct-react';
import { DatabaseListStory } from './List.story';
import { connectionsContextMock } from '../Context.mock';

const { activeConnection, activeConnectionDatabases, connect } = connectionsContextMock;

test.describe('DatabaseList', () => {
  test('should render list of databases', async ({ mount }) => {
    const $ = await mount(<DatabaseListStory connectionsContext={connectionsContextMock} />);

    await expect($.getByRole('heading', { level: 2 })).toHaveText('Databases');

    await expect($.getByRole('option', { selected: true })).toHaveText(activeConnection.database);

    await expect($).toHaveScreenshot('initial.png');
  });

  test('should allow connecting to a database', async ({ mount }) => {
    const $ = await mount(<DatabaseListStory connectionsContext={connectionsContextMock} />);

    await $.getByRole('option', { name: activeConnectionDatabases[1] }).click();

    expect(connect.calls).toEqual([
      [activeConnection.id, { database: activeConnectionDatabases[1] }],
    ]);
  });
});
