import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Add } from '@mui/icons-material';
import { Changes } from './Changes/Changes';
import { TabsContext } from '../tabs/Context';

export const Toolbar: React.FC = () => {
  const { addTab } = useDefinedContext(TabsContext);

  return (
    <div className="flex items-center gap-2 py-2 ">
      <Button
        align="left"
        className="mb-1"
        icon={<Add />}
        onClick={() => addTab({ query: { showEditor: true } })}
      />
      <Changes />
    </div>
  );
};
