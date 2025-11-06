import { ArrowBackIosNewOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import { useMemo } from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Header } from '~/shared/components/header/Header';
import { List } from '~/shared/components/list/List';
import { Loading } from '~/shared/components/loading/Loading';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { ActiveConnectionContext } from '../activeConnection/Context';

export type DatabaseListProps = {
  stage: 'databases' | 'schemas' | 'connections';
  setStage: (stage: 'databases' | 'schemas' | 'connections') => void;
};

export const DatabaseList: React.FC<DatabaseListProps> = (props) => {
  const { stage, setStage } = props;

  const isMobile = useIsMobile();

  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection, databases, isLoadingDatabases } =
    useDefinedContext(ActiveConnectionContext);

  const schemas = useMemo(() => {
    if (activeConnection.engine !== 'postgres') return [];

    return databases.find((database) => database.name === activeConnection.database)?.schemas ?? [];
  }, [activeConnection, databases]);

  if (!activeConnection) {
    return null;
  }

  return (
    <div
      className={classNames('grid gap-2', {
        'sm:grid-cols-[max-content_192px_max-content_192px]':
          activeConnection.engine === 'postgres',
        'sm:grid-cols-[max-content_192px]': activeConnection.engine !== 'postgres',
      })}
    >
      {!isMobile && <div className="h-full w-px bg-border" />}
      {(!isMobile || stage === 'databases') && (
        <div className="relative space-y-2">
          <Header
            evenColumns={isMobile}
            left={
              isMobile ? (
                <Button
                  icon={<ArrowBackIosNewOutlined />}
                  label="Connections"
                  htmlProps={{ onClick: () => setStage('connections') }}
                />
              ) : (
                'Databases'
              )
            }
            middle={isMobile ? 'Databases' : undefined}
          />
          {isLoadingDatabases && <Loading />}
          <List
            items={databases.map((database) => ({
              htmlProps: {
                href: routes.connection({
                  connectionId: activeConnection.id,
                  database: database.name,
                  schema: '',
                }),
              },
              label: database.name,
              selectedVariant: 'primary',
              value: database.name,
            }))}
            onSelect={() => {
              track('database_list_select');
              if (isMobile && activeConnection.engine === 'postgres') {
                setStage('schemas');
              }
            }}
            selectedValue={activeConnection.database}
          />
        </div>
      )}
      {activeConnection.engine === 'postgres' && (!isMobile || stage === 'schemas') && (
        <>
          {!isMobile && <div className="h-full w-px bg-border" />}
          <div className="relative space-y-2">
            <Header
              evenColumns={isMobile}
              left={
                isMobile ? (
                  <Button
                    icon={<ArrowBackIosNewOutlined />}
                    label="Databases"
                    htmlProps={{ onClick: () => setStage('databases') }}
                  />
                ) : (
                  'Schemas'
                )
              }
              middle={isMobile ? 'Schemas' : undefined}
            />
            {isLoadingDatabases && <Loading />}
            <List
              items={schemas.map((schema) => ({
                htmlProps: {
                  href: routes.connection({
                    connectionId: activeConnection.id,
                    database: activeConnection.database,
                    schema,
                  }),
                },
                label: schema,
                selectedVariant: 'primary',
                value: schema,
              }))}
              onSelect={() => {
                track('database_list_select_schema');
              }}
              selectedValue={activeConnection.schema}
            />
          </div>
        </>
      )}
    </div>
  );
};
