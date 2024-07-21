import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Add } from '@mui/icons-material';
import { Changes } from './changes/Changes';
import { TabsContext } from '../tabs/Context';
import { Tabs } from './tabs/Tabs';
import { QueriesContext } from '../tabs/queries/Context';

export const Toolbar: React.FC = () => {
  const { tabs } = useDefinedContext(TabsContext);
  const { addQuery } = useDefinedContext(QueriesContext);

  return (
    <div className="mb-1 mt-1 flex items-center gap-2 py-2">
      <Tabs />
      <Button
        align="left"
        htmlProps={{ onClick: () => addQuery({ showEditor: true }) }}
        icon={<Add />}
        label={tabs.length ? undefined : 'New query'}
      />
      <Changes />
    </div>
  );
};
