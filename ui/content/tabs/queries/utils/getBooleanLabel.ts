import { assert } from 'ts-essentials';

export const getBooleanLabel = (value: string) => {
  const label = (
    {
      f: 'FALSE',
      false: 'FALSE',
      n: 'FALSE',
      no: 'FALSE',
      t: 'TRUE',
      true: 'TRUE',
      y: 'TRUE',
      yes: 'TRUE',
    } as const
  )[value.toLowerCase()];

  assert(label, `Invalid boolean value ${value}`);

  return label;
};
