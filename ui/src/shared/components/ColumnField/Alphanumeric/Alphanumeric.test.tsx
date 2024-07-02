import { expect, test } from '@playwright/experimental-ct-react';
import type { AlphanumericProps } from './Alphanumeric';
import { Alphanumeric } from './Alphanumeric';
import { spy } from 'tinyspy';

test.describe('ColumnField Alphanumeric', () => {
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

      const $ = await mount(<Alphanumeric {...props} />);

      expect($).toHaveRole(scenario.dataType === 'int' ? 'spinbutton' : 'textbox');

      const tagName = await $.evaluate((node) => node.tagName);
      if (dataType === 'varchar') {
        expect(tagName).toBe('TEXTAREA');
      } else {
        expect(tagName).toBe('INPUT');

        if (dataType === 'datetime') {
          await expect($).toHaveAttribute('type', 'datetime-local');
        } else if (dataType === 'time') {
          await expect($).toHaveAttribute('type', 'time');
        } else {
          await expect($).toHaveAttribute('type', 'number');
        }
      }

      await expect($).toHaveValue(stringValue);

      await $.clear();
      expect(onChange.calls.at(-1)?.[0]).toBe('');
    });
  });
});
