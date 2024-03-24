import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import type { Row } from '~/shared/types';
import { type Query } from '~/shared/types';
import { Add as AddIcon } from '@mui/icons-material';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '~/content/tabs/Context';
import { EditContext } from '~/content/edit/Context';
import type { CreateChange } from '~/content/edit/types';

export interface AddProps {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
  query: Query;
}

export const Add: React.FC<AddProps> = (props) => {
  const { handleRowCreationRef, query } = props;

  const { changes, handleChange } = useDefinedContext(EditContext);

  const { queryResults } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  const columns = queryResult?.columns;
  const table = query.table;

  if (!columns || !table) return null;

  const handleClick = () => {
    const existingCreateChanges = changes.filter(
      (change): change is CreateChange =>
        change.type === 'create' && change.location.table === table,
    );
    const newRowId = String(existingCreateChanges.length);
    const createChange = {
      location: {
        newRowId,
        table,
        type: 'create',
      },
      type: 'create',
      row: columns.reduce<Row>((row, column) => {
        row[column.name] = undefined;
        return row;
      }, {}),
    } satisfies CreateChange;

    handleChange(createChange);

    setTimeout(() => {
      handleRowCreationRef.current?.();
    });
  };

  return <Button color="primary" icon={<AddIcon />} onClick={handleClick} />;
};
