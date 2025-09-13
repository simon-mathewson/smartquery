import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { Add, AutoAwesome, Menu } from '@mui/icons-material';
import { Changes } from './changes/Changes';
import { TabsContext } from '../tabs/Context';
import { Tabs } from './tabs/Tabs';
import { QueriesContext } from '../tabs/queries/Context';
import { EditContext } from '../edit/Context';
import classNames from 'classnames';
import { AnalyticsContext } from '~/content/analytics/Context';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';
import { NavigationSidebarContext } from '../navigationSidebar/Context';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { CopilotSidebarContext } from '../ai/copilot/sidebar/Context';
import { AuthContext } from '../auth/Context';

export const Toolbar: React.FC = () => {
  const [, navigate] = useLocation();
  const { track } = useDefinedContext(AnalyticsContext);
  const { user } = useDefinedContext(AuthContext);
  const { tabs } = useDefinedContext(TabsContext);
  const { addQuery } = useDefinedContext(QueriesContext);
  const { allChanges } = useDefinedContext(EditContext);
  const navigationSidebar = useDefinedContext(NavigationSidebarContext);
  const copilotSidebar = useDefinedContext(CopilotSidebarContext);

  const isMobile = useIsMobile();

  return (
    <div className="mb-1 mt-1 flex items-center gap-3 py-2">
      {isMobile && (
        <Button
          color="secondary"
          htmlProps={{
            onClick: () => navigationSidebar.setIsOpen(true),
          }}
          icon={<Menu />}
        />
      )}
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
      {(!copilotSidebar.isOpen || isMobile) && (
        <Button
          color="primary"
          htmlProps={{
            className: classNames({ 'ml-auto': !allChanges.length }),
            onClick: () => {
              if (!user) {
                navigate(routes.subscribePlans());
                return;
              }

              track('toolbar_open_copilot');

              copilotSidebar.setIsOpen(!copilotSidebar.isOpen);
            },
          }}
          icon={<AutoAwesome />}
          label={isMobile ? undefined : 'Copilot'}
          tooltip={user ? undefined : 'Sign up or log in to use Copilot'}
          variant={copilotSidebar.isOpen ? 'highlighted' : 'default'}
        />
      )}
    </div>
  );
};
