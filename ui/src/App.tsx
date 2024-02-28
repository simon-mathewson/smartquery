import React from 'react';
import { NavigationSidebar } from './content/NavigationSidebar/NavigationSidebar';
import { ConnectionsContext } from './content/connections/Context';
import './index.css';
import { useDefinedContext } from './shared/hooks/useDefinedContext';
import { Toolbar } from './content/Toolbar/Toolbar';
import { useTheme } from './content/theme/useTheme';
import { Queries } from './content/tabs/Queries/Queries';

export const App: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  useTheme();

  return (
    <div className="grid h-full grid-cols-[224px_1fr] bg-background">
      <NavigationSidebar />
      <div className="flex h-full flex-col overflow-hidden pr-2">
        {activeConnection && <Toolbar />}
        <Queries />
      </div>
    </div>
  );
};
