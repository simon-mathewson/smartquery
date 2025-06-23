import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import { ConnectionFormStory } from './ConnectionForm.story';
import { spy } from 'tinyspy';
import { animationOptions } from '~/shared/components/overlayCard/constants';

const getProps = () => ({ exit: spy() });

const fillOutForm = async ($: MountResult) => {
  await $.getByRole('textbox', { name: 'Name' }).fill('My connection');
  await $.getByRole('textbox', { name: 'Host' }).first().fill('localhost');
  await $.getByRole('textbox', { name: 'Port' }).first().fill('1234');
  await $.getByRole('textbox', { name: 'User' }).first().fill('user');
  await $.getByRole('textbox', { name: 'Default database' }).fill('db');
  await $.getByRole('textbox', { name: 'Default schema' }).fill('public');
};

test.use({ viewport: { width: 400, height: 800 } });

test.describe('ConnectionForm', () => {
  test('renders', async ({ mount }) => {
    const $ = await mount(<ConnectionFormStory componentProps={getProps()} />);

    await expect($).toHaveScreenshot('initial.png');
  });

  test('allows exiting form', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(<ConnectionFormStory componentProps={props} />);

    await $.getByRole('button', { name: 'Cancel' }).click();

    expect(props.exit.calls.length).toBe(1);

    await $.update(<ConnectionFormStory componentProps={{ ...props, hideBackButton: true }} />);

    await expect($.getByRole('button', { name: 'Cancel' })).not.toBeAttached();
  });

  test('allows creating connection', async ({ mount }) => {
    const addConnection = spy(async () => {});

    const $ = await mount(
      <ConnectionFormStory
        componentProps={getProps()}
        testApp={{ providerOverrides: { ConnectionsProvider: { addConnection } } }}
      />,
    );

    await fillOutForm($);

    await $.getByRole('button', { name: 'Add' }).click();

    expect(addConnection.calls).toEqual([
      [
        {
          credentialStorage: 'alwaysAsk',
          database: 'db',
          engine: 'postgres',
          host: 'localhost',
          id: expect.any(String),
          name: 'My connection',
          password: null,
          port: 1234,
          schema: 'public',
          ssh: null,
          storageLocation: 'local',
          type: 'remote',
          user: 'user',
        },
        null, // TODO: Figure out why this is null
      ],
    ]);
  });

  test('allows creating SQLite connection', async ({ mount }) => {
    const $ = await mount(<ConnectionFormStory componentProps={getProps()} />);

    await $.getByRole('radio', { name: 'SQLite' }).click();

    await expect($).toHaveScreenshot('sqlite.png');

    await $.getByRole('textbox', { name: 'Name' }).fill('My connection');

    // TODO: Playwright doesn't support intercepting window.showOpenFilePicker yet

    // const fileChooserPromise = $.page().waitForEvent('filechooser');

    // await $.getByRole('button', { name: 'Choose file' }).click();

    // const fileChooser = await fileChooserPromise;
    // await fileChooser.setFiles('./demo.sqlite');
  });

  test.describe('uses default port', () => {
    [
      { name: 'MySQL', port: 3306 },
      { name: 'PostgreSQL', port: 5432 },
    ].forEach(({ name, port }) => {
      test(name, async ({ mount }) => {
        const addConnection = spy(async () => {});

        const $ = await mount(
          <ConnectionFormStory
            componentProps={getProps()}
            testApp={{ providerOverrides: { ConnectionsProvider: { addConnection } } }}
          />,
        );

        await fillOutForm($);

        if (name !== 'PostgreSQL') {
          await $.getByRole('radio', { name }).click();
        }

        await $.getByRole('textbox', { name: 'Port' }).clear();

        await expect($.getByRole('textbox', { name: 'Port' })).toHaveAttribute(
          'placeholder',
          String(port),
        );

        await $.getByRole('button', { name: 'Add' }).click();

        expect(addConnection.calls).toMatchObject([
          [
            {
              port,
            },
            null, // TODO: Figure out why this is null
          ],
        ]);
      });
    });
  });

  test('allows storing password', async ({ mount }) => {
    const addConnection = spy(async () => {});

    const $ = await mount(
      <ConnectionFormStory
        componentProps={getProps()}
        testApp={{ providerOverrides: { ConnectionsProvider: { addConnection } } }}
      />,
    );

    await fillOutForm($);

    await expect($.getByRole('radio', { name: 'Always ask', checked: true })).toBeAttached();
    await expect($.getByRole('textbox', { name: 'Password' })).not.toBeAttached();

    await $.getByRole('radio', { name: 'Plain' }).click();
    await expect($.getByRole('textbox', { name: 'Password' })).toBeAttached();

    await $.getByRole('textbox', { name: 'Password' }).fill('password');

    await $.getByRole('button', { name: 'Add' }).click();

    expect(addConnection.calls).toEqual([
      [
        {
          credentialStorage: 'plain',
          database: 'db',
          engine: 'postgres',
          host: 'localhost',
          id: expect.any(String),
          name: 'My connection',
          password: 'password',
          port: 1234,
          schema: 'public',
          ssh: null,
          storageLocation: 'local',
          type: 'remote',
          user: 'user',
        },
        null, // TODO: Figure out why this is null
      ],
    ]);
  });

  test('allows updating connection', async ({ mount }) => {
    const updateConnection = spy(async () => {});

    const $ = await mount(
      <ConnectionFormStory
        componentProps={{ ...getProps(), connectionToEditId: '2' }}
        testApp={{ providerOverrides: { ConnectionsProvider: { updateConnection } } }}
      />,
    );

    await fillOutForm($);

    await $.getByRole('radio', { name: 'Connect via SSH' }).uncheck();

    await $.getByRole('button', { name: 'Save' }).click();

    expect(updateConnection.calls).toEqual([
      [
        '2',
        {
          credentialStorage: 'plain',
          database: 'db',
          engine: 'postgres',
          host: 'localhost',
          id: '2',
          name: 'My connection',
          password: 'password',
          port: 1234,
          schema: 'public',
          ssh: null,
          storageLocation: 'local',
          type: 'remote',
          user: 'user',
        },
        null, // TODO: Figure out why this is null
      ],
    ]);
  });

  test('allows deleting connection', async ({ mount }) => {
    const removeConnection = spy(async () => {});
    const props = { ...getProps(), connectionToEditId: '2' };

    const $ = await mount(
      <ConnectionFormStory
        componentProps={props}
        testApp={{ providerOverrides: { ConnectionsProvider: { removeConnection } } }}
      />,
    );

    await $.getByRole('button', { name: 'Delete connection' }).click();
    await $.page().waitForTimeout(animationOptions.duration);
    await $.page().getByRole('menu').getByRole('menuitem', { name: 'Delete connection' }).click();

    expect(removeConnection.calls).toEqual([['2']]);
    expect(props.exit.calls).toEqual([[]]);
  });
});
