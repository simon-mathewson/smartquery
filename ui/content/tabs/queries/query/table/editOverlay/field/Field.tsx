import React, { useMemo } from 'react';
import { EditContext } from '~/content/edit/Context';
import type { CreateChange, CreateLocation, UpdateLocation } from '~/content/edit/types';
import { ColumnField } from '~/shared/components/columnField/ColumnField';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { type Column } from '~/shared/types';
import type { DbValue } from '@/connector/types';

export type EditOverlayFieldProps = {
  autoFocus?: boolean;
  column: Column;
  locations: Array<CreateLocation | UpdateLocation>;
};

export const EditOverlayField: React.FC<EditOverlayFieldProps> = (props) => {
  const { autoFocus, column, locations } = props;

  const { getChangeAtLocation, handleCreateChange, handleUpdateChange } =
    useDefinedContext(EditContext);

  const values = useMemo(
    () =>
      locations.map((location) => {
        const change = getChangeAtLocation(location);
        if (!change || change.type === 'delete') {
          return location.type === 'update' ? location.originalValue : undefined;
        }
        return change.type === 'update' ? change.value : change.row[column.originalName];
      }),
    [column.originalName, getChangeAtLocation, locations],
  );

  const multipleValues = useMemo(() => !values.every((value) => value === values[0]), [values]);

  const value = values[0];
  const commonValue = multipleValues ? undefined : value;

  const handleChange = (newValue: DbValue) => {
    locations.forEach((location) => {
      if (location.type === 'create') {
        const createChange = getChangeAtLocation(location) as CreateChange;
        handleCreateChange({
          location,
          type: 'create',
          row: {
            ...createChange.row,
            [column.originalName]: newValue,
          },
        });
      } else {
        handleUpdateChange({ location, type: 'update', value: newValue });
      }
    });
  };

  return (
    <ColumnField
      autoFocus={autoFocus}
      column={column}
      onChange={handleChange}
      placeholder={multipleValues ? 'Multiple values' : undefined}
      value={commonValue === undefined ? '' : commonValue}
    />
  );
};
