import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import type { ConnectionFormStoryProps } from './ConnectionForm.story';
import { ConnectionFormStory } from './ConnectionForm.story';
import { animationOptions } from '~/shared/components/overlayCard/constants';
import { getConnectionsContextMock } from '../Context.mock';

const getProps = () =>
  ({
    connectionsContext: getConnectionsContextMock(),
    connectionFormProps: { exit: spy() },
  }) satisfies ConnectionFormStoryProps;

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
    const props = getProps();

    const $ = await mount(<ConnectionFormStory {...props} />);

    await expect($).toHaveScreenshot('initial.png');
  });

  test('allows exiting form', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(<ConnectionFormStory {...props} />);

    await $.getByRole('button', { name: 'Cancel' }).click();

    expect(props.connectionFormProps.exit.calls.length).toBe(1);

    await $.update(
      <ConnectionFormStory
        {...props}
        connectionFormProps={{ ...props.connectionFormProps, hideBackButton: true }}
      />,
    );

    await expect($.getByRole('button', { name: 'Cancel' })).not.toBeAttached();
  });

  test('allows creating connection', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(<ConnectionFormStory {...props} />);

    await fillOutForm($);

    await $.getByRole('button', { name: 'Add' }).click();

    expect(props.connectionsContext.addConnection.calls).toEqual([
      [
        {
          credentialStorage: 'alwaysAsk',
          database: 'db',
          engine: 'postgres',
          host: 'localhost',
          id: '3',
          name: 'My connection',
          password: null,
          port: 1234,
          schema: 'public',
          ssh: null,
          type: 'remote',
          user: 'user',
        },
      ],
    ]);
  });

  test('allows creating SQLite connection', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(<ConnectionFormStory {...props} />);

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
        const props = getProps();

        const $ = await mount(<ConnectionFormStory {...props} />);

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

        expect(props.connectionsContext.addConnection.calls).toMatchObject([[{ port }]]);
      });
    });
  });

  test('allows storing password', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(<ConnectionFormStory {...props} />);

    await fillOutForm($);

    await expect($.getByRole('radio', { name: 'None / Keychain', checked: true })).toBeAttached();
    await expect($.getByRole('textbox', { name: 'Password' })).not.toBeAttached();

    await $.getByRole('radio', { name: 'Browser storage' }).click();
    await expect($.getByRole('textbox', { name: 'Password' })).toBeAttached();

    await $.getByRole('textbox', { name: 'Password' }).fill('password');

    await $.getByRole('button', { name: 'Add' }).click();

    expect(props.connectionsContext.addConnection.calls).toEqual([
      [
        {
          credentialStorage: 'localStorage',
          database: 'db',
          engine: 'postgres',
          host: 'localhost',
          id: '3',
          name: 'My connection',
          password: 'password',
          port: 1234,
          schema: 'public',
          ssh: null,
          type: 'remote',
          user: 'user',
        },
      ],
    ]);
  });

  test('allows updating connection', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(
      <ConnectionFormStory
        {...props}
        connectionFormProps={{
          ...props.connectionFormProps,
          connectionToEditId: '2',
        }}
      />,
    );

    await fillOutForm($);

    await $.getByRole('radio', { name: 'Connect via SSH' }).uncheck();

    await $.getByRole('button', { name: 'Save' }).click();

    expect(props.connectionsContext.updateConnection.calls).toEqual([
      [
        '2',
        {
          credentialStorage: 'localStorage',
          database: 'db',
          engine: 'postgres',
          host: 'localhost',
          id: '2',
          name: 'My connection',
          password: 'password',
          port: 1234,
          schema: 'public',
          ssh: null,
          type: 'remote',
          user: 'user',
        },
      ],
    ]);
  });

  test('allows deleting connection', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(
      <ConnectionFormStory
        {...props}
        connectionFormProps={{
          ...props.connectionFormProps,
          connectionToEditId: '2',
        }}
      />,
    );

    await $.getByRole('button', { name: 'Delete connection' }).click();
    await $.page().waitForTimeout(animationOptions.duration);
    await $.page().getByRole('menu').getByRole('menuitem', { name: 'Delete connection' }).click();

    expect(props.connectionsContext.removeConnection.calls).toEqual([['2']]);
    expect(props.connectionFormProps.exit.calls).toEqual([[]]);
  });
});
