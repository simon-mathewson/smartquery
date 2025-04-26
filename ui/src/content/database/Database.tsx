import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { NavigationSidebar } from '../navigationSidebar/NavigationSidebar';
import { Toolbar } from '../toolbar/Toolbar';
import { Queries } from '../tabs/queries/Queries';
import { ConnectionsContext } from '../connections/Context';
import { CopilotSidebar } from '../copilot/sidebar/Sidebar';
import { CopilotContext } from '../copilot/Context';

export const Database: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const copilot = useDefinedContext(CopilotContext);

  return (
    <div className="grid h-full grid-cols-[224px_1fr] bg-background">
      <NavigationSidebar />
      <div className="flex h-full flex-col overflow-hidden pb-3 pl-1 pr-3">
        {activeConnection && (
          <>
            <Toolbar />
            <div className="flex h-full gap-4 overflow-hidden">
              <Queries />
              {copilot.isOpen && <CopilotSidebar />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
