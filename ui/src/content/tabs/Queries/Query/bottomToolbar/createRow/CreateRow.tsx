import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import type { Row } from '~/shared/types';
import { Add as AddIcon } from '@mui/icons-material';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { EditContext } from '~/content/edit/Context';
import type { CreateChange } from '~/content/edit/types';
import { QueryContext, ResultContext } from '../../Context';

export interface AddProps {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
}

export const Add: React.FC<AddProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { changes, handleChange } = useDefinedContext(EditContext);

  const {
    query: { table },
  } = useDefinedContext(QueryContext);

  const { columns } = useDefinedContext(ResultContext);

  if (!table || !columns) return null;

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
