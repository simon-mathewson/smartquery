import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Add } from '@mui/icons-material';
import { Changes } from './Changes/Changes';
import { TabsContext } from '../tabs/Context';
import { Tabs } from './Tabs/Tabs';
import { QueriesContext } from '../tabs/Queries/Context';

export const Toolbar: React.FC = () => {
  const { tabs } = useDefinedContext(TabsContext);
  const { addQuery } = useDefinedContext(QueriesContext);

  return (
    <div className="mb-2 mt-1 flex items-center gap-2 py-2">
      <Tabs />
      <Button
        align="left"
        icon={<Add />}
        label={tabs.length ? undefined : 'New query'}
        onClick={() => addQuery({ showEditor: true })}
      />
      <Changes />
    </div>
  );
};
