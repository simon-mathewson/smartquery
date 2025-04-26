import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { Add, AutoAwesome } from '@mui/icons-material';
import { Changes } from './changes/Changes';
import { TabsContext } from '../tabs/Context';
import { Tabs } from './tabs/Tabs';
import { QueriesContext } from '../tabs/queries/Context';
import { CopilotContext } from '../copilot/Context';

export const Toolbar: React.FC = () => {
  const { tabs } = useDefinedContext(TabsContext);
  const { addQuery } = useDefinedContext(QueriesContext);
  const copilot = useDefinedContext(CopilotContext);

  return (
    <div className="mb-1 mt-1 flex items-center gap-3 py-2">
      <Tabs />
      <Button
        align="left"
        htmlProps={{ onClick: () => addQuery({ initialInputMode: 'editor' }) }}
        icon={<Add />}
        label={tabs.length ? undefined : 'New query'}
      />
      <Changes />
      <Button
        color="primary"
        htmlProps={{
          className: 'ml-auto',
          onClick: () => copilot.setIsOpen(!copilot.isOpen),
        }}
        icon={<AutoAwesome />}
        label="Copilot"
        variant={copilot.isOpen ? 'highlighted' : 'default'}
      />
    </div>
  );
};
