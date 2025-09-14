import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../Context';
import { NavigationSidebar } from '../../navigationSidebar/NavigationSidebar';
import { CopilotProvider } from '../../ai/copilot/Provider';
import { Loading } from '~/shared/components/loading/Loading';
import { Helmet } from 'react-helmet';
import { demoConnectionId } from '../demo/constants';
import { NavigationSidebarProvider } from '~/content/navigationSidebar/Provider';
import { Toolbar } from '~/content/toolbar/Toolbar';
import { Queries } from '~/content/tabs/queries/Queries';
import { CopilotSidebar } from '~/content/ai/copilot/sidebar/Sidebar';
import { CopilotSidebarProvider } from '~/content/ai/copilot/sidebar/Provider';

export const Connection: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const title = `${
    activeConnection?.engine === 'postgres' && activeConnection?.schema
      ? `${activeConnection.schema} – `
      : ''
  }${activeConnection?.database} – ${activeConnection?.name}`;

  const demoDescription = 'Check out this demo database to see how SmartQuery works.';

  return (
    <>
      {activeConnection && (
        <Helmet>
          <title>{title}</title>
        </Helmet>
      )}
      {activeConnection?.id === demoConnectionId && (
        <Helmet>
          <meta name="description" content={demoDescription} />
        </Helmet>
      )}
      <div className="relative grid h-full grid-cols-1 overflow-hidden bg-background sm:grid-cols-[max-content_1fr_max-content]">
        {!activeConnection && <Loading size="large" />}
        <NavigationSidebarProvider>
          <CopilotSidebarProvider>
            <NavigationSidebar />
            <div className="flex h-full flex-col overflow-hidden pb-3 pl-3 pr-3 sm:pl-1">
              {activeConnection && (
                <>
                  <Toolbar />
                  <Queries />
                </>
              )}
            </div>
            {activeConnection && (
              <CopilotProvider>
                <CopilotSidebar />
              </CopilotProvider>
            )}
          </CopilotSidebarProvider>
        </NavigationSidebarProvider>
      </div>
    </>
  );
};
