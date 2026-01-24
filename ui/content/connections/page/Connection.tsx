import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../Context';
import { NavigationSidebar } from '../../navigation/sidebar/NavigationSidebar';
import { Loading } from '~/shared/components/loading/Loading';
import { Helmet } from 'react-helmet';
import { demoConnectionId } from '../demo/constants';
import { Toolbar } from '~/content/toolbar/Toolbar';
import { Queries } from '~/content/tabs/queries/Queries';
import { CopilotSidebar } from '~/content/ai/copilot/sidebar/Sidebar';
import { MobileNavigation } from '~/content/navigation/mobile/MobileNavigation';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';

export const Connection: React.FC = () => {
  const isMobile = useIsMobile();

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
      <div className="relative flex h-[100dvh] flex-col justify-between">
        <div className="relative grid h-full grid-cols-1 overflow-hidden bg-card dark:bg-background sm:grid-cols-[max-content_1fr_max-content]">
          {!activeConnection && <Loading size="large" />}
          {!isMobile && <NavigationSidebar />}
          <div className="flex h-full flex-col overflow-hidden">
            {activeConnection && (
              <>
                <Toolbar />
                <Queries />
              </>
            )}
          </div>
          {activeConnection && <CopilotSidebar />}
        </div>
        <MobileNavigation />
      </div>
    </>
  );
};
