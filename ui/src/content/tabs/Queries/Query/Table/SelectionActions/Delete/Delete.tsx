import { DeleteOutlined } from '@mui/icons-material';
import React from 'react';
import { EditContext } from '~/content/edit/Context';
import { TabsContext } from '~/content/tabs/Context';
import { getPrimaryKeys } from '~/content/tabs/Queries/utils';
import { Button } from '~/shared/components/Button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import type { Query } from '~/shared/types';

export type DeleteProps = {
  query: Query;
  selection: number[][];
};

export const Delete: React.FC<DeleteProps> = (props) => {
  const { query, selection } = props;

  const { queryResults } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  const { handleChange } = useDefinedContext(EditContext);

  if (!queryResult) return null;

  return (
    <Button
      color="danger"
      icon={<DeleteOutlined />}
      onClick={() => {
        selection.forEach((_, rowIndex) => {
          handleChange({
            location: {
              primaryKeys: getPrimaryKeys(queryResult.columns!, queryResult.rows, rowIndex)!,
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
