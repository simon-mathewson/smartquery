import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import type { ConnectionFormStoryProps } from './ConnectionForm.story';
import { ConnectionFormStory } from './ConnectionForm.story';
import { animationOptions } from '~/shared/components/overlayCard/constants';

const getProps = () =>
  ({
    connectionsContext: {
      addConnection: spy(),
      connections: [],
      removeConnection: spy(),
      updateConnection: spy(),
    },
    connectionFormProps: { exit: spy() },
  }) satisfies ConnectionFormStoryProps;

const fillOutForm = async ($: MountResult) => {
  await $.getByRole('button', { name: 'Engine' }).click();
  await $.page().locator('#overlay').getByRole('option', { name: 'PostgreSQL' }).click();
  await $.page().waitForTimeout(animationOptions.duration);

  await $.getByRole('textbox', { name: 'Name' }).fill('My connection');
  await $.getByRole('textbox', { name: 'Host' }).fill('localhost');
  await $.getByRole('textbox', { name: 'Port' }).fill('1234');
  await $.getByRole('textbox', { name: 'User' }).fill('user');
  await $.getByRole('textbox', { name: 'Default database' }).fill('db');
};

test.use({ viewport: { width: 400, height: 800 } });

test.describe('ConnectionForm', () => {
  test('renders', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(<ConnectionFormStory {...props} />);

    await expect($).toHaveScreenshot('render.png');
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
          engine: 'postgresql',
          host: 'localhost',
          id: '',
          name: 'My connection',
          password: null,
          port: 1234,
          ssh: null,
          user: 'user',
        },
      ],
    ]);
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

        await $.getByRole('button', { name: 'Engine' }).click();
        await $.page().locator('#overlay').getByRole('option', { name }).click();
        await $.page().waitForTimeout(animationOptions.duration);

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
          engine: 'postgresql',
          host: 'localhost',
          id: '',
          name: 'My connection',
          password: 'password',
          port: 1234,
          ssh: null,
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
          connectionToEditId: '1',
        }}
        connectionsContext={{
          ...props.connectionsContext,
          connections: [
            {
              credentialStorage: 'alwaysAsk',
              database: 'other_db',
              engine: 'mysql',
              host: 'other_host',
              id: '1',
              name: 'Other connection',
              password: null,
              port: 5248,
              ssh: null,
              user: 'other_user',
            },
          ],
        }}
      />,
    );

    await expect($.getByRole('button', { name: 'Engine' })).toHaveAttribute('data-value', 'mysql');
    await expect($.getByRole('textbox', { name: 'Name' })).toHaveValue('Other connection');
    await expect($.getByRole('textbox', { name: 'Host' })).toHaveValue('other_host');
    await expect($.getByRole('textbox', { name: 'Port' })).toHaveValue('5248');
    await expect($.getByRole('textbox', { name: 'User' })).toHaveValue('other_user');
    await expect($.getByRole('textbox', { name: 'Default database' })).toHaveValue('other_db');

    await fillOutForm($);

    await $.getByRole('button', { name: 'Save' }).click();

    expect(props.connectionsContext.updateConnection.calls).toEqual([
      [
        '1',
        {
          credentialStorage: 'alwaysAsk',
          database: 'db',
          engine: 'postgresql',
          host: 'localhost',
          id: '1',
          name: 'My connection',
          password: null,
          port: 1234,
          ssh: null,
          user: 'user',
        },
      ],
    ]);
  });
});
