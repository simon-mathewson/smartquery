import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { NavigationSidebar } from '../navigationSidebar/NavigationSidebar';
import { DatabaseContent } from './Content';
import { CopilotProvider } from '../copilot/Provider';
import { Loading } from '~/shared/components/loading/Loading';

export const Database: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  return (
    <div className="relative grid h-full grid-cols-[224px_1fr] bg-background">
      {!activeConnection && <Loading large />}
      <NavigationSidebar />
      <div className="flex h-full flex-col overflow-hidden pb-3 pl-1 pr-3">
        {activeConnection && (
          <CopilotProvider>
            <DatabaseContent />
          </CopilotProvider>
        )}
      </div>
    </div>
  );
};
