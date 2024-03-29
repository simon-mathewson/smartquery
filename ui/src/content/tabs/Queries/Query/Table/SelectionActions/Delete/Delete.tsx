import { DeleteOutlined } from '@mui/icons-material';
import React from 'react';
import { EditContext } from '~/content/edit/Context';
import { getPrimaryKeys } from '~/content/tabs/Queries/utils';
import { Button } from '~/shared/components/Button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { QueryContext, ResultContext } from '../../../Context';

export type DeleteProps = {
  selection: number[][];
};

export const Delete: React.FC<DeleteProps> = (props) => {
  const { selection } = props;

  const { handleDeleteChange } = useDefinedContext(EditContext);

  const { query } = useDefinedContext(QueryContext);

  const { columns, rows } = useDefinedContext(ResultContext);

  return (
    <Button
      color="danger"
      icon={<DeleteOutlined />}
      onClick={() => {
        selection.forEach((_, rowIndex) => {
          handleDeleteChange({
            location: {
              primaryKeys: getPrimaryKeys(columns!, rows, rowIndex)!,
              table: query.table!,
              type: 'delete',
            },
            type: 'delete',
          });
        });
      }}
    />
  );
};
