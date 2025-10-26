import type { DbValue } from '@/connector/types';
import type { Engine } from '@/connections/types';
import { escapeValue } from '~/shared/utils/sql/sql';
import type { CreateValue, Location, UniqueValue } from './types';

export const doChangeLocationsMatch = (
  change1: Omit<Location, 'originalValue' | 'type'>,
  change2: Omit<Location, 'originalValue' | 'type'>,
) =>
  change1.table === change2.table &&
  ((!('index' in change1) && !('index' in change2)) ||
    ('index' in change1 && 'index' in change2 && change1.index === change2.index)) &&
  (!('uniqueValues' in change1) ||
    !('uniqueValues' in change2) ||
    (change1.uniqueValues as UniqueValue[]).every(
      (key, index) =>
        (change2.uniqueValues as UniqueValue[])[index].column === key.column &&
        (change2.uniqueValues as UniqueValue[])[index].value === key.value,
    )) &&
  (!('column' in change1) || !('column' in change2) || change1.column === change2.column);

export const getValueString = (value: DbValue | CreateValue, engine: Engine) => {
  if (value === null) {
    return 'NULL';
  }
  if (value === undefined) {
    return 'DEFAULT';
  }
  const escapedValue = escapeValue(engine, value);
  return `'${escapedValue}'`;
};
