import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { NavigationSidebar } from '../NavigationSidebar/NavigationSidebar';
import { Toolbar } from '../Toolbar/Toolbar';
import { Queries } from '../tabs/Queries/Queries';
import { ConnectionsContext } from '../connections/Context';

export const Database: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  return (
    <div className="grid h-full grid-cols-[224px_1fr] bg-background">
      <NavigationSidebar />
      <div className="flex h-full flex-col overflow-hidden pl-1 pr-3">
        {activeConnection && <Toolbar />}
        <Queries />
      </div>
    </div>
  );
};
