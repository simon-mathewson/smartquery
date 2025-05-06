import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { Add, AutoAwesome } from '@mui/icons-material';
import { Changes } from './changes/Changes';
import { TabsContext } from '../tabs/Context';
import { Tabs } from './tabs/Tabs';
import { QueriesContext } from '../tabs/queries/Context';
import { CopilotContext } from '../copilot/Context';
import { ToastContext } from '../toast/Context';
import { EditContext } from '../edit/Context';
import classNames from 'classnames';

export const Toolbar: React.FC = () => {
  const toast = useDefinedContext(ToastContext);

  const { tabs } = useDefinedContext(TabsContext);
  const { addQuery } = useDefinedContext(QueriesContext);
  const copilot = useDefinedContext(CopilotContext);
  const { allChanges } = useDefinedContext(EditContext);

  return (
    <div className="mb-1 mt-1 flex items-center gap-3 py-2">
      <Tabs />
      <Button
        align="left"
        htmlProps={{ onClick: () => addQuery({ initialInputMode: 'editor' }) }}
        icon={<Add />}
        label={tabs.length ? undefined : 'New query'}
      />
      {allChanges.length && <Changes />}
      <Button
        color="primary"
        htmlProps={{
          className: classNames({ 'ml-auto': !allChanges.length }),
          onClick: () => {
            if (!copilot.isEnabled) {
              toast.add({
                title: 'To use copilot, add your Google AI API key in Settings',
                color: 'primary',
              });
              return;
            }

            copilot.setIsOpen(!copilot.isOpen);
          },
        }}
        icon={<AutoAwesome />}
        label="Copilot"
        variant={copilot.isOpen ? 'highlighted' : 'default'}
      />
    </div>
  );
};
