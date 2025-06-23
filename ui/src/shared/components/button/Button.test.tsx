import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';

import { Button } from './Button';
import { Add, Edit } from '@mui/icons-material';
import { TestApp } from '~/test/componentTests/TestApp';

test('renders button with label', async ({ mount }) => {
  const label = 'Click me';
  const onClick = spy();

  const $ = await mount(
    <TestApp>
      <Button htmlProps={{ onClick }} label={label} />
    </TestApp>,
  );

  await expect($).toHaveRole('button');
  await expect($).toHaveAccessibleName(label);
  await expect($).toHaveText(label);
  await expect($).toHaveCSS('cursor', 'pointer');
  await expect($).toHaveCSS('height', '36px');

  await $.click();

  expect(onClick.callCount).toBe(1);
});

test('renders button with icon', async ({ mount }) => {
  const icon = <Add />;
  const onClick = spy();

  const $ = await mount(
    <TestApp>
      <Button htmlProps={{ onClick }} icon={icon} />
    </TestApp>,
  );

  await expect($).toHaveText('');
  await expect($).toHaveCSS('height', '36px');
  await expect($.getByTestId('AddIcon')).toBeAttached();

  await $.click();

  expect(onClick.callCount).toBe(1);
});

test('renders small disabled link with icon, long label, and suffix', async ({ mount }) => {
  const icon = <Add />;
  const label = 'Click this button even though it is disabled';
  const textSuffix = 'Suffix';
  const onClick = spy();

  const $ = await mount(
    <TestApp>
      <Button
        htmlProps={{
          className: 'w-100',
          disabled: true,
          href: '#',
          onClick,
        }}
        element="a"
        icon={icon}
        label={label}
        suffix={<Edit />}
        textSuffix={textSuffix}
      />
    </TestApp>,
  );

  await expect($).toHaveRole('link');
  await expect($).toHaveAccessibleName(label);

  await expect($).toHaveText(label + textSuffix);
  await expect($).toHaveAttribute('href', '#');
  await expect($).toHaveAttribute('aria-disabled', 'true');
  await expect($.getByTestId('AddIcon')).toBeAttached();
});
