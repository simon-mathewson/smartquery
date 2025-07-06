import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { Add, AutoAwesome } from '@mui/icons-material';
import { Changes } from './changes/Changes';
import { TabsContext } from '../tabs/Context';
import { Tabs } from './tabs/Tabs';
import { QueriesContext } from '../tabs/queries/Context';
import { CopilotContext } from '../copilot/Context';
import { EditContext } from '../edit/Context';
import classNames from 'classnames';
import { AnalyticsContext } from '~/content/analytics/Context';

export const Toolbar: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);

  const { tabs } = useDefinedContext(TabsContext);
  const { addQuery } = useDefinedContext(QueriesContext);
  const copilot = useDefinedContext(CopilotContext);
  const { allChanges } = useDefinedContext(EditContext);

  return (
    <div className="mb-1 mt-1 flex items-center gap-3 py-2">
      <Tabs />
      <Button
        align="left"
        htmlProps={{
          onClick: () => {
            addQuery({ initialInputMode: 'editor' });
            track('toolbar_new_query');
          },
        }}
        icon={<Add />}
        label={tabs.length ? undefined : 'New query'}
        tooltip="New query"
      />
      {allChanges.length > 0 && <Changes />}
      <Button
        color="primary"
        htmlProps={{
          className: classNames({ 'ml-auto': !allChanges.length }),
          disabled: !copilot.isEnabled,
          onClick: () => {
            track('toolbar_open_copilot');

            copilot.setIsOpen(!copilot.isOpen);
          },
        }}
        icon={<AutoAwesome />}
        label="Copilot"
        tooltip={
          copilot.isEnabled ? undefined : 'To use copilot, add your Google AI API key in Settings'
        }
        variant={copilot.isOpen ? 'highlighted' : 'default'}
      />
    </div>
  );
};
