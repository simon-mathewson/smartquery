import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import type { Query } from '~/shared/types';
import { Add as AddIcon } from '@mui/icons-material';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '~/content/tabs/Context';

export interface AddProps {
  query: Query;
}

export const Add: React.FC<AddProps> = (props) => {
  const { query } = props;

  const { queryResults } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  if (!queryResult?.columns) return null;

  return <Button color="primary" icon={<AddIcon />} onClick={() => {}} />;
};
