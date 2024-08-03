import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { NavigationSidebar } from '../navigationSidebar/NavigationSidebar';
import { Toolbar } from '../toolbar/Toolbar';
import { Queries } from '../tabs/queries/Queries';
import { ConnectionsContext } from '../connections/Context';

export const Database: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  return (
    <div className="grid h-full grid-cols-[224px_1fr] bg-background">
      <NavigationSidebar />
      <div className="flex h-full flex-col overflow-hidden pl-1 pr-3">
        {activeConnection && (
          <>
            <Toolbar />
            <Queries />
          </>
        )}
      </div>
    </div>
  );
};
