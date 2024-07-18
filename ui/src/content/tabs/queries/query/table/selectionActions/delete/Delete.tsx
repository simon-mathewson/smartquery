import { DeleteOutlined } from '@mui/icons-material';
import React from 'react';
import { EditContext } from '~/content/edit/Context';
import { getPrimaryKeys } from '~/content/tabs/queries/utils';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ResultContext } from '../../../Context';

export type DeleteProps = {
  selection: number[][];
};

export const Delete: React.FC<DeleteProps> = (props) => {
  const { selection } = props;

  const { handleDeleteChange } = useDefinedContext(EditContext);

  const { columns, rows, table } = useDefinedContext(ResultContext);

  return (
    <Button
      color="danger"
      htmlProps={{
        onClick: () => {
          selection.forEach((_, rowIndex) => {
            handleDeleteChange({
              location: {
                primaryKeys: getPrimaryKeys(columns!, rows, rowIndex)!,
                table: table!,
                type: 'delete',
              },
              type: 'delete',
            });
          });
        },
      }}
      icon={<DeleteOutlined />}
    />
  );
};
