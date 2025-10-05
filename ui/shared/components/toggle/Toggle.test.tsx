import { Toggle } from './Toggle';
import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

test('renders', async ({ mount }) => {
  const $ = await mount(
    <TestApp>
      <Toggle label="Test Toggle" onChange={() => {}} value={false} />
    </TestApp>,
  );

  await expect($).toHaveAccessibleName('Test Toggle');

  await expect($).toHaveScreenshot('toggleFalse.png');

  await $.update(
    <TestApp>
      <Toggle label="Test Toggle" onChange={() => {}} value={true} />
    </TestApp>,
  );

  await expect($).toHaveScreenshot('toggleTrue.png');
});

test('renders with hint', async ({ mount }) => {
  const $ = await mount(
    <TestApp>
      <Toggle hint="This is a helpful hint" label="Test Toggle" onChange={() => {}} value={true} />
    </TestApp>,
  );

  await expect($).toHaveAccessibleName('Test Toggle');
  await expect($).toHaveAccessibleDescription('This is a helpful hint');

  await expect($).toHaveScreenshot('toggleWithHint.png');
});

test('allows toggling', async ({ mount }) => {
  const onChange = spy();
  const initialValue = false;

  const $ = await mount(
    <TestApp>
      <Toggle label="Test Toggle" onChange={onChange} value={initialValue} />
    </TestApp>,
  );

  await expect($).toHaveRole('checkbox');
  await expect($).toHaveAttribute('aria-checked', 'false');

  await $.click();
  expect(onChange.callCount).toBe(1);
  expect(onChange.calls[0][0]).toBe(true);

  await $.update(
    <TestApp>
      <Toggle label="Test Toggle" onChange={onChange} value={true} />
    </TestApp>,
  );

  await expect($).toHaveAttribute('aria-checked', 'true');

  await $.click();
  expect(onChange.callCount).toBe(2);
  expect(onChange.calls[1][0]).toBe(false);
});

test('is keyboard accessible', async ({ mount }) => {
  const onChange = spy();

  const $ = await mount(
    <TestApp>
      <Toggle label="Test Toggle" onChange={onChange} value={false} />
    </TestApp>,
  );

  // Focus the toggle
  await $.focus();
  await expect($).toBeFocused();

  // Test Enter key activation
  await $.press('Enter');
  expect(onChange.callCount).toBe(1);
  expect(onChange.calls[0][0]).toBe(true);

  // Test Space key activation
  await $.press(' ');
  expect(onChange.callCount).toBe(2);
  expect(onChange.calls[1][0]).toBe(true);
});
