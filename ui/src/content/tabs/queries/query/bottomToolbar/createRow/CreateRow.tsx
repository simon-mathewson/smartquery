import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { Add as AddIcon } from '@mui/icons-material';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { EditContext } from '~/content/edit/Context';
import type { CreateChangeInput, CreateRow } from '~/content/edit/types';
import { ResultContext } from '../../Context';

export interface AddProps {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
}

export const Add: React.FC<AddProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { handleCreateChange } = useDefinedContext(EditContext);

  const { columns, table } = useDefinedContext(ResultContext);

  if (!columns) return null;

  const handleClick = () => {
    const createChange = {
      location: {
        table: table!,
        type: 'create',
      },
      type: 'create',
      row: columns.reduce<CreateRow>((row, column) => {
        row[column.name] = undefined;
        return row;
      }, {}),
    } satisfies CreateChangeInput;

    handleCreateChange(createChange);

    setTimeout(() => {
      handleRowCreationRef.current?.();
    });
  };

  return <Button color="primary" htmlProps={{ onClick: handleClick }} icon={<AddIcon />} />;
};
