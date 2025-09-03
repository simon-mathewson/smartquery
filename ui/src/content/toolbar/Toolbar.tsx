import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { Add, AutoAwesome } from '@mui/icons-material';
import { Changes } from './changes/Changes';
import { TabsContext } from '../tabs/Context';
import { Tabs } from './tabs/Tabs';
import { QueriesContext } from '../tabs/queries/Context';
import { CopilotContext } from '../ai/copilot/Context';
import { EditContext } from '../edit/Context';
import classNames from 'classnames';
import { AnalyticsContext } from '~/content/analytics/Context';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';

export const Toolbar: React.FC = () => {
  const [, navigate] = useLocation();
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
            void addQuery({ initialInputMode: 'editor' });
            track('toolbar_new_query');
          },
        }}
        icon={<Add />}
        label={tabs.length ? undefined : 'New query'}
        tooltip={tabs.length ? 'New query' : undefined}
      />
      {allChanges.length > 0 && <Changes />}
      <Button
        color="primary"
        htmlProps={{
          className: classNames({ 'ml-auto': !allChanges.length }),
          onClick: () => {
            if (!copilot.isEnabled) {
              navigate(routes.subscribe());
              return;
            }

            track('toolbar_open_copilot');

            copilot.setIsOpen(!copilot.isOpen);
          },
        }}
        icon={<AutoAwesome />}
        label="Copilot"
        tooltip={copilot.isEnabled ? undefined : 'Sign up or log in to use Copilot'}
        variant={copilot.isOpen ? 'highlighted' : 'default'}
      />
    </div>
  );
};
