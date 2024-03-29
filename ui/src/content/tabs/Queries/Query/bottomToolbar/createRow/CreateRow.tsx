import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import type { Row } from '~/shared/types';
import { Add as AddIcon } from '@mui/icons-material';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { EditContext } from '~/content/edit/Context';
import type { CreateChangeInput } from '~/content/edit/types';
import { QueryContext, ResultContext } from '../../Context';

export interface AddProps {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
}

export const Add: React.FC<AddProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { handleCreateChange } = useDefinedContext(EditContext);

  const {
    query: { table },
  } = useDefinedContext(QueryContext);

  const { columns } = useDefinedContext(ResultContext);

  if (!table || !columns) return null;

  const handleClick = () => {
    const createChange = {
      location: {
        table,
        type: 'create',
      },
      type: 'create',
      row: columns.reduce<Row>((row, column) => {
        row[column.name] = undefined;
        return row;
      }, {}),
    } satisfies CreateChangeInput;

    handleCreateChange(createChange);

    setTimeout(() => {
      handleRowCreationRef.current?.();
    });
  };

  return <Button color="primary" icon={<AddIcon />} onClick={handleClick} />;
};
