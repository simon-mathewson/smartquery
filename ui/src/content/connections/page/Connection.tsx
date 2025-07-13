import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../Context';
import { NavigationSidebar } from '../../navigationSidebar/NavigationSidebar';
import { DatabaseContent } from './Content';
import { CopilotProvider } from '../../copilot/Provider';
import { Loading } from '~/shared/components/loading/Loading';
import { Helmet } from 'react-helmet';
import { sqliteDemoConnectionId } from '../constants';

export const Connection: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const title = `${
    activeConnection?.engine === 'postgres' && activeConnection?.schema
      ? `${activeConnection.schema} – `
      : ''
  }${activeConnection?.database} – ${activeConnection?.name}`;

  const demoDescription = 'Check out this demo database to see how Dabase works.';

  return (
    <>
      {activeConnection && (
        <Helmet>
          <title>{title}</title>
        </Helmet>
      )}
      {activeConnection?.id === sqliteDemoConnectionId && (
        <Helmet>
          <meta name="description" content={demoDescription} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={demoDescription} />
        </Helmet>
      )}
      <div className="relative grid h-full grid-cols-[224px_1fr] bg-background">
        {!activeConnection && <Loading size="large" />}
        <NavigationSidebar />
        <div className="flex h-full flex-col overflow-hidden pb-3 pl-1 pr-3">
          {activeConnection && (
            <CopilotProvider>
              <DatabaseContent />
            </CopilotProvider>
          )}
        </div>
      </div>
    </>
  );
};
