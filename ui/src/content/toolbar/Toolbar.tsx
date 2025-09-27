import { Add, AutoAwesomeOutlined, Menu } from '@mui/icons-material';
import classNames from 'classnames';
import React from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { CopilotSidebarContext } from '../ai/copilot/sidebar/Context';
import { EditContext } from '../edit/Context';
import { NavigationSidebarContext } from '../navigationSidebar/Context';
import { TabsContext } from '../tabs/Context';
import { QueriesContext } from '../tabs/queries/Context';
import { Changes } from './changes/Changes';
import { Tabs } from './tabs/Tabs';

export const Toolbar: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
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
              track('toolbar_open_copilot');
              copilotSidebar.setIsOpen(!copilotSidebar.isOpen);
            },
          }}
          icon={<AutoAwesomeOutlined />}
          label={isMobile ? undefined : 'Copilot'}
          variant={copilotSidebar.isOpen ? 'highlighted' : 'default'}
        />
      )}
    </div>
  );
};
