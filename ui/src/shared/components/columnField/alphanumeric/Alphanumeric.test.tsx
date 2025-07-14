import { expect, test } from '@playwright/experimental-ct-react';
import type { AlphanumericProps } from './Alphanumeric';
import { Alphanumeric } from './Alphanumeric';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

const scenarios = [
  { dataType: 'datetime', stringValue: '2024-06-14T17:30' },
  { dataType: 'int', stringValue: '123' },
  { dataType: 'time', stringValue: '10:13' },
  { dataType: 'varchar', stringValue: 'Initial value\nwith newline' },
] satisfies Partial<AlphanumericProps>[];

scenarios.forEach((scenario) => {
  const { dataType, stringValue } = scenario;

  test(scenario.dataType, async ({ mount }) => {
    const onChange = spy();

    const props = { ...scenario, onChange };

    const $ = await mount(
      <TestApp>
        <Alphanumeric {...props} />
      </TestApp>,
    );

    await expect($).toHaveScreenshot(`alphanumeric-${scenario.dataType}.png`);

    const role = scenario.dataType === 'int' ? 'spinbutton' : 'textbox';

    const element = $.getByRole(role);
    expect(element).toBeAttached();

    const tag = await element.evaluate((node) => node.tagName);

    if (dataType === 'varchar') {
      expect(tag).toBe('TEXTAREA');
    } else {
      expect(tag).toBe('INPUT');

      if (dataType === 'datetime') {
        await expect(element).toHaveAttribute('type', 'datetime-local');
      } else if (dataType === 'time') {
        await expect(element).toHaveAttribute('type', 'time');
      } else {
        await expect(element).toHaveAttribute('type', 'number');
      }
    }

    await expect(element).toHaveValue(stringValue);

    await element.clear();
    expect(onChange.calls.at(-1)?.[0]).toBe('');
  });
});
