import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { QueriesContext } from '../queries/Context';
import { Add } from '@mui/icons-material';
import { Changes } from './Changes/Changes';

export const Toolbar: React.FC = () => {
  const { addQuery } = useDefinedContext(QueriesContext);

  return (
    <div className="flex items-center py-2 ">
      <Button
        align="left"
        className="mb-1"
        icon={<Add />}
        label="Query"
        onClick={() => addQuery({ showEditor: true })}
        variant="filled"
      />
      <Changes />
    </div>
  );
};
